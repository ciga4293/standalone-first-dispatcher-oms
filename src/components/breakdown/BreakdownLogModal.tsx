'use client'

import React from 'react'
import { BreakdownLog } from '@/types'
import { AlertTriangle, Wrench, X, CheckCircle, Clock } from 'lucide-react'

interface BreakdownLogModalProps {
  isOpen: boolean
  onClose: () => void
  breakdownLogs: BreakdownLog[]
  onResolveBreakdown?: (logId: string) => void
}

export default function BreakdownLogModal({
  isOpen,
  onClose,
  breakdownLogs,
  onResolveBreakdown
}: BreakdownLogModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-rose-50 border-b border-rose-100">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-base">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Daftar Kendaraan Breakdown & Perbaikan</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {breakdownLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              Tidak ada riwayat atau laporan kendaraan breakdown aktif.
            </div>
          ) : (
            <div className="space-y-3">
              {breakdownLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{log.nopol}</span>
                      <span className="text-xs text-slate-500">({log.driver})</span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                        log.status === 'Open'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : log.status === 'In Repair'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                    <strong className="text-slate-900">Kendala: </strong>{log.issueDescription}
                  </p>

                  {log.sparepartsNeeded && (
                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sparepart: {log.sparepartsNeeded}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <div>
                      <span>Odo Masuk: {log.startOdometer} km</span> | <span>Waktu: {log.startTimestamp}</span>
                    </div>

                    {onResolveBreakdown && log.status !== 'Resolved' && (
                      <button
                        onClick={() => onResolveBreakdown(log.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white font-semibold rounded text-xs hover:bg-emerald-700 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Tandai Selesai
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
