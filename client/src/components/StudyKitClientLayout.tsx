// src/components/StudyKitClientLayout.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AddSourcesModal from "@/components/AddSources";
import Navbar from "./NavBar";
import ParticleSystem from "@/components/ParticleSystem";

type Props = {
  studyKitId?: string; // allow undefined briefly (safer)
  children: React.ReactNode;
};

export default function StudyKitClientLayout({ studyKitId, children }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storedKitId, setStoredKitId] = useState<string | null>(null);
  const [studyKitName, setStudyKitName] = useState<string>("Untitled Study Kit");
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const pathname = usePathname();
  const activeKitId = studyKitId ?? storedKitId ?? null;
  const base = activeKitId ? `/study/${activeKitId}` : "/study";

  // Persist studyKitId into localStorage and decide whether to open modal
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (studyKitId) {
        localStorage.setItem("studyKitId", studyKitId);
        setStoredKitId(studyKitId);
      } else {
        const saved = localStorage.getItem("studyKitId");
        if (saved) setStoredKitId(saved);
      }

      const idToCheck = studyKitId ?? localStorage.getItem("studyKitId");
      if (!idToCheck) {
        setIsModalOpen(false);
        return;
      }

      const seenKey = `kitSeen_${idToCheck}`;
      const seen = localStorage.getItem(seenKey);

      if (!seen) {
        setIsModalOpen(true);
      } else {
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("StudyKit layout localStorage error:", err);
      setIsModalOpen(true);
    }
  }, [studyKitId]);

  // Handle Study Kit Name Editing
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudyKitName(e.target.value);
  };

  const handleNameSave = () => {
    setIsEditingName(false);
    // Optionally, persist the name to localStorage or an API
    if (activeKitId) {
      localStorage.setItem(`studyKitName_${activeKitId}`, studyKitName);
    }
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
  };

  useEffect(() => {
    // Load the study kit name from localStorage if available
    if (activeKitId) {
      const savedName = localStorage.getItem(`studyKitName_${activeKitId}`);
      if (savedName) {
        setStudyKitName(savedName);
      }
    }
  }, [activeKitId]);

  const handleCloseModal = (markSeen = true) => {
    setIsModalOpen(false);
    try {
      if (markSeen && activeKitId) {
        localStorage.setItem(`kitSeen_${activeKitId}`, "1");
      }
    } catch (err) {
      console.warn("failed to set kitSeen:", err);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Particle background */}
      <div className="absolute inset-0 pointer-events-none">
        <ParticleSystem />
      </div>

      {/* Navbar */}
      <header className="z-20 sticky top-0">
        <Navbar />
      </header>

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-gradient-to-r from-blue-400 to-gray-200 p-4">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Study Kit</h3>
            {isEditingName ? (
              <input
                type="text"
                value={studyKitName}
                onChange={handleNameChange}
                onBlur={handleNameSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNameSave();
                }}
                autoFocus
                className="text-sm text-gray-700 border border-gray-300 rounded px-2 py-1 w-full"
              />
            ) : (
              <p
                className="text-sm text-gray-900 cursor-pointer hover:underline"
                onDoubleClick={handleNameEdit}
              >
                Study Kit Name: {studyKitName}
              </p>
            )}
            <p className="text-sm text-gray-700">ID: {activeKitId ?? "—"}</p>
          </div>

          <nav className="flex flex-col gap-2">
            <Link
              href={`${base}/home`}
              className={`px-3 py-2 rounded-md ${
                 pathname === `${base}/home`
                  ? "bg-blue-500 text-white"
                  : "hover:bg-blue-200"
              }`}
            >
              Home
            </Link>
            <Link
              href={`${base}/neuronodes`}
              className={`px-3 py-2 rounded-md ${
                pathname?.startsWith(`${base}/neuronodes`)
                  ? "bg-blue-500 text-white"
                  : "hover:bg-blue-200"
              }`}
            >
              NeuroNode
            </Link>
            <Link
              href={`${base}/smart_study`}
              className={`px-3 py-2 rounded-md ${
                pathname?.startsWith(`${base}/smart_study`)
                  ? "bg-blue-500 text-white"
                  : "hover:bg-blue-200"
              }`}
            >
              Smart Study
            </Link>
            <Link
              href={`${base}/study_guide`}
              className={`px-3 py-2 rounded-md ${
                pathname?.startsWith(`${base}/study_guide`)
                  ? "bg-blue-500 text-white"
                  : "hover:bg-blue-200"
              }`}
            >
              Study Guide
            </Link>
            <Link
              href={`${base}/flashcards`}
              className={`px-3 py-2 rounded-md ${
                pathname?.startsWith(`${base}/flashcards`)
                  ? "bg-blue-500 text-white"
                  : "hover:bg-blue-200"
              }`}
            >
              Flashcards
            </Link>
            <Link
              href={`${base}/test`}
              className={`px-3 py-2 rounded-md ${
                pathname?.startsWith(`${base}/test`)
                  ? "bg-blue-500 text-white"
                  : "hover:bg-blue-200"
              }`}
            >
              Test
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 bg-gradient-to-l from-blue-200 to-gray-200 h-screen flex flex-col">
          <div className="flex-1 z-10">{children}</div>
        </main>
      </div>

      <AddSourcesModal
        isOpen={isModalOpen}
        kitId={activeKitId}
        onClose={() => handleCloseModal(true)}
      />
    </div>
  );
}
