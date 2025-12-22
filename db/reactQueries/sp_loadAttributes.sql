SELECT *
FROM loan_fact
WHERE run_id = :run_id
  AND seller_loan_no = :seller_loan_no;
