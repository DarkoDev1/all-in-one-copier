-- 1. Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-documents', 'client-documents', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage policies for admins (full access)
CREATE POLICY "Admins can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-documents' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'client-documents' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'client-documents' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can read all files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-documents' AND
  public.has_role(auth.uid(), 'admin')
);

-- 3. Storage policies for clients (read own files only)
CREATE POLICY "Clients can read own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-documents' AND
  (storage.foldername(name))[1] = public.get_user_client_name(auth.uid())
);

-- 4. Fix client_folders RLS policies to use authenticated role
DROP POLICY IF EXISTS "Admins full access to folders" ON public.client_folders;
DROP POLICY IF EXISTS "Clients can view own folders" ON public.client_folders;

CREATE POLICY "Admins full access to folders"
ON public.client_folders
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own folders"
ON public.client_folders
FOR SELECT
TO authenticated
USING (client_name = public.get_user_client_name(auth.uid()));

-- 5. Fix client_files RLS policies to use authenticated role
DROP POLICY IF EXISTS "Admins full access to files" ON public.client_files;
DROP POLICY IF EXISTS "Clients can view own files" ON public.client_files;

CREATE POLICY "Admins full access to files"
ON public.client_files
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own files"
ON public.client_files
FOR SELECT
TO authenticated
USING (client_name = public.get_user_client_name(auth.uid()));