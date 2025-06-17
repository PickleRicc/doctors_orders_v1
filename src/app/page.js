export default function Home() {
  // This is a simple server component that just renders the loading UI
  // We'll handle all redirection on the client side after hydration
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mb-4 h-16 w-16 mx-auto rounded-full border-4 border-t-[#007AFF] border-gray-200 animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading your experience...</p>
        <ClientRedirect />
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

/**
 * Client component to handle redirection based on authentication
 */
function ClientRedirect() {
  const router = useRouter();
  // Safe access with defaults in case auth is not initialized yet
  const auth = useAuth() || {};
  const user = auth.user;
  const isLoading = auth.isLoading !== undefined ? auth.isLoading : true;

  useEffect(() => {
    // Only redirect after auth is determined and component is mounted
    if (!isLoading) {
      if (user) {
        // User is authenticated, redirect to dashboard
        router.push("/dashboard");
      } else {
        // User is not authenticated, redirect to auth page
        router.push("/auth");
      }
    }
  }, [user, isLoading, router]);

  // This component doesn't render anything visible
  return null;
}
