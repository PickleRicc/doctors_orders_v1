"use client"

import React from "react"

/**
 * Label component following the PT SOAP Generator design system
 * Using Roboto font with the specified typography guidelines
 */
const Label = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <label
      className={`text-sm font-medium text-foreground ${className}`}
      ref={ref}
      {...props}
    />
  )
})

Label.displayName = "Label"

export { Label }
