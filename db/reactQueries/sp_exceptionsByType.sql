#Exceptions by Type (Bar Chart)
SELECT
    exception_type,
    COUNT(*) AS exception_count
FROM loan_exceptions
WHERE run_id = :run_id
GROUP BY exception_type
ORDER BY exception_count DESC;