import React from "react";

interface GlowProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "top" | "above" | "bottom" | "below" | "center";
}

export const Glow = React.forwardRef<HTMLDivElement, GlowProps>(
    ({ className = "", variant = "top", ...props }, ref) => {
      const variantClass = {
        top: "top-0",
        above: "-top-[128px]",
        bottom: "bottom-0",
        below: "-bottom-[128px]",
        center: "top-[50%]",
      }[variant];
  
      return (
        <div 
          ref={ref} 
          className={`absolute z-10 w-full ${variantClass} ${className}`} 
          {...props}
        >
          <div
            className={`absolute left-1/2 h-[512px] w-[80%] -translate-x-1/2 scale-[2.5] rounded-[50%] 
              bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_rgba(255,255,255,0)_70%)] 
              opacity-30 blur-xl sm:h-[768px] ${variant === "center" ? "-translate-y-1/2" : ""}`}
          />
          <div
            className={`absolute left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2] rounded-[50%] 
              bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.2)_0%,_rgba(255,255,255,0)_70%)] 
              opacity-30 blur-lg sm:h-[384px] ${variant === "center" ? "-translate-y-1/2" : ""}`}
          />
        </div>
      );
    }
  );