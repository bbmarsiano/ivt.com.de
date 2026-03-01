--
-- PostgreSQL database dump
--

\restrict xN3auzCZSnVACVvD90Y5gsEtHoT7gkEvanGcLRJIVKlQCZ0e9l8zOajrOPevzh4

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.20 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: directus_collections; Type: TABLE; Schema: public; Owner: dimitarmitrev
--

CREATE TABLE public.directus_collections (
    collection character varying(64) NOT NULL,
    icon character varying(64),
    note text,
    display_template character varying(255),
    hidden boolean DEFAULT false NOT NULL,
    singleton boolean DEFAULT false NOT NULL,
    translations json,
    archive_field character varying(64),
    archive_app_filter boolean DEFAULT true NOT NULL,
    archive_value character varying(255),
    unarchive_value character varying(255),
    sort_field character varying(64),
    accountability character varying(255) DEFAULT 'all'::character varying,
    color character varying(255),
    item_duplication_fields json,
    sort integer,
    "group" character varying(64),
    collapse character varying(255) DEFAULT 'open'::character varying NOT NULL,
    preview_url character varying(255),
    versioning boolean DEFAULT false NOT NULL
);


ALTER TABLE public.directus_collections OWNER TO dimitarmitrev;

--
-- Name: directus_fields; Type: TABLE; Schema: public; Owner: dimitarmitrev
--

CREATE TABLE public.directus_fields (
    id integer NOT NULL,
    collection character varying(64) NOT NULL,
    field character varying(64) NOT NULL,
    special character varying(64),
    interface character varying(64),
    options json,
    display character varying(64),
    display_options json,
    readonly boolean DEFAULT false NOT NULL,
    hidden boolean DEFAULT false NOT NULL,
    sort integer,
    width character varying(30) DEFAULT 'full'::character varying,
    translations json,
    note text,
    conditions json,
    required boolean DEFAULT false,
    "group" character varying(64),
    validation json,
    validation_message text,
    searchable boolean DEFAULT true NOT NULL
);


ALTER TABLE public.directus_fields OWNER TO dimitarmitrev;

--
-- Name: directus_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: dimitarmitrev
--

CREATE SEQUENCE public.directus_fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.directus_fields_id_seq OWNER TO dimitarmitrev;

--
-- Name: directus_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dimitarmitrev
--

ALTER SEQUENCE public.directus_fields_id_seq OWNED BY public.directus_fields.id;


--
-- Name: directus_flows; Type: TABLE; Schema: public; Owner: dimitarmitrev
--

CREATE TABLE public.directus_flows (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    icon character varying(64),
    color character varying(255),
    description text,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    trigger character varying(255),
    accountability character varying(255) DEFAULT 'all'::character varying,
    options json,
    operation uuid,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid
);


ALTER TABLE public.directus_flows OWNER TO dimitarmitrev;

--
-- Name: directus_operations; Type: TABLE; Schema: public; Owner: dimitarmitrev
--

CREATE TABLE public.directus_operations (
    id uuid NOT NULL,
    name character varying(255),
    key character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    position_x integer NOT NULL,
    position_y integer NOT NULL,
    options json,
    resolve uuid,
    reject uuid,
    flow uuid NOT NULL,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid
);


ALTER TABLE public.directus_operations OWNER TO dimitarmitrev;

--
-- Name: directus_relations; Type: TABLE; Schema: public; Owner: dimitarmitrev
--

CREATE TABLE public.directus_relations (
    id integer NOT NULL,
    many_collection character varying(64) NOT NULL,
    many_field character varying(64) NOT NULL,
    one_collection character varying(64),
    one_field character varying(64),
    one_collection_field character varying(64),
    one_allowed_collections text,
    junction_field character varying(64),
    sort_field character varying(64),
    one_deselect_action character varying(255) DEFAULT 'nullify'::character varying NOT NULL
);


ALTER TABLE public.directus_relations OWNER TO dimitarmitrev;

