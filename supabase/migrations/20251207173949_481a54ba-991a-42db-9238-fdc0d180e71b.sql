-- Create the client-documents storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-documents', 'client-documents', false);

-- Admins can do everything with files in client-documents bucket
CREATE POLICY "Admins full access to storage"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'client-documents' 
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'client-documents' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Clients can only read files in their folder (path starts with their client_name)
CREATE POLICY "Clients can read own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-documents'
  AND (storage.foldername(name))[1] = public.get_user_client_name(auth.uid())
);