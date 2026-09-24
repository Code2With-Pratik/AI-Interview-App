import { NextRequest, NextResponse } from 'next/server'
import { createAnswer, createQuestion, getQuestionsByInterviewId } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export async function POST(
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

    const { questionId, answer } = await request.json()

    if (!questionId || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { id: interviewId } = await params

    // Generate feedback and rating using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' })

    const feedbackPrompt = `You are an expert interview coach. Evaluate this interview answer and provide feedback.

Answer: "${answer}"

Provide:
1. A rating from 1-10 (on a single line at the start: "RATING: X")
2. Specific feedback about what was good
3. What could be improved

Format your response as:
RATING: [number]
FEEDBACK: [your feedback]`

    const result = await model.generateContent(feedbackPrompt)
    const feedbackText = result.response.text()

    // Parse rating and feedback
    const ratingMatch = feedbackText.match(/RATING:\s*(\d+)/)
    const rating = ratingMatch ? parseInt(ratingMatch[1]) : 7

    const feedbackMatch = feedbackText.match(/FEEDBACK:\s*([\s\S]*?)(?=FOLLOW_UP:|$)/)
    const feedback = feedbackMatch ? feedbackMatch[1].trim() : feedbackText

    const followUpMatch = feedbackText.match(/FOLLOW_UP:\s*(.+?)$/)
    const followUpText = followUpMatch ? followUpMatch[1].trim() : ''

    // Store answer with feedback
    await createAnswer(questionId, answer, feedback, rating)

    return NextResponse.json({
      rating,
      feedback,
      followUpQuestion: null, // always null
    })
  } catch (error) {
    console.error('[answer] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
