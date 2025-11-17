"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

/**
 * DashboardCard Component
 * A clean blue and white card design for dashboards, supporting:
 * - Icons
 * - Title, value, subtitle display
 * - Trend indicators
 * - Custom children content
 * @typedef {Object} DashboardCardProps
 * @property {React.ReactNode} children - Card content
 * @property {React.ReactNode} [icon] - Optional icon to display
 * @property {string} [className=""] - Additional class names
 * @property {string} [title] - Optional card title
 * @property {string} [value] - Optional value to display
 * @property {string} [subtitle] - Optional subtitle text
 * @property {Object} [trend] - Optional trend information
 */

export const DashboardCard = React.forwardRef(
  ({ 
    icon,
    title, 
    value, 
    subtitle,
    trend,
    children, 
    className, 
    ...props 
  }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: 0.1,
          },
        }}
        className={cn(
          "relative rounded-2xl p-6 overflow-hidden group transition-all",
          "bg-white border border-gray-200",
          "shadow-md hover:shadow-lg",
          "cursor-pointer",
          className
        )}
        whileHover={{ y: -4 }}
        {...props}
      >
        {/* Blue accent top border */}
        <div 
          className="absolute top-0 inset-x-0 h-1" 
          style={{ backgroundColor: 'rgb(var(--blue-primary-rgb))' }}
        />
        
        {/* Icon container */}
        {icon && (
          <div 
            className="absolute top-4 right-4 p-2 rounded-full"
            style={{ backgroundColor: 'rgba(var(--blue-primary-rgb), 0.1)' }}
          >
            {React.isValidElement(icon) ? 
              React.cloneElement(icon, { 
                className: cn("w-6 h-6", icon.props.className),
                style: { color: 'rgb(var(--blue-primary-rgb))' }
              }) : 
              icon
            }
          </div>
        )}
        
        {/* Title, value, and subtitle if provided */}
        {(title || value || subtitle) && (
          <div className="mb-4">
            {title && <h3 className="text-sm font-semibold tracking-wide uppercase text-gray-600 mb-1">{title}</h3>}
            {value && <div className="text-2xl font-bold text-gray-900">{value}</div>}
            {subtitle && <p className="text-xs font-medium text-gray-500 mt-1">{subtitle}</p>}
            {trend && (
              <div className="flex items-center mt-2">
                <span className={`text-xs font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.value}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Content container */}
        <div className="relative z-10 text-gray-800">
          {children}
        </div>
      </motion.div>
    );
  }
);

DashboardCard.displayName = "DashboardCard";

export default DashboardCard;
