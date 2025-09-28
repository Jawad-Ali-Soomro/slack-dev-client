import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckSquare, 
  Calendar, 
  Code, 
  FolderOpen, 
  PenTool, 
  Settings,
  LayoutDashboard,
  MessageCircle,
  LogOut,
  Users,
  UserCheck,
  MessageSquare
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { BsChatSquareText } from "react-icons/bs";
import { PiCrown, PiUserCheck } from "react-icons/pi";

const Sidebar = () => {
  const { isOpen, closeSidebar, openSidebar } = useSidebar()
  const { isAuthenticated, logout } = useAuth()
  const { unreadCounts } = useNotifications()
  const location = useLocation()
  
  console.log('Sidebar unreadCounts:', unreadCounts)
  
  const sidebarItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      color: 'text-black dark:text-white',
      badgeCount: 0
    },
    {
      title: 'Tasks',
      icon: CheckSquare,
      path: '/dashboard/tasks',
      color: 'text-black dark:text-white',
      badgeCount: unreadCounts.tasks
    },
    {
      title: 'Meetings',
      icon: Calendar,
      path: '/dashboard/meetings',
      color: 'text-black dark:text-white',
      badgeCount: unreadCounts.meetings
    },  
    {
      title: 'Code',
      icon: Code,
      path: '/dashboard/code',
      color: 'text-black dark:text-white',
      badgeCount: unreadCounts.code || 0
    },  
      {
      title: 'Projects',
      icon: FolderOpen,
      path: '/dashboard/projects',
      color: 'text-black dark:text-white',
      badgeCount: unreadCounts.projects
    },
    {
      title: 'Teams',
      icon: Users,
      path: '/dashboard/teams',
      color: 'text-black dark:text-white',
      badgeCount: unreadCounts.teams
    },
    {
      title: 'Friends',
      icon: PiUserCheck,
      path: '/dashboard/friends',
      color: 'text-black dark:text-white',
      badgeCount: 0
    },
    {
      title: 'Messages',
      icon: BsChatSquareText,
      path: '/dashboard/chat',
      color: 'text-black dark:text-white',
      badgeCount: unreadCounts.messages
    },
    {
      title: 'Premium',
      icon: PiCrown,
      path: '/premium',
      color: 'text-white',
      bg: 'bg-yellow-500 dark:bg-yellow-600'
    },
  ]

  const isActive = (path) => location.pathname === path

  // Auto-open sidebar on desktop for protected routes
  useEffect(() => {
    if (isAuthenticated) {
      const handleResize = () => {
        if (window.innerWidth >= 1024) { // lg breakpoint
          openSidebar()
        }
      }

      // Open on mount if desktop
      handleResize()
      
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [isAuthenticated, openSidebar])

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40
      }
    }
  }

  const overlayVariants = {
    open: {
      opacity: 1,
      transition: { duration: 0.2 }
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  }

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 }
    },
    closed: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2 }
    }
  }

  // Don't render sidebar if user is not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="open"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 lg:hidden"
            onClick={closeSidebar}
          />
          
          {/* Sidebar */}
          <motion.aside
            variants={sidebarVariants}
            initial="open"
            animate="open"
            exit="open"
            className="fixed icon left-0 top-0 h-full w-60 bg-white dark:bg-black z-50 border-r border-gray-200 dark:border-gray-700 lg:z-50"
          >
            {/* Header */}
            <div className="flex items-center py-5 justify-start p-4 border-b icon gap-2 border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-gray-200 p-2 rounded-lg gap-2 flex flex items-center justify-center dark:bg-black">
                {/* <User className="w-5 h-5 text-white dark:text-black" /> */}
                <img src="/logo.png" alt="" />
              </div>
                <h1 className=" font-bold ">Slack Developers</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2">
              <div className="space-y-2 flex flex-col items-center justify-start">
                {sidebarItems.map((item, index) => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  
                  return (
                    <motion.div
                      key={item.path}
                      variants={itemVariants}
                      initial="closed"
                      animate="open"
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        onClick={closeSidebar}
                        title={item.title}
                        className={`relative flex items-center justify-start px-4 gap-4 ${item.title == 'Premium' && 'bg-yellow-500 dark:bg-yellow-600 text-white hover:bg-yellow-600 dark:hover:bg-yellow-700'} relative w-50 h-[50px] rounded-lg transition-all duration-200 group ${
                          active
                            ? 'shadow-none bg-black  text-white dark:bg-white  px-5  dark:text-black shadow-lg '
                            : item.title == 'Premium' ? '' : 'hover:bg-gray-100 dark:hover:bg-black text-gray-700 dark:text-gray-300'
                        }`} 
                      >
                        <div className="relative">
                          <Icon className={`w-5 h-5 icon transition-transform ${active ? 'text-white dark:text-black' : item.color}`} />
                         
                        </div>
                        {item.title}

                         {item.badgeCount > 0 && (
                            <span className="absolute  right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold z-10">
                              {item.badgeCount > 99 ? '99+' : item.badgeCount}
                            </span>
                          )}
                        {active && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-black dark:bg-white rounded-full"
                            initial={{ x: 0 }}
                            animate={{ x: 0 }}
                            exit={{ x: 0 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  )
                })}
                <div className="flex items-center justify-center text-white gap-2 w-50 h-[50px] rounded-lg transition-all duration-200 group absolute bottom-5  bg-red-500 cursor-pointer" onClick={() => {
                  logout()
                }}>
                  <LogOut className="w-5 h-5 transition-transform icon" />
                  Logout
                </div>
              </div>

           
            </nav>

         
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export default Sidebar
