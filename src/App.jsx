import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { ThemeToggle } from './components/ThemeToggle'
import { AuthProvider } from './contexts/AuthContext'
import { SidebarProvider } from './contexts/SidebarContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { ChatProvider } from './contexts/ChatContext'
import { SearchProvider } from './contexts/SearchContext'
import ProtectedRoute from './components/ProtectedRoute'
import Indexing from './pages/Indexing'
import About from './pages/About'
import Contact from './pages/Contact'
import TeamsManage from './components/TeamsManage'
import Friends from './pages/Friends'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Meetings from './pages/Meetings'
import Projects from './pages/Projects'
import Posts from './pages/Posts'
import PostDetails from './pages/PostDetails'
import Chat from './pages/Chat'
import GitHubDashboard from './pages/GitHubDashboard'
import GitHubRepositories from './pages/GitHubRepositories'
import GitHubPullRequests from './pages/GitHubPullRequests'
import GitHubIssues from './pages/GitHubIssues'
import NotFound from './pages/NotFound'
import { Toaster } from 'sonner'

function App() {
  return (
   <div className='bg-gray-100 dark:bg-black'>
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
          <ChatProvider>
            <SearchProvider>
              <SidebarProvider>
          <ThemeToggle className="fixed bottom-25 right-10 z-50" />
          <div className="relative">
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Indexing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
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
                  path="/dashboard/posts" 
                  element={
                    <ProtectedRoute requireAuth={true}>
                      <Posts />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/post/:id" 
                  element={
                    <ProtectedRoute requireAuth={true}>
                      <PostDetails />
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
          path="/dashboard/github" 
          element={
            <ProtectedRoute requireAuth={true}>
              <GitHubDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/github/repositories" 
          element={
            <ProtectedRoute requireAuth={true}>
              <GitHubRepositories />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/github/pull-requests" 
          element={
            <ProtectedRoute requireAuth={true}>
              <GitHubPullRequests />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/github/issues" 
          element={
            <ProtectedRoute requireAuth={true}>
              <GitHubIssues />
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
  )
}

export default App
