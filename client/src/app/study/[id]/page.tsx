"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Check,
  X,
  Eye,
  BookOpen,
  FileText,
  HelpCircle,
  Trophy,
  Home,
} from "lucide-react"
import { useRouter, useParams } from "next/navigation"

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
}

export default function StudySession() {
  const router = useRouter()
  const params = useParams()
  const kitId = params.id as string

  const [studyKit, setStudyKit] = useState<StudyKit | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set())
  const [sessionStartTime] = useState(Date.now())
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // Load study kit from localStorage
    const studyKits = JSON.parse(localStorage.getItem("studyKits") || "[]")
    const kit = studyKits.find((k: StudyKit) => k.id === kitId)

    if (kit) {
      setStudyKit(kit)
    } else {
      router.push("/home")
    }
  }, [kitId, router])

  const currentItem = studyKit?.items[currentIndex]
  const progress = studyKit ? ((currentIndex + 1) / studyKit.items.length) * 100 : 0
  const completionRate = studyKit ? (completedItems.size / studyKit.items.length) * 100 : 0

  const nextItem = () => {
    if (studyKit && currentIndex < studyKit.items.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
      setSelectedOption("")
    } else {
      setIsComplete(true)
    }
  }

  const previousItem = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setShowAnswer(false)
      setSelectedOption("")
    }
  }

  const markCorrect = () => {
    setCorrectAnswers(correctAnswers + 1)
    setCompletedItems(new Set([...completedItems, currentIndex]))
    setTimeout(nextItem, 500)
  }

  const markIncorrect = () => {
    setCompletedItems(new Set([...completedItems, currentIndex]))
    setTimeout(nextItem, 500)
  }

  const handleQuestionSubmit = () => {
    if (currentItem?.type === "question" && selectedOption) {
      const isCorrect = selectedOption === currentItem.answer
      if (isCorrect) {
        setCorrectAnswers(correctAnswers + 1)
      }
      setCompletedItems(new Set([...completedItems, currentIndex]))
      setShowAnswer(true)
      setTimeout(nextItem, 2000)
    }
  }

  const restartSession = () => {
    setCurrentIndex(0)
    setShowAnswer(false)
    setSelectedOption("")
    setCorrectAnswers(0)
    setCompletedItems(new Set())
    setIsComplete(false)
  }

  const getSessionDuration = () => {
    const duration = Math.floor((Date.now() - sessionStartTime) / 1000 / 60)
    return duration
  }

  if (!studyKit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <Brain className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">Loading Study Kit...</h2>
        </div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-600 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-12 text-center">
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-white mb-4">Session Complete!</h1>
            <p className="text-xl text-purple-200 mb-8">Great job studying {studyKit.title}</p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-400">{correctAnswers}</div>
                <div className="text-purple-200 text-sm">Correct Answers</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-400">{Math.round(completionRate)}%</div>
                <div className="text-purple-200 text-sm">Completion Rate</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-400">{getSessionDuration()}m</div>
                <div className="text-purple-200 text-sm">Study Time</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={restartSession}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Study Again
              </Button>
              <Button
                onClick={() => router.push("/home")}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderStudyItem = () => {
    if (!currentItem) return null

    switch (currentItem.type) {
      case "flashcard":
        return (
          <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border-white/20 min-h-[400px]">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-purple-300" />
                <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30">
                  Flashcard {currentIndex + 1} of {studyKit.items.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="text-2xl font-bold text-white mb-6">{showAnswer ? "Answer" : "Question"}</div>
                <div className="text-xl text-purple-100 leading-relaxed min-h-[120px] flex items-center justify-center">
                  {showAnswer ? currentItem.back : currentItem.front}
                </div>
              </div>

              <div className="flex justify-center gap-4">
                {!showAnswer ? (
                  <Button
                    onClick={() => setShowAnswer(true)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Show Answer
                  </Button>
                ) : (
                  <div className="flex gap-4">
                    <Button
                      onClick={markIncorrect}
                      variant="outline"
                      className="border-red-500/30 text-red-300 hover:bg-red-500/20 bg-transparent"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Incorrect
                    </Button>
                    <Button
                      onClick={markCorrect}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Correct
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case "note":
        return (
          <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border-white/20 min-h-[400px]">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-300" />
                <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30">
                  Note {currentIndex + 1} of {studyKit.items.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="text-2xl font-bold text-white mb-6">Study Note</div>
                <div className="text-lg text-purple-100 leading-relaxed min-h-[200px] text-left bg-white/5 rounded-lg p-6">
                  {currentItem.content}
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    setCompletedItems(new Set([...completedItems, currentIndex]))
                    nextItem()
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark as Read
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case "question":
        return (
          <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border-white/20 min-h-[400px]">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <HelpCircle className="w-5 h-5 text-green-300" />
                <Badge className="bg-green-500/20 text-green-200 border-green-500/30">
                  Question {currentIndex + 1} of {studyKit.items.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="text-2xl font-bold text-white mb-6">{currentItem.question}</div>

                <div className="space-y-3 mb-6">
                  {currentItem.options?.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => !showAnswer && setSelectedOption(option)}
                      disabled={showAnswer}
                      className={`w-full p-4 rounded-lg text-left transition-all ${
                        showAnswer
                          ? option === currentItem.answer
                            ? "bg-green-500/20 border-green-500/50 text-green-200"
                            : option === selectedOption && option !== currentItem.answer
                              ? "bg-red-500/20 border-red-500/50 text-red-200"
                              : "bg-white/5 border-white/10 text-purple-200"
                          : selectedOption === option
                            ? "bg-purple-500/20 border-purple-500/50 text-white"
                            : "bg-white/5 border-white/10 text-purple-200 hover:bg-white/10"
                      } border`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {showAnswer && (
                  <div className="mb-6 p-4 bg-white/5 rounded-lg">
                    <div className="text-sm text-purple-200 mb-2">Correct Answer:</div>
                    <div className="text-lg font-semibold text-green-300">{currentItem.answer}</div>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                {!showAnswer ? (
                  <Button
                    onClick={handleQuestionSubmit}
                    disabled={!selectedOption}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Submit Answer
                  </Button>
                ) : (
                  <div className="text-center">
                    <div
                      className={`text-lg font-semibold mb-2 ${
                        selectedOption === currentItem.answer ? "text-green-300" : "text-red-300"
                      }`}
                    >
                      {selectedOption === currentItem.answer ? "Correct!" : "Incorrect"}
                    </div>
                    <div className="text-purple-200 text-sm">Moving to next item...</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-600 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/home")}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Study
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">{studyKit.title}</h1>
              <p className="text-purple-200">{studyKit.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-white font-semibold">{getSessionDuration()}m</div>
              <div className="text-purple-200 text-sm">Study Time</div>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">
                {correctAnswers}/{completedItems.size}
              </div>
              <div className="text-purple-200 text-sm">Correct</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-purple-200 text-sm">Progress</span>
            <span className="text-white font-semibold">
              {currentIndex + 1} / {studyKit.items.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Study Item */}
        <div className="flex justify-center mb-8">{renderStudyItem()}</div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={previousItem}
            disabled={currentIndex === 0}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 disabled:opacity-50 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {studyKit.items.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full ${
                  idx === currentIndex ? "bg-purple-400" : completedItems.has(idx) ? "bg-green-400" : "bg-white/20"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextItem}
            disabled={currentIndex === studyKit.items.length - 1}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
