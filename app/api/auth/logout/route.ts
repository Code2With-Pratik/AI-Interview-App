import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie, clearAuthCookie } from '@/lib/auth'
import { deleteSession } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthCookie()
    
    if (token) {
      await deleteSession(token)
    }

    await clearAuthCookie()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[logout] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
