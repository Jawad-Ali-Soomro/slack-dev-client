"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var framer_motion_1 = require("framer-motion");
var HorizontalLoader_1 = require("../components/HorizontalLoader");
var usePermissions_1 = require("../hooks/usePermissions");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var AuthContext_1 = require("../contexts/AuthContext");
var UserDetailsModal_1 = require("../components/UserDetailsModal");
var taskService_1 = require("../services/taskService");
var meetingService_1 = require("../services/meetingService");
var projectService_1 = require("../services/projectService");
var sonner_1 = require("sonner");
var StatsCard_1 = require("../components/StatsCard");
var pi_1 = require("react-icons/pi");
var Dashboard = function () {
    document.title = "Dashboard";
    var user = (0, AuthContext_1.useAuth)().user;
    var _a = (0, usePermissions_1.usePermissions)(), permissions = _a.permissions, permissionsLoading = _a.loading;
    var _b = (0, react_1.useState)({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0,
        tasksThisWeek: 0,
        tasksThisMonth: 0,
        completionRate: 0,
        // Meeting stats
        totalMeetings: 0,
        scheduledMeetings: 0,
        completedMeetings: 0,
        cancelledMeetings: 0,
        pendingMeetings: 0,
        meetingsThisWeek: 0,
        meetingsThisMonth: 0,
        meetingCompletionRate: 0,
        // Project stats
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        averageProgress: 0,
    }), stats = _b[0], setStats = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)([]), tasks = _d[0], setTasks = _d[1];
    var _e = (0, react_1.useState)([]), meetings = _e[0], setMeetings = _e[1];
    var _f = (0, react_1.useState)([]), projects = _f[0], setProjects = _f[1];
    var _g = (0, react_1.useState)(null), selectedUserId = _g[0], setSelectedUserId = _g[1];
    var _h = (0, react_1.useState)(false), showUserDetails = _h[0], setShowUserDetails = _h[1];
    var navigate = (0, react_router_dom_1.useNavigate)();
    var _j = (0, react_1.useState)(new Date()), selectedDate = _j[0], setSelectedDate = _j[1];
    var _k = (0, react_1.useState)(new Date()), calendarMonth = _k[0], setCalendarMonth = _k[1];
    // Calendar helpers
    var startOfMonth = function (date) { return new Date(date.getFullYear(), date.getMonth(), 1); };
    var endOfMonth = function (date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0); };
    var addMonths = function (date, months) { return new Date(date.getFullYear(), date.getMonth() + months, 1); };
    var isSameDay = function (a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); };
    var getMonthDaysGrid = function (monthDate) {
        var start = startOfMonth(monthDate);
        var end = endOfMonth(monthDate);
        var days = [];
        // Leading blanks (Sun=0 ... Sat=6) but we'll render Mon-Sun layout visually with CSS order
        var leading = (start.getDay() + 6) % 7; // convert to Mon=0 ... Sun=6
        for (var i = 0; i < leading; i++) {
            days.push(null);
        }
        for (var d = 1; d <= end.getDate(); d++) {
            days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), d));
        }
        return days;
    };
    // Handle user avatar click
    var handleUserAvatarClick = function (userId) {
        console.log("Dashboard avatar clicked for user ID:", userId);
        setSelectedUserId(userId);
        setShowUserDetails(true);
        console.log("Modal should open now");
    };
    // Load dashboard data
    var loadDashboardData = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var taskResponse, allTasks, userTasks, meetingResponse, allMeetings, userMeetings, projectResponse, allProjects, projectStatsResponse, projectStats, now_1, oneWeekAgo_1, oneMonthAgo_1, totalTasks, completedTasks, pendingTasks, inProgressTasks, overdueTasks, tasksThisWeek, tasksThisMonth, completionRate, totalMeetings, scheduledMeetings, completedMeetings, cancelledMeetings, pendingMeetings, meetingsThisWeek, meetingsThisMonth, meetingCompletionRate, totalProjects, activeProjects, completedProjects, averageProgress, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, 6, 7]);
                    setLoading(true);
                    return [4 /*yield*/, taskService_1.default.getTasks({
                            page: 1,
                            limit: 100,
                        })];
                case 1:
                    taskResponse = _a.sent();
                    allTasks = taskResponse.tasks || [];
                    userTasks = allTasks.filter(function (task) {
                        var _a, _b;
                        if (!user || !user.id)
                            return false;
                        return ((_a = task.assignTo) === null || _a === void 0 ? void 0 : _a.id) === user.id || ((_b = task.assignedBy) === null || _b === void 0 ? void 0 : _b.id) === user.id;
                    });
                    setTasks(userTasks);
                    return [4 /*yield*/, meetingService_1.default.getMeetings({
                            page: 1,
                            limit: 100,
                        })];
                case 2:
                    meetingResponse = _a.sent();
                    allMeetings = meetingResponse.meetings || [];
                    userMeetings = allMeetings.filter(function (meeting) {
                        var _a, _b;
                        if (!user || !user.id)
                            return false;
                        return (((_a = meeting.assignedTo) === null || _a === void 0 ? void 0 : _a.id) === user.id ||
                            ((_b = meeting.assignedBy) === null || _b === void 0 ? void 0 : _b.id) === user.id);
                    });
                    setMeetings(userMeetings);
                    return [4 /*yield*/, projectService_1.default.getProjects({
                            page: 1,
                            limit: 100,
                        })];
                case 3:
                    projectResponse = _a.sent();
                    allProjects = projectResponse.projects || [];
                    setProjects(allProjects);
                    return [4 /*yield*/, projectService_1.default.getProjectStats()];
                case 4:
                    projectStatsResponse = _a.sent();
                    projectStats = projectStatsResponse.stats || {};
                    now_1 = new Date();
                    oneWeekAgo_1 = new Date(now_1.getTime() - 7 * 24 * 60 * 60 * 1000);
                    oneMonthAgo_1 = new Date(now_1.getTime() - 30 * 24 * 60 * 60 * 1000);
                    totalTasks = userTasks.length;
                    completedTasks = userTasks.filter(function (task) { return task.status === "completed"; }).length;
                    pendingTasks = userTasks.filter(function (task) { return task.status === "pending"; }).length;
                    inProgressTasks = userTasks.filter(function (task) { return task.status === "in_progress"; }).length;
                    overdueTasks = userTasks.filter(function (task) {
                        return task.dueDate &&
                            new Date(task.dueDate) < now_1 &&
                            task.status !== "completed";
                    }).length;
                    tasksThisWeek = userTasks.filter(function (task) { return new Date(task.createdAt) >= oneWeekAgo_1; }).length;
                    tasksThisMonth = userTasks.filter(function (task) { return new Date(task.createdAt) >= oneMonthAgo_1; }).length;
                    completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                    totalMeetings = userMeetings.length;
                    scheduledMeetings = userMeetings.filter(function (meeting) { return meeting.status === "scheduled"; }).length;
                    completedMeetings = userMeetings.filter(function (meeting) { return meeting.status === "completed"; }).length;
                    cancelledMeetings = userMeetings.filter(function (meeting) { return meeting.status === "cancelled"; }).length;
                    pendingMeetings = userMeetings.filter(function (meeting) { return meeting.status === "pending"; }).length;
                    meetingsThisWeek = userMeetings.filter(function (meeting) { return new Date(meeting.createdAt) >= oneWeekAgo_1; }).length;
                    meetingsThisMonth = userMeetings.filter(function (meeting) { return new Date(meeting.createdAt) >= oneMonthAgo_1; }).length;
                    meetingCompletionRate = totalMeetings > 0
                        ? Math.round((completedMeetings / totalMeetings) * 100)
                        : 0;
                    totalProjects = projectStats.totalProjects || 0;
                    activeProjects = projectStats.activeProjects || 0;
                    completedProjects = projectStats.completedProjects || 0;
                    averageProgress = projectStats.averageProgress || 0;
                    setStats({
                        totalTasks: totalTasks,
                        completedTasks: completedTasks,
                        pendingTasks: pendingTasks,
                        inProgressTasks: inProgressTasks,
                        overdueTasks: overdueTasks,
                        tasksThisWeek: tasksThisWeek,
                        tasksThisMonth: tasksThisMonth,
                        completionRate: completionRate,
                        totalMeetings: totalMeetings,
                        scheduledMeetings: scheduledMeetings,
                        completedMeetings: completedMeetings,
                        cancelledMeetings: cancelledMeetings,
                        pendingMeetings: pendingMeetings,
                        meetingsThisWeek: meetingsThisWeek,
                        meetingsThisMonth: meetingsThisMonth,
                        meetingCompletionRate: meetingCompletionRate,
                        totalProjects: totalProjects,
                        activeProjects: activeProjects,
                        completedProjects: completedProjects,
                        averageProgress: averageProgress,
                    });
                    return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    console.error("Error loading dashboard data:", error_1);
                    sonner_1.toast.error("Failed to load dashboard data");
                    return [3 /*break*/, 7];
                case 6:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); }, [user]);
    (0, react_1.useEffect)(function () {
        console.log("Dashboard useEffect triggered:", { user: user === null || user === void 0 ? void 0 : user.id });
        if (user && user.id) {
            loadDashboardData();
        }
    }, [user]);
    // Chart data
    var statusData = [
        { name: "Deployed", value: stats.completedTasks, color: "#10B981", },
        { name: "In Development", value: stats.inProgressTasks, color: "#3B82F6" },
        { name: "Backlog", value: stats.pendingTasks, color: "#F59E0B" },
        { name: "Blocked", value: stats.overdueTasks, color: "#EF4444" },
    ];
    var priorityData = [
        {
            name: "Critical",
            value: tasks.filter(function (task) { return task.priority === "high"; }).length,
            color: "#EF4444",
        },
        {
            name: "High Priority",
            value: tasks.filter(function (task) { return task.priority === "medium"; }).length,
            color: "#F59E0B",
        },
        {
            name: "Low Priority",
            value: tasks.filter(function (task) { return task.priority === "low"; }).length,
            color: "#10B981",
        },
    ];
    // Weekly combined data (last 7 days)
    var getWeeklyData = function () {
        var days = [];
        var _loop_1 = function (i) {
            var date = new Date();
            date.setDate(date.getDate() - i);
            var dayName = date.toLocaleDateString("en-US", { weekday: "short" });
            var tasksOnDay = tasks.filter(function (task) {
                var taskDate = new Date(task.createdAt);
                return taskDate.toDateString() === date.toDateString();
            }).length;
            var meetingsOnDay = meetings.filter(function (meeting) {
                var meetingDate = new Date(meeting.createdAt);
                return meetingDate.toDateString() === date.toDateString();
            }).length;
            var projectsOnDay = projects.filter(function (project) {
                var projectDate = new Date(project.createdAt);
                return projectDate.toDateString() === date.toDateString();
            }).length;
            days.push({
                day: dayName,
                tasks: tasksOnDay,
                meetings: meetingsOnDay,
                projects: projectsOnDay,
            });
        };
        for (var i = 6; i >= 0; i--) {
            _loop_1(i);
        }
        return days;
    };
    var weeklyData = getWeeklyData();
    // Meeting chart data
    var meetingStatusData = [
        { name: "Scheduled", value: stats.scheduledMeetings, color: "#3B82F6" },
        { name: "Concluded", value: stats.completedMeetings, color: "#10B981" },
        { name: "Draft", value: stats.pendingMeetings, color: "#F59E0B" },
        { name: "Cancelled", value: stats.cancelledMeetings, color: "#EF4444" },
    ];
    var meetingTypeData = [
        {
            name: "Remote",
            value: meetings.filter(function (meeting) { return meeting.type === "online"; }).length,
            color: "#3B82F6",
        },
        {
            name: "in-person",
            value: meetings.filter(function (meeting) { return meeting.type === "in-person"; }).length,
            color: "#10B981",
        },
        {
            name: "Hybrid",
            value: meetings.filter(function (meeting) { return meeting.type === "hybrid"; }).length,
            color: "#F59E0B",
        },
    ];
    // Project chart data
    var projectStatusData = [
        { name: "Active", value: stats.activeProjects, color: "#10B981" },
        {
            name: "Planning",
            value: projects.filter(function (project) { return project.status === "planning"; }).length,
            color: "#3B82F6",
        },
        { name: "Completed", value: stats.completedProjects, color: "#6B7280" },
        {
            name: "On Hold",
            value: projects.filter(function (project) { return project.status === "on_hold"; }).length,
            color: "#F59E0B",
        },
    ];
    // Project progress trend data
    var projectProgressData = [
        { week: 1, completionRate: 15, targetRate: 20 },
        { week: 2, completionRate: 28, targetRate: 25 },
        { week: 3, completionRate: 35, targetRate: 30 },
        { week: 4, completionRate: 42, targetRate: 35 },
        { week: 5, completionRate: 38, targetRate: 40 },
        { week: 6, completionRate: 45, targetRate: 45 },
        { week: 7, completionRate: 52, targetRate: 50 },
        { week: 8, completionRate: 48, targetRate: 55 },
        { week: 9, completionRate: 58, targetRate: 60 },
        { week: 10, completionRate: 65, targetRate: 65 },
        { week: 11, completionRate: 72, targetRate: 70 },
        { week: 12, completionRate: 78, targetRate: 75 },
        { week: 13, completionRate: 82, targetRate: 80 },
        { week: 14, completionRate: 85, targetRate: 85 },
        { week: 15, completionRate: 88, targetRate: 90 },
        { week: 16, completionRate: 92, targetRate: 95 },
    ];
    var projectPriorityData = [
        {
            name: "High",
            value: projects.filter(function (project) { return project.priority === "high"; }).length,
            color: "#EF4444",
        },
        {
            name: "Medium",
            value: projects.filter(function (project) { return project.priority === "medium"; }).length,
            color: "#F59E0B",
        },
        {
            name: "Low",
            value: projects.filter(function (project) { return project.priority === "low"; }).length,
            color: "#10B981",
        },
    ];
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(HorizontalLoader_1.default, { message: "Loading your dashboard...", subMessage: "Preparing your workspace", progress: 75, className: "min-h-screen" }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen ambient-light", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mt-10 mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-16", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex flex-col lg:flex-row lg:items-center justify-end mb-8 gap-6", children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.4 }, className: "flex items-center space-x-3", children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: loadDashboardData, className: "flex items-center space-x-2 gap-2 px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-[20px] shadow-lg hover:shadow-xl transition-all duration-200 font-medium", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: "w-4 h-4 " }), "Refresh Data"] }) }) }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.5 }, className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-white dark:bg-gray-800 backdrop-blur-sm rounded-[30px] p-4 border border-purple-200 dark:border-gray-700", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3  bg-purple-500 rounded-full animate-pulse" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-medium text-purple-600 dark:text-purple-400  tracking-wide", children: "System Status" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm  text-purple-800 dark:text-purple-200", children: "All Systems Active" })] })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white dark:bg-gray-800 backdrop-blur-sm rounded-[30px] p-4 border border-green-200 dark:border-gray-700", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3  bg-green-500 rounded-full animate-pulse" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-medium text-green-600 dark:text-green-400  tracking-wide", children: "Last Updated" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm  text-green-800 dark:text-green-200", children: "Updated Just now" })] })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white dark:bg-gray-800 backdrop-blur-sm rounded-[30px] p-4 border border-orange-200 dark:border-gray-700", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3  bg-orange-500 rounded-full animate-pulse" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-medium text-orange-600 dark:text-orange-400  tracking-wide", children: "Performance" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm  text-orange-800 dark:text-orange-200", children: "Excellent Performance" })] })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white dark:bg-gray-800 backdrop-blur-sm rounded-[30px] p-4 border border-blue-200 dark:border-gray-700", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3  bg-blue-500 rounded-full animate-pulse" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-medium text-blue-600 dark:text-blue-400  tracking-wide", children: "Sync Status" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm  text-blue-800 dark:text-blue-200", children: "Real Time Synchronization" })] })] }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12", children: [(0, jsx_runtime_1.jsx)("div", { className: "card-glow", children: (0, jsx_runtime_1.jsx)(StatsCard_1.default, { title: "Active Tasks", value: stats.totalTasks, icon: lucide_react_1.Target, color: "blue", subtitle: "Currently in progress", delay: 0.1 }) }), (0, jsx_runtime_1.jsx)("div", { className: "card-glow", children: (0, jsx_runtime_1.jsx)(StatsCard_1.default, { title: "Completed", value: stats.completedTasks, icon: lucide_react_1.CheckCircle, color: "orange", trend: "up", trendValue: stats.completionRate, subtitle: "Successfully delivered", delay: 0.2 }) }), (0, jsx_runtime_1.jsx)("div", { className: "card-glow", children: (0, jsx_runtime_1.jsx)(StatsCard_1.default, { title: "Team Meetings", value: stats.totalMeetings, icon: lucide_react_1.Video, color: "green", subtitle: "Collaboration sessions", delay: 0.3 }) }), (0, jsx_runtime_1.jsx)("div", { className: "card-glow", children: (0, jsx_runtime_1.jsx)(StatsCard_1.default, { title: "Active Projects", value: stats.activeProjects, icon: lucide_react_1.Activity, color: "purple", subtitle: "Currently running", delay: 0.4 }) })] }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.9, duration: 0.6 }, className: "mb-12 overflow-hidden ambient-section", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 1.3 }, className: "mt-10", children: (0, jsx_runtime_1.jsxs)("div", { className: " rounded-[30px]", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-end py-10 mb-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3  bg-blue-500 dark:bg-blue-400 rounded-full" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-blue-600 dark:text-blue-400", children: "Tasks" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3  bg-green-500 dark:bg-green-400 rounded-full" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-green-600 dark:text-green-400", children: "Meetings" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3  bg-purple-500 dark:bg-purple-400 rounded-full" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-purple-600 dark:text-purple-400", children: "Projects" })] })] }) }), (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 400, children: (0, jsx_runtime_1.jsxs)(recharts_1.LineChart, { data: weeklyData, children: [(0, jsx_runtime_1.jsx)(recharts_1.CartesianGrid, { strokeDasharray: "3 2", stroke: "#9CA3AF", opacity: 0.3 }), (0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "day", stroke: "#9CA3AF" }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, { stroke: "#9CA3AF" }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { contentStyle: {
                                                            border: "1px solid #9CA3AF",
                                                            borderRadius: "15px",
                                                            color: "black",
                                                            padding: "10px 30px",
                                                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                                                            // backdropFilter: "blur(10px)",
                                                        } }), (0, jsx_runtime_1.jsx)(recharts_1.Legend, {}), (0, jsx_runtime_1.jsx)(recharts_1.Line, { type: "monotone", dataKey: "tasks", stroke: "#3B82F6", strokeWidth: 3, dot: { r: 5, fill: "#3B82F6" }, style: {
                                                            textTransform: ''
                                                        } }), (0, jsx_runtime_1.jsx)(recharts_1.Line, { type: "monotone", dataKey: "meetings", stroke: "#10B981", strokeWidth: 3, dot: { r: 5, fill: "#10B981" } }), (0, jsx_runtime_1.jsx)(recharts_1.Line, { type: "monotone", dataKey: "projects", stroke: "#8B5CF6", strokeWidth: 3, dot: { r: 5, fill: "#8B5CF6" } }), (0, jsx_runtime_1.jsxs)("defs", { children: [(0, jsx_runtime_1.jsxs)("linearGradient", { id: "colorTasks", x1: "0", y1: "0", x2: "0", y2: "1", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "5%", stopColor: "#6B7280", stopOpacity: 0.9 }), (0, jsx_runtime_1.jsx)("stop", { offset: "95%", stopColor: "#6B7280", stopOpacity: 0.3 })] }), (0, jsx_runtime_1.jsxs)("linearGradient", { id: "colorMeetings", x1: "0", y1: "0", x2: "0", y2: "1", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "5%", stopColor: "#4B5563", stopOpacity: 0.9 }), (0, jsx_runtime_1.jsx)("stop", { offset: "95%", stopColor: "#4B5563", stopOpacity: 0.3 })] }), (0, jsx_runtime_1.jsxs)("linearGradient", { id: "colorProjects", x1: "0", y1: "0", x2: "0", y2: "1", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "5%", stopColor: "#374151", stopOpacity: 0.9 }), (0, jsx_runtime_1.jsx)("stop", { offset: "95%", stopColor: "#374151", stopOpacity: 0.3 })] })] })] }) })] }) }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 1.4 }, className: "grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-200/50 dark:border-gray-700/50", children: [(0, jsx_runtime_1.jsxs)("div", { className: "backdrop-blur-sm rounded-[30px] p-6 border-gray-200", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-2 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-300 rounded-[30px]", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Target, { className: "w-5 h-5  text-white dark:text-gray-800" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-xl  text-gray-900 dark:text-white", children: "Task Status" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Current distribution" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl  text-gray-900 dark:text-white", children: stats.totalTasks }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Total Tasks" })] })] }), (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 300, children: (0, jsx_runtime_1.jsxs)(recharts_1.PieChart, { children: [(0, jsx_runtime_1.jsx)(recharts_1.Pie, { data: statusData, cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 120, paddingAngle: 8, dataKey: "value", children: statusData.map(function (entry, index) { return ((0, jsx_runtime_1.jsx)(recharts_1.Cell, { fill: entry.color }, "cell-".concat(index))); }) }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { contentStyle: {
                                                                border: "none",
                                                                borderRadius: "15px",
                                                                color: "white",
                                                                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                                                            } })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 gap-3 mt-6", children: statusData.map(function (item, index) { return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 1.5 + index * 0.1 }, className: "flex items-center p-3 bg-gray-100 dark:bg-[rgba(255,255,255,.1)] rounded-[30px]", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4  rounded-[30px] mr-3 shadow-sm", style: { backgroundColor: item.color } }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm  text-gray-900 dark:text-white", children: item.value }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-600 dark:text-gray-400", children: item.name })] })] }, index)); }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "rounded-[30px] p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-2 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-300 rounded-[30px]", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Video, { className: "w-5 h-5  text-white dark:text-gray-800" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-xl  text-gray-900 dark:text-white", children: "Meeting Status" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Current distribution" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl  text-gray-900 dark:text-white", children: stats.totalMeetings }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Total Meetings" })] })] }), (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 300, children: (0, jsx_runtime_1.jsxs)(recharts_1.PieChart, { children: [(0, jsx_runtime_1.jsx)(recharts_1.Pie, { data: meetingStatusData, cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 120, paddingAngle: 8, dataKey: "value", children: meetingStatusData.map(function (entry, index) { return ((0, jsx_runtime_1.jsx)(recharts_1.Cell, { fill: entry.color }, "cell-".concat(index))); }) }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { contentStyle: {
                                                                border: "none",
                                                                borderRadius: "15px",
                                                                color: "white",
                                                                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                                                            } })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 gap-3 mt-6", children: meetingStatusData.map(function (item, index) { return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 1.6 + index * 0.1 }, className: "flex items-center p-3 bg-gray-100 dark:bg-[rgba(255,255,255,.1)] rounded-[30px]", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4  rounded-[30px] mr-3 shadow-sm", style: { backgroundColor: item.color } }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm  text-gray-900 dark:text-white", children: item.value }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-600 dark:text-gray-400", children: item.name })] })] }, index)); }) })] })] })] }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { delay: 1.7, duration: 0.6 }, className: "mb-20 grid grid-cols-1 lg:grid-cols-2 gap-8", children: [(0, jsx_runtime_1.jsx)("div", { className: "mt-10", children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6 ", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-lg  text-gray-800 dark:text-gray-200", children: "Project Status Distribution" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: [stats.totalProjects, " Total Projects"] })] }), (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 300, children: (0, jsx_runtime_1.jsxs)(recharts_1.PieChart, { children: [(0, jsx_runtime_1.jsx)(recharts_1.Pie, { data: projectStatusData, cx: "50%", cy: "50%", innerRadius: 50, outerRadius: 100, paddingAngle: 5, dataKey: "value", children: projectStatusData.map(function (entry, index) { return ((0, jsx_runtime_1.jsx)(recharts_1.Cell, { fill: entry.color }, "cell-".concat(index))); }) }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { contentStyle: {
                                                            border: "none",
                                                            borderRadius: "15px",
                                                            color: "white",
                                                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                                                        } })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 gap-3 mt-6", children: projectStatusData.map(function (item, index) { return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 1.5 + index * 0.1 }, className: "flex items-center p-3 bg-gray-100 dark:bg-[rgba(255,255,255,.1)] rounded-[30px]", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4  rounded-[30px] mr-3 shadow-sm", style: { backgroundColor: item.color } }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm  text-gray-900 dark:text-white", children: item.value }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-600 dark:text-gray-400", children: item.name })] })] }, index)); }) })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "mt-10", children: (0, jsx_runtime_1.jsxs)("div", { className: "rounded-[30px] p-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-end mb-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: function () { return setCalendarMonth(addMonths(calendarMonth, -1)); }, className: "px-3 py-2 rounded-[30px] w-10 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900", "aria-label": "Previous month", children: "\u2039" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: [calendarMonth.toLocaleString('default', { month: 'long' }), " ", calendarMonth.getFullYear()] }), (0, jsx_runtime_1.jsx)("button", { onClick: function () { return setCalendarMonth(addMonths(calendarMonth, 1)); }, className: "px-3 py-2 rounded-[30px] w-10 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900", "aria-label": "Next month", children: "\u203A" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-7 gap-2", children: [['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(function (d) { return ((0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400 text-center py-1", children: d }, d)); }), getMonthDaysGrid(calendarMonth).map(function (d, idx) {
                                                    var isToday = d && isSameDay(d, new Date());
                                                    var isSelected = d && isSameDay(d, selectedDate);
                                                    return ((0, jsx_runtime_1.jsx)("button", { onClick: function () { return d && setSelectedDate(d); }, className: [
                                                            "h-12 rounded-[14px] border flex items-center justify-center text-sm transition-colors",
                                                            d ? "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900" : "border-transparent",
                                                            isToday ? "ring-2 ring-[#fe914d]" : "",
                                                            isSelected ? "bg-[#fe914d] text-white border-none" : "text-gray-800 dark:text-gray-200"
                                                        ].join(' '), disabled: !d, "aria-label": d ? d.toDateString() : 'empty', children: d ? d.getDate() : '' }, idx));
                                                })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: ["Selected: ", selectedDate.toLocaleDateString()] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3 flex-col sn:flex-row", children: [(0, jsx_runtime_1.jsx)("button", { onClick: function () {
                                                                if (!permissions.canCreateTask) {
                                                                    sonner_1.toast.error('You do not have permission to create tasks. Contact an admin.');
                                                                    return;
                                                                }
                                                                navigate('/dashboard/tasks', { state: { date: selectedDate.toISOString(), openModal: true } });
                                                            }, disabled: !permissions.canCreateTask, className: "w-[250px] h-12 font-bold rounded-[15px] text-sm bg-[#fe914d] text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed", children: "Schedule Task" }), (0, jsx_runtime_1.jsx)("button", { onClick: function () {
                                                                if (!permissions.canCreateMeeting) {
                                                                    sonner_1.toast.error('You do not have permission to create meetings. Contact an admin.');
                                                                    return;
                                                                }
                                                                navigate('/dashboard/meetings', { state: { date: selectedDate.toISOString(), openModal: true } });
                                                            }, disabled: !permissions.canCreateMeeting, className: "w-[250px] h-12 rounded-[15px] text-sm border border-gray-200 font-bold dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed", children: "Schedule Meeting" })] })] })] }) })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, {})] }), (0, jsx_runtime_1.jsx)(UserDetailsModal_1.default, { userId: selectedUserId, isOpen: showUserDetails, onClose: function () {
                    setShowUserDetails(false);
                    setSelectedUserId(null);
                } })] }));
};
exports.default = Dashboard;
