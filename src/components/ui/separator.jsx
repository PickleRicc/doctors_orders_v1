"use client"

import React from "react"

/**
 * Separator component for visual division between content sections
 * Based on PT SOAP Generator style guide with Notion-inspired neutral colors
 */
const Separator = React.forwardRef(({ className = "", orientation = "horizontal", decorative = true, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`shrink-0 bg-[#e9e9e7] ${
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"
      } ${className}`}
      {...props}
      aria-orientation={orientation}
      role={decorative ? "none" : "separator"}
    />
  )
})

Separator.displayName = "Separator"

export { Separator }
