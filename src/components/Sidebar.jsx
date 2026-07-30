import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Compass,
  Package,
  CheckCircle,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../contexts/SidebarContext";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { GoCalendar } from "react-icons/go";
import { IoFolderOpenOutline } from "react-icons/io5";
import { PiUsersDuotone, PiUserCheck, PiKeyDuotone } from "react-icons/pi";
import { BiMessageSquareDetail } from "react-icons/bi";

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

const Sidebar = () => {
  const { isOpen, isMobile, closeSidebar, openSidebar } = useSidebar();
  const { isAuthenticated, logout, isSuperadmin } = useAuth();
  const { unreadCounts } = useNotifications();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const collapsed = !isOpen && !isMobile;

  const navGroups = [
    {
      id: "main",
      label: "Main",
      items: [
        { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        { title: "Explore", icon: Compass, path: "/dashboard/explore" },
        {
          title: "Purchased",
          icon: Package,
          path: "/dashboard/my-bought-projects",
        },
      ],
    },
    {
      id: "workspace",
      label: "Workspace",
      items: [
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
        { title: "Automation", icon: Zap, path: "/dashboard/automation" },
      ],
    },
    {
      id: "connect",
      label: "Connect",
      items: [
        { title: "Friends", icon: PiUserCheck, path: "/dashboard/friends" },
        {
          title: "Messages",
          icon: BiMessageSquareDetail,
          path: "/dashboard/chat",
          badgeCount: unreadCounts.messages,
        },
      ],
    },
    ...(isSuperadmin
      ? [
          {
            id: "admin",
            label: "Admin",
            items: [
              {
                title: "Members",
                icon: PiUsersDuotone,
                path: "/dashboard/admin/users",
              },
              {
                title: "Permissions",
                icon: PiKeyDuotone,
                path: "/dashboard/admin/permissions",
              },
            ],
          },
        ]
      : []),
  ];

  const groupContainsActive = (group) =>
    group.items.some(
      (item) =>
        isActive(item.path) ||
        (item.path !== "/dashboard" &&
          location.pathname.startsWith(item.path)),
    );

  const activeGroupId =
    navGroups.find((g) => groupContainsActive(g))?.id ?? navGroups[0]?.id ?? null;

  const [openGroupId, setOpenGroupId] = useState(activeGroupId);

  useEffect(() => {
    if (activeGroupId) setOpenGroupId(activeGroupId);
  }, [location.pathname, activeGroupId]);

  const toggleGroup = (id) => {
    if (collapsed) {
      openSidebar();
      setOpenGroupId(id);
      return;
    }
    setOpenGroupId((prev) => (prev === id ? null : id));
  };

  if (!isAuthenticated) return null;

  const sidebarWidth = isMobile
    ? EXPANDED_WIDTH
    : isOpen
      ? EXPANDED_WIDTH
      : COLLAPSED_WIDTH;
  const showOnScreen = isMobile ? isOpen : true;

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active =
      isActive(item.path) ||
      (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
    const badge = item.badgeCount > 0 ? item.badgeCount : null;

    return (
      <Link
        to={item.path}
        title={item.title}
        onClick={() => isMobile && closeSidebar()}
        className={`sidebar-nav-item ${collapsed ? "sidebar-nav-item--collapsed" : ""} ${
          active ? "sidebar-nav-item--active" : ""
        }`}
      >
        <span
          className={`sidebar-icon-wrap relative ${active ? "sidebar-icon-wrap--active" : ""}`}
        >
          <Icon className="w-5 h-5 shrink-0" />
          {badge && collapsed && (
            <span
              className="sidebar-badge sidebar-badge--dot"
              aria-label={`${badge} unread`}
            />
          )}
        </span>
        {!collapsed && (
          <span className="sidebar-label flex-1 truncate">{item.title}</span>
        )}
        {!collapsed && badge && (
          <span className="sidebar-badge sidebar-badge--inline">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </Link>
    );
  };

  const NavGroup = ({ group }) => {
    const isGroupOpen = openGroupId === group.id;
    const hasActive = groupContainsActive(group);
    const groupBadge = group.items.reduce(
      (sum, item) => sum + (item.badgeCount > 0 ? item.badgeCount : 0),
      0,
    );

    return (
      <div className="sidebar-nav-group">
        <button
          type="button"
          onClick={() => toggleGroup(group.id)}
          title={group.label}
          aria-expanded={isGroupOpen}
          className={`sidebar-group-header ${collapsed ? "sidebar-group-header--collapsed" : ""} ${
            hasActive ? "sidebar-group-header--active" : ""
          }`}
        >
          {!collapsed && (
            <>
              <span className="sidebar-group-label h-7 flex items-center">{group.label}</span>
              {groupBadge > 0 && !isGroupOpen && (
                <span className="sidebar-badge sidebar-badge--inline">
                  {groupBadge > 99 ? "99+" : groupBadge}
                </span>
              )}
              <ChevronDown
                className={`sidebar-group-chevron ${isGroupOpen ? "sidebar-group-chevron--open" : ""}`}
              />
            </>
          )}
          {collapsed && (
            <span className="sidebar-group-collapsed-dot" aria-hidden />
          )}
        </button>

        <AnimatePresence initial={false}>
          {(collapsed || isGroupOpen) && (
            <motion.div
              key={`${group.id}-items`}
              initial={collapsed ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden space-y-0.5"
            >
              {group.items.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
        <div
          className={`sidebar-brand ${collapsed ? "sidebar-brand--collapsed" : ""}`}
        >
          <img src="/logo.png" alt="logo" className="w-8 h-8 shrink-0" />
          {!collapsed && (
            <span className="text-[10px] font-black uppercase tracking-widest truncate">
              Slack Dev
            </span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 space-y-1 mt-1">
          {collapsed
            ? navGroups.flatMap((group) => group.items).map((item) => (
                <NavItem key={item.path} item={item} />
              ))
            : navGroups.map((group) => (
                <NavGroup key={group.id} group={group} />
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
