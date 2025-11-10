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
exports.NotificationProvider = exports.useNotifications = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var sonner_1 = require("sonner");
var notificationService_1 = require("../services/notificationService");
var AuthContext_1 = require("./AuthContext");
var NotificationContext = (0, react_1.createContext)();
var useNotifications = function () {
    var context = (0, react_1.useContext)(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
exports.useNotifications = useNotifications;
var NotificationProvider = function (_a) {
    var children = _a.children;
    var user = (0, AuthContext_1.useAuth)().user;
    var _b = (0, react_1.useState)([]), notifications = _b[0], setNotifications = _b[1];
    var _c = (0, react_1.useState)(0), unreadCount = _c[0], setUnreadCount = _c[1];
    var _d = (0, react_1.useState)(false), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)({
        tasks: 0,
        meetings: 0,
        projects: 0,
        teams: 0,
        messages: 0,
        code: 0
    }), unreadCounts = _e[0], setUnreadCounts = _e[1];
    // Load notifications
    var loadNotifications = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, notificationService_1.default.getNotifications()];
                case 1:
                    response = _a.sent();
                    console.log('Loaded notifications:', response);
                    setNotifications(response.notifications || []);
                    updateUnreadCount(response.notifications || []);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Failed to load notifications:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    // Update unread count
    var updateUnreadCount = function (notificationsList) {
        var unread = notificationsList.filter(function (notif) { return !notif.isRead; }).length;
        setUnreadCount(unread);
        // Update specific counts by type
        var counts = {
            tasks: 0,
            meetings: 0,
            projects: 0,
            teams: 0,
            messages: 0,
            code: 0
        };
        notificationsList.forEach(function (notif) {
            if (!notif.isRead) {
                var type = notif.type || notif.notificationType || 'general';
                switch (type) {
                    case 'task':
                    case 'task_assigned':
                    case 'task_updated':
                    case 'task_completed':
                    case 'TASK_ASSIGNED':
                    case 'TASK_UPDATED':
                    case 'TASK_COMPLETED':
                        counts.tasks++;
                        break;
                    case 'meeting':
                    case 'meeting_invite':
                    case 'meeting_reminder':
                    case 'MEETING_INVITE':
                    case 'MEETING_REMINDER':
                        counts.meetings++;
                        break;
                    case 'project':
                    case 'project_invite':
                    case 'project_updated':
                    case 'PROJECT_INVITE':
                    case 'PROJECT_UPDATED':
                        counts.projects++;
                        break;
                    case 'team':
                    case 'team_invite':
                    case 'team_updated':
                    case 'TEAM_INVITE':
                    case 'TEAM_UPDATED':
                        counts.teams++;
                        break;
                    case 'message':
                    case 'chat':
                    case 'MESSAGE':
                    case 'CHAT':
                        counts.messages++;
                        break;
                    case 'code':
                    case 'code_invite':
                    case 'code_session':
                    case 'CODE_INVITE':
                    case 'CODE_SESSION':
                        counts.code++;
                        break;
                }
            }
        });
        console.log('Updated unread counts:', counts);
        setUnreadCounts(counts);
    };
    // Add new notification
    var addNotification = function (notification) {
        setNotifications(function (prev) {
            // Check if notification already exists to prevent duplicates
            var notificationId = notification.id || notification._id;
            var exists = prev.some(function (notif) { return (notif.id || notif._id) === notificationId; });
            if (exists) {
                return prev;
            }
            var updated = __spreadArray([notification], prev, true);
            updateUnreadCount(updated);
            return updated;
        });
        // Show toast for new notification
        var notificationType = notification.type || 'info';
        var title = notification.title || 'New Notification';
        var message = notification.message || '';
        if (notificationType === 'message') {
            sonner_1.toast.info("\uD83D\uDCAC ".concat(title), {
                description: message,
                duration: 5000,
                action: {
                    label: 'View',
                    onClick: function () {
                        // Navigate to chat if needed
                        window.location.href = '/dashboard/chat';
                    }
                }
            });
        }
        else {
            sonner_1.toast.info(title, {
                description: message,
                duration: 5000,
            });
        }
    };
    // Mark as read
    var markAsRead = function (notificationId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, notificationService_1.default.markAsRead(notificationId)];
                case 1:
                    _a.sent();
                    setNotifications(function (prev) {
                        var updated = prev.map(function (notif) {
                            return (notif.id || notif._id) === notificationId
                                ? __assign(__assign({}, notif), { isRead: true }) : notif;
                        });
                        updateUnreadCount(updated);
                        return updated;
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Failed to mark notification as read:', error_2);
                    sonner_1.toast.error('Failed to mark notification as read');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Mark all as read
    var markAllAsRead = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, notificationService_1.default.markAllAsRead()];
                case 1:
                    _a.sent();
                    setNotifications(function (prev) {
                        var updated = prev.map(function (notif) { return (__assign(__assign({}, notif), { isRead: true })); });
                        updateUnreadCount(updated);
                        return updated;
                    });
                    sonner_1.toast.success('All notifications marked as read');
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Failed to mark all as read:', error_3);
                    sonner_1.toast.error('Failed to mark all as read');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Mark notifications as read by type
    var markAsReadByType = function (type) { return __awaiter(void 0, void 0, void 0, function () {
        var unreadNotifications, promises, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    unreadNotifications = notifications.filter(function (notif) {
                        if (notif.isRead)
                            return false;
                        var notificationType = notif.type || notif.notificationType || 'general';
                        switch (type) {
                            case 'tasks':
                                return ['task', 'task_assigned', 'task_updated', 'task_completed', 'TASK_ASSIGNED', 'TASK_UPDATED', 'TASK_COMPLETED'].includes(notificationType);
                            case 'meetings':
                                return ['meeting', 'meeting_invite', 'meeting_reminder', 'MEETING_INVITE', 'MEETING_REMINDER'].includes(notificationType);
                            case 'projects':
                                return ['project', 'project_invite', 'project_updated', 'PROJECT_INVITE', 'PROJECT_UPDATED'].includes(notificationType);
                            case 'teams':
                                return ['team', 'team_invite', 'team_updated', 'TEAM_INVITE', 'TEAM_UPDATED'].includes(notificationType);
                            case 'messages':
                                return ['message', 'chat', 'MESSAGE', 'CHAT'].includes(notificationType);
                            case 'code':
                                return ['code', 'code_invite', 'code_session', 'CODE_INVITE', 'CODE_SESSION'].includes(notificationType);
                            default:
                                return false;
                        }
                    });
                    if (unreadNotifications.length === 0)
                        return [2 /*return*/];
                    promises = unreadNotifications.map(function (notif) {
                        return notificationService_1.default.markAsRead(notif.id || notif._id);
                    });
                    return [4 /*yield*/, Promise.all(promises)
                        // Update local state
                    ];
                case 1:
                    _a.sent();
                    // Update local state
                    setNotifications(function (prev) {
                        var updated = prev.map(function (notif) {
                            var notificationType = notif.type || notif.notificationType || 'general';
                            var shouldMarkAsRead = false;
                            switch (type) {
                                case 'tasks':
                                    shouldMarkAsRead = ['task', 'task_assigned', 'task_updated', 'task_completed', 'TASK_ASSIGNED', 'TASK_UPDATED', 'TASK_COMPLETED'].includes(notificationType);
                                    break;
                                case 'meetings':
                                    shouldMarkAsRead = ['meeting', 'meeting_invite', 'meeting_reminder', 'MEETING_INVITE', 'MEETING_REMINDER'].includes(notificationType);
                                    break;
                                case 'projects':
                                    shouldMarkAsRead = ['project', 'project_invite', 'project_updated', 'PROJECT_INVITE', 'PROJECT_UPDATED'].includes(notificationType);
                                    break;
                                case 'teams':
                                    shouldMarkAsRead = ['team', 'team_invite', 'team_updated', 'TEAM_INVITE', 'TEAM_UPDATED'].includes(notificationType);
                                    break;
                                case 'messages':
                                    shouldMarkAsRead = ['message', 'chat', 'MESSAGE', 'CHAT'].includes(notificationType);
                                    break;
                                case 'code':
                                    shouldMarkAsRead = ['code', 'code_invite', 'code_session', 'CODE_INVITE', 'CODE_SESSION'].includes(notificationType);
                                    break;
                            }
                            return shouldMarkAsRead ? __assign(__assign({}, notif), { isRead: true }) : notif;
                        });
                        updateUnreadCount(updated);
                        return updated;
                    });
                    console.log("Marked ".concat(unreadNotifications.length, " ").concat(type, " notifications as read"));
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error("Failed to mark ".concat(type, " notifications as read:"), error_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Delete notification
    var deleteNotification = function (notificationId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, notificationService_1.default.deleteNotification(notificationId)];
                case 1:
                    _a.sent();
                    setNotifications(function (prev) {
                        var updated = prev.filter(function (notif) { return notif.id !== notificationId; });
                        updateUnreadCount(updated);
                        return updated;
                    });
                    sonner_1.toast.success('Notification deleted');
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    console.error('Failed to delete notification:', error_5);
                    sonner_1.toast.error('Failed to delete notification');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Delete all notifications
    var deleteAllNotifications = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, notificationService_1.default.deleteAllNotifications()];
                case 1:
                    _a.sent();
                    setNotifications([]);
                    setUnreadCount(0);
                    sonner_1.toast.success('All notifications deleted');
                    return [3 /*break*/, 3];
                case 2:
                    error_6 = _a.sent();
                    console.error('Failed to delete all notifications:', error_6);
                    sonner_1.toast.error('Failed to delete all notifications');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Load notifications automatically when user is authenticated
    (0, react_1.useEffect)(function () {
        if (user) {
            console.log('User authenticated, loading notifications...');
            loadNotifications();
        }
        else {
            // Clear notifications when user logs out
            console.log('User not authenticated, clearing notifications...');
            setNotifications([]);
            setUnreadCount(0);
            setUnreadCounts({
                tasks: 0,
                meetings: 0,
                projects: 0,
                teams: 0,
                messages: 0,
                code: 0
            });
        }
    }, [user, loadNotifications]);
    // Set up periodic refresh of notifications every 30 seconds when user is authenticated
    (0, react_1.useEffect)(function () {
        if (!user)
            return;
        console.log('Setting up notification refresh interval...');
        var interval = setInterval(function () {
            console.log('Refreshing notifications...');
            loadNotifications();
        }, 30000); // 30 seconds
        return function () {
            console.log('Clearing notification refresh interval...');
            clearInterval(interval);
        };
    }, [user, loadNotifications]);
    var value = {
        notifications: notifications,
        unreadCount: unreadCount,
        unreadCounts: unreadCounts,
        loading: loading,
        loadNotifications: loadNotifications,
        addNotification: addNotification,
        markAsRead: markAsRead,
        markAllAsRead: markAllAsRead,
        markAsReadByType: markAsReadByType,
        deleteNotification: deleteNotification,
        deleteAllNotifications: deleteAllNotifications,
    };
    return ((0, jsx_runtime_1.jsx)(NotificationContext.Provider, { value: value, children: children }));
};
exports.NotificationProvider = NotificationProvider;
