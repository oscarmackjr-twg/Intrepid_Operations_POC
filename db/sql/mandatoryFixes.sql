UPDATE rule_purchase_price_config
SET tolerance_bps = 50
WHERE enabled = TRUE
  AND (tolerance_bps IS NULL OR tolerance_bps::text = '' OR tolerance_bps::text ILIKE 'nan');


ALTER TABLE rule_purchase_price_config
  ADD COLUMN rule_id TEXT;

  UPDATE rule_purchase_price_config
SET rule_id = 'PURCHASE_PRICE'
WHERE rule_id IS NULL;

ALTER TABLE rule_purchase_price_config
  ALTER COLUMN rule_id SET NOT NULL;

  ALTER TABLE rule_purchase_price_config
  ADD COLUMN severity TEXT;


  UPDATE rule_purchase_price_config
SET severity = 'ERROR'
WHERE severity IS NULL;

ALTER TABLE rule_purchase_price_config
  ALTER COLUMN severity SET NOT NULL;


ALTER TABLE rule_eligibility_config
  ADD COLUMN IF NOT EXISTS effective_start_date DATE,
  ADD COLUMN IF NOT EXISTS effective_end_date   DATE,
  ADD COLUMN IF NOT EXISTS enabled              BOOLEAN NOT NULL DEFAULT TRUE;


ALTER TABLE loan_exceptions
  ADD COLUMN IF NOT EXISTS difference       NUMERIC(18,6),
  ADD COLUMN IF NOT EXISTS original_balance NUMERIC(18,2),
  ADD COLUMN IF NOT EXISTS purchase_price   NUMERIC(18,2);


ALTER TABLE loan_exceptions
  DROP CONSTRAINT IF EXISTS fk_loan_exceptions_run;

-- Change run_id to TEXT so "TEST_RUN_001" is valid
ALTER TABLE loan_exceptions
  ALTER COLUMN run_id TYPE TEXT
  USING run_id::text;


-- Only run this if \d loan_run shows run_id is UUID and you want it as TEXT
ALTER TABLE loan_run
  ALTER COLUMN run_id TYPE TEXT
  USING run_id::text;


ALTER TABLE loan_exceptions
  ALTER COLUMN severity DROP NOT NULL;

ALTER TABLE loan_exceptions
  ALTER COLUMN message DROP NOT NULL,
  ALTER COLUMN message SET DEFAULT '';



