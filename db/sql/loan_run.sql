DROP TABLE IF EXISTS loan_run CASCADE;

CREATE TABLE loan_run (
    id          BIGSERIAL PRIMARY KEY,
    run_id      TEXT NOT NULL UNIQUE,   -- was UUID, now TEXT (e.g. 'TEST_RUN_001')

    as_of_date  DATE NOT NULL,
    status      TEXT NOT NULL,          -- e.g. 'PENDING', 'COMPLETED', 'FAILED'
    irr_target  NUMERIC(9,4),           -- 8.0500 etc.

    notes       TEXT,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_loan_run_run_id ON loan_run(run_id);
