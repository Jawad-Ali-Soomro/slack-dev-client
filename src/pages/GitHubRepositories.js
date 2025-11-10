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
var HorizontalLoader_1 = require("../components/HorizontalLoader");
var githubService_1 = require("../services/githubService");
var button_1 = require("../components/ui/button");
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
var GitHubUserReposModal_1 = require("../components/GitHubUserReposModal");
var GitHubRepositories = function () {
    var _a = (0, react_1.useState)([]), repositories = _a[0], setRepositories = _a[1];
    var _b = (0, react_1.useState)([]), friends = _b[0], setFriends = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(''), searchTerm = _d[0], setSearchTerm = _d[1];
    var _e = (0, react_1.useState)('all'), statusFilter = _e[0], setStatusFilter = _e[1];
    var _f = (0, react_1.useState)(false), isCreateDialogOpen = _f[0], setIsCreateDialogOpen = _f[1];
    var _g = (0, react_1.useState)(false), isEditDialogOpen = _g[0], setIsEditDialogOpen = _g[1];
    var _h = (0, react_1.useState)(false), isGitHubUserModalOpen = _h[0], setIsGitHubUserModalOpen = _h[1];
    var _j = (0, react_1.useState)(null), editingRepo = _j[0], setEditingRepo = _j[1];
    var _k = (0, react_1.useState)({
        name: '',
        description: '',
        githubUrl: '',
        language: '',
        isPrivate: false,
        tags: [],
        contributors: []
    }), formData = _k[0], setFormData = _k[1];
    var _l = (0, react_1.useState)(''), tagInput = _l[0], setTagInput = _l[1];
    var navigate = (0, react_router_dom_1.useNavigate)();
    (0, react_1.useEffect)(function () {
        var debounceTimer = setTimeout(function () {
            fetchData();
        }, 300);
        return function () { return clearTimeout(debounceTimer); };
    }, [searchTerm, statusFilter]);
    var fetchData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, reposResponse, friendsResponse, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, Promise.all([
                            githubService_1.githubService.getRepositories({
                                search: searchTerm,
                                status: statusFilter === 'all' ? undefined : statusFilter
                            }),
                            githubService_1.githubService.getFriends()
                        ])];
                case 1:
                    _a = _b.sent(), reposResponse = _a[0], friendsResponse = _a[1];
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
    var handleCreateRepository = function () { return __awaiter(void 0, void 0, void 0, function () {
        var repositoryData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    repositoryData = __assign(__assign({}, formData), { tags: formData.tags.filter(function (tag) { return tag.trim() !== ''; }) });
                    return [4 /*yield*/, githubService_1.githubService.createRepository(repositoryData)];
                case 1:
                    _a.sent();
                    sonner_1.toast.success('Repository created successfully');
                    setIsCreateDialogOpen(false);
                    resetForm();
                    fetchData();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error creating repository:', error_2);
                    sonner_1.toast.error(error_2.message || 'Failed to create repository');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleCreateFromGitHub = function (repoData) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, githubService_1.githubService.createRepository(repoData)];
                case 1:
                    _a.sent();
                    sonner_1.toast.success('Repository imported successfully');
                    fetchData();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error importing repository:', error_3);
                    sonner_1.toast.error(error_3.message || 'Failed to import repository');
                    throw error_3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleUpdateRepository = function () { return __awaiter(void 0, void 0, void 0, function () {
        var updateData, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    updateData = __assign(__assign({}, formData), { tags: formData.tags.filter(function (tag) { return tag.trim() !== ''; }) });
                    return [4 /*yield*/, githubService_1.githubService.updateRepository(editingRepo._id, updateData)];
                case 1:
                    _a.sent();
                    sonner_1.toast.success('Repository updated successfully');
                    setIsEditDialogOpen(false);
                    setEditingRepo(null);
                    resetForm();
                    fetchData();
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error updating repository:', error_4);
                    sonner_1.toast.error(error_4.message || 'Failed to update repository');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteRepository = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Are you sure you want to delete this repository? This will also delete all associated PRs and issues.')) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, githubService_1.githubService.deleteRepository(id)];
                case 2:
                    _a.sent();
                    sonner_1.toast.success('Repository deleted successfully');
                    fetchData();
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error('Error deleting repository:', error_5);
                    sonner_1.toast.error(error_5.message || 'Failed to delete repository');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleEditRepository = function (repo) {
        var _a;
        setEditingRepo(repo);
        setFormData({
            name: repo.name,
            description: repo.description || '',
            githubUrl: repo.githubUrl,
            language: repo.language || '',
            isPrivate: repo.isPrivate,
            tags: repo.tags || [],
            contributors: ((_a = repo.contributors) === null || _a === void 0 ? void 0 : _a.map(function (c) { return c._id; })) || []
        });
        setIsEditDialogOpen(true);
    };
    var resetForm = function () {
        setFormData({
            name: '',
            description: '',
            githubUrl: '',
            language: '',
            isPrivate: false,
            tags: [],
            contributors: []
        });
        setTagInput('');
    };
    var addTag = function () {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(function (prev) { return (__assign(__assign({}, prev), { tags: __spreadArray(__spreadArray([], prev.tags, true), [tagInput.trim()], false) })); });
            setTagInput('');
        }
    };
    var removeTag = function (tagToRemove) {
        setFormData(function (prev) { return (__assign(__assign({}, prev), { tags: prev.tags.filter(function (tag) { return tag !== tagToRemove; }) })); });
    };
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    var filteredRepositories = repositories.filter(function (repo) {
        var _a, _b, _c;
        return ((_a = repo.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase())) ||
            ((_c = (_b = repo.owner) === null || _b === void 0 ? void 0 : _b.username) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    return ((0, jsx_runtime_1.jsxs)("div", { className: 'mt-10 ambient-light', children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative flex-1 max-w-[600px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 icon" }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Search repositories...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-10 w-[500px]" })] }), (0, jsx_runtime_1.jsxs)(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: "w-48 px-5 cursor-pointer", children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Filter by status" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "all", children: "All Status" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "active", children: "Active" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "archived", children: "Archived" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { className: 'px-5 h-10 cursor-pointer', value: "deprecated", children: "Deprecated" })] })] })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { onClick: function () { return setIsCreateDialogOpen(true); }, className: 'w-[200px] font-bold', children: "New Repository" }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: function () { return setIsGitHubUserModalOpen(true); }, variant: "outline", className: 'w-[200px] font-bold', children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Import, { className: "h-4 w-4 icon mr-2" }), "Import from github"] })] })] }), isCreateDialogOpen && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 backdrop-blur-sm bg-opacity-50 bg-black/50 flex items-center justify-center z-50", onClick: function () { return setIsCreateDialogOpen(false); }, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-black rounded-[30px] border p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto", onClick: function (e) { return e.stopPropagation(); }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("h2", { className: "text-xl ", children: "Add New Repository" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setIsCreateDialogOpen(false); }, className: 'w-12', children: (0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "h-4 w-4 icon" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { value: formData.name, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { name: e.target.value })); }); }, placeholder: "Repository Name" }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { value: formData.githubUrl, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { githubUrl: e.target.value })); }); }, placeholder: "GitHub URL (https://github.com/owner/repo)" }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { value: formData.description, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { description: e.target.value })); }); }, placeholder: "Repository Description" }) }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 gap-4", children: (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { value: formData.language, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { language: e.target.value })); }); }, placeholder: "Language (JavaScript, Python, etc.)" }) }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)(select_1.Select, { value: "", onValueChange: function (value) {
                                                        if (value && !formData.contributors.includes(value)) {
                                                            setFormData(function (prev) { return (__assign(__assign({}, prev), { contributors: __spreadArray(__spreadArray([], prev.contributors, true), [value], false) })); });
                                                        }
                                                    }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Select contributors from friends" }) }), (0, jsx_runtime_1.jsx)(select_1.SelectContent, { className: "z-[60]", children: friends.map(function (friend) {
                                                                var _a, _b;
                                                                return ((0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: friend._id, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [friend.avatar ? ((0, jsx_runtime_1.jsx)("img", { src: "".concat(import.meta.env.VITE_API_URL || 'http://localhost:4000').concat(friend.avatar), alt: friend.username, className: "w-5 h-5 icon rounded-full" })) : ((0, jsx_runtime_1.jsx)("div", { className: "w-5 h-5 icon rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white  text-xs", children: ((_b = (_a = friend.username) === null || _a === void 0 ? void 0 : _a.charAt(0)) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || 'U' })), (0, jsx_runtime_1.jsxs)("span", { children: [friend.username, " (", friend.email, ")"] })] }) }, friend._id));
                                                            }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2 mt-2", children: formData.contributors.map(function (contributorId) {
                                                        var _a, _b;
                                                        var contributor = friends.find(function (f) { return f._id === contributorId; });
                                                        return ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "secondary", className: "cursor-pointer flex items-center gap-1", onClick: function () {
                                                                setFormData(function (prev) { return (__assign(__assign({}, prev), { contributors: prev.contributors.filter(function (id) { return id !== contributorId; }) })); });
                                                            }, children: [(contributor === null || contributor === void 0 ? void 0 : contributor.avatar) ? ((0, jsx_runtime_1.jsx)("img", { src: "".concat(import.meta.env.VITE_API_URL || 'http://localhost:4000').concat(contributor.avatar), alt: contributor.username, className: "w-4 h-4 icon rounded-full" })) : ((0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 icon rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white  text-xs", children: ((_b = (_a = contributor === null || contributor === void 0 ? void 0 : contributor.username) === null || _a === void 0 ? void 0 : _a.charAt(0)) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || 'U' })), contributor === null || contributor === void 0 ? void 0 : contributor.username, " \u00D7"] }, contributorId));
                                                    }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mb-2", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { value: tagInput, onChange: function (e) { return setTagInput(e.target.value); }, placeholder: "Add a tag", onKeyPress: function (e) { return e.key === 'Enter' && addTag(); } }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", className: 'w-12', onClick: addTag, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Plus, {}) })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: formData.tags.map(function (tag, index) { return ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "secondary", className: "cursor-pointer", onClick: function () { return removeTag(tag); }, children: [tag, " \u00D7"] }, index)); }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end gap-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: function () { return setIsCreateDialogOpen(false); }, children: "Cancel" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleCreateRepository, children: "Create Repository" })] })] })] }) }))] }), loading ? ((0, jsx_runtime_1.jsx)(HorizontalLoader_1.default, { message: "Loading repositories...", subMessage: "Fetching your GitHub repositories", progress: 80, className: "py-12" })) : filteredRepositories.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FolderOpen, { className: "h-12 w-12 mx-auto mb-4 text-gray-400" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg  mb-2", children: "No repositories found" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400 mb-4", children: searchTerm ? 'Try adjusting your search terms' : 'You haven\'t registered any repositories yet' }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: function () { return setIsCreateDialogOpen(true); }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4 icon mr-2" }), "Add Your First Repository"] })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "bg-white dark:bg-black rounded-[10px] shadow-xl overflow-hidden", children: (0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800", children: (0, jsx_runtime_1.jsxs)(table_1.Table, { children: [(0, jsx_runtime_1.jsx)(table_1.TableHeader, { className: "bg-gray-100 text-black dark:border-gray-700 sticky top-0 z-10", children: (0, jsx_runtime_1.jsxs)(table_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(table_1.TableHead, { className: "px-6 py-4 text-left dark:text-black text-xs   uppercase tracking-wider", children: "Repository" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { className: "px-6 py-4 text-left dark:text-black text-xs   uppercase tracking-wider", children: "Owner" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { className: "px-6 py-4 text-left dark:text-black text-xs   uppercase tracking-wider", children: "Contributors" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { className: "px-6 py-4 text-left dark:text-black text-xs   uppercase tracking-wider", children: "Language" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { className: "px-6 py-4 text-left dark:text-black text-xs   uppercase tracking-wider", children: "Status" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { className: "px-6 py-4 text-left dark:text-black text-xs   uppercase tracking-wider", children: "Updated" }), (0, jsx_runtime_1.jsx)(table_1.TableHead, { className: "px-6 py-4 text-left dark:text-black text-xs   uppercase tracking-wider" })] }) }), (0, jsx_runtime_1.jsx)(table_1.TableBody, { className: "divide-y divide-gray-200 dark:divide-gray-700", children: filteredRepositories.map(function (repo) {
                                    var _a, _b, _c, _d, _e, _f, _g;
                                    return ((0, jsx_runtime_1.jsxs)(table_1.TableRow, { className: "hover:bg-gray-50 dark:hover:bg-black transition-colors", children: [(0, jsx_runtime_1.jsx)(table_1.TableCell, { className: "px-6 py-4", children: (0, jsx_runtime_1.jsx)("div", { className: "flex items-center", children: (0, jsx_runtime_1.jsx)("div", { className: "ml-4", children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2 font-bold", children: repo.name }) }) }) }), (0, jsx_runtime_1.jsx)(table_1.TableCell, { className: "px-6 py-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0 h-8 w-8", children: ((_a = repo.owner) === null || _a === void 0 ? void 0 : _a.avatar) ? ((0, jsx_runtime_1.jsx)("img", { className: "h-8 w-8 rounded-full", src: "".concat(import.meta.env.VITE_API_URL || 'http://localhost:4000').concat(repo.owner.avatar), alt: repo.owner.username })) : ((0, jsx_runtime_1.jsx)("div", { className: "h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white  text-xs", children: ((_d = (_c = (_b = repo.owner) === null || _b === void 0 ? void 0 : _b.username) === null || _c === void 0 ? void 0 : _c.charAt(0)) === null || _d === void 0 ? void 0 : _d.toUpperCase()) || 'U' })) }), (0, jsx_runtime_1.jsx)("div", { className: "ml-3", children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: (_e = repo.owner) === null || _e === void 0 ? void 0 : _e.username }) })] }) }), (0, jsx_runtime_1.jsx)(table_1.TableCell, { className: "px-6 py-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex -space-x-2", children: [(_f = repo.contributors) === null || _f === void 0 ? void 0 : _f.slice(0, 3).map(function (contributor, index) {
                                                            var _a, _b;
                                                            return ((0, jsx_runtime_1.jsx)("div", { className: "relative", children: contributor.avatar ? ((0, jsx_runtime_1.jsx)("img", { className: "h-8 w-8 rounded-full  border-white dark:border-gray-800", src: "http://localhost:4000".concat(contributor.avatar), alt: contributor.username })) : ((0, jsx_runtime_1.jsx)("div", { className: "h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white  text-xs  border-white dark:border-gray-800", children: ((_b = (_a = contributor.username) === null || _a === void 0 ? void 0 : _a.charAt(0)) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || 'U' })) }, index));
                                                        }), ((_g = repo.contributors) === null || _g === void 0 ? void 0 : _g.length) > 3 && ((0, jsx_runtime_1.jsxs)("div", { className: "h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300  border-white dark:border-gray-800", children: ["+", repo.contributors.length - 3] }))] }) }), (0, jsx_runtime_1.jsx)(table_1.TableCell, { className: "px-6 py-4", children: repo.language ? ((0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "secondary", className: "bg-blue-500 text-white dark:bg-blue-900 dark:text-white px-3 py-2", children: repo.language })) : ((0, jsx_runtime_1.jsx)("span", { className: "text-gray-400 dark:text-gray-500", children: "-" })) }), (0, jsx_runtime_1.jsx)(table_1.TableCell, { className: "px-6 py-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(badge_1.Badge
                                                        // variant={repo.isPrivate ? "destructive" : "outline"}
                                                        , { 
                                                            // variant={repo.isPrivate ? "destructive" : "outline"}
                                                            className: repo.isPrivate ? "bg-red-500 text-white dark:bg-red-900 dark:text-white px-3 py-2" : "bg-green-500 text-white dark:bg-green-900 dark:text-white px-3 py-2", children: repo.isPrivate ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { className: "h-3 w-3 icon mr-1" }), "Private"] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Globe, { className: "h-3 w-3 icon mr-1" }), "Public"] })) }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", className: "bg-gray-100 text-black dark:bg-gray-900 dark:text-white px-3 py-2", children: repo.status })] }) }), (0, jsx_runtime_1.jsx)(table_1.TableCell, { className: "px-6 py-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "h-4 w-4 icon" }), formatDate(repo.updatedAt)] }) }), (0, jsx_runtime_1.jsx)(table_1.TableCell, { className: "px-6 py-4 text-right", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-end gap-1", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEditRepository(repo); }, className: "w-12 hover:bg-gray-100 dark:hover:bg-gray-700", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "h-4 w-4 icon" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return window.open(repo.githubUrl, '_blank'); }, className: "w-12 hover:bg-blue-100 dark:hover:bg-blue-900/20", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ExternalLink, { className: "h-4 w-4 icon text-blue-500" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDeleteRepository(repo._id); }, className: "w-12 hover:bg-red-100 dark:hover:bg-red-900/20", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4 icon text-red-500" }) })] }) })] }, repo._id));
                                }) })] }) }) })), isEditDialogOpen && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50", onClick: function () { return setIsEditDialogOpen(false); }, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-black border rounded-[10px] border p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto", onClick: function (e) { return e.stopPropagation(); }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("h2", { className: "text-xl ", children: "Edit Repository" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setIsEditDialogOpen(false); }, className: "cursor-pointer w-12", children: (0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "h-4 w-4 icon" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { id: "edit-name", value: formData.name, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { name: e.target.value })); }); } }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { id: "edit-githubUrl", value: formData.githubUrl, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { githubUrl: e.target.value })); }); } }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { id: "edit-description", value: formData.description, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { description: e.target.value })); }); } }) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4 items-center justify-center", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { id: "edit-language", value: formData.language, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { language: e.target.value })); }); } }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center py-5 justify-end gap-2 h-full", children: [(0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: formData.isPrivate ? "outline" : "default", className: "cursor-pointer select-none w-1/2 h-12 ".concat(!formData.isPrivate ? 'bg-green-500 text-white' : ''), onClick: function () { return setFormData(function (prev) { return (__assign(__assign({}, prev), { isPrivate: false })); }); }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Globe, { className: "w-3 h-3 icon" }), " Public"] }), (0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: formData.isPrivate ? "default" : "outline", className: "cursor-pointer select-none w-1/2 h-12 ".concat(formData.isPrivate ? 'bg-red-500 text-white' : ''), onClick: function () { return setFormData(function (prev) { return (__assign(__assign({}, prev), { isPrivate: true })); }); }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { className: "w-3 h-3 icon" }), " Private"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)(select_1.Select, { value: "", onValueChange: function (value) {
                                                if (value && !formData.contributors.includes(value)) {
                                                    setFormData(function (prev) { return (__assign(__assign({}, prev), { contributors: __spreadArray(__spreadArray([], prev.contributors, true), [value], false) })); });
                                                }
                                            }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Select contributors from friends" }) }), (0, jsx_runtime_1.jsx)(select_1.SelectContent, { className: "z-[60]", children: friends.map(function (friend) {
                                                        var _a, _b;
                                                        return ((0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: friend._id, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [friend.avatar ? ((0, jsx_runtime_1.jsx)("img", { src: "http://localhost:4000".concat(friend.avatar), alt: friend.username, className: "w-5 h-5 icon rounded-full" })) : ((0, jsx_runtime_1.jsx)("div", { className: "w-5 h-5 icon rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white  text-xs", children: ((_b = (_a = friend.username) === null || _a === void 0 ? void 0 : _a.charAt(0)) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || 'U' })), (0, jsx_runtime_1.jsxs)("span", { children: [friend.username, " (", friend.email, ")"] })] }) }, friend._id));
                                                    }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2 mt-2", children: formData.contributors.map(function (contributorId) {
                                                var _a, _b;
                                                var contributor = friends.find(function (f) { return f._id === contributorId; });
                                                return ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "secondary", className: "cursor-pointer flex items-center gap-1", onClick: function () {
                                                        setFormData(function (prev) { return (__assign(__assign({}, prev), { contributors: prev.contributors.filter(function (id) { return id !== contributorId; }) })); });
                                                    }, children: [(contributor === null || contributor === void 0 ? void 0 : contributor.avatar) ? ((0, jsx_runtime_1.jsx)("img", { src: "http://localhost:4000".concat(contributor.avatar), alt: contributor.username, className: "w-4 h-4 icon rounded-full" })) : ((0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 icon rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white  text-xs", children: ((_b = (_a = contributor === null || contributor === void 0 ? void 0 : contributor.username) === null || _a === void 0 ? void 0 : _a.charAt(0)) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || 'U' })), contributor === null || contributor === void 0 ? void 0 : contributor.username, " \u00D7"] }, contributorId));
                                            }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mb-2", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { value: tagInput, onChange: function (e) { return setTagInput(e.target.value); }, placeholder: "Add a tag", onKeyPress: function (e) { return e.key === 'Enter' && addTag(); } }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", className: "w-12", onClick: addTag, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Plus, {}) })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: formData.tags.map(function (tag, index) { return ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "secondary", className: "cursor-pointer", onClick: function () { return removeTag(tag); }, children: [tag, " \u00D7"] }, index)); }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end gap-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: function () { return setIsEditDialogOpen(false); }, children: "Cancel" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleUpdateRepository, children: "Update Repository" })] })] })] }) })), (0, jsx_runtime_1.jsx)(GitHubUserReposModal_1.default, { isOpen: isGitHubUserModalOpen, onClose: function () { return setIsGitHubUserModalOpen(false); }, onCreateRepository: handleCreateFromGitHub, existingRepositories: repositories })] }));
};
exports.default = GitHubRepositories;