--
-- Name: directus_relations_id_seq; Type: SEQUENCE; Schema: public; Owner: dimitarmitrev
--

CREATE SEQUENCE public.directus_relations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.directus_relations_id_seq OWNER TO dimitarmitrev;

--
-- Name: directus_relations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dimitarmitrev
--

ALTER SEQUENCE public.directus_relations_id_seq OWNED BY public.directus_relations.id;


--
-- Name: resources_projects; Type: TABLE; Schema: public; Owner: dimitarmitrev
--

CREATE TABLE public.resources_projects (
    resource_id uuid NOT NULL,
    project_id uuid NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.resources_projects OWNER TO dimitarmitrev;

--
-- Name: directus_fields id; Type: DEFAULT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.directus_fields ALTER COLUMN id SET DEFAULT nextval('public.directus_fields_id_seq'::regclass);


--
-- Name: directus_relations id; Type: DEFAULT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.directus_relations ALTER COLUMN id SET DEFAULT nextval('public.directus_relations_id_seq'::regclass);


--
-- Data for Name: directus_collections; Type: TABLE DATA; Schema: public; Owner: dimitarmitrev
--

COPY public.directus_collections (collection, icon, note, display_template, hidden, singleton, translations, archive_field, archive_app_filter, archive_value, unarchive_value, sort_field, accountability, color, item_duplication_fields, sort, "group", collapse, preview_url, versioning) FROM stdin;
projects	\N	\N	\N	f	f	\N	\N	t	\N	\N	\N	all	\N	\N	\N	\N	open	\N	f
events	\N	\N	\N	f	f	\N	\N	t	\N	\N	\N	all	\N	\N	\N	\N	open	\N	f
news	\N	\N	\N	f	f	\N	\N	t	\N	\N	\N	all	\N	\N	\N	\N	open	\N	f
testimonials	\N	\N	\N	f	f	\N	\N	t	\N	\N	\N	all	\N	\N	\N	\N	open	\N	f
partners	\N	\N	\N	f	f	\N	\N	t	\N	\N	\N	all	\N	\N	\N	\N	open	\N	f
team	groups	Team members (CMS)	{{first_name}} {{last_name}}	f	f	\N	\N	t	\N	\N	\N	all	\N	\N	50	\N	open	\N	f
about	info	About section (CMS)	\N	f	t	\N	\N	t	\N	\N	\N	all	\N	\N	40	\N	open	\N	f
resources_projects	link	Junction: resources ↔ projects	\N	t	f	\N	\N	t	\N	\N	\N	all	\N	\N	\N	\N	open	\N	f
resources_categories	label	Junction: resources ↔ categories	\N	t	f	\N	\N	t	\N	\N	\N	all	\N	\N	\N	\N	open	\N	f
resources	\N	\N	\N	f	f	\N	\N	t	\N	\N	\N	all	\N	\N	\N	\N	open	\N	f
\.


--
-- Data for Name: directus_fields; Type: TABLE DATA; Schema: public; Owner: dimitarmitrev
--

COPY public.directus_fields (id, collection, field, special, interface, options, display, display_options, readonly, hidden, sort, width, translations, note, conditions, required, "group", validation, validation_message, searchable) FROM stdin;
65	projects	id	uuid	input	\N	\N	\N	t	t	1	full	\N	\N	\N	f	\N	\N	\N	t
66	events	id	uuid	input	\N	\N	\N	t	t	1	full	\N	\N	\N	f	\N	\N	\N	t
67	news	id	uuid	input	\N	\N	\N	t	t	1	full	\N	\N	\N	f	\N	\N	\N	t
68	testimonials	id	uuid	input	\N	\N	\N	t	t	1	full	\N	\N	\N	f	\N	\N	\N	t
69	partners	id	uuid	input	\N	\N	\N	t	t	1	full	\N	\N	\N	f	\N	\N	\N	t
70	partners	logo_file	file	file-image	\N	\N	\N	f	f	2	full	\N	\N	\N	f	\N	\N	\N	t
72	about	hero_image_file	file	file-image	\N	file	{"crop":true}	f	f	10	full	\N	\N	\N	f	\N	\N	\N	t
73	team	avatar_file	file	file-image	\N	file	{"crop":true}	f	f	50	half	\N	\N	\N	f	\N	\N	\N	t
74	resources	categories	m2m	list-m2m	\N	\N	\N	f	f	50	full	\N	M2M: resources ↔ resource_categories	\N	f	\N	\N	\N	t
75	projects	resources	m2m	list-m2m	\N	\N	\N	f	f	80	full	\N	M2M: projects ↔ resources	\N	f	\N	\N	\N	t
77	resource_categories	resources	m2m	list-m2m	\N	\N	\N	f	f	50	full	\N	M2M: resource_categories ↔ resources	\N	f	\N	\N	\N	t
76	resources	file_id	file	file	{"folder":null}	file	\N	f	f	\N	full	\N	Upload file OR set external URL. Prefer file for PDFs.	\N	f	\N	\N	\N	t
78	resources	external_url	\N	input	{"type":"url","placeholder":"https://example.com/resource.pdf"}	raw	\N	f	f	\N	full	\N	Used when no file upload is attached.	\N	f	\N	\N	\N	t
79	resources_projects	resource_id	uuid	\N	\N	\N	\N	f	f	\N	full	\N	\N	\N	f	\N	\N	\N	t
80	resources_projects	project_id	uuid	\N	\N	\N	\N	f	f	\N	full	\N	\N	\N	f	\N	\N	\N	t
\.


--
-- Data for Name: directus_flows; Type: TABLE DATA; Schema: public; Owner: dimitarmitrev
--

COPY public.directus_flows (id, name, icon, color, description, status, trigger, accountability, options, operation, date_created, user_created) FROM stdin;
\.


--
-- Data for Name: directus_operations; Type: TABLE DATA; Schema: public; Owner: dimitarmitrev
--

COPY public.directus_operations (id, name, key, type, position_x, position_y, options, resolve, reject, flow, date_created, user_created) FROM stdin;
\.


--
-- Data for Name: directus_relations; Type: TABLE DATA; Schema: public; Owner: dimitarmitrev
--

COPY public.directus_relations (id, many_collection, many_field, one_collection, one_field, one_collection_field, one_allowed_collections, junction_field, sort_field, one_deselect_action) FROM stdin;
1	partners	logo_file	directus_files	\N	\N	\N	\N	\N	nullify
5	resources_projects	project_id	projects	resources	\N	\N	resource_id	\N	nullify
4	resources_categories	resource_id	resources	categories	\N	\N	category_id	\N	nullify
7	resources_categories	category_id	resource_categories	resources	\N	\N	resource_id	\N	nullify
\.


--
-- Data for Name: resources_projects; Type: TABLE DATA; Schema: public; Owner: dimitarmitrev
--

COPY public.resources_projects (resource_id, project_id, id) FROM stdin;
3a1915e8-df08-4d24-a73a-33dfa454098c	454b5ef4-a009-44e2-9936-c99c97771858	5a48601b-e714-43e4-b9d7-c1525004c7f0
7bf68ee4-a1a0-491e-afd0-ec584d2f4549	74059328-9d67-4a5a-9419-5eb26d4d8464	88c83cc1-375c-4dfe-8894-5e701068d3a2
7bf68ee4-a1a0-491e-afd0-ec584d2f4549	1c9241ab-54a0-48a2-8060-54eced4cb41b	551c3768-8dbe-4992-8f82-2cef9e75c047
eb410420-93a5-4a35-97a4-a5ac38808e97	99f910e9-aab0-45a9-ab45-26a217d4e3f8	bd163214-a3a9-40cd-830d-c09a7789b473
1a4daed1-91f4-4672-a00b-f5c08e877cd6	1c9241ab-54a0-48a2-8060-54eced4cb41b	539ce719-f5a4-4023-9ca9-8f7fe5056b70
\.


--
-- Name: directus_fields_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dimitarmitrev
--

SELECT pg_catalog.setval('public.directus_fields_id_seq', 80, true);


--
-- Name: directus_relations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dimitarmitrev
--

SELECT pg_catalog.setval('public.directus_relations_id_seq', 7, true);


--
-- Name: directus_collections directus_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.directus_collections
    ADD CONSTRAINT directus_collections_pkey PRIMARY KEY (collection);


--
-- Name: directus_fields directus_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.directus_fields
    ADD CONSTRAINT directus_fields_pkey PRIMARY KEY (id);


--
-- Name: directus_flows directus_flows_operation_unique; Type: CONSTRAINT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.directus_flows
    ADD CONSTRAINT directus_flows_operation_unique UNIQUE (operation);


--
-- Name: directus_flows directus_flows_pkey; Type: CONSTRAINT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.directus_flows
    ADD CONSTRAINT directus_flows_pkey PRIMARY KEY (id);


--
-- Name: directus_operations directus_operations_pkey; Type: CONSTRAINT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_pkey PRIMARY KEY (id);


--
-- Name: directus_operations directus_operations_reject_unique; Type: CONSTRAINT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_reject_unique UNIQUE (reject);


--
-- Name: directus_operations directus_operations_resolve_unique; Type: CONSTRAINT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_resolve_unique UNIQUE (resolve);


--
-- Name: directus_relations directus_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.directus_relations
    ADD CONSTRAINT directus_relations_pkey PRIMARY KEY (id);


--
-- Name: resources_projects resources_projects_pair_unique; Type: CONSTRAINT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.resources_projects
    ADD CONSTRAINT resources_projects_pair_unique UNIQUE (resource_id, project_id);


--
-- Name: resources_projects resources_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.resources_projects
    ADD CONSTRAINT resources_projects_pkey PRIMARY KEY (id);


--
-- Name: directus_relations_many_unique; Type: INDEX; Schema: public; Owner: dimitarmitrev
--

CREATE UNIQUE INDEX directus_relations_many_unique ON public.directus_relations USING btree (many_collection, many_field);


--
-- Name: idx_resources_projects_project_id; Type: INDEX; Schema: public; Owner: dimitarmitrev
--

CREATE INDEX idx_resources_projects_project_id ON public.resources_projects USING btree (project_id);


--
-- Name: idx_resources_projects_resource_id; Type: INDEX; Schema: public; Owner: dimitarmitrev
--

CREATE INDEX idx_resources_projects_resource_id ON public.resources_projects USING btree (resource_id);


--
-- Name: directus_collections directus_collections_group_foreign; Type: FK CONSTRAINT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.directus_collections
    ADD CONSTRAINT directus_collections_group_foreign FOREIGN KEY ("group") REFERENCES public.directus_collections(collection);


--
-- Name: directus_flows directus_flows_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.directus_flows
    ADD CONSTRAINT directus_flows_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_operations directus_operations_flow_foreign; Type: FK CONSTRAINT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_flow_foreign FOREIGN KEY (flow) REFERENCES public.directus_flows(id) ON DELETE CASCADE;


--
-- Name: directus_operations directus_operations_reject_foreign; Type: FK CONSTRAINT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_reject_foreign FOREIGN KEY (reject) REFERENCES public.directus_operations(id);


--
-- Name: directus_operations directus_operations_resolve_foreign; Type: FK CONSTRAINT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_resolve_foreign FOREIGN KEY (resolve) REFERENCES public.directus_operations(id);


--
-- Name: directus_operations directus_operations_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: resources_projects resources_projects_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.resources_projects
    ADD CONSTRAINT resources_projects_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: resources_projects resources_projects_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dimitarmitrev
--

ALTER TABLE ONLY public.resources_projects
    ADD CONSTRAINT resources_projects_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict xN3auzCZSnVACVvD90Y5gsEtHoT7gkEvanGcLRJIVKlQCZ0e9l8zOajrOPevzh4

