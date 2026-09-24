'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { FileText, Briefcase, Settings } from 'lucide-react'

export default function InterviewSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'choose' | 'configure'>('choose')
  const [method, setMethod] = useState<'resume' | 'jd' | 'manual' | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [languages, setLanguages] = useState('')
  const [skills, setSkills] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('mid')
  const [jobTitle, setJobTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    const fileName = file.name.toLowerCase()
    const isPDF = fileName.endsWith('.pdf')
    const isDOC = fileName.endsWith('.doc') || fileName.endsWith('.docx')
    const isText = fileName.endsWith('.txt')

    if (!isPDF && !isDOC && !isText && !validTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOC, DOCX, or TXT file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setResumeFile(file)
    toast.success(`Resume file "${file.name}" selected (${(file.size / 1024).toFixed(1)}KB)`)
  }

  const handleStart = async () => {
    if (!method) {
      toast.error('Please select an interview method')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('method', method)

      if (method === 'resume' && (resumeFile || resumeText)) {
        if (resumeFile) {
          formData.append('resumeFile', resumeFile)
        } else {
          formData.append('resumeText', resumeText)
        }
      } else if (method === 'jd') {
        formData.append('jobDescription', jobDescription)
      } else if (method === 'manual') {
        formData.append('languages', languages)
        formData.append('skills', skills)
        formData.append('experienceLevel', experienceLevel)
        formData.append('jobTitle', jobTitle)
      }

      const response = await fetch('/api/interview/setup', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to start interview')
        return
      }

      toast.success('Interview started!')
      router.push(`/interview/${data.interviewId}`)
    } catch (error) {
      console.error('[setup] Error:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {step === 'choose' ? (
          <>
            <h1 className="text-4xl font-bold text-center mb-4">Start Your Interview</h1>
            <p className="text-center text-gray-600 mb-12">
              Choose how you&apos;d like to prepare for your interview
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Resume Option */}
              <Card
                className={`cursor-pointer transition-all ${
                  method === 'resume' ? 'ring-2 ring-blue-600' : ''
                }`}
                onClick={() => {
                  setMethod('resume')
                  setStep('configure')
                }}
              >
                <CardHeader>
                  <FileText className="w-12 h-12 text-blue-600 mb-4" />
                  <CardTitle>Resume Based</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600">
                  <p>Upload your resume or paste its content. AI will generate interview questions based on your experience and skills.</p>
                </CardContent>
              </Card>

              {/* Job Description Option */}
              <Card
                className={`cursor-pointer transition-all ${
                  method === 'jd' ? 'ring-2 ring-blue-600' : ''
                }`}
                onClick={() => {
                  setMethod('jd')
                  setStep('configure')
                }}
              >
                <CardHeader>
                  <Briefcase className="w-12 h-12 text-purple-600 mb-4" />
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600">
                  <p>Provide the job description you&apos;re applying for. AI will generate relevant questions based on the role requirements.</p>
                </CardContent>
              </Card>

              {/* Manual Option */}
              <Card
                className={`cursor-pointer transition-all ${
                  method === 'manual' ? 'ring-2 ring-blue-600' : ''
                }`}
                onClick={() => {
                  setMethod('manual')
                  setStep('configure')
                }}
              >
                <CardHeader>
                  <Settings className="w-12 h-12 text-green-600 mb-4" />
                  <CardTitle>Manual Selection</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600">
                  <p>Specify your skills, languages, and experience level. AI will create custom questions tailored to your profile.</p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-4">Configure Your Interview</h1>

            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>
                  {method === 'resume' && 'Upload or Paste Your Resume'}
                  {method === 'jd' && 'Provide Job Description'}
                  {method === 'manual' && 'Select Your Profile'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {method === 'resume' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Upload PDF, DOC, DOCX, or TXT Resume</label>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="mb-2"
                      />
                      {resumeFile && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-900">{resumeFile.name}</p>
                            <p className="text-xs text-green-700">{(resumeFile.size / 1024).toFixed(1)}KB</p>
                          </div>
                          <span className="text-green-600 text-sm font-medium">✓ Ready</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t pt-4">
                      <label className="block text-sm font-medium mb-2">Or Paste Resume Text</label>
                      <Textarea
                        placeholder="Paste your resume content here..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        rows={10}
                      />
                      {resumeText && (
                        <p className="text-xs text-gray-500 mt-2">
                          {resumeText.split(/\s+/).length} words
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
  ⚠️ PDF parsing may not always work perfectly. If issues occur, paste your resume text below.
</p>
                    </div>
                  </>
                )}

                {method === 'jd' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Job Description</label>
                    <Textarea
                      placeholder="Paste the job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={12}
                    />
                  </div>
                )}

                {method === 'manual' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Job Title (Optional)</label>
                      <Input
                        placeholder="e.g., Full Stack Developer"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Languages/Programming Languages</label>
                      <Input
                        placeholder="e.g., JavaScript, Python, SQL"
                        value={languages}
                        onChange={(e) => setLanguages(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Skills</label>
                      <Textarea
                        placeholder="e.g., React, Node.js, Database Design, API Development"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Experience Level</label>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="junior">Junior (0-2 years)</option>
                        <option value="mid">Mid-level (2-5 years)</option>
                        <option value="senior">Senior (5+ years)</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('choose')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleStart}
                    disabled={loading || (!resumeFile && !resumeText && !jobDescription && !languages && !skills)}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Starting Interview...
                      </>
                    ) : (
                      'Start Interview'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
