// src/app/studykit/[studyKitId]/layout.tsx
import React from "react";
import StudyKitClientLayout from "@/components/StudyKitClientLayout";

export default function StudyKitLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { studyKitId: string };
}) {
  // keep this a server component and render the client layout inside
  return (
    <StudyKitClientLayout studyKitId={params.studyKitId}>
        {children}
    </StudyKitClientLayout>
);
}
