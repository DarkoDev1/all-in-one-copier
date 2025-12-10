-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Clients can view own folders" ON public.client_folders;
DROP POLICY IF EXISTS "Clients can view own files" ON public.client_files;

-- Create new PERMISSIVE policies for clients to view their folders
CREATE POLICY "Clients can view own folders" 
ON public.client_folders 
FOR SELECT 
TO authenticated
USING (client_name = get_user_client_name(auth.uid()));

-- Create new PERMISSIVE policies for clients to view their files
CREATE POLICY "Clients can view own files" 
ON public.client_files 
FOR SELECT 
TO authenticated
USING (client_name = get_user_client_name(auth.uid()));