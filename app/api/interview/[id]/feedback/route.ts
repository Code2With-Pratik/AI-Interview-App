import { NextRequest, NextResponse } from 'next/server'
import { getAnswersByInterviewId, getQuestionsByInterviewId, updateInterviewScore } from '@/lib/db'
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
    const answers = await getAnswersByInterviewId(interviewId)

    // Compile feedback with questions and answers
    const feedback = questions
      .filter(q => !q.is_follow_up) // Only base questions
      .map((question) => {
        const answer = answers.find(a => a.question_id === question.id)
        return {
          question: question.question_text,
          answer: answer?.answer_text || 'No answer provided',
          feedback: answer?.feedback || 'No feedback available',
          rating: answer?.rating || 0,
        }
      })

    // Calculate overall score
    const ratings = answers
  .map(a => Number(a.rating) || 0)  
  .filter(r => r > 0)
   const overallScore = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0
     await updateInterviewScore(interviewId, overallScore)

    return NextResponse.json({
      feedback,
     overallScore: Number((overallScore || 0).toFixed(1)),
    })
  } catch (error) {
    console.error('[feedback] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
