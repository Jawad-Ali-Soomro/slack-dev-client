import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import DashboardHeader from './DashboardHeader'
import { useSidebar } from '../contexts/SidebarContext'
import { ChevronLeft, ChevronRight, SidebarOpen } from 'lucide-react'

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated, loading } = useAuth()
  const { isOpen, toggleSidebar, isMobile } = useSidebar()
  const location = useLocation()

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <motion.div
          className="glass-card p-5 md:p-8 shadow-none border-none rounded-2xl md:shadow-2xl md:border md:border-black md:dark:border-white"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin dark:border-white"></div>
            <p className="text-gray-600 dark:text-gray-300 font-bold">Loading...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // If route requires authentication and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If route requires no authentication (like login/signup) and user is authenticated
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      <div className="flex">
        <Sidebar />
        
        <div className={`flex absolute left-2 top-20 p-3 hover:bg-gray-100 cursor-pointer rounded-full hover:text-black z-10`} onClick={() => toggleSidebar()}>
          <ChevronRight />
        </div>

        <div className={`flex-1 ${ !isMobile &&  isOpen  ? 'md:pl-65 md:pr-10 pt-20 overflow-hidden' : 'md:pl-65 md:pr-10 pt-20 p-5 overflow-hidden'}`}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default ProtectedRoute
