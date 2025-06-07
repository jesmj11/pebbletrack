import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
  hasBottomNav?: boolean;
  hasHeader?: boolean;
}

const MobileLayout = ({ 
  children, 
  className, 
  hasBottomNav = true, 
  hasHeader = true 
}: MobileLayoutProps) => {
  return (
    <div className={cn(
      "min-h-screen bg-[#F5F2EA] dark:bg-gray-900",
      hasHeader && "mobile-header-spacing md:pt-0",
      hasBottomNav && "mobile-bottom-nav-spacing md:pb-0",
      className
    )}>
      <div className="mobile-padding md:px-6 py-4">
        {children}
      </div>
    </div>
  );
};

export default MobileLayout;