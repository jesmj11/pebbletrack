import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import TeacherDashboard from "@/pages/TeacherDashboardNew";
import StudentDashboard from "@/pages/StudentDashboardNew";
import Students from "@/pages/Students";
import Classes from "@/pages/Classes";
import Assignments from "@/pages/Assignments";
import Reports from "@/pages/Reports";
import StudentTasks from "@/pages/StudentTasks";

// Mock user for development
interface User {
  id: number;
  username: string;
  role: "teacher" | "student";
  fullName: string;
}

function Router() {
  const [user, setUser] = useState<User | null>({
    id: 1,
    username: "teacher",
    role: "teacher",
    fullName: "Ms. Johnson"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useLocation();
  
  // Handle role switching (for demo purposes)
  const handleRoleSwitch = (role: "teacher" | "student") => {
    if (role === "teacher") {
      setUser({
        id: 1,
        username: "teacher",
        role: "teacher",
        fullName: "Ms. Johnson"
      });
    } else {
      setUser({
        id: 2,
        username: "student",
        role: "student",
        fullName: "Alex Student"
      });
    }
  };
  
  // Make user and role switching available globally
  (window as any).switchRole = handleRoleSwitch;
  (window as any).currentUser = user;
  
  // Redirect to the appropriate dashboard based on user role
  useEffect(() => {
    if (!isLoading && user) {
      if (location === "/" && user.role === "teacher") {
        setLocation("/teacher/dashboard");
      } else if (location === "/" && user.role === "student") {
        setLocation("/student");
      }
    }
  }, [user, isLoading, location, setLocation]);
  
  // If not logged in, we'll show login page at /
  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  if (!user && location !== "/") {
    setLocation("/");
    return null;
  }

  return (
    <Switch>
      {/* Login path */}
      <Route path="/">
        {/* If user is logged in, redirect to dashboard */}
        {user ? (
          user.role === "teacher" ? (
            <TeacherDashboard />
          ) : (
            <StudentDashboard />
          )
        ) : (
          <Layout>
            <TeacherDashboard />
          </Layout>
        )}
      </Route>

      {/* Teacher routes */}
      <Route path="/teacher/dashboard">
        <Layout>
          <TeacherDashboard />
        </Layout>
      </Route>
      <Route path="/teacher/students">
        <Layout>
          <Students />
        </Layout>
      </Route>
      <Route path="/teacher/classes">
        <Layout>
          <Classes />
        </Layout>
      </Route>
      <Route path="/teacher/assignments">
        <Layout>
          <Assignments />
        </Layout>
      </Route>
      <Route path="/teacher/reports">
        <Layout>
          <Reports />
        </Layout>
      </Route>

      {/* Student routes - No layout/sidebar for security */}
      <Route path="/student">
        <StudentDashboard />
      </Route>
      <Route path="/student/tasks">
        <Layout>
          <StudentTasks />
        </Layout>
      </Route>

      {/* Fallback to 404 */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
