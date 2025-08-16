"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Brain, Sparkles, Zap, BookOpen, Users, TrendingUp, Play, ChevronRight, Award } from "lucide-react"

// Particle system component
const ParticleSystem = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      opacity: number
    }> = []

    const colors = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"]

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.2,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}

// Interactive AI Chat Demo
const AIChatDemo = () => {
  const [messages, setMessages] = useState([{ type: "ai", text: "Hi! I'm your AI study assistant. Ask me anything!" }])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return

    setMessages((prev) => [...prev, { type: "user", text: input }])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const responses = [
        "Great question! Let me break that down for you...",
        "I can help you create a study plan for that topic!",
        "Here's a mind map to visualize this concept...",
        "Would you like me to generate practice questions?",
      ]
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: responses[Math.floor(Math.random() * responses.length)],
        },
      ])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-purple-300" />
        <span className="text-white font-medium">AI Study Assistant</span>
        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Live</Badge>
      </div>

      <div className="space-y-3 mb-4 h-32 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs p-2 rounded-lg text-sm ${
                msg.type === "user" ? "bg-purple-500 text-white" : "bg-white/20 text-purple-100"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/20 text-purple-100 p-2 rounded-lg text-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask me anything..."
          className="bg-white/10 border-white/20 text-white placeholder:text-purple-200 text-sm"
        />
        <Button onClick={handleSend} size="sm" className="bg-purple-500 hover:bg-purple-600">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = "/home"
  }

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-600 flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleSystem />
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">SynapseEdu</h1>
              <p className="text-purple-200">{isLogin ? "Welcome back!" : "Join the future of learning!"}</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-200 backdrop-blur-sm"
                  required
                />
              )}
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-200 backdrop-blur-sm"
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-200 backdrop-blur-sm"
                required
              />
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {isLogin ? "LOGIN" : "SIGN UP"}
              </Button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-purple-200 hover:text-white underline transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
              </button>
            </div>

            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-4 right-4 text-white hover:text-purple-200 transition-colors"
            >
              ✕
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-600 relative overflow-hidden">
      <ParticleSystem />

      {/* Interactive cursor effect */}
      <div
        className="fixed w-6 h-6 bg-white/20 rounded-full pointer-events-none z-50 transition-all duration-100 ease-out"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          transform: "scale(1)",
        }}
      />

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12 flex items-center min-h-screen relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-12">
          {/* Left Content */}
          <div className="lg:w-1/2 text-white space-y-8">
            <div className="space-y-4">
              <Badge className="bg-white/10 text-purple-200 border-white/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Learning Platform
              </Badge>

              <h1 className="text-6xl lg:text-8xl font-bold leading-tight bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                SynapseEdu
              </h1>

              <h2 className="text-4xl lg:text-6xl font-semibold leading-tight">
                The smartest
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  path to
                </span>
                <br />
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Knowledge.
                </span>
              </h2>

              <p className="text-xl text-purple-200 max-w-md leading-relaxed">
                Revolutionizing education with AI-powered personalized learning, interactive mind maps, and intelligent
                study planning.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => {
                  setShowAuth(true)
                  setIsLogin(false)
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full text-lg font-medium shadow-2xl transform hover:scale-105 transition-all duration-300 group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Learning
              </Button>
              <Button
                onClick={() => {
                  setShowAuth(true)
                  setIsLogin(true)
                }}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-full text-lg font-medium backdrop-blur-sm transition-all duration-300"
              >
                LOGIN
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50K+</div>
                <div className="text-purple-200 text-sm">Active Learners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">1M+</div>
                <div className="text-purple-200 text-sm">Study Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">95%</div>
                <div className="text-purple-200 text-sm">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right Content - Enhanced Interactive Elements */}
          <div className="lg:w-1/2 relative h-96 lg:h-[700px] mt-12 lg:mt-0">
            {/* AI Chat Demo */}
            <div className="absolute top-0 right-0 w-80 z-20">
              <AIChatDemo />
            </div>

            {/* Floating Student Cards with Advanced Animations */}
            <div className="absolute top-20 left-8 w-32 h-32 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full overflow-hidden shadow-2xl transform hover:scale-110 transition-all duration-500 animate-float group">
              <Image
                src="/images/student1.jpeg"
                alt="Student with books"
                width={128}
                height={128}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <span className="text-white text-xs font-medium">AI Tutor</span>
              </div>
            </div>

            <div className="absolute top-32 right-20 w-28 h-40 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl overflow-hidden shadow-2xl transform hover:scale-110 transition-all duration-500 animate-float-delayed group">
              <Image
                src="/images/student2.jpeg"
                alt="Student with tablet"
                width={112}
                height={160}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="absolute top-40 left-0 w-36 h-36 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full overflow-hidden shadow-2xl transform hover:scale-110 transition-all duration-500 animate-bounce-slow group">
              <Image
                src="/images/student3.jpeg"
                alt="Student studying"
                width={144}
                height={144}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2">
                <Badge className="bg-white/90 text-green-600 text-xs">Online</Badge>
              </div>
            </div>

            <div className="absolute bottom-40 right-8 w-32 h-44 bg-gradient-to-br from-red-400 to-pink-500 rounded-3xl overflow-hidden shadow-2xl transform hover:scale-110 transition-all duration-500 animate-float group">
              <Image
                src="/images/student4.jpeg"
                alt="Student with books"
                width={128}
                height={176}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            <div className="absolute bottom-12 left-12 w-40 h-40 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full overflow-hidden shadow-2xl transform hover:scale-110 transition-all duration-500 animate-bounce-slow group">
              <Image
                src="/images/student5.jpeg"
                alt="Student with notebooks"
                width={160}
                height={160}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* Floating Feature Cards */}
            <div className="absolute bottom-0 right-0 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-medium text-sm">Smart Analytics</span>
              </div>
              <div className="text-purple-200 text-xs">Track your progress with AI insights</div>
            </div>

            <div className="absolute top-60 left-20 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium text-sm">Mind Maps</span>
              </div>
              <div className="text-purple-200 text-xs">Visual learning made simple</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">Why Choose SynapseEdu?</h3>
            <p className="text-purple-200 text-lg max-w-2xl mx-auto">
              Experience the future of education with our cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Powered",
                desc: "Personalized learning paths",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Users,
                title: "Collaborative",
                desc: "Study with peers globally",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: TrendingUp,
                title: "Analytics",
                desc: "Track your progress",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Award,
                title: "Certified",
                desc: "Earn recognized certificates",
                color: "from-yellow-500 to-orange-500",
              },
            ].map((feature, idx) => (
              <Card
                key={idx}
                className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 group"
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
                  <p className="text-purple-200">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-5xl font-bold text-white mb-6">Ready to Transform Your Learning?</h3>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already experiencing the future of education
            </p>
            <Button
              onClick={() => {
                setShowAuth(true)
                setIsLogin(false)
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-6 rounded-full text-xl font-medium shadow-2xl transform hover:scale-105 transition-all duration-300 group"
            >
              <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
              Get Started Free
              <ChevronRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
