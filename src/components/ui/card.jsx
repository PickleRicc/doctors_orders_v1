"use client"

import React from "react"

/**
 * Card component following the PT SOAP Generator style guide
 * White background, subtle border, and shadow with specified border radius
 */
const Card = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`bg-white border border-[#f3f4f6] rounded-xl shadow-sm ${className}`}
      {...props}
    />
  )
})

Card.displayName = "Card"

export { Card }
