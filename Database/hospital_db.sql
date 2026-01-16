--
-- PostgreSQL database dump
--

\restrict GOFlcnNZ4eUBe1icFqQ2SKEiLhoItRlL3CGLkvpdxUAZi4dxVrxSyL1JMONsjzU

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

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
-- Name: department_transfers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.department_transfers (
    transfer_id integer NOT NULL,
    hospitalization_id integer NOT NULL,
    from_department_id integer NOT NULL,
    to_department_id integer NOT NULL,
    transferred_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reason text,
    staff_id integer NOT NULL
);


ALTER TABLE public.department_transfers OWNER TO postgres;

--
-- Name: department_transfers_transfer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.department_transfers ALTER COLUMN transfer_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.department_transfers_transfer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: diagnostic_parameters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diagnostic_parameters (
    parameter_id integer NOT NULL,
    diagnostic_id integer,
    name character varying(255) NOT NULL,
    unit character varying(50),
    min_value numeric(10,2),
    max_value numeric(10,2)
);


ALTER TABLE public.diagnostic_parameters OWNER TO postgres;

--
-- Name: diagnostic_parameters_parameter_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.diagnostic_parameters ALTER COLUMN parameter_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.diagnostic_parameters_parameter_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: diagnostics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diagnostics (
    diagnostic_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL
);


ALTER TABLE public.diagnostics OWNER TO postgres;

--
-- Name: diagnostics_diagnostic_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.diagnostics ALTER COLUMN diagnostic_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.diagnostics_diagnostic_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: hospital_departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hospital_departments (
    department_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    floor integer,
    phone character varying(20)
);


ALTER TABLE public.hospital_departments OWNER TO postgres;

--
-- Name: hospital_departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.hospital_departments ALTER COLUMN department_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.hospital_departments_department_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: hospital_staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hospital_staff (
    staff_id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    specialty_id integer,
    role text NOT NULL
);


ALTER TABLE public.hospital_staff OWNER TO postgres;

