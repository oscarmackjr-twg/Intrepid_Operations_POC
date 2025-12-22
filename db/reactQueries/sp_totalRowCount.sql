SELECT COUNT(*)
FROM loan_exceptions e
JOIN loan_fact f
  ON e.run_id = f.run_id
 AND e.seller_loan_no = f.seller_loan_no
WHERE e.run_id = :run_id;
