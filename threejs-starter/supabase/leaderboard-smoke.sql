-- Run against a disposable database after multiplayer.sql and group-matches.sql.
begin;
do $$
declare
 host uuid:='00000000-0000-0000-0000-000000000101';
 player uuid;
 secret text:=repeat('b',64);
 state jsonb;
 mid uuid;
begin
 perform set_config('request.jwt.claim.sub',host::text,true);
 state:=public.ff_leaderboard_create('Host',2,'windy',2,secret);
 mid:=(state->>'id')::uuid;
 assert (state->>'leaderboard')::boolean;
 for i in 2..10 loop
   player:=lpad(i::text,32,'0')::uuid;
   perform set_config('request.jwt.claim.sub',player::text,true);
   state:=public.ff_group_join(mid,secret,'Player '||i);
 end loop;
 assert jsonb_array_length(state->'players')=10;
 perform set_config('request.jwt.claim.sub',lpad('11',32,'0')::uuid::text,true);
 begin
   perform public.ff_group_join(mid,secret,'Extra player');
   raise exception 'An extra seat was accepted';
 exception when raise_exception then
   if sqlerrm<>'This match has started or is full.' then raise; end if;
 end;
 begin
   perform public.ff_get_match(mid);
   raise exception 'An outsider could read the standings';
 exception when raise_exception then
   if sqlerrm<>'This match is private.' then raise; end if;
 end;
 perform set_config('request.jwt.claim.sub',host::text,true);
 perform public.ff_group_start(mid);
 state:=public.ff_leaderboard_shot(mid,0,'{"hole":1,"mode":"ready","strokes":1}');
 assert state->'snapshot'->>'strokes'='1';
 begin
   perform public.ff_leaderboard_shot(mid,0,'{"hole":1,"mode":"ready","strokes":2}');
   raise exception 'A stale shot was accepted';
 exception when raise_exception then
   if sqlerrm<>'Your saved position changed. Reopen the round to continue.' then raise; end if;
 end;
 state:=public.ff_leaderboard_shot(mid,1,'{"hole":1,"mode":"holed","strokes":2}');
 assert (state->>'hole')::int=2;
 assert state->'snapshot'='null'::jsonb;
 assert state=public.ff_leaderboard_shot(mid,1,'{"hole":1,"mode":"holed","strokes":2}');
 state:=public.ff_leaderboard_shot(mid,0,'{"hole":2,"mode":"holed","strokes":2}');
 assert (state->>'round_finished')::boolean and state->>'status'='playing';
 for i in 2..10 loop
   player:=lpad(i::text,32,'0')::uuid;
   perform set_config('request.jwt.claim.sub',player::text,true);
   state:=public.ff_get_match(mid);
   assert state->>'player'=player::text and state->>'hole'='1';
   assert state->'snapshot'='null'::jsonb;
   assert jsonb_array_length(state->'scores')=2*(i-1);
   perform public.ff_leaderboard_shot(mid,0,'{"hole":1,"mode":"holed","strokes":2}');
   state:=public.ff_leaderboard_shot(mid,0,'{"hole":2,"mode":"holed","strokes":2}');
 end loop;
 assert state->>'status'='complete' and jsonb_array_length(state->'scores')=20;
end $$;
rollback;
