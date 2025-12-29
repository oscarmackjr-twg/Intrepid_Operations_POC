-- Table: public.rule_master

-- DROP TABLE IF EXISTS public.rule_master;

CREATE TABLE IF NOT EXISTS public.rule_master
(
    rule_id character varying COLLATE pg_catalog."default" NOT NULL,
    rule_name character varying COLLATE pg_catalog."default",
    rule_category character varying COLLATE pg_catalog."default",
    enabled boolean,
    severity character varying COLLATE pg_catalog."default",
    CONSTRAINT rule_master_pkey PRIMARY KEY (rule_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.rule_master
    OWNER to postgres;