"use client"

import { useState, useEffect, useRef } from "react"
import {useRouter} from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Brain, 
  ChevronRight, 
  Sparkles,
  Play,
  Zap,
  BookOpen,
  Users,
  TrendingUp,
  Award 
} from "lucide-react"
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import hero_phone_image from "@/public/hero_phone_image.png";
import hero_laptop_image from "@/public/hero-laptop-mockup.png";
import Image from "next/image"
import ParticleSystem from "@/components/ParticleSystem"


export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const router = useRouter()

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
      <Header />
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12 flex items-center min-h-screen relative z-10">
        
        <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-12 mt-10">
          {/* Left Content */}
          <div className="lg:w-1/2 text-white space-y-8">
            <div className="space-y-4">

              <h1 className="text-6xl lg:text-8xl font-bold leading-tight bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
                SynapseEdu
              </h1>

              <h2 className="text-4xl lg:text-6xl font-semibold leading-tight">
                Education  
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Without Any Barriers
                </span>
                <br />
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Shape a Sustainable Tomorrow.
                </span>
              </h2>

              <p className="text-xl text-purple-200 max-w-md leading-relaxed">
                Our app democratizes learning by turning raw information into personalized, accessible knowledge—directly advancing SDG 4’s mission of inclusive, equitable, and lifelong education for all.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => {
                  setShowAuth(true)
                  router.push("/signup")
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full text-lg font-medium shadow-2xl transform hover:scale-105 transition-all duration-300 group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Learning
              </Button>
              <Button
                onClick={() => {
                  setShowAuth(true)
                  router.push("/login")
                }}
                variant="outline"
                className="border-white/30 text-blue-700 hover:bg-white/10 px-8 py-4 rounded-full text-lg font-medium backdrop-blur-sm transition-all duration-300"
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
            <div className="relative animate-slide-up" style={{ animationDelay: "0.3s" }}>
            {/* Phone Mockup */}
            <div className="relative z-10 animate-float">
              <Image
                src={hero_phone_image} 
                alt="SynapseEdu Mobile App" 
                className="w-80 h-auto mx-auto rounded-3xl shadow-2xl"
              />
            </div>

            {/* Laptop Mockup - Background */}
            <div className="absolute -top-8 -right-8 opacity-60 animate-float" style={{ animationDelay: "1s" }}>
              <Image
                src={hero_laptop_image} 
                alt="SynapseEdu Desktop" 
                className="w-64 h-auto rounded-lg shadow-xl"
              />
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-accent/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          </div>
            
            <div className="absolute bottom-0 right-0 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-medium text-sm">Smart Analytics</span>
              </div>
              <div className="text-purple-200 text-xs">Track your progress with AI insights</div>
            </div>

          </div>
        </div>
      </div>  

      {/* Features Section */}
      <FeaturesSection />
      

      {/* CTA Section */}
      <div className="relative z-10 py-20 bg-blue-200">
        <ParticleSystem />
        <div className="container mx-auto px-6 text-center z-10">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-5xl font-bold text-blue-400 mb-6">Ready to Transform Your Learning?</h3>
            <p className="text-xl text-purple-400 mb-8 max-w-2xl mx-auto">
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
      <div className="z-10">
        <Footer />
      </div>
      
    </div>
  )
}