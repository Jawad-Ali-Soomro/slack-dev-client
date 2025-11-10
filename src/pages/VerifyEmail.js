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
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var react_router_dom_1 = require("react-router-dom");
var sonner_1 = require("sonner");
var authService_1 = require("../services/authService");
var VerifyEmail = function () {
    var _a = (0, react_1.useState)(['', '', '', '']), otp = _a[0], setOtp = _a[1];
    var _b = (0, react_1.useState)(''), email = _b[0], setEmail = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(false), resendLoading = _d[0], setResendLoading = _d[1];
    var searchParams = (0, react_router_dom_1.useSearchParams)()[0];
    var navigate = (0, react_router_dom_1.useNavigate)();
    (0, react_1.useEffect)(function () {
        // Get email from localStorage or URL params
        var storedEmail = localStorage.getItem('verificationEmail');
        var urlEmail = searchParams.get('email');
        var token = searchParams.get('token');
        if (storedEmail) {
            setEmail(storedEmail);
        }
        else if (urlEmail) {
            setEmail(urlEmail);
            localStorage.setItem('verificationEmail', urlEmail);
        }
        else if (token) {
            // If token is in URL, we can verify directly
            handleVerifyWithToken(token);
        }
        else {
            // No email found, redirect to login
            sonner_1.toast.error('No verification email found');
            navigate('/login');
        }
    }, [searchParams, navigate]);
    var handleVerifyWithToken = function (token) { return __awaiter(void 0, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, authService_1.authService.verifyEmail(email, token)];
                case 1:
                    result = _a.sent();
                    if (result.success) {
                        sonner_1.toast.success('Email verified successfully!');
                        localStorage.removeItem('verificationEmail');
                        navigate('/dashboard');
                    }
                    else {
                        sonner_1.toast.error(result.message || 'Verification failed');
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Token verification error:', error_1);
                    sonner_1.toast.error('Verification failed');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleOtpChange = function (index, value) {
        if (value.length > 1)
            return; // Prevent multiple characters
        var newOtp = __spreadArray([], otp, true);
        newOtp[index] = value;
        setOtp(newOtp);
        // Auto-focus next input
        if (value && index < 3) {
            var nextInput = document.getElementById("otp-".concat(index + 1));
            if (nextInput)
                nextInput.focus();
        }
    };
    var handleKeyDown = function (index, e) {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            var prevInput = document.getElementById("otp-".concat(index - 1));
            if (prevInput)
                prevInput.focus();
        }
    };
    var handleVerify = function () { return __awaiter(void 0, void 0, void 0, function () {
        var otpCode, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!email) {
                        sonner_1.toast.error('No email found for verification');
                        return [2 /*return*/];
                    }
                    otpCode = otp.join('');
                    if (otpCode.length !== 4) {
                        sonner_1.toast.error('Please enter the complete 4-digit code');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setLoading(true);
                    console.log('Verifying email:', email, 'with OTP:', otpCode);
                    return [4 /*yield*/, authService_1.authService.verifyEmail(email, otpCode)];
                case 2:
                    result = _a.sent();
                    console.log('Verification result:', result);
                    if (result.success) {
                        sonner_1.toast.success('Email verified successfully!');
                        localStorage.removeItem('verificationEmail');
                        navigate('/dashboard');
                    }
                    else {
                        sonner_1.toast.error(result.message || 'Invalid verification code');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error('Verification error:', error_2);
                    sonner_1.toast.error(error_2.message || 'Verification failed');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleResendOtp = function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!email) {
                        sonner_1.toast.error('No email found for resending OTP');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setResendLoading(true);
                    return [4 /*yield*/, authService_1.authService.resendOtp(email)];
                case 2:
                    result = _a.sent();
                    if (result.success) {
                        sonner_1.toast.success('Verification code sent to your email');
                    }
                    else {
                        sonner_1.toast.error(result.message || 'Failed to resend code');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
                    console.error('Resend error:', error_3);
                    sonner_1.toast.error('Failed to resend verification code');
                    return [3 /*break*/, 5];
                case 4:
                    setResendLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.1
            }
        }
    };
    var itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-white dark:bg-black dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "absolute inset-0 overflow-hidden", children: [(0, jsx_runtime_1.jsx)("div", { className: "floating-orb w-96 h-96 top-10 left-10 opacity-20" }), (0, jsx_runtime_1.jsx)("div", { className: "floating-orb w-64 h-64 top-1/3 right-20 opacity-15", style: { animationDelay: '2s' } }), (0, jsx_runtime_1.jsx)("div", { className: "floating-orb w-80 h-80 bottom-20 left-1/4 opacity-20", style: { animationDelay: '4s' } })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { className: "w-full max-w-md relative z-10", variants: containerVariants, initial: "hidden", animate: "visible", children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { variants: itemVariants, className: "p-5 md:p-8 md:shadow-2xl md:border-gray-300 md:rounded-[10px] md:dark:border-gray-700 md:border", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { variants: itemVariants, className: "mb-6", children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.Link, { to: "/login", className: "flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "w-4 h-4 icon" }), "Back to Login"] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center mb-8", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { variants: itemVariants, className: "mb-4", children: (0, jsx_runtime_1.jsx)("div", { className: "w-16 h-16 bg-gray-100 dark:bg-white rounded-[10px] flex items-center justify-center mx-auto", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Mail, { className: "w-8 h-8 text-black" }) }) }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.h1, { variants: itemVariants, className: "text-3xl  text-gray-900 dark:text-white mb-2", style: { fontWeight: 800 }, children: "Verify Your Email" }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.p, { variants: itemVariants, className: "text-gray-600 dark:text-gray-300", style: { fontWeight: 600 }, children: "We've sent a 4-digit code to" }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.p, { variants: itemVariants, className: "text-orange-500 dark:text-orange-400 ", style: { fontWeight: 800 }, children: email })] }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { variants: itemVariants, className: "space-y-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-center gap-3", children: otp.map(function (digit, index) { return ((0, jsx_runtime_1.jsx)("input", { id: "otp-".concat(index), type: "text", maxLength: "1", value: digit, onChange: function (e) { return handleOtpChange(index, e.target.value); }, onKeyDown: function (e) { return handleKeyDown(index, e); }, className: "w-12 h-12 text-center text-xl   border-gray-200 dark:border-gray-700 rounded-[10px] focus:outline-none focus:border-blue-500 dark:bg-black dark:text-white" }, index)); }) }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.button, { onClick: handleVerify, disabled: loading || otp.join('').length !== 4, className: "w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-[10px]  transition-colors disabled:opacity-50 disabled:cursor-not-allowed", whileHover: { scale: loading ? 1 : 1.02 }, whileTap: { scale: loading ? 1 : 0.98 }, children: loading ? "Verifying..." : "Verify Email" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-300 text-sm mb-2", children: "Didn't receive the code?" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleResendOtp, disabled: resendLoading, className: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300  text-sm disabled:opacity-50", children: resendLoading ? ((0, jsx_runtime_1.jsxs)("span", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: "w-4 h-4 icon animate-spin" }), "Sending..."] })) : ("Resend Code") })] })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { variants: itemVariants, className: "mt-8 text-center", children: (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 dark:text-gray-400 text-sm", children: "Check your spam folder if you don't see the email" }) })] }) })] }));
};
exports.default = VerifyEmail;
