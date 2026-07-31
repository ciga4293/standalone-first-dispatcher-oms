from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime

class WaypointBase(BaseModel):
    sequence_order: int = 1
    waypoint_type: str  # 'loading' or 'unloading'
    address: str

class WaypointCreate(WaypointBase):
    pass

class WaypointResponse(WaypointBase):
    id: str
    order_id: str

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    order_number: str
    odoo_so: Optional[str] = None
    unit_type: str  # 'TWB' or 'CDDL'
    customer_name: str
    shipper_name: str
    tanggal_jalan: date
    rate: float = 0.0
    cost_allowance: float = 0.0
    notes: Optional[str] = None
    nopol: Optional[str] = None
    driver_id: Optional[str] = None
    origin: str
    destination: str
    end_point: Optional[str] = None
    estimated_km: float = 0.0
    estimated_days: float = 0.0

class OrderCreate(OrderBase):
    waypoints: List[WaypointCreate] = []

class OrderResponse(OrderBase):
    id: str
    start_odometer: float = 0.0
    end_odometer: float = 0.0
    status: str
    status_detail: Optional[str] = None
    sj_physical_done: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
