-- =============================================================================
-- SEED DATA FOR DISPATCHER & OMS SYSTEM
-- =============================================================================

-- 1. Seed Users (Password hash dummy untuk dev: 'password123')
INSERT INTO users (id, username, full_name, email, password_hash, phone, role) VALUES
('11111111-1111-1111-1111-111111111111', 'admin', 'System Admin', 'admin@fleet.local', '$2a$10$wN1vK.aQ8Uq1s8gH3X7.0e1ZqZ9P3Hk3Q5P7r8W9a0b1c2d3e4f5', '081234567890', 'admin'),
('22222222-2222-2222-2222-222222222222', 'dispatcher1', 'Budi Santoso', 'budi@fleet.local', '$2a$10$wN1vK.aQ8Uq1s8gH3X7.0e1ZqZ9P3Hk3Q5P7r8W9a0b1c2d3e4f5', '081298765432', 'dispatcher'),
('33333333-3333-3333-3333-333333333333', 'fleetops1', 'Agus Fleet', 'agus@fleet.local', '$2a$10$wN1vK.aQ8Uq1s8gH3X7.0e1ZqZ9P3Hk3Q5P7r8W9a0b1c2d3e4f5', '081311223344', 'fleet_ops')
ON CONFLICT (username) DO NOTHING;

-- 2. Seed Drivers
INSERT INTO drivers (id, name, phone, license_number) VALUES
('a1111111-1111-1111-1111-111111111111', 'Siti Rahma', '081299887766', 'SIM-B2-9871'),
('a2222222-2222-2222-2222-222222222222', 'Joko Widodo', '081388776655', 'SIM-B2-1234'),
('a3333333-3333-3333-3333-333333333333', 'Bambang Tri', '081577665544', 'SIM-B1-5566')
ON CONFLICT DO NOTHING;

-- 3. Seed Vehicles
INSERT INTO vehicles (nopol, unit_type, default_driver_id, fleet_status, current_location, last_odometer) VALUES
('B 9012 TWB', 'TWB', 'a1111111-1111-1111-1111-111111111111', 'moving', 'Tol Jakarta-Cikampek KM 42', 12450.50),
('B 8831 CDDL', 'CDDL', 'a2222222-2222-2222-2222-222222222222', 'idle', 'Pool Marunda', 45200.00),
('B 4412 TWB', 'TWB', 'a3333333-3333-3333-3333-333333333333', 'breakdown', 'Bengkel Rekanan Cikarang', 88100.25)
ON CONFLICT (nopol) DO NOTHING;

-- 4. Seed Sample Orders
INSERT INTO orders (
    id, order_number, odoo_so, unit_type, customer_name, shipper_name, tanggal_jalan,
    rate, cost_allowance, notes, nopol, driver_id, origin, destination, estimated_km, estimated_days,
    start_odometer, end_odometer, status, status_detail
) VALUES
(
    'b1111111-1111-1111-1111-111111111111', 'ORD-2026-001', 'SO/2026/07/001', 'TWB', 'PT Mayora Indah', 'Gudang Mayora Cikande', '2026-07-30',
    4500000.00, 1500000.00, 'Muatan Makanan Ringan, Hati-hati basah', 'B 9012 TWB', 'a1111111-1111-1111-1111-111111111111',
    'Cikande, Serang', 'Semarang Central', 480.00, 1.50,
    12000.00, 12450.50, 'In Progress', '4. Otw Bongkar'
) ON CONFLICT DO NOTHING;

-- Waypoints for Order 001
INSERT INTO waypoints (order_id, sequence_order, waypoint_type, address) VALUES
('b1111111-1111-1111-1111-111111111111', 1, 'loading', 'Gudang Mayora Cikande, Serang, Banten'),
('b1111111-1111-1111-1111-111111111111', 2, 'unloading', 'DC Mayora Semarang, Genuk, Semarang')
ON CONFLICT DO NOTHING;
