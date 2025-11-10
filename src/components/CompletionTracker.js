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
var sonner_1 = require("sonner");
var completionService_1 = require("../services/completionService");
var CompletionTracker = function (_a) {
    var itemId = _a.itemId, itemType = _a.itemType, onCompletionChange = _a.onCompletionChange, _b = _a.showBadge, showBadge = _b === void 0 ? true : _b, _c = _a.showButton, showButton = _c === void 0 ? true : _c, _d = _a.className, className = _d === void 0 ? '' : _d;
    var _e = (0, react_1.useState)(false), isCompleted = _e[0], setIsCompleted = _e[1];
    var _f = (0, react_1.useState)(false), isLoading = _f[0], setIsLoading = _f[1];
    var _g = (0, react_1.useState)(null), completionData = _g[0], setCompletionData = _g[1];
    (0, react_1.useEffect)(function () {
        checkCompletionStatus();
    }, [itemId, itemType]);
    var checkCompletionStatus = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    response = void 0;
                    _a = itemType;
                    switch (_a) {
                        case 'task': return [3 /*break*/, 1];
                        case 'meeting': return [3 /*break*/, 3];
                    }
                    return [3 /*break*/, 5];
                case 1: return [4 /*yield*/, completionService_1.default.isTaskCompleted(itemId)];
                case 2:
                    response = _b.sent();
                    return [3 /*break*/, 6];
                case 3: return [4 /*yield*/, completionService_1.default.isMeetingCompleted(itemId)];
                case 4:
                    response = _b.sent();
                    return [3 /*break*/, 6];
                case 5: return [2 /*return*/];
                case 6:
                    setIsCompleted(response.completed);
                    setCompletionData(response);
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _b.sent();
                    console.error('Error checking completion status:', error_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var handleMarkCompleted = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, _a, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (isCompleted)
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 8, 9, 10]);
                    setIsLoading(true);
                    response = void 0;
                    _a = itemType;
                    switch (_a) {
                        case 'task': return [3 /*break*/, 2];
                        case 'meeting': return [3 /*break*/, 4];
                    }
                    return [3 /*break*/, 6];
                case 2: return [4 /*yield*/, completionService_1.default.markTaskCompleted(itemId)];
                case 3:
                    response = _b.sent();
                    return [3 /*break*/, 7];
                case 4: return [4 /*yield*/, completionService_1.default.markMeetingCompleted(itemId)];
                case 5:
                    response = _b.sent();
                    return [3 /*break*/, 7];
                case 6: return [2 /*return*/];
                case 7:
                    setIsCompleted(true);
                    setCompletionData(response);
                    if (onCompletionChange) {
                        onCompletionChange(true, response);
                    }
                    sonner_1.toast.success("".concat(itemType.charAt(0).toUpperCase() + itemType.slice(1), " marked as completed!"));
                    return [3 /*break*/, 10];
                case 8:
                    error_2 = _b.sent();
                    console.error('Error marking as completed:', error_2);
                    sonner_1.toast.error("Failed to mark ".concat(itemType, " as completed"));
                    return [3 /*break*/, 10];
                case 9:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); };
    var getCompletionIcon = function () {
        if (isCompleted) {
            return (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-4 h-4 icon text-green-500" });
        }
        return (0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "w-4 h-4 icon text-gray-400" });
    };
    var getCompletionBadge = function () {
        if (!showBadge)
            return null;
        if (isCompleted) {
            return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, className: "inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-[10px] text-xs font-medium", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-3 h-3 icon" }), "Completed"] }));
        }
        return ((0, jsx_runtime_1.jsxs)("div", { className: "inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-[10px] text-xs font-medium", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "w-3 h-3 icon" }), "Pending"] }));
    };
    var getCompletionButton = function () {
        if (!showButton)
            return null;
        if (isCompleted) {
            return ((0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", size: "sm", disabled: true, className: "flex items-center gap-2 text-green-600 border-green-200 bg-green-50 dark:bg-green-900 dark:border-green-700", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-4 h-4 icon" }), "Completed"] }));
        }
        return ((0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleMarkCompleted, disabled: isLoading, size: "sm", className: "flex items-center gap-2", children: [isLoading ? ((0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 icon  border-white border-t-transparent rounded-[10px] animate-spin" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-4 h-4 icon" })), "Mark Complete"] }));
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 ".concat(className), children: [getCompletionIcon(), getCompletionBadge(), getCompletionButton()] }));
};
exports.default = CompletionTracker;
