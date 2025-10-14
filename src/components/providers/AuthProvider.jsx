'use client';

/**
 * Client-side Auth Provider for App Router
 * Wraps the auth context from useAuth hook
 */

import { AuthProvider as AuthProviderBase } from '../../hooks/useAuth';

export function AuthProvider({ children }) {
  return <AuthProviderBase>{children}</AuthProviderBase>;
}
