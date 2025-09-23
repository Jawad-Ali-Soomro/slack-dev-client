import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { ThemeToggle } from './components/ThemeToggle'
import { AuthProvider } from './contexts/AuthContext'
import { SidebarProvider } from './contexts/SidebarContext'
import { NotificationProvider } from './contexts/NotificationContext'
import ProtectedRoute from './components/ProtectedRoute'
import Indexing from './pages/Indexing'
import About from './pages/About'
import Contact from './pages/Contact'
import Teams from './pages/Teams'
import TeamsManage from './components/TeamsManage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Meetings from './pages/Meetings'
import Projects from './pages/Projects'
import { Toaster } from 'sonner'

function App() {
  return (
   <div className="bg-white dark:bg-gray-900">
     <Router>
      <Toaster 
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            margin: '4px 0',
            padding: '12px 16px'
          },
          className: 'toast-custom'
        }}
      />
      <AuthProvider>
        <NotificationProvider>
          <SidebarProvider>
          <ThemeToggle className="fixed bottom-5 right-10 z-50" />
          <div className="relative">
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Indexing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/teams" element={<Teams />} />
            
            {/* Auth Routes - Redirect to dashboard if already logged in */}
            <Route 
              path="/login" 
              element={
                  <Login />
              } 
            />
            <Route 
              path="/signup" 
              element={
                  <Signup />
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                  <ForgotPassword />
              } 
            />
            <Route 
              path="/verify-email" 
              element={
                  <VerifyEmail />
              } 
            />
            
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
                  path="/dashboard/teams" 
                  element={
                    <ProtectedRoute requireAuth={true}>
                      <TeamsManage />
                    </ProtectedRoute>
                  } 
                />
            </Routes>
          </div>
        </SidebarProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
   </div>
  )
}

export default App
