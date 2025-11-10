"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var button_1 = require("./ui/button");
var avatarUtils_1 = require("../utils/avatarUtils");
var userService_1 = require("../services/userService");
var postService_1 = require("../services/postService");
var pi_1 = require("react-icons/pi");
var UserDetailsModal = function (_a) {
    var _b, _c;
    var userId = _a.userId, isOpen = _a.isOpen, onClose = _a.onClose;
    var _d = (0, react_1.useState)(null), user = _d[0], setUser = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)('overview'), activeTab = _f[0], setActiveTab = _f[1];
    var _g = (0, react_1.useState)([]), userPosts = _g[0], setUserPosts = _g[1];
    var _h = (0, react_1.useState)(false), loadingPosts = _h[0], setLoadingPosts = _h[1];
    (0, react_1.useEffect)(function () {
        console.log('UserDetailsModal useEffect:', { isOpen: isOpen, userId: userId });
        if (isOpen && userId) {
            loadUserDetails();
        }
    }, [isOpen, userId]);
    (0, react_1.useEffect)(function () {
        if (activeTab === 'posts' && userId) {
            loadUserPosts();
        }
    }, [activeTab, userId]);
    var loadUserDetails = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    console.log('Loading user details for ID:', userId);
                    setLoading(true);
                    return [4 /*yield*/, userService_1.userService.getUserDetails(userId)];
                case 1:
                    response = _a.sent();
                    console.log('User details response:', response);
                    setUser(response.user);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Failed to load user details:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var loadUserPosts = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoadingPosts(true);
                    return [4 /*yield*/, postService_1.default.getUserPosts(userId, { limit: 10 })];
                case 1:
                    response = _a.sent();
                    setUserPosts(response.posts || []);
                    return [3 /*break*/, 4];
                case 2:
                    error_2 = _a.sent();
                    console.error('Failed to load user posts:', error_2);
                    return [3 /*break*/, 4];
                case 3:
                    setLoadingPosts(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (!isOpen)
        return null;
    var tabs = [
        { id: 'overview', label: 'Overview', icon: pi_1.PiUserDuotone },
        { id: 'projects', label: 'Projects', icon: lucide_react_1.Briefcase },
    ];
    var formatDate = function (dateString) {
        if (!dateString)
            return 'Not specified';
        return new Date(dateString).toLocaleDateString();
    };
    var getStatusColor = function (status) {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 uppercase';
            case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200';
        }
    };
    var getRoleColor = function (role) {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'moderator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'user': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200';
        }
    };
    // console.log(user)
    return ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black/50 icon  flex items-center justify-center p-4 z-50", onClick: onClose, children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { scale: 0.9, opacity: 0, y: 20 }, animate: { scale: 1, opacity: 1, y: 0 }, exit: { scale: 0.9, opacity: 0, y: 20 }, transition: { type: "spring", damping: 25, stiffness: 300 }, className: "bg-white dark:bg-black rounded-[10px] shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-w-5xl w-full max-h-[90vh] overflow-hidden", onClick: function (e) { return e.stopPropagation(); }, children: loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center h-96", children: (0, jsx_runtime_1.jsx)("span", { className: "loader w-12 h-12" }) })) : user ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative p-8  border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-100 dark:bg-black tex-white dark:text-black", children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute bg-black dark:bg-white" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-center gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative group flex ", children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute -inset-1 rounded-full opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-sm" }), (0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)(user.avatar, user.username), { alt: user.username, className: "relative w-20 h-20 rounded-full border-4 border-gray-200 dark:border-gray-900 shadow-lg" }))] }), (0, jsx_runtime_1.jsx)("h2", { className: "text-3xl  text-black dark:text-white font-bold", children: user.username })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-2 hover:bg-gray-100 dark:hover:bg-black rounded-[10px]", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-6 h-6" }) })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "border-b icon border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-black/50", children: (0, jsx_runtime_1.jsx)("nav", { className: "flex space-x-1 px-6", children: tabs.map(function (tab) { return ((0, jsx_runtime_1.jsx)("button", { onClick: function () { return setActiveTab(tab.id); }, className: "flex items-center gap-2 py-4 px-4 border-b-2 icon  text-sm transition-all duration-200 rounded-t-lg ".concat(activeTab === tab.id
                                    ? 'border-b-black dark:border-b-white border-b shadow-sm'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer'), children: (0, jsx_runtime_1.jsx)(tab.icon, { className: "w-4 h-4 icon icon" }) }, tab.id)); }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "p-6 overflow-y-auto h-96", children: [activeTab === 'overview' && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[10px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Mail, { className: "w-5 h-5 icon icon text-blue-500" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Email" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-900 dark:text-white font-medium", children: user.email })] })] }), user.phone && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[10px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Phone, { className: "w-5 h-5 icon icon text-green-500" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Phone" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-900 dark:text-white font-medium", children: user.phone })] })] })), user.userLocation && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[10px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MapPin, { className: "w-5 h-5 icon icon text-red-500" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Location" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-900 dark:text-white font-medium", children: user.userLocation })] })] }))] }), (user.socialLinks && Object.keys(user.socialLinks).length > 0) && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-md  text-gray-900 dark:text-white", children: "Social Links" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [user.socialLinks.website && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[10px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Globe, { className: "w-5 h-5 icon icon text-purple-500" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Website" }), (0, jsx_runtime_1.jsx)("a", { href: user.socialLinks.website, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 dark:text-blue-400 hover:underline font-medium", children: user.socialLinks.website })] })] })), user.socialLinks.linkedin && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[10px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Building, { className: "w-5 h-5 icon icon text-blue-600" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "LinkedIn" }), (0, jsx_runtime_1.jsx)("a", { href: user.socialLinks.linkedin, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 dark:text-blue-400 hover:underline font-medium", children: "LinkedIn Profile" })] })] })), user.socialLinks.github && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[10px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Building, { className: "w-5 h-5 icon icon text-gray-700" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "GitHub" }), (0, jsx_runtime_1.jsx)("a", { href: user.socialLinks.github, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 dark:text-blue-400 hover:underline font-medium", children: "GitHub Profile" })] })] })), user.socialLinks.twitter && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[10px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Globe, { className: "w-5 h-5 icon icon text-blue-400" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Twitter" }), (0, jsx_runtime_1.jsxs)("a", { href: user.socialLinks.twitter, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 dark:text-blue-400 hover:underline font-medium", children: ["@", user.socialLinks.twitter.replace('https://twitter.com/', '')] })] })] }))] })] }))] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [user.dateOfBirth && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[10px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "w-5 h-5 icon icon text-pink-500" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Date of Birth" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-900 dark:text-white font-medium", children: formatDate(user.dateOfBirth) })] })] })), user.emailVerified !== undefined && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[10px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Mail, { className: "w-5 h-5 icon icon text-emerald-500" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Email Status" }), (0, jsx_runtime_1.jsx)("p", { className: "font-medium ".concat(user.emailVerified ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'), children: user.emailVerified ? 'Verified' : 'Unverified' })] })] })), user.website && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[10px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Globe, { className: "w-5 h-5 icon icon text-indigo-500" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Website" }), (0, jsx_runtime_1.jsx)("a", { href: user.website, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 dark:text-blue-400 hover:underline font-medium", children: user.website })] })] }))] }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-[10px] border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-shadow duration-200", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-3", children: (0, jsx_runtime_1.jsx)("div", { className: "p-2 bg-blue-500/10 rounded-[10px]", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Briefcase, { className: "w-5 h-5 icon icon" }) }) }), (0, jsx_runtime_1.jsx)("p", { className: "text-3xl  text-blue-700 dark:text-blue-300 font-bold", children: ((_b = user.projects) === null || _b === void 0 ? void 0 : _b.length) || 0 })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-[10px] border border-purple-200/50 dark:border-purple-700/50 hover:shadow-lg transition-shadow duration-200", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 text-purple-600 dark:text-purple-400 mb-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-2 bg-purple-500/10 rounded-[10px]", children: (0, jsx_runtime_1.jsx)(pi_1.PiUsersDuotone, { className: "w-5 h-5 icon icon" }) }), (0, jsx_runtime_1.jsx)("span", { className: "", children: "Teams" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-3xl  text-purple-700 dark:text-purple-300 font-bold", children: ((_c = user.teams) === null || _c === void 0 ? void 0 : _c.length) || 0 })] })] }) })] })), activeTab === 'projects' && ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: user.projects && user.projects.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: user.projects.map(function (project, index) { return ((0, jsx_runtime_1.jsx)("div", { className: "bg-white dark:bg-black p-5 rounded-[10px] border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-4", children: [project.logo && ((0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("img", { src: project.logo.startsWith('http') ? project.logo : "".concat(import.meta.env.VITE_API_URL || 'http://localhost:4000').concat(project.logo), alt: project.name, className: "w-12 h-12 rounded-[10px] object-cover  border-gray-200 dark:border-gray-700 shadow-sm" }), (0, jsx_runtime_1.jsx)("div", { className: "absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-[10px]" })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("h4", { className: " text-gray-900 dark:text-white text-lg mb-2", children: project.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3", children: project.description }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 flex-wrap", children: [(0, jsx_runtime_1.jsx)("span", { className: "px-3 py-1 rounded-[10px] text-xs  shadow-sm ".concat(project.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300' :
                                                                        project.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200' :
                                                                            'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'), children: project.status }), (0, jsx_runtime_1.jsx)("span", { className: "px-3 py-1 rounded-[10px] text-xs  shadow-sm ".concat(getRoleColor(project.role)), children: project.role }), (0, jsx_runtime_1.jsxs)("span", { className: "text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-[10px]", children: [project.progress, "% complete"] })] })] })] }) }, index)); }) })) : ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-8 text-gray-500 dark:text-gray-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Briefcase, { className: "w-12 h-12 mx-auto mb-2 opacity-50" }), (0, jsx_runtime_1.jsx)("p", { children: "No projects found" })] })) }))] })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center h-96", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.User, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 dark:text-gray-400", children: "User not found" })] }) })) }) }));
};
exports.default = UserDetailsModal;
