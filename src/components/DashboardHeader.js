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
var button_1 = require("./ui/button");
var input_1 = require("./ui/input");
var textarea_1 = require("./ui/textarea");
var AuthContext_1 = require("../contexts/AuthContext");
var sonner_1 = require("sonner");
var profileService_1 = require("../services/profileService");
var avatarUtils_1 = require("../utils/avatarUtils");
var NotificationDropdown_1 = require("./NotificationDropdown");
var SidebarContext_1 = require("../contexts/SidebarContext");
var ri_1 = require("react-icons/ri");
var ThemeToggle_1 = require("./ThemeToggle");
var DashboardHeader = function () {
    var _a = (0, AuthContext_1.useAuth)(), user = _a.user, logout = _a.logout;
    var _b = (0, react_1.useState)(false), showProfileModal = _b[0], setShowProfileModal = _b[1];
    var _c = (0, react_1.useState)(false), isEditing = _c[0], setIsEditing = _c[1];
    var _d = (0, react_1.useState)({
        username: '',
        bio: '',
        userLocation: '',
        website: '',
        phone: ''
    }), profileData = _d[0], setProfileData = _d[1];
    var _e = (0, react_1.useState)(null), avatarFile = _e[0], setAvatarFile = _e[1];
    var _f = (0, react_1.useState)(''), avatarPreview = _f[0], setAvatarPreview = _f[1];
    var _g = (0, react_1.useState)(false), loading = _g[0], setLoading = _g[1];
    // Initialize profile data when user changes
    (0, react_1.useEffect)(function () {
        if (user) {
            setProfileData({
                username: user.username || '',
                bio: user.bio || '',
                userLocation: user.userLocation || '',
                website: user.website || '',
                phone: user.phone || ''
            });
            setAvatarPreview(user.avatar || '');
        }
    }, [user]);
    // Fetch real-time profile data when modal opens
    var fetchProfileData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, profileUser, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, profileService_1.default.getProfile()];
                case 1:
                    response = _a.sent();
                    profileUser = response.user;
                    setProfileData({
                        username: profileUser.username || '',
                        bio: profileUser.bio || '',
                        userLocation: profileUser.userLocation || '',
                        website: profileUser.website || '',
                        phone: profileUser.phone || ''
                    });
                    setAvatarPreview(profileUser.avatar || '');
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Failed to fetch profile:', error_1);
                    sonner_1.toast.error('Failed to load profile data');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Handle modal open
    var handleOpenProfileModal = function () {
        setShowProfileModal(true);
        fetchProfileData();
    };
    var handleProfileUpdate = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, updatedUser, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, profileService_1.default.updateProfile(profileData)
                        // Update user data in context/localStorage
                    ];
                case 1:
                    response = _a.sent();
                    updatedUser = __assign(__assign({}, user), response.user);
                    localStorage.setItem('userData', JSON.stringify(updatedUser));
                    sonner_1.toast.success('Profile updated successfully!');
                    setIsEditing(false);
                    setShowProfileModal(false);
                    // Reload page to update user context
                    window.location.reload();
                    return [3 /*break*/, 4];
                case 2:
                    error_2 = _a.sent();
                    console.error('Profile update error:', error_2);
                    sonner_1.toast.error(error_2.message || 'Failed to update profile');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleAvatarUpload = function (event) { return __awaiter(void 0, void 0, void 0, function () {
        var file, response, apiUrl, avatarUrl, updatedUser, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    file = event.target.files[0];
                    if (!file)
                        return [2 /*return*/];
                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                        sonner_1.toast.error('Please select a valid image file');
                        return [2 /*return*/];
                    }
                    // Validate file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        sonner_1.toast.error('Image size should be less than 5MB');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, profileService_1.default.uploadAvatar(file)
                        // Update avatar preview with full URL
                    ];
                case 2:
                    response = _a.sent();
                    apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
                    avatarUrl = response.user.avatar.startsWith('http')
                        ? response.user.avatar
                        : "".concat(apiUrl).concat(response.user.avatar);
                    setAvatarPreview(avatarUrl);
                    setAvatarFile(file);
                    updatedUser = __assign(__assign({}, user), { avatar: response.user.avatar });
                    localStorage.setItem('userData', JSON.stringify(updatedUser));
                    sonner_1.toast.success('Avatar uploaded successfully!');
                    // Reload page to update user context
                    window.location.reload();
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
                    console.error('Avatar upload error:', error_3);
                    sonner_1.toast.error(error_3.message || 'Failed to upload avatar');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var _h = (0, SidebarContext_1.useSidebar)(), toggleSidebar = _h.toggleSidebar, isOpen = _h.isOpen;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("header", { className: "bg-white dark:bg-black z-50 icon  border-gray-200 dark:border-gray-700 px-6 py-4 border-b fixed w-full", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between ", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center items-center gap-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex left-2 top-20 p-3 hover:bg-gray-100 cursor-pointer rounded-sm hover:text-black z-10", onClick: function () { return toggleSidebar(); }, children: (0, jsx_runtime_1.jsx)(ri_1.RiMenu3Fill, {}) }), (0, jsx_runtime_1.jsx)("img", { src: "/logo.png", className: 'w-[50px]', alt: "" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4", children: [(0, jsx_runtime_1.jsx)(ThemeToggle_1.ThemeToggle, { className: 'border-none text-sm' }), (0, jsx_runtime_1.jsx)(NotificationDropdown_1.default, {}), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 ", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-right", children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium text-gray-900 dark:text-white", children: (user === null || user === void 0 ? void 0 : user.username) || 'User' }) }), (0, jsx_runtime_1.jsx)("button", { onClick: handleOpenProfileModal, className: "relative group", children: (0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 p-1 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700 group-hover:border-black dark:group-hover:border-white transition-colors", children: (0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)(avatarPreview || (user === null || user === void 0 ? void 0 : user.avatar), user === null || user === void 0 ? void 0 : user.username), { alt: (user === null || user === void 0 ? void 0 : user.username) || 'User', className: "w-full h-full object-cover rounded-full" })) }) })] })] })] }) }), showProfileModal && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed bg-black/20 inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-60 icon", onClick: function () { return setShowProfileModal(false); }, children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: "bg-white dark:bg-black rounded-sm shadow-2xl  border-gray-200 dark:border-gray-700 max-w-md w-full p-6", onClick: function (e) { return e.stopPropagation(); }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-black dark:text-white", children: "Profile Settings" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: [user === null || user === void 0 ? void 0 : user.email, " \u2022 ", user === null || user === void 0 ? void 0 : user.role] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: fetchProfileData, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1", disabled: loading, title: "Refresh profile data", children: (0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: "w-5 h-5 icon ".concat(loading ? 'animate-spin' : '') }) }), (0, jsx_runtime_1.jsx)("button", { onClick: function () { return setShowProfileModal(false); }, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-6 h-6" }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative group mb-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-20 h-20 rounded-full p-2 overflow-hidden border-1 border-gray-200 dark:border-gray-700 group-hover:border-black dark:group-hover:border-white transition-colors", children: (0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)(avatarPreview || (user === null || user === void 0 ? void 0 : user.avatar), user === null || user === void 0 ? void 0 : user.username), { alt: (user === null || user === void 0 ? void 0 : user.username) || 'User', className: "w-full h-full object-cover rounded-full" })) }), (0, jsx_runtime_1.jsxs)("label", { className: "absolute -bottom-1 rounded-full bg-black dark:bg-white text-white dark:text-black -right-1 w-6 h-6 flex items-center justify-center cursor-pointer transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Camera, { className: "w-3 h-3 icon" }), (0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", onChange: handleAvatarUpload, className: "hidden", disabled: loading })] })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400 text-center", children: loading ? 'Uploading...' : 'Click the camera icon to upload a new avatar' }), (0, jsx_runtime_1.jsx)("div", { className: "flex gap-4 mt-4 text-center", children: (0, jsx_runtime_1.jsx)("div", { className: "px-5 py-2 bg-gray-100 dark:bg-black rounded-sm", children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium text-green-600 dark:text-green-400", children: (user === null || user === void 0 ? void 0 : user.emailVerified) ? 'Verified' : 'Pending' }) }) })] }), loading ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-center py-8", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-sm h-8 w-8 border-b-2 border-blue-500" }), (0, jsx_runtime_1.jsx)("span", { className: "ml-2 text-gray-500", children: "Loading profile..." })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { value: profileData.username, onChange: function (e) { return setProfileData(__assign(__assign({}, profileData), { username: e.target.value })); }, disabled: !isEditing, className: "w-full" }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { value: profileData.bio, onChange: function (e) { return setProfileData(__assign(__assign({}, profileData), { bio: e.target.value })); }, disabled: !isEditing, className: "w-full", rows: "3", placeholder: "Tell us about yourself..." }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { value: profileData.userLocation, onChange: function (e) { return setProfileData(__assign(__assign({}, profileData), { userLocation: e.target.value })); }, disabled: !isEditing, className: "w-full", placeholder: "Your location" }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { value: profileData.website, onChange: function (e) { return setProfileData(__assign(__assign({}, profileData), { website: e.target.value })); }, disabled: !isEditing, className: "w-full", placeholder: "https://yourwebsite.com" }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { value: profileData.phone, onChange: function (e) { return setProfileData(__assign(__assign({}, profileData), { phone: e.target.value })); }, disabled: !isEditing, className: "w-full", placeholder: "Your phone number" }) })] })), (0, jsx_runtime_1.jsx)("div", { className: "flex gap-3 mt-6", children: !isEditing ? ((0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: function () { return setIsEditing(true); }, className: "flex-1", disabled: loading, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { className: "w-4 h-4 icon mr-2" }), "Edit Profile"] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: function () {
                                            setIsEditing(false);
                                            setProfileData({
                                                username: (user === null || user === void 0 ? void 0 : user.username) || '',
                                                bio: (user === null || user === void 0 ? void 0 : user.bio) || '',
                                                userLocation: (user === null || user === void 0 ? void 0 : user.userLocation) || '',
                                                website: (user === null || user === void 0 ? void 0 : user.website) || '',
                                                phone: (user === null || user === void 0 ? void 0 : user.phone) || ''
                                            });
                                            setAvatarFile(null);
                                            setAvatarPreview((user === null || user === void 0 ? void 0 : user.avatar) || '');
                                        }, className: "flex-1", disabled: loading, children: "Cancel" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleProfileUpdate, className: "flex-1", disabled: loading, children: loading ? 'Saving...' : 'Save Changes' })] })) })] }) }))] }));
};
exports.default = DashboardHeader;
