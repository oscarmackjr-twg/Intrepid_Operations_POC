CREATE TABLE portfolio_exceptions (
    exception_id     BIGSERIAL PRIMARY KEY,
    run_id           UUID NOT NULL,
    rule_id          VARCHAR(100) NOT NULL,
    exception_type   VARCHAR(50) NOT NULL, -- ELIGIBILITY_RATIO
    platform         VARCHAR(20),

    expected_value   NUMERIC(18,6),
    actual_value     NUMERIC(18,6),
    difference       NUMERIC(18,6),
    balance_impact  NUMERIC(18,2),

    severity         VARCHAR(20),
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),

    FOREIGN KEY (run_id) REFERENCES loan_run(run_id)
);
