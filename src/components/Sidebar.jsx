import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Compass,
  Package,
  CheckCircle,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../contexts/SidebarContext";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { GoCalendar } from "react-icons/go";
import { IoFolderOpenOutline } from "react-icons/io5";
import { PiUsersDuotone, PiUserCheck } from "react-icons/pi";
import { BiMessageSquareDetail } from "react-icons/bi";

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

const Sidebar = () => {
  const { isOpen, isMobile, closeSidebar } = useSidebar();
  const { isAuthenticated, logout } = useAuth();
  const { unreadCounts } = useNotifications();
  const location = useLocation();
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const collapsed = !isOpen && !isMobile;

  const sidebarItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { title: "Explore", icon: Compass, path: "/dashboard/explore" },
    { title: "Purchased", icon: Package, path: "/dashboard/my-bought-projects" },
    { title: "Tasks", icon: CheckCircle, path: "/dashboard/tasks", badgeCount: unreadCounts.tasks },
    { title: "Meetings", icon: GoCalendar, path: "/dashboard/meetings", badgeCount: unreadCounts.meetings },
    { title: "Projects", icon: IoFolderOpenOutline, path: "/dashboard/projects", badgeCount: unreadCounts.projects },
    { title: "Teams", icon: PiUsersDuotone, path: "/dashboard/teams", badgeCount: unreadCounts.teams },
    { title: "Friends", icon: PiUserCheck, path: "/dashboard/friends" },
    { title: "Messages", icon: BiMessageSquareDetail, path: "/dashboard/chat", badgeCount: unreadCounts.messages },
  ];

  if (!isAuthenticated) return null;

  const sidebarWidth = isMobile ? EXPANDED_WIDTH : isOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
  const showOnScreen = isMobile ? isOpen : true;

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active =
      isActive(item.path) ||
      (item.hasDropdown && item.dropdownItems?.some((sub) => isActive(sub.path)));
    const badge = item.badgeCount > 0 ? item.badgeCount : null;

    if (item.hasDropdown) {
      return (
        <div className="w-full">
          <button
            type="button"
            onClick={() => item.title === "Admin" && setAdminDropdownOpen((p) => !p)}
            title={item.title}
            className={`sidebar-nav-item w-full ${collapsed ? "sidebar-nav-item--collapsed" : ""} ${
              active ? "sidebar-nav-item--active" : ""
            }`}
          >
            <span className={`sidebar-icon-wrap ${active ? "sidebar-icon-wrap--active" : ""}`}>
              <Icon className="w-5 h-5 shrink-0" />
            </span>
            {!collapsed && (
              <>
                <span className="sidebar-label">{item.title}</span>
                <ChevronDown className="w-4 h-4 ml-auto shrink-0 opacity-60" />
              </>
            )}
          </button>
          <AnimatePresence>
            {!collapsed && item.title === "Admin" && adminDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pl-3 mt-1 space-y-1"
              >
                {item.dropdownItems?.map((sub) => {
                  const SubIcon = sub.icon;
                  const subActive = isActive(sub.path);
                  return (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      title={sub.title}
                      className={`sidebar-nav-item sidebar-nav-item--sub ${subActive ? "sidebar-nav-item--active" : ""}`}
                    >
                      <span className={`sidebar-icon-wrap sidebar-icon-wrap--sm ${subActive ? "sidebar-icon-wrap--active" : ""}`}>
                        <SubIcon className="w-4 h-4 shrink-0" />
                      </span>
                      <span className="sidebar-label text-sm">{sub.title}</span>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        to={item.path}
        title={item.title}
        onClick={() => isMobile && closeSidebar()}
        className={`sidebar-nav-item ${collapsed ? "sidebar-nav-item--collapsed" : ""} ${
          active ? "sidebar-nav-item--active" : ""
        }`}
      >
        <span className={`sidebar-icon-wrap relative ${active ? "sidebar-icon-wrap--active" : ""}`}>
          <Icon className="w-5 h-5 shrink-0" />
          {badge && collapsed && (
            <span className="sidebar-badge sidebar-badge--dot" aria-label={`${badge} unread`} />
          )}
        </span>
        {!collapsed && (
          <span className="sidebar-label flex-1 truncate">{item.title}</span>
        )}
        {!collapsed && badge && (
          <span className="sidebar-badge sidebar-badge--inline">{badge > 99 ? "99+" : badge}</span>
        )}
      </Link>
    );
  };

  return (
    <>
      {isMobile && isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <motion.aside
        initial={false}
        animate={{
          width: sidebarWidth,
          x: showOnScreen ? 0 : -EXPANDED_WIDTH,
        }}
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
        className={`app-sidebar fixed left-0 top-0 h-[91.5vh] mt-[8.5vh] z-50 flex flex-col border-r border-gray-200 dark:border-white/10 bg-[#eee] dark:bg-black ${
          collapsed ? "app-sidebar--collapsed" : ""
        }`}
      >
        {/* Logo strip */}
        <div className={`sidebar-brand ${collapsed ? "sidebar-brand--collapsed" : ""}`}>
          <img src="/logo.png" alt="logo" className="w-8 h-8 shrink-0" />
          {!collapsed && (
            <span className="text-[10px] font-black uppercase tracking-widest truncate">
              Slack Dev
            </span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-1">
          {sidebarItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        <div className="p-2 border-t border-gray-200 dark:border-white/10">
          <button
            type="button"
            onClick={logout}
            title="Logout"
            className={`sidebar-logout ${collapsed ? "sidebar-logout--collapsed" : ""}`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;