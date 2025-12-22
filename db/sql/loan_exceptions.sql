CREATE TABLE loan_exceptions (
    exception_id      BIGSERIAL PRIMARY KEY,
    run_id            UUID NOT NULL,
    seller_loan_no    VARCHAR(50) NOT NULL,

    rule_id           VARCHAR(100) NOT NULL,
    exception_type    VARCHAR(50) NOT NULL, -- PURCHASE_PRICE / COMAP / UNDERWRITING
    severity          VARCHAR(20),           -- HIGH / MEDIUM / LOW

    expected_value    VARCHAR(100),
    actual_value      VARCHAR(100),
    difference        NUMERIC(18,6),

    balance_impact    NUMERIC(18,2),

    created_at        TIMESTAMP WITH TIME ZONE DEFAULT now(),

    FOREIGN KEY (run_id, seller_loan_no)
        REFERENCES loan_fact(run_id, seller_loan_no)
);


CREATE INDEX idx_loan_exc_run ON loan_exceptions(run_id);
CREATE INDEX idx_loan_exc_rule ON loan_exceptions(rule_id);
CREATE INDEX idx_loan_exc_type ON loan_exceptions(exception_type);
CREATE INDEX idx_loan_exc_severity ON loan_exceptions(severity);