--
-- Name: hospital_staff_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.hospital_staff ALTER COLUMN staff_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.hospital_staff_staff_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: hospitalization_staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hospitalization_staff (
    id integer NOT NULL,
    hospitalization_id integer NOT NULL,
    staff_id integer NOT NULL,
    role character varying(30) NOT NULL,
    assigned_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.hospitalization_staff OWNER TO postgres;

--
-- Name: hospitalization_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.hospitalization_staff ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.hospitalization_staff_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: hospitalizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hospitalizations (
    hospitalization_id integer NOT NULL,
    patient_id integer NOT NULL,
    admitted_department_id integer NOT NULL,
    admitted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    discharge_at timestamp with time zone,
    discharge_type character varying(20),
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL
);


ALTER TABLE public.hospitalizations OWNER TO postgres;

--
-- Name: hospitalizations_hospitalization_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.hospitalizations ALTER COLUMN hospitalization_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.hospitalizations_hospitalization_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: medical_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_notes (
    note_id integer NOT NULL,
    hospitalization_id integer NOT NULL,
    staff_id integer NOT NULL,
    note_type character varying(30) NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.medical_notes OWNER TO postgres;

--
-- Name: medical_notes_note_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.medical_notes ALTER COLUMN note_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.medical_notes_note_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: patient_diagnostic_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_diagnostic_results (
    result_id integer NOT NULL,
    patient_diagnostic_id integer,
    parameter_id integer,
    value numeric(10,2) NOT NULL,
    min_value numeric(10,2) NOT NULL,
    max_value numeric(10,2) NOT NULL,
    status text
);


ALTER TABLE public.patient_diagnostic_results OWNER TO postgres;

--
-- Name: patient_diagnostic_results_result_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.patient_diagnostic_results ALTER COLUMN result_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.patient_diagnostic_results_result_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: patient_diagnostics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_diagnostics (
    id integer NOT NULL,
    user_id integer NOT NULL,
    diagnostic_id integer NOT NULL,
    ordered_at timestamp without time zone DEFAULT now(),
    status character varying(50) DEFAULT 'ordered'::character varying
);


ALTER TABLE public.patient_diagnostics OWNER TO postgres;

--
-- Name: patient_diagnostics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.patient_diagnostics ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.patient_diagnostics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    patient_id integer NOT NULL,
    name character varying(100) NOT NULL,
    surname character varying(100) NOT NULL,
    pesel character varying(11) NOT NULL,
    date_of_birth date NOT NULL,
    phone character varying(20),
    emergency_contact_phone character varying(20),
    email character varying(100),
    address text
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: patients_patient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.patients ALTER COLUMN patient_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.patients_patient_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: specialties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.specialties (
    specialty_id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.specialties OWNER TO postgres;

--
-- Name: specialties_specialty_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.specialties ALTER COLUMN specialty_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.specialties_specialty_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: staff_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_accounts (
    account_id integer NOT NULL,
    staff_id integer,
    email text NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.staff_accounts OWNER TO postgres;

--
-- Name: staff_accounts_account_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.staff_accounts ALTER COLUMN account_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.staff_accounts_account_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    pesel character(11) NOT NULL,
    name character varying(255),
    surname character varying(255),
    patient_id integer
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users ALTER COLUMN user_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: department_transfers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.department_transfers (transfer_id, hospitalization_id, from_department_id, to_department_id, transferred_at, reason, staff_id) FROM stdin;
3	3	3	4	2025-12-22 16:23:06.58+01	Transfer do nowego oddziału	9
4	1	4	2	2025-12-22 16:23:26.915+01	Transfer do nowego oddziału	9
5	4	4	2	2025-12-22 16:38:46.677+01	Serce	9
6	4	2	3	2025-12-22 16:52:36.653+01	Złe Samopoczucie	9
7	1	2	4	2025-12-23 12:35:56.751+01	Pogorszenie stanu zdrowia	9
8	4	3	1	2025-12-23 17:21:08.618+01	asd	9
9	8	1	3	2026-01-15 20:36:40.979+01	a tak o	11
10	8	3	1	2026-01-15 22:08:10.366+01	A tak o se przenosze	11
11	8	1	3	2026-01-16 16:42:51.135+01	A tak dla jaj	9
12	8	3	5	2026-01-16 22:56:27.466+01	asd	20
\.


--
-- Data for Name: diagnostic_parameters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diagnostic_parameters (parameter_id, diagnostic_id, name, unit, min_value, max_value) FROM stdin;
1	1	WBC	x10^3/µL	4.00	10.00
2	1	RBC	x10^6/µL	4.50	6.00
3	1	Hemoglobina	g/dL	12.00	17.00
4	2	Glukoza na czczo	mg/dL	70.00	100.00
5	3	Cholesterol całkowity	mg/dL	125.00	200.00
18	5	asd	a	12.00	2.00
19	5	asd	asd	12.00	2.00
15	4	ALTl	U/L	7.00	553.00
23	8	ul	g/m2	12.00	283.00
24	9	asd	12	22.00	22.00
25	12	as21	11	23.00	23.00
\.


--
-- Data for Name: diagnostics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diagnostics (diagnostic_id, name, description, price) FROM stdin;
2	Glukoza	Poziom glukozy we krwi	305.00
4	Próby wątrobowe (ALT, AST)	Zestaw badań biochemicznych oceniających funkcję wątroby, wykorzystywany w diagnostyce chorób wątroby oraz monitorowaniu leczenia.	35.00
5	asd	asd	12.00
6	asdaaasss	asdaaaaaasss	1232.00
7	a	a	1.00
8	Trombocyty		25.00
9	asd	asd	123.00
10	123	12	22.00
3	Cholesterol		50.00
11			0.00
1	Morfologia krwis		505.00
12	a	a	1.00
\.


--
-- Data for Name: hospital_departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hospital_departments (department_id, name, description, floor, phone) FROM stdin;
4	OIOM	Oddział intensywnej terapii	1	12312123312
1	SOR	Szpitalny Oddział Ratunkowy	0	12312123123123
5	Oddział Chirurgii Ogólnej	Oddział zajmuje się leczeniem operacyjnym chorób jamy brzusznej, urazów oraz wykonywaniem planowych i nagłych zabiegów chirurgicznych.	3	12312213132
3	Neurologia		3	12312312231
2	Kardiologia	Oddział chorób serca	2	123123123123
\.


--
-- Data for Name: hospital_staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hospital_staff (staff_id, first_name, last_name, phone, specialty_id, role) FROM stdin;
15	asda	sd	123123123	7	DOCTOR
16	ASD	asd	123123123	9	DOCTOR
19	Mikołaj	Koperek	123123123	14	Ordynator
20	Jan 	Borówka	123123123	\N	Osoba rejestrująca
21	Piotr	Skowyrski	123123123	\N	Laborant
22	Tomasz	Lipiec	123123123	8	Ordynator
23	Rafał	Wiśniewski		7	Lekarz
24	Rafał	Bombel	1234	8	Ordynator
9	Adam	Kowalskia	123456789111	9	Ordynator
17	Bartłomiej	Kowalik	791851859	\N	Pielegniarz/Pielegniarka
13	Bartłomiej	Kowalik	456123222	8	Lekarz
14	Jan	Klonowski	456 123 532	\N	Admin
18	asd	asd	123	14	Ordynator
12	Anna	Lewandowska	111222333	\N	Pielegniarz/Pielegniarka
11	Piotr	Wiśniewskis	123123123	\N	Admin
10	Ewa	Nowak	1	\N	Pielegniarz/Pielegniarka
\.


--
-- Data for Name: hospitalization_staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hospitalization_staff (id, hospitalization_id, staff_id, role, assigned_at) FROM stdin;
11	3	9	Lekarz prowadzący	2025-12-23 15:29:50.936499+01
12	4	9	Lekarz prowadzący	2025-12-23 16:07:23.578147+01
13	4	11	Konsultant	2025-12-23 16:07:30.224296+01
15	2	9	Lekarz prowadzący	2026-01-05 17:15:07.530416+01
16	1	9	Lekarz prowadzący	2026-01-05 17:35:00.071741+01
17	5	9	Lekarz prowadzący	2026-01-06 11:46:36.403526+01
18	6	9	Lekarz prowadzący	2026-01-10 20:53:10.699118+01
19	7	9	Lekarz prowadzący	2026-01-12 10:02:07.78496+01
21	8	12	Pielęgniarka/Pielęgniarz	2026-01-14 18:43:32.512331+01
22	8	14	Konsultant	2026-01-14 18:43:40.906797+01
24	12	9	Lekarz prowadzący	2026-01-15 19:39:23.18922+01
25	13	9	Lekarz prowadzący	2026-01-15 20:32:36.462714+01
26	8	9	Lekarz prowadzący	2026-01-16 14:50:25.780509+01
27	8	19	Konsultant	2026-01-16 18:42:27.4025+01
\.


--
-- Data for Name: hospitalizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hospitalizations (hospitalization_id, patient_id, admitted_department_id, admitted_at, discharge_at, discharge_type, status) FROM stdin;
3	2	4	2025-12-22 16:07:58.747+01	2026-01-05 16:46:42.734663+01	HOME	DISCHARGED
2	1	1	2025-12-22 16:03:47.499+01	2026-01-05 17:32:16.491445+01	HOME	DISCHARGED
1	3	4	2025-12-23 12:35:56.751+01	2026-01-05 17:35:32.604525+01	DEATH	DISCHARGED
4	4	1	2025-12-23 17:21:08.618+01	2026-01-05 17:50:15.746022+01	HOME	DISCHARGED
5	5	2	2026-01-06 12:46:21.839+01	2026-01-06 11:47:35.807479+01	HOME	DISCHARGED
6	5	2	2026-01-10 21:52:42.817+01	2026-01-10 20:53:56.95426+01	DEATH	DISCHARGED
7	2	4	2026-01-12 11:01:47.959+01	2026-01-12 10:02:19.15801+01	DEATH	DISCHARGED
9	5	2	2026-01-15 20:16:24.841+01	\N	\N	ACTIVE
10	4	4	2026-01-15 20:19:31.785+01	\N	\N	ACTIVE
11	2	5	2026-01-15 20:20:24.285+01	\N	\N	ACTIVE
12	7	4	2026-01-15 20:32:07.749+01	2026-01-15 20:05:04.503664+01	DEATH	DISCHARGED
14	15	4	2026-01-16 16:48:51.519+01	\N	\N	ACTIVE
15	8	2	2026-01-16 18:05:15.914+01	\N	\N	ACTIVE
13	11	5	2026-01-15 21:32:11.274+01	2026-01-16 21:38:00.429838+01	HOME	DISCHARGED
8	1	5	2026-01-16 22:56:27.466+01	\N	\N	ACTIVE
\.


--
-- Data for Name: medical_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_notes (note_id, hospitalization_id, staff_id, note_type, content, created_at) FROM stdin;
1	4	9	Diagnoza	asd	2025-12-29 16:49:24.78598+01
2	4	9	Diagnoza	asddddd	2025-12-29 17:31:13.735925+01
3	4	9	Obserwacja	asddddd	2025-12-29 17:31:20.077917+01
4	3	9	Diagnoza	asd	2025-12-29 17:34:00.771146+01
5	3	9	Decyzja	asd	2025-12-29 17:39:36.372747+01
6	4	9	Decyzja	asd	2025-12-29 17:39:58.658715+01
7	2	9	DECISION	Pacjent zdrowy	2026-01-05 17:32:16.496959+01
8	1	9	Diagnoza	Rak	2026-01-05 17:35:19.028409+01
9	1	9	Decyzja	Zgon	2026-01-05 17:35:32.608763+01
10	4	9	Diagnoza	dddd	2026-01-05 17:50:05.530795+01
11	4	9	Decyzja	a	2026-01-05 17:50:15.748552+01
12	5	9	Diagnoza	Rak	2026-01-06 11:47:03.565632+01
13	5	9	Obserwacja	Źle sie czuje	2026-01-06 11:47:16.939459+01
14	5	9	Decyzja	stan stabilny	2026-01-06 11:47:35.813621+01
15	6	9	Diagnoza	Chłop jest chory	2026-01-10 20:53:31.29775+01
16	6	9	Obserwacja	asd	2026-01-10 20:53:46.028856+01
17	6	9	Decyzja	zgon	2026-01-10 20:53:56.959051+01
18	7	9	Decyzja	rak	2026-01-12 10:02:19.160633+01
19	12	9	Diagnoza	Pacjent czuje się lepiej	2026-01-15 19:44:00.886326+01
20	12	9	Decyzja	Zgon pooperacyjny w wyniku sepsy po operacji jelita grubego.	2026-01-15 20:05:04.509605+01
21	13	9	Diagnoza	asd	2026-01-15 20:32:48.646778+01
22	13	9	Decyzja	das	2026-01-15 20:32:53.383023+01
23	8	9	Diagnoza	test	2026-01-16 14:50:33.981546+01
24	13	9	Decyzja	asd	2026-01-16 15:38:37.00774+01
25	13	9	Diagnoza	Po przeprowadzeniu RTG pacjent ma złamanie	2026-01-16 18:23:30.713029+01
26	13	9	Decyzja	Pacjent stabilny	2026-01-16 21:38:00.433364+01
\.


--
-- Data for Name: patient_diagnostic_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient_diagnostic_results (result_id, patient_diagnostic_id, parameter_id, value, min_value, max_value, status) FROM stdin;
1	2	1	5.00	4.00	10.00	Oczekuje
2	2	2	5.00	4.50	6.00	Oczekuje
3	2	3	13.00	12.00	17.00	Oczekuje
4	3	5	123.00	125.00	200.00	Oczekuje
5	6	5	1234.00	125.00	200.00	Wpisane
6	8	1	5.00	4.00	10.00	Wpisane
7	8	2	5.00	4.50	6.00	Wpisane
8	8	3	5.00	12.00	17.00	Wpisane
9	9	5	128.50	125.00	200.00	Wpisane
10	10	4	30.00	70.00	100.00	Wpisane
11	12	1	8.00	4.00	10.00	Wpisane
12	12	2	4.20	4.50	6.00	Wpisane
13	12	3	15.00	12.00	17.00	Wpisane
14	13	1	7.00	4.00	10.00	Wpisane
15	13	2	4.40	4.50	6.00	Wpisane
16	13	3	15.00	12.00	17.00	Wpisane
17	14	5	210.00	125.00	200.00	Wpisane
18	15	1	0.00	4.00	10.00	Wpisane
19	15	2	200.00	4.50	6.00	Wpisane
20	15	3	15.00	12.00	17.00	Wpisane
21	17	5	123.00	125.00	200.00	Wpisane
22	16	5	230.00	125.00	200.00	Wpisane
23	11	1	1.00	4.00	10.00	Wpisane
24	11	2	1.00	4.50	6.00	Wpisane
25	11	3	1.00	12.00	17.00	Wpisane
26	18	15	3.00	7.00	553.00	Wpisane
28	21	23	123.00	12.00	283.00	Wpisane
29	22	4	20.00	70.00	100.00	Wpisane
30	7	5	2.00	125.00	200.00	Wpisane
31	25	1	2.00	4.00	10.00	Wpisane
32	25	2	1.00	4.50	6.00	Wpisane
33	25	3	32.00	12.00	17.00	Wpisane
27	18	\N	2.00	1.00	12.00	Wpisane
34	27	15	7.00	7.00	553.00	Wpisane
\.


--
-- Data for Name: patient_diagnostics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient_diagnostics (id, user_id, diagnostic_id, ordered_at, status) FROM stdin;
1	1	1	2025-12-17 08:35:49.935	Wpisane
2	1	1	2025-12-17 08:54:11.581	Wpisane
3	1	3	2025-12-17 09:48:52.528	Wpisane
5	1	1	2025-12-17 10:39:50.796	Wpisane
6	2	3	2025-12-17 13:17:15.895	Wpisane
8	3	1	2025-12-17 14:28:56.275	Wpisane
9	4	3	2025-12-17 14:32:52.147	Wpisane
10	4	2	2025-12-17 15:37:02.008	Wpisane
12	5	1	2025-12-17 15:42:10.388	Wpisane
13	6	1	2025-12-17 19:30:03.924	Wpisane
14	6	3	2025-12-17 19:31:12.343	Wpisane
15	7	1	2025-12-20 16:55:43.864	Wpisane
17	7	3	2025-12-22 14:55:49.554	Wpisane
16	7	3	2025-12-20 16:56:38.942	Wpisane
11	4	1	2025-12-17 15:38:44.066	Wpisane
18	1	4	2026-01-13 23:31:04.685	Wpisane
19	1	7	2026-01-14 00:12:59.578	Wpisane
20	9	7	2026-01-14 19:54:16.212	Wpisane
21	1	8	2026-01-14 21:48:27.304	Wpisane
22	1	2	2026-01-14 22:00:40.012	Wpisane
7	2	3	2025-12-17 13:18:00.371	Wpisane
23	3	6	2026-01-15 21:45:47.033	Oczekuje
24	6	1	2026-01-15 22:10:12.406	Oczekuje
25	15	1	2026-01-16 18:05:43.657	Wpisane
27	15	4	2026-01-16 22:41:15.547	Wpisane
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (patient_id, name, surname, pesel, date_of_birth, phone, emergency_contact_phone, email, address) FROM stdin;
4	Paulina	Robak	12309245611	2025-12-24	123123123	321321321	paulinar@gmail.com	ul. Rakowksa 12
7	Radosław	Mazur	12345678912	2026-01-05	123123123		aaaaaaaaaaaaaaaaaa	asd
6	as	as	12332145611	2026-01-14	123123123	12312312311	asd@gmail.com	asddd
8	asd	asd	12311223311	2026-01-14	2323123312123	12132213123	2123123213@gmail.com	2123
9	Bas	asd	09231232121	2026-01-13	123123123	\N	maas@gamail.com	123
10	222	23	12332112311	2026-01-14	123312121	\N	\N	asd
11	Anna	Rączka	85461231254	2026-01-14	123123123	\N	\N	asd
12	Michał	Żak	12345678564	2026-01-14	123123123	\N	mzak@gmail.com	żakowska 5
14	mrowa	mrowa	01234567011	2026-01-06	123123123	\N	mrowa@mrowa.pl	123
15	Józef	Józewski	78945612309	2026-01-15	123123123	\N	\N	123
16	Henry	Test	12309876592	2026-01-06	123123123	\N	\N	123
13	Michał	Żas	09876543211	2026-01-07	123123123		golden@goldenfurioza.com	Dublin
17	asd	123	12312312333	2026-01-14	123123123	\N	\N	a
1	Bartlomiej	Kowalik	83071548295	1983-04-06	645 123 456	512 645 143	bartlomiej.kowalik@gmail.com	asddddddasdasdaa
3	Bogusław	Micha	14502012333	2025-12-17	123456789111	987654321123123123	b.michal@gmail.com	
5	123	123	09412345625	2026-01-01			danielbamb@gmail.com	
2	Asdsddsd	Nowak	90010112345	1990-01-01			jan.nowak@test.pl	asddd
18	asd	asd	09123456781	2026-01-13	111111111	1	\N	2
19	Bartek	Kowalski	09412345611	2026-01-13	123123123	\N	\N	asdfg
\.


--
-- Data for Name: specialties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.specialties (specialty_id, name) FROM stdin;
9	Pediatria
8	Neurologia
13	Neurochirurgia
14	Anastazjologia
7	Kardiologia
\.


--
-- Data for Name: staff_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_accounts (account_id, staff_id, email, password, created_at) FROM stdin;
6	10	ewa.nowak@hospital.com	haslo456	2025-12-07 14:10:18.735559
8	12	anna.lewandowska@hospital.com	haslo321	2025-12-07 14:10:18.735559
9	14	jan.klon@hospital.com	123	2026-01-10 19:55:52.607643
10	13	bart.kowalik@hospital.com	1234	2026-01-10 19:56:54.571284
11	17	##@dasda.com	@#!@#@!#;;;</>	2026-01-14 18:49:21.225375
12	18	asd@gmail.com	123	2026-01-15 21:11:14.795642
15	19	mikolajkoperek@gmail.com	1234	2026-01-16 18:31:31.95699
16	20	janborowczak@gmail.com	123	2026-01-16 18:58:08.48475
17	21	piotrskow@gmail.com	123	2026-01-16 19:00:06.247222
18	22	tomasz@gmail.com	123	2026-01-16 19:00:52.229487
19	24	Rafal@bombel.coma	123	2026-01-16 20:49:50.010553
5	9	adam.kowalski@hospital.coma	haslo123	2025-12-07 14:10:18.735559
7	11	piotr.wisniewski@hospital.com	haslo789	2025-12-07 14:10:18.735559
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, email, password_hash, pesel, name, surname, patient_id) FROM stdin;
1	barti.kowalik@interia.pl	123123123	12312312311	Bartłomiej	Kowalik	\N
2	barti.kowalik@gmail.com	bomba123	83071548295	Bartłomiej	Kowalik	1
4	jan.nowak@test.pl	haslo123	90010112345	Jan	Nowak	2
5	ryszards@gmail.com	haslo123	12345678901	Ryszard	Sowa	\N
6	paulinasob@gmail.com	haslo123	09876543211	Paulina	Sobor	\N
7	connorneo096@gmail.com	bomba	39213344123	Bartosz	Jędrychowski	\N
8	rafelrosz@gmail.com	123	12345609123	Rafał	Rosz	\N
9	barti.kowalik@interia.pls	1234	11111111111	Bartłomiej	Kowalik	\N
10	furiozanigdyniespi@hospital.com	123	12345678564	Michał	Żak	12
12	mrowa@mrowa.pl	123	01234567011	Mrowa	Mrowa	\N
13	josef@gmail.com	123	78945612309	Josef	Josef	15
14	h@testowski.com	123	12309876592	Henry	Testowski	16
3	annar@gmail.com	chalkokot123	85461231254	Anna	Rączka	11
15	rod@gmail.com	123	09128745611	Rodion	Potocki	\N
16	r@mazur.pl	123	12345678912	R	MAzur	7
\.


--
-- Name: department_transfers_transfer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.department_transfers_transfer_id_seq', 12, true);


--
-- Name: diagnostic_parameters_parameter_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diagnostic_parameters_parameter_id_seq', 25, true);


--
-- Name: diagnostics_diagnostic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diagnostics_diagnostic_id_seq', 12, true);


--
-- Name: hospital_departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hospital_departments_department_id_seq', 9, true);


--
-- Name: hospital_staff_staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hospital_staff_staff_id_seq', 24, true);


--
-- Name: hospitalization_staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hospitalization_staff_id_seq', 28, true);


--
-- Name: hospitalizations_hospitalization_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hospitalizations_hospitalization_id_seq', 15, true);


--
-- Name: medical_notes_note_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_notes_note_id_seq', 26, true);


--
-- Name: patient_diagnostic_results_result_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patient_diagnostic_results_result_id_seq', 34, true);


--
-- Name: patient_diagnostics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patient_diagnostics_id_seq', 27, true);


--
-- Name: patients_patient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patients_patient_id_seq', 19, true);


--
-- Name: specialties_specialty_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.specialties_specialty_id_seq', 16, true);


--
-- Name: staff_accounts_account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_accounts_account_id_seq', 19, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 16, true);


--
-- Name: department_transfers department_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department_transfers
    ADD CONSTRAINT department_transfers_pkey PRIMARY KEY (transfer_id);


--
-- Name: diagnostic_parameters diagnostic_parameters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostic_parameters
    ADD CONSTRAINT diagnostic_parameters_pkey PRIMARY KEY (parameter_id);


--
-- Name: diagnostics diagnostics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostics
    ADD CONSTRAINT diagnostics_pkey PRIMARY KEY (diagnostic_id);


--
-- Name: hospital_departments hospital_departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospital_departments
    ADD CONSTRAINT hospital_departments_pkey PRIMARY KEY (department_id);


--
-- Name: hospital_staff hospital_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospital_staff
    ADD CONSTRAINT hospital_staff_pkey PRIMARY KEY (staff_id);


--
-- Name: hospitalization_staff hospitalization_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospitalization_staff
    ADD CONSTRAINT hospitalization_staff_pkey PRIMARY KEY (id);


--
-- Name: hospitalizations hospitalizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospitalizations
    ADD CONSTRAINT hospitalizations_pkey PRIMARY KEY (hospitalization_id);


--
-- Name: medical_notes medical_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_notes
    ADD CONSTRAINT medical_notes_pkey PRIMARY KEY (note_id);


--
-- Name: patient_diagnostic_results patient_diagnostic_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_diagnostic_results
    ADD CONSTRAINT patient_diagnostic_results_pkey PRIMARY KEY (result_id);


--
-- Name: patient_diagnostics patient_diagnostics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_diagnostics
    ADD CONSTRAINT patient_diagnostics_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pesel_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pesel_key UNIQUE (pesel);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (patient_id);


--
-- Name: specialties specialties_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialties
    ADD CONSTRAINT specialties_name_key UNIQUE (name);


--
-- Name: specialties specialties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialties
    ADD CONSTRAINT specialties_pkey PRIMARY KEY (specialty_id);


--
-- Name: staff_accounts staff_accounts_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_accounts
    ADD CONSTRAINT staff_accounts_email_key UNIQUE (email);


--
-- Name: staff_accounts staff_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_accounts
    ADD CONSTRAINT staff_accounts_pkey PRIMARY KEY (account_id);


--
-- Name: staff_accounts staff_accounts_staff_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_accounts
    ADD CONSTRAINT staff_accounts_staff_id_key UNIQUE (staff_id);


--
-- Name: hospital_departments unique_department_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospital_departments
    ADD CONSTRAINT unique_department_name UNIQUE (name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: diagnostic_parameters diagnostic_parameters_diagnostic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostic_parameters
    ADD CONSTRAINT diagnostic_parameters_diagnostic_id_fkey FOREIGN KEY (diagnostic_id) REFERENCES public.diagnostics(diagnostic_id);


--
-- Name: hospitalizations fk_hospitalizations_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospitalizations
    ADD CONSTRAINT fk_hospitalizations_department FOREIGN KEY (admitted_department_id) REFERENCES public.hospital_departments(department_id);


--
-- Name: hospitalizations fk_hospitalizations_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospitalizations
    ADD CONSTRAINT fk_hospitalizations_patient FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- Name: department_transfers fk_transfer_from_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department_transfers
    ADD CONSTRAINT fk_transfer_from_department FOREIGN KEY (from_department_id) REFERENCES public.hospital_departments(department_id);


--
-- Name: department_transfers fk_transfer_hospitalization; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department_transfers
    ADD CONSTRAINT fk_transfer_hospitalization FOREIGN KEY (hospitalization_id) REFERENCES public.hospitalizations(hospitalization_id);


--
-- Name: department_transfers fk_transfer_staff; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department_transfers
    ADD CONSTRAINT fk_transfer_staff FOREIGN KEY (staff_id) REFERENCES public.hospital_staff(staff_id);


--
-- Name: department_transfers fk_transfer_to_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department_transfers
    ADD CONSTRAINT fk_transfer_to_department FOREIGN KEY (to_department_id) REFERENCES public.hospital_departments(department_id);


--
-- Name: hospital_staff hospital_staff_specialty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospital_staff
    ADD CONSTRAINT hospital_staff_specialty_id_fkey FOREIGN KEY (specialty_id) REFERENCES public.specialties(specialty_id);


--
-- Name: hospitalization_staff hospitalization_staff_hospitalization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospitalization_staff
    ADD CONSTRAINT hospitalization_staff_hospitalization_id_fkey FOREIGN KEY (hospitalization_id) REFERENCES public.hospitalizations(hospitalization_id);


--
-- Name: hospitalization_staff hospitalization_staff_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospitalization_staff
    ADD CONSTRAINT hospitalization_staff_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.hospital_staff(staff_id);


--
-- Name: medical_notes medical_notes_hospitalization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_notes
    ADD CONSTRAINT medical_notes_hospitalization_id_fkey FOREIGN KEY (hospitalization_id) REFERENCES public.hospitalizations(hospitalization_id);


--
-- Name: medical_notes medical_notes_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_notes
    ADD CONSTRAINT medical_notes_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.hospital_staff(staff_id);


--
-- Name: patient_diagnostic_results patient_diagnostic_results_parameter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_diagnostic_results
    ADD CONSTRAINT patient_diagnostic_results_parameter_id_fkey FOREIGN KEY (parameter_id) REFERENCES public.diagnostic_parameters(parameter_id);


--
-- Name: patient_diagnostic_results patient_diagnostic_results_patient_diagnostic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_diagnostic_results
    ADD CONSTRAINT patient_diagnostic_results_patient_diagnostic_id_fkey FOREIGN KEY (patient_diagnostic_id) REFERENCES public.patient_diagnostics(id);


--
-- Name: patient_diagnostics patient_diagnostics_diagnostic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_diagnostics
    ADD CONSTRAINT patient_diagnostics_diagnostic_id_fkey FOREIGN KEY (diagnostic_id) REFERENCES public.diagnostics(diagnostic_id);


--
-- Name: patient_diagnostics patient_diagnostics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_diagnostics
    ADD CONSTRAINT patient_diagnostics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: staff_accounts staff_accounts_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_accounts
    ADD CONSTRAINT staff_accounts_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.hospital_staff(staff_id);


--
-- Name: users users_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);


--
-- PostgreSQL database dump complete
--

\unrestrict GOFlcnNZ4eUBe1icFqQ2SKEiLhoItRlL3CGLkvpdxUAZi4dxVrxSyL1JMONsjzU

