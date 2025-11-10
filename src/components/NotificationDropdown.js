"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var button_1 = require("./ui/button");
var dropdown_menu_1 = require("./ui/dropdown-menu");
var sonner_1 = require("sonner");
var NotificationContext_1 = require("../contexts/NotificationContext");
var testNotifications_1 = require("../utils/testNotifications");
var NotificationDropdown = function () {
    var _a = (0, react_1.useState)(false), isOpen = _a[0], setIsOpen = _a[1];
    var _b = (0, NotificationContext_1.useNotifications)(), notifications = _b.notifications, unreadCount = _b.unreadCount, loading = _b.loading, loadNotifications = _b.loadNotifications, markAsRead = _b.markAsRead, markAllAsRead = _b.markAllAsRead, deleteNotification = _b.deleteNotification, deleteAllNotifications = _b.deleteAllNotifications, addNotification = _b.addNotification;
    // Add test notification
    var handleAddTestNotification = function (type) {
        var testNotification = (0, testNotifications_1.createTestNotification)(type);
        addNotification(testNotification);
    };
    // Notifications are now loaded automatically by the context
    // No need to load when dropdown opens
    // Get notification icon based on type
    var getNotificationIcon = function (type) {
        switch (type) {
            case 'task':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-4 h-4 icon text-blue-500" });
            case 'meeting':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "w-4 h-4 icon text-green-500" });
            case 'system':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.Info, { className: "w-4 h-4 icon text-purple-500" });
            case 'alert':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "w-4 h-4 icon text-red-500" });
            default:
                return (0, jsx_runtime_1.jsx)(lucide_react_1.Bell, { className: "w-4 h-4 icon text-gray-500" });
        }
    };
    // Format time ago
    var getTimeAgo = function (date) {
        var now = new Date();
        var notificationDate = new Date(date);
        var diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
        if (diffInMinutes < 1)
            return 'Just now';
        if (diffInMinutes < 60)
            return "".concat(diffInMinutes, "m ago");
        if (diffInMinutes < 1440)
            return "".concat(Math.floor(diffInMinutes / 60), "h ago");
        return "".concat(Math.floor(diffInMinutes / 1440), "d ago");
    };
    return ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { open: isOpen, onOpenChange: setIsOpen, children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "ghost", size: "sm", className: "relative p-2 w-12 text-gray-500 hover:text-black dark:hover:text-white", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bell, { className: "w-5 h-5 icon" }), unreadCount > 0 && ((0, jsx_runtime_1.jsx)("span", { className: "absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-[10px] text-[10px] text-white flex items-center justify-center", children: unreadCount > 9 ? '9+' : unreadCount }))] }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-80 bg-white dark:bg-black  border-gray-200 dark:border-gray-700 p-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-4 border-b border-gray-200 dark:border-gray-700 icon", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg  text-gray-900 dark:text-white", children: "Notifications" }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-2", children: unreadCount > 0 && ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: markAllAsRead, className: "text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400", children: "Mark all read" })) })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "max-h-96 overflow-y-auto", children: loading ? ((0, jsx_runtime_1.jsxs)("div", { className: "p-4 text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-[10px] h-6 w-6 border-b-2 border-gray-900 dark:border-white mx-auto" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-2", children: "Loading notifications..." })] })) : notifications.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "p-4 text-center text-gray-500 dark:text-gray-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bell, { className: "w-8 h-8 mx-auto mb-2 opacity-50" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm", children: "No notifications yet" })] })) : ((0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { children: notifications.map(function (notification, index) { return ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, className: "p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-black transition-colors ".concat(!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''), children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0 mt-1", children: getNotificationIcon(notification.type) }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 min-w-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium ".concat(!notification.isRead
                                                                    ? 'text-gray-900 dark:text-white'
                                                                    : 'text-gray-700 dark:text-gray-300'), children: notification.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: notification.message }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 dark:text-gray-500 mt-1", children: getTimeAgo(notification.createdAt) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1 ml-2", children: [!notification.isRead && ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return markAsRead(notification.id || notification._id); }, className: "p-1 h-6 w-6 text-gray-400 hover:text-green-600", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Check, { className: "w-3 h-3 icon" }) })), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenu, { children: [(0, jsx_runtime_1.jsx)(dropdown_menu_1.DropdownMenuTrigger, { asChild: true, children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", className: "p-1 h-6 w-6 text-gray-400 hover:text-gray-600", children: (0, jsx_runtime_1.jsx)(lucide_react_1.MoreVertical, { className: "w-3 h-3 icon" }) }) }), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-32", children: [!notification.isRead && ((0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return markAsRead(notification.id || notification._id); }, className: "text-xs", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Check, { className: "w-3 h-3 icon mr-2" }), "Mark read"] })), (0, jsx_runtime_1.jsxs)(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return deleteNotification(notification.id || notification._id); }, className: "text-xs text-red-600", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "w-3 h-3 icon mr-2" }), "Delete"] })] })] })] })] }) })] }) }, "".concat(notification.id || notification._id || index))); }) })) })] })] }));
};
exports.default = NotificationDropdown;
