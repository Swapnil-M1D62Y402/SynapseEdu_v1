import { Button } from "@/components/ui/button";
import heroLaptopUrl from "@/public/hero-laptop-mockup.png";
import Image from "next/image";
import ParticleSystem from "@/components/ParticleSystem";

export default function FeaturesSection(){
  return (
    <section className="py-20 bg-gradient-to-b from-purple-800 to-blue-200">
      <ParticleSystem />
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content - Device Mockup */}
          <div className="order-2 lg:order-1 animate-slide-up">
            <div className="relative">
            <Image 
            src={heroLaptopUrl} 
            alt="SynapseEdu Desktop Dashboard" 
            className="w-full h-auto rounded-xl shadow-2xl z-10"/>
              
              {/* Floating Feature Cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium">Smart Study</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3 animate-float" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-medium">AI Tutor</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="order-1 lg:order-2 space-y-8 animate-fade-in z-10">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                <span className="text-gradient">Reduce stress</span> and save time with SynapseEdu—create a <span className="text-gradient">free account</span> and get started!
              </h2>
              
              <p className="text-lg text-muted-foreground max-w-2xl">
                SynapseEdu's varied questions are engaging and optimized to hold your attention. Our Test feature replicates real-test conditions, reducing test anxiety.
              </p>
              
              <p className="text-lg text-muted-foreground max-w-2xl">
                SynapseEdu believes active work does faster, so our spaced repetition algorithm is uniquely aggressive. Getting your facts straight has never been this fun or efficient.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="ghost" size="lg">
                Learn About SDG 4
              </Button>
              <Button variant="ghost" size="lg">
                Explore Features of SynapseEdu
              </Button>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary text-xl">🧠</span>
                </div>
                <h3 className="font-semibold">AI-Powered Learning</h3>
                <p className="text-sm text-muted-foreground">Personalized study paths</p>
              </div>
              
              <div className="space-y-2">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <span className="text-accent text-xl">📊</span>
                </div>
                <h3 className="font-semibold">Progress Tracking</h3>
                <p className="text-sm text-muted-foreground">Monitor your improvement</p>
              </div>
              
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary text-xl">⚡</span>
                </div>
                <h3 className="font-semibold">Spaced Repetition</h3>
                <p className="text-sm text-muted-foreground">Efficient memorization</p>
              </div>
              
              <div className="space-y-2">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <span className="text-accent text-xl">🎯</span>
                </div>
                <h3 className="font-semibold">Test Preparation</h3>
                <p className="text-sm text-muted-foreground">Real exam conditions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}