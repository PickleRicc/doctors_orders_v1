"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

/**
 * Client component to handle redirection based on authentication
 */
export default function ClientRedirect() {
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
