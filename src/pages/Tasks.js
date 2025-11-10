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
var taskService_1 = require("../services/taskService");
var userService_1 = require("../services/userService");
var projectService_1 = require("../services/projectService");
var teamService_1 = require("../services/teamService");
var friendService_1 = require("../services/friendService");
var AuthContext_1 = require("../contexts/AuthContext");
var NotificationContext_1 = require("../contexts/NotificationContext");
var avatarUtils_1 = require("../utils/avatarUtils");
var TaskEditModal_1 = require("../components/TaskEditModal");
var UserDetailsModal_1 = require("../components/UserDetailsModal");
var uiConstants_1 = require("../utils/uiConstants");
var Tasks = function () {
    var user = (0, AuthContext_1.useAuth)().user;
    var markAsReadByType = (0, NotificationContext_1.useNotifications)().markAsReadByType;
    var _a = (0, usePermissions_1.usePermissions)(), permissions = _a.permissions, permissionsLoading = _a.loading;
    var location = (0, react_router_dom_1.useLocation)();
    var _b = (0, react_1.useState)(""), searchTerm = _b[0], setSearchTerm = _b[1];
    var _c = (0, react_1.useState)(false), showNewTaskPopup = _c[0], setShowNewTaskPopup = _c[1];
    var _d = (0, react_1.useState)(false), showEditModal = _d[0], setShowEditModal = _d[1];
    var _e = (0, react_1.useState)(null), editingTask = _e[0], setEditingTask = _e[1];
    var _f = (0, react_1.useState)(null), selectedUserId = _f[0], setSelectedUserId = _f[1];
    var _g = (0, react_1.useState)(false), showUserDetails = _g[0], setShowUserDetails = _g[1];
    var _h = (0, react_1.useState)([]), selectedTasks = _h[0], setSelectedTasks = _h[1];
    var _j = (0, react_1.useState)("all"), filterStatus = _j[0], setFilterStatus = _j[1];
    var _k = (0, react_1.useState)("all"), filterPriority = _k[0], setFilterPriority = _k[1];
    var _l = (0, react_1.useState)({
        title: "",
        description: "",
        priority: "medium",
        assignedTo: "",
        assignedToId: "",
        dueDate: "",
        projectId: "none"
    }), newTask = _l[0], setNewTask = _l[1];
    var _m = (0, react_1.useState)([]), assignedToSuggestions = _m[0], setAssignedToSuggestions = _m[1];
    var _o = (0, react_1.useState)(false), showAssignedToSuggestions = _o[0], setShowAssignedToSuggestions = _o[1];
    var _p = (0, react_1.useState)(false), loading = _p[0], setLoading = _p[1];
    var _q = (0, react_1.useState)([]), tasks = _q[0], setTasks = _q[1];
    var _r = (0, react_1.useState)([]), users = _r[0], setUsers = _r[1];
    var _s = (0, react_1.useState)([]), projects = _s[0], setProjects = _s[1];
    var _t = (0, react_1.useState)([]), teams = _t[0], setTeams = _t[1];
    var _u = (0, react_1.useState)(""), selectedTeam = _u[0], setSelectedTeam = _u[1];
    var _v = (0, react_1.useState)([]), teamMembers = _v[0], setTeamMembers = _v[1];
    var _w = (0, react_1.useState)([]), availableUsers = _w[0], setAvailableUsers = _w[1];
    var _x = (0, react_1.useState)({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    }), pagination = _x[0], setPagination = _x[1];
    // Load tasks from API
    // Handle user avatar click
    var handleUserAvatarClick = function (userId) {
        console.log('Tasks avatar clicked for user ID:', userId);
        setSelectedUserId(userId);
        setShowUserDetails(true);
        console.log('Modal should open now');
    };
    var loadTasks = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var filters, response, allTasks, authorizedTasks, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    filters = {
                        status: filterStatus !== "all" ? filterStatus : undefined,
                        priority: filterPriority !== "all" ? filterPriority : undefined,
                        page: pagination.page,
                        limit: pagination.limit
                    };
                    return [4 /*yield*/, taskService_1.default.getTasks(filters)];
                case 1:
                    response = _a.sent();
                    allTasks = response.tasks || [];
                    authorizedTasks = allTasks.filter(function (task) {
                        var _a, _b;
                        if (!user || !user.id)
                            return false;
                        // Show tasks where current user is assigned to or assigned by
                        return ((_a = task.assignTo) === null || _a === void 0 ? void 0 : _a.id) === user.id || ((_b = task.assignedBy) === null || _b === void 0 ? void 0 : _b.id) === user.id;
                    });
                    setTasks(authorizedTasks);
                    if (response.pagination) {
                        setPagination(response.pagination);
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error loading tasks:', error_1);
                    sonner_1.toast.error(error_1.message || 'Failed to load tasks');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [filterStatus, filterPriority, pagination.page, pagination.limit, user]);
    // Load tasks on component mount and when filters change
    (0, react_1.useEffect)(function () {
        console.log('Tasks useEffect triggered:', { user: user === null || user === void 0 ? void 0 : user.id, filterStatus: filterStatus, filterPriority: filterPriority });
        if (user && user.id) {
            loadTasks();
        }
    }, [filterStatus, filterPriority, user]);
    // Mark task notifications as read when user visits this page
    (0, react_1.useEffect)(function () {
        if (user && user.id) {
            markAsReadByType('tasks');
        }
    }, [user, markAsReadByType]);
    // Handle navigation state for opening modal
    (0, react_1.useEffect)(function () {
        var _a, _b;
        if (((_a = location.state) === null || _a === void 0 ? void 0 : _a.openModal) && ((_b = location.state) === null || _b === void 0 ? void 0 : _b.date)) {
            var date_1 = new Date(location.state.date);
            setNewTask(function (prev) { return (__assign(__assign({}, prev), { dueDate: date_1.toISOString().split('T')[0] })); });
            setShowNewTaskPopup(true);
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
                        setTeamMembers([]);
                        setAvailableUsers(users);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, teamService_1.default.getTeamMembers(teamId)];
                case 2:
                    response = _a.sent();
                    setTeamMembers(response.members || []);
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
        if (newTask.projectId && newTask.projectId !== "none") {
            // Find the selected project
            var selectedProject = projects.find(function (p) { return p.id === newTask.projectId; });
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
    }, [newTask.projectId, projects, users]);
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
    var filteredTasks = tasks.filter(function (task) {
        var matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (task.assignTo && task.assignTo.username && task.assignTo.username.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });
    var handleSelectAll = function () {
        if (selectedTasks.length === filteredTasks.length) {
            setSelectedTasks([]);
        }
        else {
            setSelectedTasks(filteredTasks.map(function (task) { return task.id; }));
        }
    };
    var handleSelectTask = function (taskId) {
        if (selectedTasks.includes(taskId)) {
            setSelectedTasks(selectedTasks.filter(function (id) { return id !== taskId; }));
        }
        else {
            setSelectedTasks(__spreadArray(__spreadArray([], selectedTasks, true), [taskId], false));
        }
    };
    var handleBulkDelete = function () {
        if (selectedTasks.length === 0) {
            sonner_1.toast.error("No tasks selected");
            return;
        }
        setTasks(tasks.filter(function (task) { return !selectedTasks.includes(task.id); }));
        setSelectedTasks([]);
        sonner_1.toast.success("".concat(selectedTasks.length, " task(s) deleted successfully!"));
    };
    var handleAssignedToChange = function (value) { return __awaiter(void 0, void 0, void 0, function () {
        var filtered;
        return __generator(this, function (_a) {
            setNewTask(__assign(__assign({}, newTask), { assignedTo: value, assignedToId: "" }));
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
        setNewTask(__assign(__assign({}, newTask), { assignedTo: user.username || user.name, assignedToId: user.id }));
        setShowAssignedToSuggestions(false);
    };
    var getPriorityColor = function (priority) {
        switch (priority) {
            case "high": return "text-white bg-red-500 border border-red-500 px-4 py-2 min-w-[80px]";
            case "medium": return "text-white bg-yellow-500 border border-yellow-500 px-4 py-2 min-w-[80px]";
            case "low": return "text-white bg-green-500 border border-green-500 px-4 py-2 min-w-[80px]";
            default: return "text-white bg-green-500 border border-green-500 px-4 py-2 min-w-[80px]";
        }
    };
    var getStatusColor = function (status) {
        switch (status) {
            case "completed": return "text-white bg-green-500 border border-green-500 px-4 py-2 min-w-[100px]";
            case "in_progress": return "text-white bg-gray-500 border border-gray-500 px-4 py-2 min-w-[100px]";
            case "pending": return "text-white bg-yellow-500 border border-yellow-500 px-4 py-2 min-w-[100px]";
            case "cancelled": return "text-white bg-red-500 border border-red-500 px-4 py-2 min-w-[100px]";
            default: return "text-white bg-yellow-500 border border-yellow-500 px-4 py-2 min-w-[100px]";
        }
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case "completed": return (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-4 h-4 icon icon" });
            case "in_progress": return (0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "w-4 h-4 icon icon" });
            case "pending": return (0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "w-4 h-4 icon icon" });
            case "cancelled": return (0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "w-4 h-4 icon icon" });
            default: return (0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "w-4 h-4 icon icon" });
        }
    };
    var handleNewTask = function () { return __awaiter(void 0, void 0, void 0, function () {
        var taskData, response, cacheError_1, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!newTask.title.trim()) {
                        sonner_1.toast.error("Please enter a task title");
                        return [2 /*return*/];
                    }
                    if (!newTask.assignedTo.trim() || !newTask.assignedToId) {
                        sonner_1.toast.error("Please select a person to assign the task to");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, 9, 10]);
                    setLoading(true);
                    // Check if we have a valid user ID
                    if (!newTask.assignedToId) {
                        sonner_1.toast.error("Please select a user to assign the task to");
                        return [2 /*return*/];
                    }
                    taskData = {
                        title: newTask.title,
                        description: newTask.description,
                        assignTo: newTask.assignedToId, // Use the stored user ID
                        priority: newTask.priority,
                        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
                        projectId: newTask.projectId && newTask.projectId !== "none" ? newTask.projectId : undefined
                    };
                    return [4 /*yield*/, taskService_1.default.createTask(taskData)
                        // Clear caches to ensure fresh data
                    ];
                case 2:
                    response = _a.sent();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, taskService_1.default.clearTaskCaches()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    cacheError_1 = _a.sent();
                    console.warn('Cache clear failed:', cacheError_1);
                    return [3 /*break*/, 6];
                case 6: 
                // Reload tasks to get the updated list
                return [4 /*yield*/, loadTasks()];
                case 7:
                    // Reload tasks to get the updated list
                    _a.sent();
                    setNewTask({ title: "", description: "", priority: "medium", assignedTo: "", assignedToId: "", dueDate: "", projectId: "none" });
                    setShowNewTaskPopup(false);
                    sonner_1.toast.success("Task created successfully!");
                    return [3 /*break*/, 10];
                case 8:
                    error_6 = _a.sent();
                    console.error('Error creating task:', error_6);
                    sonner_1.toast.error(error_6.message || 'Failed to create task');
                    return [3 /*break*/, 10];
                case 9:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteTask = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, taskService_1.default.deleteTask(id)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, loadTasks()]; // Reload tasks after deletion
                case 2:
                    _a.sent(); // Reload tasks after deletion
                    sonner_1.toast.success("Task deleted successfully!");
                    return [3 /*break*/, 5];
                case 3:
                    error_7 = _a.sent();
                    console.error('Error deleting task:', error_7);
                    sonner_1.toast.error(error_7.message || 'Failed to delete task');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleStatusChange = function (taskId, newStatus) { return __awaiter(void 0, void 0, void 0, function () {
        var error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, taskService_1.default.updateTaskStatus(taskId, newStatus)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, loadTasks()]; // Reload tasks after status change
                case 2:
                    _a.sent(); // Reload tasks after status change
                    sonner_1.toast.success("Task status updated successfully!");
                    return [3 /*break*/, 5];
                case 3:
                    error_8 = _a.sent();
                    console.error('Error updating task status:', error_8);
                    sonner_1.toast.error(error_8.message || 'Failed to update task status');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Edit task functions
    var handleEditTask = function (task) {
        setEditingTask(task);
        setShowEditModal(true);
    };
    var handleTaskUpdated = function (updatedTask) {
        setTasks(function (prevTasks) {
            return prevTasks.map(function (task) {
                return task.id === updatedTask.id ? updatedTask : task;
            });
        });
        setShowEditModal(false);
        setEditingTask(null);
    };
    var handleCloseEditModal = function () {
        setShowEditModal(false);
        setEditingTask(null);
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
    document.title = "Tasks - Schedule & Manage";
    return ((0, jsx_runtime_1.jsx)("div", { className: "overflow-hidden pt-6", children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { className: "mx-auto", variants: containerVariants, initial: "hidden", animate: "visible", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { variants: itemVariants, className: "mb-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { variants: itemVariants, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative flex-1 max-w-3xl", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 icon z-10 icon" }), (0, jsx_runtime_1.jsx)(input_1.Input, { type: "text", placeholder: "Search tasks...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: (0, uiConstants_1.getInputClasses)('default', 'md', 'w-full pl-10 w-[500px] pr-4 h-13') })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3", children: [(0, jsx_runtime_1.jsxs)(select_1.Select, { value: filterStatus, onValueChange: setFilterStatus, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-[180px] px-5 h-13 h-13 bg-white dark:bg-black cursor-pointer dark:text-white", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "All Status" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { className: "bg-white dark:bg-black ", children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'h-10 cursor-pointer px-5', value: "all", children: "All Status" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'h-10 cursor-pointer px-5', value: "pending", children: "Pending" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'h-10 cursor-pointer px-5', value: "in_progress", children: "In Progress" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'h-10 cursor-pointer px-5', value: "completed", children: "Completed" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'h-10 cursor-pointer px-5', value: "cancelled", children: "Cancelled" })] })] }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: filterPriority, onValueChange: setFilterPriority, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-[180px] px-5 h-13 bg-white dark:bg-black cursor-pointer dark:text-white", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "All Priority" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { className: "bg-white dark:bg-black", children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'h-10 cursor-pointer px-5', value: "all", children: "All Priority" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'h-10 cursor-pointer px-5', value: "high", children: "High" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'h-10 cursor-pointer px-5', value: "medium", children: "Medium" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'h-10 cursor-pointer px-5', value: "low", children: "Low" })] })] })] })] }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [selectedTasks.length > 0 && ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.button, { onClick: handleBulkDelete, className: "flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-[30px]  hover:bg-red-700 transition-colors", initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "w-4 h-4 icon icon" }), "Delete (", selectedTasks.length, ")"] })), permissions.canCreateTask && (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: function () {
                                            if (!permissions.canCreateTask) {
                                                sonner_1.toast.error('You do not have permission to create tasks. Contact an admin.');
                                                return;
                                            }
                                            setShowNewTaskPopup(true);
                                        }, className: 'w-[200px] rounded-[10px] h-12 font-bold', children: "Schedule Task" })] })] }) }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { variants: itemVariants, className: "bg-white dark:bg-black rounded-[10px] shadow-xl overflow-hidden", children: (0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800", children: (0, jsx_runtime_1.jsxs)("table", { className: "w-full", children: [(0, jsx_runtime_1.jsx)("thead", { className: "bg-gray-100 text-black border-b dark:border-gray-700 sticky top-0 z-10", children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Task" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Priority" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Status" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Assigned To" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Assigned BY" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Project" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Due Date" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: loading ? ((0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { colSpan: "7", className: "px-6 py-8 text-center", children: (0, jsx_runtime_1.jsx)(HorizontalLoader_1.default, { message: "Loading tasks...", subMessage: "Fetching your task list", progress: 60, className: "py-4" }) }) })) : filteredTasks.length === 0 ? ((0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { colSpan: "10", className: "px-6 py-8 text-center text-gray-500 dark:text-gray-400", children: "No tasks found" }) })) : (filteredTasks.map(function (task) {
                                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
                                        return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.tr, { className: "hover:bg-gray-50 dark:hover:bg-black transition-colors ".concat(selectedTasks.includes(task.id) ? 'bg-gray-100 dark:bg-black' : ''), initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 }, children: [(0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4", children: (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm  text-gray-900 dark:text-white truncate font-bold", children: task.title }), user && user.id && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs px-2 py-1 rounded-[30px] uppercase  truncate ".concat(((_a = task.assignTo) === null || _a === void 0 ? void 0 : _a.id) === user.id
                                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'), children: ((_b = task.assignTo) === null || _b === void 0 ? void 0 : _b.id) === user.id ? 'to me' : 'by me' }))] }) }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4", children: (0, jsx_runtime_1.jsx)("span", { className: "inline-flex items-center justify-center uppercase px-2.5 py-0.5 rounded-[30px] text-[9px]   ".concat(getPriorityColor(task.priority)), children: task.priority }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4", children: (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)("button", { className: "inline-flex items-center gap-1 rounded-[30px] text-[9px]  uppercase cursor-pointer hover:opacity-80 transition-opacity ".concat(getStatusColor(task.status)), children: [getStatusIcon(task.status), task.status] }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { align: "start", className: "bg-white dark:bg-black border-gray-200 dark:border-gray-700", children: [(0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleStatusChange(task.id, 'pending'); }, className: "text-black dark:text-white px-5 h-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-black", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "w-4 h-4 icon mr-2 icon" }), "Pending"] }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleStatusChange(task.id, 'in_progress'); }, className: "text-black dark:text-white px-5 h-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-black", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "w-4 h-4 icon mr-2 icon" }), "In Progress"] }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleStatusChange(task.id, 'completed'); }, className: "text-black dark:text-white px-5 h-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-black", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-4 h-4 icon mr-2 icon" }), "Completed"] }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleStatusChange(task.id, 'cancelled'); }, className: "text-black dark:text-white px-5 h-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-black", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "w-4 h-4 icon mr-2 icon" }), "Cancelled"] })] })] }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 w-[200px] rounded-[30px]", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)((_c = task.assignTo) === null || _c === void 0 ? void 0 : _c.avatar, (_d = task.assignTo) === null || _d === void 0 ? void 0 : _d.username), { alt: ((_e = task.assignTo) === null || _e === void 0 ? void 0 : _e.username) || "User", className: "w-8 h-8 rounded-[30px] object-cover border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform", onClick: function () { var _a; return ((_a = task.assignTo) === null || _a === void 0 ? void 0 : _a.id) && handleUserAvatarClick(task.assignTo.id); }, title: ((_f = task.assignTo) === null || _f === void 0 ? void 0 : _f.username) ? "View ".concat(task.assignTo.username, "'s profile") : '' })), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium text-gray-900 dark:text-white truncate", children: ((_g = task.assignTo) === null || _g === void 0 ? void 0 : _g.username) || "Unknown User" }) })] }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 w-[200px] rounded-[30px]", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)((_h = task.assignedBy) === null || _h === void 0 ? void 0 : _h.avatar, (_j = task.assignedBy) === null || _j === void 0 ? void 0 : _j.username), { alt: ((_k = task.assignedBy) === null || _k === void 0 ? void 0 : _k.username) || "User", className: "w-8 h-8 rounded-[30px] object-cover border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform", onClick: function () { var _a; return ((_a = task.assignedBy) === null || _a === void 0 ? void 0 : _a.id) && handleUserAvatarClick(task.assignedBy.id); }, title: ((_l = task.assignedBy) === null || _l === void 0 ? void 0 : _l.username) ? "View ".concat(task.assignedBy.username, "'s profile") : '' })), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium text-gray-900 dark:text-white truncate", children: ((_m = task.assignedBy) === null || _m === void 0 ? void 0 : _m.username) || "Unknown User" }) })] }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 w-[200px] rounded-[30px]", children: task.project ? ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-2", children: (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-900 dark:text-white truncate", children: task.project.name }) })) : ((0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-500 dark:text-gray-400 truncate", children: "No Project" })) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "w-4 h-4 icon text-gray-400 icon" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-900 dark:text-white truncate", children: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date" })] }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 justify-end", children: [user && user.id && ((_o = task.assignedBy) === null || _o === void 0 ? void 0 : _o.id) === user.id && ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEditTask(task); }, className: "p-2 text-gray-400 h-10 hover:text-black dark:hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "w-4 h-4 icon icon" }) })), user && user.id && ((_p = task.assignedBy) === null || _p === void 0 ? void 0 : _p.id) === user.id && ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDeleteTask(task.id); }, className: "p-2 text-gray-400 h-10 hover:text-red-600", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "w-4 h-4 icon icon" }) })), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", className: "p-2 text-gray-400 h-10 hover:text-black dark:hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.MoreVertical, { className: "w-4 h-4 icon icon" }) }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "bg-white dark:bg-black border-gray-200 dark:border-gray-700", children: [user && user.id && ((_q = task.assignedBy) === null || _q === void 0 ? void 0 : _q.id) === user.id && ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { className: "text-black h-12 px-5 cursor-pointer  dark:text-white hover:bg-gray-100 dark:hover:bg-black", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "w-4 h-4 icon mr-2 icon" }), "Edit Task"] })), user && user.id && ((_r = task.assignTo) === null || _r === void 0 ? void 0 : _r.id) === user.id && ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { className: "text-black h-12 px-5 cursor-pointer   dark:text-white hover:bg-gray-100 dark:hover:bg-black", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "w-4 h-4 icon mr-2 icon" }), "Change Status"] }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "bg-white dark:bg-black border-gray-200 dark:border-gray-700", children: [(0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleStatusChange(task.id, 'pending'); }, className: "text-black dark:text-white px-5 h-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-black", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "w-4 h-4 icon mr-2 icon" }), "Pending"] }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleStatusChange(task.id, 'in_progress'); }, className: "text-black dark:text-white px-5 h-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-black", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "w-4 h-4 icon mr-2 icon" }), "In Progress"] }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleStatusChange(task.id, 'completed'); }, className: "text-black dark:text-white px-5 h-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-black", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-4 h-4 icon mr-2 icon" }), "Completed"] }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleStatusChange(task.id, 'cancelled'); }, className: "text-black dark:text-white px-5 h-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-black", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "w-4 h-4 icon mr-2 icon" }), "Cancelled"] })] })] })), user && user.id && ((_s = task.assignedBy) === null || _s === void 0 ? void 0 : _s.id) === user.id && ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleDeleteTask(task.id); }, className: "text-red-600 hover:bg-red-500 hover:text-white px-5 h-12 cursor-pointer dark:hover:bg-red-900", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "w-4 h-4 icon mr-2" }), "Delete Task"] }))] })] })] }) })] }, task.id));
                                    })) })] }) }) }), showNewTaskPopup && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0  bg-black/50 icon backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50", onClick: function () { return setShowNewTaskPopup(false); }, children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: " bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-md w-full p-6", onClick: function (e) { return e.stopPropagation(); }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { type: "text", value: newTask.title, onChange: function (e) { return setNewTask(__assign(__assign({}, newTask), { title: e.target.value })); }, className: "w-full h-12 border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white", placeholder: "Enter task title" }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { value: newTask.description, onChange: function (e) { return setNewTask(__assign(__assign({}, newTask), { description: e.target.value })); }, className: "w-full border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white", placeholder: "Enter task description", rows: "3" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(select_1.Select, { value: newTask.priority, onValueChange: function (value) { return setNewTask(__assign(__assign({}, newTask), { priority: value })); }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-full h-12 border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Select priority" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { className: "bg-white dark:bg-black border-gray-200 dark:border-gray-700", children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'h-10 cursor-pointer px-5', value: "low", children: "Low" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'h-10 cursor-pointer px-5', value: "medium", children: "Medium" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'h-10 cursor-pointer px-5', value: "high", children: "High" })] })] }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { type: "date", value: newTask.dueDate, onChange: function (e) { return setNewTask(__assign(__assign({}, newTask), { dueDate: e.target.value })); }, className: "w-full h-12 border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white" }) })] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { type: "text", value: newTask.assignedTo, onChange: function (e) { return handleAssignedToChange(e.target.value); }, onFocus: function () {
                                                        if (newTask.assignedTo.length > 0) {
                                                            setShowAssignedToSuggestions(true);
                                                        }
                                                    }, className: "w-full h-12 border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white", placeholder: "Type to search users..." }), showAssignedToSuggestions && assignedToSuggestions.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "absolute z-10 w-full mt-1 bg-white dark:bg-black border-gray-200 dark:border-gray-700 rounded-[30px] shadow-lg max-h-48 overflow-y-auto", children: assignedToSuggestions.map(function (user) { return ((0, jsx_runtime_1.jsx)("div", { onClick: function () { return selectUser(user); }, className: "px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 truncate cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)(user.avatar, user.username || user.name), { alt: user.username || user.name, className: "w-8 h-8 rounded-[30px] object-cover border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform", onClick: function (e) {
                                                                        e.stopPropagation();
                                                                        handleUserAvatarClick(user.id);
                                                                    }, title: user.username || user.name ? "View ".concat(user.username || user.name, "'s profile") : '' })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "font-medium text-gray-900 dark:text-white", children: user.username || user.name }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: user.email })] })] }) }, user.id)); }) }))] }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(select_1.Select, { value: newTask.projectId, onValueChange: function (value) { return setNewTask(__assign(__assign({}, newTask), { projectId: value })); }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-full h-12 border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Select project (optional)" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { className: "bg-white dark:bg-black border-gray-200 dark:border-gray-700", children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'h-10 cursor-pointer px-5', value: "none", children: "No Project" }), projects.map(function (project) { return ((0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'h-10 cursor-pointer px-5', value: project.id, children: project.name }, project.id)); })] })] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3 mt-6", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: function () { return setShowNewTaskPopup(false); }, className: "flex-1 px-4 py-3 h-12 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-black", children: "Cancel" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleNewTask, disabled: loading, className: "flex-1 px-4 py-3 h-12 bg-black text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? ((0, jsx_runtime_1.jsx)("span", { class: "loader w-5 h-5 icon" })) : ('Assign') })] })] }) })), (0, jsx_runtime_1.jsx)(TaskEditModal_1.default, { task: editingTask, isOpen: showEditModal, onClose: handleCloseEditModal, onTaskUpdated: handleTaskUpdated, users: users }), (0, jsx_runtime_1.jsx)(UserDetailsModal_1.default, { userId: selectedUserId, isOpen: showUserDetails, onClose: function () {
                        setShowUserDetails(false);
                        setSelectedUserId(null);
                    } })] }) }));
};
exports.default = Tasks;
