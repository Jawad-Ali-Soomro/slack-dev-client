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
var react_router_dom_1 = require("react-router-dom");
var framer_motion_1 = require("framer-motion");
var HorizontalLoader_1 = require("../components/HorizontalLoader");
var usePermissions_1 = require("../hooks/usePermissions");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var button_1 = require("../components/ui/button");
var input_1 = require("../components/ui/input");
var textarea_1 = require("../components/ui/textarea");
var checkbox_1 = require("../components/ui/checkbox");
var select_1 = require("../components/ui/select");
var dropdown_menu_1 = require("../components/ui/dropdown-menu");
var userService_1 = require("../services/userService");
var meetingService_1 = require("../services/meetingService");
var projectService_1 = require("../services/projectService");
var teamService_1 = require("../services/teamService");
var friendService_1 = require("../services/friendService");
var AuthContext_1 = require("../contexts/AuthContext");
var NotificationContext_1 = require("../contexts/NotificationContext");
var avatarUtils_1 = require("../utils/avatarUtils");
var MeetingEditModal_1 = require("../components/MeetingEditModal");
var UserDetailsModal_1 = require("../components/UserDetailsModal");
var uiConstants_1 = require("../utils/uiConstants");
var Meetings = function () {
    document.title = "Meetings - Schedule & Manage";
    var user = (0, AuthContext_1.useAuth)().user;
    var markAsReadByType = (0, NotificationContext_1.useNotifications)().markAsReadByType;
    var _a = (0, usePermissions_1.usePermissions)(), permissions = _a.permissions, permissionsLoading = _a.loading;
    var location = (0, react_router_dom_1.useLocation)();
    var _b = (0, react_1.useState)(""), searchTerm = _b[0], setSearchTerm = _b[1];
    var _c = (0, react_1.useState)(false), showNewMeetingPopup = _c[0], setShowNewMeetingPopup = _c[1];
    var _d = (0, react_1.useState)(false), showEditModal = _d[0], setShowEditModal = _d[1];
    var _e = (0, react_1.useState)(null), editingMeeting = _e[0], setEditingMeeting = _e[1];
    var _f = (0, react_1.useState)(null), selectedUserId = _f[0], setSelectedUserId = _f[1];
    var _g = (0, react_1.useState)(false), showUserDetails = _g[0], setShowUserDetails = _g[1];
    var _h = (0, react_1.useState)([]), selectedMeetings = _h[0], setSelectedMeetings = _h[1];
    var _j = (0, react_1.useState)("all"), filterStatus = _j[0], setFilterStatus = _j[1];
    var _k = (0, react_1.useState)("all"), filterType = _k[0], setFilterType = _k[1];
    var _l = (0, react_1.useState)({
        title: "",
        description: "",
        type: "online",
        assignedTo: "",
        assignedToId: "",
        startDate: "",
        endDate: "",
        location: "",
        meetingLink: "",
        attendees: [],
        tags: [],
        projectId: "none"
    }), newMeeting = _l[0], setNewMeeting = _l[1];
    var _m = (0, react_1.useState)([]), assignedToSuggestions = _m[0], setAssignedToSuggestions = _m[1];
    var _o = (0, react_1.useState)(false), showAssignedToSuggestions = _o[0], setShowAssignedToSuggestions = _o[1];
    var _p = (0, react_1.useState)([]), attendeeSuggestions = _p[0], setAttendeeSuggestions = _p[1];
    var _q = (0, react_1.useState)(false), showAttendeeSuggestions = _q[0], setShowAttendeeSuggestions = _q[1];
    var _r = (0, react_1.useState)(""), newTag = _r[0], setNewTag = _r[1];
    var _s = (0, react_1.useState)([]), users = _s[0], setUsers = _s[1];
    var _t = (0, react_1.useState)([]), projects = _t[0], setProjects = _t[1];
    var _u = (0, react_1.useState)([]), teams = _u[0], setTeams = _u[1];
    var _v = (0, react_1.useState)([]), availableUsers = _v[0], setAvailableUsers = _v[1];
    var _w = (0, react_1.useState)(false), loading = _w[0], setLoading = _w[1];
    var _x = (0, react_1.useState)([]), meetings = _x[0], setMeetings = _x[1];
    var _y = (0, react_1.useState)({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    }), pagination = _y[0], setPagination = _y[1];
    // Load meetings from API
    // Handle user avatar click
    var handleUserAvatarClick = function (userId) {
        console.log('Meetings avatar clicked for user ID:', userId);
        setSelectedUserId(userId);
        setShowUserDetails(true);
        console.log('Modal should open now');
    };
    var loadMeetings = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var filters, response, allMeetings, authorizedMeetings, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    filters = {
                        status: filterStatus !== "all" ? filterStatus : undefined,
                        type: filterType !== "all" ? filterType : undefined,
                        page: pagination.page,
                        limit: pagination.limit
                    };
                    return [4 /*yield*/, meetingService_1.default.getMeetings(filters)];
                case 1:
                    response = _a.sent();
                    allMeetings = response.meetings || [];
                    authorizedMeetings = allMeetings.filter(function (meeting) {
                        var _a, _b;
                        if (!user || !user.id)
                            return false;
                        // Show meetings where current user is assigned to or assigned by
                        return ((_a = meeting.assignedTo) === null || _a === void 0 ? void 0 : _a.id) === user.id || ((_b = meeting.assignedBy) === null || _b === void 0 ? void 0 : _b.id) === user.id;
                    });
                    setMeetings(authorizedMeetings);
                    if (response.pagination) {
                        setPagination(response.pagination);
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error loading meetings:', error_1);
                    sonner_1.toast.error(error_1.message || 'Failed to load meetings');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [filterStatus, filterType, pagination.page, pagination.limit, user]);
    // Load meetings on component mount and when filters change
    (0, react_1.useEffect)(function () {
        console.log('Meetings useEffect triggered:', { user: user === null || user === void 0 ? void 0 : user.id, filterStatus: filterStatus, filterType: filterType });
        if (user && user.id) {
            loadMeetings();
        }
    }, [filterStatus, filterType, user]);
    // Mark meeting notifications as read when user visits this page
    (0, react_1.useEffect)(function () {
        if (user && user.id) {
            markAsReadByType('meetings');
        }
    }, [user, markAsReadByType]);
    // Handle navigation state for opening modal
    (0, react_1.useEffect)(function () {
        var _a, _b;
        if (((_a = location.state) === null || _a === void 0 ? void 0 : _a.openModal) && ((_b = location.state) === null || _b === void 0 ? void 0 : _b.date)) {
            var date_1 = new Date(location.state.date);
            setNewMeeting(function (prev) { return (__assign(__assign({}, prev), { startDate: date_1.toISOString().split('T')[0], endDate: date_1.toISOString().split('T')[0] })); });
            setShowNewMeetingPopup(true);
        }
    }, [location.state]);
    // Load friends from API
    var loadUsers = function () { return __awaiter(void 0, void 0, void 0, function () {
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
                        avatar: friendship.friend.avatar || "https://ui-avatars.com/api/?name=".concat(encodeURIComponent(friendship.friend.username), "&background=random&color=fff&size=128")
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
    }); };
    // Load projects from API
    var loadProjects = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, projectService_1.default.getProjects({ limit: 100 })];
                case 1:
                    response = _a.sent();
                    setProjects(response.projects || []);
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error loading projects:', error_3);
                    sonner_1.toast.error('Failed to load projects');
                    setProjects([]);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Load teams from API
    var loadTeams = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, teamService_1.default.getTeams({ limit: 100 })];
                case 1:
                    response = _a.sent();
                    setTeams(response.teams || []);
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error loading teams:', error_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Load team members
    var loadTeamMembers = function (teamId) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!teamId) {
                        setAvailableUsers(users);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, teamService_1.default.getTeamMembers(teamId)];
                case 2:
                    response = _a.sent();
                    setAvailableUsers(response.members || []);
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error('Error loading team members:', error_5);
                    setAvailableUsers(users);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Update available users based on project selection
    var updateAvailableUsers = (0, react_1.useCallback)(function () {
        if (newMeeting.projectId && newMeeting.projectId !== "none") {
            // Find the selected project
            var selectedProject = projects.find(function (p) { return p.id === newMeeting.projectId; });
            if (selectedProject && selectedProject.teamId) {
                // If project has a team, load team members
                loadTeamMembers(selectedProject.teamId);
            }
            else {
                // If no team, show all users
                setAvailableUsers(users);
            }
        }
        else {
            // If no project selected, show all users
            setAvailableUsers(users);
        }
    }, [newMeeting.projectId, projects, users]);
    // Load users and projects on component mount
    (0, react_1.useEffect)(function () {
        loadUsers();
        loadProjects();
        loadTeams();
    }, []);
    // Initialize available users when users are loaded
    (0, react_1.useEffect)(function () {
        setAvailableUsers(users);
    }, [users]);
    // Update available users when project changes
    (0, react_1.useEffect)(function () {
        updateAvailableUsers();
    }, [updateAvailableUsers]);
    var filteredMeetings = meetings.filter(function (meeting) {
        var matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (meeting.description && meeting.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (meeting.assignedTo && meeting.assignedTo.username && meeting.assignedTo.username.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });
    var handleAssignedToChange = function (value) { return __awaiter(void 0, void 0, void 0, function () {
        var filtered;
        return __generator(this, function (_a) {
            setNewMeeting(__assign(__assign({}, newMeeting), { assignedTo: value, assignedToId: "" }));
            if (value.length > 0) {
                filtered = availableUsers.filter(function (user) {
                    return (user.username || user.name).toLowerCase().includes(value.toLowerCase()) ||
                        user.email.toLowerCase().includes(value.toLowerCase());
                });
                setAssignedToSuggestions(filtered);
                setShowAssignedToSuggestions(true);
            }
            else {
                setShowAssignedToSuggestions(false);
            }
            return [2 /*return*/];
        });
    }); };
    var selectUser = function (user) {
        setNewMeeting(__assign(__assign({}, newMeeting), { assignedTo: user.username || user.name, assignedToId: user.id }));
        setShowAssignedToSuggestions(false);
    };
    var handleSelectAll = function () {
        if (selectedMeetings.length === filteredMeetings.length) {
            setSelectedMeetings([]);
        }
        else {
            setSelectedMeetings(filteredMeetings.map(function (meeting) { return meeting.id; }));
        }
    };
    var handleSelectMeeting = function (meetingId) {
        if (selectedMeetings.includes(meetingId)) {
            setSelectedMeetings(selectedMeetings.filter(function (id) { return id !== meetingId; }));
        }
        else {
            setSelectedMeetings(__spreadArray(__spreadArray([], selectedMeetings, true), [meetingId], false));
        }
    };
    var handleBulkDelete = function () {
        if (selectedMeetings.length === 0) {
            sonner_1.toast.error("No meetings selected");
            return;
        }
        setMeetings(meetings.filter(function (meeting) { return !selectedMeetings.includes(meeting.id); }));
        setSelectedMeetings([]);
        sonner_1.toast.success("".concat(selectedMeetings.length, " meeting(s) deleted successfully!"));
    };
    var getTypeColor = function (type) {
        switch (type) {
            case "online": return "text-white bg-gray-500 border border-gray-500 px-4 py-2 min-w-[80px]";
            case "in-person": return "text-white bg-green-500 border border-green-500 px-4 py-2 min-w-[80px]";
            case "hybrid": return "text-white bg-yellow-500 border border-yellow-500 px-4 py-2 min-w-[80px]";
            default: return "text-white bg-yellow-500 border border-yellow-500 px-4 py-2 min-w-[80px]";
        }
    };
    var getStatusColor = function (status) {
        switch (status) {
            case "completed": return "text-white bg-green-500 border border-green-500 px-4 py-2 min-w-[100px]";
            case "pregress": return "text-white bg-gray-500 border border-gray-500 px-4 py-2 min-w-[100px]";
            case "scheduled": return "text-white bg-yellow-500 border border-yellow-500 px-4 py-2 min-w-[100px]";
            case "cancelled": return "text-white bg-red-500 border border-red-500 px-4 py-2 min-w-[100px]";
            default: return "text-white bg-yellow-500 border border-yellow-500 px-4 py-2 min-w-[100px]";
        }
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case "completed": return (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-4 h-4 icon icon" });
            case "pregress": return (0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "w-4 h-4 icon icon" });
            case "scheduled": return (0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "w-4 h-4 icon icon" });
            case "cancelled": return (0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "w-4 h-4 icon icon" });
            default: return (0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "w-4 h-4 icon icon" });
        }
    };
    var handleNewMeeting = function () { return __awaiter(void 0, void 0, void 0, function () {
        var meetingData, response, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!newMeeting.title.trim()) {
                        sonner_1.toast.error("Please enter a meeting title");
                        return [2 /*return*/];
                    }
                    if (!newMeeting.assignedTo.trim() || !newMeeting.assignedToId) {
                        sonner_1.toast.error("Please select a person to assign the meeting to");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    setLoading(true);
                    meetingData = {
                        title: newMeeting.title,
                        description: newMeeting.description,
                        type: newMeeting.type,
                        assignedTo: newMeeting.assignedToId,
                        startDate: newMeeting.startDate,
                        endDate: newMeeting.endDate,
                        location: newMeeting.location,
                        meetingLink: newMeeting.meetingLink,
                        attendees: newMeeting.attendees.map(function (attendee) { return attendee.id; }),
                        tags: newMeeting.tags,
                        projectId: newMeeting.projectId && newMeeting.projectId !== "none" ? newMeeting.projectId : undefined
                    };
                    return [4 /*yield*/, meetingService_1.default.createMeeting(meetingData)
                        // Reload meetings to get the updated list
                    ];
                case 2:
                    response = _a.sent();
                    // Reload meetings to get the updated list
                    return [4 /*yield*/, loadMeetings()];
                case 3:
                    // Reload meetings to get the updated list
                    _a.sent();
                    setNewMeeting({
                        title: "",
                        description: "",
                        type: "online",
                        assignedTo: "",
                        assignedToId: "",
                        startDate: "",
                        endDate: "",
                        location: "",
                        meetingLink: "",
                        attendees: [],
                        tags: [],
                        projectId: "none"
                    });
                    setShowNewMeetingPopup(false);
                    sonner_1.toast.success("Meeting created successfully!");
                    return [3 /*break*/, 6];
                case 4:
                    error_6 = _a.sent();
                    console.error('Error creating meeting:', error_6);
                    sonner_1.toast.error(error_6.message || 'Failed to create meeting');
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteMeeting = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, meetingService_1.default.deleteMeeting(id)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, loadMeetings()]; // Reload meetings after deletion
                case 2:
                    _a.sent(); // Reload meetings after deletion
                    sonner_1.toast.success("Meeting deleted successfully!");
                    return [3 /*break*/, 5];
                case 3:
                    error_7 = _a.sent();
                    console.error('Error deleting meeting:', error_7);
                    sonner_1.toast.error(error_7.message || 'Failed to delete meeting');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleStatusChange = function (meetingId, newStatus) { return __awaiter(void 0, void 0, void 0, function () {
        var error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, meetingService_1.default.updateMeetingStatus(meetingId, newStatus)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, loadMeetings()]; // Reload meetings after status change
                case 2:
                    _a.sent(); // Reload meetings after status change
                    sonner_1.toast.success("Meeting ".concat(newStatus === 'completed' ? 'completed' : 'cancelled', " successfully!"));
                    return [3 /*break*/, 5];
                case 3:
                    error_8 = _a.sent();
                    console.error('Error updating meeting status:', error_8);
                    sonner_1.toast.error(error_8.message || 'Failed to update meeting status');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleStatusChangeWithConfirmation = function (meetingId, newStatus, meetingTitle) { return __awaiter(void 0, void 0, void 0, function () {
        var action, confirmed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    action = newStatus === 'completed' ? 'complete' : 'cancel';
                    confirmed = window.confirm("Are you sure you want to ".concat(action, " the meeting \"").concat(meetingTitle, "\"?"));
                    if (!confirmed) return [3 /*break*/, 2];
                    return [4 /*yield*/, handleStatusChange(meetingId, newStatus)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    // Handle attendee selection
    var handleAttendeeSearch = function (value) {
        if (value.length > 0) {
            var filtered = availableUsers.filter(function (user) {
                return user.username.toLowerCase().includes(value.toLowerCase()) &&
                    !newMeeting.attendees.some(function (attendee) { return attendee.id === user.id; });
            });
            setAttendeeSuggestions(filtered);
            setShowAttendeeSuggestions(true);
        }
        else {
            setAttendeeSuggestions([]);
            setShowAttendeeSuggestions(false);
        }
    };
    var handleAddAttendee = function (user) {
        if (!newMeeting.attendees.some(function (attendee) { return attendee.id === user.id; })) {
            setNewMeeting(__assign(__assign({}, newMeeting), { attendees: __spreadArray(__spreadArray([], newMeeting.attendees, true), [user], false) }));
        }
        setShowAttendeeSuggestions(false);
        setAttendeeSuggestions([]);
    };
    var handleRemoveAttendee = function (userId) {
        setNewMeeting(__assign(__assign({}, newMeeting), { attendees: newMeeting.attendees.filter(function (attendee) { return attendee.id !== userId; }) }));
    };
    // Handle tag management
    var handleAddTag = function () {
        if (newTag.trim() && !newMeeting.tags.includes(newTag.trim())) {
            setNewMeeting(__assign(__assign({}, newMeeting), { tags: __spreadArray(__spreadArray([], newMeeting.tags, true), [newTag.trim()], false) }));
            setNewTag("");
        }
    };
    var handleRemoveTag = function (tagToRemove) {
        setNewMeeting(__assign(__assign({}, newMeeting), { tags: newMeeting.tags.filter(function (tag) { return tag !== tagToRemove; }) }));
    };
    // Edit meeting functions
    var handleEditMeeting = function (meeting) {
        setEditingMeeting(meeting);
        setShowEditModal(true);
    };
    var handleMeetingUpdated = function (updatedMeeting) {
        setMeetings(function (prevMeetings) {
            return prevMeetings.map(function (meeting) {
                return meeting.id === updatedMeeting.id ? updatedMeeting : meeting;
            });
        });
        setShowEditModal(false);
        setEditingMeeting(null);
    };
    var handleCloseEditModal = function () {
        setShowEditModal(false);
        setEditingMeeting(null);
    };
    var containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.1,
                staggerChildren: 0.1
            }
        }
    };
    var itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };
    var handleJoinMeeting = function (meetingLink) {
        window.open(meetingLink, '_blank');
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "overflow-hidden pt-6", children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { className: "mx-auto", variants: containerVariants, initial: "hidden", animate: "visible", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { variants: itemVariants, className: "mb-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { variants: itemVariants, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative flex-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 icon z-50 icon" }), (0, jsx_runtime_1.jsx)(input_1.Input, { type: "text", placeholder: "Search meetings...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "w-[500px] pl-10 pr-4 py-3 border border-gray-200 h-13 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3", children: [(0, jsx_runtime_1.jsxs)(select_1.Select, { value: filterStatus, onValueChange: setFilterStatus, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-[180px] px-5 h-13 bg-white cursor-pointer dark:bg-black dark:text-white", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "All Status" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { className: "bg-white dark:bg-black  border-gray-200 dark:border-gray-700", children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'cursor-pointer h-10 px-5', value: "all", children: "All Status" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'cursor-pointer h-10 px-5', value: "scheduled", children: "Scheduled" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'cursor-pointer h-10 px-5', value: "pregress", children: "In Progress" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'cursor-pointer h-10 px-5', value: "completed", children: "Completed" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'cursor-pointer h-10 px-5', value: "cancelled", children: "Cancelled" })] })] }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: filterType, onValueChange: setFilterType, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-[180px] px-5 h-13 bg-white cursor-pointer dark:bg-black dark:text-white", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "All Types" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { className: "bg-white dark:bg-black  border-gray-200 dark:border-gray-700", children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'cursor-pointer h-10 px-5', value: "all", children: "All Types" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'cursor-pointer h-10 px-5', value: "online", children: "Online" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'cursor-pointer h-10 px-5', value: "in-person", children: "In Person" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'cursor-pointer h-10 px-5', value: "hybrid", children: "Hybrid" })] })] })] })] }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [selectedMeetings.length > 0 && ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.button, { onClick: handleBulkDelete, className: "flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-[30px]  hover:bg-red-700 transition-colors", initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "w-4 h-4 icon icon" }), "Delete (", selectedMeetings.length, ")"] })), permissions.canCreateMeeting && (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: function () {
                                            if (!permissions.canCreateMeeting) {
                                                sonner_1.toast.error('You do not have permission to create meetings. Contact an admin.');
                                                return;
                                            }
                                            setShowNewMeetingPopup(true);
                                        }, className: 'w-[200px] rounded-[10px] h-12 font-bold', children: "Schedule Meeting" })] })] }) }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { variants: itemVariants, className: "bg-white dark:bg-black rounded-[10px] shadow-xl overflow-hidden", children: (0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800", children: (0, jsx_runtime_1.jsxs)("table", { className: "w-full", children: [(0, jsx_runtime_1.jsx)("thead", { className: "bg-gray-100 text-black border-gray-200 dark:border-gray-700 sticky top-0 z-10", children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Meeting" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Type" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Status" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Assigned To" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Attendees" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Project" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Date & Time" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Location" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: loading ? ((0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { colSpan: "10", className: "px-6 py-8 text-center", children: (0, jsx_runtime_1.jsx)(HorizontalLoader_1.default, { message: "Loading meetings...", subMessage: "Fetching your meeting schedule", progress: 70, className: "py-4" }) }) })) : filteredMeetings.length === 0 ? ((0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { colSpan: "10", className: "px-6 py-8 text-center text-gray-500 dark:text-gray-400", children: "No meetings found" }) })) : (filteredMeetings.map(function (meeting) {
                                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                                        return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.tr, { className: "hover:bg-gray-50 dark:hover:bg-black transition-colors ".concat(selectedMeetings.includes(meeting.id) ? 'bg-gray-100 dark:bg-black' : ''), initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 }, children: [(0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4", children: (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm  text-gray-900 dark:text-white truncate font-bold", children: meeting.title }) }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4", children: (0, jsx_runtime_1.jsxs)("span", { className: "inline-flex items-center rounded-[30px] uppercase text-xs  truncate ".concat(getTypeColor(meeting.type)), children: [meeting.type === 'online' && (0, jsx_runtime_1.jsx)(lucide_react_1.Video, { className: "w-4 h-4 icon mr-1 icon" }), meeting.type === 'in-person' && (0, jsx_runtime_1.jsx)(lucide_react_1.MapPin, { className: "w-4 h-4 icon mr-1 icon" }), meeting.type === 'hybrid' && (0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "w-4 h-4 icon mr-1 icon" }), meeting.type.replaceAll("-", " ")] }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)("span", { className: "inline-flex items-center gap-1 rounded-[30px] text-xs  truncate uppercase ".concat(getStatusColor(meeting.status)), children: [getStatusIcon(meeting.status), meeting.status] }), meeting.status === 'scheduled' && ((0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1", children: [(0, jsx_runtime_1.jsx)("button", { onClick: function () { return handleStatusChangeWithConfirmation(meeting.id, 'completed', meeting.title); }, className: "p-1 rounded-full bg-green-100 w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 transition-colors", title: "Mark as Completed", children: (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-4 h-4 icon text-green-600 dark:text-green-400" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: function () { return handleStatusChangeWithConfirmation(meeting.id, 'cancelled', meeting.title); }, className: "p-1 rounded-full bg-red-100 w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors", title: "Cancel Meeting", children: (0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "w-4 h-4 icon text-red-600 dark:text-red-400" }) })] })), meeting.status === 'completed' && ((0, jsx_runtime_1.jsx)("button", { onClick: function () { return handleStatusChangeWithConfirmation(meeting.id, 'cancelled', meeting.title); }, className: "p-1 rounded-full bg-red-100 w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors", title: "Mark as Cancelled", children: (0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "w-4 h-4 icon text-red-600 dark:text-red-400" }) })), meeting.status === 'cancelled' && ((0, jsx_runtime_1.jsx)("button", { onClick: function () { return handleStatusChangeWithConfirmation(meeting.id, 'completed', meeting.title); }, className: "p-1 rounded-full bg-green-100 w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 transition-colors", title: "Mark as Completed", children: (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-4 h-4 icon text-green-600 dark:text-green-400" }) }))] }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 w-[200px] rounded-[30px]", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)((_a = meeting.assignedTo) === null || _a === void 0 ? void 0 : _a.avatar, (_b = meeting.assignedTo) === null || _b === void 0 ? void 0 : _b.username), { alt: ((_c = meeting.assignedTo) === null || _c === void 0 ? void 0 : _c.username) || "User", className: "w-8 h-8 rounded-[30px] object-cover  border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform", onClick: function () { var _a; return ((_a = meeting.assignedTo) === null || _a === void 0 ? void 0 : _a.id) && handleUserAvatarClick(meeting.assignedTo.id); }, title: ((_d = meeting.assignedTo) === null || _d === void 0 ? void 0 : _d.username) ? "View ".concat(meeting.assignedTo.username, "'s profile") : '' })), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium text-gray-900 dark:text-white truncate", children: ((_e = meeting.assignedTo) === null || _e === void 0 ? void 0 : _e.username) || "Unknown User" }) })] }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 w-[200px] rounded-[30px]", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-1", children: [meeting.attendees && meeting.attendees.length > 0 ? (meeting.attendees.map(function (attendee, index) { return ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-1", children: (0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)(attendee.avatar, attendee.username), { alt: attendee.username || "User", className: "w-6 h-6 rounded-[30px] object-cover border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform", onClick: function () { return attendee.id && handleUserAvatarClick(attendee.id); }, title: attendee.username ? "View ".concat(attendee.username, "'s profile") : '' })) }, index)); })) : ((0, jsx_runtime_1.jsx)("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: "No attendees" })), meeting.attendees && meeting.attendees.length > 3 && ((0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 rounded-[30px] bg-gray-100 dark:bg-gray-700 flex items-center justify-center", children: (0, jsx_runtime_1.jsxs)("span", { className: "text-xs text-gray-600 dark:text-gray-300", children: ["+", meeting.attendees.length - 3] }) }))] }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 w-[200px] rounded-[30px]", children: meeting.project ? ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-2", children: (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-900 dark:text-white truncate", children: meeting.project.name }) })) : ((0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-500 dark:text-gray-400 truncate", children: "No Project" })) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "w-4 h-4 icon text-gray-400 icon" }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-900 dark:text-white", children: meeting.startDate ? new Date(meeting.startDate).toLocaleDateString() : 'N/A' }) })] }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4", children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-900 dark:text-white truncate", children: meeting.location }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-end gap-2", children: [user && user.id && ((_f = meeting.assignedBy) === null || _f === void 0 ? void 0 : _f.id) === user.id && ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEditMeeting(meeting); }, className: "p-2 text-gray-400 hover:text-black dark:hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "w-4 h-4 icon icon" }) })), user && user.id && ((_g = meeting.assignedBy) === null || _g === void 0 ? void 0 : _g.id) === user.id && ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDeleteMeeting(meeting.id); }, className: "p-2 text-gray-400 hover:text-red-600", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "w-4 h-4 icon icon" }) })), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", className: "p-2 text-gray-400 h-10 hover:text-black dark:hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.MoreVertical, { className: "w-4 h-4 icon icon" }) }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "bg-white dark:bg-black  border-gray-200 dark:border-gray-700", children: [user && user.id && ((_h = meeting.assignedBy) === null || _h === void 0 ? void 0 : _h.id) === user.id && ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleEditMeeting(meeting); }, className: "text-black h-12 px-5 cursor-pointer dark:text-white hover:bg-gray-100 dark:hover:bg-black", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "w-4 h-4 icon mr-2 icon" }), "Edit Meeting"] })), user && user.id && ((_j = meeting.assignedBy) === null || _j === void 0 ? void 0 : _j.id) === user.id && ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleEditMeeting(meeting); }, className: "text-black dark:text-white h-12 px-5 cursor-pointer hover:bg-gray-100 dark:hover:bg-black", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "w-4 h-4 icon mr-2 icon" }), "Reschedule"] })), meeting.status === 'scheduled' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleStatusChangeWithConfirmation(meeting.id, 'completed', meeting.title); }, className: "text-green-600 dark:text-green-400 h-12 px-5 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/20", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-4 h-4 icon mr-2 icon" }), "Mark as Completed"] }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleStatusChangeWithConfirmation(meeting.id, 'cancelled', meeting.title); }, className: "text-red-600 dark:text-red-400 h-12 px-5 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "w-4 h-4 icon mr-2 icon" }), "Cancel Meeting"] })] })), meeting.status === 'completed' && ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleStatusChangeWithConfirmation(meeting.id, 'cancelled', meeting.title); }, className: "text-red-600 dark:text-red-400 h-12 px-5 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "w-4 h-4 icon mr-2 icon" }), "Mark as Cancelled"] })), meeting.status === 'cancelled' && ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleStatusChangeWithConfirmation(meeting.id, 'completed', meeting.title); }, className: "text-green-600 dark:text-green-400 h-12 px-5 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/20", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-4 h-4 icon mr-2 icon" }), "Mark as Completed"] })), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { className: "text-black dark:text-white h-12 px-5 cursor-pointer hover:bg-gray-100 dark:hover:bg-black", onClick: function () { return handleJoinMeeting(meeting.meetingLink); }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Video, { className: "w-4 h-4 icon mr-2 icon" }), "Join Meeting"] }), user && user.id && ((_k = meeting.assignedBy) === null || _k === void 0 ? void 0 : _k.id) === user.id && ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleDeleteMeeting(meeting.id); }, className: "text-red-600 hover:bg-red-500 hover:text-white px-5 h-12 cursor-pointer dark:hover:bg-red-900", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "w-4 h-4 icon mr-2 icon" }), "Delete Meeting"] }))] })] })] }) })] }, meeting.id));
                                    })) })] }) }) }), showNewMeetingPopup && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 backdrop-blur-sm bg-opacity-50 bg-black/50 icon flex items-center justify-center p-4 z-50", onClick: function () { return setShowNewMeetingPopup(false); }, children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: " bg-white dark:bg-black rounded-[10px] shadow-2xl border-gray-200 dark:border-gray-700 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto", onClick: function (e) { return e.stopPropagation(); }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { type: "text", value: newMeeting.title, onChange: function (e) { return setNewMeeting(__assign(__assign({}, newMeeting), { title: e.target.value })); }, className: "w-full  border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white", placeholder: "Enter meeting title" }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { value: newMeeting.description, onChange: function (e) { return setNewMeeting(__assign(__assign({}, newMeeting), { description: e.target.value })); }, className: "w-full  border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white", placeholder: "Enter meeting description", rows: "3" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(select_1.Select, { value: newMeeting.type, onValueChange: function (value) { return setNewMeeting(__assign(__assign({}, newMeeting), { type: value })); }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-full  border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Select meeting type" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { className: "bg-white dark:bg-black  border-gray-200 dark:border-gray-700", children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'cursor-pointer h-10 px-5', value: "online", children: "Online" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'cursor-pointer h-10 px-5', value: "in-person", children: "in-person" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'cursor-pointer h-10 px-5', value: "hybrid", children: "Hybrid" })] })] }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { type: "text", value: newMeeting.location, onChange: function (e) { return setNewMeeting(__assign(__assign({}, newMeeting), { location: e.target.value })); }, className: "w-full  border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white", placeholder: "Enter location or platform" }) })] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { type: "text", value: newMeeting.assignedTo, onChange: function (e) { return handleAssignedToChange(e.target.value); }, onFocus: function () {
                                                        if (newMeeting.assignedTo.length > 0) {
                                                            setShowAssignedToSuggestions(true);
                                                        }
                                                    }, className: "w-full  border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white", placeholder: "Assign To Person" }), showAssignedToSuggestions && assignedToSuggestions.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "absolute z-10 w-full mt-1 bg-white dark:bg-black  border-gray-200 dark:border-gray-700 rounded-[30px] shadow-lg max-h-48 overflow-y-auto", children: assignedToSuggestions.map(function (user) { return ((0, jsx_runtime_1.jsx)("div", { onClick: function () { return selectUser(user); }, className: "px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)(user.avatar, user.username || user.name), { alt: user.name, className: "w-8 h-8 rounded-[30px] object-cover  border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform", onClick: function (e) {
                                                                        e.stopPropagation();
                                                                        handleUserAvatarClick(user.id);
                                                                    }, title: user.username || user.name ? "View ".concat(user.username || user.name, "'s profile") : '' })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "font-medium text-gray-900 dark:text-white", children: user.name }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: user.email })] })] }) }, user.id)); }) }))] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm  text-gray-700 dark:text-gray-300 mb-2", children: "Start Date" }), (0, jsx_runtime_1.jsx)(input_1.Input, { type: "date", value: newMeeting.startDate, onChange: function (e) { return setNewMeeting(__assign(__assign({}, newMeeting), { startDate: e.target.value })); }, className: "w-full  border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm  text-gray-700 dark:text-gray-300 mb-2", children: "End Date" }), (0, jsx_runtime_1.jsx)(input_1.Input, { type: "date", value: newMeeting.endDate, onChange: function (e) { return setNewMeeting(__assign(__assign({}, newMeeting), { endDate: e.target.value })); }, className: "w-full  border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white" })] })] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { type: "url", value: newMeeting.meetingLink, onChange: function (e) { return setNewMeeting(__assign(__assign({}, newMeeting), { meetingLink: e.target.value })); }, className: "w-full  border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white", placeholder: "Enter meeting link" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { type: "text", placeholder: "Search and add attendees...", onChange: function (e) { return handleAttendeeSearch(e.target.value); }, onFocus: function () {
                                                            if (attendeeSuggestions.length > 0) {
                                                                setShowAttendeeSuggestions(true);
                                                            }
                                                        }, className: "w-full  border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white" }), showAttendeeSuggestions && attendeeSuggestions.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "absolute z-10 w-full mt-1 bg-white dark:bg-black  border-gray-200 dark:border-gray-700 rounded-[30px] shadow-lg max-h-48 overflow-y-auto", children: attendeeSuggestions.map(function (user) { return ((0, jsx_runtime_1.jsx)("div", { onClick: function () { return handleAddAttendee(user); }, className: "px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)(user.avatar, user.username || user.name), { alt: user.name, className: "w-8 h-8 rounded-[30px] object-cover  border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform", onClick: function (e) {
                                                                            e.stopPropagation();
                                                                            handleUserAvatarClick(user.id);
                                                                        }, title: user.username || user.name ? "View ".concat(user.username || user.name, "'s profile") : '' })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "font-medium text-gray-900 dark:text-white", children: user.name }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: user.email })] })] }) }, user.id)); }) }))] }), newMeeting.attendees.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "mt-3", children: (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: newMeeting.attendees.map(function (attendee) { return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-[30px]", children: [(0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)(attendee.avatar, attendee.username || attendee.name), { alt: attendee.name, className: "w-6 h-6 rounded-[30px] object-cover cursor-pointer hover:scale-110 transition-transform", onClick: function () { return attendee.id && handleUserAvatarClick(attendee.id); }, title: attendee.username || attendee.name ? "View ".concat(attendee.username || attendee.name, "'s profile") : '' })), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-900 dark:text-white", children: attendee.name }), (0, jsx_runtime_1.jsx)("button", { onClick: function () { return handleRemoveAttendee(attendee.id); }, className: "text-gray-500 hover:text-red-500", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-4 h-4 icon icon" }) })] }, attendee.id)); }) }) }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { type: "text", value: newTag, onChange: function (e) { return setNewTag(e.target.value); }, onKeyPress: function (e) { return e.key === 'Enter' && handleAddTag(); }, className: "flex-1  border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white", placeholder: "Add a tag and press Enter" }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", onClick: handleAddTag, className: (0, uiConstants_1.getButtonClasses)('secondary', 'sm', 'w-12 dark:bg-white dark:text-black'), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "w-4 h-4 icon icon" }) })] }), newMeeting.tags.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "mt-3", children: (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: newMeeting.tags.map(function (tag, index) { return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 bg-gray-100 dark:bg-black px-3 py-1 rounded-[30px]", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-900 dark:text-gray-100", children: tag }), (0, jsx_runtime_1.jsx)("button", { onClick: function () { return handleRemoveTag(tag); }, className: "text-gray-500 hover:text-red-500", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-3 h-3 icon icon" }) })] }, index)); }) }) }))] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(select_1.Select, { value: newMeeting.projectId, onValueChange: function (value) { return setNewMeeting(__assign(__assign({}, newMeeting), { projectId: value })); }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-full  border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Select project (optional)" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { className: "bg-white dark:bg-black  border-gray-200 dark:border-gray-700", children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'cursor-pointer h-10 px-5', value: "none", children: "No Project" }), projects.map(function (project) { return ((0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'cursor-pointer h-10 px-5', value: project.id, children: project.name }, project.id)); })] })] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3 mt-6 text-white dark:text-black", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { onClick: function () { return setShowNewMeetingPopup(false); }, className: (0, uiConstants_1.getButtonClasses)('outline', 'md', 'flex-1 text-black bg-white dark:bg-black'), children: "Cancel" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleNewMeeting, disabled: loading, className: "".concat((0, uiConstants_1.getButtonClasses)('primary', 'md', 'flex-1'), " disabled:opacity-50 disabled:cursor-not-allowed"), children: loading ? ((0, jsx_runtime_1.jsx)("span", { className: "loader w-5 h-5 icon" })) : ('Schedule') })] })] }) })), (0, jsx_runtime_1.jsx)(MeetingEditModal_1.default, { meeting: editingMeeting, isOpen: showEditModal, onClose: handleCloseEditModal, onMeetingUpdated: handleMeetingUpdated, users: users }), (0, jsx_runtime_1.jsx)(UserDetailsModal_1.default, { userId: selectedUserId, isOpen: showUserDetails, onClose: function () {
                        setShowUserDetails(false);
                        setSelectedUserId(null);
                    } })] }) }));
};
exports.default = Meetings;
