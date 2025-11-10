"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var react_router_dom_1 = require("react-router-dom");
var SidebarContext_1 = require("../contexts/SidebarContext");
var AuthContext_1 = require("../contexts/AuthContext");
var NotificationContext_1 = require("../contexts/NotificationContext");
var go_1 = require("react-icons/go");
var io5_1 = require("react-icons/io5");
var pi_1 = require("react-icons/pi");
var bi_1 = require("react-icons/bi");
var lucide_react_2 = require("lucide-react");
var Sidebar = function () {
    var _a = (0, SidebarContext_1.useSidebar)(), isOpen = _a.isOpen, closeSidebar = _a.closeSidebar;
    var _b = (0, AuthContext_1.useAuth)(), isAuthenticated = _b.isAuthenticated, logout = _b.logout, user = _b.user;
    var unreadCounts = (0, NotificationContext_1.useNotifications)().unreadCounts;
    var location = (0, react_router_dom_1.useLocation)();
    var _c = (0, react_1.useState)(false), githubDropdownOpen = _c[0], setGithubDropdownOpen = _c[1];
    var _d = (0, react_1.useState)(false), adminDropdownOpen = _d[0], setAdminDropdownOpen = _d[1];
    var isActive = function (path) { return location.pathname === path; };
    var sidebarItems = __spreadArray(__spreadArray([
        {
            title: 'Dashboard',
            icon: lucide_react_1.LayoutDashboard,
            path: '/dashboard',
            badgeCount: 0
        },
        {
            title: 'Tasks',
            icon: lucide_react_1.CheckSquare,
            path: '/dashboard/tasks',
            badgeCount: unreadCounts.tasks
        },
        {
            title: 'Meetings',
            icon: go_1.GoCalendar,
            path: '/dashboard/meetings',
            badgeCount: unreadCounts.meetings
        },
        {
            title: 'Project Flow',
            icon: go_1.GoWorkflow,
            path: '/dashboard/github',
            hasDropdown: true,
            dropdownItems: [
                { title: 'Dashboard', icon: lucide_react_1.LayoutDashboard, path: '/dashboard/github' },
                { title: 'Repositories', icon: lucide_react_2.FolderOpen, path: '/dashboard/github/repositories' },
                { title: 'Pull Requests', icon: lucide_react_1.GitPullRequest, path: '/dashboard/github/pull-requests' },
                { title: 'Issues', icon: lucide_react_1.AlertCircle, path: '/dashboard/github/issues' }
            ]
        },
        {
            title: 'Projects',
            icon: io5_1.IoFolderOpenOutline,
            path: '/dashboard/projects',
            badgeCount: unreadCounts.projects
        },
        {
            title: 'Teams',
            icon: pi_1.PiUsersDuotone,
            path: '/dashboard/teams',
            badgeCount: unreadCounts.teams
        },
        {
            title: 'Friends',
            icon: pi_1.PiUserCheck,
            path: '/dashboard/friends',
            badgeCount: 0
        }
    ], ((user === null || user === void 0 ? void 0 : user.role) === 'admin'
        ? [
            {
                title: 'Control',
                icon: lucide_react_1.KeyIcon,
                path: '/dashboard/admin',
                hasDropdown: true,
                dropdownItems: [
                    { title: 'Manage Team', icon: pi_1.PiUsersDuotone, path: '/dashboard/admin/users' },
                    { title: 'Permissions', icon: lucide_react_1.KeyIcon, path: '/dashboard/admin/permissions' }
                ]
            }
        ]
        : []), true), [
        {
            title: 'Messages',
            icon: bi_1.BiMessageSquareDetail,
            path: '/dashboard/chat',
            badgeCount: unreadCounts.messages
        }
    ], false);
    var sidebarVariants = {
        open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 40 } },
        closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 40 } }
    };
    if (!isAuthenticated)
        return null;
    return ((0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { children: isOpen && ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.aside, { variants: sidebarVariants, initial: "closed", animate: "open", exit: "closed", className: "fixed left-0 top-0 h-[91.5vh] mt-[8.5vh] w-[90px] \n                     bg-white text-black dark:bg-black dark:text-white \n                     border-r border-gray-200 dark:border-gray-800 \n                     z-50 flex flex-col justify-between icon", children: [(0, jsx_runtime_1.jsx)("nav", { className: "flex flex-col items-center justify-start p-3 gap-2 icon", children: sidebarItems.map(function (item) {
                        var _a;
                        var Icon = item.icon;
                        var active = isActive(item.path) ||
                            (item.hasDropdown && ((_a = item.dropdownItems) === null || _a === void 0 ? void 0 : _a.some(function (sub) { return isActive(sub.path); })));
                        return ((0, jsx_runtime_1.jsx)("div", { className: "w-full flex flex-col items-center", children: item.hasDropdown ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { onClick: function () {
                                            if (item.title === 'Project Flow')
                                                setGithubDropdownOpen(!githubDropdownOpen);
                                            if (item.title === 'Control')
                                                setAdminDropdownOpen(!adminDropdownOpen);
                                        }, className: "flex items-center px-4 gap-4 cursor-pointer justify-start relative w-[50px] h-[50px] rounded-xl transition-colors duration-200\n                          ".concat(active
                                            ? 'bg-black text-white dark:bg-white dark:text-black'
                                            : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300', "\n                        "), title: item.title, children: (0, jsx_runtime_1.jsx)(Icon, { className: "w-5 h-5 icon icon" }) }), (0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { children: ((item.title === 'Project Flow' && githubDropdownOpen) ||
                                            (item.title === 'Control' && adminDropdownOpen)) && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, className: "flex flex-col items-center gap-1 mt-1", children: item.dropdownItems.map(function (sub) {
                                                var SubIcon = sub.icon;
                                                var subActive = isActive(sub.path);
                                                return ((0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: sub.path, className: "flex relative items-center justify-start px-4 gap-4 cursor-pointer w-[50px] h-[45px] rounded-lg transition-all\n                                    ".concat(subActive
                                                        ? 'bg-black text-white dark:bg-white dark:text-black'
                                                        : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300', "\n                                  "), title: sub.title, children: (0, jsx_runtime_1.jsx)(SubIcon, { className: "w-4 h-4 icon icon" }) }, sub.path));
                                            }) })) })] })) : ((0, jsx_runtime_1.jsxs)(react_router_dom_1.Link, { to: item.path, title: item.title, className: "relative flex items-center justify-start px-4 gap-4 cursor-pointer w-[50px] h-[50px] rounded-xl transition-all duration-200\n                        ".concat(active
                                    ? 'bg-black text-white dark:bg-white dark:text-black'
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300', "\n                      "), children: [(0, jsx_runtime_1.jsx)(Icon, { className: "w-5 h-5 icon icon" }), item.badgeCount > 0 && ((0, jsx_runtime_1.jsx)("span", { className: "absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center", children: item.badgeCount > 99 ? '99+' : item.badgeCount }))] })) }, item.path));
                    }) }), (0, jsx_runtime_1.jsx)("div", { onClick: logout, className: "flex items-center justify-center w-[50px] gap-4 h-[50px] m-auto mb-5 rounded-xl bg-red-500 text-white \n                       hover:bg-red-600 transition-all cursor-pointer", title: "Logout", children: (0, jsx_runtime_1.jsx)(lucide_react_1.LogOut, { className: "w-5 h-5 icon" }) })] })) }));
};
exports.default = Sidebar;
