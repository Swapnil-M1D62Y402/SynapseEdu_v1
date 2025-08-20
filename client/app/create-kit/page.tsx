"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Plus, X, BookOpen, FileText, HelpCircle, Save, ArrowLeft } from "lucide-react"
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

export default function CreateStudyKit() {
  const router = useRouter()
  const [kitTitle, setKitTitle] = useState("")
  const [kitDescription, setKitDescription] = useState("")
  const [studyItems, setStudyItems] = useState<StudyItem[]>([])
  const [activeTab, setActiveTab] = useState<"flashcard" | "note" | "question">("flashcard")

  const addStudyItem = (type: "flashcard" | "note" | "question") => {
    const newItem: StudyItem = {
      id: Date.now().toString(),
      type,
      ...(type === "flashcard" && { front: "", back: "" }),
      ...(type === "note" && { content: "" }),
      ...(type === "question" && { question: "", answer: "", options: ["", "", "", ""] }),
    }
    setStudyItems([...studyItems, newItem])
  }

  const updateStudyItem = (id: string, updates: Partial<StudyItem>) => {
    setStudyItems((items) => items.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const removeStudyItem = (id: string) => {
    setStudyItems((items) => items.filter((item) => item.id !== id))
  }

  const saveStudyKit = () => {
    if (!kitTitle.trim()) {
      alert("Please enter a title for your study kit")
      return
    }

    const studyKit = {
      id: Date.now().toString(),
      title: kitTitle,
      description: kitDescription,
      items: studyItems,
      createdAt: new Date().toISOString(),
    }

    // Save to localStorage
    const existingKits = JSON.parse(localStorage.getItem("studyKits") || "[]")
    existingKits.push(studyKit)
    localStorage.setItem("studyKits", JSON.stringify(existingKits))

    // Navigate to study session
    router.push(`/study/${studyKit.id}`)
  }

  const renderStudyItemForm = (item: StudyItem) => {
    switch (item.type) {
      case "flashcard":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-purple-200 mb-2 block">Front</label>
              <Input
                value={item.front || ""}
                onChange={(e) => updateStudyItem(item.id, { front: e.target.value })}
                placeholder="Enter the question or term..."
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-purple-200 mb-2 block">Back</label>
              <Textarea
                value={item.back || ""}
                onChange={(e) => updateStudyItem(item.id, { back: e.target.value })}
                placeholder="Enter the answer or definition..."
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-200 min-h-[100px]"
              />
            </div>
          </div>
        )

      case "note":
        return (
          <div>
            <label className="text-sm font-medium text-purple-200 mb-2 block">Note Content</label>
            <Textarea
              value={item.content || ""}
              onChange={(e) => updateStudyItem(item.id, { content: e.target.value })}
              placeholder="Write your study notes here..."
              className="bg-white/10 border-white/20 text-white placeholder:text-purple-200 min-h-[150px]"
            />
          </div>
        )

      case "question":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-purple-200 mb-2 block">Question</label>
              <Input
                value={item.question || ""}
                onChange={(e) => updateStudyItem(item.id, { question: e.target.value })}
                placeholder="Enter your question..."
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-purple-200 mb-2 block">Multiple Choice Options</label>
              {item.options?.map((option, idx) => (
                <Input
                  key={idx}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(item.options || [])]
                    newOptions[idx] = e.target.value
                    updateStudyItem(item.id, { options: newOptions })
                  }}
                  placeholder={`Option ${idx + 1}...`}
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-200 mb-2"
                />
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-purple-200 mb-2 block">Correct Answer</label>
              <Input
                value={item.answer || ""}
                onChange={(e) => updateStudyItem(item.id, { answer: e.target.value })}
                placeholder="Enter the correct answer..."
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-200"
              />
            </div>
          </div>
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
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Create Study Kit</h1>
            </div>
          </div>
          <Button
            onClick={saveStudyKit}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <Save className="w-4 h-4 mr-2" />
            Save & Start Studying
          </Button>
        </div>

        {/* Kit Details */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Study Kit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-purple-200 mb-2 block">Title</label>
              <Input
                value={kitTitle}
                onChange={(e) => setKitTitle(e.target.value)}
                placeholder="Enter study kit title..."
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-purple-200 mb-2 block">Description (Optional)</label>
              <Textarea
                value={kitDescription}
                onChange={(e) => setKitDescription(e.target.value)}
                placeholder="Describe what this study kit covers..."
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Study Item Type Selector */}
        <div className="flex gap-4 mb-6">
          {[
            { type: "flashcard" as const, icon: BookOpen, label: "Flashcard", desc: "Question & Answer pairs" },
            { type: "note" as const, icon: FileText, label: "Note", desc: "Study notes & concepts" },
            { type: "question" as const, icon: HelpCircle, label: "Quiz", desc: "Multiple choice questions" },
          ].map(({ type, icon: Icon, label, desc }) => (
            <Button
              key={type}
              onClick={() => addStudyItem(type)}
              className={`flex-1 h-auto p-4 flex flex-col items-center gap-2 ${
                activeTab === type
                  ? "bg-purple-500 hover:bg-purple-600"
                  : "bg-white/10 hover:bg-white/20 border border-white/20"
              }`}
            >
              <Icon className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">{label}</div>
                <div className="text-xs opacity-80">{desc}</div>
              </div>
              <Plus className="w-4 h-4" />
            </Button>
          ))}
        </div>

        {/* Study Items */}
        <div className="space-y-4">
          {studyItems.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No study items yet</h3>
                <p className="text-purple-200 mb-6">Add flashcards, notes, or quiz questions to get started</p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => addStudyItem("flashcard")} className="bg-purple-500 hover:bg-purple-600">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Add Flashcard
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            studyItems.map((item, index) => (
              <Card key={item.id} className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30">
                      {item.type === "flashcard" && <BookOpen className="w-3 h-3 mr-1" />}
                      {item.type === "note" && <FileText className="w-3 h-3 mr-1" />}
                      {item.type === "question" && <HelpCircle className="w-3 h-3 mr-1" />}
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)} #{index + 1}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => removeStudyItem(item.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>{renderStudyItemForm(item)}</CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary */}
        {studyItems.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 mt-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{studyItems.length}</div>
                    <div className="text-purple-200 text-sm">Total Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {studyItems.filter((item) => item.type === "flashcard").length}
                    </div>
                    <div className="text-purple-200 text-sm">Flashcards</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {studyItems.filter((item) => item.type === "question").length}
                    </div>
                    <div className="text-purple-200 text-sm">Quiz Questions</div>
                  </div>
                </div>
                <Button
                  onClick={saveStudyKit}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save & Start Studying
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
