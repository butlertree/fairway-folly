-- Run against a disposable database after multiplayer.sql and group-matches.sql.
begin;
do $$
declare
 host uuid:='00000000-0000-0000-0000-000000000001';
 guest uuid:='00000000-0000-0000-0000-000000000002';
 third uuid:='00000000-0000-0000-0000-000000000003';
 fourth uuid:='00000000-0000-0000-0000-000000000004';
 outsider uuid:='00000000-0000-0000-0000-000000000005';
 secret text:=repeat('a',64);
 state jsonb; mid uuid; player uuid;
begin
 perform set_config('request.jwt.claim.sub',host::text,true);
 state:=public.ff_group_create('Host',2,'calm',0,secret);
 mid:=(state->>'id')::uuid;
 foreach player in array array[guest,third,fourth] loop
   perform set_config('request.jwt.claim.sub',player::text,true);
   state:=public.ff_group_join(mid,secret,'Player '||right(player::text,1));
 end loop;
 assert jsonb_array_length(state->'players')=4;
 perform set_config('request.jwt.claim.sub',outsider::text,true);
 begin
   perform public.ff_group_join(mid,secret,'Outsider');
   raise exception 'An extra seat was accepted';
 exception when raise_exception then
   if sqlerrm<>'This match has started or is full.' then raise; end if;
 end;
 begin
   perform public.ff_get_match(mid);
   raise exception 'An outsider could read the match';
 exception when raise_exception then
   if sqlerrm<>'This match is private.' then raise; end if;
 end;

 perform set_config('request.jwt.claim.sub',host::text,true);
 state:=public.ff_group_start(mid);
 assert state->>'player'=host::text;
 foreach player in array array[host,guest,third,fourth] loop
   assert state->>'player'=player::text;
   perform set_config('request.jwt.claim.sub',player::text,true);
   state:=public.ff_group_shot(mid,(state->>'revision')::int,jsonb_build_object('hole',1,'mode','ready','strokes',1,'mini',player=host,'putts',0,'ball',jsonb_build_object('x',0,'y',.3,'z',1)),
     case when player=guest then 200 when player=host then .3048 else 80 end,'{"input":{"type":"shot"}}');
 end loop;
 assert state->>'player'=guest::text;
 assert state->'last_shot'->>'player'=fourth::text;
 assert jsonb_array_length(state->'lies')=4;
 perform set_config('request.jwt.claim.sub',host::text,true);
 declare revision int:=(state->>'revision')::int;
 begin
   state:=public.ff_group_tap_in(mid,1,'{"hole":1,"mode":"holed","strokes":2,"mini":true,"putts":1}');
   assert state->>'player'=guest::text;
   assert (state->>'revision')::int=revision;
   assert jsonb_array_length(state->'lies')=3;
 end;
 foreach player in array array[guest,third,fourth] loop
   assert state->>'player'=player::text;
   perform set_config('request.jwt.claim.sub',player::text,true);
   state:=public.ff_group_shot(mid,(state->>'revision')::int,'{"hole":1,"mode":"holed","strokes":2}',0,'{"input":{"type":"putt"}}');
 end loop;
 assert (state->>'hole')::int=2;
 assert state->>'player'=host::text;
 assert jsonb_array_length(state->'scores')=4;
end $$;
rollback;
