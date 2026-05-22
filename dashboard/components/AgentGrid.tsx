'use client'

import { useEffect, useState } from 'react'
import type { AgentStatus } from '@/lib/supabase'

const STATUS_CFG = {
  running: {
    dot:   'bg-emerald-400',
    ping:  true,
    label: 'Active',
    text:  'text-emerald-400',
    bar:   'bg-emerald-500',
  },
  idle: {
    dot:   'bg-gray-600',
    ping:  false,
    label: 'Idle',
    text:  'text-gray-500',
    bar:   'bg-gray-600',
  },
  error: {
    dot:   'bg-red-400',
    ping:  false,
    label: 'Error',
    text:  'text-red-400',
    bar:   'bg-red-500',
  },
  disconnected: {
    dot:   'bg-orange-400',
    ping:  false,
    label: 'Stopped · no network',
    text:  'text-orange-400',
    bar:   'bg-orange-500',
  },
} as const

function AgentCard({ agent }: { agent: AgentStatus }) {
  const cfg = STATUS_CFG[agent.status] ?? STATUS_CFG.idle

  const meta          = agent.metadata
  const progress      = meta != null && typeof meta['progress'] === 'number' ? (meta['progress'] as number) : null
  const progressLabel = meta != null && typeof meta['progress_label'] === 'string' ? (meta['progress_label'] as string) : null

  return (
    <div className="bg-gray-900/50 border border-gray-800/60 rounded-xl p-4 flex flex-col gap-3 hover:border-gray-700/60 transition-colors">
      <div className="flex items-center gap-2">
        <div className="relative flex-shrink-0">
          <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
          {cfg.ping && (
            <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${cfg.dot} animate-ping opacity-60`} />
          )}
        </div>
        <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-gray-100 leading-tight">{agent.name}</p>
        {agent.description && (
          <p className="text-xs text-gray-500 mt-1 leading-snug">{agent.description}</p>
        )}
      </div>

      {progress !== null && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-gray-600">{progressLabel ?? 'Progress'}</span>
            <span className="text-[10px] font-mono text-gray-500">{progress}%</span>
          </div>
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <p className="text-[10px] text-gray-700 font-mono">
        {new Date(agent.updated_at).toLocaleString('en-US', {
          timeZone: 'America/New_York',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })}{' '}ET
      </p>
    </div>
  )
}

const SESSION_LIMIT = 500_000
const WEEKLY_LIMIT  = 2_000_000

function getETNow(ts: number) {
  return new Date(new Date(ts).toLocaleString('en-US', { timeZone: 'America/New_York' }))
}

function minsUntilSessionReset(ts: number): number {
  const et  = getETNow(ts)
  const day = et.getDay()
  const min = et.getHours() * 60 + et.getMinutes()
  if (day === 0) return (24 * 60 - min) + 570
  if (day === 6) return (24 * 60 - min) + 24 * 60 + 570
  if (min < 570) return 570 - min
  const add = day === 5 ? 3 : 1
  return (24 * 60 - min) + (add - 1) * 24 * 60 + 570
}

function minsUntilWeeklyReset(ts: number): number {
  const et  = getETNow(ts)
  const day = et.getDay()
  const min = et.getHours() * 60 + et.getMinutes()
  const daysToMon = day === 0 ? 1 : day === 1 ? 7 : 8 - day
  return (24 * 60 - min) + (daysToMon - 1) * 24 * 60 + 570
}

function fmtCountdown(totalMins: number): string {
  const d = Math.floor(totalMins / (60 * 24))
  const h = Math.floor((totalMins % (60 * 24)) / 60)
  const m = totalMins % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function fmtK(n: number): string {
  if (n === 0) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return String(n)
}

function TokenUsageCard({ tokensIn, tokensOut, tokensInWeek, tokensOutWeek, cycles }: {
  tokensIn:     number
  tokensOut:    number
  tokensInWeek: number
  tokensOutWeek: number
  cycles:       number
}) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const sessionTotal = tokensIn + tokensOut
  const weeklyTotal  = tokensInWeek + tokensOutWeek
  const sessionPct   = Math.min(sessionTotal / SESSION_LIMIT, 1)
  const weeklyPct    = Math.min(weeklyTotal  / WEEKLY_LIMIT,  1)
  const remaining_s  = 1 - sessionPct
  const remaining_w  = 1 - weeklyPct

  const barColor = (rem: number) =>
    rem < 0.2 ? 'bg-red-500' : rem < 0.5 ? 'bg-amber-500' : 'bg-violet-500'

  const costToday = (tokensIn / 1_000_000) * 3 + (tokensOut / 1_000_000) * 15

  return (
    <div className="bg-gray-900/50 border border-gray-800/60 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-violet-400/70" />
          <span className="text-[11px] font-medium text-violet-400/80 uppercase tracking-wider">Token usage</span>
        </div>
        <span className="text-[10px] text-gray-600 font-mono">~${costToday.toFixed(2)}</span>
      </div>

      {/* Session bar */}
      <div>
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-[10px] text-gray-500">Session</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-400">{fmtK(sessionTotal)} / {fmtK(SESSION_LIMIT)}</span>
            <span className="text-[10px] text-gray-600">↻ {fmtCountdown(minsUntilSessionReset(now))}</span>
          </div>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${barColor(remaining_s)}`}
            style={{ width: `${remaining_s * 100}%` }} />
        </div>
      </div>

      {/* Weekly bar */}
      <div>
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-[10px] text-gray-500">Weekly</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-400">{fmtK(weeklyTotal)} / {fmtK(WEEKLY_LIMIT)}</span>
            <span className="text-[10px] text-gray-600">↻ {fmtCountdown(minsUntilWeeklyReset(now))}</span>
          </div>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${barColor(remaining_w)}`}
            style={{ width: `${remaining_w * 100}%` }} />
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-gray-700">
        <span>{cycles > 0 ? `${cycles} cycle${cycles !== 1 ? 's' : ''}` : 'no cycles yet'}</span>
        <span className="font-mono">Sonnet 4.6</span>
      </div>
    </div>
  )
}

export default function AgentGrid({ agents, tokensIn = 0, tokensOut = 0, tokensInWeek = 0, tokensOutWeek = 0, cycles = 0 }: {
  agents:         AgentStatus[]
  tokensIn?:      number
  tokensOut?:     number
  tokensInWeek?:  number
  tokensOutWeek?: number
  cycles?:        number
}) {
  if (!agents.length) {
    return <p className="text-sm text-gray-600">No agents registered.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {agents.map(a => (
        <AgentCard key={a.id} agent={a} />
      ))}
      <TokenUsageCard
        tokensIn={tokensIn}
        tokensOut={tokensOut}
        tokensInWeek={tokensInWeek}
        tokensOutWeek={tokensOutWeek}
        cycles={cycles}
      />
    </div>
  )
}
