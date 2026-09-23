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
                      <Route path="/" element={<Indexing />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />

                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                      />
                      <Route path="/verify-email" element={<VerifyEmail />} />

                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute requireAuth={true}>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/tasks"
                        element={
                          <ProtectedRoute requireAuth={true}>
                            <Tasks />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/meetings"
                        element={
                          <ProtectedRoute requireAuth={true}>
                            <Meetings />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/projects"
                        element={
                          <ProtectedRoute requireAuth={true}>
                            <Projects />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/dashboard/my-bought-projects"
                        element={
                          <ProtectedRoute requireAuth={true}>
                            <MyBoughtProjects />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/dashboard/explore"
                        element={
                          <ProtectedRoute requireAuth={true}>
                            <Explore />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/dashboard/teams"
                        element={
                          <ProtectedRoute requireAuth={true}>
                            <TeamsManage />
                          </ProtectedRoute>
                        }
                      />
                      
                      <Route
                        path="/dashboard/automation"
                        element={
                          <ProtectedRoute requireAuth={true}>
                            <Automation />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/friends"
                        element={
                          <ProtectedRoute requireAuth={true}>
                            <Friends />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/chat"
                        element={
                          <ProtectedRoute requireAuth={true}>
                            <Chat />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/learn-point"
                        element={
                          <ProtectedRoute requireAuth={true}>
                            <LearnPoint />
                          </ProtectedRoute>
                        }
                      />
                   
                   
                      <Route
                        path="/dashboard/repos"
                        element={
                          <ProtectedRoute requireAuth={true}>
                            <Repos />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/repos/:id"
                        element={
                          <ProtectedRoute requireAuth={true}>
                            <RepoDetail />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/dashboard/admin/users"
                        element={
                          <ProtectedRoute requireAuth={true}>
                            <UserManagement />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/admin/permissions"
                        element={
                          <ProtectedRoute requireAuth={true}>
                            <PermissionsManagement />
                          </ProtectedRoute>
                        }
                      />

                      <Route path="*" element={<NotFound />} />
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
