import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient, getQueryFn } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
// import { TooltipProvider } from "@/components/ui/tooltip"; // Temporarily disabled due to useRef error
import MobileNav from "@/components/MobileNav";
import { useAuth } from "@/hooks/useAuth";


// Pages
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import TeacherDashboard from "@/pages/TeacherDashboardNew";
import StudentDashboard from "@/pages/StudentDashboardNew";
import Students from "@/pages/Students";
import Classes from "@/pages/Classes";
import Assignments from "@/pages/Assignments";
import Reports from "@/pages/Reports";
import Planner from "@/pages/Planner";
import StudentTasks from "@/pages/StudentTasks";
import Settings from "@/pages/Settings";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import Curriculum from "@/pages/Curriculum";

// Family-based user interface
interface User {
  id: string;
  email: string;
  role: "parent" | "student";
  fullName: string;
  familyName?: string;
}

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  // Make user available globally for debugging
  (window as any).currentUser = user;
  
  // Redirect to the appropriate dashboard based on user role
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Set default role to parent if not set
      const userRole = user.role || "parent";
      
      if (location === "/" && userRole === "parent") {
        setLocation("/teacher/dashboard");
      } else if (location === "/" && userRole === "student") {
        setLocation("/student");
      }
    }
  }, [user, isLoading, isAuthenticated, location, setLocation]);

  // Show login page if not authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#9CA3AF] via-[#A7B8A8] to-[#7FB3C4] flex items-center justify-center">
        <div className="text-xl font-bold text-[#4B5563]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
          Loading Pebble Track...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  // Temporary: If there's an authentication issue, show a simple page without complex components
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Welcome to Homeschool Planner</h1>
          <p className="text-gray-600 mb-4">Please sign in to continue.</p>
          <a 
            href="/api/login" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Authenticated routes */}
      <Route path="/">
        <Layout>
          {user.role === "parent" ? <TeacherDashboard /> : <StudentDashboard />}
        </Layout>
      </Route>
      <Route path="/teacher/dashboard">
        <Layout>
          <TeacherDashboard />
        </Layout>
      </Route>
      <Route path="/students">
        <Layout>
          <Students />
        </Layout>
      </Route>
      <Route path="/classes">
        <Layout>
          <Classes />
        </Layout>
      </Route>
      <Route path="/assignments">
        <Layout>
          <Assignments />
        </Layout>
      </Route>
      <Route path="/planner">
        <Layout>
          <Planner />
        </Layout>
      </Route>
      <Route path="/reports">
        <Layout>
          <Reports />
        </Layout>
      </Route>
      <Route path="/curriculum">
        <Layout>
          <Curriculum />
        </Layout>
      </Route>
      <Route path="/student">
        <Layout>
          <StudentDashboard />
        </Layout>
      </Route>
      <Route path="/student/tasks">
        <Layout>
          <StudentTasks />
        </Layout>
      </Route>
      <Route path="/settings">
        <Layout>
          <Settings />
        </Layout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MobileNav />
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;