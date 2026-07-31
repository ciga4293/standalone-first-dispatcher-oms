-- =============================================================================
-- DISPATCHER & OMS (ORDER MANAGEMENT SYSTEM) - INITIAL OLTP DATABASE SCHEMA
-- Target Database: PostgreSQL 14+
-- =============================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. USERS & ROLES
-- -----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('admin', 'dispatcher', 'fleet_ops', 'driver');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    role user_role NOT NULL DEFAULT 'dispatcher',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. FLEET & DRIVERS (ARMADA)
-- -----------------------------------------------------------------------------
CREATE TYPE fleet_vehicle_status AS ENUM ('moving', 'stopped', 'idle', 'breakdown');
CREATE TYPE unit_type_enum AS ENUM ('TWB', 'CDDL');

CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    license_number VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
    nopol VARCHAR(20) PRIMARY KEY,
    unit_type unit_type_enum NOT NULL,
    default_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    current_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    fleet_status fleet_vehicle_status NOT NULL DEFAULT 'idle',
    current_location TEXT,
    last_odometer NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. ORDERS & WAYPOINTS (ORDER MANAGEMENT SYSTEM)
-- -----------------------------------------------------------------------------
CREATE TYPE order_status_enum AS ENUM (
    'Draft/Request', 
    'Dispatched', 
    'In Progress', 
    'Completed', 
    'Closed', 
    'Cancelled'
);

CREATE TYPE order_sub_status_enum AS ENUM (
    '1. Otw Muat',
    '2. Antri Muat',
    '3. Process Muat',
    '4. Otw Bongkar',
    '5. Antri Bongkar',
    '6. Process Bongkar',
    '7. Menuju End Point',
    '8. Standby / Arrived'
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    odoo_so VARCHAR(50), -- Reference ID dari Odoo ERP
    unit_type unit_type_enum NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    shipper_name VARCHAR(150) NOT NULL,
    tanggal_jalan DATE NOT NULL,
    rate NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    cost_allowance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    
    -- Vehicle & Driver Assignment
    nopol VARCHAR(20) REFERENCES vehicles(nopol) ON DELETE SET NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    
    -- Route Summary
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    end_point TEXT,
    
    -- Estimated Metrics (untuk kalkulasi ETA & konsumsi BBM)
    estimated_km NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    estimated_days NUMERIC(4, 2) NOT NULL DEFAULT 0.00, -- mendukung angka pecahan (0.25, 0.5, 1.5, dll)
    
    -- Odometer Tracking
    start_odometer NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    end_odometer NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    
    -- Status & Flags
    status order_status_enum NOT NULL DEFAULT 'Draft/Request',
    status_detail order_sub_status_enum, -- Sub-status terspesifikasi ENUM untuk bottleneck analysis
    sj_physical_done BOOLEAN NOT NULL DEFAULT FALSE,
    cancel_note TEXT,
    
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE waypoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    sequence_order INT NOT NULL DEFAULT 1,
    waypoint_type VARCHAR(20) NOT NULL CHECK (waypoint_type IN ('loading', 'unloading')),
    address TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 4. EVENT LOGS & STATUS TRACKING (ORDER STATUS LOGS)
-- -----------------------------------------------------------------------------
CREATE TABLE order_status_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status order_status_enum NOT NULL,
    status_detail order_sub_status_enum,
    odometer NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 5. ATTACHMENTS & ADMINISTRATIVE DOCUMENTS
-- -----------------------------------------------------------------------------
CREATE TYPE attachment_type_enum AS ENUM (
    'SuratJalanScan', 
    'SuratJalanPhysical', 
    'Resi', 
    'Kuitansi', 
    'ApprovalCost', 
    'Other'
);

CREATE TABLE order_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    document_type attachment_type_enum NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL, -- Relative path di storage local/S3 bucket
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 6. BREAKDOWN & MAINTENANCE LOGS
-- -----------------------------------------------------------------------------
CREATE TYPE breakdown_status_enum AS ENUM ('Open', 'In Repair', 'Resolved', 'Cancelled');

CREATE TABLE breakdown_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nopol VARCHAR(20) NOT NULL REFERENCES vehicles(nopol) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- Order yang berdampak (jika ada)
    
    issue_description TEXT NOT NULL,
    spareparts_needed TEXT,
    estimated_cost NUMERIC(12, 2) DEFAULT 0.00,
    actual_cost NUMERIC(12, 2) DEFAULT 0.00,
    
    -- Timestamps & Odometer
    start_odometer NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    start_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_timestamp TIMESTAMPTZ, -- Diisi ketika resolved
    
    status breakdown_status_enum NOT NULL DEFAULT 'Open',
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 7. DISPATCHER ON-CALL SHIFTS & CALL LOGS
-- -----------------------------------------------------------------------------
CREATE TYPE shift_name_enum AS ENUM ('Morning', 'Evening', 'Night', 'Weekend');
CREATE TYPE shift_status_enum AS ENUM ('Scheduled', 'Active', 'Handover', 'Completed');

CREATE TABLE oncall_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispatcher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shift_name shift_name_enum NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    actual_login TIMESTAMPTZ,
    actual_logout TIMESTAMPTZ,
    status shift_status_enum NOT NULL DEFAULT 'Scheduled',
    handover_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE call_status_enum AS ENUM ('Open', 'Resolved', 'Escalated');

CREATE TABLE call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispatcher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    shift_id UUID REFERENCES oncall_shifts(id) ON DELETE SET NULL,
    caller_name VARCHAR(100) NOT NULL,
    caller_phone VARCHAR(30) NOT NULL,
    issue TEXT NOT NULL,
    status call_status_enum NOT NULL DEFAULT 'Open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 8. INDEXES FOR OLTP PERFORMANCE
-- -----------------------------------------------------------------------------
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_status_detail ON orders(status_detail);
CREATE INDEX idx_orders_nopol ON orders(nopol);
CREATE INDEX idx_orders_tanggal_jalan ON orders(tanggal_jalan);
CREATE INDEX idx_order_status_logs_order_id ON order_status_logs(order_id);
CREATE INDEX idx_order_status_logs_status_detail ON order_status_logs(status_detail);
CREATE INDEX idx_order_attachments_order_id ON order_attachments(order_id);
CREATE INDEX idx_breakdown_logs_nopol ON breakdown_logs(nopol);
CREATE INDEX idx_breakdown_logs_status ON breakdown_logs(status);
CREATE INDEX idx_oncall_shifts_dispatcher ON oncall_shifts(dispatcher_id);

-- -----------------------------------------------------------------------------
-- 9. AUTOMATIC TRIGGER FOR updated_at TIMESTAMPS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_breakdown_updated_at BEFORE UPDATE ON breakdown_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_oncall_shifts_updated_at BEFORE UPDATE ON oncall_shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_call_logs_updated_at BEFORE UPDATE ON call_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
