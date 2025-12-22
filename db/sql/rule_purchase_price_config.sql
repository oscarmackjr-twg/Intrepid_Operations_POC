CREATE TABLE rule_purchase_price_config (
    rule_id              VARCHAR PRIMARY KEY,
    tolerance_bps        INT NOT NULL,          -- e.g. 5 = 0.05%
    severity             VARCHAR NOT NULL,      -- HIGH / MEDIUM / LOW
    enabled              BOOLEAN DEFAULT TRUE,
    effective_start_date DATE,
    effective_end_date   DATE
);



### Sample Data

INSERT INTO rule_purchase_price_config
(rule_id, tolerance_bps, severity, enabled)
VALUES
('PURCHASE_PRICE_MATCH', 0, 'HIGH', TRUE);
