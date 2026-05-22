'use client'

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

function TokenCard({ tokensIn, tokensOut, cycles }: { tokensIn: number; tokensOut: number; cycles: number }) {
  const cost = (tokensIn / 1_000_000) * 3 + (tokensOut / 1_000_000) * 15
  const fmtK = (n: number) => n === 0 ? '—' : n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n)

  return (
    <div className="bg-gray-900/50 border border-gray-800/60 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-violet-400/70" />
        <span className="text-xs font-medium text-violet-400/80">Usage</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-100">Token counter</p>
        <p className="text-xs text-gray-500 mt-1">Today's session</p>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">↓ Input</span>
          <span className="font-mono text-gray-300">{fmtK(tokensIn)}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">↑ Output</span>
          <span className="font-mono text-gray-300">{fmtK(tokensOut)}</span>
        </div>
        <div className="pt-1.5 border-t border-gray-800 flex justify-between text-[10px]">
          <span className="text-gray-600">{cycles > 0 ? `${cycles} cycle${cycles !== 1 ? 's' : ''} · ` : ''}~${cost.toFixed(2)}</span>
          <span className="text-gray-700 font-mono">Sonnet 4.6</span>
        </div>
      </div>
    </div>
  )
}

export default function AgentGrid({ agents, tokensIn = 0, tokensOut = 0, cycles = 0 }: {
  agents:    AgentStatus[]
  tokensIn?: number
  tokensOut?: number
  cycles?:   number
}) {
  if (!agents.length) {
    return <p className="text-sm text-gray-600">No agents registered.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {agents.map(a => (
        <AgentCard key={a.id} agent={a} />
      ))}
      <TokenCard tokensIn={tokensIn} tokensOut={tokensOut} cycles={cycles} />
    </div>
  )
}
