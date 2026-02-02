import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { ThemeToggle } from "./components/ThemeToggle";
import { AuthProvider } from "./contexts/AuthContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ChatProvider } from "./contexts/ChatContext";
import { SearchProvider } from "./contexts/SearchContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Indexing from "./pages/Indexing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import TeamsManage from "./components/TeamsManage";
import Friends from "./pages/Friends";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Meetings from "./pages/Meetings";
import Projects from "./pages/Projects";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import { Toaster } from "sonner";
import UserManagement from "./pages/admin/UserManagement";
import PermissionsManagement from "./pages/admin/PermissionsManagement";
import MyBoughtProjects from "./pages/MyBoughtProjects";
import Explore from "./pages/Explore";
import LearnPoint from "./pages/LearnPoint";
import Challenges from "./pages/Challenges";
import ChallengeDetail from "./pages/ChallengeDetail";
import Notes from "./pages/Notes";

function App() {
  return (
    <div className="bg-white dark:bg-[#111827]">
      <Router>
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "500",
              margin: "4px 0",
              padding: "12px 16px",
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
                      {/* Public Routes */}
                      <Route path="/" element={<Indexing />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />

                      {/* Auth Routes - Redirect to dashboard if already logged in */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                      />
                      <Route path="/verify-email" element={<VerifyEmail />} />

                      {/* Protected Routes - Require authentication */}
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
                        path="/learn-point/notes"
                        element={
                          <ProtectedRoute requireAuth={true}>
                            <Notes />
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
                        path="/dashboard/challenges"
                        element={
                          <ProtectedRoute requireAuth={true}>
                            <Challenges />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/challenges/:id"
                        element={
                          <ProtectedRoute requireAuth={true}>
                            <ChallengeDetail />
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin Routes - Require admin role */}
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

                      {/* 404 Route - Must be last */}
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
