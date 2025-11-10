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
exports.AuthProvider = exports.useAuth = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var authService_1 = require("../services/authService");
var AuthContext = (0, react_1.createContext)();
var useAuth = function () {
    var context = (0, react_1.useContext)(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
exports.useAuth = useAuth;
var AuthProvider = function (_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(null), user = _b[0], setUser = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(false), isAuthenticated = _d[0], setIsAuthenticated = _d[1];
    var _e = (0, react_1.useState)(null), token = _e[0], setToken = _e[1];
    (0, react_1.useEffect)(function () {
        checkAuthStatus();
    }, []);
    var checkAuthStatus = function () { return __awaiter(void 0, void 0, void 0, function () {
        var storedToken, userProfile, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, 5, 6]);
                    setLoading(true);
                    storedToken = localStorage.getItem('authToken');
                    if (!storedToken) return [3 /*break*/, 2];
                    setToken(storedToken);
                    setIsAuthenticated(true);
                    return [4 /*yield*/, authService_1.authService.getCurrentUser()];
                case 1:
                    userProfile = _a.sent();
                    setUser(userProfile.user);
                    console.log('User authenticated from localStorage');
                    return [3 /*break*/, 3];
                case 2:
                    console.log('No valid auth data found');
                    setToken(null);
                    setIsAuthenticated(false);
                    setUser(null);
                    _a.label = 3;
                case 3: return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error('Auth check failed:', error_1);
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userData');
                    setToken(null);
                    setIsAuthenticated(false);
                    setUser(null);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var login = function (credentials) { return __awaiter(void 0, void 0, void 0, function () {
        var result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    console.log('Login attempt with credentials:', credentials);
                    return [4 /*yield*/, authService_1.authService.login(credentials)];
                case 1:
                    result = _a.sent();
                    console.log('Login result:', result);
                    if (result.success) {
                        // Store in localStorage only if we have a token (successful login)
                        if (result.token) {
                            localStorage.setItem('authToken', result.token);
                            setToken(result.token);
                            setUser(result.user);
                            setIsAuthenticated(true);
                        }
                        // Return the full result including emailSent flag
                        return [2 /*return*/, {
                                success: true,
                                user: result.user,
                                emailSent: result.emailSent,
                                message: result.message
                            }];
                    }
                    else {
                        return [2 /*return*/, { success: false, error: result.message || 'Login failed' }];
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_2 = _a.sent();
                    console.error('Login failed:', error_2);
                    return [2 /*return*/, { success: false, error: error_2.message || 'Login failed' }];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var logout = function () {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };
    var forgotPassword = function (email) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    // Simulate API call
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 1:
                    // Simulate API call
                    _a.sent();
                    return [2 /*return*/, { success: true, message: 'Reset code sent to email' }];
                case 2:
                    error_3 = _a.sent();
                    console.error('Forgot password failed:', error_3);
                    return [2 /*return*/, { success: false, error: 'Failed to send reset code' }];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var verifyOTP = function (otp) { return __awaiter(void 0, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    // Simulate API call
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })
                        // Mock OTP verification (accept any 4-digit code)
                    ];
                case 1:
                    // Simulate API call
                    _a.sent();
                    // Mock OTP verification (accept any 4-digit code)
                    if (otp.length === 4) {
                        return [2 /*return*/, { success: true, message: 'OTP verified successfully' }];
                    }
                    else {
                        return [2 /*return*/, { success: false, error: 'Invalid OTP' }];
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_4 = _a.sent();
                    console.error('OTP verification failed:', error_4);
                    return [2 /*return*/, { success: false, error: 'OTP verification failed' }];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var value = (0, react_1.useMemo)(function () { return ({
        user: user,
        token: token,
        isAuthenticated: isAuthenticated,
        loading: loading,
        login: login,
        logout: logout,
        forgotPassword: forgotPassword,
        verifyOTP: verifyOTP
    }); }, [user, token, isAuthenticated, loading]);
    // Debug: Log when user object changes
    (0, react_1.useEffect)(function () {
        console.log('AuthContext user changed:', { user: user === null || user === void 0 ? void 0 : user.id, isAuthenticated: isAuthenticated });
    }, [user, isAuthenticated]);
    return ((0, jsx_runtime_1.jsx)(AuthContext.Provider, { value: value, children: children }));
};
exports.AuthProvider = AuthProvider;
