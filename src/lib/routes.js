import TeamsManage from "@/components/teams-manage";
import About from "@/pages/about";
import PermissionsManagement from "@/pages/admin/permissions-management";
import UserManagement from "@/pages/admin/user-management";
import Automation from "@/pages/automation";
import Chat from "@/pages/chat";
import Dashboard from "@/pages/dashboard";
import Explore from "@/pages/explore";
import ForgotPassword from "@/pages/forgot-password";
import Friends from "@/pages/friends";
import Indexing from "@/pages/indexing";
import LearnPoint from "@/pages/learn-point";
import Login from "@/pages/login";
import Meetings from "@/pages/meetings";
import MyBoughtProjects from "@/pages/my-bought-projects";
import NotFound from "@/pages/not-found";
import Projects from "@/pages/projects";
import RepoDetail from "@/pages/repo-detail";
import Repos from "@/pages/repos";
import Signup from "@/pages/signup";
import Tasks from "@/pages/tasks";
import VerifyEmail from "@/pages/verify-email";
import { Contact } from "lucide-react";

export const routes = [
    {
      path: "/",
      element: Indexing,
      isProtected: false,
    },
    {
      path: "/about",
      element: About,
      isProtected: false,
    },
    {
      path: "/contact",
      element: Contact,
      isProtected: false,
    },
    {
      path: "/login",
      element: Login,
      isProtected: false,
    },
    {
      path: "/signup",
      element: Signup,
      isProtected: false,
    },
    {
      path: "/forgot-password",
      element: ForgotPassword,
      isProtected: false,
    },
    {
      path: "/verify-email",
      element: VerifyEmail,
      isProtected: false,
    },
    {
      path: "/dashboard",
      element: Dashboard,
      isProtected: true,
    },
    {
      path: "/dashboard/tasks",
      element: Tasks,
      isProtected: true,
    },
    {
      path: "/dashboard/meetings",
      element: Meetings,
      isProtected: true,
    },
    {
      path: "/dashboard/projects",
      element: Projects,
      isProtected: true,
    },
    {
      path: "/dashboard/my-bought-projects",
      element: MyBoughtProjects,
      isProtected: true,
    },
    {
      path: "/dashboard/explore",
      element: Explore,
      isProtected: true,
    },
    {
      path: "/dashboard/teams",
      element: TeamsManage,
      isProtected: true,
    },
    {
      path: "/dashboard/automation",
      element: Automation,
      isProtected: true,
    },
    {
      path: "/dashboard/friends",
      element: Friends,
      isProtected: true,
    },
    {
      path: "/dashboard/chat",
      element: Chat,
      isProtected: true,
    },
    {
      path: "/learn-point",
      element: LearnPoint,
      isProtected: true,
    },
    {
      path: "/dashboard/repos",
      element: Repos,
      isProtected: true,
    },
    {
      path: "/dashboard/repos/:id",
      element: RepoDetail,
      isProtected: true,
    },
    {
      path: "/dashboard/admin/users",
      element: UserManagement,
      isProtected: true,
    },
    {
      path: "/dashboard/admin/permissions",
      element: PermissionsManagement,
      isProtected: true,
    },
    {
      path: "*",
      element: NotFound,
      isProtected: false,
    },
  ];