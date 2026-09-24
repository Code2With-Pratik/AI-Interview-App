import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  createInterview,
  createResume,
  createManualInput,
  createQuestion
} from '@/lib/db'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { extractTextFromPDF } from '@/lib/pdf-parser'

// ✅ Initialize Gemini (NO dotenv needed in Next.js)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

function cleanText(input: string) {
  return input
    .replace(/\0/g, '') // remove null bytes
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '') // remove invalid UTF chars
    .replace(/\s+/g, ' ')
    .trim()
}

// ✅ Optimize large context (IMPORTANT)
function optimizeContext(text: string) {
  const MAX_LENGTH = 2000

  const cleaned = text.replace(/\s+/g, ' ').trim()

  const keywords = [
    'skills',
    'technologies',
    'experience',
    'projects',
    'responsibilities',
    'requirements'
  ]

  let important: string[] = []

  cleaned.split('.').forEach(line => {
    if (keywords.some(k => line.toLowerCase().includes(k))) {
      important.push(line.trim())
    }
  })

  const result = important.join('. ')

  return result.length > 200
    ? result.slice(0, MAX_LENGTH)
    : cleaned.slice(0, MAX_LENGTH)
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const method = formData.get('method') as string

    let interview
    let context = ''

    // ================================
    // 🔹 CONTEXT EXTRACTION
    // ================================

  if (method === 'resume') {
  const resumeText = formData.get('resumeText') as string
  const resumeFile = formData.get('resumeFile') as File

  let resumeContent = ''

  // ================================
  // FILE FIRST
  // ================================
  if (resumeFile) {
    try {
      const buffer = await resumeFile.arrayBuffer()
      const fileName = resumeFile.name.toLowerCase()

      if (fileName.endsWith('.pdf')) {
        resumeContent = await extractTextFromPDF(buffer)
      } else {
        resumeContent = new TextDecoder().decode(buffer)
      }

    } catch (error) {
      console.error('[Resume Parsing Failed]:', error)

      return NextResponse.json({
        error: 'Unable to read resume file. Please paste resume text instead.'
      }, { status: 400 })
    }
  }
  // ================================
  // TEXT FALLBACK
  // ================================
  else if (resumeText?.trim()) {
    resumeContent = resumeText
  }

  // ================================
  // VALIDATION
  // ================================
  if (!resumeContent || resumeContent.trim().length < 50) {
    return NextResponse.json({
      error: 'Resume content too short or invalid. Please provide proper resume.'
    }, { status: 400 })
  }

  // ================================
  // 🔥 CLEAN + LIMIT (CRITICAL FIX)
  // ================================
  resumeContent = cleanText(resumeContent).slice(0, 3000)

  // ================================
  // SAVE
  // ================================
  const resume = await createResume(
    user.id.toString(),
    resumeContent,
    resumeFile?.name || 'resume.txt'
  )

  interview = await createInterview(
    user.id.toString(),
    resume.id.toString(),
    null,
    null
  )

  context = `Candidate Profile:\n${resumeContent}`
}else if (method === 'jd') {
      const jobDescription = formData.get('jobDescription') as string

      if (!jobDescription) {
        return NextResponse.json({ error: 'Job description required' }, { status: 400 })
      }

      interview = await createInterview(user.id.toString(), null, jobDescription, null)

      context = `Job Description: ${jobDescription}`

    } else if (method === 'manual') {
      const skills = formData.get('skills') as string

      const manualInput = await createManualInput(
        user.id.toString(),
        (formData.get('languages') as string).split(','),
        skills.split(','),
        formData.get('experienceLevel') as string,
        formData.get('jobTitle') as string
      )

      interview = await createInterview(user.id.toString(), null, null, manualInput.id.toString())

      context = `Skills: ${skills}`
    }

    if (!interview) throw new Error('Failed to create interview')

    // ================================
    // 🔥 OPTIMIZE CONTEXT (KEY FIX)
    // ================================
    const optimizedContext = optimizeContext(context)

    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' })

    let questionText = ''

    try {
      const result = await model.generateContent(`
You are an expert interviewer.

Candidate Information:
${optimizedContext}

Generate:
- 3 technical questions
- 2 behavioral questions

Rules:
- Total exactly 5 questions
- Keep them relevant and concise
- Return ONLY questions numbered 1-5
      `)

      const response = await result.response
      questionText = response.text()

    } catch (error) {
      console.error('Gemini failed, using fallback:', error)

      // ✅ fallback (VERY IMPORTANT)
      questionText = `
1. Tell me about yourself
2. What are your strengths?
3. Describe a project you worked on
4. What challenges have you faced?
5. Why do you want this role?
      `
    }

    // ================================
    // 🔹 PARSE QUESTIONS
    // ================================

    const questions = questionText
      .split('\n')
      .map(q => q.replace(/^\d+\.\s*/, '').trim())
      .filter(q => q.length > 5)
      .slice(0, 5)

    if (questions.length === 0) {
      throw new Error('Failed to generate questions')
    }

    // ================================
    // 🔹 STORE QUESTIONS
    // ================================

    for (let i = 0; i < questions.length; i++) {
      await createQuestion(
        String(interview.id),
        questions[i],
        i + 1,
        false,
        null
      )
    }

    return NextResponse.json({
      interviewId: interview.id,
      questionsCount: questions.length
    })

  } catch (error: any) {
    console.error('[interview/setup] Error:', error)

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}