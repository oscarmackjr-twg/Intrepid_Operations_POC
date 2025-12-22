SELECT
    rule_id,
    platform,
    severity,
    expected_value,
    actual_value,
    difference,
    balance_impact,
    created_at
FROM portfolio_exceptions
WHERE run_id = :run_id
ORDER BY severity DESC, balance_impact DESC;