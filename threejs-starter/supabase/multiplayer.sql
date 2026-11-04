-- Fairway & Folly private beta. Only explicit participant-checked RPCs are exposed.
begin;
create schema if not exists ff_private;
revoke all on schema ff_private from public, anon, authenticated;
create table if not exists ff_private.matches (
 id uuid primary key default gen_random_uuid(), host uuid not null, guest uuid,
 host_name text not null check(length(host_name) between 1 and 24), guest_name text,
 invite_hash bytea not null, holes int not null check(holes between 1 and 9),
 weather text not null check(weather in ('calm','windy','stormy')), layout int not null check(layout between 0 and 3),
 hole int not null default 1, player uuid not null, status text not null default 'waiting' check(status in ('waiting','playing','complete')),
 revision int not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists ff_private.turns (
 match_id uuid references ff_private.matches(id) on delete cascade, player uuid not null, hole int not null check(hole between 1 and 9),
 snapshot jsonb, strokes int check(strokes between 0 and 99), submission uuid, finished boolean not null default false,
 primary key(match_id,player,hole)
);
alter table ff_private.matches enable row level security;
alter table ff_private.turns enable row level security;
revoke all on all tables in schema ff_private from public,anon,authenticated;
create or replace function ff_private.state(p_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare m ff_private.matches; result jsonb;
begin
 select * into m from ff_private.matches where id=p_id;
 if auth.uid() is null or m.id is null or (auth.uid()<>m.host and auth.uid() is distinct from m.guest) then raise exception 'This match is private. Open your invitation or use the browser you joined with.'; end if;
 select jsonb_build_object('id',m.id,'host',m.host,'guest',m.guest,'host_name',m.host_name,'guest_name',m.guest_name,'holes',m.holes,'weather',m.weather,'layout',m.layout,'hole',m.hole,'player',m.player,'status',m.status,'revision',m.revision,'updated_at',m.updated_at,'scores',coalesce((select jsonb_agg(jsonb_build_object('player',t.player,'hole',t.hole,'strokes',t.strokes) order by t.hole) from ff_private.turns t where t.match_id=m.id and t.finished),'[]'::jsonb),'snapshot',(select t.snapshot from ff_private.turns t where t.match_id=m.id and t.player=auth.uid() and t.hole=m.hole and not t.finished)) into result;
 return result;
end $$;
revoke all on function ff_private.state(uuid) from public,anon,authenticated;
create or replace function public.ff_get_match(p_id uuid) returns jsonb language sql security definer set search_path='' as $$select ff_private.state(p_id)$$;
create or replace function public.ff_create_match(p_name text,p_holes int,p_weather text,p_layout int,p_invite text) returns jsonb language plpgsql security definer set search_path='' as $$
declare mid uuid;
begin
 if auth.uid() is null then raise exception 'Please reconnect before creating a match.'; end if;
 if length(trim(p_name)) not between 1 and 24 or p_name is null or p_holes not between 1 and 9 or p_holes is null or p_layout not between 0 and 3 or p_layout is null or p_weather not in ('calm','windy','stormy') or p_weather is null or length(p_invite)<>64 or p_invite is null then raise exception 'Check the match settings.'; end if;
 if (select count(*) from ff_private.matches where host=auth.uid() and created_at>now()-interval '1 hour')>=10 then raise exception 'You have created several matches. Please try again later.'; end if;
 insert into ff_private.matches(host,host_name,invite_hash,holes,weather,layout,player) values(auth.uid(),trim(p_name),sha256(convert_to(p_invite,'UTF8')),p_holes,p_weather,p_layout,auth.uid()) returning id into mid;
 return ff_private.state(mid);
end $$;
create or replace function public.ff_join_match(p_id uuid,p_invite text,p_name text) returns jsonb language plpgsql security definer set search_path='' as $$
declare m ff_private.matches;
begin
 if auth.uid() is null then raise exception 'Please reconnect before joining.'; end if;
 select * into m from ff_private.matches where id=p_id for update;
 if m.id is null then raise exception 'Match not found.'; end if;
 if auth.uid()=m.host or auth.uid()=m.guest then return ff_private.state(p_id); end if;
 if m.status<>'waiting' or m.guest is not null then raise exception 'This match already has two players.'; end if;
 if p_invite is null or length(p_invite)<>64 or m.invite_hash<>sha256(convert_to(p_invite,'UTF8')) then raise exception 'This invitation is not valid.'; end if;
 if p_name is null or length(trim(p_name)) not between 1 and 24 then raise exception 'Enter your name (up to 24 letters).'; end if;
 update ff_private.matches set guest=auth.uid(),guest_name=trim(p_name),status='playing',revision=revision+1,updated_at=now() where id=p_id;
 return ff_private.state(p_id);
end $$;
create or replace function public.ff_save_turn(p_id uuid,p_hole int,p_revision int,p_snapshot jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare m ff_private.matches; old_strokes int;
begin
 select * into m from ff_private.matches where id=p_id for update;
 if auth.uid() is null or m.id is null or m.player<>auth.uid() or m.status<>'playing' or m.hole<>p_hole then raise exception 'It is not your turn. Refresh the match.'; end if;
 if p_revision is null or m.revision<>p_revision then raise exception 'Your match changed in another window. Reopen it before playing.'; end if;
 if p_snapshot is null or jsonb_typeof(p_snapshot)<>'object' or octet_length(p_snapshot::text)>100000 or coalesce(p_snapshot->>'mode','') not in ('ready','holed') or coalesce((p_snapshot->>'hole')::int,0)<>p_hole or coalesce((p_snapshot->>'strokes')::int,-1) not between 0 and 99 then raise exception 'This shot cannot be saved yet.'; end if;
 select strokes into old_strokes from ff_private.turns where match_id=p_id and player=auth.uid() and hole=p_hole;
 if (p_snapshot->>'strokes')::int<coalesce(old_strokes,0) then raise exception 'Saved strokes cannot be removed.'; end if;
 insert into ff_private.turns(match_id,player,hole,snapshot,strokes) values(p_id,auth.uid(),p_hole,p_snapshot,(p_snapshot->>'strokes')::int) on conflict(match_id,player,hole) do update set snapshot=excluded.snapshot,strokes=excluded.strokes;
 update ff_private.matches set revision=revision+1,updated_at=now() where id=p_id;
 return ff_private.state(p_id);
end $$;
create or replace function public.ff_finish_hole(p_id uuid,p_hole int,p_strokes int,p_submission uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare m ff_private.matches; t ff_private.turns; done int; next_hole int;
begin
 select * into m from ff_private.matches where id=p_id for update;
 if auth.uid() is null or m.id is null or (auth.uid()<>m.host and auth.uid() is distinct from m.guest) then raise exception 'This match is private.'; end if;
 select * into t from ff_private.turns where match_id=p_id and player=auth.uid() and hole=p_hole;
 if t.finished then
  if t.submission=p_submission and t.strokes=p_strokes then return ff_private.state(p_id); end if;
  raise exception 'That hole is already scored.';
 end if;
 if m.player<>auth.uid() or m.status<>'playing' or m.hole<>p_hole then raise exception 'It is not your turn.'; end if;
 if t.snapshot is null or t.snapshot->>'mode'<>'holed' or p_strokes is null or p_strokes not between 1 and 99 or t.strokes<>p_strokes or p_submission is null then raise exception 'Finish and save the hole before submitting.'; end if;
 update ff_private.turns set finished=true,submission=p_submission where match_id=p_id and player=auth.uid() and hole=p_hole;
 select count(*) into done from ff_private.turns where match_id=p_id and hole=p_hole and finished;
 if done=2 then
  if p_hole=m.holes then update ff_private.matches set status='complete',revision=revision+1,updated_at=now() where id=p_id;
  else next_hole=p_hole+1;update ff_private.matches set hole=next_hole,player=case when next_hole%2=1 then host else guest end,revision=revision+1,updated_at=now() where id=p_id;end if;
 else update ff_private.matches set player=case when player=host then guest else host end,revision=revision+1,updated_at=now() where id=p_id;end if;
 return ff_private.state(p_id);
end $$;
revoke all on function public.ff_get_match(uuid),public.ff_create_match(text,int,text,int,text),public.ff_join_match(uuid,text,text),public.ff_save_turn(uuid,int,int,jsonb),public.ff_finish_hole(uuid,int,int,uuid) from public,anon,authenticated;
grant execute on function public.ff_get_match(uuid),public.ff_create_match(text,int,text,int,text),public.ff_join_match(uuid,text,text),public.ff_save_turn(uuid,int,int,jsonb),public.ff_finish_hole(uuid,int,int,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
