-- A public slot represents a time, not a chosen host. Keep assignment atomic.
create function public.book_available_viewing(p_slot uuid,p_name text,p_email text,p_phone text,p_room text,p_hash text)
returns uuid language plpgsql security invoker set search_path=public,pg_temp as $$
declare chosen uuid; requested timestamptz;
begin
 perform public.refresh_viewing_slots();
 select starts_at into requested from public.viewing_slots where id=p_slot;
 select s.id into chosen from public.viewing_slots s
 join public.users u on u.id=s.host_id
 where s.starts_at=requested and s.is_open and s.starts_at>now()+interval '1 hour'
 and u.role in ('admin','superadmin')
 and not exists(select 1 from public.viewing_bookings b where b.slot_id=s.id and b.status<>'cancelled')
 order by s.id limit 1 for update of s;
 if chosen is null then raise exception 'This time is no longer available. Please choose another time.'; end if;
 return public.book_viewing(chosen,p_name,p_email,p_phone,p_room,p_hash);
end $$;
revoke all on function public.book_available_viewing(uuid,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.book_available_viewing(uuid,text,text,text,text,text) to service_role;
