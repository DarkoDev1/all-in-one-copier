-- Fix RLS policies: Convert RESTRICTIVE to PERMISSIVE for proper access control
-- RESTRICTIVE policies require ALL to pass; PERMISSIVE policies require ANY to pass (OR logic)

-- Drop existing policies on user_roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Drop existing policies on client_files
DROP POLICY IF EXISTS "Admins full access to files" ON public.client_files;
DROP POLICY IF EXISTS "Clients can view own files" ON public.client_files;

-- Create proper PERMISSIVE policies for user_roles table
-- Users can only SELECT their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can do everything on user_roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create proper PERMISSIVE policies for client_files table
-- Admins can do everything
CREATE POLICY "Admins full access to files"
ON public.client_files
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Clients can only SELECT their own files
CREATE POLICY "Clients can view own files"
ON public.client_files
FOR SELECT
TO authenticated
USING (client_name = public.get_user_client_name(auth.uid()));

-- Revoke public access to ensure tables are not publicly readable
-- Only authenticated users with proper RLS policies can access
REVOKE ALL ON public.user_roles FROM anon;
REVOKE ALL ON public.client_files FROM anon;

-- Grant access only to authenticated users (RLS will filter)
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.client_files TO authenticated;