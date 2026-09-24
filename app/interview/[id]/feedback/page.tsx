'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface QuestionFeedback {
  question: string
  answer: string
  feedback: string
  rating: number
}

export default function FeedbackPage() {
  const params = useParams()
  const router = useRouter()
  const interviewId = params.id as string

  const [loading, setLoading] = useState(true)
  const [feedbackList, setFeedbackList] = useState<QuestionFeedback[]>([])
  const [overallScore, setOverallScore] = useState(0)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  useEffect(() => {
    loadFeedback()
  }, [])

  const loadFeedback = async () => {
    try {
      const response = await fetch(`/api/interview/${interviewId}/feedback`)
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to load feedback')
        return
      }

      setFeedbackList(data.feedback)
      setOverallScore(data.overallScore)
      setLoading(false)
    } catch (error) {
      console.error('[feedback] Error:', error)
      toast.error('Failed to load feedback')
    }
  }

  const handleRetake = async () => {
    router.push(`/interview/setup?retake=${interviewId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-12 h-12 mx-auto mb-4" />
          <p className="text-gray-600">Generating your feedback...</p>
        </div>
      </div>
    )
  }

  const scoreColor = overallScore >= 8 ? 'text-green-600' : overallScore >= 6 ? 'text-yellow-600' : 'text-red-600'
  const scoreBg = overallScore >= 8 ? 'bg-green-50' : overallScore >= 6 ? 'bg-yellow-50' : 'bg-red-50'

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Overall Score */}
        <Card className={`mb-8 ${scoreBg}`}>
          <CardHeader>
            <CardTitle className="text-center text-3xl">Your Interview Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-6xl font-bold ${scoreColor} mb-4`}>
                {(overallScore || 0).toFixed(1)}/10
              </div>
              <p className="text-gray-600 mb-6">
                {overallScore >= 8 && '🎉 Excellent performance! You&apos;re well-prepared.'}
                {overallScore >= 6 && overallScore < 8 && '✅ Good effort! A few areas to improve.'}
                {overallScore < 6 && '📚 Keep practicing to improve your skills.'}
              </p>

              <div className="flex gap-4 justify-center">
                <Button onClick={handleRetake}>Retake Interview</Button>
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Feedback */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">Question-by-Question Feedback</h2>

          {feedbackList.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <div
                className="cursor-pointer p-6 hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{item.question}</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">{item.rating}/10</span>
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.rating >= 8
                                ? 'bg-green-600'
                                : item.rating >= 6
                                ? 'bg-yellow-600'
                                : 'bg-red-600'
                            }`}
                            style={{ width: `${(item.rating / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {expandedIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600 shrink-0" />
                  )}
                </div>
              </div>

              {expandedIndex === index && (
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Your Answer</h4>
                      <p className="text-gray-600 bg-white p-3 rounded border border-gray-200">
                        {item.answer}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Feedback</h4>
                      <p className="text-gray-600 bg-white p-3 rounded border border-gray-200">
                        {item.feedback}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Rating Breakdown</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <p className="text-xs text-gray-600">Content Quality</p>
                          <p className="text-lg font-semibold text-blue-600">{Math.round(item.rating * 0.9)}/10</p>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <p className="text-xs text-gray-600">Clarity</p>
                          <p className="text-lg font-semibold text-blue-600">{Math.round(item.rating * 0.85)}/10</p>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <p className="text-xs text-gray-600">Relevance</p>
                          <p className="text-lg font-semibold text-blue-600">{Math.round(item.rating * 0.95)}/10</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Recommendations */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Improvement Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="space-y-2 text-gray-700">
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Practice speaking clearly and avoiding filler words like "um" and "uh"</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Structure your answers using the STAR method (Situation, Task, Action, Result)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Research the company and role before interviews to provide better context</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Record yourself to identify areas for improvement in tone and pacing</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
