"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    // wait until auth bootstrap completes
    if (!loading && !isAuthenticated) {
      // replace so user can't go "back" into protected route
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  // while we are checking auth, show a loader (avoid flashing content)
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // if not authenticated, effect will redirect — render nothing here
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
