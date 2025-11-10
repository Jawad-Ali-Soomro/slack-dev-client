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
exports.CodeCollaborationProvider = exports.useCodeCollaboration = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var socket_io_client_1 = require("socket.io-client");
var sonner_1 = require("sonner");
var AuthContext_1 = require("./AuthContext");
var codeCollaborationService_1 = require("../services/codeCollaborationService");
var CodeCollaborationContext = (0, react_1.createContext)();
var useCodeCollaboration = function () {
    var context = (0, react_1.useContext)(CodeCollaborationContext);
    if (!context) {
        throw new Error('useCodeCollaboration must be used within a CodeCollaborationProvider');
    }
    return context;
};
exports.useCodeCollaboration = useCodeCollaboration;
var CodeCollaborationProvider = function (_a) {
    var children = _a.children;
    var _b = (0, AuthContext_1.useAuth)(), user = _b.user, token = _b.token;
    var _c = (0, react_1.useState)(null), socket = _c[0], setSocket = _c[1];
    var _d = (0, react_1.useState)(false), isConnected = _d[0], setIsConnected = _d[1];
    var _e = (0, react_1.useState)(null), error = _e[0], setError = _e[1];
    var _f = (0, react_1.useState)([]), sessions = _f[0], setSessions = _f[1];
    var _g = (0, react_1.useState)(null), currentSession = _g[0], setCurrentSession = _g[1];
    var _h = (0, react_1.useState)([]), participants = _h[0], setParticipants = _h[1];
    var _j = (0, react_1.useState)({}), typingUsers = _j[0], setTypingUsers = _j[1];
    var _k = (0, react_1.useState)({}), cursorPositions = _k[0], setCursorPositions = _k[1];
    var _l = (0, react_1.useState)(false), isTyping = _l[0], setIsTyping = _l[1];
    var typingTimeoutRef = (0, react_1.useRef)(null);
    // Initialize socket connection
    (0, react_1.useEffect)(function () {
        if (token && user) {
            var apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
            var newSocket_1 = (0, socket_io_client_1.io)(apiUrl, {
                auth: { token: token },
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
                console.log('✅ Connected to code collaboration server');
                setIsConnected(true);
                setError(null);
            });
            newSocket_1.on('disconnect', function (reason) {
                console.log('❌ Disconnected from code collaboration server:', reason);
                setIsConnected(false);
                // Auto-reconnect after 3 seconds
                setTimeout(function () {
                    if (!newSocket_1.connected) {
                        newSocket_1.connect();
                    }
                }, 3000);
            });
            newSocket_1.on('connect_error', function (error) {
                console.error('❌ Code collaboration connection error:', error);
                setIsConnected(false);
                setError('Connection failed: ' + error.message);
            });
            newSocket_1.on('connected', function (data) {
                console.log('✅ Code collaboration server connected:', data);
                setIsConnected(true);
                setError(null);
            });
            // Code collaboration events
            newSocket_1.on('code_updated', function (data) {
                if (currentSession && data.sessionId === currentSession._id) {
                    setCurrentSession(function (prev) { return (__assign(__assign({}, prev), { code: data.code })); });
                }
            });
            newSocket_1.on('cursor_updated', function (data) {
                if (currentSession && data.sessionId === currentSession._id) {
                    setCursorPositions(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[data.userId] = data.cursorPosition, _a)));
                    });
                }
            });
            newSocket_1.on('user_joined_session', function (data) {
                if (currentSession && data.sessionId === currentSession._id) {
                    setParticipants(function (prev) {
                        // Check if user already exists to prevent duplicates
                        var exists = prev.some(function (p) { return p._id === data.user._id; });
                        if (!exists) {
                            return __spreadArray(__spreadArray([], prev, true), [data.user], false);
                        }
                        return prev;
                    });
                    sonner_1.toast.success("".concat(data.user.username, " joined the session"), {
                        duration: 3000,
                        position: 'top-center'
                    });
                }
            });
            newSocket_1.on('user_left_session', function (data) {
                if (currentSession && data.sessionId === currentSession._id) {
                    setParticipants(function (prev) { return prev.filter(function (p) { return p._id !== data.userId; }); });
                    setCursorPositions(function (prev) {
                        var newPositions = __assign({}, prev);
                        delete newPositions[data.userId];
                        return newPositions;
                    });
                    sonner_1.toast.info('A participant left the session', {
                        duration: 3000,
                        position: 'top-center'
                    });
                }
            });
            newSocket_1.on('user_typing_session', function (data) {
                if (currentSession && data.sessionId === currentSession._id) {
                    setTypingUsers(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[data.userId] = data.isTyping, _a)));
                    });
                }
            });
            newSocket_1.on('session_ended', function (data) {
                if (currentSession && data.sessionId === currentSession._id) {
                    sonner_1.toast.warning('Session ended by owner', {
                        description: data.reason,
                        duration: 5000,
                        position: 'top-center'
                    });
                    setCurrentSession(null);
                    setParticipants([]);
                    setCursorPositions({});
                    setTypingUsers({});
                    // Reload sessions to update the list
                    loadUserSessions();
                }
            });
            setSocket(newSocket_1);
            return function () {
                newSocket_1.disconnect();
            };
        }
    }, [token, user]);
    // Load user sessions when user is available
    (0, react_1.useEffect)(function () {
        if (user && token) {
            loadUserSessions();
        }
    }, [user, token]);
    // Load sessions
    var loadUserSessions = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, codeCollaborationService_1.codeCollaborationService.getUserSessions()];
                case 1:
                    response = _a.sent();
                    setSessions(response.sessions || []);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error loading user sessions:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Load public sessions
    var loadPublicSessions = function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (language) {
            var response, error_2;
            if (language === void 0) { language = null; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, codeCollaborationService_1.codeCollaborationService.getPublicSessions(1, 20, language)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.sessions || []];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error loading public sessions:', error_2);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Create session
    var createSession = function (sessionData) { return __awaiter(void 0, void 0, void 0, function () {
        var response, newSession_1, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, codeCollaborationService_1.codeCollaborationService.createSession(sessionData)];
                case 1:
                    response = _a.sent();
                    newSession_1 = response.session;
                    setSessions(function (prev) { return __spreadArray([newSession_1], prev, true); });
                    return [2 /*return*/, newSession_1];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error creating session:', error_3);
                    throw error_3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Join session
    var joinSession = function (sessionId) { return __awaiter(void 0, void 0, void 0, function () {
        var response, session, uniqueParticipants, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('Joining session:', sessionId);
                    return [4 /*yield*/, codeCollaborationService_1.codeCollaborationService.joinSession(sessionId)];
                case 1:
                    response = _a.sent();
                    session = response.session;
                    console.log('Session participants from server:', session.participants);
                    setCurrentSession(session);
                    uniqueParticipants = session.participants
                        .map(function (p) { return p.user; })
                        .filter(function (participant, index, self) {
                        return index === self.findIndex(function (p) { return p._id === participant._id; });
                    });
                    console.log('Unique participants after filtering:', uniqueParticipants);
                    setParticipants(uniqueParticipants);
                    if (socket) {
                        socket.emit('join_session', { sessionId: sessionId });
                    }
                    return [2 /*return*/, session];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error joining session:', error_4);
                    throw error_4;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Leave session
    var leaveSession = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!currentSession)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, codeCollaborationService_1.codeCollaborationService.leaveSession(currentSession._id)];
                case 2:
                    _a.sent();
                    if (socket) {
                        socket.emit('leave_session', { sessionId: currentSession._id });
                    }
                    setCurrentSession(null);
                    setParticipants([]);
                    setCursorPositions({});
                    setTypingUsers({});
                    sonner_1.toast.success('Left session successfully', {
                        duration: 3000,
                        position: 'top-center'
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error('Error leaving session:', error_5);
                    sonner_1.toast.error('Failed to leave session', {
                        duration: 3000,
                        position: 'top-center'
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Update code
    var updateCode = function (code_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([code_1], args_1, true), void 0, function (code, cursorPosition) {
            var error_6;
            if (cursorPosition === void 0) { cursorPosition = null; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!currentSession)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Update local state immediately for better UX
                        setCurrentSession(function (prev) { return (__assign(__assign({}, prev), { code: code })); });
                        // Update cursor position
                        if (cursorPosition) {
                            setCursorPositions(function (prev) {
                                var _a;
                                return (__assign(__assign({}, prev), (_a = {}, _a[(user === null || user === void 0 ? void 0 : user.id) || (user === null || user === void 0 ? void 0 : user._id)] = cursorPosition, _a)));
                            });
                        }
                        // Emit to other participants
                        if (socket) {
                            socket.emit('code_change', {
                                sessionId: currentSession._id,
                                code: code,
                                cursorPosition: cursorPosition
                            });
                        }
                        // Update on server
                        return [4 /*yield*/, codeCollaborationService_1.codeCollaborationService.updateCode(currentSession._id, code, cursorPosition)];
                    case 2:
                        // Update on server
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        console.error('Error updating code:', error_6);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Update cursor position
    var updateCursor = function (cursorPosition) { return __awaiter(void 0, void 0, void 0, function () {
        var error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!currentSession)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    setCursorPositions(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[(user === null || user === void 0 ? void 0 : user.id) || (user === null || user === void 0 ? void 0 : user._id)] = cursorPosition, _a)));
                    });
                    if (socket) {
                        socket.emit('cursor_move', {
                            sessionId: currentSession._id,
                            cursorPosition: cursorPosition
                        });
                    }
                    return [4 /*yield*/, codeCollaborationService_1.codeCollaborationService.updateCursor(currentSession._id, cursorPosition)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_7 = _a.sent();
                    console.error('Error updating cursor:', error_7);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Handle typing
    var handleTyping = function (isTyping) {
        if (!currentSession || !socket)
            return;
        setIsTyping(isTyping);
        socket.emit('user_typing_session', {
            sessionId: currentSession._id,
            isTyping: isTyping
        });
        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        // Set timeout to stop typing
        if (isTyping) {
            typingTimeoutRef.current = setTimeout(function () {
                setIsTyping(false);
                socket.emit('user_typing_session', {
                    sessionId: currentSession._id,
                    isTyping: false
                });
            }, 2000);
        }
    };
    // End session (owner only)
    var endSession = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!currentSession)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, codeCollaborationService_1.codeCollaborationService.endSession(currentSession._id)];
                case 2:
                    _a.sent();
                    if (socket) {
                        socket.emit('session_ended', {
                            sessionId: currentSession._id,
                            reason: 'Session ended by owner'
                        });
                    }
                    setCurrentSession(null);
                    setParticipants([]);
                    setCursorPositions({});
                    setTypingUsers({});
                    // Reload sessions
                    return [4 /*yield*/, loadUserSessions()];
                case 3:
                    // Reload sessions
                    _a.sent();
                    sonner_1.toast.success('Session ended successfully', {
                        duration: 3000,
                        position: 'top-center'
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_8 = _a.sent();
                    console.error('Error ending session:', error_8);
                    sonner_1.toast.error('Failed to end session', {
                        duration: 3000,
                        position: 'top-center'
                    });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Delete session permanently (owner only)
    var deleteSession = function (sessionId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, codeCollaborationService_1.codeCollaborationService.deleteSession(sessionId)];
                case 1:
                    _a.sent();
                    // Reload sessions to update the list
                    return [4 /*yield*/, loadUserSessions()];
                case 2:
                    // Reload sessions to update the list
                    _a.sent();
                    sonner_1.toast.success('Session deleted successfully', {
                        duration: 3000,
                        position: 'top-center'
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_9 = _a.sent();
                    console.error('Error deleting session:', error_9);
                    sonner_1.toast.error('Failed to delete session', {
                        duration: 3000,
                        position: 'top-center'
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Generate invite code
    var generateInviteCode = function (sessionId) { return __awaiter(void 0, void 0, void 0, function () {
        var result, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, codeCollaborationService_1.codeCollaborationService.generateInviteCode(sessionId)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.data];
                case 2:
                    error_10 = _a.sent();
                    console.error('Error generating invite code:', error_10);
                    sonner_1.toast.error('Failed to generate invite code', {
                        duration: 3000,
                        position: 'top-center'
                    });
                    throw error_10;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Join session by invite code
    var joinByInviteCode = function (inviteCode) { return __awaiter(void 0, void 0, void 0, function () {
        var result, error_11;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 3, , 4]);
                    console.log('Attempting to join with invite code:', inviteCode);
                    return [4 /*yield*/, codeCollaborationService_1.codeCollaborationService.joinByInviteCode(inviteCode)];
                case 1:
                    result = _d.sent();
                    console.log('Join result:', result);
                    // Reload sessions to update the list
                    return [4 /*yield*/, loadUserSessions()];
                case 2:
                    // Reload sessions to update the list
                    _d.sent();
                    sonner_1.toast.success('Joined session successfully', {
                        duration: 3000,
                        position: 'top-center'
                    });
                    return [2 /*return*/, result.data];
                case 3:
                    error_11 = _d.sent();
                    console.error('Error joining by invite code:', error_11);
                    console.error('Error response:', (_a = error_11.response) === null || _a === void 0 ? void 0 : _a.data);
                    sonner_1.toast.error(((_c = (_b = error_11.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || 'Failed to join session', {
                        duration: 3000,
                        position: 'top-center'
                    });
                    throw error_11;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Get session by invite code (for preview)
    var getSessionByInviteCode = function (inviteCode) { return __awaiter(void 0, void 0, void 0, function () {
        var result, error_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, codeCollaborationService_1.codeCollaborationService.getSessionByInviteCode(inviteCode)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.data];
                case 2:
                    error_12 = _a.sent();
                    console.error('Error getting session by invite code:', error_12);
                    throw error_12;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Invite user to session
    var inviteUser = function (sessionId, invitedUserId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_13;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, codeCollaborationService_1.codeCollaborationService.inviteUser(sessionId, invitedUserId)];
                case 1:
                    _a.sent();
                    sonner_1.toast.success('User invited successfully', {
                        duration: 3000,
                        position: 'top-center'
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_13 = _a.sent();
                    console.error('Error inviting user:', error_13);
                    sonner_1.toast.error('Failed to invite user', {
                        duration: 3000,
                        position: 'top-center'
                    });
                    throw error_13;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var value = {
        socket: socket,
        isConnected: isConnected,
        error: error,
        sessions: sessions,
        currentSession: currentSession,
        code: (currentSession === null || currentSession === void 0 ? void 0 : currentSession.code) || '',
        participants: participants,
        typingUsers: typingUsers,
        cursorPositions: cursorPositions,
        isTyping: isTyping,
        loadUserSessions: loadUserSessions,
        loadPublicSessions: loadPublicSessions,
        createSession: createSession,
        joinSession: joinSession,
        leaveSession: leaveSession,
        updateCode: updateCode,
        updateCursor: updateCursor,
        handleTyping: handleTyping,
        endSession: endSession,
        deleteSession: deleteSession,
        generateInviteCode: generateInviteCode,
        joinByInviteCode: joinByInviteCode,
        getSessionByInviteCode: getSessionByInviteCode,
        inviteUser: inviteUser
    };
    return ((0, jsx_runtime_1.jsx)(CodeCollaborationContext.Provider, { value: value, children: children }));
};
exports.CodeCollaborationProvider = CodeCollaborationProvider;
