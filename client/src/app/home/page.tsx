"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Bell,
  User,
  Award,
  Moon,
  Globe,
  LogOut,
  Calendar,
  Clock,
  Brain,
  Zap,
  TrendingUp,
  Target,
  Star,
  ChevronRight,
  Play,
  Sparkles,
  BarChart3,
  MessageCircle,
  Lightbulb,
  Timer,
  Trophy,
  FlameIcon as Fire,
  Activity,
  Plus,
  BookOpen,
  FileText,
  HelpCircle,
  Edit,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface StudyItem {
  id: string
  type: "flashcard" | "note" | "question"
  front?: string
  back?: string
  content?: string
  question?: string
  answer?: string
  options?: string[]
}

interface StudyKit {
  id: string
  title: string
  description: string
  items: StudyItem[]
  createdAt: string
  lastStudied?: string
  completionRate?: number
  bestScore?: number
}

interface StudySession {
  kitId: string
  kitTitle: string
  score: number
  duration: number
  completedAt: string
}

const AIInsightCard = ({ title, insight, confidence }: { title: string; insight: string; confidence: number }) => (
  <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border-white/20 hover:scale-105 transition-all duration-300">
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="w-4 h-4 text-purple-300" />
        <span className="text-white font-medium text-sm">{title}</span>
        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">{confidence}% confident</Badge>
      </div>
      <p className="text-purple-200 text-sm">{insight}</p>
    </CardContent>
  </Card>
)

