import { useState, useEffect } from "react";
import Header from "./Header";
import TeacherSidebar from "./TeacherSidebar";
import StudentSidebar from "./StudentSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // Get current user from global window object (for demo)
  const user = (window as any).currentUser || {
    id: 1,
    username: "teacher",
    role: "teacher",
    fullName: "Ms. Johnson"
  };
  const isTeacher = user?.role === "teacher";
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <div className="flex flex-col min-h-screen bg-neutral-light">
      <Header />
      
      <div className="flex flex-1">
        {isTeacher ? <TeacherSidebar /> : <StudentSidebar />}
        
        <main className={`flex-1 p-4 md:p-6 ${isMobile ? 'ml-16' : 'ml-16 md:ml-64'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
