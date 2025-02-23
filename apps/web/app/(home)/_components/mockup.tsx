import React from "react";

export interface MockupProps extends React.HTMLAttributes<HTMLDivElement> {
    type?: "mobile" | "responsive";
}

const Mockup = React.forwardRef<HTMLDivElement, MockupProps>(
    ({ className = "", type = "responsive", children, ...props }, ref) => {
        const typeClass = type === "mobile" ? "rounded-[48px] max-w-[350px]" : "rounded-md";
        return (
            <div
                ref={ref}
                className={`flex relative z-10 w-full h-full overflow-hidden shadow-2xl border border-border/5 border-t-border/15 ${typeClass} ${className}`}
                {...props}
            >
                {children} 
            </div>
        );
    }
);

Mockup.displayName = "Mockup";

export interface MockupFrameProps extends React.HTMLAttributes<HTMLDivElement> { 
    size?: "small" | "large";
}

const MockupFrame = React.forwardRef<HTMLDivElement, MockupFrameProps>(
    ({ className = "", size = "small", children, ...props }, ref) => {
        const sizeClass = size === "large" ? "p-4" : "p-2";

        return (
            <div 
                ref={ref} 
                className={`bg-accent/5 flex relative z-10 w-full h-full overflow-hidden rounded-2xl ${sizeClass} ${className}`}
                {...props}
            >
                {children} 
            </div>
        );
    }
);

MockupFrame.displayName = "MockupFrame";

export { Mockup, MockupFrame };