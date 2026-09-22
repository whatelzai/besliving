-- First-party viewing bookings. Personal data is available only through authorized server routes.
create table public.leads (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references public.users(id) on delete set null,
 name text not null check (length(name) between 1 and 100),
 email text, phone text,
 room_name text check (room_name in ('U1','U2','U3','G2','G3','G4')),
 status text not null default 'new' check(status in ('new','viewing_booked','viewed','not_interested','tenant')),
 source text not null default 'viewing',
 created_at timestamptz not null default now(),
 check (email is not null or phone is not null)
);
create table public.viewing_slots (
 id uuid primary key default gen_random_uuid(),
 host_id uuid not null references public.users(id),
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 is_open boolean not null default true,
 created_at timestamptz not null default now(),
 check(ends_at = starts_at + interval '30 minutes'),
 unique(host_id,starts_at)
);
create table public.viewing_bookings (
 id uuid primary key default gen_random_uuid(),
 slot_id uuid not null references public.viewing_slots(id),
 lead_id uuid not null references public.leads(id),
 status text not null default 'confirmed' check(status in ('confirmed','completed','cancelled')),
 request_hash text not null,
 created_at timestamptz not null default now()
);
create unique index one_active_viewing_per_slot on public.viewing_bookings(slot_id) where status <> 'cancelled';
create index viewing_booking_rate on public.viewing_bookings(request_hash,created_at);
create index viewing_slots_future on public.viewing_slots(starts_at);
alter table public.leads enable row level security;
alter table public.viewing_slots enable row level security;
alter table public.viewing_bookings enable row level security;
revoke all on public.leads,public.viewing_slots,public.viewing_bookings from anon,authenticated;
grant all on public.leads,public.viewing_slots,public.viewing_bookings to service_role;

create function public.book_viewing(p_slot uuid,p_name text,p_email text,p_phone text,p_room text,p_hash text)
returns uuid language plpgsql security invoker set search_path = public,pg_temp as $$
declare s public.viewing_slots; l uuid; b uuid;
begin
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
