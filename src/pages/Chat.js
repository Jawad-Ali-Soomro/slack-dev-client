"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var ChatContext_1 = require("../contexts/ChatContext");
var NotificationContext_1 = require("../contexts/NotificationContext");
var ChatList_1 = require("../components/ChatList");
var ChatWindow_1 = require("../components/ChatWindow");
var CreateChatModal_1 = require("../components/CreateChatModal");
var button_1 = require("../components/ui/button");
var lucide_react_1 = require("lucide-react");
var Chat = function () {
    document.title = "Chat - Message Your Friends";
    var _a = (0, ChatContext_1.useChat)(), isConnected = _a.isConnected, unreadCount = _a.unreadCount, error = _a.error;
    var markAsReadByType = (0, NotificationContext_1.useNotifications)().markAsReadByType;
    var _b = (0, react_1.useState)(false), showCreateModal = _b[0], setShowCreateModal = _b[1];
    var _c = (0, react_1.useState)(window.innerWidth < 600), isMobile = _c[0], setIsMobile = _c[1];
    react_1.default.useEffect(function () {
        var handleResize = function () {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return function () { return window.removeEventListener('resize', handleResize); };
    }, []);
    // Mark message notifications as read when user visits this page
    (0, react_1.useEffect)(function () {
        markAsReadByType('messages');
    }, [markAsReadByType]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: 'max-h-[90vh]', children: [(0, jsx_runtime_1.jsx)("div", { className: "border-b backdrop-blur icon pt-2", children: (0, jsx_runtime_1.jsx)("div", { className: "flex h-14 items-center px-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "ml-auto flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-1 text-sm", children: isConnected ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Wifi, { className: "h-4 w-4 text-green-500" }), (0, jsx_runtime_1.jsx)("span", { className: "text-green-600 dark:text-green-400", children: "Connected" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.WifiOff, { className: "h-4 w-4 icon text-red-500" }), (0, jsx_runtime_1.jsx)("span", { className: "text-red-600 dark:text-red-400", children: "Disconnected" })] })) }), error && ((0, jsx_runtime_1.jsx)("div", { className: "text-xs text-red-500 max-w-32 truncate", title: error, children: error })), (0, jsx_runtime_1.jsx)(button_1.Button, { size: "sm", onClick: function () { return setShowCreateModal(true); }, className: "h-8 w-8 p-0", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4 icon" }) })] }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "flex h-[calc(100vh-3.5rem)]", children: isMobile ? (
                // Mobile view - show either chat list or chat window
                (0, jsx_runtime_1.jsx)("div", { className: "flex-1", children: (0, jsx_runtime_1.jsx)(ChatList_1.default, {}) })) : (
                // Desktop view - show both side by side
                (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "w-80 border-r", children: (0, jsx_runtime_1.jsx)(ChatList_1.default, {}) }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1", children: (0, jsx_runtime_1.jsx)(ChatWindow_1.default, {}) })] })) }), (0, jsx_runtime_1.jsx)(CreateChatModal_1.default, { isOpen: showCreateModal, onClose: function () { return setShowCreateModal(false); } })] }));
};
exports.default = Chat;
