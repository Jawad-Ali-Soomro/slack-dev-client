import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { ThemeToggle } from './components/ThemeToggle'
import { AuthProvider } from './contexts/AuthContext'
import { SidebarProvider } from './contexts/SidebarContext'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Indexing from './pages/Indexing'
import About from './pages/About'
import Contact from './pages/Contact'
import Teams from './pages/Teams'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Meetings from './pages/Meetings'
import { Toaster } from 'sonner'

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500',
            position: 'relative'
          },
          className: 'relative',
          closeButton: {
            position: 'absolute',
            top: '8px',
            left: '12px',
            right: 'auto',
            padding: '10px',
            border: '1px solid black',
          }
        }}
      />
      <AuthProvider>
        <SidebarProvider>
          <ThemeToggle className="fixed bottom-10 right-10 z-50" />
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
            </Routes>
          </div>
        </SidebarProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
