'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Mic, Volume2, Loader } from 'lucide-react'

interface Question {
  id: string
  question_text: string
  question_order: number
  is_follow_up: boolean
}

interface Answer {
  questionId: string
  text: string
}

export default function InterviewPage() {
  const params = useParams()
  const router = useRouter()
  const interviewId = params.id as string

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [userAnswer, setUserAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [useVoice, setUseVoice] = useState(true)

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)

      recognition.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          setUserAnswer((prev) => prev + finalTranscript)
        }
      }

      recognitionRef.current = recognition
    }

    synthRef.current = window.speechSynthesis

    // Load interview questions
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      const response = await fetch(`/api/interview/${interviewId}/questions`)
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to load questions')
        return
      }

      setQuestions(data.questions)
      setLoading(false)

      // Speak first question
      if (data.questions.length > 0 && useVoice) {
        speakQuestion(data.questions[0].question_text)
      }
    } catch (error) {
      console.error('[interview] Error loading questions:', error)
      toast.error('Failed to load interview')
    }
  }

  const speakQuestion = (text: string) => {
    if (!useVoice || !synthRef.current) return

    setIsSpeaking(true)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => setIsSpeaking(false)
    synthRef.current.speak(utterance)
  }

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in your browser')
      return
    }
    recognitionRef.current.start()
  }

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error('Please provide an answer')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/interview/${interviewId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: questions[currentQuestionIndex].id,
          answer: userAnswer,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to submit answer')
        return
      }

      // Store answer
      setAnswers([...answers, { questionId: questions[currentQuestionIndex].id, text: userAnswer }])
      setUserAnswer('')

      // Check if there are follow-up questions
      if (data.followUpQuestion) {
        // Add follow-up question to the list
        const newQuestion: Question = {
          id: data.followUpQuestion.id,
          question_text: data.followUpQuestion.text,
          question_order: questions[currentQuestionIndex].question_order + 0.5,
          is_follow_up: true,
        }
        const updatedQuestions = [
          ...questions.slice(0, currentQuestionIndex + 1),
          newQuestion,
          ...questions.slice(currentQuestionIndex + 1),
        ]
        setQuestions(updatedQuestions)
        
        // Stay on same index to answer follow-up
        if (useVoice) {
          speakQuestion(newQuestion.question_text)
        }
      } else {
        // Move to next question
        if (currentQuestionIndex + 1 < questions.length) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          if (useVoice) {
            speakQuestion(questions[currentQuestionIndex + 1].question_text)
          }
        } else {
          // Interview complete
          router.push(`/interview/${interviewId}/feedback`)
        }
      }
    } catch (error) {
      console.error('[interview] Error submitting answer:', error)
      toast.error('Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-12 h-12 mx-auto mb-4" />
          <p className="text-gray-600">Loading your interview...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Questions Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Unable to load interview questions.</p>
            <Button onClick={() => router.push('/interview/setup')} className="w-full">
              Start New Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((answers.length + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Interview in Progress</h1>
            <div className="flex items-center gap-2">
              <Button
                variant={useVoice ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUseVoice(!useVoice)}
                className="gap-2"
              >
                <Volume2 className="w-4 h-4" />
                {useVoice ? 'Voice On' : 'Voice Off'}
              </Button>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-600 mt-2">
            Question {answers.length + 1} of {questions.filter(q => !q.is_follow_up).length}
          </p>
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">
              {currentQuestion.question_text}
            </CardTitle>
            {currentQuestion.is_follow_up && (
              <CardDescription className="text-blue-600">Follow-up Question</CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Answer Input Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={6}
              placeholder="Type your answer here or use voice input..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
            />

            <div className="flex gap-2 flex-wrap">
              {useVoice && (
                <Button
                  variant="outline"
                  onClick={startListening}
                  disabled={isListening || isSpeaking || submitting}
                  className="gap-2"
                >
                  <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
                  {isListening ? 'Listening...' : 'Start Speaking'}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => speakQuestion(currentQuestion.question_text)}
                disabled={isSpeaking}
                className="gap-2"
              >
                <Volume2 className="w-4 h-4" />
                Repeat Question
              </Button>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    setCurrentQuestionIndex(currentQuestionIndex - 1)
                    setUserAnswer('')
                  }
                }}
                disabled={currentQuestionIndex === 0 || submitting}
                className="flex-1"
              >
                Previous
              </Button>

              <Button
                onClick={handleSubmitAnswer}
                disabled={submitting || !userAnswer.trim()}
                className="flex-1 gap-2"
              >
                {submitting && <Spinner className="w-4 h-4" />}
                {currentQuestionIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-2">Interview Tips:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Take your time to provide thoughtful answers</li>
              <li>• Use the Repeat Question button if you need to hear it again</li>
              <li>• You can edit your answer before submitting</li>
              <li>• AI will provide feedback and follow-up questions when needed</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
