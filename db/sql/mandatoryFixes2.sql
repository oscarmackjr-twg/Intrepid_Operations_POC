-- 1) Change run_id in all 3 core tables to TEXT
ALTER TABLE loan_run
  ALTER COLUMN run_id TYPE TEXT USING run_id::text;

ALTER TABLE loan_fact
  ALTER COLUMN run_id TYPE TEXT USING run_id::text;

ALTER TABLE loan_exceptions
  ALTER COLUMN run_id TYPE TEXT USING run_id::text;

ALTER TABLE portfolio_exceptions
  ALTER COLUMN run_id TYPE TEXT USING run_id::text;

-- 2) Make message/severity nullable on loan_exceptions (so pipeline can write NULL)
ALTER TABLE loan_exceptions
  ALTER COLUMN severity DROP NOT NULL,
  ALTER COLUMN message  DROP NOT NULL;

-- 3) Add pipeline-driven columns to loan_exceptions if they don't exist
ALTER TABLE loan_exceptions
  ADD COLUMN IF NOT EXISTS original_balance NUMERIC(18,2),
  ADD COLUMN IF NOT EXISTS purchase_price   NUMERIC(18,2);

-- (Optional) If you accidentally renamed the PK:
-- ensure primary key is 'exception_id', not 'id'
-- If you have an 'id' PK but no 'exception_id', fix it:
--   - either add 'exception_id' as a surrogate key,
--   - or update the route to select 'id' instead.
