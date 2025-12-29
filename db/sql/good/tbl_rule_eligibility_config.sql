-- Table: public.rule_eligibility_config

-- DROP TABLE IF EXISTS public.rule_eligibility_config;

CREATE TABLE IF NOT EXISTS public.rule_eligibility_config
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    rule_id text COLLATE pg_catalog."default" NOT NULL,
    rule_name text COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    enabled boolean NOT NULL DEFAULT true,
    effective_start_date date,
    effective_end_date date,
    severity text COLLATE pg_catalog."default",
    metric_name text COLLATE pg_catalog."default" NOT NULL,
    comparison_operator text COLLATE pg_catalog."default" NOT NULL,
    threshold_value numeric(18,6),
    min_value numeric(18,6),
    max_value numeric(18,6),
    message_template text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT rule_eligibility_config_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.rule_eligibility_config
    OWNER to postgres;
-- Index: idx_rule_elig_effective_dates

-- DROP INDEX IF EXISTS public.idx_rule_elig_effective_dates;

CREATE INDEX IF NOT EXISTS idx_rule_elig_effective_dates
    ON public.rule_eligibility_config USING btree
    (enabled ASC NULLS LAST, effective_start_date ASC NULLS LAST, effective_end_date ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
-- Index: idx_rule_elig_rule_id

-- DROP INDEX IF EXISTS public.idx_rule_elig_rule_id;

CREATE INDEX IF NOT EXISTS idx_rule_elig_rule_id
    ON public.rule_eligibility_config USING btree
    (rule_id COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;