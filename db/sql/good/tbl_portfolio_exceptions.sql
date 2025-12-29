-- Table: public.portfolio_exceptions

-- DROP TABLE IF EXISTS public.portfolio_exceptions;

CREATE TABLE IF NOT EXISTS public.portfolio_exceptions
(
    exception_id bigint NOT NULL DEFAULT nextval('portfolio_exceptions_exception_id_seq'::regclass),
    run_id text COLLATE pg_catalog."default" NOT NULL,
    rule_id character varying(100) COLLATE pg_catalog."default" NOT NULL,
    exception_type character varying(50) COLLATE pg_catalog."default" NOT NULL,
    platform character varying(20) COLLATE pg_catalog."default",
    expected_value numeric(18,6),
    actual_value numeric(18,6),
    difference numeric(18,6),
    balance_impact numeric(18,2),
    severity character varying(20) COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT portfolio_exceptions_pkey PRIMARY KEY (exception_id),
    CONSTRAINT portfolio_exceptions_run_id_fkey FOREIGN KEY (run_id)
        REFERENCES public.loan_run (run_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.portfolio_exceptions
    OWNER to postgres;