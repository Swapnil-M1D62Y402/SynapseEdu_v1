// src/components/StudyKitClientLayout.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AddSourcesModal from "@/components/AddSources";
import Navbar from "./NavBar";
import ParticleSystem from "@/components/ParticleSystem";  

type Props = {
  studyKitId: string;
  children: React.ReactNode;
};

export default function StudyKitClientLayout({ studyKitId, children }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();
  const base = `/study/${studyKitId}`;

  // Show AddSources modal on the first visit to the kit (per session)
  useEffect(() => {
    try {
      const key = `kitSeen_${studyKitId}`;
      const seen = sessionStorage.getItem(key);
      if (!seen) {
        setIsModalOpen(true);
        sessionStorage.setItem(key, "1");
      } else {
        setIsModalOpen(false);
      }
    } catch (e) {
      // Handle sessionStorage errors (e.g., in non-browser environments)
      setIsModalOpen(true);
    }
  }, [studyKitId]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

        {/* <div className="absolute inset-0 -z-10 pointer-events-none">
            <ParticleSystem />
        </div> */}
        <ParticleSystem />
      {/* Navbar spans full width at top */}
      <header className="z-20 sticky">
        {/* pass a callback so Navbar can also open the modal if you want */}
        <Navbar/>
      </header>
        {/* Main Layout */}
    <div className="flex flex-1">
      {/* Left Sidebar */}
      <aside className="w-64 border-r bg-gradient-to-r from-blue-400 to-gray-200 p-4"> {/* rounded-br-lg rounded-tr-lg*/}
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Study Kit</h3>
          <p className="text-sm text-gray-700">ID: {studyKitId}</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2">
          <Link
            href={base}
            className={`px-3 py-2 rounded-md ${
            pathname === base ? "bg-blue-500 text-white" : "hover:bg-blue-200"
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

        {/* Quick Actions */}
        {/* <div className="mt-6">
          <button
            className="px-3 py-1 rounded bg-primary text-white"
            onClick={() => setIsModalOpen(true)}
          >
            Add sources
          </button>
        </div> */}
      </aside>

      {/* Main Content */}
      {/* <main className="flex-1 p-6 bg-white">{children}</main> */}

        <main className="flex-1 p-6 bg-gradient-to-l from-blue-200 to-gray-200 h-screen flex flex-col">
          {/* Ensure children take up full height */}
          <div className="flex-1 z-10">{children}</div>
        </main>

      {/* AddSources Modal */}
      <AddSourcesModal
        isOpen={isModalOpen}
        kitId={studyKitId}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
    </div>
  );
}
