 SELECT
    run_id,
    as_of_date,
    portfolio,
    irr_target,
    status,
    started_at,
    completed_at,
    created_at
FROM loan_run
ORDER BY created_at DESC
LIMIT :page_size OFFSET :offset;
