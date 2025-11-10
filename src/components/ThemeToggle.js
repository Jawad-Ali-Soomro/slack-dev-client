"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeToggle = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var lucide_react_1 = require("lucide-react");
var framer_motion_1 = require("framer-motion");
var ThemeContext_1 = require("../contexts/ThemeContext");
var ThemeToggle = function (_a) {
    var _b = _a.className, className = _b === void 0 ? '' : _b;
    var _c = (0, ThemeContext_1.useTheme)(), theme = _c.theme, toggleTheme = _c.toggleTheme;
    return ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.button, { onClick: toggleTheme, className: "border rounded-[10px] cursor-pointer hover:shadow-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-black ".concat(className), whileHover: { scale: 1.1 }, whileTap: { scale: 0.9 }, transition: { type: "spring", stiffness: 400, damping: 17 }, "aria-label": "Switch to ".concat(theme === 'light' ? 'dark' : 'light', " mode"), children: (0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { mode: "wait", initial: false, children: theme === 'light' ? ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { y: -20, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 20, opacity: 0 }, transition: { duration: 0.2 }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Moon, { className: 'w-4 h-4 icon' }) }, "moon")) : ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { y: -20, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 20, opacity: 0 }, transition: { duration: 0.2 }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Sun, { className: 'w-4 h-4 icon' }) }, "sun")) }) }));
};
exports.ThemeToggle = ThemeToggle;
