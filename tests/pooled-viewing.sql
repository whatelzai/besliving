-- Caller wraps in a transaction and rolls back all fixtures.
do $$
declare h uuid; s uuid; first_slot uuid; b1 uuid; b2 uuid; t timestamptz := date_trunc('hour',now()+interval '87 days');
begin
 for h in select id from public.users where role in ('admin','superadmin') order by id limit 2 loop
  insert into public.viewing_slots(host_id,starts_at,ends_at,is_open) values(h,t,t+interval '30 minutes',true) returning id into s;
  first_slot := coalesce(first_slot,s);
 end loop;
 b1 := public.book_available_viewing(first_slot,'Pool test','pool@example.invalid','+60123456789','U1','pool-test-1');
 b2 := public.book_available_viewing(first_slot,'Pool test','pool@example.invalid','+60123456789','U1','pool-test-2');
 if (select count(distinct slot_id) from public.viewing_bookings where id in (b1,b2)) <> 2 then raise exception 'Hosts not allocated separately'; end if;
 begin
  perform public.book_available_viewing(first_slot,'Pool test','pool@example.invalid','+60123456789','U1','pool-test-3');
  raise exception 'Exhausted time accepted';
 exception when raise_exception then
  if sqlerrm <> 'This time is no longer available. Please choose another time.' then raise; end if;
 end;
 if has_function_privilege('anon','public.book_available_viewing(uuid,text,text,text,text,text)','execute') then raise exception 'Public RPC exposed'; end if;
end $$;
