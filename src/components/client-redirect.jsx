"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

/**
 * Client component to handle redirection based on authentication
 */
export default function ClientRedirect() {
  const router = useRouter();
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  
  // Get auth context safely
  const auth = useAuth();
  const isLoading = auth?.isLoading !== false; // Consider loading unless explicitly set to false
  const user = auth?.user;

  useEffect(() => {
    // Force redirect after 2 seconds even if auth state isn't ready yet
    // This prevents users from being stuck on loading screen
    const forceRedirectTimer = setTimeout(() => {
      // Redirect to auth by default if we can't determine state
      router.push("/auth");
    }, 2000);

    // Clear this timer if we redirect normally
    return () => clearTimeout(forceRedirectTimer);
  }, [router]);

  useEffect(() => {
    // Don't redirect if we're still loading, unless we've made too many attempts
    if (isLoading && redirectAttempts < 3) {
      // Try again in 500ms
      const timer = setTimeout(() => {
        setRedirectAttempts(prev => prev + 1);
      }, 500);
      
      return () => clearTimeout(timer);
    }
    
    // Auth state is available now (or we've tried enough times)
    if (user) {
      // User is authenticated, redirect to dashboard
      router.push("/dashboard");
    } else {
      // User is not authenticated, redirect to auth page
      router.push("/auth");
    }
  }, [user, isLoading, router, redirectAttempts]);

  // This component doesn't render anything visible
  return null;
}
