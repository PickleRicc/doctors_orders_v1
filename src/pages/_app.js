import '../app/globals.css'
import { AuthProvider } from '../hooks/useAuth'
import { Toaster } from 'react-hot-toast'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

/**
 * Main application component
 * Wraps the entire app with AuthProvider to make authentication
 * available throughout the application
 */
function MyApp({ Component, pageProps }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AuthProvider>
        <Component {...pageProps} />
        <Toaster 
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: '#f0fdf4',
              border: '1px solid #dcfce7',
              color: '#166534',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#f0fdf4',
            },
            duration: 3000,
          },
          error: {
            style: {
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#b91c1c',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fef2f2',
            },
            duration: 4000,
          },
        }}
        />
      </AuthProvider>
    </LocalizationProvider>
  )
}

export default MyApp
