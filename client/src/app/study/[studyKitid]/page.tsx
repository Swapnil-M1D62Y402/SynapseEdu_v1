// src/app/studykit/[studyKitId]/page.tsx
"use client";
import Home from "@/components/Home"; // adjust if your Home component lives at another path

export default function StudyKitHome({ params }: { params: { studyKitId: string } }) {
  // If your Home component is a page that expects props, pass them. If not, ignore.
  return <Home studyKitId={params.studyKitId} />;
}
