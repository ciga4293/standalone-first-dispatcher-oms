'use client'
import { Bell, Search, User } from 'lucide-react'
import { ReactNode } from 'react'

interface Props {
  title: ReactNode
  userName: string
  role?: string
  welcome?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  hideSearch?: boolean
}

export default function Topbar({ title, userName, role, welcome, subtitle, actions }: Props) {
  return (
    <header className="mb-6 bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        {welcome && <div className="text-xs text-slate-500 mb-0.5">{welcome}</div>}
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800">{title}</h1>
        {subtitle && <div className="text-xs md:text-sm text-slate-500 mt-1">{subtitle}</div>}
      </div>

      <div className="flex items-center gap-3 self-end md:self-auto">
        {actions && <div className="flex items-center gap-2">{actions}</div>}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-sm shadow-sm">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-semibold text-slate-800">{userName || 'Dispatcher User'}</div>
            <div className="text-[10px] font-medium text-slate-500 capitalize">{role || 'Dispatcher'}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
