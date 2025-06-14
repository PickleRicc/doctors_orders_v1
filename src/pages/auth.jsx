"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AuthComponent from '../components/auth/auth'
import authService from '../services/supabase'

/**
 * Authentication page for login, signup, and password reset
 * Implements the PT SOAP Generator style guide
 * Connects to Supabase for secure authentication
 */
export default function AuthPage() {
  const [authError, setAuthError] = useState(null)
  const [authSuccess, setAuthSuccess] = useState(null)
  const router = useRouter()
  
  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { session, error } = await authService.getSession()
      
      // If user is already logged in, redirect to dashboard
      if (session) {
        router.push('/dashboard')
      }
    }
    
    checkSession()
  }, [])

  // Display success/error message with auto-dismiss
  useEffect(() => {
    let timer
    if (authError || authSuccess) {
      timer = setTimeout(() => {
        setAuthError(null)
        setAuthSuccess(null)
      }, 5000)
    }
    
    return () => clearTimeout(timer)
  }, [authError, authSuccess])
  
  // Auth action handlers
  const handleLogin = async (data) => {
    try {
      setAuthError(null)
      const { data: authData, error } = await authService.signIn(data.email, data.password)
      
      if (error) {
        setAuthError(error.message)
        return
      }
      
      setAuthSuccess('Login successful!')
      // Redirect to dashboard after successful login
      router.push('/dashboard')
    } catch (err) {
      setAuthError('An unexpected error occurred. Please try again.')
      console.error('Login error:', err)
    }
  }

  const handleSignup = async (data) => {
    try {
      setAuthError(null)
      
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        setAuthError('Passwords do not match')
        return
      }
      
      // Create metadata with name information
      const metadata = {
        first_name: data.firstName,
        last_name: data.lastName,
        full_name: `${data.firstName} ${data.lastName}`
      }
      
      const { data: authData, error } = await authService.signUp(
        data.email, 
        data.password, 
        metadata
      )
      
      if (error) {
        setAuthError(error.message)
        return
      }
      
      setAuthSuccess('Account created! Please check your email to verify your account.')
    } catch (err) {
      setAuthError('An unexpected error occurred. Please try again.')
      console.error('Signup error:', err)
    }
  }

  const handlePasswordReset = async (email) => {
    try {
      setAuthError(null)
      const { error } = await authService.resetPassword(email)
      
      if (error) {
        setAuthError(error.message)
        return
      }
      
      setAuthSuccess('Password reset instructions sent to your email!')
    } catch (err) {
      setAuthError('An unexpected error occurred. Please try again.')
      console.error('Password reset error:', err)
    }
  }

  return (
    <div className="bg-muted min-h-screen font-sans">
      {/* Optional: Display auth errors/success */}
      {authError && (
        <div className="fixed top-4 right-4 bg-error/10 border border-error text-error px-4 py-3 rounded-lg max-w-xs z-50">
          {authError}
        </div>
      )}
      
      {authSuccess && (
        <div className="fixed top-4 right-4 bg-success/10 border border-success text-success px-4 py-3 rounded-lg max-w-xs z-50">
          {authSuccess}
        </div>
      )}
      
      <AuthComponent
        onLogin={handleLogin}
        onSignup={handleSignup}
        onPasswordReset={handlePasswordReset}
      />
    </div>
  )
}
