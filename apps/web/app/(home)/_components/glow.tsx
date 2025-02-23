import React from "react";

interface GlowProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "top" | "above" | "bottom" | "below" | "center";
}

const Glow = React.forwardRef<HTMLDivElement, GlowProps>(
  ({ className = "", variant = "top", ...props }, ref) => {
    const variantClass = {
      top: "top-0",
      above: "-top-[128px]",
      bottom: "bottom-0",
      below: "-bottom-[128px]",
      center: "top-[50%]",
    }[variant];

    return (
      <div ref={ref} className={`absolute w-full ${variantClass} ${className}`} {...props}>
        <div
          className={`absolute left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] 
            bg-[radial-gradient(ellipse_at_center,_hsla(var(--brand-foreground)/.5)_10%,_hsla(var(--brand-foreground)/0)_60%)] 
            sm:h-[512px] ${variant === "center" ? "-translate-y-1/2" : ""}`}
        />
        <div
          className={`absolute left-1/2 h-[128px] w-[40%] -translate-x-1/2 scale-[2] rounded-[50%] 
            bg-[radial-gradient(ellipse_at_center,_hsla(var(--brand)/.3)_10%,_hsla(var(--brand-foreground)/0)_60%)] 
            sm:h-[256px] ${variant === "center" ? "-translate-y-1/2" : ""}`}
        />
      </div>
    );
  }
);
Glow.displayName = "Glow";

export { Glow };
