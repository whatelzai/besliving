-- Run against a database with the viewing migration applied. All fixtures roll back.
begin;
do $$
declare host uuid; slot uuid; booking uuid;
begin
 select id into host from public.users where role='superadmin' limit 1;
 if host is null then raise exception 'Test requires a superadmin fixture'; end if;
 insert into public.viewing_slots(host_id,starts_at,ends_at,is_open)
 values(host,now()+interval '88 days',now()+interval '88 days 30 minutes',false) returning id into slot;
 begin
  perform public.book_viewing(slot,'Test','test@example.invalid','+60123456789','U1','sql-test');
  raise exception 'Closed slot unexpectedly accepted';
 exception when raise_exception then
  if sqlerrm <> 'This time is no longer available.' then raise; end if;
 end;
 update public.viewing_slots set is_open=true where id=slot;
 begin
  perform public.book_viewing(slot,'Test','test@example.invalid',null,'U1','sql-test');
  raise exception 'Missing phone unexpectedly accepted';
 exception when raise_exception then
  if sqlerrm <> 'Email and phone are required to confirm a viewing.' then raise; end if;
 end;
 begin
  perform public.book_viewing(slot,'Test','  ','+60123456789','U1','sql-test');
  raise exception 'Missing email unexpectedly accepted';
 exception when raise_exception then
  if sqlerrm <> 'Email and phone are required to confirm a viewing.' then raise; end if;
 end;
 booking := public.book_viewing(slot,'Test','test@example.invalid','+60123456789','U1','sql-test');
 if not exists(select 1 from public.viewing_bookings b join public.leads l on l.id=b.lead_id where b.id=booking and l.status='viewing_booked') then raise exception 'Booking/lead not created atomically'; end if;
 begin
  perform public.book_viewing(slot,'Other','other@example.invalid','+60123456789','U1','sql-test-other');
  raise exception 'Duplicate slot unexpectedly accepted';
 exception when raise_exception then
  if sqlerrm <> 'This time is no longer available.' then raise; end if;
 end;
 if has_table_privilege('anon','public.leads','select') then raise exception 'Anonymous lead access'; end if;
 if has_function_privilege('anon','public.book_viewing(uuid,text,text,text,text,text)','execute') then raise exception 'Anonymous RPC access'; end if;
end $$;
rollback;
