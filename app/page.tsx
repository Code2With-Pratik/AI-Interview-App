'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, FileText, MessageSquare, BarChart3, Lock, CheckCircle } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              I
            </div>
            <span className="font-bold text-lg">InterviewAI</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 text-sm">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 text-sm">
              How It Works
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm">
              Pricing
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Master Your Next Interview with <span className="text-blue-600">Voice AI</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Practice with realistic voice-to-voice AI interviews. Get personalized feedback, improve your communication skills, and land your dream job with confidence.
            </p>
            <div className="flex gap-4 mb-8">
              <Button size="lg" asChild>
                <Link href="/auth/register">Start Free Interview</Link>
              </Button>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                No Credit Card Required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                AI-Generated Questions
              </div>
            </div>
          </div>
          <div className="bg-linear-to-br from-blue-100 to-indigo-100 rounded-2xl h-96 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <Mic className="w-24 h-24 mx-auto mb-4 opacity-50" />
              <p>Interview Demo Preview</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Powerful Features for Interview Success</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Our AI-powered platform provides everything you need to ace your next interview
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <FileText className="w-10 h-10 text-blue-600 mb-4" />
                <CardTitle>AI-Generated Questions</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Smart interview questions tailored to your resume, job description, and experience level using Google Gemini AI.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Mic className="w-10 h-10 text-purple-600 mb-4" />
                <CardTitle>Voice-to-Voice Interaction</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Practice with realistic voice conversations using advanced speech-to-text and text-to-speech technology.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="w-10 h-10 text-green-600 mb-4" />
                <CardTitle>Intelligent Feedback</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Receive detailed AI feedback with ratings, correct answers, and improvement suggestions for each response.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="w-10 h-10 text-orange-600 mb-4" />
                <CardTitle>Resume Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Upload your resume or enter job description to get personalized question generation based on your skills.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-10 h-10 text-red-600 mb-4" />
                <CardTitle>Interview History</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Track your progress with detailed analytics, performance trends, and score improvements over time.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="w-10 h-10 text-indigo-600 mb-4" />
                <CardTitle>Secure Platform</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Your data is protected with enterprise-grade security and OAuth authentication for your privacy.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: 1, title: 'Upload Resume', desc: 'Upload your resume or enter job description' },
              { number: 2, title: 'Get AI Questions', desc: 'Our AI generates tailored interview questions' },
              { number: 3, title: 'Voice Interview', desc: 'Practice speaking in a realistic interview setting' },
              { number: 4, title: 'Get Feedback', desc: 'Receive ratings and improvement suggestions' },
            ].map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {step.number}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-12">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i <= 2 ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                desc: 'Perfect for getting started',
                features: ['3 mock interviews per month', 'Basic AI feedback', 'Interview history'],
              },
              {
                name: 'Pro',
                price: '$19',
                desc: 'Most popular choice',
                features: [
                  'Unlimited interviews',
                  'Advanced AI feedback',
                  'Resume analysis',
                  'Performance analytics',
                ],
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: '$99',
                desc: 'For teams and organizations',
                features: [
                  'Everything in Pro',
                  'Team management',
                  'Custom integrations',
                  'Priority support',
                ],
              },
            ].map((plan) => (
              <Card
                key={plan.name}
                className={plan.highlight ? 'border-blue-600 border-2 relative' : ''}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.desc}</CardDescription>
                  <div className="text-3xl font-bold mt-4">{plan.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.highlight ? 'default' : 'outline'}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Ace Your Next Interview?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of candidates who have improved their interview skills with InterviewAI
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/register">Start Free Interview</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
              Watch Demo Video
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  I
                </div>
                <span className="font-bold">InterviewAI</span>
              </div>
              <p className="text-sm text-gray-600">AI-powered interviews to help you land your dream job.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#features" className="hover:text-gray-900">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-gray-900">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-gray-900">About</Link></li>
                <li><Link href="#" className="hover:text-gray-900">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-gray-900">FAQ</Link></li>
                <li><Link href="#" className="hover:text-gray-900">Help Center</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex justify-between items-center text-sm text-gray-600">
            <p>&copy; 2026 InterviewAI. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-gray-900">Privacy</Link>
              <Link href="#" className="hover:text-gray-900">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
