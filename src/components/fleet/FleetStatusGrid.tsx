'use client'

import React from 'react'
import { FleetVehicle, FleetVehicleStatus } from '@/types'
import { Truck, Wrench, Clock, AlertTriangle } from 'lucide-react'

interface FleetStatusGridProps {
  vehicles: FleetVehicle[]
  onSelectVehicle?: (vehicle: FleetVehicle) => void
}

export default function FleetStatusGrid({ vehicles, onSelectVehicle }: FleetStatusGridProps) {
  const getStatusColor = (status: FleetVehicleStatus) => {
    switch (status) {
      case 'moving':
        return 'bg-emerald-500 text-white border-emerald-600'
      case 'stopped':
        return 'bg-amber-500 text-white border-amber-600'
      case 'idle':
        return 'bg-slate-400 text-white border-slate-500'
      case 'breakdown':
        return 'bg-rose-600 text-white border-rose-700 animate-pulse'
      default:
        return 'bg-gray-400 text-white'
    }
  }

  const getStatusBadge = (status: FleetVehicleStatus) => {
    switch (status) {
      case 'moving':
        return 'Moving'
      case 'stopped':
        return 'Stopped'
      case 'idle':
        return 'Idle'
      case 'breakdown':
        return 'Breakdown'
      default:
        return status
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {vehicles.map((v) => (
        <div
          key={v.nopol}
          onClick={() => onSelectVehicle && onSelectVehicle(v)}
          className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-base">{v.nopol}</span>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(v.fleetStatus)}`}>
                {getStatusBadge(v.fleetStatus)}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-700">{v.driver || 'No Driver'}</span>
              </div>

              <div className="text-slate-500 truncate" title={v.location}>
                📍 {v.location || 'Lokasi tidak tersedia'}
              </div>

              {v.orderStatus && (
                <div className="bg-slate-50 p-2 rounded text-slate-700 mt-2 border border-slate-100 text-xs">
                  <div className="font-semibold text-blue-600">{v.orderStatus}</div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>Durasi DO: {v.doDuration}</span>
                    <span>ETA: {v.eta}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Next Plan: <strong className="text-slate-600">{v.nextPlan}</strong></span>
            <span className="font-mono text-slate-500">{v.statusDuration}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
