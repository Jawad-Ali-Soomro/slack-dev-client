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
exports.ChatProvider = exports.useChat = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var socket_io_client_1 = require("socket.io-client");
var sonner_1 = require("sonner");
var AuthContext_1 = require("./AuthContext");
var NotificationContext_1 = require("./NotificationContext");
var chatService_1 = require("../services/chatService");
var ChatContext = (0, react_1.createContext)();
var useChat = function () {
    var context = (0, react_1.useContext)(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
exports.useChat = useChat;
var ChatProvider = function (_a) {
    var children = _a.children;
    var _b = (0, AuthContext_1.useAuth)(), user = _b.user, token = _b.token;
    var addNotification = (0, NotificationContext_1.useNotifications)().addNotification;
    var _c = (0, react_1.useState)(null), socket = _c[0], setSocket = _c[1];
    var _d = (0, react_1.useState)([]), chats = _d[0], setChats = _d[1];
    var _e = (0, react_1.useState)(null), currentChat = _e[0], setCurrentChat = _e[1];
    var _f = (0, react_1.useState)([]), messages = _f[0], setMessages = _f[1];
    var _g = (0, react_1.useState)(0), unreadCount = _g[0], setUnreadCount = _g[1];
    var _h = (0, react_1.useState)([]), onlineUsers = _h[0], setOnlineUsers = _h[1];
    var _j = (0, react_1.useState)({}), typingUsers = _j[0], setTypingUsers = _j[1];
    var _k = (0, react_1.useState)(false), isConnected = _k[0], setIsConnected = _k[1];
    var _l = (0, react_1.useState)(false), loading = _l[0], setLoading = _l[1];
    var _m = (0, react_1.useState)(null), error = _m[0], setError = _m[1];
    var typingTimeoutRef = (0, react_1.useRef)({});
    var messagesEndRef = (0, react_1.useRef)(null);
    // Initialize socket connection
    (0, react_1.useEffect)(function () {
        if (user && token) {
            var apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
            var newSocket_1 = (0, socket_io_client_1.io)(apiUrl, {
                auth: {
                    token: token
                },
                transports: ['websocket', 'polling'],
                timeout: 20000,
                forceNew: true,
                autoConnect: true,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
                maxReconnectionAttempts: 5
            });
            newSocket_1.on('connect', function () {
                setIsConnected(true);
                setError(null);
            });
            newSocket_1.on('disconnect', function (reason) {
                setIsConnected(false);
                // Auto-reconnect if not manually disconnected
                if (reason !== 'io client disconnect') {
                    setTimeout(function () {
                        newSocket_1.connect();
                    }, 3000);
                }
            });
            newSocket_1.on('connect_error', function (error) {
                setIsConnected(false);
                setError('Connection failed: ' + error.message);
                // Try to reconnect after a delay
                setTimeout(function () {
                    if (!isConnected) {
                        newSocket_1.connect();
                    }
                }, 5000);
            });
            newSocket_1.on('connected', function (data) {
                setIsConnected(true);
                setError(null);
            });
            newSocket_1.on('new_message', function (message) {
                setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [message], false); });
                if (currentChat && message.chat === currentChat._id) {
                    scrollToBottom();
                }
                // Show toast notification for new messages (only if not from current user)
                if (message.sender && message.sender._id !== (user === null || user === void 0 ? void 0 : user.id) && message.sender._id !== (user === null || user === void 0 ? void 0 : user._id)) {
                    var senderName = message.sender.name || message.sender.username || 'Unknown User';
                    sonner_1.toast.success("".concat(senderName, " sent a message just now"), {
                        description: message.content.length > 50 ? "".concat(message.content.substring(0, 50), "...") : message.content,
                        duration: 4000,
                        position: 'top-center',
                        action: {
                            label: 'View Chat',
                            onClick: function () {
                                // Find the chat and switch to it
                                var chat = chats.find(function (c) { return c._id === message.chat; });
                                if (chat) {
                                    setCurrentChat(chat);
                                }
                            }
                        }
                    });
                }
            });
            newSocket_1.on('chat_updated', function (updatedChat) {
                console.log('Received chat update:', updatedChat);
                console.log('Updated chat participants:', updatedChat.participants);
                setChats(function (prev) {
                    return prev.map(function (chat) { return chat._id === updatedChat._id ? updatedChat : chat; });
                });
            });
            newSocket_1.on('message_updated', function (message) {
                setMessages(function (prev) {
                    return prev.map(function (msg) { return msg._id === message._id ? message : msg; });
                });
            });
            newSocket_1.on('message_deleted', function (data) {
                setMessages(function (prev) {
                    return prev.map(function (msg) {
                        return msg._id === data.messageId
                            ? __assign(__assign({}, msg), { isDeleted: true, content: 'This message was deleted' }) : msg;
                    });
                });
            });
            newSocket_1.on('user_online', function (data) {
                setOnlineUsers(function (prev) {
                    var filtered = prev.filter(function (u) { return u.userId !== data.userId; });
                    return __spreadArray(__spreadArray([], filtered, true), [__assign(__assign({}, data), { isOnline: true })], false);
                });
                // Show toast notification when a user comes online (only if not current user)
                if (data.userId !== (user === null || user === void 0 ? void 0 : user.id) && data.userId !== (user === null || user === void 0 ? void 0 : user._id)) {
                    var userName = data.name || data.username || 'Unknown User';
                    sonner_1.toast.info("".concat(userName, " is now online"), {
                        duration: 3000,
                        position: 'top-center'
                    });
                }
            });
            newSocket_1.on('user_offline', function (data) {
                setOnlineUsers(function (prev) {
                    return prev.map(function (u) {
                        return u.userId === data.userId
                            ? __assign(__assign({}, u), { isOnline: false, lastSeen: data.lastSeen }) : u;
                    });
                });
                // Show toast notification when a user goes offline (only if not current user)
                if (data.userId !== (user === null || user === void 0 ? void 0 : user.id) && data.userId !== (user === null || user === void 0 ? void 0 : user._id)) {
                    var userName = data.name || data.username || 'Unknown User';
                    sonner_1.toast.warning("".concat(userName, " is now offline"), {
                        duration: 3000,
                        position: 'top-center'
                    });
                }
            });
            newSocket_1.on('user_typing', function (data) {
                setTypingUsers(function (prev) {
                    var _a;
                    return (__assign(__assign({}, prev), (_a = {}, _a[data.chatId] = data.isTyping
                        ? __spreadArray(__spreadArray([], (prev[data.chatId] || []).filter(function (u) { return u.userId !== data.userId; }), true), [data], false) : (prev[data.chatId] || []).filter(function (u) { return u.userId !== data.userId; }), _a)));
                });
            });
            newSocket_1.on('message_read', function (data) {
                setMessages(function (prev) {
                    return prev.map(function (msg) {
                        return msg._id === data.messageId
                            ? __assign(__assign({}, msg), { readBy: __spreadArray(__spreadArray([], (msg.readBy || []), true), [{ user: data.userId, readAt: data.readAt }], false) }) : msg;
                    });
                });
            });
            newSocket_1.on('new_notification', function (notification) {
                addNotification(notification);
            });
            setSocket(newSocket_1);
            return function () {
                newSocket_1.close();
            };
        }
    }, [user, token]);
    // Load initial data
    // Load chats when user is available (from DB first)
    (0, react_1.useEffect)(function () {
        if (user) {
            loadChats();
            loadUnreadCount();
        }
    }, [user]);
    // Additional socket events when socket connects
    (0, react_1.useEffect)(function () {
        if (socket && user) {
            // Socket is connected, we can now sync real-time updates
        }
    }, [socket, user]);
    // Load messages when chat changes
    (0, react_1.useEffect)(function () {
        if (currentChat) {
            loadMessages();
            if (socket) {
                joinChat(currentChat._id);
            }
        }
        else {
            // Clear messages when no chat is selected
            setMessages([]);
        }
    }, [currentChat, socket]);
    var loadChats = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, chatService_1.chatService.getUserChats()];
                case 1:
                    response = _a.sent();
                    setChats(response.data);
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _a.sent();
                    setError('Failed to load chats');
                    console.error('Error loading chats:', err_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var loadMessages = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!currentChat) {
                        setMessages([]);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, chatService_1.chatService.getChatMessages(currentChat._id)];
                case 2:
                    response = _a.sent();
                    setMessages(response.data);
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    setError('Failed to load messages');
                    console.error('Error loading messages:', err_2);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var loadUnreadCount = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, chatService_1.chatService.getUnreadCount()];
                case 1:
                    response = _a.sent();
                    setUnreadCount(response.data.unreadCount);
                    return [3 /*break*/, 3];
                case 2:
                    err_3 = _a.sent();
                    console.error('Error loading unread count:', err_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var createChat = function (participants_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([participants_1], args_1, true), void 0, function (participants, type, name, description) {
            var currentUserId_1, existingChat, response_1, existingChatInList, err_4;
            if (type === void 0) { type = 'direct'; }
            if (name === void 0) { name = null; }
            if (description === void 0) { description = null; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        setLoading(true);
                        // For direct chats, check if a chat already exists with the same participants
                        if (type === 'direct' && participants.length === 1) {
                            currentUserId_1 = (user === null || user === void 0 ? void 0 : user.id) || (user === null || user === void 0 ? void 0 : user._id);
                            existingChat = chats.find(function (chat) {
                                if (chat.type !== 'direct' || chat.participants.length !== 2)
                                    return false;
                                var participantIds = chat.participants.map(function (p) { return p._id || p.id; });
                                return participantIds.includes(currentUserId_1) && participantIds.includes(participants[0]);
                            });
                            if (existingChat) {
                                console.log('Chat already exists, switching to existing chat');
                                setCurrentChat(existingChat);
                                return [2 /*return*/, existingChat];
                            }
                        }
                        return [4 /*yield*/, chatService_1.chatService.createChat({
                                participants: participants,
                                type: type,
                                name: name,
                                description: description
                            })];
                    case 1:
                        response_1 = _a.sent();
                        existingChatInList = chats.find(function (chat) { return chat._id === response_1.data._id; });
                        if (!existingChatInList) {
                            // Only add to chats if it doesn't already exist
                            setChats(function (prev) { return __spreadArray([response_1.data], prev, true); });
                        }
                        else {
                            // If chat exists, update it with the latest data
                            setChats(function (prev) {
                                return prev.map(function (chat) {
                                    return chat._id === response_1.data._id ? response_1.data : chat;
                                });
                            });
                        }
                        setCurrentChat(response_1.data);
                        return [2 /*return*/, response_1.data];
                    case 2:
                        err_4 = _a.sent();
                        setError('Failed to create chat');
                        console.error('Error creating chat:', err_4);
                        throw err_4;
                    case 3:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    var sendMessage = function (content_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([content_1], args_1, true), void 0, function (content, type, attachments, replyTo) {
            var response, err_5;
            if (type === void 0) { type = 'text'; }
            if (attachments === void 0) { attachments = []; }
            if (replyTo === void 0) { replyTo = null; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!currentChat || !content.trim())
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, chatService_1.chatService.sendMessage({
                                chatId: currentChat._id,
                                content: content.trim(),
                                type: type,
                                attachments: attachments,
                                replyTo: replyTo
                            })];
                    case 2:
                        response = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_5 = _a.sent();
                        setError('Failed to send message');
                        console.error('Error sending message:', err_5);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    var updateMessage = function (messageId, content) { return __awaiter(void 0, void 0, void 0, function () {
        var response_2, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, chatService_1.chatService.updateMessage(messageId, { content: content })];
                case 1:
                    response_2 = _a.sent();
                    setMessages(function (prev) {
                        return prev.map(function (msg) { return msg._id === messageId ? response_2.data : msg; });
                    });
                    return [3 /*break*/, 3];
                case 2:
                    err_6 = _a.sent();
                    setError('Failed to update message');
                    console.error('Error updating message:', err_6);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var deleteMessage = function (messageId) { return __awaiter(void 0, void 0, void 0, function () {
        var err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, chatService_1.chatService.deleteMessage(messageId)];
                case 1:
                    _a.sent();
                    setMessages(function (prev) {
                        return prev.map(function (msg) {
                            return msg._id === messageId
                                ? __assign(__assign({}, msg), { isDeleted: true, content: 'This message was deleted' }) : msg;
                        });
                    });
                    return [3 /*break*/, 3];
                case 2:
                    err_7 = _a.sent();
                    setError('Failed to delete message');
                    console.error('Error deleting message:', err_7);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var markAsRead = function (chatId) { return __awaiter(void 0, void 0, void 0, function () {
        var err_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, chatService_1.chatService.markAsRead(chatId)];
                case 1:
                    _a.sent();
                    setMessages(function (prev) {
                        return prev.map(function (msg) {
                            return msg.chat === chatId
                                ? __assign(__assign({}, msg), { readBy: __spreadArray(__spreadArray([], (msg.readBy || []), true), [{ user: user.id, readAt: new Date() }], false) }) : msg;
                        });
                    });
                    return [3 /*break*/, 3];
                case 2:
                    err_8 = _a.sent();
                    console.error('Error marking as read:', err_8);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var joinChat = function (chatId) {
        if (socket) {
            socket.emit('join_chat', chatId);
        }
    };
    var leaveChat = function (chatId) {
        if (socket) {
            socket.emit('leave_chat', chatId);
        }
    };
    var startTyping = function (chatId) {
        if (socket) {
            socket.emit('typing_start', { chatId: chatId });
            clearTimeout(typingTimeoutRef.current[chatId]);
            typingTimeoutRef.current[chatId] = setTimeout(function () {
                stopTyping(chatId);
            }, 3000);
        }
    };
    var stopTyping = function (chatId) {
        if (socket) {
            socket.emit('typing_stop', { chatId: chatId });
            clearTimeout(typingTimeoutRef.current[chatId]);
        }
    };
    var scrollToBottom = function () {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    };
    var getChatName = function (chat) {
        if (chat.type === 'group') {
            return chat.name;
        }
        if (!chat.participants || chat.participants.length === 0) {
            return 'Unknown User';
        }
        var currentUserId = (user === null || user === void 0 ? void 0 : user.id) || (user === null || user === void 0 ? void 0 : user._id);
        var otherParticipant = chat.participants.find(function (p) {
            var participantId = p._id || p.id;
            return participantId && participantId.toString() !== (currentUserId === null || currentUserId === void 0 ? void 0 : currentUserId.toString());
        });
        if (!otherParticipant) {
            return 'Unknown User';
        }
        return otherParticipant.username || otherParticipant.name || 'Unknown User';
    };
    var getChatAvatar = function (chat) {
        if (chat.type === 'group') {
            return null; // You can add group avatar logic here
        }
        if (!chat.participants || chat.participants.length === 0) {
            return null;
        }
        var currentUserId = (user === null || user === void 0 ? void 0 : user.id) || (user === null || user === void 0 ? void 0 : user._id);
        var otherParticipant = chat.participants.find(function (p) {
            var participantId = p._id || p.id;
            return participantId && participantId.toString() !== (currentUserId === null || currentUserId === void 0 ? void 0 : currentUserId.toString());
        });
        return otherParticipant === null || otherParticipant === void 0 ? void 0 : otherParticipant.avatar;
    };
    var isUserOnline = function (userId) {
        var onlineUser = onlineUsers.find(function (u) { return u.userId === userId; });
        return (onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.isOnline) || false;
    };
    var getTypingUsers = function (chatId) {
        return typingUsers[chatId] || [];
    };
    var value = {
        // State
        chats: chats,
        currentChat: currentChat,
        messages: messages,
        unreadCount: unreadCount,
        onlineUsers: onlineUsers,
        typingUsers: typingUsers,
        isConnected: isConnected,
        loading: loading,
        error: error,
        messagesEndRef: messagesEndRef,
        // Actions
        createChat: createChat,
        setCurrentChat: setCurrentChat,
        sendMessage: sendMessage,
        updateMessage: updateMessage,
        deleteMessage: deleteMessage,
        markAsRead: markAsRead,
        loadChats: loadChats,
        loadMessages: loadMessages,
        loadUnreadCount: loadUnreadCount,
        joinChat: joinChat,
        leaveChat: leaveChat,
        startTyping: startTyping,
        stopTyping: stopTyping,
        scrollToBottom: scrollToBottom,
        getChatName: getChatName,
        getChatAvatar: getChatAvatar,
        isUserOnline: isUserOnline,
        getTypingUsers: getTypingUsers,
        setError: setError
    };
    return ((0, jsx_runtime_1.jsx)(ChatContext.Provider, { value: value, children: children }));
};
exports.ChatProvider = ChatProvider;
