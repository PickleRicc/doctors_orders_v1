"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

/**
 * Main application entry point
 * Redirects to dashboard for authenticated users or auth page for guests
 */
export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth state to be determined
    if (isLoading) return;
    
    // Redirect based on authentication status
    if (user) {
      // User is authenticated, redirect to dashboard
      router.push("/dashboard");
    } else {
      // User is not authenticated, redirect to auth page
      router.push("/auth");
    }
  }, [user, isLoading, router]);

  // Display a minimal loading state while determining redirect
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mb-4 h-16 w-16 mx-auto rounded-full border-4 border-t-blue-primary border-gray-200 animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading your experience...</p>
      </div>
    </div>
  );
}
