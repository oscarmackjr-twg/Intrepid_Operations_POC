CREATE TABLE rule_eligibility_config (
    rule_id           VARCHAR PRIMARY KEY,
    platform           VARCHAR,     -- PRIME / SFY
    loan_type          VARCHAR,     -- standard, hybrid, ninp, etc
    max_term           INT,
    min_term           INT,
    fico_threshold     INT,
    max_ratio          DECIMAL(5,4), -- e.g. 0.1500 = 15%
    balance_column     VARCHAR,     -- Orig. Balance / Purchase Price
    enabled            BOOLEAN,
    severity           VARCHAR
);


###   Prime Check A

INSERT INTO rule_eligibility_config VALUES (
  'PRIME_STD_FICO_LT_700_TERM_LE_144',
  'prime',
  'standard',
  NULL,
  144,
  700,
  0.1500,
  'Orig. Balance',
  TRUE,
  'HIGH'
);



## Prime Large Balance Concentration

INSERT INTO rule_eligibility_config VALUES (
  'PRIME_BAL_GT_50000',
  'prime',
  NULL,
  NULL,
  NULL,
  NULL,
  0.2000,
  'Orig. Balance',
  TRUE,
  'MEDIUM'
);


### SFY - Hybrid Concentratio
INSERT INTO rule_eligibility_config VALUES (
  'SFY_HYBRID_RATIO',
  'sfy',
  'hybrid',
  NULL,
  NULL,
  NULL,
  0.3000,
  'Orig. Balance',
  TRUE,
  'MEDIUM'
);

