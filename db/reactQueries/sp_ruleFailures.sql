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
