import { Button } from "@/components/ui/button";
import heroPhoneUrl from "@/assets/hero-phone-mockup.jpg";
import heroLaptopUrl from "@/assets/hero-laptop-mockup.jpg";

export default function HeroSection(){
  return (
    <section className="relative pt-20 pb-16 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-accent/10"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-gradient">AI Study Tools</span><br />
                You Can Trust
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                Get The-A and save time with SynapseEdu!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="animate-slide-up">
                Sign up for FREE
              </Button>
              <Button variant="outline" size="xl" className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
                I'm a teacher
              </Button>
            </div>

            <div className="space-y-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <p className="text-sm text-muted-foreground">
                Trusted by over a million students worldwide
              </p>
              
              {/* Country Flags */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">🇺🇸</span>
                <span className="text-2xl">🇧🇷</span>
                <span className="text-2xl">🇳🇱</span>
                <span className="text-2xl">🇨🇦</span>
                <span className="text-2xl">🇩🇪</span>
                <span className="text-2xl">🇸🇪</span>
                <span className="text-2xl">🇬🇧</span>
                <span className="text-2xl">🇫🇷</span>
                <span className="text-sm text-muted-foreground">+</span>
              </div>

              {/* App Store Badges */}
              <div className="flex gap-4">
                <div className="bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold">
                  📱 App Store
                </div>
                <div className="bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold">
                  🤖 Google Play
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Device Mockups */}
          <div className="relative animate-slide-up" style={{ animationDelay: "0.3s" }}>
            {/* Phone Mockup */}
            <div className="relative z-10 animate-float">
              <img 
                src={heroPhoneUrl} 
                alt="SynapseEdu Mobile App" 
                className="w-80 h-auto mx-auto rounded-3xl shadow-2xl"
              />
            </div>

            {/* Laptop Mockup - Background */}
            <div className="absolute -top-8 -right-8 opacity-60 animate-float" style={{ animationDelay: "1s" }}>
              <img 
                src={heroLaptopUrl} 
                alt="SynapseEdu Desktop" 
                className="w-64 h-auto rounded-lg shadow-xl"
              />
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-accent/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}