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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Progress = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var React = require("react");
var utils_1 = require("../../lib/utils");
var Progress = React.forwardRef(function (_a, ref) {
    var className = _a.className, _b = _a.value, value = _b === void 0 ? 0 : _b, props = __rest(_a, ["className", "value"]);
    return ((0, jsx_runtime_1.jsx)("div", __assign({ ref: ref, className: (0, utils_1.cn)("relative h-4 w-full overflow-hidden rounded-[10px] bg-gray-200 dark:bg-gray-700", className) }, props, { children: (0, jsx_runtime_1.jsx)("div", { className: "h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300 ease-in-out", style: { width: "".concat(Math.min(Math.max(value, 0), 100), "%") } }) })));
});
exports.Progress = Progress;
Progress.displayName = "Progress";
