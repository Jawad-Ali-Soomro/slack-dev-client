import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CheckSquare,
  GitPullRequest,
  AlertCircle,
  LogOut,
  KeyIcon,
  ChevronDown,
  Dock
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { GoCalendar, GoWorkflow } from 'react-icons/go'
import { IoFolderOpenOutline } from 'react-icons/io5'
import { PiUsersDuotone, PiUserCheck } from 'react-icons/pi'
import { BiMessageSquareDetail } from 'react-icons/bi'
import { FolderOpen as RepoIcon, FileText } from 'lucide-react'

const Sidebar = () => {
  const { isOpen, closeSidebar } = useSidebar()
  const { isAuthenticated, logout, user } = useAuth()
  const { unreadCounts } = useNotifications()
  const location = useLocation()
  const [githubDropdownOpen, setGithubDropdownOpen] = useState(false)
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  const sidebarItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      badgeCount: 0
    },
    {
      title: 'Tasks',
      icon: CheckSquare,
      path: '/dashboard/tasks',
      badgeCount: unreadCounts.tasks
    },
    {
      title: 'Meetings',
      icon: GoCalendar,
      path: '/dashboard/meetings',
      badgeCount: unreadCounts.meetings
    },
    {
      title: 'Flow',
      icon: GoWorkflow,
      path: '/dashboard/github',
      hasDropdown: true,
      dropdownItems: [
        { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/github' },
        { title: 'Repositories', icon: RepoIcon, path: '/dashboard/github/repositories' },
        { title: 'Pull Requests', icon: GitPullRequest, path: '/dashboard/github/pull-requests' },
        { title: 'Issues', icon: AlertCircle, path: '/dashboard/github/issues' }
      ]
    },
    {
      title: 'Projects',
      icon: IoFolderOpenOutline,
      path: '/dashboard/projects',
      badgeCount: unreadCounts.projects
    },
    {
      title: 'Teams',
      icon: PiUsersDuotone,
      path: '/dashboard/teams',
      badgeCount: unreadCounts.teams
    },
    {
      title: 'Friends',
      icon: PiUserCheck,
      path: '/dashboard/friends',
      badgeCount: 0
    },
    ...(user?.role === 'admin'
      ? [
          {
            title: 'Admin',
            icon: KeyIcon,
            path: '/dashboard/admin',
            hasDropdown: true,
            dropdownItems: [
              { title: 'Manage Team', icon: PiUsersDuotone, path: '/dashboard/admin/users' },
              { title: 'Permissions', icon: KeyIcon, path: '/dashboard/admin/permissions' }
            ]
          }
        ]
      : []),
    {
      title: 'Messages',
      icon: BiMessageSquareDetail,
      path: '/dashboard/chat',
      badgeCount: unreadCounts.messages
    },
   
  ]

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 40 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 40 } }
  }

  if (!isAuthenticated) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          variants={sidebarVariants}
          initial="closed"
          animate="open"
          exit="closed"
          className="fixed left-0 top-0 h-[91.5vh] mt-[8.5vh] w-[240px] 
                     bg-[#eee] text-black dark:bg-[#111827] dark:text-white 
                     border-r border-gray-300 dark:border-gray-800 
                     z-50 flex flex-col justify-between icon"
        >
          <nav className="flex flex-col items-center justify-start p-3 gap-2 icon">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const active =
                isActive(item.path) ||
                (item.hasDropdown && item.dropdownItems?.some((sub) => isActive(sub.path)))

              return (
                <div key={item.path} className="w-full flex flex-col items-center">
                  {item.hasDropdown ? (
                    <>
                      <button
                        onClick={() => {
                          if (item.title === 'Flow')
                            setGithubDropdownOpen(!githubDropdownOpen)
                          if (item.title === 'Admin')
                            setAdminDropdownOpen(!adminDropdownOpen)
                        }}
                        className={`flex items-center px-4 gap-4 cursor-pointer justify-start relative w-[220px] h-[50px] rounded-[20px] transition-colors duration-200
                          ${active
                            ? 'bg-white text-black border dark:bg-white dark:text-black'
                            : 'hover:bg-white dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300'}
                        `}
                        title={item.title}
                      >
                        <Icon className="w-5 h-5 icon icon" />
                        <label className='font-semibold cursor-pointer' htmlFor={item.title}>{item.title}</label>
                        <ChevronDown className="w-5 h-5 icon icon absolute right-4" />
                      </button>

                      <AnimatePresence>
                        {((item.title === 'Flow' && githubDropdownOpen) ||
                          (item.title === 'Admin' && adminDropdownOpen)) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-col items-center gap-1 mt-1"
                          >
                            {item.dropdownItems.map((sub) => {
                              const SubIcon = sub.icon
                              const subActive = isActive(sub.path)
                              return (
                                <Link
                                  key={sub.path}
                                  to={sub.path}
                                  className={`flex relative items-center justify-start px-4 gap-4 cursor-pointer w-[200px] ml-[20px] h-[45px] rounded-[20px] transition-all
                                    ${subActive
                                      ? 'bg-white text-black border dark:bg-white dark:text-black'
                                      : 'hover:bg-white dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300'}
                                  `}
                                  title={sub.title}
                                >
                                  <SubIcon className="w-4 h-4 icon icon" />
                                  <label className='font-semibold cursor-pointer' htmlFor={sub.title}>{sub.title}</label>
                                  {/* <div className="absolute w-[12px] h-full -left-[11px] -top-[22px] border-l border-b border-gray-300 rounded-bl-lg"></div> */}
                                </Link>
                              )
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      title={item.title}
                      className={`relative flex items-center justify-start px-4 gap-4 cursor-pointer w-[220px] h-[50px] rounded-[20px] transition-all duration-200
                        ${active
                          ? 'bg-white text-black border dark:bg-white dark:text-black'
                          : 'hover:bg-white dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300'}
                      `}
                    >
                      <Icon className="w-5 h-5 icon icon" />
                      <label className='font-semibold cursor-pointer' htmlFor={item.title}>{item.title}</label>
                      
                      {item.badgeCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                          {item.badgeCount > 99 ? '99+' : item.badgeCount}
                        </span>
                      )}
                    </Link>
                  )}
                </div>
              )
            })}
          </nav>

          <div
            onClick={logout}
            className="flex items-center justify-center w-[220px] gap-4 h-[50px] m-auto mb-5 rounded-xl bg-red-500 text-white 
                       hover:bg-red-600 transition-all cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-5 h-5 icon" />
            Logout
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

export default Sidebar
