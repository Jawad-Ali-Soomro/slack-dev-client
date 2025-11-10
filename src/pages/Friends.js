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
var button_1 = require("../components/ui/button");
var input_1 = require("../components/ui/input");
var tabs_1 = require("../components/ui/tabs");
var card_1 = require("../components/ui/card");
var badge_1 = require("../components/ui/badge");
var avatar_1 = require("../components/ui/avatar");
var friendService_1 = require("../services/friendService");
var AuthContext_1 = require("../contexts/AuthContext");
var avatarUtils_1 = require("../utils/avatarUtils");
var UserDetailsModal_1 = require("../components/UserDetailsModal");
var FindFriendsModal_1 = require("../components/FindFriendsModal");
var uiConstants_1 = require("../utils/uiConstants");
var pi_1 = require("react-icons/pi");
var Friends = function () {
    var user = (0, AuthContext_1.useAuth)().user;
    var _a = (0, react_1.useState)('friends'), activeTab = _a[0], setActiveTab = _a[1];
    var _b = (0, react_1.useState)(null), selectedUserId = _b[0], setSelectedUserId = _b[1];
    var _c = (0, react_1.useState)(false), showUserDetails = _c[0], setShowUserDetails = _c[1];
    var _d = (0, react_1.useState)(false), showFindFriendsModal = _d[0], setShowFindFriendsModal = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)([]), friends = _f[0], setFriends = _f[1];
    var _g = (0, react_1.useState)([]), friendRequests = _g[0], setFriendRequests = _g[1];
    var _h = (0, react_1.useState)(null), stats = _h[0], setStats = _h[1];
    // Load friends
    // Handle user avatar click
    var handleUserAvatarClick = function (userId) {
        console.log('Friends avatar clicked for user ID:', userId);
        setSelectedUserId(userId);
        setShowUserDetails(true);
        console.log('Modal should open now');
    };
    var loadFriends = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, friendService_1.default.getFriends()];
                case 1:
                    response = _a.sent();
                    setFriends(response.friends || []);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error loading friends:', error_1);
                    sonner_1.toast.error('Failed to load friends');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Load friend requests
    var loadFriendRequests = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, friendService_1.default.getFriendRequests()];
                case 1:
                    response = _a.sent();
                    setFriendRequests(response.requests || []);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error loading friend requests:', error_2);
                    sonner_1.toast.error('Failed to load friend requests');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Load stats
    var loadStats = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, friendService_1.default.getFriendStats()];
                case 1:
                    response = _a.sent();
                    setStats(response.stats);
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error loading stats:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Send friend request
    var handleSendFriendRequest = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, friendService_1.default.sendFriendRequest(userId)];
                case 1:
                    _a.sent();
                    sonner_1.toast.success('Friend request sent!');
                    loadFriendRequests();
                    loadStats();
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    sonner_1.toast.error(error_4.message || 'Failed to send friend request');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Respond to friend request
    var handleRespondToRequest = function (requestId, action) { return __awaiter(void 0, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, friendService_1.default.respondToFriendRequest(requestId, action)];
                case 1:
                    _a.sent();
                    sonner_1.toast.success("Friend request ".concat(action, "ed!"));
                    loadFriendRequests();
                    loadFriends();
                    loadStats();
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    sonner_1.toast.error(error_5.message || "Failed to ".concat(action, " friend request"));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Remove friend
    var handleRemoveFriend = function (friendId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm('Are you sure you want to remove this friend?')) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, friendService_1.default.removeFriend(friendId)];
                case 2:
                    _a.sent();
                    sonner_1.toast.success('Friend removed!');
                    loadFriends();
                    loadStats();
                    return [3 /*break*/, 4];
                case 3:
                    error_6 = _a.sent();
                    sonner_1.toast.error(error_6.message || 'Failed to remove friend');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Load data on mount
    (0, react_1.useEffect)(function () {
        loadFriends();
        loadFriendRequests();
        loadStats();
    }, []);
    var pendingReceivedRequests = friendRequests.filter(function (req) {
        return req.receiver.id === (user === null || user === void 0 ? void 0 : user.id) && req.status === 'pending';
    });
    var pendingSentRequests = friendRequests.filter(function (req) {
        return req.sender.id === (user === null || user === void 0 ? void 0 : user.id) && req.status === 'pending';
    });
    document.title = "Friends - Manage Your Friends";
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-white dark:bg-black pt-10", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-8", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl  text-gray-900 dark:text-white font-bold mb-2", children: "Friends" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "Manage your friends and friend requests" })] }), stats && ((0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { className: 'bg-gray-100 border dark:border-none dark:bg-[rgba(255,255,255,.1)]', children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Total Friends" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Users, { className: "h-4 w-4 icon text-muted-foreground" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold", children: stats.totalFriends }) })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { className: 'bg-gray-100 border dark:border-none dark:bg-[rgba(255,255,255,.1)]', children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Pending Received" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-4 w-4 icon text-muted-foreground" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold", children: stats.pendingReceivedRequests }) })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { className: 'bg-gray-100 border dark:border-none dark:bg-[rgba(255,255,255,.1)]', children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-sm font-medium", children: "Pending Sent" }), (0, jsx_runtime_1.jsx)(lucide_react_1.Send, { className: "h-4 w-4 icon text-muted-foreground" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold", children: stats.pendingSentRequests }) })] })] })), (0, jsx_runtime_1.jsx)("div", { className: "mb-6 flex justify-end", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: function () { return setShowFindFriendsModal(true); }, className: (0, uiConstants_1.getButtonClasses)('primary', 'md', 'w-[200px] font-bold'), children: [(0, jsx_runtime_1.jsx)(pi_1.PiUserDuotone, { className: uiConstants_1.ICON_SIZES.md }), "Find Friends"] }) }), (0, jsx_runtime_1.jsxs)(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full h-15", children: [(0, jsx_runtime_1.jsxs)(tabs_1.TabsList, { className: "grid w-full grid-cols-3 h-15", children: [(0, jsx_runtime_1.jsxs)(tabs_1.TabsTrigger, { className: "h-13 cursor-pointer", value: "friends", children: ["Friends (", friends.length, ")"] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsTrigger, { className: "h-13 cursor-pointer", value: "received", children: ["Received (", pendingReceivedRequests.length, ")"] }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsTrigger, { className: "h-13 cursor-pointer", value: "sent", children: ["Sent (", pendingSentRequests.length, ")"] })] }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "friends", className: "mt-6", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { className: 'bg-white dark:bg-black', children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Your Friends" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "People you're connected with" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: loading ? ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8", children: "Loading friends..." })) : friends.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8 text-gray-500", children: "No friends yet. Start by finding people to connect with!" })) : ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: friends.map(function (friendship) { return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "flex items-center space-x-4 p-4 border rounded-[10px] hover:bg-gray-50 dark:bg-[rgba(255,255,255,.1)] bg-gray-100", children: [(0, jsx_runtime_1.jsxs)(avatar_1.Avatar, { className: "cursor-pointer hover:scale-110 transition-transform", onClick: function () { return handleUserAvatarClick(friendship.friend.id); }, title: "View ".concat(friendship.friend.username, "'s profile"), children: [(0, jsx_runtime_1.jsx)(avatar_1.AvatarImage, __assign({}, (0, avatarUtils_1.getAvatarProps)(friendship.friend.avatar, friendship.friend.username))), (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { children: friendship.friend.username.charAt(0).toUpperCase() })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-white truncate", children: friendship.friend.username }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400 truncate", children: friendship.friend.email })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleRemoveFriend(friendship.friend.id); }, className: "text-red-600 hover:text-red-700 w-12", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4 icon" }) })] }, friendship.id)); }) })) })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "received", className: "mt-6", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { className: 'bg-white dark:bg-black', children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Received Requests" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Friend requests waiting for your response" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: pendingReceivedRequests.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8 text-gray-500", children: "No pending friend requests" })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: pendingReceivedRequests.map(function (request) { return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "flex items-center justify-between p-4 border rounded-[10px]", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsxs)(avatar_1.Avatar, { className: "cursor-pointer hover:scale-110 transition-transform", onClick: function () { return handleUserAvatarClick(request.sender.id); }, title: "View ".concat(request.sender.username, "'s profile"), children: [(0, jsx_runtime_1.jsx)(avatar_1.AvatarImage, __assign({}, (0, avatarUtils_1.getAvatarProps)(request.sender.avatar, request.sender.username))), (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { children: request.sender.username.charAt(0).toUpperCase() })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: request.sender.username }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: request.sender.email })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { onClick: function () { return handleRespondToRequest(request.id, 'accept'); }, className: (0, uiConstants_1.getButtonClasses)('primary', 'sm', 'w-12'), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Check, { className: uiConstants_1.ICON_SIZES.sm }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: function () { return handleRespondToRequest(request.id, 'reject'); }, className: (0, uiConstants_1.getButtonClasses)('danger', 'sm', 'w-12'), children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: uiConstants_1.ICON_SIZES.sm }) })] })] }, request.id)); }) })) })] }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "sent", className: "mt-6", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { className: 'bg-white dark:bg-black ', children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Sent Requests" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Friend requests you've sent" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: pendingSentRequests.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8 text-gray-500", children: "No pending sent requests" })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: pendingSentRequests.map(function (request) { return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "flex items-center justify-between p-4 border rounded-[10px]", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsxs)(avatar_1.Avatar, { className: "cursor-pointer hover:scale-110 transition-transform", onClick: function () { return handleUserAvatarClick(request.receiver.id); }, title: "View ".concat(request.receiver.username, "'s profile"), children: [(0, jsx_runtime_1.jsx)(avatar_1.AvatarImage, __assign({}, (0, avatarUtils_1.getAvatarProps)(request.receiver.avatar, request.receiver.username))), (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { children: request.receiver.username.charAt(0).toUpperCase() })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: request.receiver.username }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: request.receiver.email })] })] }), (0, jsx_runtime_1.jsxs)(badge_1.Badge, { variant: "outline", className: "text-yellow-600 px-4 py-2 bg-gray-100", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-3 w-3 icon mr-1" }), "Pending"] })] }, request.id)); }) })) })] }) })] }), (0, jsx_runtime_1.jsx)(FindFriendsModal_1.default, { isOpen: showFindFriendsModal, onClose: function () { return setShowFindFriendsModal(false); } }), (0, jsx_runtime_1.jsx)(UserDetailsModal_1.default, { userId: selectedUserId, isOpen: showUserDetails, onClose: function () {
                        setShowUserDetails(false);
                        setSelectedUserId(null);
                    } })] }) }));
};
exports.default = Friends;
