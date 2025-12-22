CREATE TABLE rule_master (
    rule_id        VARCHAR PRIMARY KEY,
    rule_name      VARCHAR,
    rule_category  VARCHAR,   -- PURCHASE_PRICE, UNDERWRITING, COMAP, ELIGIBILITY
    enabled        BOOLEAN,
    severity       VARCHAR
);
