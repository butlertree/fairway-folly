begin;

alter table ff_private.matches add column if not exists shot_play boolean not null default false;
alter table ff_private.matches add column if not exists last_shot jsonb;
alter table ff_private.matches add column if not exists shot_queue jsonb not null default '[]'::jsonb;
alter table ff_private.turns add column if not exists away double precision;

create table if not exists ff_private.members (
  match_id uuid not null references ff_private.matches(id) on delete cascade,
  player uuid not null,
  name text not null check(length(name) between 1 and 24),
  seat int not null check(seat between 1 and 4),
  primary key(match_id,player),
  unique(match_id,seat)
);
alter table ff_private.members enable row level security;
revoke all on ff_private.members from public,anon,authenticated;

create or replace function ff_private.group_state(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare m ff_private.matches;
begin
 select * into m from ff_private.matches where id=p_id and shot_play;
 if m.id is null or auth.uid() is null or not exists(
   select 1 from ff_private.members where match_id=p_id and player=auth.uid()
 ) then raise exception 'This match is private.'; end if;
 return jsonb_build_object(
   'id',m.id,'host',m.host,'host_name',m.host_name,'shot_play',true,
   'holes',m.holes,'hole',m.hole,'player',m.player,'status',m.status,
   'weather',m.weather,'layout',m.layout,'revision',m.revision,
   'last_shot',m.last_shot,'shot_queue',m.shot_queue,
   'lies',coalesce((select jsonb_agg(jsonb_build_object('player',player,'mini',snapshot->'mini','ball',snapshot->'ball'))
     from ff_private.turns where match_id=p_id and hole=m.hole and not finished),'[]'::jsonb),
   'players',(select jsonb_agg(jsonb_build_object('id',player,'name',name) order by seat) from ff_private.members where match_id=p_id),
   'scores',coalesce((select jsonb_agg(jsonb_build_object('player',player,'hole',hole,'strokes',strokes) order by hole) from ff_private.turns where match_id=p_id and finished),'[]'::jsonb),
   'snapshot',(select snapshot from ff_private.turns where match_id=p_id and player=auth.uid() and hole=m.hole)
 );
end $$;
revoke all on function ff_private.group_state(uuid) from public,anon,authenticated;

create or replace function public.ff_get_match(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from ff_private.matches where id=p_id and shot_play) then
   return ff_private.group_state(p_id);
 end if;
 return ff_private.state(p_id);
end $$;

-- Keep the original protocol for existing matches and block it on shot-play matches.
do $$
begin
 if to_regprocedure('ff_private.ff_save_turn(uuid,integer,integer,jsonb)') is null then
   alter function public.ff_save_turn(uuid,int,int,jsonb) set schema ff_private;
   alter function public.ff_finish_hole(uuid,int,int,uuid) set schema ff_private;
   alter function public.ff_join_match(uuid,text,text) set schema ff_private;
 end if;
end $$;
revoke all on function ff_private.ff_save_turn(uuid,int,int,jsonb),ff_private.ff_finish_hole(uuid,int,int,uuid),ff_private.ff_join_match(uuid,text,text) from public,anon,authenticated;
create or replace function public.ff_save_turn(p_id uuid,p_hole int,p_revision int,p_snapshot jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from ff_private.matches where id=p_id and shot_play) then raise exception 'Use the shot-play match controls.'; end if;
 return ff_private.ff_save_turn(p_id,p_hole,p_revision,p_snapshot);
end $$;
create or replace function public.ff_finish_hole(p_id uuid,p_hole int,p_strokes int,p_submission uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from ff_private.matches where id=p_id and shot_play) then raise exception 'Scores are saved after each shot.'; end if;
 return ff_private.ff_finish_hole(p_id,p_hole,p_strokes,p_submission);
end $$;
create or replace function public.ff_join_match(p_id uuid,p_invite text,p_name text) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from ff_private.matches where id=p_id and shot_play) then raise exception 'Open the full group invitation.'; end if;
 return ff_private.ff_join_match(p_id,p_invite,p_name);
