-- Table: public.loan_exceptions

-- DROP TABLE IF EXISTS public.loan_exceptions;

CREATE TABLE IF NOT EXISTS public.loan_exceptions
(
    exception_id bigint NOT NULL DEFAULT nextval('loan_exceptions_id_seq'::regclass),
    run_id text COLLATE pg_catalog."default" NOT NULL,
    seller_loan_no text COLLATE pg_catalog."default" NOT NULL,
    rule_id text COLLATE pg_catalog."default",
    exception_type text COLLATE pg_catalog."default" NOT NULL,
    severity text COLLATE pg_catalog."default",
    message text COLLATE pg_catalog."default",
    metric_name text COLLATE pg_catalog."default",
    expected_value numeric(18,6),
    actual_value numeric(18,6),
    balance_impact numeric(18,6),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    difference numeric(18,6),
    original_balance numeric(18,2),
    purchase_price numeric(18,2),
    CONSTRAINT loan_exceptions_pkey PRIMARY KEY (exception_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.loan_exceptions
    OWNER to postgres;
-- Index: idx_loan_exceptions_rule_type

-- DROP INDEX IF EXISTS public.idx_loan_exceptions_rule_type;

CREATE INDEX IF NOT EXISTS idx_loan_exceptions_rule_type
    ON public.loan_exceptions USING btree
    (exception_type COLLATE pg_catalog."default" ASC NULLS LAST, rule_id COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
-- Index: idx_loan_exceptions_run_id

-- DROP INDEX IF EXISTS public.idx_loan_exceptions_run_id;

CREATE INDEX IF NOT EXISTS idx_loan_exceptions_run_id
    ON public.loan_exceptions USING btree
    (run_id COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
-- Index: idx_loan_exceptions_run_loan

-- DROP INDEX IF EXISTS public.idx_loan_exceptions_run_loan;

CREATE INDEX IF NOT EXISTS idx_loan_exceptions_run_loan
    ON public.loan_exceptions USING btree
    (run_id COLLATE pg_catalog."default" ASC NULLS LAST, seller_loan_no COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;