from pydantic import BaseModel
from typing import Optional

class FleetVehicleBase(BaseModel):
    nopol: str
    unit_type: str  # 'TWB' or 'CDDL'
    driver_name: Optional[str] = None
    fleet_status: str  # 'moving', 'stopped', 'idle', 'breakdown'
    current_location: Optional[str] = None
    last_odometer: float = 0.0

class FleetVehicleCreate(FleetVehicleBase):
    pass

class FleetVehicleUpdateOdo(BaseModel):
    last_odometer: float
    current_location: Optional[str] = None

class BreakdownLogBase(BaseModel):
    nopol: str
    driver_name: Optional[str] = None
    issue_description: str
    spareparts_needed: Optional[str] = None
    estimated_cost: float = 0.0
    start_odometer: float = 0.0

class BreakdownLogCreate(BreakdownLogBase):
    pass

class OnCallShiftBase(BaseModel):
    dispatcher_name: str
    shift_name: str  # 'Morning', 'Evening', 'Night', 'Weekend'
    start_time: str
    end_time: str
    status: str = 'Scheduled'
    handover_notes: Optional[str] = None

class CallLogBase(BaseModel):
    caller_name: str
    caller_phone: str
    issue: str
    status: str = 'Open'