end $$;
revoke all on function public.ff_save_turn(uuid,int,int,jsonb),public.ff_finish_hole(uuid,int,int,uuid),public.ff_join_match(uuid,text,text) from public,anon,authenticated;
grant execute on function public.ff_save_turn(uuid,int,int,jsonb),public.ff_finish_hole(uuid,int,int,uuid),public.ff_join_match(uuid,text,text) to authenticated;

create or replace function public.ff_group_create(p_name text,p_holes int,p_weather text,p_layout int,p_invite text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare mid uuid;
begin
 mid:=(public.ff_create_match(p_name,p_holes,p_weather,p_layout,p_invite)->>'id')::uuid;
 update ff_private.matches set shot_play=true where id=mid;
 insert into ff_private.members values(mid,auth.uid(),trim(p_name),1);
 return ff_private.group_state(mid);
end $$;

create or replace function public.ff_group_join(p_id uuid,p_invite text,p_name text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare m ff_private.matches; seats int;
begin
 select * into m from ff_private.matches where id=p_id and shot_play for update;
 if auth.uid() is null or m.id is null then raise exception 'Match not found.'; end if;
 if exists(select 1 from ff_private.members where match_id=p_id and player=auth.uid()) then return ff_private.group_state(p_id); end if;
 if p_invite is null or length(p_invite)<>64 or m.invite_hash<>sha256(convert_to(p_invite,'UTF8')) then raise exception 'This invitation is not valid.'; end if;
 if p_name is null or length(trim(p_name)) not between 1 and 24 then raise exception 'Enter your name (up to 24 letters).'; end if;
 select count(*) into seats from ff_private.members where match_id=p_id;
 if m.status<>'waiting' or seats>=4 then raise exception 'This match has started or is full.'; end if;
 insert into ff_private.members values(p_id,auth.uid(),trim(p_name),seats+1);
 update ff_private.matches set revision=revision+1,updated_at=now() where id=p_id;
 return ff_private.group_state(p_id);
end $$;

create or replace function public.ff_group_start(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare m ff_private.matches;
begin
 select * into m from ff_private.matches where id=p_id and shot_play for update;
 if auth.uid() is null or m.id is null or m.host<>auth.uid() then raise exception 'Only the host can start this match.'; end if;
 if m.status<>'waiting' then return ff_private.group_state(p_id); end if;
 if (select count(*) from ff_private.members where match_id=p_id)<2 then raise exception 'Wait for at least one friend to join.'; end if;
 update ff_private.matches set status='playing',revision=revision+1,updated_at=now() where id=p_id;
 return ff_private.group_state(p_id);
end $$;

create or replace function public.ff_group_shot(p_id uuid,p_revision int,p_snapshot jsonb,p_away double precision,p_replay jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare m ff_private.matches; old_strokes int; new_strokes int; holed boolean; next_player uuid; next_hole int; replay jsonb;
begin
 select * into m from ff_private.matches where id=p_id and shot_play for update;
 if auth.uid() is null or m.id is null or m.player<>auth.uid() or m.status<>'playing' or p_revision is distinct from m.revision then raise exception 'Your turn changed. Refresh the match.'; end if;
 if p_snapshot is null or jsonb_typeof(p_snapshot)<>'object' or octet_length(p_snapshot::text)>100000
   or coalesce(p_snapshot->>'mode','') not in ('ready','holed') or (p_snapshot->>'hole')::int is distinct from m.hole
   or p_away is null or p_away<0 or p_away>5000 or p_replay is null or jsonb_typeof(p_replay)<>'object'
   or octet_length(p_replay::text)>100000 then raise exception 'This shot cannot be saved.'; end if;
 new_strokes:=(p_snapshot->>'strokes')::int;
 holed:=p_snapshot->>'mode'='holed';
 select strokes into old_strokes from ff_private.turns where match_id=p_id and hole=m.hole and player=auth.uid();
 if new_strokes is null or new_strokes not between 1 and 99 or new_strokes-coalesce(old_strokes,0) not between 1 and 2
 then raise exception 'The stroke count does not match the previous lie.'; end if;
 insert into ff_private.turns(match_id,player,hole,snapshot,strokes,away,finished)
 values(p_id,auth.uid(),m.hole,p_snapshot,new_strokes,p_away,holed)
 on conflict(match_id,player,hole) do update set snapshot=excluded.snapshot,strokes=excluded.strokes,away=excluded.away,finished=excluded.finished;
 replay:=p_replay||jsonb_build_object('player',auth.uid(),'hole',m.hole,'revision',m.revision+1);
 -- Unplayed tee shots first, then farthest from the cup. Use prior-hole honors to break ties.
 select a.player into next_player from ff_private.members a
 left join ff_private.turns t on t.match_id=a.match_id and t.player=a.player and t.hole=m.hole
 left join ff_private.turns prior on prior.match_id=a.match_id and prior.player=a.player and prior.hole=m.hole-1
 where a.match_id=p_id and not coalesce(t.finished,false)
 order by (t.player is null) desc,t.away desc nulls last,prior.strokes nulls last,a.seat limit 1;
 next_hole:=m.hole;
 if next_player is null and m.hole<m.holes then
   next_hole:=m.hole+1;
   select a.player into next_player from ff_private.members a join ff_private.turns t on t.match_id=a.match_id and t.player=a.player
   where a.match_id=p_id and t.hole=m.hole order by t.strokes,a.seat limit 1;
 end if;
 update ff_private.matches set player=coalesce(next_player,m.player),hole=next_hole,
   status=case when next_player is null then 'complete' else 'playing' end,
   last_shot=replay,shot_queue=(case when jsonb_array_length(m.shot_queue)>=16 then m.shot_queue-0 else m.shot_queue end)||jsonb_build_array(replay),revision=revision+1,updated_at=now() where id=p_id;
 return ff_private.group_state(p_id);
end $$;

revoke all on function public.ff_group_create(text,int,text,int,text),public.ff_group_join(uuid,text,text),public.ff_group_start(uuid),public.ff_group_shot(uuid,int,jsonb,double precision,jsonb) from public,anon,authenticated;
grant execute on function public.ff_group_create(text,int,text,int,text),public.ff_group_join(uuid,text,text),public.ff_group_start(uuid),public.ff_group_shot(uuid,int,jsonb,double precision,jsonb) to authenticated;
create or replace function public.ff_group_tap_in(p_id uuid,p_hole int,p_snapshot jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare m ff_private.matches; t ff_private.turns;
begin
 select * into m from ff_private.matches where id=p_id and shot_play for update;
 if auth.uid() is null or m.id is null or not exists(
   select 1 from ff_private.members where match_id=p_id and player=auth.uid()
 ) then raise exception 'This match is private.'; end if;
 select * into t from ff_private.turns where match_id=p_id and player=auth.uid() and hole=p_hole;
 if t.finished and t.snapshot=p_snapshot then return ff_private.group_state(p_id); end if;
 if m.hole is distinct from p_hole or m.status<>'playing' or m.player=auth.uid() or t.finished
   or t.away is null or t.away>2.4384 or t.snapshot->>'mini' is distinct from 'true'
   or t.snapshot->>'mode' is distinct from 'ready' then raise exception 'This tap-in is no longer available. Refresh the match.'; end if;
 if p_snapshot is null or jsonb_typeof(p_snapshot)<>'object' or octet_length(p_snapshot::text)>100000
   or p_snapshot->>'mode' is distinct from 'holed' or p_snapshot->>'mini' is distinct from 'true'
   or (p_snapshot->>'hole')::int is distinct from p_hole
   or (p_snapshot->>'strokes')::int is distinct from t.strokes+1
   or (p_snapshot->>'putts')::int is distinct from coalesce((t.snapshot->>'putts')::int,0)+1
   then raise exception 'The tap-in did not finish in one stroke.'; end if;
 -- Leave the active player's revision intact so a shot already in flight can still save.
 update ff_private.turns set snapshot=p_snapshot,strokes=t.strokes+1,away=0,finished=true
 where match_id=p_id and player=auth.uid() and hole=p_hole;
 return ff_private.group_state(p_id);
end $$;
revoke all on function public.ff_group_tap_in(uuid,int,jsonb) from public,anon,authenticated;
grant execute on function public.ff_group_tap_in(uuid,int,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
