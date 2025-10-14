'use client';

/**
 * Main App Page - Client Component
 * Protected route that renders MainPage for authenticated users
 */

import { ProtectedRoute } from '../auth/ProtectedRoute';
import { StateProvider } from '../MainPage/StateManager';
import MainPage from '../MainPage/MainPage';

export default function MainAppPage() {
  return (
    <ProtectedRoute>
      <StateProvider>
        <MainPage />
      </StateProvider>
    </ProtectedRoute>
  );
}
