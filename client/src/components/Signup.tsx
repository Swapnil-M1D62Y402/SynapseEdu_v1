"use client";

import ParticleSystem from "./ParticleSystem";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Signup() {
  const router = useRouter();
  const { signup, loading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!name || !email || !password) {
      setLocalError("Name, email and password are required.");
      return;
    }
    if (!email.includes("@")) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    try {
      await signup(name, email, password); // useAuth stores token & user
      router.push("/home");
    } catch (err: any) {
      setLocalError(err?.response?.data?.message || err?.message || "Signup failed");
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-600 flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleSystem />
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">SynapseEdu</h1>
              <p className="text-purple-200">"Create your account"</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="name"
                type="text"
                placeholder="John Cena"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-200 backdrop-blur-sm"
                required
              />
              <Input
                id="email"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-200 backdrop-blur-sm"
                required
              />
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-200 backdrop-blur-sm"
                required
              />

              {(localError || error) && (
                <p className="text-sm text-red-400">{localError || error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {loading ? "Creating account..." : "Sign up"}
              </Button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => router.push("/login")}
                className="text-purple-200 hover:text-white underline transition-colors"
              >
                {"Already have an account? Login"}
              </button>
            </div>

            <button
              onClick={() => router.push("/")}
              className="absolute top-4 right-4 text-white hover:text-purple-200 transition-colors"
            >
              ✕
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
