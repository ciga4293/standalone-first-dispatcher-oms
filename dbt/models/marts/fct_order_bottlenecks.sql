-- Model Marts/Analytics: Fact Table Durasi Bottleneck Gudang & Perjalanan per Order
WITH orders AS (
    SELECT * FROM {{ ref('stg_orders') }}
),

stage_durations AS (
    SELECT * FROM {{ ref('int_order_stage_durations') }}
)

SELECT
    o.order_id,
    o.order_number,
    o.customer_name,
    o.shipper_name,
    o.nopol,
    o.unit_type,
    o.tanggal_jalan,
    
    -- Agregasi Durasi Waktu Tunggu (Dwell Time Bottlenecks)
    COALESCE(SUM(CASE WHEN sd.status_detail = '2. Antri Muat' THEN sd.duration_hours END), 0) AS antri_muat_hours,
    COALESCE(SUM(CASE WHEN sd.status_detail = '3. Proses Muat' THEN sd.duration_hours END), 0) AS proses_muat_hours,
    COALESCE(SUM(CASE WHEN sd.status_detail = '5. Antri Bongkar' THEN sd.duration_hours END), 0) AS antri_bongkar_hours,
    COALESCE(SUM(CASE WHEN sd.status_detail = '6. Proses Bongkar' THEN sd.duration_hours END), 0) AS proses_bongkar_hours,
    
    -- Agregasi Durasi Perjalanan
    COALESCE(SUM(CASE WHEN sd.status_detail = '1. Otw Muat' THEN sd.duration_hours END), 0) AS otw_muat_hours,
    COALESCE(SUM(CASE WHEN sd.status_detail = '4. Otw Bongkar' THEN sd.duration_hours END), 0) AS otw_bongkar_hours,
    COALESCE(SUM(CASE WHEN sd.status_detail = '7. Menuju End Point' THEN sd.duration_hours END), 0) AS menuju_endpoint_hours,
    
    -- Total Waktu Tunggu di Gudang (Antri Muat + Antri Bongkar)
    COALESCE(SUM(CASE WHEN sd.status_detail IN ('2. Antri Muat', '5. Antri Bongkar') THEN sd.duration_hours END), 0) AS total_warehouse_dwell_hours,
    
    -- Total Durasi Keseluruhan Order (Jam)
    COALESCE(SUM(sd.duration_hours), 0) AS total_cycle_duration_hours,
    
    o.estimated_days * 24.0 AS estimated_hours,
    -- Variansi Durasi (Actual vs Estimated)
    COALESCE(SUM(sd.duration_hours), 0) - (o.estimated_days * 24.0) AS duration_delay_hours,
    
    o.actual_km,
    o.estimated_km,
    
    -- Estimasi Konsumsi BBM (Rasio Asumsi TWB = 1:3 KM, CDDL = 1:4 KM)
    CASE 
        WHEN o.unit_type = 'TWB' THEN ROUND(o.actual_km / 3.0, 2)
        WHEN o.unit_type = 'CDDL' THEN ROUND(o.actual_km / 4.0, 2)
        ELSE ROUND(o.actual_km / 3.5, 2)
    END AS estimated_fuel_liters

FROM orders o
LEFT JOIN stage_durations sd ON o.order_id = sd.order_id
GROUP BY 
    o.order_id,
    o.order_number,
    o.customer_name,
    o.shipper_name,
    o.nopol,
    o.unit_type,
    o.tanggal_jalan,
    o.estimated_days,
    o.actual_km,
    o.estimated_km
