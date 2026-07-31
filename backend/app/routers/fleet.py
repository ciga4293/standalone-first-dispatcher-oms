from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.fleet import FleetVehicleUpdateOdo
from app.core.database import pool

router = APIRouter(prefix="/fleet", tags=["Fleet & Vehicles"])

@router.get("", response_model=List[dict])
async def get_fleet_vehicles():
    """Fetch status armada kendaraan real-time dari PostgreSQL"""
    if not pool:
        # Fallback dummy data jika DB server belum terhubung
        return [
            {
                "nopol": "B 9012 TWB",
                "unit_type": "TWB",
                "driver_name": "Siti Rahma",
                "fleet_status": "moving",
                "current_location": "Tol Jakarta-Cikampek KM 42",
                "last_odometer": 12450.50
            },
            {
                "nopol": "B 8831 CDDL",
                "unit_type": "CDDL",
                "driver_name": "Joko Widodo",
                "fleet_status": "idle",
                "current_location": "Pool Marunda",
                "last_odometer": 45200.00
            }
        ]
    
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT 
                v.nopol,
                v.unit_type,
                d.name AS driver_name,
                v.fleet_status,
                v.current_location,
                v.last_odometer,
                v.updated_at
            FROM vehicles v
            LEFT JOIN drivers d ON v.current_driver_id = d.id
            ORDER BY v.nopol ASC
        """)
        return [dict(row) for row in rows]

@router.patch("/{nopol}/odometer")
async def update_vehicle_odometer(nopol: str, payload: FleetVehicleUpdateOdo):
    """Update posisi Odometer & lokasi terkini armada kendaraan"""
    if not pool:
        raise HTTPException(status_code=500, detail="Database connection pool is offline.")
    
    async with pool.acquire() as conn:
        result = await conn.execute(
            """
            UPDATE vehicles 
            SET last_odometer = $1, current_location = COALESCE($2, current_location), updated_at = CURRENT_TIMESTAMP
            WHERE nopol = $3
            """,
            payload.last_odometer, payload.current_location, nopol
        )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Vehicle nopol not found")
        return {"message": "Odometer updated successfully", "nopol": nopol, "new_odometer": payload.last_odometer}
