-- Model Intermediate: Menghitung Durasi Per Tahapan Sub-Status (Bottleneck Analysis)
WITH status_logs AS (
    SELECT * FROM {{ ref('stg_order_status_logs') }}
),

staged_durations AS (
    SELECT
        log_id,
        order_id,
        status,
        status_detail,
        logged_at AS stage_start_time,
        LEAD(logged_at) OVER (
            PARTITION BY order_id 
            ORDER BY logged_at ASC
        ) AS stage_end_time,
        odometer,
        LEAD(odometer) OVER (
            PARTITION BY order_id 
            ORDER BY logged_at ASC
        ) AS next_odometer
    FROM status_logs
    WHERE status_detail IS NOT NULL
)

SELECT
    log_id,
    order_id,
    status,
    status_detail,
    stage_start_time,
    stage_end_time,
    -- Durasi dalam menit & jam
    ROUND(EXTRACT(EPOCH FROM (stage_end_time - stage_start_time)) / 60.0, 2) AS duration_minutes,
    ROUND(EXTRACT(EPOCH FROM (stage_end_time - stage_start_time)) / 3600.0, 2) AS duration_hours,
    -- Selisih KM per tahapan
    COALESCE(next_odometer - odometer, 0) AS distance_km_in_stage
FROM staged_durations
