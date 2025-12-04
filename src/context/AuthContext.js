"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // while auth is loading
  const router = useRouter();

  // 1. Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.getCurrentUser();
        // If success, save user data to state
        setUser(response.data);
      } catch (error) {
        // If error (401), user is guest
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 2. Login Function
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.data.user); // Update state immediately
    return response;
  };

  // 3. Register Function
  const register = async (userData) => {
    return await authService.register(userData);
  };

  // 4. Logout Function
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook to use the context easily
export const useAuth = () => useContext(AuthContext);
