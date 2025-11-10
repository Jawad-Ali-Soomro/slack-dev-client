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
var HorizontalLoader_1 = require("../components/HorizontalLoader");
var githubService_1 = require("../services/githubService");
var button_1 = require("../components/ui/button");
var react_router_dom_1 = require("react-router-dom");
var card_1 = require("../components/ui/card");
var table_1 = require("../components/ui/table");
var badge_1 = require("../components/ui/badge");
var input_1 = require("../components/ui/input");
// Removed Dialog import - using custom modal
var label_1 = require("../components/ui/label");
var textarea_1 = require("../components/ui/textarea");
var select_1 = require("../components/ui/select");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var GitHubPRsModal_1 = require("../components/GitHubPRsModal");
var GitHubPullRequests = function () {
    var _a = (0, react_1.useState)([]), pullRequests = _a[0], setPullRequests = _a[1];
    var _b = (0, react_1.useState)([]), repositories = _b[0], setRepositories = _b[1];
    var _c = (0, react_1.useState)([]), friends = _c[0], setFriends = _c[1];
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(''), searchTerm = _e[0], setSearchTerm = _e[1];
    var _f = (0, react_1.useState)('all'), statusFilter = _f[0], setStatusFilter = _f[1];
    var _g = (0, react_1.useState)('all'), repositoryFilter = _g[0], setRepositoryFilter = _g[1];
    var _h = (0, react_1.useState)('all'), priorityFilter = _h[0], setPriorityFilter = _h[1];
    var _j = (0, react_1.useState)(false), isCreateDialogOpen = _j[0], setIsCreateDialogOpen = _j[1];
    var _k = (0, react_1.useState)(false), isEditDialogOpen = _k[0], setIsEditDialogOpen = _k[1];
    var _l = (0, react_1.useState)(false), isGitHubPRsModalOpen = _l[0], setIsGitHubPRsModalOpen = _l[1];
    var _m = (0, react_1.useState)(null), editingPR = _m[0], setEditingPR = _m[1];
    var _o = (0, react_1.useState)({
        title: '',
        description: '',
        githubUrl: '',
        githubHash: '',
        repository: '',
        assignedTo: '',
        team: '',
        labels: [],
        priority: 'medium',
        estimatedHours: '',
        dueDate: ''
    }), formData = _o[0], setFormData = _o[1];
    var _p = (0, react_1.useState)(''), labelInput = _p[0], setLabelInput = _p[1];
    var navigate = (0, react_router_dom_1.useNavigate)();
    (0, react_1.useEffect)(function () {
        var debounceTimer = setTimeout(function () {
            fetchData();
        }, 300);
        return function () { return clearTimeout(debounceTimer); };
    }, [searchTerm, statusFilter, repositoryFilter, priorityFilter]);
    var fetchData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, prsResponse, reposResponse, friendsResponse, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, Promise.all([
                            githubService_1.githubService.getPullRequests({
                                search: searchTerm,
                                status: statusFilter === 'all' ? undefined : statusFilter,
                                repository: repositoryFilter === 'all' ? undefined : repositoryFilter,
                                priority: priorityFilter === 'all' ? undefined : priorityFilter
                            }),
                            githubService_1.githubService.getRepositories(),
                            githubService_1.githubService.getFriends()
                        ])];
                case 1:
                    _a = _b.sent(), prsResponse = _a[0], reposResponse = _a[1], friendsResponse = _a[2];
                    setPullRequests(prsResponse.pullRequests || []);
                    setRepositories(reposResponse.repositories || []);
                    setFriends(friendsResponse.friends || []);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _b.sent();
                    console.error('Error fetching data:', error_1);
                    sonner_1.toast.error('Failed to fetch data');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleCreatePullRequest = function () { return __awaiter(void 0, void 0, void 0, function () {
        var prData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    prData = __assign(__assign({}, formData), { assignedTo: formData.assignedTo === 'none' ? undefined : formData.assignedTo, labels: formData.labels.filter(function (label) { return label.trim() !== ''; }), estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined, dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined });
                    return [4 /*yield*/, githubService_1.githubService.createPullRequest(prData)];
                case 1:
                    _a.sent();
                    sonner_1.toast.success('Pull request created successfully');
                    setIsCreateDialogOpen(false);
                    resetForm();
                    fetchData();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error creating pull request:', error_2);
                    sonner_1.toast.error(error_2.message || 'Failed to create pull request');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleCreateFromGitHub = function (prData) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, githubService_1.githubService.createPullRequest(prData)];
                case 1:
                    _a.sent();
                    sonner_1.toast.success('Pull request imported successfully');
                    fetchData();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error importing pull request:', error_3);
                    sonner_1.toast.error(error_3.message || 'Failed to import pull request');
                    throw error_3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleUpdatePullRequest = function () { return __awaiter(void 0, void 0, void 0, function () {
        var updateData, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    updateData = __assign(__assign({}, formData), { assignedTo: formData.assignedTo === 'none' ? undefined : formData.assignedTo, labels: formData.labels.filter(function (label) { return label.trim() !== ''; }), estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined, dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined });
                    return [4 /*yield*/, githubService_1.githubService.updatePullRequest(editingPR._id, updateData)];
                case 1:
                    _a.sent();
                    sonner_1.toast.success('Pull request updated successfully');
                    setIsEditDialogOpen(false);
                    setEditingPR(null);
                    resetForm();
                    fetchData();
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error updating pull request:', error_4);
                    sonner_1.toast.error(error_4.message || 'Failed to update pull request');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleDeletePullRequest = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Are you sure you want to delete this pull request?')) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, githubService_1.githubService.deletePullRequest(id)];
                case 2:
                    _a.sent();
                    sonner_1.toast.success('Pull request deleted successfully');
                    fetchData();
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error('Error deleting pull request:', error_5);
                    sonner_1.toast.error(error_5.message || 'Failed to delete pull request');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleEditPullRequest = function (pr) {
        var _a, _b, _c;
        setEditingPR(pr);
        setFormData({
            title: pr.title,
            description: pr.description || '',
            githubUrl: pr.githubUrl,
            githubHash: pr.githubHash,
            repository: pr.repository._id,
            assignedTo: ((_a = pr.assignedTo) === null || _a === void 0 ? void 0 : _a._id) || '',
            team: ((_b = pr.team) === null || _b === void 0 ? void 0 : _b._id) || '',
            labels: pr.labels || [],
            priority: pr.priority,
            estimatedHours: ((_c = pr.estimatedHours) === null || _c === void 0 ? void 0 : _c.toString()) || '',
            dueDate: pr.dueDate ? new Date(pr.dueDate).toISOString().split('T')[0] : ''
        });
        setIsEditDialogOpen(true);
    };
    var resetForm = function () {
        setFormData({
            title: '',
            description: '',
            githubUrl: '',
            githubHash: '',
            repository: '',
            assignedTo: '',
            team: '',
            labels: [],
            priority: 'medium',
            estimatedHours: '',
            dueDate: ''
        });
        setLabelInput('');
    };
    var addLabel = function () {
        if (labelInput.trim() && !formData.labels.includes(labelInput.trim())) {
            setFormData(function (prev) { return (__assign(__assign({}, prev), { labels: __spreadArray(__spreadArray([], prev.labels, true), [labelInput.trim()], false) })); });
            setLabelInput('');
        }
    };
    var removeLabel = function (labelToRemove) {
        setFormData(function (prev) { return (__assign(__assign({}, prev), { labels: prev.labels.filter(function (label) { return label !== labelToRemove; }) })); });
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case 'open':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "h-4 w-4 icon text-green-500" });
            case 'closed':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "h-4 w-4 icon text-red-500" });
            case 'merged':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "h-4 w-4 icon text-blue-500" });
            case 'draft':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-4 w-4 icon text-yellow-500" });
            default:
                return (0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-4 w-4 icon text-gray-500" });
        }
    };
    var getStatusColor = function (status) {
        switch (status) {
            case 'open':
                return 'bg-green-500 text-white  dark:bg-green-900 dark:text-green-200';
            case 'closed':
                return 'bg-red-500 text-white dark:bg-red-900 dark:text-red-200';
            case 'merged':
                return 'bg-blue-500 text-white dark:bg-blue-900 dark:text-blue-200';
            case 'draft':
                return 'bg-yellow-500 text-white dark:bg-yellow-900 dark:text-yellow-200';
            default:
                return 'bg-gray-500 text-white dark:bg-gray-900 dark:text-gray-200';
        }
    };
    var getPriorityColor = function (priority) {
        switch (priority) {
            case 'critical':
                return 'bg-red-500 text-whites dark:bg-red-900 dark:text-red-200';
            case 'high':
                return 'bg-orange-500 text-white dark:bg-orange-900 dark:text-orange-200';
            case 'medium':
                return 'bg-blue-500 text-white dark:bg-blue-900 dark:text-blue-200';
            case 'low':
                return 'bg-gray-500 text-white dark:bg-gray-900 dark:text-gray-200';
            default:
                return 'bg-gray-500 text-white dark:bg-gray-900 dark:text-gray-200';
        }
    };
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: 'mt-10 ambient-light', children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative flex-1 max-w-[600px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 icon" }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Search pull requests...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-10 w-[500px]" })] }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-48 cursor-pointer px-5", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Filter by status" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "all", children: "All Status" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "open", children: "Open" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "closed", children: "Closed" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "merged", children: "Merged" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "draft", children: "Draft" })] })] }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: repositoryFilter, onValueChange: setRepositoryFilter, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-48 px-5 cursor-pointer", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Filter by repository" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { className: "max-h-[400px]", children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "all", children: "All Repositories" }), repositories.map(function (repo) {
                                                            var _a;
                                                            return ((0, jsx_runtime_1.jsxs)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: repo._id, children: [((_a = repo.owner) === null || _a === void 0 ? void 0 : _a.username) || 'Unknown', "/", repo.name] }, repo._id));
                                                        })] })] }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: priorityFilter, onValueChange: setPriorityFilter, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-48 px-5 cursor-pointer", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Filter by priority" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "all", children: "All Priority" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "critical", children: "Critical" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "high", children: "High" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "medium", children: "Medium" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "low", children: "Low" })] })] })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { onClick: function () { return setIsCreateDialogOpen(true); }, className: 'w-[200px] font-bold', children: "New Pull Request" }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: function () { return setIsGitHubPRsModalOpen(true); }, variant: "outline", className: 'w-[200px] font-bold', children: [(0, jsx_runtime_1.jsx)(lucide_react_1.GitPullRequest, { className: "h-4 w-4 icon mr-2" }), "Import from github"] })] })] }), isCreateDialogOpen && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 backdrop-blur-sm bg-opacity-50 bg-black/50 flex items-center justify-center z-50", onClick: function () { return setIsCreateDialogOpen(false); }, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-black border rounded-[10px] p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto", onClick: function (e) { return e.stopPropagation(); }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("h2", { className: "text-xl ", children: "Add New Pull Request" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setIsCreateDialogOpen(false); }, className: 'w-12', children: (0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "h-4 w-4 icon" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { id: "title", value: formData.title, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { title: e.target.value })); }); }, placeholder: "Pull request title" }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { id: "description", value: formData.description, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { description: e.target.value })); }); }, placeholder: "Pull request description" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { id: "githubUrl", value: formData.githubUrl, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { githubUrl: e.target.value })); }); }, placeholder: "https://github.com/owner/repo/pull/123" }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { id: "githubHash", value: formData.githubHash, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { githubHash: e.target.value })); }); }, placeholder: "123" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(select_1.Select, { value: formData.repository, onValueChange: function (value) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { repository: value })); }); }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Select repository" }) }), (0, jsx_runtime_1.jsx)(select_1.SelectContent, { className: "z-[60]", children: repositories.map(function (repo) {
                                                                    var _a;
                                                                    return ((0, jsx_runtime_1.jsxs)(select_1.SelectItem, { value: repo._id, children: [((_a = repo.owner) === null || _a === void 0 ? void 0 : _a.username) || 'Unknown', "/", repo.name] }, repo._id));
                                                                }) })] }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(select_1.Select, { value: formData.priority, onValueChange: function (value) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { priority: value })); }); }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { className: "z-[60]", children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "low", children: "Low" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "medium", children: "Medium" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "high", children: "High" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "critical", children: "Critical" })] })] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { id: "estimatedHours", type: "number", value: formData.estimatedHours, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { estimatedHours: e.target.value })); }); }, placeholder: "0" }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { id: "dueDate", type: "date", value: formData.dueDate, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { dueDate: e.target.value })); }); } }) })] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(select_1.Select, { value: formData.assignedTo, onValueChange: function (value) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { assignedTo: value })); }); }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Select assigned user" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { className: "z-[60]", children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "none", children: "No one assigned" }), friends.map(function (friend) {
                                                                var _a, _b;
                                                                return ((0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: friend._id, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [friend.avatar ? ((0, jsx_runtime_1.jsx)("img", { src: "".concat(import.meta.env.VITE_API_URL || 'http://localhost:4000').concat(friend.avatar), alt: friend.username, className: "w-5 h-5 icon rounded-full" })) : ((0, jsx_runtime_1.jsx)("div", { className: "w-5 h-5 icon rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white  text-xs", children: ((_b = (_a = friend.username) === null || _a === void 0 ? void 0 : _a.charAt(0)) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || 'U' })), (0, jsx_runtime_1.jsxs)("span", { children: [friend.username, " (", friend.email, ")"] })] }) }, friend._id));
                                                            })] })] }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mb-2", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { value: labelInput, onChange: function (e) { return setLabelInput(e.target.value); }, placeholder: "Add a label", onKeyPress: function (e) { return e.key === 'Enter' && addLabel(); } }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", className: 'w-12', onClick: addLabel, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Plus, {}) })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: formData.labels.map(function (label, index) { return ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "secondary", className: "cursor-pointer", onClick: function () { return removeLabel(label); }, children: [label, " \u00D7"] }, index)); }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end gap-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: function () { return setIsCreateDialogOpen(false); }, children: "Cancel" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleCreatePullRequest, children: "Create Pull Request" })] })] })] }) }))] }), loading ? ((0, jsx_runtime_1.jsx)(HorizontalLoader_1.default, { message: "Loading pull requests...", subMessage: "Fetching your GitHub pull requests", progress: 85, className: "py-12" })) : pullRequests.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.GitPullRequest, { className: "h-12 w-12 mx-auto mb-4 text-gray-400" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg  mb-2", children: "No pull requests found" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400 mb-4", children: searchTerm ? 'Try adjusting your search terms' : 'You haven\'t logged any pull requests yet' }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: function () { return setIsCreateDialogOpen(true); }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4 icon mr-2" }), "Add Your First Pull Request"] })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "bg-white dark:bg-black rounded-[10px] shadow-xl overflow-hidden", children: (0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800", children: (0, jsx_runtime_1.jsxs)(table_1.Table, { children: [(0, jsx_runtime_1.jsx)(table_1.TableHeader, { className: "bg-gray-100 text-black dark:border-gray-700 sticky top-0 z-10", children: (0, jsx_runtime_1.jsxs)(table_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(table_1.TableHead, { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Pull Request" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Pull Hash" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Repository" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Status" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Priority" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Assigned To" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { className: "px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider", children: "Due Date" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { className: "px-6 py-4 text-right text-xs  text-gray-700 dark:text-gray-300 uppercase tracking-wider" })] }) }), (0, jsx_runtime_1.jsx)(table_1.TableBody, { className: "divide-y divide-gray-200 dark:divide-gray-700", children: pullRequests.map(function (pr) {
                                    var _a, _b, _c, _d, _e, _f, _g, _h;
                                    return ((0, jsx_runtime_1.jsxs)(table_1.TableRow, { className: "hover:bg-gray-50 dark:hover:bg-black transition-colors", children: [(0, jsx_runtime_1.jsx)(table_1.TableCell, { className: "px-6 py-4", children: (0, jsx_runtime_1.jsx)("div", { className: "flex items-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2", children: [getStatusIcon(pr.status), pr.title] }) }) }), (0, jsx_runtime_1.jsx)(table_1.TableCell, { className: "px-6 py-4", children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-900 dark:text-gray-100", children: pr.githubHash }) }), (0, jsx_runtime_1.jsx)(table_1.TableCell, { className: "px-6 py-4", children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-900 dark:text-gray-100", children: ((_a = pr.repository) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown' }) }), (0, jsx_runtime_1.jsx)(table_1.TableCell, { className: "px-6 py-4", children: (0, jsx_runtime_1.jsx)(badge_1.Badge, { className: getStatusColor(pr.status) + ' px-3 py-2', children: pr.status }) }), (0, jsx_runtime_1.jsx)(table_1.TableCell, { className: "px-6 py-4", children: (0, jsx_runtime_1.jsx)(badge_1.Badge, { className: getPriorityColor(pr.priority) + ' px-3 py-2', children: pr.priority }) }), (0, jsx_runtime_1.jsx)(table_1.TableCell, { className: "px-6 py-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex -space-x-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "relative", children: ((_b = pr === null || pr === void 0 ? void 0 : pr.assignedTo) === null || _b === void 0 ? void 0 : _b.avatar) ? ((0, jsx_runtime_1.jsx)("img", { className: "h-8 w-8 rounded-full  border-white dark:border-gray-800", src: "".concat(import.meta.env.VITE_API_URL || 'http://localhost:4000').concat((_c = pr === null || pr === void 0 ? void 0 : pr.assignedTo) === null || _c === void 0 ? void 0 : _c.avatar), alt: (_d = pr === null || pr === void 0 ? void 0 : pr.assignedTo) === null || _d === void 0 ? void 0 : _d.username })) : ((0, jsx_runtime_1.jsx)("div", { className: "h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white  text-xs  border-white dark:border-gray-800", children: ((_g = (_f = (_e = pr === null || pr === void 0 ? void 0 : pr.assignedTo) === null || _e === void 0 ? void 0 : _e.username) === null || _f === void 0 ? void 0 : _f.charAt(0)) === null || _g === void 0 ? void 0 : _g.toUpperCase()) || 'U' })) }), ((_h = pr === null || pr === void 0 ? void 0 : pr.assignedTo) === null || _h === void 0 ? void 0 : _h.length) > 3 && ((0, jsx_runtime_1.jsxs)("div", { className: "h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300  border-white dark:border-gray-800", children: ["+", (pr === null || pr === void 0 ? void 0 : pr.assignedTo.length) - 3] }))] }) }), (0, jsx_runtime_1.jsx)(table_1.TableCell, { className: "px-6 py-4", children: pr.dueDate ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "h-4 w-4 icon" }), formatDate(pr.dueDate)] })) : ((0, jsx_runtime_1.jsx)("span", { className: "text-gray-400 dark:text-gray-500", children: "-" })) }), (0, jsx_runtime_1.jsx)(table_1.TableCell, { className: "px-6 py-4 text-right", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-end gap-1", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return window.open(pr.githubUrl, '_blank'); }, className: "w-12 hover:bg-blue-100 dark:hover:bg-blue-900/20", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ExternalLink, { className: "h-4 w-4 icon text-blue-500" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEditPullRequest(pr); }, className: "w-12 hover:bg-gray-100 dark:hover:bg-gray-700", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "h-4 w-4 icon" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDeletePullRequest(pr._id); }, className: "w-12 hover:bg-red-100 dark:hover:bg-red-900/20", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4 icon text-red-500" }) })] }) })] }, pr._id));
                                }) })] }) }) })), isEditDialogOpen && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50", onClick: function () { return setIsEditDialogOpen(false); }, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-black rounded-[30px] border p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto", onClick: function (e) { return e.stopPropagation(); }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl ", children: "Edit Pull Request" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400 text-sm", children: "Update pull request information" })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setIsEditDialogOpen(false); }, className: 'w-12', children: (0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "h-4 w-4 icon" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "edit-title", children: "Title" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "edit-title", value: formData.title, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { title: e.target.value })); }); } })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "edit-description", children: "Description" }), (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { id: "edit-description", value: formData.description, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { description: e.target.value })); }); } })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "edit-githubUrl", children: "GitHub URL" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "edit-githubUrl", value: formData.githubUrl, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { githubUrl: e.target.value })); }); } })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "edit-githubHash", children: "PR Number/Hash" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "edit-githubHash", value: formData.githubHash, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { githubHash: e.target.value })); }); } })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "edit-repository", children: "Repository" }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: formData.repository, onValueChange: function (value) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { repository: value })); }); }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Select repository" }) }), (0, jsx_runtime_1.jsx)(select_1.SelectContent, { className: "z-[60]", children: repositories.map(function (repo) {
                                                                var _a;
                                                                return ((0, jsx_runtime_1.jsxs)(select_1.SelectItem, { value: repo._id, children: [((_a = repo.owner) === null || _a === void 0 ? void 0 : _a.username) || 'Unknown', "/", repo.name] }, repo._id));
                                                            }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "edit-priority", children: "Priority" }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: formData.priority, onValueChange: function (value) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { priority: value })); }); }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { className: "z-[60]", children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "low", children: "Low" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "medium", children: "Medium" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "high", children: "High" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "critical", children: "Critical" })] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "edit-estimatedHours", children: "Estimated Hours" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "edit-estimatedHours", type: "number", value: formData.estimatedHours, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { estimatedHours: e.target.value })); }); } })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "edit-dueDate", children: "Due Date" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "edit-dueDate", type: "date", value: formData.dueDate, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { dueDate: e.target.value })); }); } })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Labels" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mb-2", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { value: labelInput, onChange: function (e) { return setLabelInput(e.target.value); }, placeholder: "Add a label", onKeyPress: function (e) { return e.key === 'Enter' && addLabel(); } }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", onClick: addLabel, children: "Add" })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: formData.labels.map(function (label, index) { return ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "secondary", className: "cursor-pointer", onClick: function () { return removeLabel(label); }, children: [label, " \u00D7"] }, index)); }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end gap-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: function () { return setIsEditDialogOpen(false); }, children: "Cancel" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleUpdatePullRequest, children: "Update Pull Request" })] })] })] }) })), (0, jsx_runtime_1.jsx)(GitHubPRsModal_1.default, { isOpen: isGitHubPRsModalOpen, onClose: function () { return setIsGitHubPRsModalOpen(false); }, onCreatePR: handleCreateFromGitHub })] }));
};
exports.default = GitHubPullRequests;
