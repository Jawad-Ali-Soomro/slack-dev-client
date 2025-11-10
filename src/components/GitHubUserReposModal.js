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
var button_1 = require("./ui/button");
var input_1 = require("./ui/input");
var badge_1 = require("./ui/badge");
var card_1 = require("./ui/card");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var GitHubUserReposModal = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, onCreateRepository = _a.onCreateRepository, _b = _a.existingRepositories, existingRepositories = _b === void 0 ? [] : _b;
    var _c = (0, react_1.useState)(''), username = _c[0], setUsername = _c[1];
    var _d = (0, react_1.useState)([]), userRepos = _d[0], setUserRepos = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(''), searchTerm = _f[0], setSearchTerm = _f[1];
    var _g = (0, react_1.useState)([]), selectedRepos = _g[0], setSelectedRepos = _g[1];
    // Check if repository already exists in database
    var isRepoExists = function (repoName) {
        return existingRepositories.some(function (existingRepo) {
            return existingRepo.name.toLowerCase() === repoName.toLowerCase();
        });
    };
    var fetchUserRepos = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, repos, existingCount, availableCount, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!username.trim()) {
                        sonner_1.toast.error('Please enter a GitHub username');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    setLoading(true);
                    return [4 /*yield*/, fetch("https://api.github.com/users/".concat(username, "/repos?sort=updated&per_page=100"))];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        if (response.status === 404) {
                            throw new Error('User not found');
                        }
                        throw new Error('Failed to fetch repositories');
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    repos = _a.sent();
                    setUserRepos(repos);
                    existingCount = repos.filter(function (repo) { return isRepoExists(repo.name); }).length;
                    availableCount = repos.length - existingCount;
                    if (existingCount > 0) {
                        sonner_1.toast.success("Found ".concat(repos.length, " repositories (").concat(availableCount, " available, ").concat(existingCount, " already exist)"));
                    }
                    else {
                        sonner_1.toast.success("Found ".concat(repos.length, " repositories"));
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error fetching user repos:', error_1);
                    sonner_1.toast.error(error_1.message || 'Failed to fetch repositories');
                    setUserRepos([]);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleCreateSelected = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _i, selectedRepos_1, repo, repoData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (selectedRepos.length === 0) {
                        sonner_1.toast.error('Please select at least one repository');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    _i = 0, selectedRepos_1 = selectedRepos;
                    _a.label = 2;
                case 2:
                    if (!(_i < selectedRepos_1.length)) return [3 /*break*/, 5];
                    repo = selectedRepos_1[_i];
                    repoData = {
                        name: repo.name,
                        description: repo.description || '',
                        githubUrl: repo.html_url,
                        language: repo.language || '',
                        isPrivate: repo.private,
                        tags: repo.topics || [],
                        contributors: []
                    };
                    return [4 /*yield*/, onCreateRepository(repoData)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    sonner_1.toast.success("Successfully created ".concat(selectedRepos.length, " repository(ies)"));
                    setSelectedRepos([]);
                    onClose();
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    console.error('Error creating repositories:', error_2);
                    sonner_1.toast.error('Failed to create repositories');
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var toggleRepoSelection = function (repo) {
        setSelectedRepos(function (prev) {
            return prev.some(function (r) { return r.id === repo.id; })
                ? prev.filter(function (r) { return r.id !== repo.id; })
                : __spreadArray(__spreadArray([], prev, true), [repo], false);
        });
    };
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    var filteredRepos = userRepos.filter(function (repo) {
        return (repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))) &&
            !isRepoExists(repo.name);
    });
    var existingRepos = userRepos.filter(function (repo) { return isRepoExists(repo.name); });
    if (!isOpen)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50", onClick: onClose, children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "bg-white dark:bg-black rounded-[10px] border p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col", onClick: function (e) { return e.stopPropagation(); }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("h2", { className: "text-xl ", children: "Repositories" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: onClose, className: "w-12", children: (0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "h-4 w-4 icon" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-4 mb-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-1", children: (0, jsx_runtime_1.jsx)(input_1.Input, { value: username, onChange: function (e) { return setUsername(e.target.value); }, placeholder: "Enter GitHub username (e.g., octocat)", onKeyPress: function (e) { return e.key === 'Enter' && fetchUserRepos(); } }) }), (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: fetchUserRepos, disabled: loading || !username.trim(), className: 'w-[200px]', children: [loading ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader, { className: "h-4 w-4 icon animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "h-4 w-4 icon" }), loading ? 'Fetching...' : 'Fetch Repos'] })] }), userRepos.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, placeholder: "Search repositories..." }), (0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 icon" })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-4", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleCreateSelected, disabled: selectedRepos.length === 0, className: "bg-green-600 hover:bg-green-700 w-[200px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4 icon mr-2" }), "Create Selected (", selectedRepos.length, ")"] }) })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 overflow-y-auto", children: [userRepos.length === 0 && !loading && ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Github, { className: "h-12 w-12 mx-auto mb-4 text-gray-400" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg  mb-2", children: "No repositories found" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "Enter a GitHub username to fetch their public repositories" })] })), filteredRepos.length === 0 && userRepos.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8", children: (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: existingRepos.length > 0
                                    ? 'All repositories already exist in your database'
                                    : 'No repositories match your search' }) })), (0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: filteredRepos.map(function (repo) {
                                var isSelected = selectedRepos.some(function (r) { return r.id === repo.id; });
                                return ((0, jsx_runtime_1.jsx)(card_1.Card, { className: "cursor-pointer transition-all duration-200 ".concat(isSelected
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'hover:border-gray-300 dark:hover:border-gray-600'), onClick: function () { return toggleRepoSelection(repo); }, children: (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-2", children: [(0, jsx_runtime_1.jsx)("h3", { className: " text-gray-900 dark:text-white", children: repo.name }), repo.private ? ((0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { className: "h-4 w-4 icon text-gray-500" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.Globe, { className: "h-4 w-4 icon text-gray-500" }))] }), repo.description && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-3", children: repo.description })), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4 text-sm text-gray-500", children: [repo.language && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Code, { className: "h-4 w-4 icon" }), repo.language] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Star, { className: "h-4 w-4 icon" }), repo.stargazers_count] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.GitFork, { className: "h-4 w-4 icon" }), repo.forks_count] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "h-4 w-4 icon" }), repo.watchers_count] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "h-4 w-4 icon" }), formatDate(repo.updated_at)] })] }), repo.topics && repo.topics.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-1 mt-2", children: [repo.topics.slice(0, 5).map(function (topic, index) { return ((0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "secondary", className: "text-xs", children: topic }, index)); }), repo.topics.length > 5 && ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "secondary", className: "text-xs", children: ["+", repo.topics.length - 5, " more"] }))] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 ml-4", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function (e) {
                                                                e.stopPropagation();
                                                                window.open(repo.html_url, '_blank');
                                                            }, className: "w-8 h-8 p-0", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ExternalLink, { className: "h-4 w-4 icon" }) }), (0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 icon rounded  ".concat(isSelected
                                                                ? 'bg-blue-500 border-blue-500'
                                                                : 'border-gray-300 dark:border-gray-600'), children: isSelected && ((0, jsx_runtime_1.jsx)("div", { className: "w-full h-full flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("div", { className: "w-2 h-2 bg-white rounded-full" }) })) })] })] }) }) }, repo.id));
                            }) })] })] }) }));
};
exports.default = GitHubUserReposModal;
