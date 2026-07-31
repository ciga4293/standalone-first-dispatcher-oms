WITH raw_orders AS (
    SELECT * FROM {{ source('oltp', 'orders') }}
)

SELECT
    id AS order_id,
    order_number,
    odoo_so,
    unit_type,
    customer_name,
    shipper_name,
    tanggal_jalan,
    rate,
    cost_allowance,
    nopol,
    driver_id,
    origin,
    destination,
    estimated_km,
    estimated_days,
    start_odometer,
    end_odometer,
    (end_odometer - start_odometer) AS actual_km,
    status,
    status_detail,
    sj_physical_done,
    created_at,
    updated_at
FROM raw_orders
