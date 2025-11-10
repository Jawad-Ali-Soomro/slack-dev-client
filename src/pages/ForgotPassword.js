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
var ForgotPassword = function () {
    var _a = (0, react_1.useState)(1), step = _a[0], setStep = _a[1]; // 1: Email, 2: OTP, 3: New Password, 4: Success
    var _b = (0, react_1.useState)(""), email = _b[0], setEmail = _b[1];
    var _c = (0, react_1.useState)(["", "", "", ""]), otp = _c[0], setOtp = _c[1];
    var _d = (0, react_1.useState)(""), newPassword = _d[0], setNewPassword = _d[1];
    var _e = (0, react_1.useState)(""), confirmPassword = _e[0], setConfirmPassword = _e[1];
    var _f = (0, react_1.useState)(false), showPassword = _f[0], setShowPassword = _f[1];
    var _g = (0, react_1.useState)(false), showConfirmPassword = _g[0], setShowConfirmPassword = _g[1];
    var _h = (0, react_1.useState)(false), isLoading = _h[0], setIsLoading = _h[1];
    var _j = (0, react_1.useState)(""), error = _j[0], setError = _j[1];
    // Refs for OTP inputs
    var otpRefs = [(0, react_1.useRef)(), (0, react_1.useRef)(), (0, react_1.useRef)(), (0, react_1.useRef)()];
    var handleEmailSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setError("");
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    console.log('Sending forgot password request for:', email);
                    return [4 /*yield*/, authService_1.authService.forgotPassword(email)];
                case 2:
                    result = _a.sent();
                    console.log('Forgot password result:', result);
                    if (result.message === 'password reset code sent to email') {
                        sonner_1.toast.success('Reset code sent!', {
                            description: 'Please check your email for the reset code',
                        });
                        setStep(2);
                    }
                    else {
                        setError(result.message || 'Failed to send reset code');
                        sonner_1.toast.error('Failed to send reset code', {
                            description: result.message || 'Please try again',
                        });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Forgot password error:', error_1);
                    setError(error_1.message || 'Failed to send reset code');
                    sonner_1.toast.error('Failed to send reset code', {
                        description: error_1.message || 'Please try again',
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleOtpChange = function (index, value) {
        // Only allow single digit
        if (value.length > 1)
            return;
        var newOtp = __spreadArray([], otp, true);
        newOtp[index] = value;
        setOtp(newOtp);
        // Auto-focus next input
        if (value && index < 3) {
            otpRefs[index + 1].current.focus();
        }
    };
    var handleOtpKeyDown = function (index, e) {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs[index - 1].current.focus();
        }
    };
    var handleOtpSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var otpCode;
        return __generator(this, function (_a) {
            e.preventDefault();
            otpCode = otp.join("");
            if (otpCode.length !== 4) {
                sonner_1.toast.error('Please enter the complete 4-digit code');
                return [2 /*return*/];
            }
            setError("");
            setIsLoading(true);
            try {
                console.log('Verifying OTP:', otpCode, 'for email:', email);
                // For now, just verify the OTP format and move to next step
                // In a real implementation, you might want to verify the OTP with the backend first
                sonner_1.toast.success('OTP verified!', {
                    description: 'Now enter your new password',
                });
                setStep(3);
            }
            catch (error) {
                console.error('OTP verification error:', error);
                setError(error.message || 'Verification failed');
                sonner_1.toast.error('Verification failed', {
                    description: error.message || 'Please check your code and try again',
                });
            }
            finally {
                setIsLoading(false);
            }
            return [2 /*return*/];
        });
    }); };
    var handleResendOtp = function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    setError("");
                    return [4 /*yield*/, authService_1.authService.forgotPassword(email)];
                case 1:
                    result = _a.sent();
                    if (result.message === 'password reset code sent to email') {
                        sonner_1.toast.success('Reset code resent!', {
                            description: 'Please check your email for the new code',
                        });
                        setOtp(["", "", "", ""]);
                        otpRefs[0].current.focus();
                    }
                    else {
                        sonner_1.toast.error('Failed to resend code', {
                            description: result.message || 'Please try again',
                        });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Resend OTP error:', error_2);
                    sonner_1.toast.error('Failed to resend code', {
                        description: error_2.message || 'Please try again',
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handlePasswordSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setError("");
                    if (newPassword !== confirmPassword) {
                        setError("Passwords don't match");
                        sonner_1.toast.error('Passwords don\'t match', {
                            description: 'Please make sure both passwords are the same',
                        });
                        return [2 /*return*/];
                    }
                    if (newPassword.length < 6) {
                        setError("Password must be at least 6 characters");
                        sonner_1.toast.error('Password too short', {
                            description: 'Password must be at least 6 characters',
                        });
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    console.log('Resetting password for:', email, 'with OTP:', otp.join(''));
                    return [4 /*yield*/, authService_1.authService.resetPassword(email, otp.join(''), newPassword)];
                case 2:
                    result = _a.sent();
                    console.log('Reset password result:', result);
                    if (result.message === 'password reset successfully') {
                        sonner_1.toast.success('Password reset successful!', {
                            description: 'You can now login with your new password',
                        });
                        setStep(4);
                    }
                    else {
                        setError(result.message || 'Password reset failed');
                        sonner_1.toast.error('Password reset failed', {
                            description: result.message || 'Please try again',
                        });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
                    console.error('Password reset error:', error_3);
                    setError(error_3.message || 'Password reset failed');
                    sonner_1.toast.error('Password reset failed', {
                        description: error_3.message || 'Please try again',
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "absolute inset-0 overflow-hidden", children: [(0, jsx_runtime_1.jsx)("div", { className: "floating-orb w-96 h-96 top-10 left-10 opacity-20" }), (0, jsx_runtime_1.jsx)("div", { className: "floating-orb w-64 h-64 top-1/3 right-20 opacity-15", style: { animationDelay: '2s' } }), (0, jsx_runtime_1.jsx)("div", { className: "floating-orb w-80 h-80 bottom-20 left-1/4 opacity-20", style: { animationDelay: '4s' } })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { className: "w-full max-w-md relative z-10", variants: containerVariants, initial: "hidden", animate: "visible", children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { variants: itemVariants, className: "p-5 md:p-8 md:shadow-2xl md:border-gray-300 md:rounded-[10px] md:dark:border-gray-700 md:border", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { variants: itemVariants, className: "mb-6", children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/login", className: "flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-sm", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "w-4 h-4 icon" }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center mb-8", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { variants: itemVariants, className: "mb-4", children: (0, jsx_runtime_1.jsx)("img", { src: "/logo.png", alt: "logo", className: "w-16 h-16 mx-auto" }) }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.h1, { variants: itemVariants, className: "text-3xl  text-gray-900 dark:text-white mb-2", style: { fontWeight: 800 }, children: [step === 1 && "Forgot Password", step === 2 && "Enter OTP", step === 3 && "New Password", step === 4 && "Success!"] }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.p, { variants: itemVariants, className: "text-gray-600 dark:text-gray-300", style: { fontWeight: 800 }, children: [step === 1 && "Enter your email to receive reset instructions", step === 2 && "We sent a 4-digit code to ".concat(email), step === 3 && "Enter your new password", step === 4 && "Password reset successfully!"] })] }), step === 1 && ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.form, { variants: itemVariants, onSubmit: handleEmailSubmit, className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm  text-gray-700 dark:text-gray-300 mb-2", children: "Email Address" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 icon" }), (0, jsx_runtime_1.jsx)("input", { type: "email", value: email, onChange: function (e) { return setEmail(e.target.value); }, className: "w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-[10px] focus:outline focus:outline-1 focus:outline-gray-300 focus:border-gray-100 dark:focus:outline-[rgba(255,255,255,.2)] dark:focus:border-[rgba(255,255,255,.1)] dark:bg-black dark:text-white", placeholder: "Enter your email", required: true })] })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.button, { type: "submit", disabled: isLoading, className: "w-full py-3 bg-black text-white rounded-[10px]  hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-200", whileHover: { scale: isLoading ? 1 : 1.02 }, whileTap: { scale: isLoading ? 1 : 0.98 }, children: isLoading ? "Sending..." : "Send Reset Code" })] })), step === 2 && ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.form, { variants: itemVariants, onSubmit: handleOtpSubmit, className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm  text-gray-700 dark:text-gray-300 mb-4 text-center", children: "Enter 4-Digit Code" }), (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center space-x-4", children: otp.map(function (digit, index) { return ((0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("input", { ref: otpRefs[index], type: "text", inputMode: "numeric", pattern: "[0-9]", maxLength: "1", value: digit, onChange: function (e) { return handleOtpChange(index, e.target.value.replace(/\D/g, '')); }, onKeyDown: function (e) { return handleOtpKeyDown(index, e); }, className: "w-14 h-14 text-center text-2xl   border-gray-200 dark:border-gray-700 rounded-[10px] focus:outline focus:outline-1 focus:outline-black  dark:focus:outline-white  dark:bg-black dark:text-white", autoComplete: "off" }), index < 3 && ((0, jsx_runtime_1.jsx)("div", { className: "absolute -right-2 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-gray-400 rounded-[10px]" }))] }, index)); }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-center", children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: handleResendOtp, className: "text-sm text-black hover:text-gray-800  dark:text-white dark:hover:text-gray-200", children: "Didn't receive code? Resend" }) }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.button, { type: "submit", disabled: isLoading || otp.join("").length !== 4, className: "w-full py-3 bg-black text-white rounded-[10px]  hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-200", whileHover: { scale: isLoading ? 1 : 1.02 }, whileTap: { scale: isLoading ? 1 : 0.98 }, children: isLoading ? "Verifying..." : "Verify Code" })] })), step === 3 && ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.form, { variants: itemVariants, onSubmit: handlePasswordSubmit, className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm  text-gray-700 dark:text-gray-300 mb-2", children: "New Password" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 icon" }), (0, jsx_runtime_1.jsx)("input", { type: showPassword ? "text" : "password", value: newPassword, onChange: function (e) { return setNewPassword(e.target.value); }, className: "w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-[10px] focus:outline focus:outline-1 focus:outline-gray-300 focus:border-gray-100 dark:focus:outline-[rgba(255,255,255,.2)] dark:focus:border-[rgba(255,255,255,.1)] dark:bg-black dark:text-white", placeholder: "Enter new password", required: true }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: function () { return setShowPassword(!showPassword); }, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600", children: showPassword ? (0, jsx_runtime_1.jsx)(lucide_react_1.EyeOff, { className: "w-5 h-5 icon" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "w-5 h-5 icon" }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm  text-gray-700 dark:text-gray-300 mb-2", children: "Confirm Password" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 icon" }), (0, jsx_runtime_1.jsx)("input", { type: showConfirmPassword ? "text" : "password", value: confirmPassword, onChange: function (e) { return setConfirmPassword(e.target.value); }, className: "w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-[10px] focus:outline focus:outline-1 focus:outline-gray-300 focus:border-gray-100 dark:focus:outline-[rgba(255,255,255,.2)] dark:focus:border-[rgba(255,255,255,.1)] dark:bg-black dark:text-white", placeholder: "Confirm new password", required: true }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: function () { return setShowConfirmPassword(!showConfirmPassword); }, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600", children: showConfirmPassword ? (0, jsx_runtime_1.jsx)(lucide_react_1.EyeOff, { className: "w-5 h-5 icon" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "w-5 h-5 icon" }) })] })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.button, { type: "submit", disabled: isLoading || !newPassword || !confirmPassword, className: "w-full py-3 bg-black text-white rounded-[10px]  hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-200", whileHover: { scale: isLoading ? 1 : 1.02 }, whileTap: { scale: isLoading ? 1 : 0.98 }, children: isLoading ? "Resetting..." : "Reset Password" })] })), step === 4 && ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { variants: itemVariants, className: "text-center space-y-6", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, transition: { delay: 0.2, type: "spring", stiffness: 200 }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-20 h-20 text-green-500 mx-auto mb-4" }) }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-300 mb-6", children: "Your password has been reset successfully. You can now login with your new password." }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/login", className: "inline-block w-full py-3 bg-black text-white rounded-[10px]  hover:bg-black transition-colors text-center dark:bg-white dark:text-black dark:hover:bg-gray-200", children: "Back to Login" })] }))] }) })] }));
};
exports.default = ForgotPassword;
