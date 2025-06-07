import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TouchFriendlyCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "success" | "warning" | "info";
}

const TouchFriendlyCard = ({ 
  children, 
  className, 
  onClick, 
  disabled = false,
  variant = "default" 
}: TouchFriendlyCardProps) => {
  const variantStyles = {
    default: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700",
    warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
  };

  return (
    <div
      className={cn(
        "border rounded-xl p-4 transition-all duration-200",
        "min-h-[64px] touch-manipulation", // Minimum touch target size
        variantStyles[variant],
        onClick && !disabled && "cursor-pointer hover:shadow-md active:scale-95 active:shadow-sm",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onClick && !disabled ? onClick : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
};

export default TouchFriendlyCard;