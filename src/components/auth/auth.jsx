"use client"

import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Shield, FileText } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card } from '../ui/card'
import { Separator } from '../ui/separator'

/**
 * AuthComponent - Authentication component for login, signup, and password reset
 */
const AuthComponent = ({
  onLogin = () => {},
  onSignup = () => {},
  onPasswordReset = () => {}
}) => {
  const [mode, setMode] = useState('login') // 'login', 'signup', or 'reset'
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (mode === 'login') {
        await onLogin(formData)
      } else if (mode === 'signup') {
        await onSignup(formData)
      } else if (mode === 'reset') {
        await onPasswordReset(formData.email)
      }
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: ''
    })
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    resetForm()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#007AFF' }}>
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-foreground">Doctor's Orders</h1>
                <span className="ml-2 px-2 py-0.5 text-xs bg-[#007AFF]/10 text-[#007AFF] rounded-full font-medium">beta 1.0</span>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            Secure documentation for healthcare professionals
          </p>
        </div>

        {/* Main Card */}
        <Card className="p-6 border-border shadow-lg">
          {/* Mode Header */}
          <div className="space-y-4 mb-6">
            {mode === 'reset' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => switchMode('login')}
                className="p-0 h-auto text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to login
              </Button>
            )}
            
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">
                {mode === 'login' && 'Welcome back'}
                {mode === 'signup' && 'Create your account'}
                {mode === 'reset' && 'Reset your password'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === 'login' && 'Sign in to your account to continue'}
                {mode === 'signup' && 'Join thousands of PT professionals'}
                {mode === 'reset' && 'Enter your email to receive reset instructions'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields for Signup */}
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                    First name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="pl-10 border-border focus:border-[#007AFF] focus:ring-[#007AFF]"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                    Last name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="border-border focus:border-[#007AFF] focus:ring-[#007AFF]"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 border-border focus:border-[#007AFF] focus:ring-[#007AFF]"
                  required
                />
              </div>
            </div>

            {/* Password Fields */}
            {mode !== 'reset' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10 border-border focus:border-[#007AFF] focus:ring-[#007AFF]"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="pl-10 pr-10 border-border focus:border-[#007AFF] focus:ring-[#007AFF]"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Forgot Password Link */}
            {mode === 'login' && (
              <div className="text-right">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => switchMode('reset')}
                  className="p-0 h-auto text-sm text-[#007AFF] hover:text-[#0056b3]"
                >
                  Forgot your password?
                </Button>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full text-white font-medium"
              style={{ backgroundColor: '#007AFF' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Please wait...</span>
                </div>
              ) : (
                <>
                  {mode === 'login' && 'Sign in'}
                  {mode === 'signup' && 'Create account'}
                  {mode === 'reset' && 'Send reset link'}
                </>
              )}
            </Button>
          </form>

          {/* Mode Switch */}
          {mode !== 'reset' && (
            <>
              <div className="relative my-6">
                <Separator className="bg-border" />
                <div className="absolute inset-0 flex justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">or</span>
                </div>
              </div>

              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                </span>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                  className="p-0 h-auto text-sm text-[#007AFF] hover:text-[#0056b3] font-medium"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Privacy Notice */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-1 text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span className="text-xs">HIPAA Compliant & Secure</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Your data is encrypted and protected. We never share your information with third parties.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthComponent
