import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";
import HorizontalLoader from "./horizontal-loader";
import Sidebar from "./sidebar";
import DashboardHeader from "./dashboard-header";
import VoiceAssistantFab from "./voice-assistant-fab";
import { useSidebar } from "../contexts/sidebar-context";

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated, loading } = useAuth();
  const { isOpen } = useSidebar();
  const location = useLocation();

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

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#eee] dark:bg-[black]">
      <DashboardHeader />
      <div className="flex">
        <div onClick={(e) => e.stopPropagation()}>
          <Sidebar />
        </div>

        <div
          className={`transition-all duration-300 flex-1 pr-5 md:pr-5 md:pt-20 pt-25 pl-5 overflow-hidden ${
            isOpen ? "md:pl-[260px]" : "md:pl-[92px]"
          }`}
        >
          {children}
        </div>
      </div>
      <VoiceAssistantFab />
    </div>
  );
};

export default ProtectedRoute;
