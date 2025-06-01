import { useState } from "react";
import { useLocation } from "wouter";
import { School, PersonStanding, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showDropdown, setShowDropdown] = useState(false);

  // Get current user from global window object (for demo)
  const user = (window as any).currentUser || {
    id: 1,
    username: "teacher",
    role: "teacher",
    fullName: "Ms. Johnson"
  };
  
  const handleRoleSwitch = (role: "teacher" | "student") => {
    if (user?.role === role) return;
    
    // Use globally available role switch function (for demo)
    if (typeof (window as any).switchRole === 'function') {
      (window as any).switchRole(role);
    }
    
    if (role === "teacher") {
      setLocation("/teacher/dashboard");
    } else {
      setLocation("/student/dashboard");
    }
  };

  const handleLogout = () => {
    // For demo purposes, just go to teacher dashboard
    setLocation("/teacher/dashboard");
    toast({
      title: "Demo Mode",
      description: "This is a demo application. You can switch roles using the toggle.",
    });
  };

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <School className="mr-2 h-5 w-5" />
          <h1 className="text-xl font-medium">Pebble Track</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="hidden md:inline-block">{user?.fullName || "Ms. Johnson"}</span>
          
          <div className="relative inline-block w-28 align-middle select-none">
            <div className="flex items-center bg-primary-dark rounded-full p-1">
              <span 
                onClick={() => handleRoleSwitch("teacher")}
                className={`text-white text-xs px-2 py-1 font-medium rounded-full cursor-pointer transition-colors ${user?.role === "teacher" ? "bg-primary" : ""}`}
              >
                Teacher
              </span>
              <span 
                onClick={() => handleRoleSwitch("student")}
                className={`text-white text-xs px-2 py-1 font-medium rounded-full cursor-pointer transition-colors ${user?.role === "student" ? "bg-secondary" : ""}`}
              >
                Student
              </span>
            </div>
          </div>
          
          <div className="relative">
            <button 
              className="w-8 h-8 rounded-full bg-primary-dark flex items-center justify-center"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <PersonStanding className="h-4 w-4 text-white" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-neutral-dark hover:bg-neutral-light"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
