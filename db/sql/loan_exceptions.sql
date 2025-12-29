DROP TABLE IF EXISTS loan_exceptions CASCADE;

CREATE TABLE loan_exceptions (
    id               BIGSERIAL PRIMARY KEY,

    -- run / loan identity
    run_id           TEXT NOT NULL,          -- was UUID, now TEXT
    seller_loan_no   TEXT NOT NULL,

    -- rule metadata
    rule_id          TEXT,                   -- e.g. 'PURCHASE_PRICE', 'ELIGIBILITY_DEFAULT'
    exception_type   TEXT NOT NULL,          -- high-level type, e.g. 'PURCHASE_PRICE'

    severity         TEXT,                   -- 'ERROR', 'WARN', etc.  (nullable now)
    message          TEXT,                   -- human-readable message (nullable for now)
    metric_name      TEXT,                   -- optional: which metric was tested

    -- expected vs actual values
    expected_value   NUMERIC(18,6),
    actual_value     NUMERIC(18,6),
    balance_impact   NUMERIC(18,6),          -- optional; per-loan impact if you compute it

    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- purchase-price specific fields that your pipeline is writing
    difference       NUMERIC(18,6),          -- delta in bps/percent vs expectation
    original_balance NUMERIC(18,2),
    purchase_price   NUMERIC(18,2)
);

CREATE INDEX idx_loan_exceptions_run_id
    ON loan_exceptions(run_id);

CREATE INDEX idx_loan_exceptions_run_loan
    ON loan_exceptions(run_id, seller_loan_no);

CREATE INDEX idx_loan_exceptions_rule_type
    ON loan_exceptions(exception_type, rule_id);
