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
var input_1 = require("../../components/ui/input");
var badge_1 = require("../../components/ui/badge");
var select_1 = require("../../components/ui/select");
var dropdown_menu_1 = require("../../components/ui/dropdown-menu");
var HorizontalLoader_1 = require("../../components/HorizontalLoader");
var permissionsService_1 = require("../../services/permissionsService");
var AuthContext_1 = require("../../contexts/AuthContext");
var sonner_1 = require("sonner");
var button_1 = require("../../components/ui/button");
var avatarUtils_1 = require("../../utils/avatarUtils");
var pi_1 = require("react-icons/pi");
var UserManagement = function () {
    var user = (0, AuthContext_1.useAuth)().user;
    var _a = (0, react_1.useState)([]), users = _a[0], setUsers = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(''), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = (0, react_1.useState)('all'), roleFilter = _d[0], setRoleFilter = _d[1];
    var _e = (0, react_1.useState)('all'), permissionsFilter = _e[0], setPermissionsFilter = _e[1];
    // Check if user is admin
    (0, react_1.useEffect)(function () {
        if ((user === null || user === void 0 ? void 0 : user.role) !== 'admin') {
            sonner_1.toast.error('Access denied. Admin role required.');
            // Redirect to dashboard
            window.location.href = '/dashboard';
        }
    }, [user]);
    var loadUsers = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, permissionsService_1.default.getAllUsersWithPermissions()];
                case 1:
                    response = _a.sent();
                    if (response.success) {
                        setUsers(response.users);
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error loading users:', error_1);
                    sonner_1.toast.error('Failed to load users');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadUsers();
    }, []);
    var filteredUsers = users.filter(function (user) {
        var matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesRole = roleFilter === 'all' || user.role === roleFilter;
        var matchesPermissions = permissionsFilter === 'all' ||
            (permissionsFilter === 'with_permissions' && user.permissions) ||
            (permissionsFilter === 'without_permissions' && !user.permissions);
        return matchesSearch && matchesRole && matchesPermissions;
    });
    var getRoleBadgeColor = function (role) {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'superadmin':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };
    var getPermissionCount = function (permissions) {
        if (!permissions)
            return 0;
        return Object.values(permissions).filter(function (value) {
            return typeof value === 'boolean' && value;
        }).length;
    };
    // Some user documents might not have timestamps; derive join date from ObjectId
    var getJoinedDate = function (id, fallback) {
        try {
            if (!id)
                return fallback || '';
            var timestamp = parseInt(id.substring(0, 8), 16) * 1000;
            return new Date(timestamp).toLocaleDateString();
        }
        catch (_a) {
            return fallback || '';
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(HorizontalLoader_1.default, { message: "Loading users...", subMessage: "Fetching user data and permissions", progress: 70, className: "min-h-screen" }));
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: " ambient-light", children: (0, jsx_runtime_1.jsxs)("div", { className: "mt-10 mx-auto", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "mb-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)(pi_1.PiUsersDuotone, { className: "w-6 h-6 text-red-500" }), (0, jsx_runtime_1.jsx)("h1", { className: "text-2xl  text-gray-900 dark:text-white", children: "User Management" })] }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs font-medium text-gray-500 dark:text-gray-400", children: "Admin Access" })] }) }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "mb-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col md:flex-row gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative flex-1 max-w-[600px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 icon" }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Search users...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-10" })] }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: roleFilter, onValueChange: setRoleFilter, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-44 h-12 px-5", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Filter by role" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 cursor-pointer h-10', value: "all", children: "All Roles" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 cursor-pointer h-10', value: "user", children: "User" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 cursor-pointer h-10', value: "admin", children: "Admin" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 cursor-pointer h-10', value: "superadmin", children: "Super Admin" })] })] }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: permissionsFilter, onValueChange: setPermissionsFilter, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-56 h-12", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Filter by permissions" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 cursor-pointer h-10', value: "all", children: "All Users" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 cursor-pointer h-10', value: "with_permissions", children: "With Permissions" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 cursor-pointer h-10', value: "without_permissions", children: "Without Permissions" })] })] })] }) }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, children: (0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800", children: (0, jsx_runtime_1.jsxs)("table", { className: "w-full rounded-[10px] overflow-hidden", children: [(0, jsx_runtime_1.jsx)("thead", { className: "bg-gray-100 text-black rounded-[10px] dark:border-gray-700 sticky top-0 z-10", children: (0, jsx_runtime_1.jsxs)("tr", { className: "rounded-t-r-[10px]", children: [(0, jsx_runtime_1.jsx)("th", { className: "px-5 py-4 rounded-[10px] text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "User" }), (0, jsx_runtime_1.jsx)("th", { className: "px-5 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Role" }), (0, jsx_runtime_1.jsx)("th", { className: "px-5 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Permissions" }), (0, jsx_runtime_1.jsx)("th", { className: "px-5 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Joined" }), (0, jsx_runtime_1.jsx)("th", { className: "px-5 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: filteredUsers.map(function (userItem) { return ((0, jsx_runtime_1.jsxs)("tr", { className: "hover:bg-gray-50 dark:hover:bg-black", children: [(0, jsx_runtime_1.jsx)("td", { className: "px-5 py-2", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)(userItem.avatar, userItem.username), { alt: userItem.username, className: "w-8 h-8 rounded-full object-cover" })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium text-gray-900 dark:text-white", children: userItem.username }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: userItem.email })] })] }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-5 py-2", children: (0, jsx_runtime_1.jsx)(badge_1.Badge, { className: getRoleBadgeColor(userItem.role), children: userItem.role }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-5 py-2", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Shield, { className: "w-4 h-4 icon text-gray-400" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: [getPermissionCount(userItem.permissions), " permissions"] })] }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-5 py-2", children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: getJoinedDate(userItem.id, '') }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-5 py-2 flex items-center justify-end", children: (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", className: "p-2 w-12", children: (0, jsx_runtime_1.jsx)(lucide_react_1.MoreVertical, { className: "w-4 h-4 icon" }) }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { align: "end", children: [(0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { className: 'px-5 h-10 cursor-pointer', children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "w-4 h-4 icon mr-2" }), "View Details"] }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { className: 'px-5 h-10 cursor-pointer', children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "w-4 h-4 icon mr-2" }), "Edit Permissions"] }), userItem.role !== 'admin' && userItem.role !== 'superadmin' && ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { className: "text-red-600 px-5 h-10", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "w-4 h-4 icon mr-2" }), "Delete User"] }))] })] }) })] }, userItem.id)); }) })] }) }) })] }) }));
};
exports.default = UserManagement;
