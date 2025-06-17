import ClientRedirect from '../components/client-redirect';

/**
 * Main application entry point
 * Server component that renders the loading UI and includes the client-side redirect component
 */
export default function Home() {
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
