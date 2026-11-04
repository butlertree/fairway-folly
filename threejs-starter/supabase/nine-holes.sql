-- Extend private matches without modifying players, scores, permissions or invitations.
begin;
alter table ff_private.matches drop constraint matches_holes_check;
alter table ff_private.matches add constraint matches_holes_check check(holes between 1 and 9);
alter table ff_private.turns drop constraint turns_hole_check;
alter table ff_private.turns add constraint turns_hole_check check(hole between 1 and 9);
create or replace function public.ff_create_match(p_name text,p_holes int,p_weather text,p_layout int,p_invite text) returns jsonb language plpgsql security definer set search_path='' as $$
declare mid uuid;
begin
 if auth.uid() is null then raise exception 'Please reconnect before creating a match.'; end if;
 if length(trim(p_name)) not between 1 and 24 or p_name is null or p_holes not between 1 and 9 or p_holes is null or p_layout not between 0 and 3 or p_layout is null or p_weather not in ('calm','windy','stormy') or p_weather is null or length(p_invite)<>64 or p_invite is null then raise exception 'Check the match settings.'; end if;
 if (select count(*) from ff_private.matches where host=auth.uid() and created_at>now()-interval '1 hour')>=10 then raise exception 'You have created several matches. Please try again later.'; end if;
 insert into ff_private.matches(host,host_name,invite_hash,holes,weather,layout,player) values(auth.uid(),trim(p_name),sha256(convert_to(p_invite,'UTF8')),p_holes,p_weather,p_layout,auth.uid()) returning id into mid;
 return ff_private.state(mid);
end $$;
commit;
