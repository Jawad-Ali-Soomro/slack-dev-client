import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckSquare, 
  Calendar, 
  Code, 
  FolderOpen, 
  LayoutDashboard,
  LogOut,
  Users,
  CheckSquare2,
  Wifi,
  Github,
  WifiCog,
  Network,
  WifiHigh,
  WifiIcon,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'
import { useAuth } from '../contexts/AuthContext'
  import { useNotifications } from '../contexts/NotificationContext'
import { HiOutlineRectangleGroup } from "react-icons/hi2";
import { IoFolderOpenOutline } from "react-icons/io5";
import { PiCrown, PiUserCheck, PiCheckSquare, PiGithubLogo } from "react-icons/pi";
import { BiMessageSquare, BiMessageSquareDetail, BiNews } from "react-icons/bi";
import { GoCalendar } from "react-icons/go";
import { MdRssFeed } from "react-icons/md";
import { BsGithub } from 'react-icons/bs'

const Sidebar = () => {
  const { isOpen, closeSidebar, openSidebar } = useSidebar()
  const { isAuthenticated, logout } = useAuth()
  const { unreadCounts } = useNotifications()
  const location = useLocation()
  
  console.log('Sidebar unreadCounts:', unreadCounts)
  
  // Handle premium navigation
 
  
  const sidebarItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      color: 'text-black dark:text-white',
      badgeCount: 0
    },
    {
      title: 'Latest Feed',
      icon: WifiIcon,
      path: '/dashboard/posts',
      color: 'text-black dark:text-white',
      badgeCount: 0
    },
    {
      title: 'Version Control',
      icon: Github,
      path: '/dashboard/github',
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
      icon: GoCalendar,
      path: '/dashboard/meetings',
      color: 'text-black dark:text-white',
      badgeCount: unreadCounts.meetings
    },  
      {
      title: 'Projects',
      icon: IoFolderOpenOutline,
      path: '/dashboard/projects',
      color: 'text-black dark:text-white',
      badgeCount: unreadCounts.projects
    },
   
    {
      title: 'Teams',
      icon: HiOutlineRectangleGroup,
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
      icon: BiMessageSquareDetail,
      path: '/dashboard/chat',
      color: 'text-black dark:text-white',
      badgeCount: unreadCounts.messages
    },
   
  ]

  const isActive = (path) => location.pathname === path

  // Auto-open sidebar on desktop for protected routes
  useEffect(() => {
    if (isAuthenticated) {
      const handleResize = () => {
        if (window.innerWidth >= 768) { // lg breakpoint
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 md:hidden"
            onClick={closeSidebar}
          />
          
          {/* Sidebar */}
          <motion.aside
            variants={sidebarVariants}
            initial="open"
            animate="open"
            exit="open"
            className="fixed icon left-0 top-0 h-full w-[70px] bg-white dark:bg-black z-110 border-r border-gray-200 dark:border-gray-700 lg:z-50"
          >
            {/* Header */}
            <div className="flex items-center py-4 justify-center flex items-center justify-center border-b icon border-gray-200 dark:border-gray-700">
              <img src="/logo.png" className='w-[50px] ' alt="" />
              
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
                       
                        title={item.title}
                          className={`relative flex items-center justify-start px-4 gap-4 ${item.title == 'Premium' && 'bg-orange-500 dark:bg-orange-600 text-white hover:bg-orange-600 dark:hover:bg-orange-700'} relative w-[50px] h-[50px] rounded-[25px] transition-all duration-200 group ${
                          active
                            ? `{shadow-none bg-[#fe914d]  text-white ${item.title == 'Premium' && 'bg-orange-500 dark:bg-orange-600 text-white hover:bg-orange-600 dark:hover:bg-orange-700'} }`
                            : item.title == 'Premium' ? 'bg-orange-500 dark:bg-orange-600 text-white hover:bg-orange-600 dark:hover:bg-orange-700' : 'hover:bg-gray-100 dark:hover:bg-black text-gray-700 dark:text-gray-300'
                        }`} 
                      >
                        <div className="relative flex items-center gap-4">
                          <Icon className={`w-5 h-5 icon transition-transform ${active ? '' : item.color}`} />
                          
                        </div>

                         {item.badgeCount > 0 && (
                            <span className="absolute  right-2 bg-red-500 text-white text-xs rounded-[25px] h-5 w-5 flex items-center justify-center font-bold z-10">
                              {item.badgeCount > 99 ? '99+' : item.badgeCount}
                            </span>
                          )}
                        {active && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#fe914d] rounded-[25px]"
                            initial={{ x: 0 }}
                            animate={{ x: 0 }}
                            exit={{ x: 0 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  )
                })}
                <div className="flex items-center justify-center text-white gap-2 w-[50px] h-[50px] rounded-[25px] transition-all duration-200 group absolute bottom-5  bg-red-500 cursor-pointer" onClick={() => {
                  logout()
                }}>
                  <LogOut className="w-5 h-5 transition-transform icon" />
                 
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
