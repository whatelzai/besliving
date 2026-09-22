-- Require both contacts for new bookings; preserve legacy enquiries.
create or replace function public.book_viewing(p_slot uuid,p_name text,p_email text,p_phone text,p_room text,p_hash text)
returns uuid language plpgsql security invoker set search_path = public,pg_temp as $$
declare s public.viewing_slots; l uuid; b uuid;
begin
 if nullif(btrim(p_email),'') is null or nullif(btrim(p_phone),'') is null then
  raise exception 'Email and phone are required to confirm a viewing.';
 end if;
 perform pg_advisory_xact_lock(hashtextextended(p_hash,0));
 if (select count(*) from public.viewing_bookings where request_hash=p_hash and created_at>now()-interval '1 day') >= 5 then
  raise exception 'Booking limit reached. Please try again tomorrow.';
 end if;
 select * into s from public.viewing_slots where id=p_slot for update;
 if not found or not s.is_open or s.starts_at <= now()+interval '1 hour' then raise exception 'This time is no longer available.'; end if;
 if not exists(select 1 from public.users where id=s.host_id and role in ('admin','superadmin')) then raise exception 'This time is no longer available.'; end if;
 if exists(select 1 from public.viewing_bookings where slot_id=p_slot and status <> 'cancelled') then raise exception 'This time is no longer available.'; end if;
 insert into public.leads(name,email,phone,room_name,status) values(p_name,p_email,p_phone,p_room,'viewing_booked') returning id into l;
 insert into public.viewing_bookings(slot_id,lead_id,request_hash) values(p_slot,l,p_hash) returning id into b;
 return b;
end $$;
revoke all on function public.book_viewing(uuid,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.book_viewing(uuid,text,text,text,text,text) to service_role;
