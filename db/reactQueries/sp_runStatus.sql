SELECT
    run_id,
    status,
    started_at,
    completed_at,
    error_message
FROM loan_run
WHERE run_id = :run_id;
