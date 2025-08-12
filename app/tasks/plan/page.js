'use client'

import { useState } from 'react'
import { toast } from '@/components/ui/sonner'

export default function PlanPage() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchPlan = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tasks/auto-plan-day', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed')
      setPlan(data)
    } catch (e) {
      toast.error(e.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const toICS = () => {
    if (!plan?.plan?.length) return ''
    const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SmartTodo//EN']
    const fmt = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
    plan.plan.forEach((p, idx) => {
      (p.blocks || []).forEach((b, j) => {
        lines.push('BEGIN:VEVENT')
        lines.push(`UID:${p.task_id}-${j}@smarttodo`)
        lines.push(`DTSTAMP:${fmt(new Date())}`)
        lines.push(`DTSTART:${fmt(b.start)}`)
        lines.push(`DTEND:${fmt(b.end)}`)
        lines.push(`SUMMARY:${b.label || p.title}`)
        lines.push('END:VEVENT')
      })
    })
    lines.push('END:VCALENDAR')
    return lines.join('\r\n')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Daily Plan</h1>
        <div className="flex gap-2">
          <button onClick={fetchPlan} className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300 backdrop-blur-sm">Generate Plan</button>
          {!!plan?.plan?.length && (
            <button onClick={() => { const ics = toICS(); const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'daily-plan.ics'; a.click(); URL.revokeObjectURL(url) }} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 backdrop-blur-sm">Download .ics</button>
          )}
        </div>
      </div>

      {loading ? (
        <div>Generating…</div>
      ) : plan?.plan?.length ? (
        <div className="space-y-3">
          {plan.plan.map((p) => (
            <div key={p.task_id} className="p-3 rounded-lg border border-border">
              <div className="font-medium">{p.title}</div>
              <div className="mt-2 space-y-1">
                {(p.blocks || []).map((b, i) => (
                  <div key={i} className="text-sm text-foreground/70">{new Date(b.start).toLocaleString()} → {new Date(b.end).toLocaleString()} — {b.label}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-foreground/60">No plan yet. Click Generate Plan.</div>
      )}
    </div>
  )
}


