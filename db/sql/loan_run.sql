CREATE TABLE loan_run (
    run_id            UUID PRIMARY KEY,
    as_of_date        DATE NOT NULL,
    irr_target        NUMERIC(6,3),
    portfolio         VARCHAR(20),      -- SFY / PRIME / ALL
    status            VARCHAR(20) NOT NULL, -- PENDING / RUNNING / COMPLETED / FAILED
    requested_by      VARCHAR(100),
    started_at        TIMESTAMP WITH TIME ZONE,
    completed_at      TIMESTAMP WITH TIME ZONE,
    error_message     TEXT,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT now()
);


CREATE INDEX idx_loan_run_asof ON loan_run(as_of_date);
CREATE INDEX idx_loan_run_status ON loan_run(status);
