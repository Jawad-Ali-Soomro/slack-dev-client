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
var ChatContext_1 = require("../contexts/ChatContext");
var AuthContext_1 = require("../contexts/AuthContext");
var button_1 = require("./ui/button");
var input_1 = require("./ui/input");
var label_1 = require("./ui/label");
var textarea_1 = require("./ui/textarea");
var card_1 = require("./ui/card");
var avatar_1 = require("./ui/avatar");
var badge_1 = require("./ui/badge");
var checkbox_1 = require("./ui/checkbox");
var lucide_react_1 = require("lucide-react");
var userService_1 = require("../services/userService");
var pi_1 = require("react-icons/pi");
var CreateChatModal = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose;
    var createChat = (0, ChatContext_1.useChat)().createChat;
    var user = (0, AuthContext_1.useAuth)().user;
    var getAvatarUrl = function (avatar) {
        if (!avatar)
            return null;
        // If avatar is already a full URL, return as is
        if (avatar.startsWith("http"))
            return avatar;
        // If avatar is a relative path, prefix with server URL
        var apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        return "".concat(apiUrl).concat(avatar.startsWith("/") ? "" : "/").concat(avatar);
    };
    var _b = (0, react_1.useState)(""), searchTerm = _b[0], setSearchTerm = _b[1];
    var _c = (0, react_1.useState)([]), users = _c[0], setUsers = _c[1];
    var _d = (0, react_1.useState)([]), selectedUsers = _d[0], setSelectedUsers = _d[1];
    var _e = (0, react_1.useState)("direct"), chatType = _e[0], setChatType = _e[1];
    var _f = (0, react_1.useState)(""), chatName = _f[0], setChatName = _f[1];
    var _g = (0, react_1.useState)(""), chatDescription = _g[0], setChatDescription = _g[1];
    var _h = (0, react_1.useState)(false), loading = _h[0], setLoading = _h[1];
    var _j = (0, react_1.useState)(""), error = _j[0], setError = _j[1];
    (0, react_1.useEffect)(function () {
        if (isOpen) {
            loadUsers();
        }
    }, [isOpen]);
    var loadUsers = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, filteredUsers_1, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, userService_1.userService.getUsers()];
                case 1:
                    response = _a.sent();
                    filteredUsers_1 = response.users.filter(function (u) { return u.id !== (user === null || user === void 0 ? void 0 : user.id); });
                    setUsers(filteredUsers_1);
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _a.sent();
                    setError("Failed to load users");
                    console.error("Error loading users:", err_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleUserSelect = function (userId) {
        if (chatType === 'direct') {
            // For direct chats, only allow one user
            setSelectedUsers([userId]);
        }
        else {
            // For group chats, allow multiple users
            setSelectedUsers(function (prev) {
                return prev.includes(userId)
                    ? prev.filter(function (id) { return id !== userId; })
                    : __spreadArray(__spreadArray([], prev, true), [userId], false);
            });
        }
    };
    var handleCreateChat = function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (selectedUsers.length === 0) {
                        setError("Please select at least one user");
                        return [2 /*return*/];
                    }
                    if (chatType === "group" && !chatName.trim()) {
                        setError("Please enter a group name");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setLoading(true);
                    setError("");
                    return [4 /*yield*/, createChat(selectedUsers, chatType, chatType === "group" ? chatName : null, chatType === "group" ? chatDescription : null)];
                case 2:
                    _a.sent();
                    onClose();
                    resetForm();
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    setError("Failed to create chat");
                    console.error("Error creating chat:", err_2);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var resetForm = function () {
        setSearchTerm("");
        setSelectedUsers([]);
        setChatType("direct");
        setChatName("");
        setChatDescription("");
        setError("");
    };
    var filteredUsers = users.filter(function (u) {
        return u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
    });
    if (!isOpen)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black/50 icon flex items-center justify-center z-100000 backdrop-blur-sm", onClick: onClose, children: (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "w-full max-w-md mx-4 bg-white drak:bg-black", onClick: function (e) { return e.stopPropagation(); }, children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Create New Chat" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: onClose, children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4 icon" }) })] }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "space-y-4", children: [error && ((0, jsx_runtime_1.jsx)("div", { className: "p-3 bg-destructive/10 text-destructive text-sm rounded", children: error })), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-2 mt-3", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { type: "button", variant: chatType === "direct" ? "default" : "outline", size: "sm", onClick: function () {
                                            setChatType("direct");
                                            setSelectedUsers([]); // Clear selection when switching
                                        }, className: "flex items-center gap-2 w-full", children: [(0, jsx_runtime_1.jsx)(pi_1.PiUserDuotone, { className: "h-4 w-4 icon" }), "Direct Message"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "button", variant: chatType === "group" ? "default" : "outline", size: "sm", onClick: function () {
                                            setChatType("group");
                                            setSelectedUsers([]); // Clear selection when switching
                                        }, className: "flex items-center gap-2 w-full", children: [(0, jsx_runtime_1.jsx)(pi_1.PiUsersDuotone, { className: "h-4 w-4 icon" }), "Group Chat"] })] }) }), chatType === "group" && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { id: "chatName", value: chatName, onChange: function (e) { return setChatName(e.target.value); }, placeholder: "Enter group name" }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { id: "chatDescription", value: chatDescription, onChange: function (e) { return setChatDescription(e.target.value); }, placeholder: "Enter group description", rows: 3 }) })] })), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("div", { className: "relative mt-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 icon text-muted-foreground" }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Search users...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-10" })] }) }), selectedUsers.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(label_1.Label, { children: "Selected Users" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2 mt-2", children: selectedUsers.map(function (userId) {
                                        var _a;
                                        var user = users.find(function (u) { return u.id === userId; });
                                        return ((0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "secondary", className: "flex items-center gap-1 py-2", children: [(0, jsx_runtime_1.jsxs)(avatar_1.Avatar, { className: "h-4 w-4 icon", children: [(0, jsx_runtime_1.jsx)(avatar_1.AvatarImage, { src: getAvatarUrl(user === null || user === void 0 ? void 0 : user.avatar) }), (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { className: "text-xs", children: (_a = user === null || user === void 0 ? void 0 : user.username) === null || _a === void 0 ? void 0 : _a.charAt(0).toUpperCase() })] }), user === null || user === void 0 ? void 0 : user.username, (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", className: "h-4 w-4 icon p-0 ml-1", onClick: function () { return handleUserSelect(userId); }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-3 w-3 icon" }) })] }, userId));
                                    }) })] })), (0, jsx_runtime_1.jsx)("div", { className: "max-h-60 overflow-y-auto space-y-2", children: loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center py-4", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-[10px] h-6 w-6 border-b-2 border-primary" }) })) : filteredUsers.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-4 text-muted-foreground", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.User, { className: "h-8 w-8 mx-auto mb-2" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm", children: "No users found" })] })) : (filteredUsers.map(function (user) { return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3 p-2 rounded hover:bg-muted cursor-pointer", onClick: function () { return handleUserSelect(user.id); }, children: [(0, jsx_runtime_1.jsx)(checkbox_1.Checkbox, { checked: selectedUsers.includes(user.id), onChange: function () { return handleUserSelect(user.id); } }), (0, jsx_runtime_1.jsxs)(avatar_1.Avatar, { className: "h-8 w-8", children: [(0, jsx_runtime_1.jsx)(avatar_1.AvatarImage, { src: getAvatarUrl(user.avatar) }), (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { children: user.username.charAt(0).toUpperCase() })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium", children: user.username }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-muted-foreground", children: user.email })] })] }, user.id)); })) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end gap-2 pt-4", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: onClose, children: "Cancel" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleCreateChat, disabled: selectedUsers.length === 0 || loading, className: "w-[150px] ", children: loading ? "Creating..." : "Create Chat" })] })] })] }) }));
};
exports.default = CreateChatModal;
