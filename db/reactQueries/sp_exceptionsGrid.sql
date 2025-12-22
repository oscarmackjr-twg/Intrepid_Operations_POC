SELECT
    e.exception_id,
    e.seller_loan_no,
    f.platform,
    f.loan_program,
    e.exception_type,
    e.rule_id,
    e.severity,
    e.balance_impact,
    e.created_at
FROM loan_exceptions e
JOIN loan_fact f
  ON e.run_id = f.run_id
 AND e.seller_loan_no = f.seller_loan_no
WHERE e.run_id = :run_id
  AND (:platform IS NULL OR f.platform = :platform)
  AND (:exception_type IS NULL OR e.exception_type = :exception_type)
  AND (:severity IS NULL OR e.severity = :severity)
ORDER BY e.created_at DESC
LIMIT :page_size OFFSET :offset;



#Total row count (server-side pagination)
SELECT COUNT(*)
FROM loan_exceptions e
JOIN loan_fact f
  ON e.run_id = f.run_id
 AND e.seller_loan_no = f.seller_loan_no
WHERE e.run_id = :run_id;