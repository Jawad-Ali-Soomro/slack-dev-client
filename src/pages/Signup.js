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
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var react_router_dom_1 = require("react-router-dom");
var sonner_1 = require("sonner");
var authService_1 = require("../services/authService");
var input_1 = require("../components/ui/input");
var pi_1 = require("react-icons/pi");
var Signup = function () {
    var _a = (0, react_1.useState)(false), showPassword = _a[0], setShowPassword = _a[1];
    var _b = (0, react_1.useState)({
        username: "",
        email: "",
        password: "",
        role: "user"
    }), formData = _b[0], setFormData = _b[1];
    var _c = (0, react_1.useState)(""), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(false), loading = _d[0], setLoading = _d[1];
    var navigate = (0, react_router_dom_1.useNavigate)();
    var handleInputChange = function (e) {
        var _a;
        setFormData(__assign(__assign({}, formData), (_a = {}, _a[e.target.name] = e.target.value, _a)));
        setError("");
    };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setError("");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, authService_1.authService.register(formData)];
                case 2:
                    result = _a.sent();
                    console.log('Registration result:', result);
                    if (result.message === 'user registered successfully') {
                        localStorage.setItem('verificationEmail', formData.email);
                        sonner_1.toast.info('Account created successfully!', {
                            description: 'Please check your email for verification code',
                        });
                        navigate('/verify-email');
                    }
                    else {
                        setError(result.message || 'Registration failed');
                        sonner_1.toast.error('Registration failed', {
                            description: result.message || 'Please try again',
                        });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    setError(error_1.message || 'Registration failed');
                    sonner_1.toast.error('Registration failed', {
                        description: error_1.message || 'Please try again',
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "absolute inset-0 overflow-hidden", children: [(0, jsx_runtime_1.jsx)("div", { className: "floating-orb w-96 h-96 top-10 left-10 opacity-20" }), (0, jsx_runtime_1.jsx)("div", { className: "floating-orb w-64 h-64 top-1/3 right-20 opacity-15", style: { animationDelay: '2s' } }), (0, jsx_runtime_1.jsx)("div", { className: "floating-orb w-80 h-80 bottom-20 left-1/4 opacity-20", style: { animationDelay: '4s' } })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { className: "w-full max-w-md relative z-10", variants: containerVariants, initial: "hidden", animate: "visible", children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { variants: itemVariants, className: "p-5 md:p-8 md:shadow-2xl md:rounded-[10px] md:dark:border-gray-700", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center mb-8", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { variants: itemVariants, className: "mb-4", children: (0, jsx_runtime_1.jsx)("img", { src: "/logo.png", alt: "logo", className: "w-16 h-16 mx-auto" }) }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.h1, { variants: itemVariants, className: "text-3xl  text-gray-900 dark:text-white mb-2", style: { fontWeight: 800 }, children: "Get On Board!" }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.p, { variants: itemVariants, className: "text-gray-600 dark:text-gray-300", style: { fontWeight: 800 }, children: "Join thousands of devs!" })] }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.form, { variants: itemVariants, onSubmit: handleSubmit, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm  text-gray-700 dark:text-gray-300 mb-2", children: "Your Full Name" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(pi_1.PiUserDuotone, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 icon icon" }), (0, jsx_runtime_1.jsx)("input", { type: "text", name: "username", value: formData.username, onChange: handleInputChange, className: "w-full pl-10 pr-12 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-[10px] focus:outline focus:outline-1 focus:outline-gray-300 focus:border-gray-100 dark:focus:outline-[rgba(255,255,255,.2)] dark:focus:border-[rgba(255,255,255,.1)] dark:bg-black dark:text-white", placeholder: "Enter your username", required: true })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm  text-gray-700 dark:text-gray-300 mb-2", children: "Email Address" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Mail, { className: "absolute icon left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 icon" }), (0, jsx_runtime_1.jsx)("input", { type: "email", name: "email", value: formData.email, onChange: handleInputChange, className: "w-full pl-10 pr-12 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-[10px] focus:outline focus:outline-1 focus:outline-gray-300 focus:border-gray-100 dark:focus:outline-[rgba(255,255,255,.2)] dark:focus:border-[rgba(255,255,255,.1)] dark:bg-black dark:text-white", placeholder: "Enter your email", required: true })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm  text-gray-700 dark:text-gray-300 mb-2", children: "Password" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { className: "absolute left-3 top-1/2 icon transform -translate-y-1/2 text-gray-400 w-5 h-5 icon" }), (0, jsx_runtime_1.jsx)("input", { type: showPassword ? "text" : "password", name: "password", value: formData.password, onChange: handleInputChange, className: "w-full pl-10 pr-12 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-[10px] focus:outline focus:outline-1 focus:outline-gray-300 focus:border-gray-100 dark:focus:outline-[rgba(255,255,255,.2)] dark:focus:border-[rgba(255,255,255,.1)] dark:bg-black dark:text-white", placeholder: "Create a password", required: true }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: function () { return setShowPassword(!showPassword); }, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600", children: showPassword ? (0, jsx_runtime_1.jsx)(lucide_react_1.EyeOff, { className: "w-5 h-5 icon" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "w-5 h-5 icon" }) })] })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.button, { type: "submit", disabled: loading, className: "w-full py-3 bg-black text-white rounded-[10px] font-bold  hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-200", whileHover: { scale: loading ? 1 : 1.02 }, whileTap: { scale: loading ? 1 : 0.98 }, children: loading ? (0, jsx_runtime_1.jsx)("div", { className: "loader" }) : "Register" })] }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { variants: itemVariants, className: "relative mb-6 mt-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 flex items-center", children: (0, jsx_runtime_1.jsx)("div", { className: "w-full border-t border-gray-200 dark:border-gray-700" }) }), (0, jsx_runtime_1.jsx)("div", { className: "relative flex justify-center text-sm", children: (0, jsx_runtime_1.jsx)("span", { className: "px-2 bg-[rgba(255, 255, 255, 0.1)] dark:bg-black text-gray-500 uppercase", children: "Or" }) })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { variants: itemVariants, className: "text-end mt-6", children: (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-300", children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/login", className: "px-15 dark:bg-white dark:text-black ml-3 py-4 font-bold rounded-[10px] text-white bg-black  text-sm capitalize ", children: "Sign in" }) }) })] }) })] }));
};
exports.default = Signup;
