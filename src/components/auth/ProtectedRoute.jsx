import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';

/**
 * ProtectedRoute component for securing authenticated pages
 * Redirects to auth page if user is not authenticated
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render when authenticated
 * @returns {JSX.Element} Protected route component
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // If not loading and no user, redirect to auth page
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16">
            {/* Glass morphism loading spinner per style guide */}
            <div className="absolute inset-0 rounded-full bg-blue-light/30 backdrop-blur-sm"></div>
            <div className="absolute inset-[2px] rounded-full border-2 border-t-blue-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <p className="text-body-medium text-muted-foreground">Verifying session...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated and not loading, don't render anything
  // (will redirect via useEffect)
  if (!user) {
    return null;
  }
  
  // If authenticated, render children
  return children;
}

export default ProtectedRoute;
