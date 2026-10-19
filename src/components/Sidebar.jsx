import { useCallback, useRef, useState } from "react";
import { m } from "framer-motion";
import {
  LogOut,
  AudioLines,
  Compass,
  ShoppingBag,
  ListChecks,
  CalendarDays,
  FolderKanban,
  Workflow,
  KeyRound,
  MessageSquareQuote,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../contexts/sidebar-context";
import { useAuth } from "../contexts/auth-context";
import BrandLogo from "./brand-logo";
import { TbSmartHome } from "react-icons/tb";
import { PiUser, PiUserCheck, PiUsers } from "react-icons/pi";


const RAIL_WIDTH = 72;

function pathIsActive(pathname, path) {
  return (
    pathname === path ||
    (path !== "/dashboard" && pathname.startsWith(path))
  );
}

function NavItem({ item, pathname, isMobile, onNavigate }) {
  const Icon = item.icon;
  const active = pathIsActive(pathname, item.path);

  return (
    <Link
      to={item.path}
      aria-label={item.title}
      onClick={() => isMobile && onNavigate()}
      data-nav-item
      data-active={active ? "true" : "false"}
      className={`sidebar-nav-item sidebar-nav-item--collapsed ${
        active ? "sidebar-nav-item--active" : ""
      }`}
    >
      <span
        className={`sidebar-icon-wrap relative ${active ? "sidebar-icon-wrap--active" : ""}`}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
      </span>
      <span className="sidebar-tip">{item.title}</span>
    </Link>
  );
}

function SidebarPanel({
  isMobile,
  isOpen,
  closeSidebar,
  showOnScreen,
  items,
  pathname,
  logout,
}) {
  const navRef = useRef(null);
  const [pill, setPill] = useState({
    top: 0,
    height: 44,
    visible: false,
  });

  const placeOn = useCallback((item) => {
    const nav = navRef.current;
    if (!nav || !item) return;
    const navBox = nav.getBoundingClientRect();
    const box = item.getBoundingClientRect();
    setPill({
      top: box.top - navBox.top + nav.scrollTop,
      height: box.height,
      visible: true,
    });
  }, []);

  const hidePill = useCallback(() => {
    setPill((current) => ({ ...current, visible: false }));
  }, []);

  function onAsideMove(event) {
    const aside = event.currentTarget;
    const box = aside.getBoundingClientRect();
    aside.style.setProperty("--ink-x", `${event.clientX - box.left}px`);
    aside.style.setProperty("--ink-y", `${event.clientY - box.top}px`);
    const item = event.target.closest?.("[data-nav-item]");
    if (!item || !navRef.current?.contains(item) || item.dataset.active === "true") {
      hidePill();
      return;
    }
    placeOn(item);
  }

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

      <m.aside
        initial={false}
        animate={{
          width: RAIL_WIDTH,
          x: showOnScreen ? 0 : -RAIL_WIDTH,
        }}
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
        onMouseMove={onAsideMove}
        onMouseLeave={hidePill}
        className="ink-aside app-sidebar app-sidebar--icons app-sidebar--collapsed fixed left-0 top-0 h-screen z-50 flex flex-col"
      >
        <div className="sidebar-cluster sidebar-cluster--logo">
          <BrandLogo size={32} />
        </div>

        <nav
          ref={navRef}
          className="ink-nav sidebar-cluster sidebar-cluster--nav sidebar-icon-list"
        >
          <span
            aria-hidden
            className={`ink-nav-pill ${pill.visible ? "is-on" : ""}`}
            style={{
              transform: `translateY(${pill.top}px)`,
              height: pill.height,
            }}
          />
          {items.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              pathname={pathname}
              isMobile={isMobile}
              onNavigate={closeSidebar}
            />
          ))}
        </nav>

        <div className="sidebar-cluster sidebar-cluster--foot">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("voice-assistant:open"))}
            aria-label="Voice assistant"
            className="sidebar-nav-item sidebar-nav-item--collapsed"
          >
            <span className="sidebar-icon-wrap">
              <AudioLines className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
            </span>
            <span className="sidebar-tip">Voice assistant</span>
          </button>
          <button
            type="button"
            onClick={logout}
            aria-label="Logout"
            className="sidebar-nav-item sidebar-nav-item--collapsed"
          >
            <span className="sidebar-icon-wrap">
              <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
            </span>
            <span className="sidebar-tip">Logout</span>
          </button>
        </div>
      </m.aside>
    </>
  );
}

const Sidebar = () => {
  const { isOpen, isMobile, closeSidebar } = useSidebar();
  const { isAuthenticated, logout, isSuperadmin } = useAuth();
  const location = useLocation();

  const items = [
    { title: "Dashboard", icon: TbSmartHome , path: "/dashboard" },
    { title: "Explore", icon: Compass, path: "/dashboard/explore" },
    { title: "Purchased", icon: ShoppingBag, path: "/dashboard/my-bought-projects" },
    { title: "Tasks", icon: ListChecks, path: "/dashboard/tasks" },
    { title: "Meetings", icon: CalendarDays, path: "/dashboard/meetings" },
    { title: "Projects", icon: FolderKanban, path: "/dashboard/projects" },
    { title: "Workspace", icon: PiUsers, path: "/dashboard/teams" },
    { title: "Automation", icon: Workflow, path: "/dashboard/automation" },
    { title: "Friends", icon: PiUser, path: "/dashboard/friends" },
    { title: "Messages", icon: MessageSquareQuote, path: "/dashboard/chat" },
    ...(isSuperadmin
      ? [
          {
            title: "User Management",
            icon: PiUserCheck,
            path: "/dashboard/admin/users",
          },
          {
            title: "Permission Manage",
            icon: KeyRound,
            path: "/dashboard/admin/permissions",
          },
        ]
      : []),
  ];

  if (!isAuthenticated) return null;

  return (
    <SidebarPanel
      isMobile={isMobile}
      isOpen={isOpen}
      closeSidebar={closeSidebar}
      showOnScreen={isMobile ? isOpen : true}
      items={items}
      pathname={location.pathname}
      logout={logout}
    />
  );
};

export default Sidebar;
