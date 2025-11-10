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
var HorizontalLoader_1 = require("./HorizontalLoader");
var usePermissions_1 = require("../hooks/usePermissions");
var lucide_react_1 = require("lucide-react");
var button_1 = require("./ui/button");
var input_1 = require("./ui/input");
var textarea_1 = require("./ui/textarea");
var checkbox_1 = require("./ui/checkbox");
var select_1 = require("./ui/select");
var dropdown_menu_1 = require("./ui/dropdown-menu");
var sonner_1 = require("sonner");
var teamService_1 = require("../services/teamService");
var friendService_1 = require("../services/friendService");
var avatarUtils_1 = require("../utils/avatarUtils");
var AuthContext_1 = require("../contexts/AuthContext");
var NotificationContext_1 = require("../contexts/NotificationContext");
var bs_1 = require("react-icons/bs");
var pi_1 = require("react-icons/pi");
var TeamsManage = function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    document.title = "Teams - Manage Your Teams";
    var user = (0, AuthContext_1.useAuth)().user;
    var markAsReadByType = (0, NotificationContext_1.useNotifications)().markAsReadByType;
    var _k = (0, usePermissions_1.usePermissions)(), permissions = _k.permissions, permissionsLoading = _k.loading;
    var _l = (0, react_1.useState)([]), teams = _l[0], setTeams = _l[1];
    var _m = (0, react_1.useState)([]), users = _m[0], setUsers = _m[1];
    var _o = (0, react_1.useState)(false), loading = _o[0], setLoading = _o[1];
    var _p = (0, react_1.useState)(''), searchTerm = _p[0], setSearchTerm = _p[1];
    var _q = (0, react_1.useState)('all'), filterStatus = _q[0], setFilterStatus = _q[1];
    var _r = (0, react_1.useState)(false), showNewTeamModal = _r[0], setShowNewTeamModal = _r[1];
    var _s = (0, react_1.useState)(false), showTeamDetails = _s[0], setShowTeamDetails = _s[1];
    var _t = (0, react_1.useState)(false), showMembersModal = _t[0], setShowMembersModal = _t[1];
    var _u = (0, react_1.useState)(null), selectedTeam = _u[0], setSelectedTeam = _u[1];
    var _v = (0, react_1.useState)(0), refreshKey = _v[0], setRefreshKey = _v[1];
    var _w = (0, react_1.useState)(false), showProjects = _w[0], setShowProjects = _w[1];
    console.log(selectedTeam);
    var _x = (0, react_1.useState)({
        name: '',
        description: '',
        members: [],
        settings: {
            allowMemberInvites: true,
            allowProjectCreation: true
        }
    }), newTeam = _x[0], setNewTeam = _x[1];
    var _y = (0, react_1.useState)({
        userId: '',
        role: 'member'
    }), newMember = _y[0], setNewMember = _y[1];
    var _z = (0, react_1.useState)(''), memberSearch = _z[0], setMemberSearch = _z[1];
    var _0 = (0, react_1.useState)([]), memberSuggestions = _0[0], setMemberSuggestions = _0[1];
    var _1 = (0, react_1.useState)(false), showMemberSuggestions = _1[0], setShowMemberSuggestions = _1[1];
    var _2 = (0, react_1.useState)({
        page: 1,
        limit: 6,
        total: 0,
        pages: 0
    }), pagination = _2[0], setPagination = _2[1];
    var loadTeams = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, teamService_1.default.getTeams({
                            page: pagination.page,
                            limit: pagination.limit,
                            search: searchTerm,
                            isActive: filterStatus === 'all' ? undefined : filterStatus === 'active'
                        })];
                case 1:
                    response = _a.sent();
                    setTeams(response.teams || []);
                    setPagination(response.pagination || pagination);
                    console.log('Teams loaded:', response.teams);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    sonner_1.toast.error('Failed to load teams');
                    console.error('Error loading teams:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [pagination.page, pagination.limit, searchTerm, filterStatus]);
    // Load friends for member selection
    var loadUsers = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, friends, transformedUsers, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, friendService_1.default.getFriends()];
                case 1:
                    response = _a.sent();
                    friends = response.friends || [];
                    transformedUsers = friends
                        .map(function (friendship) { return ({
                        id: friendship.friend.id,
                        name: friendship.friend.username,
                        username: friendship.friend.username,
                        email: friendship.friend.email,
                        role: "Friend",
                        avatar: friendship.friend.avatar
                    }); })
                        .filter(function (friend) { return friend.id !== (user === null || user === void 0 ? void 0 : user.id); }) // Exclude current user
                    ;
                    setUsers(transformedUsers);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error loading friends:', error_2);
                    sonner_1.toast.error('Failed to load friends');
                    setUsers([]);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    (0, react_1.useEffect)(function () {
        loadTeams();
    }, [loadTeams]);
    (0, react_1.useEffect)(function () {
        loadUsers();
    }, [loadUsers]);
    // Mark team notifications as read when user visits this page
    (0, react_1.useEffect)(function () {
        if (user && user.id) {
            markAsReadByType('teams');
        }
    }, [user, markAsReadByType]);
    // Close suggestions when clicking outside
    (0, react_1.useEffect)(function () {
        var handleClickOutside = function (event) {
            if (showMemberSuggestions && !event.target.closest('.member-search-container')) {
                setShowMemberSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return function () {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMemberSuggestions]);
    // Create new team
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
                    setShowNewTeamModal(false);
                    setNewTeam({
                        name: '',
                        description: '',
                        members: [],
                        settings: {
                            allowMemberInvites: true,
                            allowProjectCreation: true
                        }
                    });
                    sonner_1.toast.success('Team created successfully');
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
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
                    _a.trys.push([1, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, teamService_1.default.deleteTeam(teamId)];
                case 2:
                    _a.sent();
                    setTeams(function (prev) { return prev.filter(function (team) { return team.id !== teamId; }); });
                    sonner_1.toast.success('Team deleted successfully');
                    return [3 /*break*/, 5];
                case 3:
                    error_4 = _a.sent();
                    sonner_1.toast.error(error_4.message || 'Failed to delete team');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Handle member search
    var handleMemberSearch = function (value) {
        setMemberSearch(value);
        if (value.length > 0) {
            var filtered = users.filter(function (user) {
                var _a;
                return user.username.toLowerCase().includes(value.toLowerCase()) &&
                    !((_a = selectedTeam.members) === null || _a === void 0 ? void 0 : _a.some(function (member) { var _a; return ((_a = member.user) === null || _a === void 0 ? void 0 : _a.id) === user.id; }));
            });
            setMemberSuggestions(filtered);
            setShowMemberSuggestions(true);
        }
        else {
            setMemberSuggestions([]);
            setShowMemberSuggestions(false);
        }
    };
    // Add member to team
    var handleAddMember = function (userId, role) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!userId) {
                        sonner_1.toast.error('Please select a user');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    setLoading(true);
                    console.log('Adding member:', userId, 'to team:', selectedTeam.id);
                    return [4 /*yield*/, teamService_1.default.addMember(selectedTeam.id, { userId: userId, role: role })
                        // Reload teams to get updated data
                    ];
                case 2:
                    _a.sent();
                    // Reload teams to get updated data
                    console.log('Reloading teams after adding member...');
                    return [4 /*yield*/, loadTeams()
                        // Update selected team if it's the current team
                    ];
                case 3:
                    _a.sent();
                    if (!selectedTeam) return [3 /*break*/, 5];
                    console.log('Fetching updated team data for:', selectedTeam.id);
                    return [4 /*yield*/, teamService_1.default.getTeamById(selectedTeam.id)];
                case 4:
                    response = _a.sent();
                    console.log('Updated team data:', response.team);
                    console.log('Updated team members count:', response.team.members.length);
                    setSelectedTeam(response.team);
                    setRefreshKey(function (prev) { return prev + 1; });
                    _a.label = 5;
                case 5:
                    setMemberSearch('');
                    setShowMemberSuggestions(false);
                    setMemberSuggestions([]);
                    sonner_1.toast.success('Member added successfully');
                    return [3 /*break*/, 8];
                case 6:
                    error_5 = _a.sent();
                    console.error('Error adding member:', error_5);
                    sonner_1.toast.error(error_5.message || 'Failed to add member');
                    return [3 /*break*/, 8];
                case 7:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // Remove member from team
    var handleRemoveMember = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Are you sure you want to remove this member?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    setLoading(true);
                    console.log('Removing member:', userId, 'from team:', selectedTeam.id);
                    return [4 /*yield*/, teamService_1.default.removeMember(selectedTeam.id, { userId: userId })
                        // Reload teams to get updated data
                    ];
                case 2:
                    _a.sent();
                    // Reload teams to get updated data
                    console.log('Reloading teams after removing member...');
                    return [4 /*yield*/, loadTeams()
                        // Update selected team if it's the current team
                    ];
                case 3:
                    _a.sent();
                    if (!selectedTeam) return [3 /*break*/, 5];
                    console.log('Fetching updated team data for:', selectedTeam.id);
                    return [4 /*yield*/, teamService_1.default.getTeamById(selectedTeam.id)];
                case 4:
                    response = _a.sent();
                    console.log('Updated team data:', response.team);
                    console.log('Updated team members count:', response.team.members.length);
                    console.log('Updated team members:', response.team.members);
                    console.log('Previous selectedTeam members count:', selectedTeam.members.length);
                    setSelectedTeam(response.team);
                    // Force a re-render by updating the refresh key
                    setRefreshKey(function (prev) { return prev + 1; });
                    // Force a re-render by updating the state
                    setTimeout(function () {
                        console.log('After timeout - selectedTeam members:', selectedTeam.members.length);
                    }, 100);
                    _a.label = 5;
                case 5:
                    // Clear member search and suggestions
                    setMemberSearch('');
                    setShowMemberSuggestions(false);
                    setMemberSuggestions([]);
                    sonner_1.toast.success('Member removed successfully');
                    return [3 /*break*/, 8];
                case 6:
                    error_6 = _a.sent();
                    console.error('Error removing member:', error_6);
                    sonner_1.toast.error(error_6.message || 'Failed to remove member');
                    return [3 /*break*/, 8];
                case 7:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // Update member role
    var handleUpdateMemberRole = function (userId, role) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, 6, 7]);
                    setLoading(true);
                    return [4 /*yield*/, teamService_1.default.updateMemberRole(selectedTeam.id, { userId: userId, role: role })
                        // Reload teams to get updated data
                    ];
                case 1:
                    _a.sent();
                    // Reload teams to get updated data
                    return [4 /*yield*/, loadTeams()
                        // Update selected team if it's the current team
                    ];
                case 2:
                    // Reload teams to get updated data
                    _a.sent();
                    if (!selectedTeam) return [3 /*break*/, 4];
                    return [4 /*yield*/, teamService_1.default.getTeamById(selectedTeam.id)];
                case 3:
                    response = _a.sent();
                    setSelectedTeam(response.team);
                    setRefreshKey(function (prev) { return prev + 1; });
                    _a.label = 4;
                case 4:
                    sonner_1.toast.success('Member role updated successfully');
                    return [3 /*break*/, 7];
                case 5:
                    error_7 = _a.sent();
                    sonner_1.toast.error(error_7.message || 'Failed to update member role');
                    return [3 /*break*/, 7];
                case 6:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Filter teams
    var filteredTeams = teams.filter(function (team) {
        var _a;
        var matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ((_a = team.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase()));
        var matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' ? team.isActive : !team.isActive);
        return matchesSearch && matchesStatus;
    });
    // Pagination handlers
    var handlePageChange = function (newPage) {
        setPagination(function (prev) { return (__assign(__assign({}, prev), { page: newPage })); });
    };
    var handlePageSizeChange = function (newLimit) {
        setPagination(function (prev) { return (__assign(__assign({}, prev), { limit: newLimit, page: 1 })); });
    };
    var getPageNumbers = function () {
        var page = pagination.page, pages = pagination.pages;
        var delta = 2;
        var range = [];
        var rangeWithDots = [];
        for (var i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
            range.push(i);
        }
        if (page - delta > 2) {
            rangeWithDots.push(1, '...');
        }
        else {
            rangeWithDots.push(1);
        }
        rangeWithDots.push.apply(rangeWithDots, range);
        if (page + delta < pages - 1) {
            rangeWithDots.push('...', pages);
        }
        else if (pages > 1) {
            rangeWithDots.push(pages);
        }
        return rangeWithDots;
    };
    // Reset pagination when filters change
    (0, react_1.useEffect)(function () {
        if (pagination.page !== 1) {
            setPagination(function (prev) { return (__assign(__assign({}, prev), { page: 1 })); });
        }
    }, [filterStatus, searchTerm]);
    // Get role icon
    var getRoleIcon = function (role) {
        switch (role) {
            case 'owner': return (0, jsx_runtime_1.jsx)(lucide_react_1.Shield, { className: "w-4 h-4 icon text-yellow-600 icon p2" });
            case 'admin': return (0, jsx_runtime_1.jsx)(lucide_react_1.Shield, { className: "w-4 h-4 icon text-blue-500 icon" });
            default: return null;
        }
    };
    // Get role color
    var getRoleColor = function (role) {
        switch (role) {
            case 'owner': return 'bg-yellow-500 text-white dark:bg-yellow-600';
            case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default: return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };
    // Get status color
    var getStatusColor = function (isActive) {
        return isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    };
    // Check if current user is team owner
    var isTeamOwner = function (team) {
        var _a, _b;
        return ((_a = team.createdBy) === null || _a === void 0 ? void 0 : _a.id) === (user === null || user === void 0 ? void 0 : user.id) || ((_b = team.createdBy) === null || _b === void 0 ? void 0 : _b._id) === (user === null || user === void 0 ? void 0 : user.id);
    };
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
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: 'pt-10', children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-4 justify-start items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-white dark:bg-black", children: (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 icon icon" }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Search teams...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-10 w-[500px] h-13" })] }) }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: filterStatus, onValueChange: setFilterStatus, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-48 bg-white px-5 cursor-pointer dark:bg-black h-13", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Filter by status" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'h-10 px-5 cursor-pointer', value: "all", children: "All Teams" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'h-10 px-5 cursor-pointer', value: "active", children: "Active" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'h-10 px-5 cursor-pointer', value: "inactive", children: "Inactive" })] })] })] }) }), permissions.canCreateTeam && (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: function () {
                            if (!permissions.canCreateTeam) {
                                sonner_1.toast.error('You do not have permission to create teams. Contact an admin.');
                                return;
                            }
                            setShowNewTeamModal(true);
                        }, className: 'w-[200px] rounded-[10px] h-12 font-bold', children: "New Team" })] }), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center py-12", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-[10px] h-8 w-8 border-b-2 border-blue-600" }) })) : filteredTeams.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900 dark:text-white mb-2", children: "No teams found" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 dark:text-gray-400 mb-4", children: searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first team' }), !searchTerm && ((0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: function () {
                            if (!permissions.canCreateTeam) {
                                sonner_1.toast.error('You do not have permission to create teams. Contact an admin.');
                                return;
                            }
                            setShowNewTeamModal(true);
                        }, disabled: !permissions.canCreateTeam, className: 'w-[200px]', children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "w-4 h-4 icon mr-2 icon" }), "Create Team"] }))] })) : ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { variants: containerVariants, initial: "hidden", animate: "visible", className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredTeams.map(function (team) {
                    var _a, _b, _c;
                    return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { variants: itemVariants, className: "bg-white dark:bg-[rgba(255,255,255,.1)] rounded-[10px] border dark:border-none p-6  transition-shadow duration-300", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg  text-gray-900 dark:text-white line-clamp-1", children: team.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1", children: team.description || 'No description provided' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () {
                                                    setSelectedTeam(team);
                                                    setShowTeamDetails(true);
                                                }, className: "p-2 text-gray-400 w-12 hover:text-gray-600 dark:hover:text-gray-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "w-4 h-4 icon icon" }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", className: "p-2 w-12", children: (0, jsx_runtime_1.jsx)(lucide_react_1.MoreVertical, { className: "w-4 h-4 icon icon" }) }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { align: "end", children: [(0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { className: 'h-10 px-5 cursor-pointer', onClick: function () {
                                                                    setSelectedTeam(team);
                                                                    setShowTeamDetails(true);
                                                                }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "w-4 h-4 icon mr-2 icon" }), "View Details"] }), isTeamOwner(team) && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { className: 'h-10 px-5 cursor-pointer', onClick: function () {
                                                                            setSelectedTeam(team);
                                                                            setShowMembersModal(true);
                                                                        }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { className: "w-4 h-4 icon mr-2 icon" }), "Edit Members"] }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { className: 'h-10 px-5 cursor-pointer', onClick: function () { return handleDeleteTeam(team.id); }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "w-4 h-4 icon mr-2" }), "Delete"] })] }))] })] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex gap-2 mb-4", children: (0, jsx_runtime_1.jsx)("span", { className: "inline-flex items-center px-4 py-2 rounded-[10px] text-xs uppercase  ".concat(getStatusColor(team.isActive)), children: team.isActive ? 'Active' : 'Inactive' }) }), (0, jsx_runtime_1.jsx)("div", { className: "mb-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex -space-x-1", children: [(_a = team.members) === null || _a === void 0 ? void 0 : _a.slice(0, 3).map(function (member, index) {
                                            var _a, _b, _c;
                                            return ((0, jsx_runtime_1.jsx)("div", { className: "relative", children: (0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)((_a = member.user) === null || _a === void 0 ? void 0 : _a.avatar, (_b = member.user) === null || _b === void 0 ? void 0 : _b.username), { alt: (_c = member.user) === null || _c === void 0 ? void 0 : _c.username, className: "w-10 h-10 rounded-[10px] object-cover  border-white dark:border-gray-900" })) }, index));
                                        }), ((_b = team.members) === null || _b === void 0 ? void 0 : _b.length) > 3 && ((0, jsx_runtime_1.jsxs)("div", { className: "w-8 h-8 rounded-[10px] bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400  border-white dark:border-gray-900", children: ["+", team.members.length - 3] }))] }) }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FolderOpen, { className: "w-4 h-4 icon" }), ((_c = team.projects) === null || _c === void 0 ? void 0 : _c.length) || 0, " Projects"] }) })] }, team.id));
                }) })), (0, jsx_runtime_1.jsx)("div", { className: "sticky bottom-0  border-gray-200 dark:border-gray-700 p-4 mt-8", children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "flex flex-col sm:flex-row items-center justify-end gap-4", children: pagination.pages > 1 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handlePageChange(pagination.page - 1); }, disabled: pagination.page === 1 || loading, className: "flex items-center gap-1 h-8 px-3 w-[120px] h-[50px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowUp, { className: "w-4 h-4 icon rotate-[-90deg]" }), "Previous"] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-1", children: getPageNumbers().map(function (pageNum, index) { return ((0, jsx_runtime_1.jsx)("div", { children: pageNum === '...' ? ((0, jsx_runtime_1.jsx)("span", { className: "px-3 py-1 text-gray-500", children: "..." })) : ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: pagination.page === pageNum ? "default" : "outline", size: "sm", onClick: function () { return handlePageChange(pageNum); }, disabled: loading, className: "h-8 w-8 p-0 ".concat(pagination.page === pageNum
                                            ? 'bg-gray-600 text-white hover:bg-gray-700'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'), children: pageNum })) }, index)); }) }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handlePageChange(pagination.page + 1); }, disabled: pagination.page === pagination.pages || loading, className: "flex items-center gap-1 h-8 px-3 w-[120px] h-[50px]", children: ["Next", (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowDown, { className: "w-4 h-4 icon rotate-[-90deg]" })] })] })) }) }), showNewTeamModal && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black/50 icon  backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50", onClick: function () { return setShowNewTeamModal(false); }, children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: "bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-md w-full", onClick: function (e) { return e.stopPropagation(); }, children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-end mb-4", children: (0, jsx_runtime_1.jsx)("button", { onClick: function () { return setShowNewTeamModal(false); }, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-6 h-6 icon" }) }) }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleCreateTeam, className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { value: newTeam.name, onChange: function (e) { return setNewTeam(__assign(__assign({}, newTeam), { name: e.target.value })); }, placeholder: "Enter team name", required: true }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { value: newTeam.description, onChange: function (e) { return setNewTeam(__assign(__assign({}, newTeam), { description: e.target.value })); }, placeholder: "Enter team description", rows: 3 }) }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300", children: "Team Settings" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsxs)("label", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(checkbox_1.Checkbox, { checked: newTeam.settings.allowMemberInvites, onCheckedChange: function (checked) { return setNewTeam(__assign(__assign({}, newTeam), { settings: __assign(__assign({}, newTeam.settings), { allowMemberInvites: checked }) })); } }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: "Allow Member Invites" })] }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(checkbox_1.Checkbox, { checked: newTeam.settings.allowProjectCreation, onCheckedChange: function (checked) { return setNewTeam(__assign(__assign({}, newTeam), { settings: __assign(__assign({}, newTeam.settings), { allowProjectCreation: checked }) })); } }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: "Allow Project Creation" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3 pt-4", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", variant: "outline", onClick: function () { return setShowNewTeamModal(false); }, className: "flex-1", children: "Cancel" }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "submit", disabled: loading, className: "flex-1 disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? ((0, jsx_runtime_1.jsx)("span", { className: "loader w-5 h-5 icon" })) : ('Create Team') })] })] })] }) }) })), showTeamDetails && selectedTeam && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black/50 icon  backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50", onClick: function () {
                    setShowTeamDetails(false);
                    setShowProjects(false);
                }, children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: "bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto", onClick: function (e) { return e.stopPropagation(); }, children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl  text-gray-900 dark:text-white", children: selectedTeam.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: ["Created by ", (_a = selectedTeam.createdBy) === null || _a === void 0 ? void 0 : _a.username, " \u2022 ", new Date(selectedTeam.createdAt).toLocaleDateString()] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: function () {
                                            setShowTeamDetails(false);
                                            setShowProjects(false);
                                        }, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-6 h-6 icon" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg  text-gray-900 dark:text-white mb-2", children: "Description" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: selectedTeam.description || 'No description provided' })] }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 gap-4", children: (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("span", { className: "inline-flex items-center px-4 py-2 uppercase rounded-[10px] text-xs font-medium ".concat(getStatusColor(selectedTeam.isActive)), children: selectedTeam.isActive ? 'Active' : 'Inactive' }) }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Settings" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 text-sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-4 h-4 icon ".concat(((_b = selectedTeam.settings) === null || _b === void 0 ? void 0 : _b.allowMemberInvites) ? 'text-green-500' : 'text-gray-400') }), (0, jsx_runtime_1.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: "Member invites allowed" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 text-sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-4 h-4 icon ".concat(((_c = selectedTeam.settings) === null || _c === void 0 ? void 0 : _c.allowProjectCreation) ? 'text-green-500' : 'text-gray-400') }), (0, jsx_runtime_1.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: "Project creation allowed" })] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-lg  text-gray-900 dark:text-white mb-4", children: ["Members (", ((_d = selectedTeam.members) === null || _d === void 0 ? void 0 : _d.length) || 0, ")"] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2 max-h-60 overflow-y-auto", children: (_e = selectedTeam.members) === null || _e === void 0 ? void 0 : _e.map(function (member, index) {
                                                    var _a, _b, _c, _d, _e, _f;
                                                    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-[10px]", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)((_a = member.user) === null || _a === void 0 ? void 0 : _a.avatar, (_b = member.user) === null || _b === void 0 ? void 0 : _b.username), { alt: (_c = member.user) === null || _c === void 0 ? void 0 : _c.username, className: "w-8 h-8 rounded-[10px] object-cover" })), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: (_d = member.user) === null || _d === void 0 ? void 0 : _d.username }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-2", children: (0, jsx_runtime_1.jsx)("span", { className: "inline-flex items-center gap-1 w-[70px] h-7 flex items-center justify-center uppercase rounded-[10px] text-[10px] font-medium ".concat(getRoleColor(member.role)), children: member.role }) })] }, "".concat(((_e = member.user) === null || _e === void 0 ? void 0 : _e.id) || ((_f = member.user) === null || _f === void 0 ? void 0 : _f._id), "-").concat(index, "-").concat(refreshKey)));
                                                }) }, refreshKey)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 ma", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: function () { return setShowProjects(!showProjects); }, className: "flex items-center justify-between w-full text-left mb-4 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border cursor-pointer rounded-[10px] transition-colors", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-lg  text-gray-900 dark:text-white", children: ["Projects (", ((_f = selectedTeam.projects) === null || _f === void 0 ? void 0 : _f.length) || 0, ")"] }), (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { className: "w-5 h-5 icon text-gray-500 transition-transform duration-200 ".concat(showProjects ? 'rotate-180' : '') })] }), showProjects && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, transition: { duration: 0.3 }, className: "overflow-hidden max-h-[300px] overflow-y-auto", children: ((_g = selectedTeam.projects) === null || _g === void 0 ? void 0 : _g.length) === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-8 text-gray-500 dark:text-gray-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Target, { className: "w-12 h-12 mx-auto mb-3 text-gray-400" }), (0, jsx_runtime_1.jsx)("p", { children: "No projects in this team yet" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm", children: "Projects will appear here when created" })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 px-6", children: (_h = selectedTeam.projects) === null || _h === void 0 ? void 0 : _h.map(function (project, index) { return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "p-4 bg-gray-50 dark:bg-black rounded-[10px] border", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-start justify-between mb-3", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-sm font-medium text-gray-900 dark:text-white line-clamp-1", children: project.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1", children: project.description || 'No description' })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between text-xs", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "px-2 py-1 rounded-[10px] text-xs uppercase font-medium ".concat(project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                                            project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                                                project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'), children: project.status || 'planning' }), (0, jsx_runtime_1.jsx)("span", { className: "px-2 py-1 rounded-[10px] text-xs uppercase font-medium ".concat(project.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                                            project.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                                                project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'), children: project.priority || 'low' })] }), project.progress !== undefined && ((0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [project.progress, "%"] }))] }), project.startDate && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-2 text-xs text-gray-500 dark:text-gray-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "w-3 h-3 icon inline mr-1" }), "Started ", new Date(project.startDate).toLocaleDateString()] }))] }, index)); }) })) }))] }), isTeamOwner(selectedTeam) && ((0, jsx_runtime_1.jsx)("div", { className: "flex gap-3 mt-6 pt-4 border-t border-gray-200 justify-end w-full dark:border-gray-700", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: function () {
                                        setShowTeamDetails(false);
                                        setShowMembersModal(true);
                                    }, className: "w-1/3 hover:text-white  bg-black dark:bg-white text-white dark:text-black dark:text-black hover:bg-black dark:hover:bg-white border-none hover:border-none", children: [(0, jsx_runtime_1.jsx)(pi_1.PiUsersDuotone, { className: "w-4 h-4 icon mr-2 icon" }), "Edit Members"] }) }))] }) }) })), showMembersModal && selectedTeam && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-50", onClick: function () { return setShowMembersModal(false); }, children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: "bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto", onClick: function (e) { return e.stopPropagation(); }, children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)("h2", { className: "text-xl  text-gray-900 dark:text-white", children: ["Manage Members - ", selectedTeam.name] }), (0, jsx_runtime_1.jsx)("button", { onClick: function () { return setShowMembersModal(false); }, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-6 h-6 icon" }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "mb-6 rounded-[10px]", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative flex-1 member-search-container", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { value: memberSearch, onChange: function (e) { return handleMemberSearch(e.target.value); }, placeholder: "Search users...", className: "w-full h-12 rounded-[10px]" }), showMemberSuggestions && memberSuggestions.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "absolute z-10 w-full mt-1 bg-white dark:bg-black  border-gray-200 dark:border-gray-700 rounded-[10px] shadow-lg max-h-48 overflow-y-auto", children: memberSuggestions.map(function (user) { return ((0, jsx_runtime_1.jsx)("div", { onClick: function () { return handleAddMember(user.id, newMember.role); }, className: "px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)(user.avatar, user.username), { alt: user.username, className: "w-8 h-8 rounded-[10px] object-cover  border-gray-200 dark:border-gray-700" })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "font-medium text-gray-900 dark:text-white", children: user.username }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: user.email })] })] }) }, user.id)); }) }))] }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: newMember.role, onValueChange: function (value) { return setNewMember(__assign(__assign({}, newMember), { role: value })); }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-50 px-5 cursor-pointer", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Role" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'cursor-pointer px-5', value: "member", children: "Member" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'cursor-pointer px-5', value: "admin", children: "Admin" })] })] })] }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg  text-gray-900 dark:text-white mb-4", children: "Current Members" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2 max-h-60 overflow-y-auto", children: (_j = selectedTeam.members) === null || _j === void 0 ? void 0 : _j.map(function (member, index) {
                                            var _a, _b, _c, _d, _e, _f, _g;
                                            return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-[10px]", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)((_a = member.user) === null || _a === void 0 ? void 0 : _a.avatar, (_b = member.user) === null || _b === void 0 ? void 0 : _b.username), { alt: (_c = member.user) === null || _c === void 0 ? void 0 : _c.username, className: "w-8 h-8 rounded-[10px] object-cover" })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: (_d = member.user) === null || _d === void 0 ? void 0 : _d.username }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: (_e = member.user) === null || _e === void 0 ? void 0 : _e.email })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-2", children: member.role !== "owner" && ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handleRemoveMember(member.user._id); }, className: "text-red-600 w-12 hover:text-red-700", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash, { className: "w-4 h-4 icon icon" }) })) })] }, "".concat(((_f = member.user) === null || _f === void 0 ? void 0 : _f.id) || ((_g = member.user) === null || _g === void 0 ? void 0 : _g._id), "-").concat(index, "-").concat(refreshKey)));
                                        }) }, refreshKey)] })] }) }) }))] }));
};
exports.default = TeamsManage;
