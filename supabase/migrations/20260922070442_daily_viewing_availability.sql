-- Recurring Malaysia-time availability. Missing settings mean 09:00–17:00 every day.
create table public.viewing_availability (
 host_id uuid not null references public.users(id),
 weekday integer not null check(weekday between 0 and 6),
 enabled boolean not null default true,
 start_minute integer not null default 540,
 end_minute integer not null default 1020,
 primary key(host_id,weekday),
 check(start_minute >= 0 and end_minute <= 1440 and start_minute < end_minute and start_minute % 30 = 0 and end_minute % 30 = 0)
);
create table public.viewing_date_overrides (
 host_id uuid not null references public.users(id),
 date date not null,
 enabled boolean not null,
 start_minute integer not null default 540,
 end_minute integer not null default 1020,
 primary key(host_id,date),
 check(start_minute >= 0 and end_minute <= 1440 and start_minute < end_minute and start_minute % 30 = 0 and end_minute % 30 = 0)
);
alter table public.viewing_availability enable row level security;
alter table public.viewing_date_overrides enable row level security;
revoke all on public.viewing_availability,public.viewing_date_overrides from anon,authenticated;
grant all on public.viewing_availability,public.viewing_date_overrides to service_role;
alter table public.viewing_slots add column recurring boolean not null default false;

create function public.refresh_viewing_slots() returns void language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 -- Serializes schedule edits and booking transactions, including stale browser submissions.
 perform pg_advisory_xact_lock(92270442);
 update public.viewing_slots s set is_open=false
 where s.recurring and s.is_open and s.starts_at>now() and not exists (
  select 1 from public.users u
  left join public.viewing_availability a on a.host_id=u.id and a.weekday=extract(dow from s.starts_at at time zone 'Asia/Kuala_Lumpur')::integer
  left join public.viewing_date_overrides o on o.host_id=u.id and o.date=(s.starts_at at time zone 'Asia/Kuala_Lumpur')::date
  where u.id=s.host_id and u.role in ('admin','superadmin') and coalesce(o.enabled,a.enabled,true)
  and extract(hour from s.starts_at at time zone 'Asia/Kuala_Lumpur')*60+extract(minute from s.starts_at at time zone 'Asia/Kuala_Lumpur') >= coalesce(o.start_minute,a.start_minute,540)
  and extract(hour from s.starts_at at time zone 'Asia/Kuala_Lumpur')*60+extract(minute from s.starts_at at time zone 'Asia/Kuala_Lumpur')+30 <= coalesce(o.end_minute,a.end_minute,1020)
 );
 insert into public.viewing_slots(host_id,starts_at,ends_at,is_open,recurring)
 select u.id, (d.day::date + make_interval(mins=>m.minute)) at time zone 'Asia/Kuala_Lumpur',
 (d.day::date + make_interval(mins=>m.minute+30)) at time zone 'Asia/Kuala_Lumpur',true,true
 from public.users u
 cross join generate_series((now() at time zone 'Asia/Kuala_Lumpur')::date::timestamp, (now() at time zone 'Asia/Kuala_Lumpur')::date::timestamp+interval '29 days',interval '1 day') d(day)
 left join public.viewing_availability a on a.host_id=u.id and a.weekday=extract(dow from d.day)::integer
 left join public.viewing_date_overrides o on o.host_id=u.id and o.date=d.day::date
 cross join lateral generate_series(coalesce(o.start_minute,a.start_minute,540),coalesce(o.end_minute,a.end_minute,1020)-30,30) m(minute)
 where u.role in ('admin','superadmin') and coalesce(o.enabled,a.enabled,true)
 on conflict(host_id,starts_at) do update set is_open=true where viewing_slots.recurring and not viewing_slots.is_open;
end $$;
revoke all on function public.refresh_viewing_slots() from public,anon,authenticated;
grant execute on function public.refresh_viewing_slots() to service_role;

create function public.save_viewing_availability(p_host uuid,p_days jsonb,p_date date default null,p_override jsonb default null)
returns void language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 perform pg_advisory_xact_lock(92270442);
 if not exists(select 1 from public.users where id=p_host and role in ('admin','superadmin')) then raise exception 'Not authorized'; end if;
 if p_date is null then
  if jsonb_array_length(p_days) <> 7 or (select count(distinct (v->>'weekday')::int) from jsonb_array_elements(p_days) v) <> 7 then raise exception 'Provide all seven days'; end if;
  insert into public.viewing_availability(host_id,weekday,enabled,start_minute,end_minute)
  select p_host,(v->>'weekday')::int,(v->>'enabled')::boolean,(v->>'start')::int,(v->>'end')::int from jsonb_array_elements(p_days) v
  on conflict(host_id,weekday) do update set enabled=excluded.enabled,start_minute=excluded.start_minute,end_minute=excluded.end_minute;
 elsif p_override is null then
  delete from public.viewing_date_overrides where host_id=p_host and date=p_date;
 else
  insert into public.viewing_date_overrides(host_id,date,enabled,start_minute,end_minute)
  values(p_host,p_date,(p_override->>'enabled')::boolean,(p_override->>'start')::int,(p_override->>'end')::int)
  on conflict(host_id,date) do update set enabled=excluded.enabled,start_minute=excluded.start_minute,end_minute=excluded.end_minute;
 end if;
 perform public.refresh_viewing_slots();
end $$;
revoke all on function public.save_viewing_availability(uuid,jsonb,date,jsonb) from public,anon,authenticated;
grant execute on function public.save_viewing_availability(uuid,jsonb,date,jsonb) to service_role;

create or replace function public.book_viewing(p_slot uuid,p_name text,p_email text,p_phone text,p_room text,p_hash text)
returns uuid language plpgsql security invoker set search_path = public,pg_temp as $$
declare s public.viewing_slots; l uuid; b uuid;
begin
 if nullif(btrim(p_email),'') is null or nullif(btrim(p_phone),'') is null then
  raise exception 'Email and phone are required to confirm a viewing.';
 end if;
 perform public.refresh_viewing_slots();
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
