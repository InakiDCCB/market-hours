import { NextResponse } from 'next/server'

export function checkSecret(secret: string | null) {
  if (secret !== process.env.AGENT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
