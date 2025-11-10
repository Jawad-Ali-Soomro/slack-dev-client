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
var sonner_1 = require("sonner");
var button_1 = require("../components/ui/button");
var input_1 = require("../components/ui/input");
var textarea_1 = require("../components/ui/textarea");
var select_1 = require("../components/ui/select");
var dropdown_menu_1 = require("../components/ui/dropdown-menu");
var teamService_1 = require("../services/teamService");
var AuthContext_1 = require("../contexts/AuthContext");
var NotificationContext_1 = require("../contexts/NotificationContext");
var avatarUtils_1 = require("../utils/avatarUtils");
var StatsCard_1 = require("../components/StatsCard");
var SkeletonLoader_1 = require("../components/SkeletonLoader");
var uiConstants_1 = require("../utils/uiConstants");
var Teams = function () {
    var user = (0, AuthContext_1.useAuth)().user;
    var markAsReadByType = (0, NotificationContext_1.useNotifications)().markAsReadByType;
    var _a = (0, react_1.useState)(''), searchTerm = _a[0], setSearchTerm = _a[1];
    var _b = (0, react_1.useState)(false), showNewTeamPopup = _b[0], setShowNewTeamPopup = _b[1];
    var _c = (0, react_1.useState)([]), selectedTeams = _c[0], setSelectedTeams = _c[1];
    var _d = (0, react_1.useState)('all'), filterRole = _d[0], setFilterRole = _d[1];
    var _e = (0, react_1.useState)({
        name: '',
        description: '',
        isPublic: false
    }), newTeam = _e[0], setNewTeam = _e[1];
    var _f = (0, react_1.useState)(false), loading = _f[0], setLoading = _f[1];
    var _g = (0, react_1.useState)([]), teams = _g[0], setTeams = _g[1];
    var _h = (0, react_1.useState)(null), stats = _h[0], setStats = _h[1];
    var _j = (0, react_1.useState)({
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
    }), pagination = _j[0], setPagination = _j[1];
    // Load teams
    var loadTeams = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, teamService_1.default.getTeams({
                            role: filterRole !== 'all' ? filterRole : undefined,
                            search: searchTerm || undefined,
                            page: pagination.page,
                            limit: pagination.limit
                        })];
                case 1:
                    response = _a.sent();
                    setTeams(response.teams || []);
                    setPagination(response.pagination || pagination);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Failed to load teams:', error_1);
                    sonner_1.toast.error('Failed to load teams');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [filterRole, searchTerm, pagination.page, pagination.limit]);
    // Load stats
    var loadStats = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, teamService_1.default.getTeamStats()];
                case 1:
                    response = _a.sent();
                    setStats(response.stats);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Failed to load stats:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    // Load data on mount
    (0, react_1.useEffect)(function () {
        loadTeams();
        loadStats();
    }, [loadTeams, loadStats]);
    // Mark team notifications as read when user visits this page
    (0, react_1.useEffect)(function () {
        if (user && user.id) {
            markAsReadByType('teams');
        }
    }, [user, markAsReadByType]);
    // Create team
    var handleCreateTeam = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var response_1, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!newTeam.name.trim()) {
                        sonner_1.toast.error('Team name is required');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, teamService_1.default.createTeam(newTeam)];
                case 2:
                    response_1 = _a.sent();
                    setTeams(function (prev) { return __spreadArray([response_1.team], prev, true); });
                    setShowNewTeamPopup(false);
                    setNewTeam({ name: '', description: '', isPublic: false });
                    sonner_1.toast.success('Team created successfully!');
                    loadStats();
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error creating team:', error_3);
                    sonner_1.toast.error(error_3.message || 'Failed to create team');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Delete team
    var handleDeleteTeam = function (teamId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Are you sure you want to delete this team?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, teamService_1.default.deleteTeam(teamId)];
                case 2:
                    _a.sent();
                    setTeams(function (prev) { return prev.filter(function (team) { return team.id !== teamId; }); });
                    sonner_1.toast.success('Team deleted successfully!');
                    loadStats();
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error('Error deleting team:', error_4);
                    sonner_1.toast.error(error_4.message || 'Failed to delete team');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Get role color
    var getRoleColor = function (role) {
        switch (role) {
            case 'owner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'member': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };
    // Get role icon
    var getRoleIcon = function (role) {
        switch (role) {
            case 'owner': return (0, jsx_runtime_1.jsx)(lucide_react_1.Crown, { className: "w-4 h-4 icon" });
            case 'admin': return (0, jsx_runtime_1.jsx)(lucide_react_1.Shield, { className: "w-4 h-4 icon" });
            case 'member': return (0, jsx_runtime_1.jsx)(lucide_react_1.User, { className: "w-4 h-4 icon" });
            default: return (0, jsx_runtime_1.jsx)(lucide_react_1.User, { className: "w-4 h-4 icon" });
        }
    };
    // Filter teams
    var filteredTeams = teams.filter(function (team) {
        var matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });
    var containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };
    var itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "overflow-hidden pt-6 pl-6 pb-10", children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { className: "mx-auto", variants: containerVariants, initial: "hidden", animate: "visible", children: [(0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { variants: itemVariants, className: "flex items-center justify-between mb-8", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl  text-gray-900 dark:text-white mb-2", children: "Teams" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "Manage your teams and collaborate with members" })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-4", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: function () { return setShowNewTeamPopup(true); }, className: 'w-[200px] rounded-[10px] h-12', children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: uiConstants_1.ICON_SIZES.sm }), "New Team"] }) })] }), loading ? ((0, jsx_runtime_1.jsx)(SkeletonLoader_1.default, { type: "grid", count: 4, className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" })) : stats ? ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { variants: itemVariants, className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [(0, jsx_runtime_1.jsx)(StatsCard_1.default, { title: "Total Teams", value: stats.totalTeams, icon: lucide_react_1.Users, color: "gray" }), (0, jsx_runtime_1.jsx)(StatsCard_1.default, { title: "My Teams", value: stats.myTeams, icon: lucide_react_1.Users, color: "blue" }), (0, jsx_runtime_1.jsx)(StatsCard_1.default, { title: "Members", value: stats.totalMembers, icon: lucide_react_1.User, color: "green" }), (0, jsx_runtime_1.jsx)(StatsCard_1.default, { title: "Active", value: stats.activeTeams, icon: lucide_react_1.Users, color: "purple" })] })) : null, (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { variants: itemVariants, className: "flex flex-wrap justify-start items-center gap-4 mb-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "", children: (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 icon icon" }), (0, jsx_runtime_1.jsx)(input_1.Input, { type: "text", placeholder: "Search teams...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: (0, uiConstants_1.getInputClasses)('default', 'md', 'pl-10 w-[350px] h-13') })] }) }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: filterRole, onValueChange: setFilterRole, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-40 bg-white dark:bg-black h-13", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Role" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "all", children: "All Roles" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "owner", children: "Owner" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "admin", children: "Admin" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "member", children: "Member" })] })] })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { variants: itemVariants, className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: loading ? ((0, jsx_runtime_1.jsx)(SkeletonLoader_1.default, { type: "grid", count: 6 })) : filteredTeams.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "col-span-full text-center py-12", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl  text-gray-900 dark:text-white mb-2", children: "No teams found" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400 mb-6", children: "Get started by creating your first team" }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: function () { return setShowNewTeamPopup(true); }, className: 'w-[200px]', children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "w-4 h-4 icon mr-2 icon" }), "Create Team"] })] })) : (filteredTeams.map(function (team) {
                        var _a, _b, _c;
                        return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { variants: itemVariants, className: "bg-white dark:bg-black rounded-[10px]  border-gray-200 dark:border-gray-700 p-6 transition-shadow duration-300 hover:shadow-lg", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg  text-gray-900 dark:text-white mb-2", children: team.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 line-clamp-2", children: team.description })] }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", className: "p-2", children: (0, jsx_runtime_1.jsx)(lucide_react_1.MoreVertical, { className: "w-4 h-4 icon icon" }) }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { align: "end", children: [(0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { className: "h-10 px-5 cursor-pointer", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { className: "w-4 h-4 icon mr-2 icon" }), "Manage Team"] }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { className: "h-10 px-5 cursor-pointer", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.UserPlus, { className: "w-4 h-4 icon mr-2 icon" }), "Add Members"] }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { className: "h-10 px-5 cursor-pointer text-red-600", onClick: function () { return handleDeleteTeam(team.id); }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "w-4 h-4 icon mr-2" }), "Delete"] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4 mb-4 text-sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 text-gray-600 dark:text-gray-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Users, { className: "w-4 h-4 icon icon" }), (0, jsx_runtime_1.jsxs)("span", { children: [((_a = team.members) === null || _a === void 0 ? void 0 : _a.length) || 0, " members"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-2 text-gray-600 dark:text-gray-400", children: (0, jsx_runtime_1.jsxs)("span", { className: "px-2 py-1 rounded-[10px] text-xs font-medium ".concat(getRoleColor(team.role)), children: [getRoleIcon(team.role), team.role] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex -space-x-2", children: [(_b = team.members) === null || _b === void 0 ? void 0 : _b.slice(0, 3).map(function (member, index) {
                                                    var _a, _b, _c, _d;
                                                    return ((0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded-[10px]  border-white dark:border-gray-900 overflow-hidden", title: (_a = member.user) === null || _a === void 0 ? void 0 : _a.username, children: (0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)((_b = member.user) === null || _b === void 0 ? void 0 : _b.avatar, (_c = member.user) === null || _c === void 0 ? void 0 : _c.username), { alt: (_d = member.user) === null || _d === void 0 ? void 0 : _d.username, className: "w-full h-full object-cover" })) }, index));
                                                }), ((_c = team.members) === null || _c === void 0 ? void 0 : _c.length) > 3 && ((0, jsx_runtime_1.jsxs)("div", { className: "w-8 h-8 rounded-[10px]  border-white dark:border-gray-900 bg-gray-100 dark:bg-black flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400", children: ["+", team.members.length - 3] }))] }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: new Date(team.createdAt).toLocaleDateString() })] })] }, team.id));
                    })) }), showNewTeamPopup && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50", onClick: function () { return setShowNewTeamPopup(false); }, children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: "bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-md w-full p-6", onClick: function (e) { return e.stopPropagation(); }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl  text-gray-900 dark:text-white", children: "Create New Team" }), (0, jsx_runtime_1.jsx)("button", { onClick: function () { return setShowNewTeamPopup(false); }, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-6 h-6 icon" }) })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleCreateTeam, className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { value: newTeam.name, onChange: function (e) { return setNewTeam(__assign(__assign({}, newTeam), { name: e.target.value })); }, placeholder: "Team name *", className: "w-full h-12 rounded-[10px]", required: true }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { value: newTeam.description, onChange: function (e) { return setNewTeam(__assign(__assign({}, newTeam), { description: e.target.value })); }, placeholder: "Team description", className: "w-full h-12 rounded-[10px]", rows: "3" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", id: "isPublic", checked: newTeam.isPublic, onChange: function (e) { return setNewTeam(__assign(__assign({}, newTeam), { isPublic: e.target.checked })); }, className: "w-4 h-4 icon text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 dark:focus:ring-gray-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "isPublic", className: "text-sm text-gray-700 dark:text-gray-300", children: "Make this team public" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", variant: "outline", onClick: function () { return setShowNewTeamPopup(false); }, className: "flex-1 h-12 rounded-[10px]", disabled: loading, children: "Cancel" }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "submit", className: "flex-1 disabled:opacity-50 h-12 disabled:cursor-not-allowed rounded-[10px]", disabled: loading, children: loading ? ((0, jsx_runtime_1.jsx)("span", { className: "loader w-5 h-5 icon" })) : ('Create Team') })] })] })] }) }))] }) }));
};
exports.default = Teams;
