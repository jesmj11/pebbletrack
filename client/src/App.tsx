import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
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
import Planner from "@/pages/Planner";
import StudentTasks from "@/pages/StudentTasks";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Family-based user interface
interface User {
  id: number;
  email: string;
  role: "parent" | "student";
  fullName: string;
  familyName?: string;
}

function Router() {
  const [user, setUser] = useState<User | null>(null);
  const [location, setLocation] = useLocation();
  
  // Check authentication status
  const { data: authUser, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    } else if (error) {
      setUser(null);
    }
  }, [authUser, error]);

  // Handle role switching for demo purposes (parent can view as student)
  const handleRoleSwitch = (role: "parent" | "student") => {
    if (role === "parent") {
      setUser({
        ...user!,
        role: "parent"
      });
    } else {
      setUser({
        ...user!,
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
      if (location === "/" && user.role === "parent") {
        setLocation("/teacher/dashboard");
      } else if (location === "/" && user.role === "student") {
        setLocation("/student");
      }
    }
  }, [user, isLoading, location, setLocation]);

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

  if (!user) {
    return (
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/" component={Login} />
        <Route component={Login} />
      </Switch>
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
      <Route component={NotFound} />
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