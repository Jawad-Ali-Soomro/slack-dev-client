import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  GitPullRequest,
  AlertCircle,
  LogOut,
  KeyIcon,
  ChevronDown,
  Dock,
  Compass,
  Package,
  CheckCircle,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../contexts/SidebarContext";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { GoCalendar, GoWorkflow } from "react-icons/go";
import { IoFolderOpenOutline } from "react-icons/io5";
import { PiUsersDuotone, PiUserCheck } from "react-icons/pi";
import { BiMessageSquareDetail } from "react-icons/bi";
import { FolderOpen as RepoIcon, FileText } from "lucide-react";

const Sidebar = () => {
  const { isOpen, closeSidebar } = useSidebar();
  const { isAuthenticated, logout, user } = useAuth();
  const { unreadCounts } = useNotifications();
  const location = useLocation();
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const sidebarItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      badgeCount: 0,
    },
    {
      title: "Explore",
      icon: Compass,
      path: "/dashboard/explore",
    },
    {
      title: "Purchased",
      icon: Package,
      path: "/dashboard/my-bought-projects",
    },
    {
      title: "Tasks",
      icon: CheckCircle,
      path: "/dashboard/tasks",
      badgeCount: unreadCounts.tasks,
    },
    {
      title: "Meetings",
      icon: GoCalendar,
      path: "/dashboard/meetings",
      badgeCount: unreadCounts.meetings,
    },

    {
      title: "Projects",
      icon: IoFolderOpenOutline,
      path: "/dashboard/projects",
      badgeCount: unreadCounts.projects,
    },
    {
      title: "Teams",
      icon: PiUsersDuotone,
      path: "/dashboard/teams",
      badgeCount: unreadCounts.teams,
    },
    {
      title: "Friends",
      icon: PiUserCheck,
      path: "/dashboard/friends",
      badgeCount: 0,
    },
    {
      title: "Messages",
      icon: BiMessageSquareDetail,
      path: "/dashboard/chat",
      badgeCount: unreadCounts.messages,
    },
  ];

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 40 } },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 40 },
    },
  };

  if (!isAuthenticated) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          variants={sidebarVariants}
          initial="closed"
          animate="open"
          exit="closed"
          className="fixed left-0 top-0 h-[91.5vh] mt-[8.5vh] w-[240px] 
                     bg-[#eee] text-black dark:bg-[black] dark:text-white 
                     border-r border-gray-300 dark:border-gray-800 
                     z-50 flex flex-col justify-between icon"
        >
          <nav className="flex flex-col items-center justify-start px-5 p-3 gap-2 icon">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active =
                isActive(item.path) ||
                (item.hasDropdown &&
                  item.dropdownItems?.some((sub) => isActive(sub.path)));

              return (
                <div
                  key={item.path}
                  className="w-full flex flex-col items-center"
                >
                  {item.hasDropdown ? (
                    <>
                      <button
                        onClick={() => {
                          if (item.title === "Admin") {
                            setAdminDropdownOpen((prev) => !prev);
                          }
                        }}
                        className={`flex items-center  gap-4 cursor-pointer justify-start px-5 relative w-[220px] h-[50px] rounded-[15px] transition-colors duration-200
                          ${
                            active
                              ? "border-l-5 border bg-white text-black border dark:bg-white dark:text-black border-l-4 border"
                              : "hover:bg-white dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300"
                          }
                        `}
                        title={item.title}
                      >
                        <Icon className="w-5 h-5" />
                        <label
                          className="font-bold cursor-pointer"
                          htmlFor={item.title}
                        >
                          {item.title}
                        </label>
                        <ChevronDown className="w-5 h-5 icon icon icon absolute right-4" />
                      </button>

                      <AnimatePresence>
                        {item.title === "Admin" && adminDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-col items-center gap-1 mt-1"
                          >
                            {item.dropdownItems.map((sub) => {
                              const SubIcon = sub.icon;
                              const subActive = isActive(sub.path);
                              return (
                                <Link
                                  key={sub.path}
                                  to={sub.path}
                                  className={`flex relative items-center justify-start px-5  gap-4 cursor-pointer w-[200px] ml-[20px] h-[45px] rounded-[15px] transition-all
                                    ${
                                      subActive
                                        ? "bg-white text-black border dark:bg-white dark:text-black"
                                        : "hover:bg-white dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300"
                                    }
                                  `}
                                  title={sub.title}
                                >
                                  <SubIcon className="w-5 h-5 icon icon icon" />
                                  <label
                                    className="font-bold cursor-pointer"
                                    htmlFor={sub.title}
                                  >
                                    {sub.title}
                                  </label>
                                  {/* <div className="absolute w-[12px] h-full -left-[11px] -top-[22px] border-l border-b border-gray-300 rounded-bl-lg"></div> */}
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      title={item.title}
                      className="relative flex items-center justify-start p-2 gap-4 cursor-pointer w-[220px] rounded-[10px]"
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute inset-0 bg-white dark:bg-[rgba(255,255,255,.1)] border border-gray-300 dark:border-gray-600 rounded-[10px]"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}

                      <motion.div
                       transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        className={`relative flex p-3 rounded-[10px] ${
                          active
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : ""
                        }`}
                      >
                        <Icon className="w-5 h-5 icon" />
                      </motion.div>

                      <label
                        className={`relative font-bold cursor-pointer ${
                          active
                            ? "text-black dark:text-white"
                            : "text-gray-500 dark:text-gray-300"
                        }`}
                      >
                        {item.title}
                      </label>
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          <div
            onClick={logout}
            className="flex items-center justify-center px-5 w-[220px] gap-4 h-[50px] m-auto mb-5 rounded-[15px] bg-red-500 text-white 
                       hover:bg-red-600 transition-all cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-5 h-5 icon icon" />
            Logout
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
