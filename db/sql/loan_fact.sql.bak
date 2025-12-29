CREATE TABLE loan_fact (
    run_id                UUID NOT NULL,
    seller_loan_no        VARCHAR(50) NOT NULL,
    platform              VARCHAR(20) NOT NULL,   -- prime / sfy / notes
    loan_program          VARCHAR(200),
    application_type      VARCHAR(50),

    -- Core attributes
    orig_balance          NUMERIC(18,2),
    purchase_price        NUMERIC(18,2),
    current_balance       NUMERIC(18,2),
    lender_price_pct      NUMERIC(6,3),
    modeled_purchase_price NUMERIC(18,6),

    -- Credit attributes
    fico_borrower         INT,
    dti                   NUMERIC(6,3),
    pti                   NUMERIC(6,3),
    apr                   NUMERIC(6,3),

    -- Loan structure
    term                  INT,
    loan_type             VARCHAR(50),   -- standard / hybrid / ninp / wpdi / etc
    promo_term            INT,

    -- Dates
    submit_date           DATE,
    purchase_date         DATE,
    monthly_payment_date  DATE,

    -- Flags
    repurchase            BOOLEAN DEFAULT FALSE,
    excess_asset          BOOLEAN DEFAULT FALSE,
    borrowing_base_eligible BOOLEAN DEFAULT TRUE,

    created_at            TIMESTAMP WITH TIME ZONE DEFAULT now(),

    PRIMARY KEY (run_id, seller_loan_no),
    FOREIGN KEY (run_id) REFERENCES loan_run(run_id)
);


CREATE INDEX idx_loan_fact_run ON loan_fact(run_id);
CREATE INDEX idx_loan_fact_platform ON loan_fact(platform);
CREATE INDEX idx_loan_fact_program ON loan_fact(loan_program);
CREATE INDEX idx_loan_fact_fico ON loan_fact(fico_borrower);


