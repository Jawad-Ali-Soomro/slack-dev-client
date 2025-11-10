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
exports.Textarea = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var React = require("react");
var utils_1 = require("../../lib/utils");
var Textarea = React.forwardRef(function (_a, ref) {
    var className = _a.className, _b = _a.size, size = _b === void 0 ? "default" : _b, props = __rest(_a, ["className", "size"]);
    var sizeVariants = {
        sm: "min-h-[60px] px-2.5 py-2 text-sm",
        default: "min-h-[80px] px-3 py-2.5 text-sm",
        lg: "min-h-[100px] px-4 py-3 text-base"
    };
    return ((0, jsx_runtime_1.jsx)("textarea", __assign({ className: (0, utils_1.cn)("flex w-full rounded-[10px] border border-input shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus:border-gray-400 dark:focus:border-gray-600 focus-visible:shadow-md transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50", sizeVariants[size], className), ref: ref }, props)));
});
exports.Textarea = Textarea;
Textarea.displayName = "Textarea";
