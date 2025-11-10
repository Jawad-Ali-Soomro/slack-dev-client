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
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var ChatContext_1 = require("../contexts/ChatContext");
var AuthContext_1 = require("../contexts/AuthContext");
var button_1 = require("./ui/button");
var input_1 = require("./ui/input");
var card_1 = require("./ui/card");
var avatar_1 = require("./ui/avatar");
var badge_1 = require("./ui/badge");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var ChatWindow = function () {
    var _a = (0, ChatContext_1.useChat)(), currentChat = _a.currentChat, messages = _a.messages, sendMessage = _a.sendMessage, updateMessage = _a.updateMessage, deleteMessage = _a.deleteMessage, markAsRead = _a.markAsRead, getChatName = _a.getChatName, getChatAvatar = _a.getChatAvatar, isUserOnline = _a.isUserOnline, getTypingUsers = _a.getTypingUsers, startTyping = _a.startTyping, stopTyping = _a.stopTyping, messagesEndRef = _a.messagesEndRef, loading = _a.loading;
    var user = (0, AuthContext_1.useAuth)().user;
    var _b = (0, react_1.useState)(''), messageText = _b[0], setMessageText = _b[1];
    var _c = (0, react_1.useState)(null), editingMessage = _c[0], setEditingMessage = _c[1];
    var _d = (0, react_1.useState)(null), replyTo = _d[0], setReplyTo = _d[1];
    var _e = (0, react_1.useState)(false), showEmojiPicker = _e[0], setShowEmojiPicker = _e[1];
    var _f = (0, react_1.useState)(false), showOptions = _f[0], setShowOptions = _f[1];
    var _g = (0, react_1.useState)(false), showScrollButton = _g[0], setShowScrollButton = _g[1];
    var inputRef = (0, react_1.useRef)(null);
    var fileInputRef = (0, react_1.useRef)(null);
    var messagesContainerRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        if (currentChat) {
            markAsRead(currentChat._id);
        }
    }, [currentChat, markAsRead]);
    // Custom scroll to bottom function for better control
    var scrollToBottomLocal = function () {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };
    // Auto-scroll to bottom when messages change (but not on initial load)
    (0, react_1.useEffect)(function () {
        if (messages.length > 0) {
            // Use requestAnimationFrame to ensure DOM is updated
            requestAnimationFrame(function () {
                setTimeout(function () {
                    scrollToBottomLocal();
                }, 50);
            });
        }
    }, [messages.length]);
    // Scroll to bottom when current chat changes
    (0, react_1.useEffect)(function () {
        if (currentChat) {
            // Wait for messages to load, then scroll
            var timer_1 = setTimeout(function () {
                if (messages.length > 0) {
                    scrollToBottomLocal();
                }
            }, 200);
            return function () { return clearTimeout(timer_1); };
        }
    }, [currentChat]);
    // Initial scroll to bottom when component mounts with messages
    (0, react_1.useEffect)(function () {
        if (messages.length > 0 && messagesContainerRef.current) {
            // Force immediate scroll to bottom on mount
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight - 200;
        }
    }, []);
    // Handle scroll events to show/hide scroll-to-bottom button
    (0, react_1.useEffect)(function () {
        var messagesContainer = messagesContainerRef.current;
        if (!messagesContainer)
            return;
        var handleScroll = function () {
            var scrollTop = messagesContainer.scrollTop, scrollHeight = messagesContainer.scrollHeight, clientHeight = messagesContainer.clientHeight;
            var isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
            setShowScrollButton(!isNearBottom && messages.length > 5);
        };
        messagesContainer.addEventListener('scroll', handleScroll);
        return function () { return messagesContainer.removeEventListener('scroll', handleScroll); };
    }, [messages.length]);
    var handleSendMessage = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!messageText.trim() || !currentChat)
                        return [2 /*return*/];
                    if (!editingMessage) return [3 /*break*/, 2];
                    return [4 /*yield*/, updateMessage(editingMessage._id, messageText)];
                case 1:
                    _a.sent();
                    setEditingMessage(null);
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, sendMessage(messageText, 'text', [], replyTo === null || replyTo === void 0 ? void 0 : replyTo._id)];
                case 3:
                    _a.sent();
                    setReplyTo(null);
                    _a.label = 4;
                case 4:
                    setMessageText('');
                    stopTyping(currentChat._id);
                    // Scroll to bottom after sending message
                    requestAnimationFrame(function () {
                        setTimeout(function () {
                            scrollToBottomLocal();
                        }, 50);
                    });
                    return [2 /*return*/];
            }
        });
    }); };
    var handleTyping = function (e) {
        setMessageText(e.target.value);
        if (currentChat) {
            if (e.target.value.trim()) {
                startTyping(currentChat._id);
            }
            else {
                stopTyping(currentChat._id);
            }
        }
    };
    var handleKeyPress = function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };
    var handleEditMessage = function (message) {
        var _a;
        setEditingMessage(message);
        setMessageText(message.content);
        (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
    };
    var handleDeleteMessage = function (messageId) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm('Are you sure you want to delete this message?')) return [3 /*break*/, 2];
                    return [4 /*yield*/, deleteMessage(messageId)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    var handleReplyToMessage = function (message) {
        var _a;
        setReplyTo(message);
        (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
    };
    var handleFileUpload = function (e) {
        var files = Array.from(e.target.files);
        // Handle file upload logic here
        console.log('Files to upload:', files);
    };
    var formatMessageTime = function (date) {
        return (0, date_fns_1.formatDistanceToNow)(new Date(date), { addSuffix: true });
    };
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
    var typingUsers = currentChat ? getTypingUsers(currentChat._id) : [];
    var otherParticipant = currentChat === null || currentChat === void 0 ? void 0 : currentChat.participants.find(function (p) { return p._id !== (user === null || user === void 0 ? void 0 : user.id) && p._id !== (user === null || user === void 0 ? void 0 : user._id); });
    var isOnline = otherParticipant ? isUserOnline(otherParticipant._id) : false;
    if (!currentChat) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center h-full bg-muted/20", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-16 w-16 mx-auto mb-4 rounded-[10px] bg-muted flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Send, { className: "h-8 w-8 text-muted-foreground" }) }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium mb-2", children: "Select a chat" }), (0, jsx_runtime_1.jsx)("p", { className: "text-muted-foreground", children: "Choose a conversation to start messaging" })] }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0 border-b icon p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsxs)(avatar_1.Avatar, { className: "h-10 w-10", children: [(0, jsx_runtime_1.jsx)(avatar_1.AvatarImage, { src: getAvatarUrl(getChatAvatar(currentChat)) }), (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { children: getChatName(currentChat).charAt(0).toUpperCase() })] }), isOnline && ((0, jsx_runtime_1.jsx)("div", { className: "absolute -bottom-1 -right-1 h-3 w-3 bg-green-500  border-background rounded-[10px]" }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "", children: getChatName(currentChat) }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground", children: isOnline ? 'Online' : 'Offline' })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Phone, { className: "h-4 w-4 icon icon" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Video, { className: "h-4 w-4 icon icon" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Info, { className: "h-4 w-4 icon icon" }) })] })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 flex flex-col min-h-0 pb-26 relative", children: [(0, jsx_runtime_1.jsxs)("div", { ref: messagesContainerRef, className: "flex-1 overflow-y-auto p-4 space-y-4 relative", children: [loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center h-full", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-[10px] h-8 w-8 border-b-2 border-primary" }) })) : messages.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center h-full text-muted-foreground", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Send, { className: "h-12 w-12 mx-auto mb-4" }), (0, jsx_runtime_1.jsx)("p", { children: "No messages yet" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm", children: "Start the conversation!" })] }) })) : (messages.map(function (message) {
                                var isOwn = message.sender._id === (user === null || user === void 0 ? void 0 : user.id) || message.sender._id === (user === null || user === void 0 ? void 0 : user._id);
                                var isDeleted = message.isDeleted;
                                return ((0, jsx_runtime_1.jsx)("div", { className: "flex ".concat(isOwn ? 'justify-end' : 'justify-start'), children: (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 max-w-[70%] ".concat(isOwn ? 'flex-row-reverse' : 'flex-row'), children: [!isOwn && ((0, jsx_runtime_1.jsxs)(avatar_1.Avatar, { className: "h-10 w-10 mt-1 border border-gray-200 dark:border-gray-600 p-1 rounded-[10px]", children: [(0, jsx_runtime_1.jsx)(avatar_1.AvatarImage, { src: getAvatarUrl(message.sender.avatar), className: 'rounded-[10px]' }), (0, jsx_runtime_1.jsx)(avatar_1.AvatarFallback, { children: (message.sender.name || message.sender.username || 'U').charAt(0).toUpperCase() })] })), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1 ".concat(isOwn ? 'items-end' : 'items-start'), children: [(0, jsx_runtime_1.jsxs)("div", { className: "px-5 py-3 rounded-[10px] relative ".concat(isOwn
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'dark:bg-[rgba(255,255,255,.1)] bg-muted', " ").concat(isDeleted ? 'opacity-60' : ''), children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm ", children: message.content }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between pt-1", children: [message.replyTo && ((0, jsx_runtime_1.jsx)("div", { className: "text-xs opacity-70 mb-1 rounded", children: "(replied)" })), message.isEdited && ((0, jsx_runtime_1.jsx)("p", { className: "text-xs opacity-70", children: "(edited)" }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 text-xs text-muted-foreground ".concat(isOwn ? 'flex-row-reverse' : 'flex-row'), children: [(0, jsx_runtime_1.jsx)("span", { children: formatMessageTime(message.createdAt) }), isOwn && !isDeleted && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0", onClick: function () { return handleEditMessage(message); }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "h-3 w-3 icon icon" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0", onClick: function () { return handleDeleteMessage(message._id); }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-3 w-3 icon" }) })] })), !isOwn && !isDeleted && ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0", onClick: function () { return handleReplyToMessage(message); }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Reply, { className: "h-3 w-3 icon" }) }))] })] })] }) }, message._id));
                            })), showScrollButton && ((0, jsx_runtime_1.jsx)("div", { className: "absolute bottom-4 right-4 z-10", children: (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: scrollToBottomLocal, size: "sm", className: "rounded-[10px] shadow-lg bg-primary hover:bg-primary/90", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowDown, { className: "h-4 w-4 icon" }) }) })), typingUsers.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-1", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-2 h-2 bg-muted-foreground rounded-[10px] animate-bounce" }), (0, jsx_runtime_1.jsx)("div", { className: "w-2 h-2 bg-muted-foreground rounded-[10px] animate-bounce", style: { animationDelay: '0.1s' } }), (0, jsx_runtime_1.jsx)("div", { className: "w-2 h-2 bg-muted-foreground rounded-[10px] animate-bounce", style: { animationDelay: '0.2s' } })] }), (0, jsx_runtime_1.jsxs)("span", { children: [typingUsers.map(function (u) { return u.userName; }).join(', '), " ", typingUsers.length === 1 ? 'is' : 'are', " typing..."] })] })), (0, jsx_runtime_1.jsx)("div", { ref: messagesEndRef })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-shrink-0 border-t p-4 icon", children: [(0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSendMessage, className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", variant: "ghost", size: "sm", onClick: function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Paperclip, { className: "h-4 w-4 icon" }) }), (0, jsx_runtime_1.jsx)(input_1.Input, { ref: inputRef, value: messageText, onChange: handleTyping, onKeyPress: handleKeyPress, placeholder: editingMessage ? "Edit message..." : replyTo ? "Aa" : "Aa", className: "flex-1", disabled: loading }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", variant: "ghost", size: "sm", className: 'w-12', onClick: function () { return setShowEmojiPicker(!showEmojiPicker); }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Smile, { className: "h-4 w-4 icon icon" }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "submit", size: "sm", disabled: !messageText.trim() || loading, className: 'w-12', children: (0, jsx_runtime_1.jsx)(lucide_react_1.Send, { className: "h-4 w-4 icon icon" }) })] }), (0, jsx_runtime_1.jsx)("input", { ref: fileInputRef, type: "file", multiple: true, onChange: handleFileUpload, className: "hidden" })] })] })] }));
};
exports.default = ChatWindow;
