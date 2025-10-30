import { useEffect, useState } from 'react'
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
  ChevronDown,
  ChevronRight,
  GitPullRequest,
  AlertCircle,
  FolderOpen as RepoIcon,
  UserPlus,
  Send,
  UserCheck,
  Link2,
  Shield,
  Settings,
  KeyIcon,
  ShieldCheck
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'
import { useAuth } from '../contexts/AuthContext'
  import { useNotifications } from '../contexts/NotificationContext'
import { HiOutlineRectangleGroup } from "react-icons/hi2";
import { IoFolderOpenOutline } from "react-icons/io5";
import { PiCrown, PiUserCheck, PiCheckSquare, PiGithubLogo, PiUsersDuotone } from "react-icons/pi";
import { BiMessageSquare, BiMessageSquareDetail, BiNews } from "react-icons/bi";
import { GoCalendar } from "react-icons/go";
import { MdRssFeed } from "react-icons/md";
import { BsGithub } from 'react-icons/bs'

const Sidebar = () => {
  const { isOpen, closeSidebar, openSidebar } = useSidebar()
  const { isAuthenticated, logout, user } = useAuth()
  const { unreadCounts } = useNotifications()
  const location = useLocation()
  const [githubDropdownOpen, setGithubDropdownOpen] = useState(false)
  const [friendsDropdownOpen, setFriendsDropdownOpen] = useState(false)
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  
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
    // {
    //   title: 'Resources',
    //   icon: Link2,
    //   path: '/dashboard/posts',
    //   color: 'text-black dark:text-white',
    //   badgeCount: 0
    // },
    {
      title: 'Management',
      icon: PiGithubLogo,
      path: '/dashboard/github',
      color: 'text-black dark:text-white',
      badgeCount: 0,
      hasDropdown: true,
      dropdownItems: [
        {
          title: 'Dashboard',
          icon: LayoutDashboard,
          path: '/dashboard/github',
          color: 'text-black dark:text-white'
        },
        {
          title: 'Repositories',
          icon: RepoIcon,
          path: '/dashboard/github/repositories',
          color: 'text-black dark:text-white'
        },
        {
          title: 'Pull Requests',
          icon: GitPullRequest,
          path: '/dashboard/github/pull-requests',
          color: 'text-black dark:text-white'
        },
        {
          title: 'Issues',
          icon: AlertCircle,
          path: '/dashboard/github/issues',
          color: 'text-black dark:text-white'
        }
      ]
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
      icon: PiUsersDuotone,
      path: '/dashboard/teams',
      color: 'text-black dark:text-white',
      badgeCount: unreadCounts.teams
    },
    {
      title: 'Friends',
      icon: PiUserCheck,
      path: '/dashboard/friends',
      color: 'text-black dark:text-white',
      badgeCount: 0,
    
    },
  
    {
      title: 'Messages',
      icon: BiMessageSquareDetail,
      path: '/dashboard/chat',
      color: 'text-black dark:text-white',
      badgeCount: unreadCounts.messages
    },
    // Admin section - only show if user is admin
    ...(user?.role === 'admin' ? [{
      title: 'Administration',
      icon: Settings,
      path: '/dashboard/admin',
      badgeCount: 0,
      hasDropdown: true,
      dropdownItems: [
        {
          title: 'Manage Team',
          icon: PiUsersDuotone,
          path: '/dashboard/admin/users',
          color: 'text-black dark:text-white'
        },
        {
          title: 'Permissions',
          icon: KeyIcon,
          path: '/dashboard/admin/permissions',
          color: 'text-black dark:text-white'
        }
      ]
    }] : [])
   
  ]

  const isActive = (path) => location.pathname === path

  // Auto-open sidebar on desktop for protected routes
  useEffect(() => {
    if (isAuthenticated) {
      const handleResize = () => {
        if (window.innerWidth >= 768) { // lg breakpoint
          // openSidebar()
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
          {/* <motion.div
            variants={overlayVariants}
            initial="open"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 md:hidden"
            onClick={closeSidebar}
          /> */}
          
          {/* Sidebar */}
          <motion.aside
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed icon left-0 top-0 h-[91.5vh] mt-[8.9vh] w-[220px] bg-white dark:bg-black z-110 border-r border-gray-200 dark:border-gray-700 lg:z-50"
          >
            {/* Header */}
           

            {/* Navigation */}
            <nav className="flex items-center justify-center p-2">
              <div className="space-y-2 flex flex-col items-center justify-start">
                {sidebarItems.map((item, index) => {
                  const Icon = item.icon
                  const active = isActive(item.path) || (item.hasDropdown && item.dropdownItems?.some(subItem => isActive(subItem.path)))
                  
                  return (
                    <motion.div
                      key={item.path}
                      initial="closed"
                      className="w-full cursor-pointer"
                    >
                      {item.hasDropdown ? (
                        <div className="relative">
                          <div
                            onClick={() => {
                              if (item.title === 'Management') {
                                setGithubDropdownOpen(!githubDropdownOpen)
                              } else if (item.title === 'Administration') {
                                setAdminDropdownOpen(!adminDropdownOpen)
                              }
                            }}
                            className={`relative text-gray-100 flex items-center cursor-pointer justify-between px-4 gap-4 relative w-[200px] h-[50px] rounded-[10px] transition-all duration-200 group ${
                              active
                                ? `{shadow-none border-l-5 border-[black] bg-gray-100 dark:bg-[rgba(255,255,255,.1)]  text-gray-900 dark:border-white dark:text-white  }`
                                : 'hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,.1)] text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            <div className="relative flex items-center gap-4 justify-center">
                              <Icon className={`w-5 h-5 icon  text-black dark:text-white transition-transform ${active ? '' : item.color}`} />
                              <span className="text-sm font-bold">
                                {item.title}
                              </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform ${
                              (item.title === 'Management' && githubDropdownOpen) || 
                              (item.title === 'Administration' && adminDropdownOpen) 
                                ? 'rotate-180' : ''
                            }`} />
                          </div>
                          
                          <AnimatePresence>
                            {((item.title === 'Management' && githubDropdownOpen) || 
                              (item.title === 'Administration' && adminDropdownOpen)) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="ml-4 mt-2 space-y-1"
                              >
                                {item.dropdownItems?.map((subItem, subIndex) => {
                                  const SubIcon = subItem.icon
                                  const subActive = isActive(subItem.path)
                                  
                                  return (
                                    <Link
                                      key={subItem.path}
                                      to={subItem.path}
                                      className={`flex items-center gap-3 h-10 px-3 py-2 rounded-[8px] text-sm transition-all duration-200 ${
                                        subActive
                                          ? 'bg-gray-100 dark:bg-[rgba(255,255,255,.1)] border-l-3 border-l dark:border-white border-black dark:border-gray-700 text-gray-900 dark:text-white'
                                          : 'hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,.1)] text-gray-600 dark:text-gray-300'
                                      }`}
                                    >
                                      <SubIcon className="w-4 h-4 icon" />
                                      <span className="font-medium">{subItem.title}</span>
                                    </Link>
                                  )
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          to={item.path}
                          title={item.title}
                          className={`relative text-gray-100 flex items-center cursor-pointer justify-start px-4 gap-4 relative w-[200px] h-[50px] rounded-[10px] transition-all duration-200 group ${
                            active
                              ? `{shadow-none border-l-5 border-[black] bg-gray-100 dark:bg-[rgba(255,255,255,.1)]  text-gray-900 dark:border-white dark:text-white  }`
                              : 'hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,.1)] text-gray-500 dark:text-gray-400'
                          }`} 
                        >
                          <div className="relative flex items-center gap-4 justify-center">
                            <Icon className={`w-5 h-5 icon transition-transform ${active ? '' : item.color}`} />
                            <span className="text-sm font-bold">
                              {item.title}
                            </span>
                          </div>

                          {item.badgeCount > 0 && (
                            <span className="absolute right-2 bg-red-500 text-white text-xs rounded-[25px] h-5 w-5 flex items-center justify-center font-bold z-10">
                              {item.badgeCount > 99 ? '99+' : item.badgeCount}
                            </span>
                          )}
                        </Link>
                      )}
                    </motion.div>
                  )
                })}
                <div className="flex items-center justify-center text-white gap-2 w-[200px] h-[50px] rounded-[10px] transition-all duration-200 group absolute bottom-5  bg-red-500 cursor-pointer" onClick={() => {
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
