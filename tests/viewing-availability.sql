-- Transactional tests: caller wraps in BEGIN/ROLLBACK.
do $$
declare h uuid; d date := (now() at time zone 'Asia/Kuala_Lumpur')::date+2; first_slot uuid; stale_slot uuid; b uuid; days jsonb; n integer;
begin
 select id into h from public.users where role='superadmin' limit 1;
 delete from public.viewing_availability where host_id=h;
 delete from public.viewing_date_overrides where host_id=h;
 perform public.refresh_viewing_slots();
 select count(*) into n from public.viewing_slots where host_id=h and (starts_at at time zone 'Asia/Kuala_Lumpur')::date=d and is_open;
 if n<>16 then raise exception 'Expected 16 default slots, got %',n; end if;
 if not exists(select 1 from public.viewing_slots where host_id=h and starts_at=(d+time '09:00') at time zone 'Asia/Kuala_Lumpur' and ends_at=(d+time '09:30') at time zone 'Asia/Kuala_Lumpur') then raise exception 'Incorrect first slot'; end if;
 select id into first_slot from public.viewing_slots where host_id=h and starts_at=(d+time '09:00') at time zone 'Asia/Kuala_Lumpur';
 select id into stale_slot from public.viewing_slots where host_id=h and starts_at=(d+time '09:30') at time zone 'Asia/Kuala_Lumpur';
 b:=public.book_viewing(first_slot,'Availability test','availability@example.invalid','+60123456789','U1','availability-test');
 select jsonb_agg(jsonb_build_object('weekday',i,'enabled',i<>extract(dow from d)::int,'start',540,'end',1020)) into days from generate_series(0,6) i;
 perform public.save_viewing_availability(h,days);
 if exists(select 1 from public.viewing_slots where host_id=h and (starts_at at time zone 'Asia/Kuala_Lumpur')::date=d and is_open) then raise exception 'Disabled day remained open'; end if;
 if not exists(select 1 from public.viewing_bookings where id=b and status='confirmed') then raise exception 'Existing booking was modified'; end if;
 begin
  perform public.book_viewing(stale_slot,'Stale','stale@example.invalid','+60123456789','U1','stale-test');
  raise exception 'Stale slot was accepted';
 exception when raise_exception then
  if sqlerrm <> 'This time is no longer available.' then raise; end if;
 end;
 perform public.save_viewing_availability(h,'[]',d,'{"enabled":true,"start":480,"end":540}');
 select count(*) into n from public.viewing_slots where host_id=h and (starts_at at time zone 'Asia/Kuala_Lumpur')::date=d and is_open;
 if n<>2 then raise exception 'Expected two overridden slots, got %',n; end if;
 perform public.save_viewing_availability(h,'[]',d,null);
 if exists(select 1 from public.viewing_slots where host_id=h and (starts_at at time zone 'Asia/Kuala_Lumpur')::date=d and is_open) then raise exception 'Reset did not restore disabled weekly day'; end if;
 if has_table_privilege('anon','public.viewing_availability','select') or has_table_privilege('anon','public.viewing_date_overrides','select') then raise exception 'Anonymous availability table access'; end if;
 if has_function_privilege('anon','public.save_viewing_availability(uuid,jsonb,date,jsonb)','execute') then raise exception 'Anonymous schedule mutation'; end if;
end $$;
