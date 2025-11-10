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
exports.Input = Input;
var jsx_runtime_1 = require("react/jsx-runtime");
var React = require("react");
var utils_1 = require("@/lib/utils");
function Input(_a) {
    var className = _a.className, type = _a.type, _b = _a.size, size = _b === void 0 ? "default" : _b, props = __rest(_a, ["className", "type", "size"]);
    var sizeVariants = {
        sm: "h-12 px-2.5 text-sm rounded-[10px]",
        default: "h-12 px-3 text-sm rounded-[10px]",
        lg: "h-12 px-4 text-base rounded-[10px]",
        xl: "h-12 px-4 text-base rounded-[10px]"
    };
    return ((0, jsx_runtime_1.jsx)("input", __assign({ type: type, "data-slot": "input", className: (0, utils_1.cn)("file:text-foreground placeholder:text-muted-foreground border bg-gray-100 dark:bg-black w-full min-w-0 border border-gray-200 bg-transparent py-2 shadow-sm transition-all duration-200 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file: disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50", "focus:border-gray-400 dark:focus:border-gray-600 focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:shadow-md", "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", sizeVariants[size], className) }, props)));
}
