"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var react_router_dom_1 = require("react-router-dom");
require("./App.css");
var ThemeToggle_1 = require("./components/ThemeToggle");
var AuthContext_1 = require("./contexts/AuthContext");
var SidebarContext_1 = require("./contexts/SidebarContext");
var NotificationContext_1 = require("./contexts/NotificationContext");
var ChatContext_1 = require("./contexts/ChatContext");
var SearchContext_1 = require("./contexts/SearchContext");
var ProtectedRoute_1 = require("./components/ProtectedRoute");
var Indexing_1 = require("./pages/Indexing");
var About_1 = require("./pages/About");
var Contact_1 = require("./pages/Contact");
var TeamsManage_1 = require("./components/TeamsManage");
var Friends_1 = require("./pages/Friends");
var Login_1 = require("./pages/Login");
var Signup_1 = require("./pages/Signup");
var ForgotPassword_1 = require("./pages/ForgotPassword");
var VerifyEmail_1 = require("./pages/VerifyEmail");
var Dashboard_1 = require("./pages/Dashboard");
var Tasks_1 = require("./pages/Tasks");
var Meetings_1 = require("./pages/Meetings");
var Projects_1 = require("./pages/Projects");
var Chat_1 = require("./pages/Chat");
// import GitHubDashboard from './pages/GitHubDashboard'
var GitHubRepositories_1 = require("./pages/GitHubRepositories");
var GitHubPullRequests_1 = require("./pages/GitHubPullRequests");
var GitHubIssues_1 = require("./pages/GitHubIssues");
var NotFound_1 = require("./pages/NotFound");
var sonner_1 = require("sonner");
var GitHubDashboard_1 = require("./pages/GitHubDashboard");
var UserManagement_1 = require("./pages/admin/UserManagement");
var PermissionsManagement_1 = require("./pages/admin/PermissionsManagement");
function App() {
    return ((0, jsx_runtime_1.jsx)("div", { className: 'bg-white dark:bg-[#14120b]', children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.BrowserRouter, { children: [(0, jsx_runtime_1.jsx)(sonner_1.Toaster, { position: "top-right", richColors: true, closeButton: true, toastOptions: {
                        style: {
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '500',
                            margin: '4px 0',
                            padding: '12px 16px'
                        },
                        className: 'toast-custom'
                    } }), (0, jsx_runtime_1.jsx)(AuthContext_1.AuthProvider, { children: (0, jsx_runtime_1.jsx)(NotificationContext_1.NotificationProvider, { children: (0, jsx_runtime_1.jsx)(ChatContext_1.ChatProvider, { children: (0, jsx_runtime_1.jsx)(SearchContext_1.SearchProvider, { children: (0, jsx_runtime_1.jsx)(SidebarContext_1.SidebarProvider, { children: (0, jsx_runtime_1.jsx)("div", { className: "relative", children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.Routes, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(Indexing_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/about", element: (0, jsx_runtime_1.jsx)(About_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/contact", element: (0, jsx_runtime_1.jsx)(Contact_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/login", element: (0, jsx_runtime_1.jsx)(Login_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/signup", element: (0, jsx_runtime_1.jsx)(Signup_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/forgot-password", element: (0, jsx_runtime_1.jsx)(ForgotPassword_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/verify-email", element: (0, jsx_runtime_1.jsx)(VerifyEmail_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/dashboard", element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { requireAuth: true, children: (0, jsx_runtime_1.jsx)(Dashboard_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/dashboard/tasks", element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { requireAuth: true, children: (0, jsx_runtime_1.jsx)(Tasks_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/dashboard/meetings", element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { requireAuth: true, children: (0, jsx_runtime_1.jsx)(Meetings_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/dashboard/projects", element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { requireAuth: true, children: (0, jsx_runtime_1.jsx)(Projects_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/dashboard/teams", element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { requireAuth: true, children: (0, jsx_runtime_1.jsx)(TeamsManage_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/dashboard/friends", element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { requireAuth: true, children: (0, jsx_runtime_1.jsx)(Friends_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/dashboard/chat", element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { requireAuth: true, children: (0, jsx_runtime_1.jsx)(Chat_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/dashboard/github", element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { requireAuth: true, children: (0, jsx_runtime_1.jsx)(GitHubDashboard_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/dashboard/github/repositories", element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { requireAuth: true, children: (0, jsx_runtime_1.jsx)(GitHubRepositories_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/dashboard/github/pull-requests", element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { requireAuth: true, children: (0, jsx_runtime_1.jsx)(GitHubPullRequests_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/dashboard/github/issues", element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { requireAuth: true, children: (0, jsx_runtime_1.jsx)(GitHubIssues_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/dashboard/admin/users", element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { requireAuth: true, children: (0, jsx_runtime_1.jsx)(UserManagement_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/dashboard/admin/permissions", element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { requireAuth: true, children: (0, jsx_runtime_1.jsx)(PermissionsManagement_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "*", element: (0, jsx_runtime_1.jsx)(NotFound_1.default, {}) })] }) }) }) }) }) }) })] }) }));
}
exports.default = App;
