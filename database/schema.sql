--
-- PostgreSQL database dump
--

\restrict tp256PpfhApaBRjA6gBgovrBu7AVj4PTc1jhZ45T5f93aue5MXjxFSkNfanbSoD

-- Dumped from database version 18.6 (Postgres.app)
-- Dumped by pg_dump version 18.6 (Postgres.app)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: academic_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.academic_records (
    id integer NOT NULL,
    student_id integer NOT NULL,
    attendance integer NOT NULL,
    assessment_score integer NOT NULL,
    previous_score integer NOT NULL,
    missing_assignments integer DEFAULT 0 NOT NULL,
    engagement character varying(20) NOT NULL,
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT academic_records_assessment_score_check CHECK (((assessment_score >= 0) AND (assessment_score <= 100))),
    CONSTRAINT academic_records_attendance_check CHECK (((attendance >= 0) AND (attendance <= 100))),
    CONSTRAINT academic_records_engagement_check CHECK (((engagement)::text = ANY ((ARRAY['Low'::character varying, 'Medium'::character varying, 'High'::character varying])::text[]))),
    CONSTRAINT academic_records_missing_assignments_check CHECK ((missing_assignments >= 0)),
    CONSTRAINT academic_records_previous_score_check CHECK (((previous_score >= 0) AND (previous_score <= 100)))
);


--
-- Name: academic_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.academic_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: academic_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.academic_records_id_seq OWNED BY public.academic_records.id;


--
-- Name: interventions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interventions (
    id integer NOT NULL,
    student_id integer NOT NULL,
    status character varying(30) DEFAULT 'Pending'::character varying NOT NULL,
    notes text DEFAULT ''::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: interventions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.interventions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: interventions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.interventions_id_seq OWNED BY public.interventions.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    roll_number character varying(20) NOT NULL,
    branch character varying(50) NOT NULL,
    semester integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: academic_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.academic_records ALTER COLUMN id SET DEFAULT nextval('public.academic_records_id_seq'::regclass);


--
-- Name: interventions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interventions ALTER COLUMN id SET DEFAULT nextval('public.interventions_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Name: academic_records academic_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.academic_records
    ADD CONSTRAINT academic_records_pkey PRIMARY KEY (id);


--
-- Name: interventions interventions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interventions
    ADD CONSTRAINT interventions_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: students students_roll_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_roll_number_key UNIQUE (roll_number);


--
-- Name: academic_records academic_records_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.academic_records
    ADD CONSTRAINT academic_records_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: interventions interventions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interventions
    ADD CONSTRAINT interventions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict tp256PpfhApaBRjA6gBgovrBu7AVj4PTc1jhZ45T5f93aue5MXjxFSkNfanbSoD

