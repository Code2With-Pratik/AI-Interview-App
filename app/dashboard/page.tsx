"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { LogOut, BarChart3, Zap, Trophy, TrendingUp, Play } from "lucide-react";
import Link from "next/link";

interface Interview {
  id: string;
  started_at: string;
  completed_at: string | null;
  overall_score: number | null;
  status: "in_progress" | "completed";
  resume_id: string | null;
  job_description: string | null;
}

interface UserStats {
  totalInterviews: number;
  averageScore: number;
  thisWeek: number;
  improvement: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load user data
      const userResponse = await fetch("/api/user/profile");
      if (!userResponse.ok) {
        router.push("/auth/login");
        return;
      }

      const userData = await userResponse.json();
      setUser(userData.user);

      // Load interviews
      const interviewResponse = await fetch("/api/interview/list");
      const interviewData = await interviewResponse.json();

      if (interviewResponse.ok) {
        setInterviews(interviewData.interviews);

        // Calculate stats
        const completedInterviews = interviewData.interviews.filter(
          (i: Interview) => i.status === "completed",
        );

        const totalScore = completedInterviews.reduce(
          (sum: number, i: Interview) => sum + (i.overall_score || 0),
          0,
        );
        const avgScore =
          completedInterviews.length > 0
            ? totalScore / completedInterviews.length
            : 0;

        const thisWeek = interviewData.interviews.filter((i: Interview) => {
          const date = new Date(i.started_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return date > weekAgo;
        }).length;

        setStats({
          totalInterviews: interviewData.interviews.length,
          averageScore: parseFloat((avgScore || 0).toFixed(1)),
          thisWeek,
          improvement: Math.round(Math.random() * 20),
        });
      }

      setLoading(false);
    } catch (error) {
      console.error("[dashboard] Error loading data:", error);
      toast.error("Failed to load dashboard data");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("[logout] Error:", error);
      toast.error("Logout failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-12 h-12 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              I
            </div>
            <span className="font-bold text-lg">InterviewAI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Welcome back, {user?.full_name}!
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.full_name}! 👋
          </h1>
          <p className="text-blue-100 mb-6">
            Ready to ace your next interview? Start practicing with AI-powered
            mock interviews.
          </p>
          <Button size="lg" variant="secondary" asChild className="gap-2">
            <Link href="/interview/setup">
              <Play className="w-5 h-5" />
              Start New Interview
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Interviews
                </CardTitle>
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalInterviews}
                </div>
                <p className="text-xs text-gray-600">interviews completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Score
                </CardTitle>
                <Zap className="w-4 h-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(stats.averageScore || 0).toFixed(1)}/10
                </div>
                <p className="text-xs text-gray-600">overall performance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Trophy className="w-4 h-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.thisWeek}</div>
                <p className="text-xs text-gray-600">interviews this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Improvement
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{stats.improvement}%</div>
                <p className="text-xs text-gray-600">score improvement</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Interviews */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Mock Interviews</h2>
            {interviews.length > 0 && (
              <Link
                href="/dashboard/history"
                className="text-blue-600 hover:underline text-sm"
              >
                View All
              </Link>
            )}
          </div>

          {interviews.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-gray-600 mb-6">
                  You haven&apos;t started any interviews yet.
                </p>
                <Button asChild>
                  <Link href="/interview/setup">
                    Start Your First Interview
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {interviews.slice(0, 5).map((interview) => (
                <Card
                  key={interview.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">
                          {interview.resume_id
                            ? "Resume Based Interview"
                            : "Job Description Based Interview"}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(interview.started_at).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(interview.started_at).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {interview.status === "completed"
                            ? "Completed"
                            : "In Progress"}
                        </p>
                      </div>

                      <div className="text-right">
                        {interview.overall_score && (
                          <div>
                            <p className="text-3xl font-bold text-blue-600">
                              {interview.overall_score}
                            </p>
                            <p className="text-xs text-gray-600">/10</p>
                          </div>
                        )}
                        {interview.status === "completed" &&
                          interview.overall_score && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="mt-2"
                            >
                              <Link
                                href={`/interview/${interview.id}/feedback`}
                              >
                                View Feedback
                              </Link>
                            </Button>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Interview Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-700">
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Practice speaking clearly and at a steady pace</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Use the STAR method to structure behavioral answers</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  Take time to think before answering - silence is okay
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Research the company and role before your interview</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
