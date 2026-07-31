'use client'

import React from 'react'
import { Eye, Edit2, Trash2, Clock, AlertTriangle, FileText, Check } from 'lucide-react'
import { Order, OrderStatus } from '@/types'

interface OrderTableProps {
  orders: Order[]
  onSelectOrder: (order: Order) => void
  onEditOrder?: (order: Order) => void
  onDeleteOrder?: (orderId: string) => void
  t: (key: string) => string
}

export default function OrderTable({
  orders,
  onSelectOrder,
  onEditOrder,
  onDeleteOrder,
  t
}: OrderTableProps) {
  
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Draft/Request':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'Dispatched':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'In Progress':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'Closed':
        return 'bg-slate-200 text-slate-700 border-slate-300'
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-xs uppercase text-slate-700 font-semibold border-b border-slate-200">
          <tr>
            <th className="px-4 py-3">No. Order / Odoo SO</th>
            <th className="px-4 py-3">Customer & Shipper</th>
            <th className="px-4 py-3">Rute (Origin - Destination)</th>
            <th className="px-4 py-3">Armada & Driver</th>
            <th className="px-4 py-3 text-center">Unit</th>
            <th className="px-4 py-3 text-center">Status Order</th>
            <th className="px-4 py-3 text-center">Sub-Status</th>
            <th className="px-4 py-3 text-center">Surat Jalan</th>
            <th className="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                Tidak ada data order ditemukan.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr 
                key={order.id} 
                className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                onClick={() => onSelectOrder(order)}
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  <div className="font-semibold text-blue-600 hover:underline">{order.orderNumber}</div>
                  <div className="text-xs text-slate-400">{order.odooSo || '-'}</div>
                </td>

                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{order.customer}</div>
                  <div className="text-xs text-slate-500">{order.shipper}</div>
                </td>

                <td className="px-4 py-3 max-w-xs truncate">
                  <div className="font-medium text-slate-800 truncate">{order.origin}</div>
                  <div className="text-xs text-slate-500 truncate">➡️ {order.destination}</div>
                </td>

                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-800">{order.nopol || '-'}</div>
                  <div className="text-xs text-slate-500">{order.driverName || 'Belum diassign'}</div>
                </td>

                <td className="px-4 py-3 text-center">
                  <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {order.unitType}
                  </span>
                </td>

                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-center">
                  {order.statusDetail ? (
                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {order.statusDetail}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </td>

                <td className="px-4 py-3 text-center">
                  {order.sjPhysicalDone ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <Check className="w-3 h-3" /> Fisik Kembali
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <Clock className="w-3 h-3" /> Pending Fisik
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {onEditOrder && (
                      <button
                        onClick={() => onEditOrder(order)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                        title="Edit Order"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDeleteOrder && (
                      <button
                        onClick={() => onDeleteOrder(order.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Hapus Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
