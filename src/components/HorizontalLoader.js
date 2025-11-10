"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var framer_motion_1 = require("framer-motion");
var HorizontalLoader = function (_a) {
    var _b = _a.message, message = _b === void 0 ? "Loading..." : _b, _c = _a.subMessage, subMessage = _c === void 0 ? "Please wait" : _c, _d = _a.progress, progress = _d === void 0 ? 75 : _d, _e = _a.className, className = _e === void 0 ? "" : _e, _f = _a.showProgress, showProgress = _f === void 0 ? true : _f;
    return ((0, jsx_runtime_1.jsx)("div", { className: "flex flex-col items-center justify-center min-h-[200px] ".concat(className), children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "w-full max-w-md", children: (0, jsx_runtime_1.jsx)("div", { className: "w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4", children: (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { width: 0 }, animate: { width: "".concat(progress, "%") }, transition: { duration: 0.8, ease: "easeOut" }, className: "h-full bg-gradient-to-r from-gray-500 to-gray-600 rounded-full" }) }) }) }));
};
exports.default = HorizontalLoader;
