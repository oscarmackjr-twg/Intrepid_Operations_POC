#Actual distribution
SELECT
    platform,
    loan_type,
    SUM(orig_balance) AS total_balance
FROM loan_fact
WHERE run_id = :run_id
  AND repurchase = FALSE
GROUP BY platform, loan_type;

#Ideal distribution (rule config)
SELECT
    platform,
    loan_type,
    target_weight
FROM rule_distribution_targets;