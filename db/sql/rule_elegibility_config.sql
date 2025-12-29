CREATE TABLE rule_eligibility_config (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- metadata
    rule_id                 TEXT NOT NULL,
    rule_name               TEXT,
    description             TEXT,

    -- enable/disable row
    enabled                 BOOLEAN NOT NULL DEFAULT TRUE,

    -- effective dating for selecting current rules
    effective_start_date    DATE,
    effective_end_date      DATE,

    -- severity of violation
    severity                TEXT,   -- e.g., ERROR, WARNING, INFO

    -- metric configuration
    metric_name             TEXT NOT NULL,      -- what metric we’re testing
    comparison_operator     TEXT NOT NULL,      -- e.g., <, <=, >, >=, ==, !=
    threshold_value         NUMERIC(18,6),      -- value to compare against

    -- optional banded thresholds
    min_value               NUMERIC(18,6),
    max_value               NUMERIC(18,6),

    -- human-readable output
    message_template        TEXT,

    -- audit fields
    created_at              TIMESTAMPTZ DEFAULT now(),
    updated_at              TIMESTAMPTZ DEFAULT now()
);


CREATE INDEX idx_rule_elig_effective_dates
    ON rule_eligibility_config (enabled, effective_start_date, effective_end_date);

CREATE INDEX idx_rule_elig_rule_id
    ON rule_eligibility_config (rule_id);


INSERT INTO rule_eligibility_config (
    rule_id,
    rule_name,
    description,
    enabled,
    effective_start_date,
    severity,
    metric_name,
    comparison_operator,
    threshold_value,
    message_template
) VALUES (
    'ELIGIBILITY_DEFAULT',
    'Default Eligibility Rule',
    'Placeholder rule inserted for pipeline testing',
    TRUE,
    CURRENT_DATE,
    'ERROR',
    'DUMMY_METRIC',
    '>=',
    0,
    'Default eligibility rule triggered'
);


