import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import HorizontalLoader from "./HorizontalLoader";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import { useSidebar } from "../contexts/SidebarContext";
import { ChevronLeft, ChevronRight, SidebarOpen } from "lucide-react";
import { useState } from "react";

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated, loading } = useAuth();
  const { isOpen, toggleSidebar, isMobile } = useSidebar();
  const location = useLocation();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <HorizontalLoader 
        message="Authenticating..."
        subMessage="Checking your credentials"
        progress={50}
        className="min-h-screen"
      />
    );
  }

  // If route requires authentication and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route requires no authentication (like login/signup) and user is authenticated
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#eee] dark:bg-[#111827]">
      <DashboardHeader />
      <div className="flex">
       
       <div onClick={(e) => e.stopPropagation()}>
       <Sidebar />
       </div>


        <div className={`${isOpen ? "md:pl-65" : "md:pl-20"} transition-all  flex-1 pr-10 md:pt-20 pt-25 pl-15 overflow-hidden`} >
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute;
