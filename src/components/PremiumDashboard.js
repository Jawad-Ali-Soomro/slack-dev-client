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
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var button_1 = require("./ui/button");
var card_1 = require("./ui/card");
var progress_1 = require("./ui/progress");
var badge_1 = require("./ui/badge");
var tabs_1 = require("./ui/tabs");
var PremiumContext_1 = require("../contexts/PremiumContext");
var AuthContext_1 = require("../contexts/AuthContext");
var react_router_dom_1 = require("react-router-dom");
var PremiumDashboard = function () {
    var _a = (0, PremiumContext_1.usePremium)(), subscription = _a.subscription, usage = _a.usage, plans = _a.plans, loading = _a.loading, loadSubscription = _a.loadSubscription, loadUsage = _a.loadUsage, startTrial = _a.startTrial, getUsagePercentage = _a.getUsagePercentage, isOnTrial = _a.isOnTrial, isPremium = _a.isPremium, getPlanName = _a.getPlanName;
    var user = (0, AuthContext_1.useAuth)().user;
    var navigate = (0, react_router_dom_1.useNavigate)();
    var _b = (0, react_1.useState)(false), isStartingTrial = _b[0], setIsStartingTrial = _b[1];
    var featureIcons = {
        teams: lucide_react_1.Users,
        projects: lucide_react_1.FolderOpen,
        members: lucide_react_1.Users,
        tasks: lucide_react_1.CheckSquare,
        meetings: lucide_react_1.Calendar,
        codeSessions: lucide_react_1.Code,
        storage: lucide_react_1.HardDrive
    };
    var handleStartTrial = function (plan) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsStartingTrial(true);
                    return [4 /*yield*/, startTrial(plan)
                        // Redirect to premium page
                    ];
                case 1:
                    _a.sent();
                    // Redirect to premium page
                    navigate('/premium');
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Failed to start trial:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setIsStartingTrial(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleUpgrade = function () {
        navigate('/premium');
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center p-8", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-[10px] h-8 w-8 border-b-2 border-orange-500" }) }));
    }
    if (!subscription) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "text-center p-8", children: (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500", children: "Loading subscription data..." }) }));
    }
    var currentPlan = plans.find(function (plan) { return plan.id === subscription.plan; });
    var isTrial = isOnTrial();
    var isPremiumUser = isPremium();
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsx)(card_1.Card, { className: "bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700", children: (0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-[10px] flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Crown, { className: "w-6 h-6 text-white" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "text-xl", children: [getPlanName(), " Plan", isTrial && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { className: "ml-2 bg-yellow-500 text-white", children: "Trial" }))] }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: isTrial ? 'Trial ends in 14 days' :
                                                    isPremiumUser ? 'Active subscription' :
                                                        'Free plan with limited features' })] })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleUpgrade, className: "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white", children: isPremiumUser ? 'Manage Plan' : 'Upgrade Now' })] }) }) }), (0, jsx_runtime_1.jsxs)(tabs_1.Tabs, { defaultValue: "usage", className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)(tabs_1.TabsList, { className: "grid w-full grid-cols-3", children: [(0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "usage", children: "Usage" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "features", children: "Features" }), (0, jsx_runtime_1.jsx)(tabs_1.TabsTrigger, { value: "billing", children: "Billing" })] }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "usage", className: "space-y-6", children: (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: Object.entries(usage || {}).map(function (_a) {
                                var feature = _a[0], data = _a[1];
                                var Icon = featureIcons[feature];
                                var percentage = getUsagePercentage(feature);
                                var isNearLimit = percentage >= 80;
                                var isAtLimit = percentage >= 100;
                                return ((0, jsx_runtime_1.jsx)(card_1.Card, { className: "".concat(isAtLimit ? 'border-red-200 dark:border-red-800' :
                                        isNearLimit ? 'border-yellow-200 dark:border-yellow-800' :
                                            'border-gray-200 dark:border-gray-700'), children: (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [Icon && (0, jsx_runtime_1.jsx)(Icon, { className: "w-5 h-5 icon text-gray-600 dark:text-gray-400" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium capitalize", children: feature.replace(/([A-Z])/g, ' $1').trim() })] }), isAtLimit && (0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "w-4 h-4 icon text-red-500" }), isNearLimit && !isAtLimit && (0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "w-4 h-4 icon text-yellow-500" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: "Used" }), (0, jsx_runtime_1.jsxs)("span", { className: "font-medium", children: [data.used, " / ", data.limit === -1 ? '∞' : data.limit] })] }), (0, jsx_runtime_1.jsx)(progress_1.Progress, { value: percentage, className: "h-2" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-xs text-gray-500", children: [(0, jsx_runtime_1.jsxs)("span", { children: [Math.round(percentage), "% used"] }), data.limit !== -1 && ((0, jsx_runtime_1.jsxs)("span", { children: [data.limit - data.used, " remaining"] }))] })] })] }) }, feature));
                            }) }) }), (0, jsx_runtime_1.jsx)(tabs_1.TabsContent, { value: "features", className: "space-y-6", children: (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: Object.entries(subscription.features).map(function (_a) {
                                var feature = _a[0], value = _a[1];
                                var isBoolean = typeof value === 'boolean';
                                var isEnabled = isBoolean ? value : value > 0 || value === -1;
                                return ((0, jsx_runtime_1.jsx)(card_1.Card, { className: "border-gray-200 dark:border-gray-700", children: (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [isEnabled ? ((0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-5 h-5 icon text-green-500" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "w-5 h-5 icon text-gray-400" })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium capitalize", children: feature.replace(/([A-Z])/g, ' $1').trim() }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: isBoolean ?
                                                                        (value ? 'Enabled' : 'Disabled') :
                                                                        (value === -1 ? 'Unlimited' : "Up to ".concat(value)) })] })] }), !isEnabled && ((0, jsx_runtime_1.jsx)(badge_1.Badge, { variant: "outline", className: "text-orange-600 border-orange-200", children: "Premium" }))] }) }) }, feature));
                            }) }) }), (0, jsx_runtime_1.jsxs)(tabs_1.TabsContent, { value: "billing", className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CreditCard, { className: "w-5 h-5 icon" }), "Billing Information"] }) }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: "Current Plan" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: getPlanName() })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: "Status" }), (0, jsx_runtime_1.jsx)(badge_1.Badge, { className: subscription.status === 'active' ? 'bg-green-500' :
                                                            subscription.status === 'trial' ? 'bg-yellow-500' :
                                                                'bg-gray-500', children: subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) })] }), subscription.startDate && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: "Start Date" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: new Date(subscription.startDate).toLocaleDateString() })] })), subscription.endDate && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: "Next Billing" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: new Date(subscription.endDate).toLocaleDateString() })] })), isTrial && subscription.trialEndDate && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: "Trial Ends" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium text-yellow-600", children: new Date(subscription.trialEndDate).toLocaleDateString() })] }))] })] }), (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { children: "Available Plans" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Choose the plan that best fits your needs" })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: plans.map(function (plan) { return ((0, jsx_runtime_1.jsxs)(card_1.Card, { className: "".concat(plan.id === subscription.plan ? 'border-orange-200 dark:border-orange-700' :
                                                    'border-gray-200 dark:border-gray-700'), children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "text-center", children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-lg", children: plan.name }), (0, jsx_runtime_1.jsxs)("div", { className: "text-2xl ", children: ["$", plan.price, (0, jsx_runtime_1.jsx)("span", { className: "text-sm font-normal text-gray-500", children: "/month" })] })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: Object.entries(plan.features).slice(0, 5).map(function (_a) {
                                                                    var key = _a[0], value = _a[1];
                                                                    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 text-sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-4 h-4 icon text-green-500" }), (0, jsx_runtime_1.jsxs)("span", { className: "capitalize", children: [key.replace(/([A-Z])/g, ' $1').trim(), ":", typeof value === 'boolean' ? (value ? ' Yes' : ' No') :
                                                                                        value === -1 ? ' Unlimited' : " ".concat(value)] })] }, key));
                                                                }) }), plan.id !== subscription.plan && ((0, jsx_runtime_1.jsx)(button_1.Button, { className: "w-full", variant: plan.id === 'free' ? 'outline' : 'default', onClick: function () {
                                                                    if (plan.id === 'free')
                                                                        return;
                                                                    if (subscription.plan === 'free') {
                                                                        handleStartTrial(plan.id);
                                                                    }
                                                                    else {
                                                                        handleUpgrade();
                                                                    }
                                                                }, disabled: isStartingTrial, children: plan.id === 'free' ? 'Current Plan' :
                                                                    subscription.plan === 'free' ? 'Start Trial' : 'Upgrade' }))] })] }, plan.id)); }) }) })] })] })] })] }));
};
exports.default = PremiumDashboard;
