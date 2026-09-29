import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./app.css";
import { AuthProvider } from "./contexts/auth-context";
import { SidebarProvider } from "./contexts/sidebar-context";
import { NotificationProvider } from "./contexts/notification-context";
import { ChatProvider } from "./contexts/chat-context";
import { SearchProvider } from "./contexts/search-context";
import ProtectedRoute from "./components/protected-route";
import Indexing from "./pages/indexing";
import About from "./pages/about";
import Contact from "./pages/contact";
import TeamsManage from "./components/teams-manage";
import Friends from "./pages/friends";
import Login from "./pages/login";
import Signup from "./pages/signup";
import ForgotPassword from "./pages/forgot-password";
import VerifyEmail from "./pages/verify-email";
import Dashboard from "./pages/dashboard";
import Tasks from "./pages/tasks";
import Meetings from "./pages/meetings";
import Projects from "./pages/projects";
import Chat from "./pages/chat";
import NotFound from "./pages/not-found";
import { Toaster } from "sonner";
import UserManagement from "./pages/admin/user-management";
import PermissionsManagement from "./pages/admin/permissions-management";
import MyBoughtProjects from "./pages/my-bought-projects";
import Explore from "./pages/explore";
import LearnPoint from "./pages/learn-point";
import RepoDetail from "./pages/repo-detail";
import Repos from "./pages/repos";
import Automation from "./pages/automation";
import FigmaCursor from "./components/figma-cursor";
import { GlobalRipple } from "./components/ui/ripple";
import { routes } from "./lib/routes";

function App() {
  return (
    <div className="bg-white dark:bg-[black]">
      <FigmaCursor />
      <GlobalRipple />
      <Router>
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: "600",
              margin: "4px 0",
              padding: "20px 20px",
              textTransform: "uppercase",
            },
            className: "toast-custom",
          }}
        />

        <AuthProvider>
          <NotificationProvider>
            <ChatProvider>
              <SearchProvider>
                <SidebarProvider>
                  <div className="relative">
                    <Routes>
                      {routes.map((route) => (
                        <Route
                          key={route.path}
                          path={route.path}
                          element={
                            route.isProtected ? (
                              <ProtectedRoute requireAuth>
                                <route.element />
                              </ProtectedRoute>
                            ) : (
                              <route.element />
                            )
                          }
                        />
                      ))}
                    </Routes>
                  </div>
                </SidebarProvider>
              </SearchProvider>
            </ChatProvider>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
