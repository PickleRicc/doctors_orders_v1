import React from "react";

import { cn } from "@/lib/utils";

/**
 * ShimmerButton props
 * @typedef {Object} ShimmerButtonProps
 * @property {string} [shimmerColor="#ffffff"] - Color of the shimmer effect
 * @property {string} [shimmerSize="0.02em"] - Size of the shimmer cutout (reduced from original 0.05em)
 * @property {string} [borderRadius="100px"] - Border radius of the button
 * @property {string} [shimmerDuration="3s"] - Duration of the shimmer animation
 * @property {string} [background="rgba(0, 0, 0, 1)"] - Background color of the button
 * @property {string} [className] - Additional class names
 * @property {React.ReactNode} [children] - Button content
 */

export const ShimmerButton = React.forwardRef(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.02em", // Smaller shimmer size default
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        style={
          {
            "--spread": "60deg", // Smaller spread angle (was 90deg)
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          }
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)] dark:text-black",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
          className,
        )}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <div
          className={cn(
            "-z-30 blur-[1px]", // Reduced blur (was 2px)
            "absolute inset-0 overflow-visible [container-type:size]",
          )}
        >
          {/* spark */}
          <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            {/* spark before */}
            <div className="absolute -inset-full w-auto rotate-0 animate-spin-around scale-75 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>
        {children}

        {/* Highlight - subtle brightness change instead of shadow */}
        <div
          className={cn(
            "insert-0 absolute size-full",

            "rounded-2xl px-4 py-1.5 text-sm font-medium",

            // transition
            "transform-gpu transition-all duration-300 ease-in-out",

            // on hover - subtle brightness change 
            "group-hover:brightness-110",

            // on click - subtle brightness change 
            "group-active:brightness-90",
          )}
        />

        {/* backdrop */}
        <div
          className={cn(
            "absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]",
          )}
        />
      </button>
    );
  },
);

ShimmerButton.displayName = "ShimmerButton";
