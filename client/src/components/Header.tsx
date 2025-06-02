import { useState } from "react";
import { useLocation } from "wouter";
import { School, PersonStanding, LogOut, Eye, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import StudentDashboard from "@/pages/StudentDashboardNew";

interface User {
  id: number;
  email: string;
  role: "parent" | "student";
  fullName: string;
  familyName?: string;
}

interface HeaderProps {
  user?: User | null;
}

interface StudentDashboardModalProps {
  onClose: () => void;
  user: User;
}

const StudentDashboardModal = ({ onClose, user }: StudentDashboardModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#7E8A97] to-[#8BA88E] text-white">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Student Dashboard Preview
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
        <div className="overflow-auto max-h-[calc(90vh-80px)]">
          <StudentDashboard />
        </div>
      </div>
    </div>
  );
};

const Header = ({ user }: HeaderProps) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showStudentDashboard, setShowStudentDashboard] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    setShowDropdown(false);
    logoutMutation.mutate();
  };

  const handleViewStudentDashboard = () => {
    setShowDropdown(false);
    setShowStudentDashboard(true);
  };

  if (!user) {
    return null; // Don't show header when not authenticated
  }

  return (
    <>
      <header className="bg-gradient-to-r from-[#7E8A97] to-[#8BA88E] text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <School className="mr-3 h-6 w-6" />
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Pebble Track
            </h1>
            {user.familyName && (
              <span className="ml-3 text-sm opacity-90">
                {user.familyName} Family
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline-block font-medium">
              {user.fullName}
            </span>
            
            {user.role === "parent" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewStudentDashboard}
                className="text-white hover:bg-white/20"
              >
                <Eye className="mr-2 h-4 w-4" />
                View as Student
              </Button>
            )}
            
            <div className="relative">
              <button 
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <PersonStanding className="h-5 w-5 text-white" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50 border">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-[#4B5563]">{user.fullName}</p>
                      <p className="text-xs text-[#6B7280]">{user.email}</p>
                      <p className="text-xs text-[#6B7280] capitalize">{user.role}</p>
                    </div>
                    
                    {user.role === "parent" && (
                      <button
                        onClick={handleViewStudentDashboard}
                        className="flex items-center w-full px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F4F6]"
                      >
                        <Eye className="mr-3 h-4 w-4" />
                        <span>View Student Dashboard</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => setLocation("/students")}
                      className="flex items-center w-full px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F4F6]"
                    >
                      <Users className="mr-3 h-4 w-4" />
                      <span>Manage Students</span>
                    </button>
                    
                    <div className="border-t mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span>{logoutMutation.isPending ? "Signing out..." : "Sign out"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Student Dashboard Modal */}
      {showStudentDashboard && (
        <StudentDashboardModal
          onClose={() => setShowStudentDashboard(false)}
          user={user}
        />
      )}
    </>
  );
};

export default Header;
