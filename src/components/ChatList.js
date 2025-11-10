"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var ChatContext_1 = require("../contexts/ChatContext");
var AuthContext_1 = require("../contexts/AuthContext");
var button_1 = require("./ui/button");
var input_1 = require("./ui/input");
var card_1 = require("./ui/card");
var badge_1 = require("./ui/badge");
var avatar_1 = require("./ui/avatar");
var lucide_react_1 = require("lucide-react");
var ChatList = function () {
    var user = (0, AuthContext_1.useAuth)().user;
    var _a = (0, ChatContext_1.useChat)(), chats = _a.chats, currentChat = _a.currentChat, setCurrentChat = _a.setCurrentChat, unreadCount = _a.unreadCount, getChatName = _a.getChatName, getChatAvatar = _a.getChatAvatar, isUserOnline = _a.isUserOnline, loading = _a.loading;
    var getAvatarUrl = function (avatar) {
        if (!avatar)
            return null;
        // If avatar is already a full URL, return as is
        if (avatar.startsWith('http'))
            return avatar;
        // If avatar is a relative path, prefix with server URL
        var apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        return "".concat(apiUrl).concat(avatar.startsWith('/') ? '' : '/').concat(avatar);
    };
    var _b = (0, react_1.useState)(''), searchTerm = _b[0], setSearchTerm = _b[1];
    var _c = (0, react_1.useState)(false), showCreateChat = _c[0], setShowCreateChat = _c[1];
    var filteredChats = chats.filter(function (chat) {
        return getChatName(chat).toLowerCase().includes(searchTerm.toLowerCase());
    });
    var formatTime = function (date) {
        if (!date)
            return '';
        var now = new Date();
        var messageDate = new Date(date);
        var diffInHours = (now - messageDate) / (1000 * 60 * 60);
        if (diffInHours < 24) {
            return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        else if (diffInHours < 168) { // 7 days
            return messageDate.toLocaleDateString([], { weekday: 'short' });
        }
        else {
            return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center h-full", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-[10px] h-8 w-8 border-b-2 border-primary" }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full border-r icon", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-4 border-b icon", children: (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 icon text-muted-foreground" }), (0, jsx_runtime_1.jsx)(input_1.Input, { placeholder: "Search chats...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-10" })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 overflow-y-auto", children: filteredChats.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center h-full text-muted-foreground", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MessageCircle, { className: "h-12 w-12 mb-4" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm", children: "No chats found" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs", children: "Start a conversation with someone" })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-1 p-2", children: filteredChats.map(function (chat) {
                        var _a;
                        var isActive = (currentChat === null || currentChat === void 0 ? void 0 : currentChat._id) === chat._id;
                        var chatName = getChatName(chat);
                        var chatAvatar = getChatAvatar(chat);
                        var otherParticipant = chat.participants.find(function (p) { return p._id !== (user === null || user === void 0 ? void 0 : user.id) && p._id !== (user === null || user === void 0 ? void 0 : user._id); });
                        var isOnline = otherParticipant ? isUserOnline(otherParticipant._id) : false;
                        return ((0, jsx_runtime_1.jsx)(card_1.Card, { className: "cursor-pointer border dark:bg-black bg-white ".concat(isActive ? 'bg-muted border bg-white dark:bg-[rgba(255,255,255,.1)] bg-gray-100' : ''), onClick: function () { return setCurrentChat(chat); }, children: (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-3", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsxs)(avatar_1.Avatar, { className: "h-10 w-10 border border-gray-300 dark:border-gray-700", children: [(0, jsx_runtime_1.jsx)(avatar_1.AvatarImage, { src: getAvatarUrl(chatAvatar) }), (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { children: chatName.charAt(0).toUpperCase() })] }), isOnline && ((0, jsx_runtime_1.jsx)("div", { className: "absolute -bottom-1 -right-1 h-3 w-3 bg-green-500  border-background rounded-[10px]" }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-medium text-sm truncate", children: chatName }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs text-muted-foreground", children: formatTime(chat.lastMessageAt) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mt-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs text-muted-foreground truncate", children: ((_a = chat.lastMessage) === null || _a === void 0 ? void 0 : _a.content) || 'No messages yet' }), chat.unreadCount > 0 && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "destructive", className: "h-5 w-5 p-0 text-xs flex items-center justify-center", children: chat.unreadCount }))] })] })] }) }) }, chat._id));
                    }) })) })] }));
};
exports.default = ChatList;
