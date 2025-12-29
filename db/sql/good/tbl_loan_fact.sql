-- Table: public.loan_fact

-- DROP TABLE IF EXISTS public.loan_fact;

CREATE TABLE IF NOT EXISTS public.loan_fact
(
    id bigint NOT NULL DEFAULT nextval('loan_fact_id_seq'::regclass),
    run_id text COLLATE pg_catalog."default" NOT NULL,
    seller_loan_no text COLLATE pg_catalog."default" NOT NULL,
    original_balance numeric(18,2),
    current_balance numeric(18,2),
    purchase_price numeric(18,2),
    price_pct numeric(9,4),
    has_exceptions boolean DEFAULT false,
    status text COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT loan_fact_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.loan_fact
    OWNER to postgres;
-- Index: idx_loan_fact_run_id

-- DROP INDEX IF EXISTS public.idx_loan_fact_run_id;

CREATE INDEX IF NOT EXISTS idx_loan_fact_run_id
    ON public.loan_fact USING btree
    (run_id COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
-- Index: idx_loan_fact_run_loan

-- DROP INDEX IF EXISTS public.idx_loan_fact_run_loan;

CREATE INDEX IF NOT EXISTS idx_loan_fact_run_loan
    ON public.loan_fact USING btree
    (run_id COLLATE pg_catalog."default" ASC NULLS LAST, seller_loan_no COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;