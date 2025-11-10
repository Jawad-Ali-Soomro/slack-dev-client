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
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var button_1 = require("./ui/button");
var input_1 = require("./ui/input");
var textarea_1 = require("./ui/textarea");
var select_1 = require("./ui/select");
var sonner_1 = require("sonner");
var enhancedTaskService_1 = require("../services/enhancedTaskService");
var avatarUtils_1 = require("../utils/avatarUtils");
var taskService_1 = require("../services/taskService");
var TaskEditModal = function (_a) {
    var task = _a.task, isOpen = _a.isOpen, onClose = _a.onClose, onTaskUpdated = _a.onTaskUpdated, _b = _a.users, users = _b === void 0 ? [] : _b;
    var _c = (0, react_1.useState)({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        assignedTo: '',
        dueDate: '',
        tags: []
    }), formData = _c[0], setFormData = _c[1];
    var _d = (0, react_1.useState)(''), newTag = _d[0], setNewTag = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    // Initialize form data when task changes
    (0, react_1.useEffect)(function () {
        var _a;
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'medium',
                status: task.status || 'pending',
                assignedTo: ((_a = task.assignTo) === null || _a === void 0 ? void 0 : _a.id) || task.assignTo || 'unassigned',
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                tags: task.tags || []
            });
        }
    }, [task]);
    var handleInputChange = function (field, value) {
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    var handleAddTag = function () {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(function (prev) { return (__assign(__assign({}, prev), { tags: __spreadArray(__spreadArray([], prev.tags, true), [newTag.trim()], false) })); });
            setNewTag('');
        }
    };
    var handleRemoveTag = function (tagToRemove) {
        setFormData(function (prev) { return (__assign(__assign({}, prev), { tags: prev.tags.filter(function (tag) { return tag !== tagToRemove; }) })); });
    };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var updateData, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!formData.title.trim()) {
                        sonner_1.toast.error('Title is required');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setLoading(true);
                    updateData = __assign(__assign({}, formData), { assignedTo: formData.assignedTo === 'unassigned' ? null : formData.assignedTo, dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null });
                    return [4 /*yield*/, taskService_1.default.updateTask(task.id, updateData)];
                case 2:
                    response = _a.sent();
                    sonner_1.toast.success('Task updated successfully!');
                    onTaskUpdated(response.task);
                    onClose();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Task update error:', error_1);
                    sonner_1.toast.error(error_1.message || 'Failed to update task');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getAssignedUser = function () {
        if (!formData.assignedTo || formData.assignedTo === 'unassigned')
            return null;
        return users.find(function (user) { return user._id === formData.assignedTo; });
    };
    var assignedUser = getAssignedUser();
    if (!isOpen || !task)
        return null;
    return ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 icon bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50", onClick: onClose, children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: "bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto", onClick: function (e) { return e.stopPropagation(); }, children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl  text-black dark:text-white", children: "Edit Task" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: "Update task details and assignments" })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-6 h-6" }) })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-6", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { value: formData.title, onChange: function (e) { return handleInputChange('title', e.target.value); }, placeholder: "Enter task title *", className: "w-full", required: true }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(textarea_1.Textarea, { value: formData.description, onChange: function (e) { return handleInputChange('description', e.target.value); }, placeholder: "Enter task description", className: "w-full", rows: "4" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(select_1.Select, { value: formData.priority, onValueChange: function (value) { return handleInputChange('priority', value); }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: 'w-full', children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Select priority" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "low", children: "Low" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "medium", children: "Medium" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "high", children: "High" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "urgent", children: "Urgent" })] })] }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(select_1.Select, { value: formData.status, onValueChange: function (value) { return handleInputChange('status', value); }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: 'w-full', children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Select status" }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "pending", children: "Pending" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "in_progress", children: "In Progress" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "completed", children: "Completed" }), (0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "cancelled", children: "Cancelled" })] })] }) })] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(select_1.Select, { value: formData.assignedTo, onValueChange: function (value) { return handleInputChange('assignedTo', value); }, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: 'w-full', children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, { placeholder: "Select assigned user", children: assignedUser && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)(assignedUser.avatar, assignedUser.username), { alt: assignedUser.username, className: "w-5 h-5 icon rounded-[10px]" })), (0, jsx_runtime_1.jsx)("span", { children: assignedUser.username })] })) }) }), (0, jsx_runtime_1.jsxs)(select_1.SelectContent, { children: [(0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: "unassigned", children: "Unassigned" }), users.map(function (user) { return ((0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: user.id, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("img", __assign({}, (0, avatarUtils_1.getAvatarProps)(user.avatar, user.username), { alt: user.username, className: "w-5 h-5 icon rounded-[10px]" })), (0, jsx_runtime_1.jsx)("span", { children: user.username })] }) }, user.id)); })] })] }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(input_1.Input, { type: "date", value: formData.dueDate, onChange: function (e) { return handleInputChange('dueDate', e.target.value); }, placeholder: "Select due date", className: "w-full" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mb-2", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { value: newTag, onChange: function (e) { return setNewTag(e.target.value); }, placeholder: "Add a tag", className: "flex-1", onKeyPress: function (e) { return e.key === 'Enter' && (e.preventDefault(), handleAddTag()); } }), (0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", onClick: handleAddTag, variant: "outline", children: "Add" })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: formData.tags.map(function (tag, index) { return ((0, jsx_runtime_1.jsxs)("span", { className: "inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-black text-blue-800 dark:text-blue-200 rounded-[10px] text-sm", children: [tag, (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: function () { return handleRemoveTag(tag); }, className: "ml-1 hover:text-blue-600 dark:hover:text-blue-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-3 h-3 icon" }) })] }, index)); }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { type: "button", variant: "outline", onClick: onClose, className: "flex-1", disabled: loading, children: "Cancel" }), (0, jsx_runtime_1.jsxs)(button_1.Button, { type: "submit", className: "flex-1", disabled: loading, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "w-4 h-4 icon mr-2" }), loading ? 'Saving...' : 'Save Changes'] })] })] })] }) }) }));
};
exports.default = TaskEditModal;
