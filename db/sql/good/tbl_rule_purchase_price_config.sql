-- Table: public.rule_purchase_price_config

-- DROP TABLE IF EXISTS public.rule_purchase_price_config;

CREATE TABLE IF NOT EXISTS public.rule_purchase_price_config
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    enabled boolean NOT NULL DEFAULT true,
    effective_start_date date,
    effective_end_date date,
    tolerance_bps numeric(10,2),
    lender_price_min_bps numeric(10,2),
    lender_price_max_bps numeric(10,2),
    rule_name text COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    rule_id text COLLATE pg_catalog."default" NOT NULL,
    severity text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT rule_purchase_price_config_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.rule_purchase_price_config
    OWNER to postgres;
-- Index: idx_rule_ppc_effective_dates

-- DROP INDEX IF EXISTS public.idx_rule_ppc_effective_dates;

CREATE INDEX IF NOT EXISTS idx_rule_ppc_effective_dates
    ON public.rule_purchase_price_config USING btree
    (effective_start_date ASC NULLS LAST, effective_end_date ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
-- Index: idx_rule_ppc_enabled

-- DROP INDEX IF EXISTS public.idx_rule_ppc_enabled;

CREATE INDEX IF NOT EXISTS idx_rule_ppc_enabled
    ON public.rule_purchase_price_config USING btree
    (enabled ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;