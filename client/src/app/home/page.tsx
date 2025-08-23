// src/app/page.tsx (or wherever your Index component lives)
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import StudyKitCard from "@/components/StudyKitCard";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import Navbar from "@/components/NavBar";
import { v4 as uuidv4 } from "uuid";
import ParticleSystem from "@/components/ParticleSystem";
import ProtectedRoute from "@/components/ProtectedRoute";
import { studyKitApi } from "@/app/api/api";

interface StudyKit {
  id: string;
  title: string;
  category: string;
  color: "purple" | "blue";
}

const Index = () => {
  const router = useRouter();

  const [studyKits, setStudyKits] = useState<StudyKit[]>([
    {
      id: "1",
      title: "Real World Projects for Career Advancement",
      category: "Software Development",
      color: "purple"
    },
    {
      id: "2",
      title: "Agentic AI",
      category: "AIML",
      color: "blue"
    },
    {
      id: "3",
      title: "Pytorch Machine Learning",
      category: "Unclassified",
      color: "blue"
    },
    {
      id: "4",
      title: "ScikitLearn Method to Know",
      category: "AIML",
      color: "blue"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const handleDeleteStudyKit = (id: string) => {
    setStudyKits(prev => prev.filter(kit => kit.id !== id));
  };

  const handleCreateStudyKit = async () => {
    if (creating) return;
    setCreating(true);

    const displayTitle = "New Study Kit";

    try {
      // Ensure token exists — if not, send user to login
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          router.push("/login");
          setCreating(false);
          return;
        }
      }

      // Call backend to create canonical study kit (backend expects { name })
      const created = await studyKitApi.createStudyKit({ name: displayTitle, studyGuideSummary: ""});

      const newKitId = created?.id;
      if (!newKitId) throw new Error("Invalid response from server: missing id");

      const newKit: StudyKit = {
        id: newKitId,
        title: created.name ?? displayTitle,
        category: "Unclassified",
        color: "blue"
      };

      // update local state + persist id
      setStudyKits(prev => [newKit, ...prev]);
      if (typeof window !== "undefined") {
        localStorage.setItem("studyKitId", newKitId);
      }

      router.push(`/study/${newKitId}/home`);
    } catch (err) {
      console.error("Create StudyKit failed:", err);

      // fallback: create a temporary local kit so user can continue
      const fallbackId = `kit_${uuidv4()}`;
      const fallbackKit: StudyKit = {
        id: fallbackId,
        title: displayTitle,
        category: "Unclassified",
        color: "blue"
      };
      setStudyKits(prev => [fallbackKit, ...prev]);
      if (typeof window !== "undefined") {
        localStorage.setItem("studyKitId", fallbackId);
      }
      router.push(`/study/${fallbackId}/home`);
    } finally {
      setCreating(false);
    }
  };

  const filteredKits = studyKits.filter(kit =>
    kit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kit.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categorizedKits = filteredKits.reduce((acc, kit) => {
    if (!acc[kit.category]) {
      acc[kit.category] = [];
    }
    acc[kit.category].push(kit);
    return acc;
  }, {} as Record<string, StudyKit[]>);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-r from-blue-400 via-gray-50 to-blue-200 ">
        <ParticleSystem />
        <div className="z-10 relative">
          <Navbar />
        </div>

        <main className="container mx-auto px-4 py-8 pt-24">
          {/* Create Study Kit Button */}
          <div className="mb-8">
            <Button
              onClick={handleCreateStudyKit}
              size="lg"
              disabled={creating}
              className="mx-auto flex items-center space-x-3 px-8 py-4 text-base font-medium rounded-xl border-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all duration-200"
              variant="outline"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="h-5 w-5" />
              </div>
              <span>{creating ? "Creating..." : "Create a study kit"}</span>
              <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search study materials..."
            />
          </div>

          {/* Order by Filter */}
          <div className="flex justify-end mb-6">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Order by:</span>
              <Button variant="outline" size="sm" className="font-medium">
                Class
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Study Kits by Category */}
          <div className="space-y-8">
            {Object.entries(categorizedKits).map(([category, kits]) => (
              <div key={category}>
                <div className="flex items-center space-x-3 mb-4">
                  <h2 className="text-xl font-semibold text-foreground">{category}</h2>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Add</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {kits.map((kit) => (
                    <StudyKitCard
                      key={kit.id}
                      id={kit.id}
                      title={kit.title}
                      category={kit.category}
                      color={kit.color}
                      onDelete={handleDeleteStudyKit}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredKits.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No study kits found. Try creating a new one!</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
