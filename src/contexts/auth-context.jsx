import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { authService } from "../services/auth-service";
import { clearGithubStorage } from "../utils/github-storage";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const userProfile = await authService.getCurrentUser();
      setUser(userProfile.user);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem("userData");
      clearGithubStorage();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);

      const result = await authService.login(credentials);
      if (result.success) {
        if (result.user && !result.emailSent) {
          clearGithubStorage();
          setUser(result.user);
          setIsAuthenticated(true);
          window.dispatchEvent(new Event("tm-auth-changed"));
        }

        return {
          success: true,
          user: result.user,
          emailSent: result.emailSent,
          message: result.message,
        };
      } else {
        return { success: false, error: result.message || "Login failed" };
      }
    } catch (error) {
      return { success: false, error: error.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed, clearing local state anyway:", error);
    } finally {
      localStorage.removeItem("userData");
      clearGithubStorage();
      setUser(null);
      setIsAuthenticated(false);
      window.dispatchEvent(new Event("tm-auth-changed"));
      window.location.href = "/login";
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      return { success: true, message: "Reset code sent to email" };
    } catch (error) {
      return { success: false, error: "Failed to send reset code" };
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp) => {
    try {
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (otp.length === 4) {
        return { success: true, message: "OTP verified successfully" };
      } else {
        return { success: false, error: "Invalid OTP" };
      }
    } catch (error) {
      return { success: false, error: "OTP verification failed" };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updates) => {
    if (!user) return;
    const next = { ...user, ...updates };
    try {
      localStorage.setItem("userData", JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setUser(next);
  };

  const isSuperadmin = useMemo(() => {
    return user?.role === "superadmin";
  }, [user]);

  const isAdmin = useMemo(() => {
    return user?.role === "admin" || user?.role === "superadmin";
  }, [user]);

  const isUser = useMemo(() => {
    return user?.role === "user" || !user?.role;
  }, [user]);

  const hasRole = useMemo(() => {
    return (role) => {
      if (!user) return false;
      if (role === "superadmin") return user.role === "superadmin";
      if (role === "admin")
        return user.role === "admin" || user.role === "superadmin";
      if (role === "user") return true; // All authenticated users have user role
      return false;
    };
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      login,
      logout,
      forgotPassword,
      verifyOTP,
      updateUser,

      isSuperadmin,
      isAdmin,
      isUser,
      hasRole,
      userRole: user?.role || "user",
    }),
    [
      user,
      isAuthenticated,
      loading,
      isSuperadmin,
      isAdmin,
      isUser,
      hasRole,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
