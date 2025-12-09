-- Update the default year in the create_default_folders_for_client function to 2026
CREATE OR REPLACE FUNCTION public.create_default_folders_for_client(_client_name text, _year text DEFAULT '2026'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  admin_folder_id UUID;
  contab_folder_id UUID;
  admin_year_id UUID;
  contab_year_id UUID;
  estado_fin_id UUID;
  month_names TEXT[] := ARRAY['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  month_name TEXT;
BEGIN
  -- Create Administración root folder
  INSERT INTO public.client_folders (client_name, folder_name, parent_id, folder_type, is_default)
  VALUES (_client_name, 'Administración', NULL, 'root', true)
  ON CONFLICT (client_name, folder_name, parent_id) DO NOTHING
  RETURNING id INTO admin_folder_id;
  
  IF admin_folder_id IS NULL THEN
    SELECT id INTO admin_folder_id FROM public.client_folders 
    WHERE client_name = _client_name AND folder_name = 'Administración' AND parent_id IS NULL;
  END IF;

  -- Create Contabilidad root folder
  INSERT INTO public.client_folders (client_name, folder_name, parent_id, folder_type, is_default)
  VALUES (_client_name, 'Contabilidad', NULL, 'root', true)
  ON CONFLICT (client_name, folder_name, parent_id) DO NOTHING
  RETURNING id INTO contab_folder_id;
  
  IF contab_folder_id IS NULL THEN
    SELECT id INTO contab_folder_id FROM public.client_folders 
    WHERE client_name = _client_name AND folder_name = 'Contabilidad' AND parent_id IS NULL;
  END IF;

  -- Create year folder under Administración
  INSERT INTO public.client_folders (client_name, folder_name, parent_id, folder_type, is_default)
  VALUES (_client_name, _year, admin_folder_id, 'year', true)
  ON CONFLICT (client_name, folder_name, parent_id) DO NOTHING
  RETURNING id INTO admin_year_id;
  
  IF admin_year_id IS NULL THEN
    SELECT id INTO admin_year_id FROM public.client_folders 
    WHERE client_name = _client_name AND folder_name = _year AND parent_id = admin_folder_id;
  END IF;

  -- Create subfolders under Administración year
  INSERT INTO public.client_folders (client_name, folder_name, parent_id, folder_type, is_default)
  VALUES 
    (_client_name, 'Faov', admin_year_id, 'category', true),
    (_client_name, 'IVSS', admin_year_id, 'category', true),
    (_client_name, 'Patente', admin_year_id, 'category', true),
    (_client_name, 'Inces', admin_year_id, 'category', true)
  ON CONFLICT (client_name, folder_name, parent_id) DO NOTHING;

  -- Create year folder under Contabilidad
  INSERT INTO public.client_folders (client_name, folder_name, parent_id, folder_type, is_default)
  VALUES (_client_name, _year, contab_folder_id, 'year', true)
  ON CONFLICT (client_name, folder_name, parent_id) DO NOTHING
  RETURNING id INTO contab_year_id;
  
  IF contab_year_id IS NULL THEN
    SELECT id INTO contab_year_id FROM public.client_folders 
    WHERE client_name = _client_name AND folder_name = _year AND parent_id = contab_folder_id;
  END IF;

  -- Create Estado Financiero folder
  INSERT INTO public.client_folders (client_name, folder_name, parent_id, folder_type, is_default)
  VALUES (_client_name, 'Estado Financiero', contab_year_id, 'category', true)
  ON CONFLICT (client_name, folder_name, parent_id) DO NOTHING
  RETURNING id INTO estado_fin_id;
  
  IF estado_fin_id IS NULL THEN
    SELECT id INTO estado_fin_id FROM public.client_folders 
    WHERE client_name = _client_name AND folder_name = 'Estado Financiero' AND parent_id = contab_year_id;
  END IF;

  -- Create month folders IN ORDER
  FOREACH month_name IN ARRAY month_names LOOP
    INSERT INTO public.client_folders (client_name, folder_name, parent_id, folder_type, is_default)
    VALUES (_client_name, month_name, estado_fin_id, 'month', true)
    ON CONFLICT (client_name, folder_name, parent_id) DO NOTHING;
  END LOOP;
END;
$function$;