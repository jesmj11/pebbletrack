import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  role: "teacher" | "student";
  fullName: string;
}

interface UserContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  checkAuthentication: () => Promise<void>;
  login: (username: string, password: string) => Promise<User>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkAuthentication = useCallback(async () => {
    try {
      setIsLoading(true);
      // For development, let's create a default user to make testing easier
      // In a real application, this would make an API call to verify the session
      setUser({
        id: 1,
        username: "teacher",
        role: "teacher",
        fullName: "Ms. Johnson"
      });
      
      // Uncomment this for actual authentication
      /*
      const response = await fetch("/api/auth/status", {
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Not authenticated or session expired
        setUser(null);
      }
      */
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    try {
      // For development/demo purposes
      if (username === "teacher") {
        const userData = {
          id: 1,
          username: "teacher",
          role: "teacher" as const,
          fullName: "Ms. Johnson"
        };
        setUser(userData);
        return userData;
      } else if (username === "student") {
        const userData = {
          id: 2,
          username: "student",
          role: "student" as const,
          fullName: "Alex Student"
        };
        setUser(userData);
        return userData;
      }
      
      // Uncomment for actual API login
      /*
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      const userData = await response.json();
      setUser(userData);
      return userData;
      */
      
      throw new Error("Invalid credentials");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const value = {
    user,
    setUser,
    isLoading,
    checkAuthentication,
    login,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}
