-- Table: public.loan_run

-- DROP TABLE IF EXISTS public.loan_run;

CREATE TABLE IF NOT EXISTS public.loan_run
(
    id bigint NOT NULL DEFAULT nextval('loan_run_id_seq'::regclass),
    run_id text COLLATE pg_catalog."default" NOT NULL,
    as_of_date date NOT NULL,
    status text COLLATE pg_catalog."default" NOT NULL,
    irr_target numeric(9,4),
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    portfolio text COLLATE pg_catalog."default",
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    CONSTRAINT loan_run_pkey PRIMARY KEY (id),
    CONSTRAINT loan_run_run_id_key UNIQUE (run_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.loan_run
    OWNER to postgres;
-- Index: idx_loan_run_run_id

-- DROP INDEX IF EXISTS public.idx_loan_run_run_id;

CREATE INDEX IF NOT EXISTS idx_loan_run_run_id
    ON public.loan_run USING btree
    (run_id COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;