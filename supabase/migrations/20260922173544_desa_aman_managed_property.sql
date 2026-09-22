-- The photographed home is real inventory; unknown rent/vacancy stay unknown.
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS slug text;
CREATE UNIQUE INDEX IF NOT EXISTS units_slug_unique ON public.units(slug) WHERE slug IS NOT NULL;
ALTER TABLE public.rooms ALTER COLUMN price DROP NOT NULL;
ALTER TABLE public.rooms ALTER COLUMN availability_status DROP NOT NULL;
DO $$
DECLARE home_id uuid;
BEGIN
  SELECT id INTO home_id FROM public.units WHERE slug = 'desa-aman' OR lower(trim(title)) = 'desa aman' ORDER BY created_at LIMIT 1;
  IF home_id IS NULL THEN
    INSERT INTO public.units(title,property_type,city,address,description,is_published,slug)
    VALUES ('Desa Aman','landed','','','Family-managed home with eight rooms in total; U1, U2, U3, G2, G3 and G4 are offered for rental. Address, rent and vacancy require confirmation.',true,'desa-aman') RETURNING id INTO home_id;
  ELSE
    UPDATE public.units SET slug='desa-aman' WHERE id=home_id AND slug IS NULL;
  END IF;
  INSERT INTO public.rooms(unit_id,name,price,availability_status,bed_size,has_study_table,has_aircond)
  SELECT home_id,room_name,NULL,NULL,CASE WHEN room_name IN ('U1','G2') THEN 'Queen' END,room_name IN ('U1','G2'),room_name IN ('U1','G2')
  FROM unnest(ARRAY['U1','U2','U3','G2','G3','G4']) AS room_name
  WHERE NOT EXISTS(SELECT 1 FROM public.rooms WHERE unit_id=home_id AND upper(name)=room_name);
END $$;
