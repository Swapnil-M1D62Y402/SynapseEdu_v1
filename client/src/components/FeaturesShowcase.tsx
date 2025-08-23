"use client";
import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, BookOpen, Map, Zap, PenTool } from "lucide-react"

interface Feature {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
}

const features: Feature[] = [
  {
    id: "neuronode",
    name: "NeuroNode",
    description: "AI-powered doubt solver with accurate, context-based answers.",
    icon:  <Brain className="w-8 h-8" />,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "smart-study",
    name: "Smart Study",
    description: "Convert notes, PDFs, and videos into personalized study kits.",
    icon: <BookOpen className="w-8 h-8" />,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "study-guide",
    name: "Study Guide",
    description: "Structured learning roadmap for effective preparation.",
    icon: <Map className="w-8 h-8" />,
    color: "from-orange-500 to-yellow-500",
  },
  {
    id: "flashcards",
    name: "Flashcards",
    description: "Boost retention with spaced repetition flashcards.",
    icon: <Zap className="w-8 h-8" />,
    color: "from-red-500 to-pink-500",
  },
  {
    id: "test",
    name: "Test",
    description: "Practice quizzes under real exam conditions.",
    icon: <PenTool className="w-8 h-8" />,
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: "exam-reminder-system",
    name: "Exam Reminder System",
    description: "Get Exam Reminders before scheduled Exams and Practise in our Site.",
    icon: <PenTool className="w-8 h-8" />,
    color: "from-purple-500 to-indigo-500",
  },
]

export function FeaturesShowcase() {
  return (
    <div className="max-w-12xl mx-auto bg-blue-200">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Explore Features of NeuroNode</h2>
        <p className="text-black/70 text-lg">Discover powerful tools designed to enhance your learning experience</p>
      </div>

      <div className="px-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </div>
  )
}

interface FeatureCardProps {
  feature: Feature
}

function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <Card className="group relative overflow-hidden bg-gray-50/20 backdrop-blur-sm border-white/10 hover:border-gray-100/20 transition-all duration-300 hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Icon Section */}
          <div
            className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-black shadow-lg"
          >
            {feature.icon}
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-black mb-2 group-hover:text-white/90 transition-colors">
              {feature.name}
            </h3>
            <p className="text-black/70 text-sm leading-relaxed group-hover:text-white/80 transition-colors">
              {feature.description}
            </p>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300"
        />
      </CardContent>
    </Card>
  )
}