from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.order import OrderCreate, OrderResponse
from app.core.database import pool

router = APIRouter(prefix="/orders", tags=["Orders (OMS)"])

@router.get("", response_model=List[dict])
async def get_orders():
    """Fetch all OMS orders from PostgreSQL DB"""
    if not pool:
        # Fallback dummy data jika DB server belum aktif
        return [{
            "id": "b1111111-1111-1111-1111-111111111111",
            "order_number": "ORD-2026-001",
            "customer_name": "PT Mayora Indah",
            "shipper_name": "Gudang Mayora Cikande",
            "status": "In Progress",
            "status_detail": "4. Otw Bongkar"
        }]
    
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM orders ORDER BY created_at DESC")
        return [dict(row) for row in rows]

@router.get("/{order_id}")
async def get_order_by_id(order_id: str):
    """Fetch single order by ID with waypoints"""
    if not pool:
        raise HTTPException(status_code=500, detail="Database connection pool is offline.")
    
    async with pool.acquire() as conn:
        order_row = await conn.fetchrow("SELECT * FROM orders WHERE id = $1", order_id)
        if not order_row:
            raise HTTPException(status_code=404, detail="Order not found")
        
        waypoint_rows = await conn.fetch("SELECT * FROM waypoints WHERE order_id = $1 ORDER BY sequence_order ASC", order_id)
        
        order_dict = dict(order_row)
        order_dict["waypoints"] = [dict(w) for w in waypoint_rows]
        return order_dict