const StudyStreakCard = ({ studySessions }: { studySessions: StudySession[] }) => {
  const calculateStreak = () => {
    if (studySessions.length === 0) return 0

    const today = new Date()
    let streak = 0
    const currentDate = new Date(today)

    for (let i = 0; i < 30; i++) {
      const dateStr = currentDate.toDateString()
      const hasStudiedToday = studySessions.some((session) => new Date(session.completedAt).toDateString() === dateStr)

      if (hasStudiedToday) {
        streak++
      } else if (i > 0) {
        break
      }

      currentDate.setDate(currentDate.getDate() - 1)
    }

    return streak
  }

  const streak = calculateStreak()
  const todayStudied = studySessions.some(
    (session) => new Date(session.completedAt).toDateString() === new Date().toDateString(),
  )

  return (
    <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl border-white/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Fire className="w-6 h-6 text-orange-400" />
            <span className="text-white font-bold text-lg">Study Streak</span>
          </div>
          <div className="text-3xl font-bold text-orange-400">{streak}</div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-purple-200">Days in a row</span>
            <span className="text-orange-300">{streak > 0 ? "Keep it up!" : "Start today!"}</span>
          </div>
          {!todayStudied && (
            <Button
              onClick={() => (window.location.href = "/create-kit")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Today's Session
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const QuickActionsGrid = () => {
  const router = useRouter()

  const actions = [
    {
      icon: Plus,
      label: "Create Study Kit",
      color: "from-purple-500 to-pink-500",
      action: () => router.push("/create-kit"),
    },
    { icon: MessageCircle, label: "Ask AI", color: "from-blue-500 to-cyan-500", action: () => {} },
    { icon: Lightbulb, label: "Generate Quiz", color: "from-yellow-500 to-orange-500", action: () => {} },
    { icon: Timer, label: "Pomodoro", color: "from-green-500 to-emerald-500", action: () => {} },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {actions.map((action, idx) => (
        <Button
          key={idx}
          onClick={action.action}
          className={`h-20 bg-gradient-to-r ${action.color} hover:scale-105 transition-all duration-300 flex flex-col gap-2`}
        >
          <action.icon className="w-6 h-6" />
          <span className="text-sm font-medium">{action.label}</span>
        </Button>
      ))}
    </div>
  )
}

const StudyKitCard = ({ kit, onStudy, onDelete }: { kit: StudyKit; onStudy: () => void; onDelete: () => void }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "flashcard":
        return <BookOpen className="w-3 h-3" />
      case "note":
        return <FileText className="w-3 h-3" />
      case "question":
        return <HelpCircle className="w-3 h-3" />
      default:
        return <BookOpen className="w-3 h-3" />
    }
  }

  const typeCounts = kit.items.reduce(
    (acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 transition-all group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg mb-1">{kit.title}</CardTitle>
            <p className="text-purple-200 text-sm line-clamp-2">{kit.description || "No description"}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Edit className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white/10 backdrop-blur-xl border-white/20">
              <DropdownMenuItem onClick={onDelete} className="text-red-300 hover:bg-red-500/20">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Kit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2 mb-4">
          {Object.entries(typeCounts).map(([type, count]) => (
            <Badge key={type} className="bg-purple-500/20 text-purple-200 border-purple-500/30 text-xs">
              {getTypeIcon(type)}
              <span className="ml-1">{count}</span>
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-purple-300">Created {new Date(kit.createdAt).toLocaleDateString()}</div>
          {kit.lastStudied && (
            <div className="text-xs text-purple-300">Last studied {new Date(kit.lastStudied).toLocaleDateString()}</div>
          )}
        </div>

        {kit.completionRate !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-purple-200 mb-1">
              <span>Best Score</span>
              <span>{kit.bestScore || 0}%</span>
            </div>
            <Progress value={kit.bestScore || 0} className="h-1" />
          </div>
        )}

        <Button
          onClick={onStudy}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 group-hover:scale-105 transition-all"
        >
          <Play className="w-4 h-4 mr-2" />
          {kit.lastStudied ? "Continue Studying" : "Start Studying"}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("home")
  const [showNotifications, setShowNotifications] = useState(false)
  const [userName] = useState("User")
  const [studyTime, setStudyTime] = useState(0)
  const [weeklyGoal] = useState(300) // hours
  const [completedTasks, setCompletedTasks] = useState(0)
  const [totalTasks] = useState(0)

  const [studyKits, setStudyKits] = useState<StudyKit[]>([])
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [totalStudyTime, setTotalStudyTime] = useState(0)

  useEffect(() => {
    const loadStudyData = () => {
      const kits = JSON.parse(localStorage.getItem("studyKits") || "[]")
      const sessions = JSON.parse(localStorage.getItem("studySessions") || "[]")

      setStudyKits(kits)
      setStudySessions(sessions)

      // Calculate total study time from sessions
      const totalTime = sessions.reduce((acc: number, session: StudySession) => acc + session.duration, 0)
      setTotalStudyTime(totalTime)
    }

    loadStudyData()

    // Listen for storage changes
    const handleStorageChange = () => loadStudyData()
    window.addEventListener("storage", handleStorageChange)

    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const avgScore =
    studySessions.length > 0
      ? Math.round(studySessions.reduce((acc, session) => acc + session.score, 0) / studySessions.length)
      : 0
  const aiScore = Math.min(100, Math.round((totalStudyTime / 60) * 2 + avgScore * 0.5))

  const deleteStudyKit = (kitId: string) => {
    const updatedKits = studyKits.filter((kit) => kit.id !== kitId)
    setStudyKits(updatedKits)
    localStorage.setItem("studyKits", JSON.stringify(updatedKits))
  }

  const navigationItems = [
    { id: "notes", label: "NOTES AND MINDMAPS", icon: "📝" },
    { id: "planner", label: "PLANNER AND CALENDAR", icon: "📅" },
    { id: "ai-tools", label: "AI TOOLS", icon: "🤖" },
    { id: "exam", label: "EXAM GENERATOR", icon: "📊" },
  ]

  const renderMainContent = () => {
    switch (activeSection) {
      case "notes":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold text-white">Notes & Mindmaps</h2>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/20 transition-all cursor-pointer hover:scale-105 group">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">✏️</div>
                    <h3 className="text-2xl font-semibold text-white mb-2">NOTES EDITOR</h3>
                    <p className="text-purple-200 mb-4">Create and organize your study notes</p>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">0 recent notes</Badge>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/20 transition-all cursor-pointer hover:scale-105 group">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🧠</div>
                    <h3 className="text-2xl font-semibold text-white mb-2">NodeFlow</h3>
                    <p className="text-purple-200 mb-4">Visual mind mapping tool</p>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">AI-powered</Badge>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                <div className="space-y-3">
                  {studyKits.slice(0, 3).map((kit, idx) => (
                    <Card key={idx} className="bg-white/5 backdrop-blur-sm border-white/10 p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-purple-200 text-sm">{kit.title}</span>
                      </div>
                    </Card>
                  ))}
                  {studyKits.length === 0 && (
                    <div className="text-center text-purple-300 text-sm py-4">
                      No study kits yet. Create your first one!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case "planner":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold text-white">Planner & Calendar</h2>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                <Calendar className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/20 transition-all cursor-pointer hover:scale-105 group">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📅</div>
                    <h3 className="text-2xl font-semibold text-white mb-2">MY SCHEDULE</h3>
                    <p className="text-purple-200 mb-4">Manage your daily schedule</p>
                    <div className="flex justify-center gap-2">
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">0 today</Badge>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Smart sync</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/20 transition-all cursor-pointer hover:scale-105 group">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📋</div>
                    <h3 className="text-2xl font-semibold text-white mb-2">STUDY PLANNER</h3>
                    <p className="text-purple-200 mb-4">AI-optimized study sessions</p>
                    <Progress value={(completedTasks / totalTasks) * 100} className="w-full" />
                    <p className="text-xs text-purple-300 mt-2">
                      {completedTasks}/{totalTasks} tasks completed
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Today's Focus</h3>
                <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border-white/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">Priority Subject</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">--</p>
                  <p className="text-green-300 text-sm">--</p>
                </Card>
              </div>
            </div>
          </div>
        )

      case "ai-tools":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold text-white">AI Tools</h2>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                AI Powered
              </Badge>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border-white/20 hover:scale-105 transition-all cursor-pointer group">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">💬</div>
                    <h3 className="text-2xl font-semibold text-white mb-2">ASKLY</h3>
                    <p className="text-purple-200 mb-4">Advanced AI tutor for instant help</p>
                    <div className="flex justify-center gap-2">
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Offline</Badge>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">--</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border-white/20 hover:scale-105 transition-all cursor-pointer group">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🧮</div>
                    <h3 className="text-2xl font-semibold text-white mb-2">NeuroNode</h3>
                    <p className="text-purple-200 mb-4">Advanced document analysis</p>
                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">Neural processing</Badge>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">AI Insights</h3>
                <AIInsightCard title="Study Pattern" insight="--" confidence={0} />
                <AIInsightCard title="Weak Areas" insight="--" confidence={0} />
              </div>
            </div>
          </div>
        )

      case "exam":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold text-white">Exam Generator</h2>
              <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
                <Trophy className="w-4 h-4 mr-2" />
                Start Exam
              </Button>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-xl border-white/20 hover:scale-105 transition-all cursor-pointer group">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📚</div>
                  <h3 className="text-xl font-semibold text-white mb-2">SELECT TOPIC</h3>
                  <p className="text-purple-200 mb-4">Choose your subject</p>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">0 subjects</Badge>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border-white/20 hover:scale-105 transition-all cursor-pointer group">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">⚡</div>
                  <h3 className="text-xl font-semibold text-white mb-2">DIFFICULTY</h3>
                  <p className="text-purple-200 mb-4">AI-adaptive levels</p>
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Smart adjust</Badge>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border-white/20 hover:scale-105 transition-all cursor-pointer group">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">⏱️</div>
                  <h3 className="text-xl font-semibold text-white mb-2">TIMER</h3>
                  <p className="text-purple-200 mb-4">Flexible duration</p>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Auto-save</Badge>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border-white/20 hover:scale-105 transition-all cursor-pointer group">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📊</div>
                  <h3 className="text-xl font-semibold text-white mb-2">ANALYTICS</h3>
                  <p className="text-purple-200 mb-4">Performance insights</p>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Real-time</Badge>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Recent Performance</h3>
                  <div className="space-y-3">
                    {[
                      { subject: "--", score: 0, trend: "--" },
                      { subject: "--", score: 0, trend: "--" },
                      { subject: "--", score: 0, trend: "--" },
                    ].map((exam, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-purple-200">{exam.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{exam.score}%</span>
                          <TrendingUp
                            className={`w-4 h-4 ${exam.trend === "up" ? "text-green-400" : "text-red-400"}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Recommended Practice</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-red-400" />
                        <span className="text-white font-medium text-sm">Priority</span>
                      </div>
                      <p className="text-red-300 text-sm">--</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-medium text-sm">Quick Review</span>
                      </div>
                      <p className="text-yellow-300 text-sm">--</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-5xl font-bold text-white">Hey {userName}, ready to outsmart yourself?</h2>
                <p className="text-2xl text-purple-200 italic font-light">
                  "The future belongs to those who organize their thoughts today"
                </p>
              </div>
              {studyKits.length === 0 && (
                <Button
                  onClick={() => router.push("/create-kit")}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full text-lg font-medium shadow-2xl transform hover:scale-105 transition-all duration-300 group"
                >
                  <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                  Create Your First Study Kit
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </div>

            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-6 h-6 text-blue-400" />
                      <span className="text-white font-bold">Study Time</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-400">{Math.floor(totalStudyTime / 60)}h</div>
                  </div>
                  <Progress value={(totalStudyTime / weeklyGoal) * 100} className="mb-2" />
                  <p className="text-blue-300 text-sm">
                    {Math.floor(totalStudyTime / 60)}/{Math.floor(weeklyGoal / 60)}h this week
                  </p>
                </CardContent>
              </Card>

              <StudyStreakCard studySessions={studySessions} />

              <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-green-400" />
                      <span className="text-white font-bold">Avg Score</span>
                    </div>
                    <div className="text-3xl font-bold text-green-400">{avgScore}%</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-300 text-sm">
                      {studySessions.length > 0 ? "Great progress!" : "Start studying to see progress"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-6 h-6 text-purple-400" />
                      <span className="text-white font-bold">AI Score</span>
                    </div>
                    <div className="text-3xl font-bold text-purple-400">{aiScore}</div>
                  </div>
                  <p className="text-purple-300 text-sm">Learning efficiency rating</p>
                </CardContent>
              </Card>
            </div>

            {studyKits.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">My Study Kits</h3>
                  <Button
                    onClick={() => router.push("/create-kit")}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Kit
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studyKits.map((kit) => (
                    <StudyKitCard
                      key={kit.id}
                      kit={kit}
                      onStudy={() => router.push(`/study/${kit.id}`)}
                      onDelete={() => deleteStudyKit(kit.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">Quick Actions</h3>
                <QuickActionsGrid />
              </div>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Recent Sessions
                  </h3>
                  <div className="space-y-4">
                    {studySessions.slice(0, 3).map((session, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{session.kitTitle}</p>
                          <p className="text-purple-200 text-xs">
                            Score: {session.score}% • {session.duration}m
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-purple-300" />
                      </div>
                    ))}
                    {studySessions.length === 0 && (
                      <div className="text-center text-purple-300 text-sm py-4">No study sessions yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">AI Recommendations</h3>
                <AIInsightCard
                  title="Study Optimization"
                  insight={
                    studyKits.length > 0
                      ? "Focus on your weakest subjects for maximum improvement"
                      : "Create your first study kit to get personalized insights"
                  }
                  confidence={studySessions.length > 0 ? 85 : 0}
                />
                <AIInsightCard
                  title="Break Reminder"
                  insight={
                    totalStudyTime > 120
                      ? "Take a 15-minute break to maintain focus"
                      : "You're doing great! Keep up the momentum"
                  }
                  confidence={75}
                />
                <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border-white/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-medium text-sm">Achievement Unlocked!</span>
                  </div>
                  <p className="text-yellow-300 text-sm">
                    {studyKits.length > 0
                      ? `Created ${studyKits.length} study kit${studyKits.length > 1 ? "s" : ""}!`
                      : "Welcome to SynapseEdu!"}
                  </p>
                </Card>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-pink-400 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-400 rounded-full animate-ping"></div>
      </div>

      <div className="flex relative z-10">
        {/* Left Sidebar */}
        <div className="w-72 bg-white/10 backdrop-blur-xl border-r border-white/20 min-h-screen p-6">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">SynapseEdu</h1>
            </div>
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-purple-200">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Level {Math.floor(totalStudyTime / 60)} Scholar</span>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveSection("home")}
              className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-3 ${
                activeSection === "home"
                  ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white shadow-lg"
                  : "text-purple-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="text-2xl">🏠</div>
              <span className="font-medium">HOME</span>
            </button>

            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-3 ${
                  activeSection === item.id
                    ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white shadow-lg"
                    : "text-purple-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="text-2xl">{item.icon}</div>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Bar */}
          <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 p-6 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-purple-200">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  Total: {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m
                </span>
              </div>
              <div className="flex items-center gap-2 text-purple-200">
                <Fire className="w-4 h-4 text-orange-400" />
                <span className="text-sm">{studySessions.length > 0 ? "Active learner" : "Ready to start"}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-white hover:bg-white/10 relative"
                >
                  <Bell className="w-5 h-5" />
                  {studyKits.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </Button>

                {showNotifications && (
                  <Card className="absolute right-0 top-12 w-96 bg-white/10 backdrop-blur-xl border-white/20 z-50 shadow-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white">Notifications</h3>
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                          {studyKits.length} kits
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {studyKits.slice(0, 3).map((kit, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full mt-2 bg-purple-400"></div>
                              <div className="flex-1">
                                <p className="text-white font-medium text-sm">Study Kit Ready</p>
                                <p className="text-purple-200 text-xs">{kit.title}</p>
                                <p className="text-purple-300 text-xs mt-1">
                                  {kit.items.length} items • Ready to study
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {studyKits.length === 0 && (
                          <div className="text-center text-purple-300 text-sm py-4">
                            Create your first study kit to get started!
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                    <Avatar className="h-12 w-12 ring-2 ring-purple-400/50">
                      <AvatarImage src="/diverse-student-profiles.png" alt="Profile" />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                        {userName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl"
                  align="end"
                >
                  <div className="p-4 border-b border-white/10">
                    <p className="text-white font-medium">{userName}</p>
                    <p className="text-purple-200 text-sm">Level {Math.floor(totalStudyTime / 60)} Scholar</p>
                  </div>
                  <DropdownMenuItem className="text-white hover:bg-white/10 p-3">
                    <User className="mr-3 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-white/10 p-3">
                    <Award className="mr-3 h-4 w-4" />
                    Achievements
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-white/10 p-3">
                    <BarChart3 className="mr-3 h-4 w-4" />
                    Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-white/10 p-3">
                    <Moon className="mr-3 h-4 w-4" />
                    Dark/Light Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-white/10 p-3">
                    <Globe className="mr-3 h-4 w-4" />
                    Change Language
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-white hover:bg-white/10 p-3"
                    onClick={() => (window.location.href = "/")}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-8">{renderMainContent()}</div>
        </div>
      </div>
    </div>
  )
}
