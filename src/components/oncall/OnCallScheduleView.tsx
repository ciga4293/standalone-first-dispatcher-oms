'use client'

import React from 'react'
import { OnCallShift, CallLog } from '@/types'
import { CalendarRange, Clock, Plus, PhoneCall, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface OnCallScheduleViewProps {
  shifts: OnCallShift[]
  callLogs: CallLog[]
  onAddShift?: () => void
  onAddCallLog?: () => void
}

export default function OnCallScheduleView({
  shifts,
  callLogs,
  onAddShift,
  onAddCallLog
}: OnCallScheduleViewProps) {
  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-blue-600" />
            Jadwal Piket & On-Call Dispatcher
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen pergantian shift malam/weekend dan pencatatan telepon masuk emergency
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onAddShift && (
            <button
              onClick={onAddShift}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Tambah Shift Piket
            </button>
          )}
          {onAddCallLog && (
            <button
              onClick={onAddCallLog}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-md hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <PhoneCall className="w-4 h-4" /> Catat Telepon
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Shift & Schedule Table */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Jadwal Shift Disposisi</h3>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Dispatcher</th>
                  <th className="px-4 py-3">Shift</th>
                  <th className="px-4 py-3">Waktu Mulai - Selesai</th>
                  <th className="px-4 py-3 text-center">Status Shift</th>
                  <th className="px-4 py-3">Catatan Handover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {shifts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      Belum ada jadwal shift piket terdaftar.
                    </td>
                  </tr>
                ) : (
                  shifts.map((shift) => (
                    <tr key={shift.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {shift.dispatcherName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded border border-slate-200">
                          {shift.shiftName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{shift.startTime} - {shift.endTime}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                            shift.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                              : shift.status === 'Completed'
                              ? 'bg-slate-100 text-slate-600 border-slate-300'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {shift.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">
                        {shift.handoverNotes || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Emergency Call Logs Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Log Telepon Darurat</span>
            <span className="text-xs font-normal text-slate-400">Terbaru</span>
          </h3>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-3">
            {callLogs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Tidak ada log telepon darurat.
              </p>
            ) : (
              callLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-md bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-800">{log.callerName} ({log.callerPhone})</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${
                        log.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : log.status === 'Escalated'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs">{log.issue}</p>

                  <div className="text-[11px] text-slate-400 pt-1 flex justify-between border-t border-slate-100">
                    <span>Dispatcher ID: {log.dispatcherId || 'System'}</span>
                    <span>{log.createdAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
