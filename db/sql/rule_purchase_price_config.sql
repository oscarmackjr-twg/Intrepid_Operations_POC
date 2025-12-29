
DROP TABLE IF EXISTS rule_purchase_price_config ;

CREATE TABLE rule_purchase_price_config (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- enable/disable this rule row
    enabled             BOOLEAN NOT NULL DEFAULT TRUE,

    -- effective dating for selecting the active rule
    effective_start_date DATE,
    effective_end_date   DATE,

    -- tolerance in basis points for purchase price comparisons
    tolerance_bps        NUMERIC(10, 2),

    -- optional min/max lender price bands in bps
    lender_price_min_bps NUMERIC(10, 2),
    lender_price_max_bps NUMERIC(10, 2),

    -- optional description / version info
    rule_name            TEXT,
    notes                TEXT,

    created_at           TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at           TIMESTAMP WITH TIME ZONE DEFAULT now()
);


CREATE INDEX idx_rule_ppc_enabled
    ON rule_purchase_price_config (enabled);

CREATE INDEX idx_rule_ppc_effective_dates
    ON rule_purchase_price_config (effective_start_date, effective_end_date);


INSERT INTO rule_purchase_price_config (
    enabled,
    effective_start_date,
    tolerance_bps,
    lender_price_min_bps,
    lender_price_max_bps,
    rule_name,
    notes
) VALUES (
    TRUE,
    CURRENT_DATE,
    50,      -- 50 bps tolerance
    NULL,
    NULL,
    'Default Purchase Price Rule',
    'Inserted for initial pipeline testing'
);
