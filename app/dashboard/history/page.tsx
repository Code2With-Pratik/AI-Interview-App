'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface Interview {
  id: string
  started_at: string
  completed_at: string | null
  overall_score: number | null
  status: 'in_progress' | 'completed'
  resume_id: string | null
  job_description: string | null
}

export default function HistoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [filtered, setFiltered] = useState<Interview[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadInterviews()
  }, [])

  useEffect(() => {
    if (searchTerm === '') {
      setFiltered(interviews)
    } else {
      setFiltered(
        interviews.filter(
          (i) =>
            i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            new Date(i.started_at).toLocaleDateString().includes(searchTerm)
        )
      )
    }
  }, [searchTerm, interviews])

  const loadInterviews = async () => {
    try {
      const response = await fetch('/api/interview/list')
      const data = await response.json()

      if (response.ok) {
        setInterviews(data.interviews)
        setFiltered(data.interviews)
      }

      setLoading(false)
    } catch (error) {
      console.error('[history] Error:', error)
      toast.error('Failed to load interview history')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Spinner className="w-12 h-12" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Interview History</h1>
            <p className="text-gray-600">View all your completed and in-progress interviews</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search by date or interview ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Interviews List */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-gray-600 mb-6">No interviews found.</p>
              <Button asChild>
                <Link href="/interview/setup">Start New Interview</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((interview) => (
              <Card key={interview.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {interview.resume_id ? '📄 Resume Based' : interview.job_description ? '💼 Job Description Based' : '⚙️ Manual Selection'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        Started: {new Date(interview.started_at).toLocaleString()}
                      </p>
                      {interview.completed_at && (
                        <p className="text-sm text-gray-600 mb-1">
                          Completed: {new Date(interview.completed_at).toLocaleString()}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            interview.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {interview.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      {interview.overall_score && (
                        <div className="mb-4">
                          <p className="text-4xl font-bold text-blue-600">
                            {(interview.overall_score || 0).toFixed(1)} 
                          </p>
                          <p className="text-xs text-gray-600">/10</p>
                        </div>
                      )}
                      {interview.status === 'completed' && interview.overall_score ? (
                        <Button asChild size="sm">
                          <Link href={`/interview/${interview.id}/feedback`}>View Feedback</Link>
                        </Button>
                      ) : interview.status === 'in_progress' ? (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/interview/${interview.id}`}>Continue</Link>
                        </Button>
                      ) : (
                        <p className="text-xs text-gray-500">Not scored</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {interviews.length > 0 && (
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Your Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-600 text-sm">Total Interviews</p>
                  <p className="text-2xl font-bold">{interviews.length}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Completed</p>
                  <p className="text-2xl font-bold">
                    {interviews.filter((i) => i.status === 'completed').length}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Average Score</p>
                  <p className="text-2xl font-bold">
                    {(() => {
                      const completed = interviews.filter((i) => i.overall_score)
                      return completed.length > 0
                        ? (completed.reduce((sum, i) => sum + (i.overall_score || 0), 0) / completed.length).toFixed(1)
                        : 'N/A'
                    })()}
                    {interviews.some((i) => i.overall_score) && <span className="text-lg">/10</span>}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
