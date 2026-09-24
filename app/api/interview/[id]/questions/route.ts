import { NextRequest, NextResponse } from 'next/server'
import { getQuestionsByInterviewId } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const interviewId = id

    const questions = await getQuestionsByInterviewId(interviewId)

    return NextResponse.json({
      questions,
    })
  } catch (error) {
    console.error('[questions] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
