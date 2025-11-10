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
var githubService_1 = require("../services/githubService");
var button_1 = require("../components/ui/button");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var StatsCard_1 = require("../components/StatsCard");
var GitHubDashboard = function () {
    var navigate = (0, react_router_dom_1.useNavigate)();
    var _a = (0, react_1.useState)(true), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)({
        totalRepositories: 0,
        totalPullRequests: 0,
        totalIssues: 0,
        openPullRequests: 0,
        closedPullRequests: 0,
        openIssues: 0,
        resolvedIssues: 0
    }), stats = _b[0], setStats = _b[1];
    var _c = (0, react_1.useState)([]), repositories = _c[0], setRepositories = _c[1];
    var _d = (0, react_1.useState)([]), recentPRs = _d[0], setRecentPRs = _d[1];
    var _e = (0, react_1.useState)([]), recentIssues = _e[0], setRecentIssues = _e[1];
    console.log(recentIssues);
    // Load dashboard data
    var loadDashboardData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, reposResponse, prsResponse, issuesResponse, repositories_1, pullRequests, issues, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, Promise.all([
                            githubService_1.githubService.getRepositories(),
                            githubService_1.githubService.getPullRequests(),
                            githubService_1.githubService.getIssues()
                        ])];
                case 1:
                    _a = _b.sent(), reposResponse = _a[0], prsResponse = _a[1], issuesResponse = _a[2];
                    repositories_1 = reposResponse.repositories || [];
                    pullRequests = prsResponse.pullRequests || [];
                    issues = issuesResponse.issues || [];
                    setRepositories(repositories_1);
                    setRecentPRs(pullRequests.slice(0, 5));
                    setRecentIssues(issues.slice(0, 5));
                    setStats({
                        totalRepositories: repositories_1.length,
                        totalPullRequests: pullRequests.length,
                        totalIssues: issues.length,
                        openPullRequests: pullRequests.filter(function (pr) { return pr.status === 'open'; }).length,
                        closedPullRequests: pullRequests.filter(function (pr) { return pr.status === 'closed' || pr.status === 'merged'; }).length,
                        openIssues: issues.filter(function (issue) { return issue.status === 'open'; }).length,
                        resolvedIssues: issues.filter(function (issue) { return issue.status === 'resolved' || issue.status === 'closed'; }).length
                    });
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _b.sent();
                    console.error('Error loading dashboard data:', error_1);
                    sonner_1.toast.error('Failed to load dashboard data');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadDashboardData();
    }, []);
    // Chart data based on real data
    var repositoryTypeData = [
        { name: 'Public', value: repositories.filter(function (repo) { return !repo.isPrivate; }).length, color: '#3B82F6' },
        { name: 'Private', value: repositories.filter(function (repo) { return repo.isPrivate; }).length, color: '#F59E0B' },
    ];
    var priorityData = [
        { name: 'Critical', value: recentIssues.filter(function (issue) { return issue.priority === 'critical'; }).length, x: 5, y: 12, color: '#EF4444' },
        { name: 'High', value: recentIssues.filter(function (issue) { return issue.priority === 'high'; }).length, x: 10, y: 8, color: '#F59E0B' },
        { name: 'Medium', value: recentIssues.filter(function (issue) { return issue.priority === 'medium'; }).length, x: 15, y: 5, color: '#3B82F6' },
        { name: 'Low', value: recentIssues.filter(function (issue) { return issue.priority === 'low'; }).length, x: 20, y: 3, color: '#10B981' }
    ];
    var activityData = [
        { name: 'Total Pulls', value: stats.openPullRequests, color: '#3B82F6' },
        { name: 'Total Issues', value: stats.openIssues, color: '#F59E0B' },
        { name: 'Total Activity', value: stats.totalPullRequests + stats.totalIssues, color: '#8B5CF6' }
    ];
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(HorizontalLoader_1.default, { message: "Loading GitHub dashboard...", subMessage: "Fetching your GitHub data", progress: 95, className: "min-h-screen" }));
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen ambient-light", children: (0, jsx_runtime_1.jsx)("div", { className: "mt-10 mx-auto", children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, children: [(0, jsx_runtime_1.jsx)("div", { className: "mb-16", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-1" }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.4 }, className: "flex items-center space-x-3", children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: loadDashboardData, className: "flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: "w-4 h-4 icon" }), (0, jsx_runtime_1.jsx)("span", { children: "Refresh Data" })] }) })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12", children: [(0, jsx_runtime_1.jsx)(StatsCard_1.default, { title: "Repositories", value: stats.totalRepositories, color: "blue", icon: lucide_react_1.FolderOpen, subtitle: "Total repositories", delay: 0.1 }), (0, jsx_runtime_1.jsx)(StatsCard_1.default, { title: "Pull Requests", value: stats.totalPullRequests, color: "green", icon: lucide_react_1.GitPullRequest, subtitle: "Active pull requests", delay: 0.2 }), (0, jsx_runtime_1.jsx)(StatsCard_1.default, { title: "Issues", value: stats.totalIssues, color: "orange", icon: lucide_react_1.AlertCircle, subtitle: "Open issues", delay: 0.3 })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.9, duration: 0.6 }, children: (0, jsx_runtime_1.jsx)("div", { className: "mt-10", children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [(0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 1.0 }, className: " rounded-[30px] p-6 border", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-2 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-300 rounded-[30px]", children: (0, jsx_runtime_1.jsx)(lucide_react_1.FolderOpen, { className: "w-5 h-5 icon text-white dark:text-gray-800" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg  text-gray-900 dark:text-white", children: "Repository Types" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Public vs Private distribution" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xl  text-gray-900 dark:text-white", children: stats.totalRepositories }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Total Repositories" })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "h-48 mb-6", children: (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: "100%", children: (0, jsx_runtime_1.jsxs)(recharts_1.PieChart, { children: [(0, jsx_runtime_1.jsx)(recharts_1.Pie, { data: repositoryTypeData, cx: "50%", cy: "50%", innerRadius: 50, outerRadius: 90, paddingAngle: 8, dataKey: "value", children: repositoryTypeData.map(function (entry, index) { return ((0, jsx_runtime_1.jsx)(recharts_1.Cell, { fill: entry.color }, "cell-".concat(index))); }) }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { contentStyle: {
                                                                    border: "none",
                                                                    borderRadius: "15px",
                                                                    color: "white",
                                                                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                                                                    backdropFilter: "blur(10px)",
                                                                } })] }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 gap-3", children: repositoryTypeData.map(function (item, index) { return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 1.1 + index * 0.1 }, className: "flex items-center p-3 bg-gray-100 dark:bg-[rgba(255,255,255,.1)] rounded-[30px]", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 icon rounded-[30px] mr-3 shadow-sm", style: { backgroundColor: item.color } }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm  text-gray-900 dark:text-white", children: item.value }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-600 dark:text-gray-400", children: item.name })] })] }, index)); }) })] }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 1.2 }, className: "border backdrop-blur-sm rounded-[30px] p-6 ", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-2 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-300 rounded-[30px]", children: (0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { className: "w-5 h-5 icon text-white dark:text-gray-800" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg  text-gray-900 dark:text-white", children: "Activity Overview" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Pull requests and issues distribution" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xl  text-gray-900 dark:text-white", children: stats.totalPullRequests + stats.totalIssues }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Total Activity" })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "h-48 mb-6", children: (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: "100%", children: (0, jsx_runtime_1.jsxs)(recharts_1.PieChart, { children: [(0, jsx_runtime_1.jsx)(recharts_1.Pie, { data: activityData, cx: "50%", cy: "50%", innerRadius: 50, outerRadius: 90, paddingAngle: 8, dataKey: "value", children: activityData.map(function (entry, index) { return ((0, jsx_runtime_1.jsx)(recharts_1.Cell, { fill: entry.color }, "cell-".concat(index))); }) }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { contentStyle: {
                                                                    border: "none",
                                                                    borderRadius: "15px",
                                                                    color: "white",
                                                                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                                                                    backdropFilter: "blur(10px)",
                                                                } })] }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 gap-3", children: activityData.map(function (item, index) { return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 1.3 + index * 0.1 }, className: "flex items-center p-3 bg-gray-100 dark:bg-[rgba(255,255,255,.1)] rounded-[30px] ".concat(item.name === "Total Activity" ? "col-span-2" : ""), children: [(0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 icon rounded-[30px] mr-3 shadow-sm", style: { backgroundColor: item.color } }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm  text-gray-900 dark:text-white", children: item.value }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-600 dark:text-gray-400", children: item.name })] })] }, index)); }) })] })] }) }) }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 1.7 }, className: "mt-10 pb-20", children: (0, jsx_runtime_1.jsx)("div", { className: "mt-10", children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [(0, jsx_runtime_1.jsxs)(framer_motion_1.motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: function () { return navigate('/dashboard/github/repositories'); }, className: "flex items-center justify-start space-x-3 p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 rounded-[30px] border border-blue-200/50 dark:border-blue-800/50 transition-all duration-300 shadow-lg hover:shadow-xl", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-3 bg-blue-500 rounded-xl", children: (0, jsx_runtime_1.jsx)(lucide_react_1.FolderOpen, { className: "w-6 h-6 text-white" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "text-left", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-lg  text-gray-900 dark:text-white", children: "Manage Repositories" }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: "View and organize your repos" })] })] }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: function () { return navigate('/dashboard/github/pull-requests'); }, className: "flex items-center justify-start space-x-3 p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-800/30 rounded-[30px] border border-green-200/50 dark:border-green-800/50 transition-all duration-300 shadow-lg hover:shadow-xl", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-3 bg-green-500 rounded-xl", children: (0, jsx_runtime_1.jsx)(lucide_react_1.GitPullRequest, { className: "w-6 h-6 text-white" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "text-left", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-lg  text-gray-900 dark:text-white", children: "Track Pull Requests" }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Monitor PR status and reviews" })] })] }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: function () { return navigate('/dashboard/github/issues'); }, className: "flex items-center justify-start space-x-3 p-6 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30 rounded-[30px] border border-orange-200/50 dark:border-orange-800/50 transition-all duration-300 shadow-lg hover:shadow-xl", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-3 bg-orange-500 rounded-xl", children: (0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "w-6 h-6 text-white" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "text-left", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-lg  text-gray-900 dark:text-white", children: "Manage Issues" }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Track and resolve issues" })] })] })] }) }) })] }) }) }));
};
exports.default = GitHubDashboard;
