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
var HorizontalLoader_1 = require("../components/HorizontalLoader");
var usePermissions_1 = require("../hooks/usePermissions");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var button_1 = require("../components/ui/button");
var input_1 = require("../components/ui/input");
var textarea_1 = require("../components/ui/textarea");
var select_1 = require("../components/ui/select");
var dropdown_menu_1 = require("../components/ui/dropdown-menu");
var projectService_1 = require("../services/projectService");
var friendService_1 = require("../services/friendService");
var teamService_1 = require("../services/teamService");
var AuthContext_1 = require("../contexts/AuthContext");
var NotificationContext_1 = require("../contexts/NotificationContext");
var avatarUtils_1 = require("../utils/avatarUtils");
var uiConstants_1 = require("../utils/uiConstants");
var UserDetailsModal_1 = require("../components/UserDetailsModal");
var Projects = function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var user = (0, AuthContext_1.useAuth)().user;
    var markAsReadByType = (0, NotificationContext_1.useNotifications)().markAsReadByType;
    var _l = (0, usePermissions_1.usePermissions)(), permissions = _l.permissions, permissionsLoading = _l.loading;
    var _m = (0, react_1.useState)(''), searchTerm = _m[0], setSearchTerm = _m[1];
    var _o = (0, react_1.useState)(false), showNewProjectPopup = _o[0], setShowNewProjectPopup = _o[1];
    var _p = (0, react_1.useState)([]), selectedProjects = _p[0], setSelectedProjects = _p[1];
    var _q = (0, react_1.useState)('all'), filterStatus = _q[0], setFilterStatus = _q[1];
    var _r = (0, react_1.useState)('all'), filterPriority = _r[0], setFilterPriority = _r[1];
    var _s = (0, react_1.useState)({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        startDate: '',
        endDate: '',
        teamId: '',
        members: [],
        links: [],
        tags: [],
        isPublic: false,
        logo: null
    }), newProject = _s[0], setNewProject = _s[1];
    var _t = (0, react_1.useState)(''), memberSearch = _t[0], setMemberSearch = _t[1];
    var _u = (0, react_1.useState)([]), memberSuggestions = _u[0], setMemberSuggestions = _u[1];
    var _v = (0, react_1.useState)(false), showMemberSuggestions = _v[0], setShowMemberSuggestions = _v[1];
    var _w = (0, react_1.useState)('member'), memberRole = _w[0], setMemberRole = _w[1];
    // Separate state for project details modal member search
    var _x = (0, react_1.useState)(''), projectMemberSearch = _x[0], setProjectMemberSearch = _x[1];
    var _y = (0, react_1.useState)([]), projectMemberSuggestions = _y[0], setProjectMemberSuggestions = _y[1];
    var _z = (0, react_1.useState)(false), showProjectMemberSuggestions = _z[0], setShowProjectMemberSuggestions = _z[1];
    var _0 = (0, react_1.useState)('member'), projectMemberRole = _0[0], setProjectMemberRole = _0[1];
    var _1 = (0, react_1.useState)({ title: '', url: '', type: 'other' }), newLink = _1[0], setNewLink = _1[1];
    var _2 = (0, react_1.useState)(''), newTag = _2[0], setNewTag = _2[1];
    var _3 = (0, react_1.useState)(false), loading = _3[0], setLoading = _3[1];
    var _4 = (0, react_1.useState)([]), projects = _4[0], setProjects = _4[1];
    var _5 = (0, react_1.useState)([]), users = _5[0], setUsers = _5[1];
    var _6 = (0, react_1.useState)([]), teams = _6[0], setTeams = _6[1];
    var _7 = (0, react_1.useState)(null), stats = _7[0], setStats = _7[1];
    var _8 = (0, react_1.useState)(null), selectedProject = _8[0], setSelectedProject = _8[1];
    var _9 = (0, react_1.useState)(false), showProjectDetails = _9[0], setShowProjectDetails = _9[1];
    var _10 = (0, react_1.useState)(false), showProgressModal = _10[0], setShowProgressModal = _10[1];
    var _11 = (0, react_1.useState)(false), showMembersModal = _11[0], setShowMembersModal = _11[1];
    var _12 = (0, react_1.useState)(false), showLinksModal = _12[0], setShowLinksModal = _12[1];
    var _13 = (0, react_1.useState)(0), projectProgress = _13[0], setProjectProgress = _13[1];
    var _14 = (0, react_1.useState)(null), selectedUserId = _14[0], setSelectedUserId = _14[1];
    var _15 = (0, react_1.useState)(false), showUserDetails = _15[0], setShowUserDetails = _15[1];
    var _16 = (0, react_1.useState)(0), refreshKey = _16[0], setRefreshKey = _16[1];
    var _17 = (0, react_1.useState)(false), showTasks = _17[0], setShowTasks = _17[1];
    var _18 = (0, react_1.useState)(false), showMeetings = _18[0], setShowMeetings = _18[1];
    var _19 = (0, react_1.useState)(false), showLinks = _19[0], setShowLinks = _19[1];
    var _20 = (0, react_1.useState)({
        page: 1,
        limit: 6,
        total: 0,
        pages: 0
    }), pagination = _20[0], setPagination = _20[1];
    console.log(projects);
    // Load projects
    var loadProjects = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, projectService_1.default.getProjects({
                            status: filterStatus !== 'all' ? filterStatus : undefined,
                            priority: filterPriority !== 'all' ? filterPriority : undefined,
                            search: searchTerm || undefined,
                            page: pagination.page,
                            limit: pagination.limit
                        })];
                case 1:
                    response = _a.sent();
                    console.log('Projects response:', response);
                    console.log('Projects data:', response.projects);
                    setProjects(response.projects || []);
                    setPagination(response.pagination || pagination);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Failed to load projects:', error_1);
                    sonner_1.toast.error('Failed to load projects');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [filterStatus, filterPriority, searchTerm, pagination.page, pagination.limit]);
    // Reset pagination when filters change
    (0, react_1.useEffect)(function () {
        if (pagination.page !== 1) {
            setPagination(function (prev) { return (__assign(__assign({}, prev), { page: 1 })); });
        }
    }, [filterStatus, filterPriority, searchTerm]);
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
                    console.error('Failed to load friends:', error_2);
                    sonner_1.toast.error('Failed to load friends');
                    setUsers([]);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [user]);
    // Load teams
    var loadTeams = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_3;
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
                    error_3 = _a.sent();
                    console.error('Failed to load teams:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    // Load stats
    var loadStats = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, projectService_1.default.getProjectStats()];
                case 1:
                    response = _a.sent();
                    setStats(response.stats);
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('Failed to load stats:', error_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    // Load data on mount
    (0, react_1.useEffect)(function () {
        loadProjects();
        loadUsers();
        loadTeams();
        loadStats();
    }, [loadProjects, loadUsers, loadTeams, loadStats]);
    // Mark project notifications as read when user visits this page
    (0, react_1.useEffect)(function () {
        if (user && user.id) {
            markAsReadByType('projects');
        }
    }, [user, markAsReadByType]);
    // Debug selectedProject changes
    (0, react_1.useEffect)(function () {
        var _a;
        if (selectedProject) {
            console.log('selectedProject updated:', selectedProject);
            console.log('selectedProject members count:', (_a = selectedProject.members) === null || _a === void 0 ? void 0 : _a.length);
            console.log('selectedProject members:', selectedProject.members);
        }
    }, [selectedProject]);
    // Debug projects list changes
    (0, react_1.useEffect)(function () {
        if (projects.length > 0) {
            console.log('Projects list updated:', projects.length, 'projects');
            projects.forEach(function (project) {
                var _a;
                console.log("Project ".concat(project.name, " (").concat(project.id, ") members:"), (_a = project.members) === null || _a === void 0 ? void 0 : _a.length);
            });
        }
    }, [projects]);
    // Handle member search for new project form
    var handleMemberSearch = function (value) {
        setMemberSearch(value);
        if (value.length > 0) {
            var filtered = users.filter(function (user) {
                return user.username.toLowerCase().includes(value.toLowerCase()) &&
                    !newProject.members.some(function (member) { return member.id === user.id; });
            });
            setMemberSuggestions(filtered);
            setShowMemberSuggestions(true);
        }
        else {
            setMemberSuggestions([]);
            setShowMemberSuggestions(false);
        }
    };
    // Handle member search for project details modal
    var handleProjectMemberSearch = function (value) {
        setProjectMemberSearch(value);
        if (value.length > 0) {
            var filtered = users.filter(function (user) {
                var _a;
                return user.username.toLowerCase().includes(value.toLowerCase()) &&
                    !((_a = selectedProject === null || selectedProject === void 0 ? void 0 : selectedProject.members) === null || _a === void 0 ? void 0 : _a.some(function (member) { var _a; return ((_a = member.user) === null || _a === void 0 ? void 0 : _a._id) === user.id; }));
            });
            setProjectMemberSuggestions(filtered);
            setShowProjectMemberSuggestions(true);
        }
        else {
            setProjectMemberSuggestions([]);
            setShowProjectMemberSuggestions(false);
        }
    };
    // Add member
    var handleAddMember = function (user) {
        if (!newProject.members.some(function (member) { return member.id === user.id; })) {
            setNewProject(function (prev) { return (__assign(__assign({}, prev), { members: __spreadArray(__spreadArray([], prev.members, true), [{ id: user.id, username: user.username, avatar: user.avatar }], false) })); });
            setMemberSearch('');
            setShowMemberSuggestions(false);
        }
    };
    // Remove member
    var handleRemoveMember = function (userId) {
        setNewProject(function (prev) { return (__assign(__assign({}, prev), { members: prev.members.filter(function (member) { return member.id !== userId; }) })); });
    };
    // Add link
    var handleAddLink = function () {
        if (newLink.title && newLink.url) {
            setNewProject(function (prev) { return (__assign(__assign({}, prev), { links: __spreadArray(__spreadArray([], prev.links, true), [__assign(__assign({}, newLink), { id: Date.now().toString() })], false) })); });
            setNewLink({ title: '', url: '', type: 'other' });
        }
    };
    // Remove link
    var handleRemoveLink = function (linkId) {
        setNewProject(function (prev) { return (__assign(__assign({}, prev), { links: prev.links.filter(function (link) { return link.id !== linkId; }) })); });
    };
    // Add tag
    var handleAddTag = function () {
        if (newTag.trim() && !newProject.tags.includes(newTag.trim())) {
            setNewProject(function (prev) { return (__assign(__assign({}, prev), { tags: __spreadArray(__spreadArray([], prev.tags, true), [newTag.trim()], false) })); });
            setNewTag('');
        }
    };
    // Remove tag
    var handleRemoveTag = function (tagToRemove) {
        setNewProject(function (prev) { return (__assign(__assign({}, prev), { tags: prev.tags.filter(function (tag) { return tag !== tagToRemove; }) })); });
    };
    // Create project
    var handleCreateProject = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var logoUrl, formData, apiUrl, uploadResponse, uploadData, projectData, response_1, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!newProject.name.trim()) {
                        sonner_1.toast.error('Project name is required');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    setLoading(true);
                    logoUrl = null;
                    if (!newProject.logo) return [3 /*break*/, 4];
                    formData = new FormData();
                    formData.append('logo', newProject.logo);
                    formData.append('folder', 'projects');
                    apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
                    return [4 /*yield*/, fetch("".concat(apiUrl, "/api/projects/upload/projects"), {
                            method: 'POST',
                            headers: {
                                'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                            },
                            body: formData
                        })];
                case 2:
                    uploadResponse = _a.sent();
                    if (!uploadResponse.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, uploadResponse.json()];
                case 3:
                    uploadData = _a.sent();
                    logoUrl = uploadData.url;
                    _a.label = 4;
                case 4:
                    projectData = __assign(__assign({}, newProject), { logo: logoUrl, members: newProject.members.map(function (member) { return member.id; }) });
                    return [4 /*yield*/, projectService_1.default.createProject(projectData)];
                case 5:
                    response_1 = _a.sent();
                    setProjects(function (prev) { return __spreadArray([response_1.project], prev, true); });
                    setShowNewProjectPopup(false);
                    setNewProject({
                        name: '',
                        description: '',
                        status: 'planning',
                        priority: 'medium',
                        startDate: '',
                        endDate: '',
                        members: [],
                        links: [],
                        tags: [],
                        isPublic: false,
                        logo: null
                    });
                    sonner_1.toast.success('Project created successfully!');
                    loadStats();
                    return [3 /*break*/, 8];
                case 6:
                    error_5 = _a.sent();
                    console.error('Error creating project:', error_5);
                    sonner_1.toast.error(error_5.message || 'Failed to create project');
                    return [3 /*break*/, 8];
                case 7:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // Delete project
    var handleDeleteProject = function (projectId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Are you sure you want to delete this project?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, projectService_1.default.deleteProject(projectId)];
                case 2:
                    _a.sent();
                    setProjects(function (prev) { return prev.filter(function (project) { return project.id !== projectId; }); });
                    sonner_1.toast.success('Project deleted successfully!');
                    loadStats();
                    return [3 /*break*/, 4];
                case 3:
                    error_6 = _a.sent();
                    console.error('Error deleting project:', error_6);
                    sonner_1.toast.error(error_6.message || 'Failed to delete project');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // View project details
    var handleViewProject = function (project) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_7;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, projectService_1.default.getProjectById(project.id)];
                case 1:
                    response = _c.sent();
                    console.log('=== FRONTEND PROJECT DEBUG START ===');
                    console.log('Full project data:', response.project);
                    console.log('Project tasks:', response.project.tasks);
                    console.log('Project meetings:', response.project.meetings);
                    console.log('Tasks length:', ((_a = response.project.tasks) === null || _a === void 0 ? void 0 : _a.length) || 0);
                    console.log('Meetings length:', ((_b = response.project.meetings) === null || _b === void 0 ? void 0 : _b.length) || 0);
                    console.log('=== FRONTEND PROJECT DEBUG END ===');
                    setSelectedProject(response.project);
                    setShowProjectDetails(true);
                    return [3 /*break*/, 3];
                case 2:
                    error_7 = _c.sent();
                    console.error('Error fetching project details:', error_7);
                    sonner_1.toast.error('Failed to load project details');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Handle user avatar click
    var handleUserAvatarClick = function (userId) {
        console.log('Avatar clicked for user ID:', userId);
        setSelectedUserId(userId);
        setShowUserDetails(true);
        console.log('Modal should open now');
    };
    // Check if current user is project owner
    var isProjectOwner = function (project) {
        var _a, _b;
        return ((_a = project.createdBy) === null || _a === void 0 ? void 0 : _a.id) === (user === null || user === void 0 ? void 0 : user.id) || ((_b = project.createdBy) === null || _b === void 0 ? void 0 : _b._id) === (user === null || user === void 0 ? void 0 : user.id);
    };
    // Update project progress
    var handleUpdateProgress = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedProject)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, projectService_1.default.updateProject(selectedProject.id, {
                            progress: projectProgress
                        })];
                case 2:
                    _a.sent();
                    setProjects(function (prev) { return prev.map(function (project) {
                        return project.id === selectedProject.id
                            ? __assign(__assign({}, project), { progress: projectProgress }) : project;
                    }); });
                    setSelectedProject(function (prev) { return (__assign(__assign({}, prev), { progress: projectProgress })); });
                    setShowProgressModal(false);
                    sonner_1.toast.success('Project progress updated!');
                    return [3 /*break*/, 4];
                case 3:
                    error_8 = _a.sent();
                    console.error('Error updating progress:', error_8);
                    sonner_1.toast.error(error_8.message || 'Failed to update progress');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Add member to project
    var handleAddMemberToProject = function (userId_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([userId_1], args_1, true), void 0, function (userId, role) {
            var response, projectInList, error_9;
            var _a;
            if (role === void 0) { role = 'member'; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!selectedProject)
                            return [2 /*return*/];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        setLoading(true);
                        console.log('Adding member:', userId, 'to project:', selectedProject.id);
                        return [4 /*yield*/, projectService_1.default.addMember(selectedProject.id, { userId: userId, role: role })
                            // Reload projects to get updated data
                        ];
                    case 2:
                        _b.sent();
                        // Reload projects to get updated data
                        console.log('Reloading projects after adding member...');
                        return [4 /*yield*/, loadProjects()
                            // Update selected project if it's the current project
                        ];
                    case 3:
                        _b.sent();
                        if (!selectedProject) return [3 /*break*/, 5];
                        console.log('Fetching updated project data for:', selectedProject.id);
                        return [4 /*yield*/, projectService_1.default.getProjectById(selectedProject.id)];
                    case 4:
                        response = _b.sent();
                        console.log('Updated project data:', response.project);
                        console.log('Updated project members count:', response.project.members.length);
                        console.log('Updated project members:', response.project.members);
                        projectInList = projects.find(function (p) { return p.id === selectedProject.id; });
                        console.log('Project in list members count:', (_a = projectInList === null || projectInList === void 0 ? void 0 : projectInList.members) === null || _a === void 0 ? void 0 : _a.length);
                        console.log('Project in list members:', projectInList === null || projectInList === void 0 ? void 0 : projectInList.members);
                        setSelectedProject(response.project);
                        setRefreshKey(function (prev) { return prev + 1; });
                        _b.label = 5;
                    case 5:
                        setProjectMemberSearch('');
                        setShowProjectMemberSuggestions(false);
                        setProjectMemberSuggestions([]);
                        sonner_1.toast.success('Member added successfully!');
                        return [3 /*break*/, 8];
                    case 6:
                        error_9 = _b.sent();
                        console.error('Error adding member:', error_9);
                        sonner_1.toast.error(error_9.message || 'Failed to add member');
                        return [3 /*break*/, 8];
                    case 7:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // Remove member from project
    var handleRemoveMemberFromProject = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
        var response, projectInList, error_10;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!confirm('Are you sure you want to remove this member?'))
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 8]);
                    setLoading(true);
                    console.log('Removing member:', userId, 'from project:', selectedProject.id);
                    return [4 /*yield*/, projectService_1.default.removeMember(selectedProject.id, { userId: userId })
                        // Reload projects to get updated data
                    ];
                case 2:
                    _b.sent();
                    // Reload projects to get updated data
                    console.log('Reloading projects after removing member...');
                    return [4 /*yield*/, loadProjects()
                        // Update selected project if it's the current project
                    ];
                case 3:
                    _b.sent();
                    if (!selectedProject) return [3 /*break*/, 5];
                    console.log('Fetching updated project data for:', selectedProject.id);
                    return [4 /*yield*/, projectService_1.default.getProjectById(selectedProject.id)];
                case 4:
                    response = _b.sent();
                    console.log('Updated project data:', response.project);
                    console.log('Updated project members count:', response.project.members.length);
                    console.log('Updated project members:', response.project.members);
                    console.log('Previous selectedProject members count:', selectedProject.members.length);
                    projectInList = projects.find(function (p) { return p.id === selectedProject.id; });
                    console.log('Project in list members count:', (_a = projectInList === null || projectInList === void 0 ? void 0 : projectInList.members) === null || _a === void 0 ? void 0 : _a.length);
                    console.log('Project in list members:', projectInList === null || projectInList === void 0 ? void 0 : projectInList.members);
                    setSelectedProject(response.project);
                    // Force a re-render by updating the refresh key
                    setRefreshKey(function (prev) { return prev + 1; });
                    // Force a re-render by updating the state
                    setTimeout(function () {
                        console.log('After timeout - selectedProject members:', selectedProject.members.length);
                    }, 100);
                    _b.label = 5;
                case 5:
                    // Clear project member search and suggestions
                    setProjectMemberSearch('');
                    setShowProjectMemberSuggestions(false);
                    setProjectMemberSuggestions([]);
                    sonner_1.toast.success('Member removed successfully!');
                    return [3 /*break*/, 8];
                case 6:
                    error_10 = _b.sent();
                    console.error('Error removing member:', error_10);
                    sonner_1.toast.error(error_10.message || 'Failed to remove member');
                    return [3 /*break*/, 8];
                case 7:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // Add link to project
    var handleAddLinkToProject = function (linkData) { return __awaiter(void 0, void 0, void 0, function () {
        var response_2, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedProject)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, projectService_1.default.addLink(selectedProject.id, linkData)
                        // Reload project details
                    ];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, projectService_1.default.getProjectById(selectedProject.id)];
                case 3:
                    response_2 = _a.sent();
                    setSelectedProject(response_2.project);
                    // Update projects list
                    setProjects(function (prev) { return prev.map(function (project) {
                        return project.id === selectedProject.id ? response_2.project : project;
                    }); });
                    sonner_1.toast.success('Link added successfully!');
                    return [3 /*break*/, 5];
                case 4:
                    error_11 = _a.sent();
                    console.error('Error adding link:', error_11);
                    sonner_1.toast.error(error_11.message || 'Failed to add link');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Remove link from project
    var handleRemoveLinkFromProject = function (linkId) { return __awaiter(void 0, void 0, void 0, function () {
        var response_3, error_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedProject)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, projectService_1.default.removeLink(selectedProject.id, { linkId: linkId })
                        // Reload project details
                    ];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, projectService_1.default.getProjectById(selectedProject.id)];
                case 3:
                    response_3 = _a.sent();
                    setSelectedProject(response_3.project);
                    // Update projects list
                    setProjects(function (prev) { return prev.map(function (project) {
                        return project.id === selectedProject.id ? response_3.project : project;
                    }); });
                    sonner_1.toast.success('Link removed successfully!');
                    return [3 /*break*/, 5];
                case 4:
                    error_12 = _a.sent();
                    console.error('Error removing link:', error_12);
                    sonner_1.toast.error(error_12.message || 'Failed to remove link');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Get status color
    var getStatusColor = function (status) {
        switch (status) {
            case 'planning': return 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200';
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'on_hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200';
        }
    };
    document.title = "Projects - Manage Projects at ease!";
    // Get priority color
    var getPriorityColor = function (priority) {
        switch (priority) {
            case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200';
        }
    };
    // Get priority icon
    var getPriorityIcon = function (priority) {
        switch (priority) {
            case 'low': return (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowDown, { className: "w-3 h-3 icon icon" });
            case 'medium': return (0, jsx_runtime_1.jsx)(lucide_react_1.Minus, { className: "w-3 h-3 icon icon" });
            case 'high': return (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowUp, { className: "w-3 h-3 icon icon" });
            case 'urgent': return (0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "w-3 h-3 icon icon" });
            default: return (0, jsx_runtime_1.jsx)(lucide_react_1.Minus, { className: "w-3 h-3 icon icon" });
        }
    };
    // Format date safely
    var formatDate = function (dateString) {
        if (!dateString)
            return 'No date';
        try {
            var date = new Date(dateString);
            if (isNaN(date.getTime()))
                return 'Invalid date';
            return date.toLocaleDateString();
        }
        catch (error) {
            return 'Invalid date';
        }
    };
    // Get status icon
    var getStatusIcon = function (status) {
        switch (status) {
            case 'planning': return (0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "w-4 h-4 icon icon" });
            case 'active': return (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-4 h-4 icon icon" });
            case 'on_hold': return (0, jsx_runtime_1.jsx)(lucide_react_1.Pause, { className: "w-4 h-4 icon icon" });
            case 'completed': return (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-4 h-4 icon icon" });
            case 'cancelled': return (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-4 h-4 icon icon" });
            default: return (0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "w-4 h-4 icon icon" });
        }
    };
    // Filter projects
    var filteredProjects = projects.filter(function (project) {
        var matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.tags.some(function (tag) { return tag.toLowerCase().includes(searchTerm.toLowerCase()); });
        var matchesStatus = filterStatus === 'all' || project.status === filterStatus;
        var matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
        return matchesSearch && matchesStatus && matchesPriority;
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
    console.log(filteredProjects);
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
    return ((0, jsx_runtime_1.jsx)("div", { className: "overflow-hidden pt-6 pb-10", children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { className: "mx-auto", variants: containerVariants, initial: "hidden", animate: "visible", children: [(0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { variants: itemVariants, className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { variants: itemVariants, className: "flex flex-wrap justify-start items-center gap-4 ", children: [(0, jsx_runtime_1.jsx)("div", { className: "", children: (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 icon icon" }), (0, jsx_runtime_1.jsx)(input_1.Input, { type: "text", placeholder: "Search projects...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: (0, uiConstants_1.getInputClasses)('default', 'md', 'pl-10 w-[500px] h-13') })] }) }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: filterStatus, onValueChange: setFilterStatus, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-40 px-5 cursor-pointer bg-white dark:bg-black h-13", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Status" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "all", children: "All Status" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "planning", children: "Planning" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "active", children: "Active" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "on_hold", children: "On Hold" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "completed", children: "Completed" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "cancelled", children: "Cancelled" })] })] }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: filterPriority, onValueChange: setFilterPriority, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-40 bg-white px-5 cursor-pointer dark:bg-black h-13", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Priority" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "all", children: "All Priority" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "low", children: "Low" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "medium", children: "Medium" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "high", children: "High" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "urgent", children: "Urgent" })] })] })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-4", children: permissions.canCreateProject && (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: function () {
                                    if (!permissions.canCreateProject) {
                                        sonner_1.toast.error('You do not have permission to create projects. Contact an admin.');
                                        return;
                                    }
                                    setShowNewProjectPopup(true);
                                }, className: 'w-[200px] rounded-[10px] rounded-[10px] h-12 font-bold', children: "New Project" }) })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { variants: itemVariants, className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: loading ? (Array.from({ length: 6 }).map(function (_, index) { return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-black rounded-[10px]  border-gray-200 dark:border-gray-700 p-6 animate-pulse", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4" }), (0, jsx_runtime_1.jsx)("div", { className: "h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2" }), (0, jsx_runtime_1.jsx)("div", { className: "h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mb-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" }), (0, jsx_runtime_1.jsx)("div", { className: "h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" })] }), (0, jsx_runtime_1.jsx)("div", { className: "h-2 bg-gray-200 dark:bg-gray-700 rounded mb-2" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" }), (0, jsx_runtime_1.jsx)("div", { className: "h-8 bg-gray-200 dark:bg-gray-700 rounded w-8" })] })] }, index)); })) : filteredProjects.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "col-span-full text-center py-12", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl  text-gray-900 dark:text-white mb-2", children: "No projects found" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400 mb-6", children: "Get started by creating your first project" }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: function () {
                                    if (!permissions.canCreateProject) {
                                        sonner_1.toast.error('You do not have permission to create projects. Contact an admin.');
                                        return;
                                    }
                                    setShowNewProjectPopup(true);
                                }, disabled: !permissions.canCreateProject, className: 'w-[200px]', children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "w-4 h-4 icon mr-2 icon" }), "Create Project"] })] })) : (filteredProjects.map(function (project) {
                        var _a, _b;
                        return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { variants: itemVariants, className: "dark:bg-[rgba(255,255,255,.1)] rounded-[10px] bg-white dark:border-none border  p-6 transition-shadow duration-300", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-1 h-12", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 mb-2", children: [project.logo && ((0, jsx_runtime_1.jsx)("img", { src: project.logo.startsWith('http') ? project.logo : "".concat(import.meta.env.VITE_API_URL || 'http://localhost:4000').concat(project.logo), alt: project.name, className: "w-8 h-8 rounded object-cover rounded-[10px] bg-gray-100  border border-gray-200 dark:border-gray-700" })), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg  text-gray-900 dark:text-white line-clamp-1", children: project.name })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleViewProject(project); }, className: "p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-12", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "w-4 h-4 icon icon" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () {
                                                        setSelectedProject(project);
                                                        setProjectProgress(project.progress || 0);
                                                        setShowProgressModal(true);
                                                    }, className: "p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-12", children: (0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { className: "w-4 h-4 icon icon" }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", className: "p-2 w-12", children: (0, jsx_runtime_1.jsx)(lucide_react_1.MoreVertical, { className: "w-4 h-4 icon icon" }) }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { align: "end", children: [(0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { className: "h-10 px-5 cursor-pointer", onClick: function () { return handleViewProject(project); }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "w-4 h-4 icon mr-2 icon" }), "View Details"] }), isProjectOwner(project) && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { className: "h-10 px-5 cursor-pointer", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "w-4 h-4 icon mr-2 icon" }), "Edit Project"] }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { className: "h-10 px-5 cursor-pointer", onClick: function () {
                                                                                setSelectedProject(project);
                                                                                setShowMembersModal(true);
                                                                            }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { className: "w-4 h-4 icon mr-2 icon" }), "Edit Members"] }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { className: "h-10 px-5 cursor-pointer", onClick: function () {
                                                                                setSelectedProject(project);
                                                                                setShowLinksModal(true);
                                                                            }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Link, { className: "w-4 h-4 icon mr-2 icon" }), "Manage Links"] }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { className: "h-10 px-5 cursor-pointer text-red-600", onClick: function () { return handleDeleteProject(project.id); }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "w-4 h-4 icon mr-2" }), "Delete"] })] }))] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mb-4", children: [(0, jsx_runtime_1.jsxs)("span", { className: "inline-flex items-center border gap-1 uppercase px-4 py-2 rounded-[10px] text-[10px] font-medium ".concat(getStatusColor(project.status)), children: [getStatusIcon(project.status), project.status.replace('_', ' ')] }), (0, jsx_runtime_1.jsx)("span", { className: "inline-flex items-center  px-4 py-2 border uppercase rounded-[10px] text-[10px] font-medium ".concat(getPriorityColor(project.priority)), children: project.priority })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1", children: [(0, jsx_runtime_1.jsx)("span", { children: "Progress" }), (0, jsx_runtime_1.jsxs)("span", { children: [project.progress, "%"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-[10px] h-2", children: (0, jsx_runtime_1.jsx)("div", { className: "bg-black dark:bg-white h-2 rounded-[10px] transition-all duration-300", style: { width: "".concat(project.progress, "%") } }) })] }), project.tags && project.tags.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-1 mb-4", children: [project.tags.slice(0, 3).map(function (tag, index) { return ((0, jsx_runtime_1.jsxs)("span", { className: "inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-black text-gray-700 dark:text-gray-300 rounded-[10px] text-xs", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Tag, { className: "w-3 h-3 icon mr-1 icon" }), tag] }, index)); }), project.tags.length > 3 && ((0, jsx_runtime_1.jsxs)("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: ["+", project.tags.length - 3, " more"] }))] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between pt-4 border-t icon border-gray-200 dark:border-gray-700", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-2", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex -space-x-2", children: [(_a = project.members) === null || _a === void 0 ? void 0 : _a.slice(0, 3).map(function (member, index) { return ((0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-[10px]  border-white dark:border-gray-900 overflow-hidden cursor-pointer hover:scale-110 transition-transform", onClick: function () { return handleUserAvatarClick(member.user._id); }, title: member.user.username, children: (0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)(member.user.avatar, member.user.username), { alt: member.user.username, className: "w-full h-full object-cover" })) }, index)); }), ((_b = project.members) === null || _b === void 0 ? void 0 : _b.length) > 3 && ((0, jsx_runtime_1.jsxs)("div", { className: "w-6 h-6 rounded-[10px]  border-white dark:border-gray-900 bg-gray-100 dark:bg-black flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400", children: ["+", project.members.length - 3] }))] }) }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: new Date(project.createdAt).toLocaleDateString() })] })] }, project.id));
                    })) }), (0, jsx_runtime_1.jsx)("div", { className: "sticky bottom-0  border-gray-200 dark:border-gray-700 p-4 mt-8", children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "flex flex-col sm:flex-row items-center justify-end gap-4", children: pagination.pages > 1 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handlePageChange(pagination.page - 1); }, disabled: pagination.page === 1 || loading, className: "flex items-center gap-1 h-8 px-3  w-[120px] h-[50px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowUp, { className: "w-4 h-4 icon rotate-[-90deg]" }), "Previous"] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-1", children: getPageNumbers().map(function (pageNum, index) { return ((0, jsx_runtime_1.jsx)("div", { children: pageNum === '...' ? ((0, jsx_runtime_1.jsx)("span", { className: "px-3 py-1 text-gray-500", children: "..." })) : ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: pagination.page === pageNum ? "default" : "outline", size: "sm", onClick: function () { return handlePageChange(pageNum); }, disabled: loading, className: "h-8 w-8 p-0 ".concat(pagination.page === pageNum
                                                ? 'bg-gray-600 text-white hover:bg-gray-700'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'), children: pageNum })) }, index)); }) }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handlePageChange(pagination.page + 1); }, disabled: pagination.page === pagination.pages || loading, className: "flex items-center gap-1 h-8 w-[120px] h-[50px]", children: ["Next", (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowDown, { className: "w-4 h-4 icon rotate-[-90deg]" })] })] })) }) }), showNewProjectPopup && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 backdrop-blur-sm bg-black/50 icon  bg-opacity-50 flex items-center justify-center p-4 z-50", onClick: function () { return setShowNewProjectPopup(false); }, children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: "bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto", onClick: function (e) { return e.stopPropagation(); }, children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-end mb-6", children: (0, jsx_runtime_1.jsx)("button", { onClick: function () { return setShowNewProjectPopup(false); }, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-6 h-6 icon" }) }) }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleCreateProject, className: "space-y-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 gap-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { value: newProject.name, onChange: function (e) { return setNewProject(__assign(__assign({}, newProject), { name: e.target.value })); }, placeholder: "Project name *", className: "w-full h-12 rounded-[10px]", required: true }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { value: newProject.description, onChange: function (e) { return setNewProject(__assign(__assign({}, newProject), { description: e.target.value })); }, placeholder: "Project description *", className: "w-full h-12 rounded-[10px]", rows: "3", required: true }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(select_1.Select, { value: newProject.teamId || "none", onValueChange: function (value) { return setNewProject(__assign(__assign({}, newProject), { teamId: value === "none" ? "" : value })); }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-full h-12", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Select Team (Optional)" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "none", children: "No Team" }), teams.map(function (team) { return ((0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: team.id, children: team.name }, team.id)); })] })] }) })] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4", children: [newProject.logo ? ((0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("img", { src: URL.createObjectURL(newProject.logo), alt: "Project logo preview", className: "w-16 h-16 rounded-[10px] object-cover  border-gray-200 dark:border-gray-700" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: function () { return setNewProject(__assign(__assign({}, newProject), { logo: null })); }, className: "absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-[10px] flex items-center justify-center text-xs hover:bg-red-600", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-3 h-3 icon" }) })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "w-16 h-16  border-dashed border-gray-300 dark:border-gray-600 rounded-[10px] flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Camera, { className: "w-6 h-6 text-gray-400 icon" }) })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", onChange: function (e) {
                                                                var file = e.target.files[0];
                                                                if (file) {
                                                                    setNewProject(__assign(__assign({}, newProject), { logo: file }));
                                                                }
                                                            }, className: "hidden", id: "logo-upload" }), (0, jsx_runtime_1.jsxs)("label", { htmlFor: "logo-upload", className: "cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-[10px] shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-700", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Camera, { className: "w-4 h-4 icon mr-2 icon" }), newProject.logo ? 'Change Logo' : 'Upload Logo'] })] })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(select_1.Select, { value: newProject.status, onValueChange: function (value) { return setNewProject(__assign(__assign({}, newProject), { status: value })); }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-full h-12", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Status" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "planning", children: "Planning" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "active", children: "Active" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "on_hold", children: "On Hold" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "completed", children: "Completed" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "cancelled", children: "Cancelled" })] })] }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(select_1.Select, { value: newProject.priority, onValueChange: function (value) { return setNewProject(__assign(__assign({}, newProject), { priority: value })); }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-full h-12", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Priority" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "low", children: "Low" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "medium", children: "Medium" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "high", children: "High" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "urgent", children: "Urgent" })] })] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { type: "date", value: newProject.startDate, onChange: function (e) { return setNewProject(__assign(__assign({}, newProject), { startDate: e.target.value })); }, placeholder: "Start date *", className: "w-full h-12 rounded-[10px]", required: true }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { type: "date", value: newProject.endDate, onChange: function (e) { return setNewProject(__assign(__assign({}, newProject), { endDate: e.target.value })); }, placeholder: "End date", className: "w-full h-12 rounded-[10px]" }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative mb-3", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { value: memberSearch, onChange: function (e) { return handleMemberSearch(e.target.value); }, placeholder: "Add team members", className: "w-full h-12 rounded-[10px]" }), showMemberSuggestions && memberSuggestions.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "absolute z-10 w-full mt-1 bg-white dark:bg-black  border-gray-200 dark:border-gray-700 rounded-[10px] shadow-lg max-h-48 overflow-y-auto", children: memberSuggestions.map(function (user) { return ((0, jsx_runtime_1.jsx)("div", { onClick: function () { return handleAddMember(user); }, className: "px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)(user.avatar, user.username), { alt: user.username, className: "w-8 h-8 rounded-[10px] object-cover  border-gray-200 dark:border-gray-700" })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "font-medium text-gray-900 dark:text-white", children: user.username }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: user.email })] })] }) }, user.id)); }) }))] }), newProject.members.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: newProject.members.map(function (member) { return ((0, jsx_runtime_1.jsxs)("span", { className: "inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-black text-gray-800 dark:text-gray-200 rounded-[10px] text-sm", children: [(0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)(member.avatar, member.username), { alt: member.username, className: "w-4 h-4 icon rounded-[10px]" })), member.username, (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: function () { return handleRemoveMember(member.id); }, className: "ml-1 hover:text-gray-600 dark:hover:text-gray-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-3 h-3 icon" }) })] }, member.id)); }) }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mb-3", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { value: newLink.title, onChange: function (e) { return setNewLink(__assign(__assign({}, newLink), { title: e.target.value })); }, placeholder: "Link title", className: "flex-1 h-12 rounded-[10px]" }), (0, jsx_runtime_1.jsx)(input_1.Input, { value: newLink.url, onChange: function (e) { return setNewLink(__assign(__assign({}, newLink), { url: e.target.value })); }, placeholder: "URL", className: "flex-1 h-12 rounded-[10px]" }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: newLink.type, onValueChange: function (value) { return setNewLink(__assign(__assign({}, newLink), { type: value })); }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-32 h-12 cursor-pointer", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "repository", children: "Repository" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "documentation", children: "Documentation" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "design", children: "Design" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "other", children: "Other" })] })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", className: 'h-12 w-12', onClick: handleAddLink, variant: "outline", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Plus, {}) })] }), newProject.links.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: newProject.links.map(function (link) { return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-2 bg-gray-100 dark:bg-black rounded", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ExternalLink, { className: "w-4 h-4 icon text-gray-500" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm font-medium", children: link.title }), (0, jsx_runtime_1.jsxs)("span", { className: "text-xs text-gray-500", children: ["(", link.type, ")"] })] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: function () { return handleRemoveLink(link.id); }, className: "text-red-500 hover:text-red-700", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-4 h-4 icon" }) })] }, link.id)); }) }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mb-3", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { value: newTag, onChange: function (e) { return setNewTag(e.target.value); }, placeholder: "Add a tag", className: "flex-1 h-12 rounded-[10px]", onKeyPress: function (e) { return e.key === 'Enter' && (e.preventDefault(), handleAddTag()); } }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", onClick: handleAddTag, variant: "outline", children: "Add" })] }), newProject.tags.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: newProject.tags.map(function (tag, index) { return ((0, jsx_runtime_1.jsxs)("span", { className: "inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-[10px] text-sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Tag, { className: "w-3 h-3 icon" }), tag, (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: function () { return handleRemoveTag(tag); }, className: "ml-1 hover:text-green-600 dark:hover:text-green-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-3 h-3 icon" }) })] }, index)); }) }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3 pt-4 border-t icon border-gray-200 dark:border-gray-700", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", variant: "outline", onClick: function () { return setShowNewProjectPopup(false); }, className: "flex-1 h-12 rounded-[10px]", disabled: loading, children: "Cancel" }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "submit", className: "flex-1 disabled:opacity-50 h-12 disabled:cursor-not-allowed rounded-[10px]", disabled: loading, children: loading ? ((0, jsx_runtime_1.jsx)("span", { className: "loader w-5 h-5 icon" })) : ('Create Project') })] })] })] }) })), console.log(selectedProject), showProjectDetails && selectedProject && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black/50 icon  backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-100000", onClick: function () {
                        setShowProjectDetails(false);
                        setShowTasks(false);
                        setShowMeetings(false);
                        setShowLinks(false);
                        // Clear project member search state
                        setProjectMemberSearch('');
                        setShowProjectMemberSuggestions(false);
                        setProjectMemberSuggestions([]);
                    }, children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: "bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto", onClick: function (e) { return e.stopPropagation(); }, children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl  text-gray-900 dark:text-white", children: selectedProject.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: ["Created by ", (_a = selectedProject.createdBy) === null || _a === void 0 ? void 0 : _a.username, " \u2022 ", new Date(selectedProject.createdAt).toLocaleDateString()] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: function () {
                                                setShowProjectDetails(false);
                                                setShowTasks(false);
                                                setShowMeetings(false);
                                                setShowLinks(false);
                                                // Clear project member search state
                                                setProjectMemberSearch('');
                                                setShowProjectMemberSuggestions(false);
                                                setProjectMemberSuggestions([]);
                                            }, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-6 h-6 icon" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg  text-gray-900 dark:text-white mb-2", children: "Description" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: selectedProject.description || 'No description provided' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("span", { className: "inline-flex items-center gap-1 px-4 py-2 uppercase  rounded-[10px] text-xs font-medium ".concat(getStatusColor(selectedProject.status)), children: [getStatusIcon(selectedProject.status), selectedProject.status] }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("span", { className: "inline-flex items-center gap-1 px-4 py-2 uppercase  rounded-[10px] text-xs font-medium ".concat(getPriorityColor(selectedProject.priority)), children: [getPriorityIcon(selectedProject.priority), selectedProject.priority] }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Progress" }), (0, jsx_runtime_1.jsx)("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-[10px] h-2", children: (0, jsx_runtime_1.jsx)("div", { className: "bg-green-500 h-2 rounded-[10px] transition-all duration-300", style: { width: "".concat(selectedProject.progress || 0, "%") } }) }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: [selectedProject.progress || 0, "% complete"] })] }), selectedProject.tags && selectedProject.tags.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Tags" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: selectedProject.tags.map(function (tag, index) { return ((0, jsx_runtime_1.jsx)("span", { className: "inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-black text-gray-800 dark:text-gray-200 rounded-[10px] text-xs", children: tag }, index)); }) })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-lg  text-gray-900 dark:text-white mb-2", children: ["Members (", ((_b = selectedProject.members) === null || _b === void 0 ? void 0 : _b.length) || 0, ")"] }), console.log('Rendering members:', selectedProject.members), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2 max-h-45overflow-y-auto", children: selectedProject.members && selectedProject.members.length > 0 ? selectedProject.members.map(function (member, index) {
                                                                var _a, _b, _c, _d, _e, _f, _g;
                                                                return ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-between p-2 bg-gray-50 dark:bg-black rounded-[10px]", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)((_a = member.user) === null || _a === void 0 ? void 0 : _a.avatar, (_b = member.user) === null || _b === void 0 ? void 0 : _b.username), { alt: (_c = member.user) === null || _c === void 0 ? void 0 : _c.username, className: "w-8 h-8 rounded-[10px] cursor-pointer hover:scale-110 transition-transform", onClick: function () { var _a; return handleUserAvatarClick((_a = member.user) === null || _a === void 0 ? void 0 : _a.id); }, title: "View ".concat((_d = member.user) === null || _d === void 0 ? void 0 : _d.username, "'s profile") })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: (_e = member.user) === null || _e === void 0 ? void 0 : _e.username }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: member.role })] })] }) }, "".concat(((_f = member.user) === null || _f === void 0 ? void 0 : _f._id) || ((_g = member.user) === null || _g === void 0 ? void 0 : _g.id), "-").concat(index, "-").concat(refreshKey)));
                                                            }) : ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-4 text-gray-500 dark:text-gray-400", children: "No members yet" })) }, refreshKey)] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("button", { onClick: function () { return setShowLinks(!showLinks); }, className: "flex items-center justify-between w-full cursor-pointer  text-left mb-4 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border rounded-[10px] transition-colors", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-lg  text-gray-900 dark:text-white flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Link, { className: "w-5 h-5 icon" }), "Links (", ((_c = selectedProject.links) === null || _c === void 0 ? void 0 : _c.length) || 0, ")"] }), (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { className: "w-5 h-5 icon text-gray-500 transition-transform duration-200 ".concat(showLinks ? 'rotate-180' : '') })] }), showLinks && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, transition: { duration: 0.3 }, className: "overflow-hidden", children: (0, jsx_runtime_1.jsx)("div", { className: "space-y-2 max-h-40 overflow-y-auto p-6", children: ((_d = selectedProject.links) === null || _d === void 0 ? void 0 : _d.length) > 0 ? (selectedProject.links.map(function (link, index) { return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "flex items-center justify-between p-2 bg-gray-50 dark:bg-black rounded-[10px]", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Link, { className: "w-4 h-4 icon text-gray-500" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: link.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: link.type })] })] }), (0, jsx_runtime_1.jsx)("a", { href: link.url, target: "_blank", rel: "noopener noreferrer", className: "text-gray-500 hover:text-gray-600 text-sm w-[50px] h-[50px] border flex items-center justify-center rounded-[10px]", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowUpRightSquare, { className: "w-4 h-4 icon" }) })] }, index)); })) : ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-8 text-gray-500 dark:text-gray-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Link, { className: "w-12 h-12 mx-auto mb-2 opacity-50" }), (0, jsx_runtime_1.jsx)("p", { children: "No links added to this project" })] })) }) }))] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6 grid grid-cols-1 lg:grid-cols-1 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("button", { onClick: function () { return setShowTasks(!showTasks); }, className: "flex items-center justify-between w-full text-left hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-800 p-4 border rounded-[10px] transition-colors", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-lg  text-gray-900 dark:text-white flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-5 h-5 icon" }), "Tasks (", ((_e = selectedProject.tasks) === null || _e === void 0 ? void 0 : _e.length) || 0, ")"] }), (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { className: "w-5 h-5 icon text-gray-500 transition-transform duration-200 ".concat(showTasks ? 'rotate-180' : '') })] }), showTasks && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, transition: { duration: 0.3 }, className: "overflow-hidden", children: (0, jsx_runtime_1.jsx)("div", { className: "space-y-2 max-h-60 overflow-y-auto p-6", children: ((_f = selectedProject.tasks) === null || _f === void 0 ? void 0 : _f.length) > 0 ? (selectedProject.tasks.map(function (task, index) {
                                                            var _a;
                                                            return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-[10px]", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3 rounded-[10px] ".concat(task.status === 'completed' ? 'bg-green-500' :
                                                                                    task.status === 'in_progress' ? 'bg-gray-500' :
                                                                                        task.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500') }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: task.title || 'Untitled Task' }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: ["Assigned to ", ((_a = task.assignTo) === null || _a === void 0 ? void 0 : _a.username) || 'Unknown', " \u2022 ", task.priority || 'Unknown'] })] })] }), (0, jsx_runtime_1.jsx)("span", { className: "px-2 py-1 rounded-[10px] text-xs font-medium ".concat(task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                                            task.status === 'in_progress' ? 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200' :
                                                                                task.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'), children: task.status ? task.status.replace('_', ' ') : 'Unknown' })] }, index));
                                                        })) : ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-8 text-gray-500 dark:text-gray-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-12 h-12 mx-auto mb-2 opacity-50" }), (0, jsx_runtime_1.jsx)("p", { children: "No tasks assigned to this project" })] })) }) }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("button", { onClick: function () { return setShowMeetings(!showMeetings); }, className: "flex items-center justify-between w-full text-left cursor-pointer mb-4 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border rounded-[10px] transition-colors", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-lg  text-gray-900 dark:text-white flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "w-5 h-5 icon icon" }), "Meetings (", ((_g = selectedProject.meetings) === null || _g === void 0 ? void 0 : _g.length) || 0, ")"] }), (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { className: "w-5 h-5 icon text-gray-500 transition-transform duration-200 ".concat(showMeetings ? 'rotate-180' : '') })] }), showMeetings && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, transition: { duration: 0.3 }, className: "overflow-hidden", children: (0, jsx_runtime_1.jsx)("div", { className: "space-y-2 max-h-60 overflow-y-auto p-6", children: ((_h = selectedProject.meetings) === null || _h === void 0 ? void 0 : _h.length) > 0 ? (selectedProject.meetings.map(function (meeting, index) { return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-[10px]", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3 rounded-[10px] ".concat(meeting.status === 'completed' ? 'bg-green-500' :
                                                                                meeting.status === 'scheduled' ? 'bg-gray-500' :
                                                                                    meeting.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500') }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: meeting.title || 'Untitled Meeting' }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: [meeting.type || 'Unknown', " \u2022 ", formatDate(meeting.startDate)] })] })] }), (0, jsx_runtime_1.jsx)("span", { className: "px-2 py-1 rounded-[10px] text-xs font-medium ".concat(meeting.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                                        meeting.status === 'scheduled' ? 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200' :
                                                                            meeting.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'), children: meeting.status || 'Unknown' })] }, index)); })) : ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-8 text-gray-500 dark:text-gray-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "w-12 h-12 mx-auto mb-2 opacity-50" }), (0, jsx_runtime_1.jsx)("p", { children: "No meetings scheduled for this project" })] })) }) }))] })] }), isProjectOwner(selectedProject) && ((0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3 mt-6 pt-4  icon border-gray-200 dark:border-gray-700", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: function () {
                                                setProjectProgress(selectedProject.progress || 0);
                                                setShowProgressModal(true);
                                            }, className: "flex-1 h-12 rounded-[10px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { className: "w-4 h-4 icon mr-2" }), "Update Progress"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: function () {
                                                setShowMembersModal(true);
                                            }, className: "flex-1 h-12 rounded-[10px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { className: "w-4 h-4 icon mr-2" }), "Edit Members"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: function () {
                                                setShowLinksModal(true);
                                            }, className: "flex-1 h-12 rounded-[10px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Link, { className: "w-4 h-4 icon mr-2" }), "Manage Links"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: function () { return handleViewProject(selectedProject); }, className: "flex-1 h-12 rounded-[10px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: "w-4 h-4 icon mr-2" }), "Refresh"] })] }))] }) }) })), showProgressModal && selectedProject && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-50", onClick: function () { return setShowProgressModal(false); }, children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: "bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-md w-full p-6", onClick: function (e) { return e.stopPropagation(); }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl  text-gray-900 dark:text-white", children: "Update Progress" }), (0, jsx_runtime_1.jsx)("button", { onClick: function () { return setShowProgressModal(false); }, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-6 h-6 icon" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: ["Progress: ", projectProgress, "%"] }), (0, jsx_runtime_1.jsx)("input", { type: "range", min: "0", max: "100", value: projectProgress, onChange: function (e) { return setProjectProgress(parseInt(e.target.value)); }, className: "w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-[10px] appearance-none cursor-pointer" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: function () { return setShowProgressModal(false); }, className: "flex-1 h-12 rounded-[10px]", children: "Cancel" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleUpdateProgress, className: "flex-1 h-12 rounded-[10px]", children: "Update Progress" })] })] })] }) })), showMembersModal && selectedProject && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-50", onClick: function () { return setShowMembersModal(false); }, children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: "bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto", onClick: function (e) { return e.stopPropagation(); }, children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)("h2", { className: "text-xl  text-gray-900 dark:text-white", children: ["Manage Members - ", selectedProject.name] }), (0, jsx_runtime_1.jsx)("button", { onClick: function () { return setShowMembersModal(false); }, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-6 h-6 icon" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { value: projectMemberSearch, onChange: function (e) { return handleProjectMemberSearch(e.target.value); }, placeholder: "Search users...", className: "flex-1 h-12 rounded-[10px]" }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: projectMemberRole, onValueChange: setProjectMemberRole, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-32", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Role" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "member", children: "Member" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "admin", children: "Admin" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "viewer", children: "Viewer" })] })] })] }), showProjectMemberSuggestions && projectMemberSuggestions.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "mt-2 border border-gray-200 dark:border-gray-700 rounded-[10px] bg-white dark:bg-black max-h-40 overflow-y-auto", children: projectMemberSuggestions.map(function (user) { return ((0, jsx_runtime_1.jsxs)("div", { onClick: function () {
                                                            handleAddMemberToProject(user.id, projectMemberRole);
                                                            setProjectMemberSearch('');
                                                            setShowProjectMemberSuggestions(false);
                                                        }, className: "flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer", children: [(0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)(user.avatar, user.username), { alt: user.username, className: "w-10 h-10 rounded-[10px]" })), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-900 dark:text-white ", children: user.username }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-900 dark:text-white", children: user.email })] })] }, user.id)); }) }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg  text-gray-900 dark:text-white mb-2", children: "Current Members" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2 max-h-60 overflow-y-auto", children: (_j = selectedProject.members) === null || _j === void 0 ? void 0 : _j.map(function (member, index) {
                                                        var _a, _b, _c, _d, _e, _f, _g;
                                                        return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-[10px]", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)((_a = member.user) === null || _a === void 0 ? void 0 : _a.avatar, (_b = member.user) === null || _b === void 0 ? void 0 : _b.username), { alt: (_c = member.user) === null || _c === void 0 ? void 0 : _c.username, className: "w-8 h-8 rounded-[10px] cursor-pointer hover:scale-110 transition-transform", onClick: function () { var _a; return handleUserAvatarClick((_a = member.user) === null || _a === void 0 ? void 0 : _a.id); }, title: "View ".concat((_d = member.user) === null || _d === void 0 ? void 0 : _d.username, "'s profile") })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: (_e = member.user) === null || _e === void 0 ? void 0 : _e.username }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: [member.role == "owner" ? "Created" : "Joined", " ", new Date(member.joinedAt).toLocaleDateString()] })] })] }), member.role !== "owner" && (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { var _a; return handleRemoveMemberFromProject((_a = member.user) === null || _a === void 0 ? void 0 : _a._id); }, className: "text-red-500 hover:text-red-700 w-12 border", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "w-4 h-4 icon" }) })] }, "".concat(((_f = member.user) === null || _f === void 0 ? void 0 : _f._id) || ((_g = member.user) === null || _g === void 0 ? void 0 : _g.id), "-").concat(index, "-").concat(refreshKey)));
                                                    }) }, refreshKey)] })] })] }) }) })), showLinksModal && selectedProject && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-50", onClick: function () { return setShowLinksModal(false); }, children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: "bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto", onClick: function (e) { return e.stopPropagation(); }, children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl  text-gray-900 dark:text-white", children: "Manage Links" }), (0, jsx_runtime_1.jsx)("button", { onClick: function () { return setShowLinksModal(false); }, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-6 h-6 icon" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg  text-gray-900 dark:text-white mb-2", children: "Add Link" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { value: newLink.title, onChange: function (e) { return setNewLink(__assign(__assign({}, newLink), { title: e.target.value })); }, placeholder: "Link title" }), (0, jsx_runtime_1.jsx)(input_1.Input, { value: newLink.url, onChange: function (e) { return setNewLink(__assign(__assign({}, newLink), { url: e.target.value })); }, placeholder: "URL" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mt-2", children: [(0, jsx_runtime_1.jsxs)(select_1.Select, { value: newLink.type, onValueChange: function (value) { return setNewLink(__assign(__assign({}, newLink), { type: value })); }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-40", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Type" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "repository", children: "Repository" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "documentation", children: "Documentation" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "design", children: "Design" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "other", children: "Other" })] })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: function () {
                                                                if (newLink.title && newLink.url) {
                                                                    handleAddLinkToProject(newLink);
                                                                    setNewLink({ title: '', url: '', type: 'other' });
                                                                }
                                                            }, className: "flex-1 h-12 rounded-[10px]", children: "Add Link" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg  text-gray-900 dark:text-white mb-2", children: "Current Links" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2 max-h-60 overflow-y-auto", children: (_k = selectedProject.links) === null || _k === void 0 ? void 0 : _k.map(function (link, index) { return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-[10px]", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Link, { className: "w-4 h-4 icon text-gray-500" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: link.title }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: [link.type, " \u2022 ", link.url] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("a", { href: link.url, target: "_blank", rel: "noopener noreferrer", className: "text-gray-500 hover:text-gray-600 text-sm", children: "Open" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleRemoveLinkFromProject(link._id); }, className: "text-red-500 hover:text-red-700", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "w-4 h-4 icon" }) })] })] }, index)); }) })] })] })] }) }) })), (0, jsx_runtime_1.jsx)(UserDetailsModal_1.default, { userId: selectedUserId, isOpen: showUserDetails, onClose: function () {
                        setShowUserDetails(false);
                        setSelectedUserId(null);
                    } })] }) }));
};
exports.default = Projects;
