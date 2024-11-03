import React from "react";

const badgeVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/80",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
  outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
  success: "bg-green-100 text-green-800 hover:bg-green-200",
  warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  error: "bg-red-100 text-red-800 hover:bg-red-200",
  ghost: "hover:bg-accent hover:text-accent-foreground",
};

const Badge = React.forwardRef(
  ({ className = "", variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
          transition-colors focus:outline-none focus:ring-2 focus:ring-primary
          focus:ring-offset-2 select-none
          ${badgeVariants[variant]}
          ${className}`}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };