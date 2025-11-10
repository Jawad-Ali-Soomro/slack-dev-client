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
var sonner_1 = require("sonner");
var button_1 = require("./ui/button");
var input_1 = require("./ui/input");
var card_1 = require("./ui/card");
var avatar_1 = require("./ui/avatar");
var friendService_1 = require("../services/friendService");
var AuthContext_1 = require("../contexts/AuthContext");
var avatarUtils_1 = require("../utils/avatarUtils");
var UserDetailsModal_1 = require("./UserDetailsModal");
var uiConstants_1 = require("../utils/uiConstants");
var FindFriendsModal = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose;
    var user = (0, AuthContext_1.useAuth)().user;
    var _b = (0, react_1.useState)(''), searchTerm = _b[0], setSearchTerm = _b[1];
    var _c = (0, react_1.useState)([]), searchResults = _c[0], setSearchResults = _c[1];
    var _d = (0, react_1.useState)(null), selectedUserId = _d[0], setSelectedUserId = _d[1];
    var _e = (0, react_1.useState)(false), showUserDetails = _e[0], setShowUserDetails = _e[1];
    // Search users
    var searchUsers = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!searchTerm.trim()) {
                        setSearchResults([]);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, friendService_1.default.searchUsersForFriends(searchTerm)];
                case 2:
                    response = _a.sent();
                    setSearchResults(response.users || []);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error searching users:', error_1);
                    sonner_1.toast.error('Failed to search users');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Send friend request
    var handleSendFriendRequest = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, friendService_1.default.sendFriendRequest(userId)];
                case 1:
                    _a.sent();
                    sonner_1.toast.success('Friend request sent!');
                    onClose();
                    window.location.reload();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    sonner_1.toast.error(error_2.message || 'Failed to send friend request');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Handle user avatar click
    var handleUserAvatarClick = function (userId) {
        console.log('FindFriends avatar clicked for user ID:', userId);
        setSelectedUserId(userId);
        setShowUserDetails(true);
        console.log('Modal should open now');
    };
    // Search users when search term changes
    (0, react_1.useEffect)(function () {
        var timeoutId = setTimeout(function () {
            searchUsers();
        }, 500);
        return function () { return clearTimeout(timeoutId); };
    }, [searchTerm]);
    // Reset search when modal closes
    (0, react_1.useEffect)(function () {
        if (!isOpen) {
            setSearchTerm('');
            setSearchResults([]);
        }
    }, [isOpen]);
    if (!isOpen)
        return null;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black/50 icon  backdrop-blur-sm  z-50 flex items-center justify-center p-4", onClick: onClose, children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, className: "bg-white dark:bg-black rounded-[10px]  shadow-xl w-full max-w-xl max-h-[80vh] overflow-hidden", onClick: function (e) { return e.stopPropagation(); }, children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6 overflow-y-auto max-h-[60vh]", children: [(0, jsx_runtime_1.jsx)("div", { className: "mb-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 icon" }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Search by username or email...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: (0, uiConstants_1.getInputClasses)('default', 'md', 'pl-10') })] }) }), searchResults.length === 0 && searchTerm ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-8 text-gray-500", children: ["No users found matching \"", searchTerm, "\""] })) : searchResults.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: searchResults.map(function (user) { return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "flex items-center justify-between p-4 border rounded-[10px] hover:bg-gray-50 dark:hover:bg-gray-800", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsxs)(avatar_1.Avatar, { className: "cursor-pointer hover:scale-110 transition-transform", onClick: function () { return handleUserAvatarClick(user.id); }, title: "View ".concat(user.username, "'s profile"), children: [(0, jsx_runtime_1.jsx)(avatar_1.AvatarImage, __assign({}, (0, avatarUtils_1.getAvatarProps)(user.avatar, user.username))), (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { children: user.username.charAt(0).toUpperCase() })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: user.username }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: user.email })] })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: function () { return handleSendFriendRequest(user.id); }, className: (0, uiConstants_1.getButtonClasses)('primary', 'sm', 'w-12'), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: uiConstants_1.ICON_SIZES.sm }) })] }, user.id)); }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8 text-gray-500", children: "Start typing to search for friends" }))] }) }) }), (0, jsx_runtime_1.jsx)(UserDetailsModal_1.default, { userId: selectedUserId, isOpen: showUserDetails, onClose: function () {
                    setShowUserDetails(false);
                    setSelectedUserId(null);
                } })] }));
};
exports.default = FindFriendsModal;
