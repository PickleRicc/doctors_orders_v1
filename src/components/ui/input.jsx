"use client"

import React from "react"

/**
 * Input component that follows the PT SOAP Generator design system
 * Styled based on the style guide with proper colors, dimensions, and states
 */
const Input = React.forwardRef(({ className = "", type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={`w-full h-11 px-4 py-3 rounded-lg text-base font-normal 
        bg-white border border-border text-foreground
        focus:outline-none focus:ring-2 focus:ring-blue-primary focus:border-blue-primary
        disabled:opacity-50 disabled:cursor-not-allowed
        placeholder:text-muted-foreground ${className}`}
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = "Input"

export { Input }
