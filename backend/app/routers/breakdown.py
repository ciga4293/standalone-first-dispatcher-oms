from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.fleet import BreakdownLogCreate
from app.core.database import pool

router = APIRouter(prefix="/breakdown", tags=["Breakdown Logs"])

@router.get("", response_model=List[dict])
async def get_breakdown_logs():
    """Fetch log kendala breakdown perbaikan unit kendaraan"""
    if not pool:
        # Fallback dummy data
        return [
            {
                "id": "b111-sample",
                "nopol": "B 4412 TWB",
                "driver_name": "Bambang Tri",
                "issue_description": "Mesin overheating di jalan tol",
                "spareparts_needed": "Radiator Fan & Belt",
                "estimated_cost": 1500000.00,
                "start_odometer": 88100.25,
                "status": "In Repair"
            }
        ]
    
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT 
                b.id,
                b.nopol,
                d.name AS driver_name,
                b.issue_description,
                b.spareparts_needed,
                b.estimated_cost,
                b.actual_cost,
                b.start_odometer,
                b.start_timestamp,
                b.end_timestamp,
                b.status
            FROM breakdown_logs b
            LEFT JOIN drivers d ON b.driver_id = d.id
            ORDER BY b.created_at DESC
        """)
        return [dict(row) for row in rows]

@router.post("", status_code=201)
async def create_breakdown_log(payload: BreakdownLogCreate):
    """Catat insiden breakdown kendaraan baru"""
    if not pool:
        raise HTTPException(status_code=500, detail="Database connection pool is offline.")
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            INSERT INTO breakdown_logs (nopol, issue_description, spareparts_needed, estimated_cost, start_odometer, status)
            VALUES ($1, $2, $3, $4, $5, 'Open')
            RETURNING id, nopol, status, created_at
        """, payload.nopol, payload.issue_description, payload.spareparts_needed, payload.estimated_cost, payload.start_odometer)
        
        # Update status armada menjadi breakdown
        await conn.execute("UPDATE vehicles SET fleet_status = 'breakdown' WHERE nopol = $1", payload.nopol)
        return dict(row)

@router.patch("/{log_id}/resolve")
async def resolve_breakdown(log_id: str, actual_cost: float = 0.0):
    """Tandai unit breakdown telah selesai diperbaiki"""
    if not pool:
        raise HTTPException(status_code=500, detail="Database connection pool is offline.")
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            UPDATE breakdown_logs 
            SET status = 'Resolved', end_timestamp = CURRENT_TIMESTAMP, actual_cost = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING nopol
        """, actual_cost, log_id)
        
        if not row:
            raise HTTPException(status_code=404, detail="Breakdown log ID not found")
        
        # Kembalikan status armada menjadi idle
        await conn.execute("UPDATE vehicles SET fleet_status = 'idle' WHERE nopol = $1", row["nopol"])
        return {"message": "Breakdown resolved successfully", "log_id": log_id, "nopol": row["nopol"]}
