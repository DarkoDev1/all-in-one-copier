-- Create folders table with parent-child hierarchy
CREATE TABLE public.client_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  folder_name TEXT NOT NULL,
  parent_id UUID REFERENCES public.client_folders(id) ON DELETE CASCADE,
  folder_type TEXT NOT NULL DEFAULT 'custom', -- 'root', 'category', 'year', 'month', 'custom'
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_name, folder_name, parent_id)
);

-- Enable RLS
ALTER TABLE public.client_folders ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admins full access to folders"
ON public.client_folders
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Clients can view their folders
CREATE POLICY "Clients can view own folders"
ON public.client_folders
FOR SELECT
USING (client_name = get_user_client_name(auth.uid()));

-- Add folder_id to client_files
ALTER TABLE public.client_files 
ADD COLUMN folder_id UUID REFERENCES public.client_folders(id) ON DELETE SET NULL;

-- Enable realtime for folders
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_folders;

-- Function to create default folders for a client
CREATE OR REPLACE FUNCTION public.create_default_folders_for_client(
  _client_name TEXT,
  _year TEXT DEFAULT '2026'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  -- Create month folders
  FOREACH month_name IN ARRAY month_names LOOP
    INSERT INTO public.client_folders (client_name, folder_name, parent_id, folder_type, is_default)
    VALUES (_client_name, month_name, estado_fin_id, 'month', true)
    ON CONFLICT (client_name, folder_name, parent_id) DO NOTHING;
  END LOOP;
END;
$$;