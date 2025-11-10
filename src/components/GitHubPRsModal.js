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
var button_1 = require("./ui/button");
var input_1 = require("./ui/input");
var badge_1 = require("./ui/badge");
var card_1 = require("./ui/card");
var textarea_1 = require("./ui/textarea");
var select_1 = require("./ui/select");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var GitHubPRsModal = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, onCreatePR = _a.onCreatePR;
    var _b = (0, react_1.useState)(''), username = _b[0], setUsername = _b[1];
    var _c = (0, react_1.useState)(''), repoName = _c[0], setRepoName = _c[1];
    var _d = (0, react_1.useState)([]), userPRs = _d[0], setUserPRs = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(''), searchTerm = _f[0], setSearchTerm = _f[1];
    var _g = (0, react_1.useState)([]), selectedPRs = _g[0], setSelectedPRs = _g[1];
    var _h = (0, react_1.useState)(false), isCreateMode = _h[0], setIsCreateMode = _h[1];
    var _j = (0, react_1.useState)({
        title: '',
        body: '',
        head: '',
        base: 'main',
        labels: [],
        assignees: []
    }), createForm = _j[0], setCreateForm = _j[1];
    var _k = (0, react_1.useState)(''), labelInput = _k[0], setLabelInput = _k[1];
    var fetchUserPRs = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, prs, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!username.trim() || !repoName.trim()) {
                        sonner_1.toast.error('Please enter both GitHub username and repository name');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    setLoading(true);
                    return [4 /*yield*/, fetch("https://api.github.com/repos/".concat(username, "/").concat(repoName, "/pulls?state=all&per_page=100"))];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        if (response.status === 404) {
                            throw new Error('Repository not found');
                        }
                        throw new Error('Failed to fetch pull requests');
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    prs = _a.sent();
                    setUserPRs(prs);
                    sonner_1.toast.success("Found ".concat(prs.length, " pull requests"));
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error fetching PRs:', error_1);
                    sonner_1.toast.error(error_1.message || 'Failed to fetch pull requests');
                    setUserPRs([]);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var createPRToGitHub = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, newPR, prData, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!createForm.title.trim()) {
                        sonner_1.toast.error('Please enter a title');
                        return [2 /*return*/];
                    }
                    if (!createForm.head.trim()) {
                        sonner_1.toast.error('Please enter a head branch');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, 6, 7]);
                    setLoading(true);
                    return [4 /*yield*/, fetch("https://api.github.com/repos/".concat(username, "/").concat(repoName, "/pulls"), {
                            method: 'POST',
                            headers: {
                                'Authorization': "token ".concat(localStorage.getItem('github_token') || ''),
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                title: createForm.title,
                                body: createForm.body,
                                head: createForm.head,
                                base: createForm.base,
                                labels: createForm.labels,
                                assignees: createForm.assignees
                            })
                        })];
                case 2:
                    response = _b.sent();
                    if (!response.ok) {
                        throw new Error('Failed to create pull request on GitHub');
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    newPR = _b.sent();
                    sonner_1.toast.success('Pull request created successfully on GitHub');
                    prData = {
                        title: newPR.title,
                        description: newPR.body || '',
                        githubUrl: newPR.html_url,
                        githubHash: newPR.number.toString(),
                        repository: '', // Will be set by backend
                        labels: ((_a = newPR.labels) === null || _a === void 0 ? void 0 : _a.map(function (label) { return label.name; })) || [],
                        priority: 'medium'
                    };
                    return [4 /*yield*/, onCreatePR(prData)];
                case 4:
                    _b.sent();
                    setIsCreateMode(false);
                    setCreateForm({ title: '', body: '', head: '', base: 'main', labels: [], assignees: [] });
                    return [3 /*break*/, 7];
                case 5:
                    error_2 = _b.sent();
                    console.error('Error creating PR:', error_2);
                    sonner_1.toast.error(error_2.message || 'Failed to create pull request');
                    return [3 /*break*/, 7];
                case 6:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleCreateSelected = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _i, selectedPRs_1, pr, prData, error_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (selectedPRs.length === 0) {
                        sonner_1.toast.error('Please select at least one pull request');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, , 7]);
                    _i = 0, selectedPRs_1 = selectedPRs;
                    _b.label = 2;
                case 2:
                    if (!(_i < selectedPRs_1.length)) return [3 /*break*/, 5];
                    pr = selectedPRs_1[_i];
                    prData = {
                        title: pr.title,
                        description: pr.body || '',
                        githubUrl: pr.html_url,
                        githubHash: pr.number.toString(),
                        repository: '', // Will be set by backend
                        labels: ((_a = pr.labels) === null || _a === void 0 ? void 0 : _a.map(function (label) { return label.name; })) || [],
                        priority: 'medium'
                    };
                    return [4 /*yield*/, onCreatePR(prData)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    sonner_1.toast.success("Successfully imported ".concat(selectedPRs.length, " pull request(s)"));
                    setSelectedPRs([]);
                    onClose();
                    return [3 /*break*/, 7];
                case 6:
                    error_3 = _b.sent();
                    console.error('Error importing PRs:', error_3);
                    sonner_1.toast.error('Failed to import pull requests');
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var togglePRSelection = function (pr) {
        setSelectedPRs(function (prev) {
            return prev.some(function (p) { return p.id === pr.id; })
                ? prev.filter(function (p) { return p.id !== pr.id; })
                : __spreadArray(__spreadArray([], prev, true), [pr], false);
        });
    };
    var addLabel = function () {
        if (labelInput.trim() && !createForm.labels.includes(labelInput.trim())) {
            setCreateForm(function (prev) { return (__assign(__assign({}, prev), { labels: __spreadArray(__spreadArray([], prev.labels, true), [labelInput.trim()], false) })); });
            setLabelInput('');
        }
    };
    var removeLabel = function (labelToRemove) {
        setCreateForm(function (prev) { return (__assign(__assign({}, prev), { labels: prev.labels.filter(function (label) { return label !== labelToRemove; }) })); });
    };
    var getStatusIcon = function (state, merged) {
        if (merged) {
            return (0, jsx_runtime_1.jsx)(lucide_react_1.GitMerge, { className: "h-4 w-4 icon text-purple-500" });
        }
        switch (state) {
            case 'open':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "h-4 w-4 icon text-green-500" });
            case 'closed':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "h-4 w-4 icon text-red-500" });
            case 'draft':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-4 w-4 icon text-yellow-500" });
            default:
                return (0, jsx_runtime_1.jsx)(lucide_react_1.GitPullRequest, { className: "h-4 w-4 icon text-gray-500" });
        }
    };
    var getStatusColor = function (state, merged) {
        if (merged) {
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        }
        switch (state) {
            case 'open':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'closed':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    var filteredPRs = userPRs.filter(function (pr) {
        return pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (pr.body && pr.body.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    if (!isOpen)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50", onClick: onClose, children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "bg-white dark:bg-black rounded-[30px] border p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col", onClick: function (e) { return e.stopPropagation(); }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("h2", { className: "text-xl ", children: "Pull Requests" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: onClose, className: "w-12", children: (0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "h-4 w-4 icon" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-4 mb-6 items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-1", children: (0, jsx_runtime_1.jsx)(input_1.Input, { value: username, onChange: function (e) { return setUsername(e.target.value); }, placeholder: "GitHub username (e.g., octocat)" }) }), "/", (0, jsx_runtime_1.jsx)("div", { className: "flex-1", children: (0, jsx_runtime_1.jsx)(input_1.Input, { value: repoName, onChange: function (e) { return setRepoName(e.target.value); }, placeholder: "Repository name (e.g., Hello-World)" }) })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: fetchUserPRs, disabled: loading || !username.trim() || !repoName.trim(), className: 'w-full', children: loading ? 'Fetching...' : (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "h-4 w-4 icon" }), " Fetch PRs"] }) }), isCreateMode ? (
                /* Create PR Form */
                (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { value: createForm.title, onChange: function (e) { return setCreateForm(function (prev) { return (__assign(__assign({}, prev), { title: e.target.value })); }); }, placeholder: "Pull request title" }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { value: createForm.body, onChange: function (e) { return setCreateForm(function (prev) { return (__assign(__assign({}, prev), { body: e.target.value })); }); }, placeholder: "Pull request description", rows: 4 }) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { value: createForm.head, onChange: function (e) { return setCreateForm(function (prev) { return (__assign(__assign({}, prev), { head: e.target.value })); }); }, placeholder: "Head branch (feature branch)" }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { value: createForm.base, onChange: function (e) { return setCreateForm(function (prev) { return (__assign(__assign({}, prev), { base: e.target.value })); }); }, placeholder: "Base branch (usually main)" }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mb-2", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { value: labelInput, onChange: function (e) { return setLabelInput(e.target.value); }, placeholder: "Add a label", onKeyPress: function (e) { return e.key === 'Enter' && addLabel(); } }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", onClick: addLabel, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Plus, {}) })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: createForm.labels.map(function (label, index) { return ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "secondary", className: "cursor-pointer", onClick: function () { return removeLabel(label); }, children: [label, " \u00D7"] }, index)); }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end gap-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: function () { return setIsCreateMode(false); }, children: "Cancel" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: createPRToGitHub, disabled: loading || !createForm.title.trim() || !createForm.head.trim(), children: loading ? 'Creating...' : (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4 icon mr-2" }), " Create PR on GitHub"] }) })] })] })) : (
                /* Import PRs */
                (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [userPRs.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4 gap-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-1", children: (0, jsx_runtime_1.jsx)(input_1.Input, { value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, placeholder: "Search pull requests..." }) }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-4", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleCreateSelected, disabled: selectedPRs.length === 0, className: "bg-green-600 hover:bg-green-700 w-[200px]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4 icon mr-2" }), "Import Selected (", selectedPRs.length, ")"] }) })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 overflow-y-auto", children: [userPRs.length === 0 && !loading && ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.GitPullRequest, { className: "h-12 w-12 mx-auto mb-4 text-gray-400" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg  mb-2", children: "No pull requests found" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "Enter a GitHub username and repository to fetch pull requests" })] })), filteredPRs.length === 0 && userPRs.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8", children: (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "No pull requests match your search" }) })), (0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: filteredPRs.map(function (pr) {
                                        var isSelected = selectedPRs.some(function (p) { return p.id === pr.id; });
                                        return ((0, jsx_runtime_1.jsx)(card_1.Card, { className: "cursor-pointer transition-all duration-200 ".concat(isSelected
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'hover:border-gray-300 dark:hover:border-gray-600'), onClick: function () { return togglePRSelection(pr); }, children: (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-2", children: [getStatusIcon(pr.state, pr.merged), (0, jsx_runtime_1.jsxs)("h3", { className: " text-gray-900 dark:text-white", children: ["#", pr.number, " ", pr.title] }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { className: getStatusColor(pr.state, pr.merged), children: pr.merged ? 'merged' : pr.state })] }), pr.body && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2", children: pr.body })), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4 text-sm text-gray-500 mb-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "h-4 w-4 icon" }), formatDate(pr.created_at)] }), pr.user && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)("img", { src: pr.user.avatar_url, alt: pr.user.login, className: "w-4 h-4 icon rounded-full" }), pr.user.login] })), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded", children: [pr.head.ref, " \u2192 ", pr.base.ref] })] }), pr.labels && pr.labels.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-1", children: [pr.labels.slice(0, 5).map(function (label, index) { return ((0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "secondary", className: "text-xs", style: { backgroundColor: "#".concat(label.color, "20"), color: "#".concat(label.color) }, children: label.name }, index)); }), pr.labels.length > 5 && ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "secondary", className: "text-xs", children: ["+", pr.labels.length - 5, " more"] }))] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 ml-4", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function (e) {
                                                                        e.stopPropagation();
                                                                        window.open(pr.html_url, '_blank');
                                                                    }, className: "w-8 h-8 p-0", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ExternalLink, { className: "h-4 w-4 icon" }) }), (0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 icon rounded  ".concat(isSelected
                                                                        ? 'bg-blue-500 border-blue-500'
                                                                        : 'border-gray-300 dark:border-gray-600'), children: isSelected && ((0, jsx_runtime_1.jsx)("div", { className: "w-full h-full flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("div", { className: "w-2 h-2 bg-white rounded-full" }) })) })] })] }) }) }, pr.id));
                                    }) })] })] }))] }) }));
};
exports.default = GitHubPRsModal;
