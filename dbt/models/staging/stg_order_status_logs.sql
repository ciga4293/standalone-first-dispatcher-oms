WITH raw_logs AS (
    SELECT * FROM {{ source('oltp', 'order_status_logs') }}
)

SELECT
    id AS log_id,
    order_id,
    status,
    status_detail,
    odometer,
    notes,
    created_by,
    created_at AS logged_at
FROM raw_logs
