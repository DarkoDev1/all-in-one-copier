CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



SET default_table_access_method = heap;

--
-- Name: client_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_name text NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    uploaded_by text NOT NULL
);


--
-- Name: client_files client_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_files
    ADD CONSTRAINT client_files_pkey PRIMARY KEY (id);


--
-- Name: client_files Admin can manage all files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage all files" ON public.client_files USING (true) WITH CHECK (true);


--
-- Name: client_files; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


