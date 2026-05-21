import { NextRequest, NextResponse } from 'next/server'
import { checkSecret } from '../../../../lib/auth'
import { syncAlpacaState } from '../../../../lib/alpaca-sync'

export const revalidate = 0

// GET /api/db/sync-alpaca?secret=TOKEN
// Fetches Alpaca account + positions and writes to alpaca_state table.
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const denied = checkSecret(p.get('secret'))
  if (denied) return denied

  const result = await syncAlpacaState()
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 })
  return NextResponse.json(result)
}
