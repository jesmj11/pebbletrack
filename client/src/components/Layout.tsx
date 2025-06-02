import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "./Header";
import TeacherSidebar from "./TeacherSidebar";
import StudentSidebar from "./StudentSidebar";

interface User {
  id: number;
  email: string;
  role: "parent" | "student";
  fullName: string;
  familyName?: string;
}

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMobile, setIsMobile] = useState(false);
  
  // Get current authenticated user
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const isParent = user?.role === "parent";

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener("resize", checkScreenSize);

    // Clean up
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-light">
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-light">
      <Header user={user} />
      
      <div className="flex flex-1">
        {isParent ? <TeacherSidebar /> : <StudentSidebar />}
        
        <main className={`flex-1 p-4 md:p-6 ${isMobile ? 'ml-16' : 'ml-16 md:ml-64'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
