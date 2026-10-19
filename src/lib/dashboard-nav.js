import {
  LayoutDashboard,
  Compass,
  Package,
  CheckCircle,
  Zap,
} from "lucide-react";
import { GoCalendar } from "react-icons/go";
import { IoFolderOpenOutline } from "react-icons/io5";
import { PiUsersDuotone, PiUserCheck, PiKeyDuotone } from "react-icons/pi";
import { BiMessageSquareDetail } from "react-icons/bi";

export const RAIL_WIDTH = 76;

export function pathIsActive(pathname, path) {
  return (
    pathname === path ||
    (path !== "/dashboard" && pathname.startsWith(path))
  );
}

export function getNavGroups({ unreadCounts = {}, isSuperadmin = false } = {}) {
  return [
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
          title: "Workspace",
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
                title: "User Management",
                icon: PiUsersDuotone,
                path: "/dashboard/admin/users",
              },
              {
                title: "Permission Manage",
                icon: PiKeyDuotone,
                path: "/dashboard/admin/permissions",
              },
            ],
          },
        ]
      : []),
  ];
}
