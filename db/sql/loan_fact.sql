DROP TABLE IF EXISTS loan_fact CASCADE;

CREATE TABLE loan_fact (
    id               BIGSERIAL PRIMARY KEY,

    -- join back to run
    run_id           TEXT NOT NULL,          -- was UUID, now TEXT
    seller_loan_no   TEXT NOT NULL,

    -- core balances / pricing
    original_balance NUMERIC(18,2),
    current_balance  NUMERIC(18,2),
    purchase_price   NUMERIC(18,2),
    price_pct        NUMERIC(9,4),          -- purchase_price / original_balance * 100

    -- flags / metrics
    has_exceptions   BOOLEAN DEFAULT FALSE,
    status           TEXT,                  -- optional loan status for the run

    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_loan_fact_run_id
    ON loan_fact(run_id);

CREATE INDEX idx_loan_fact_run_loan
    ON loan_fact(run_id, seller_loan_no);
