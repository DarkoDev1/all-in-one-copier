-- Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('client-documents', 'client-documents', false);

-- Create table to track client files
CREATE TABLE public.client_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;

-- Policy for admin (Felix) to manage all files
CREATE POLICY "Admin can manage all files"
ON public.client_files
FOR ALL
USING (true)
WITH CHECK (true);

-- Storage policies for client-documents bucket
-- Admin can upload files
CREATE POLICY "Admin can upload files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'client-documents');

-- Admin can view all files
CREATE POLICY "Admin can view files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'client-documents');

-- Admin can delete files
CREATE POLICY "Admin can delete files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'client-documents');

-- Enable realtime for client_files
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_files;