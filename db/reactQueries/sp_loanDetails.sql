#Loan attributes
SELECT *
FROM loan_fact
WHERE run_id = :run_id
  AND seller_loan_no = :seller_loan_no;

#Rule failures for this loan
SELECT
    rule_id,
    exception_type,
    severity,
    expected_value,
    actual_value,
    difference,
    created_at
FROM loan_exceptions
WHERE run_id = :run_id
  AND seller_loan_no = :seller_loan_no
ORDER BY created_at;