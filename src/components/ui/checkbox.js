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
exports.Checkbox = Checkbox;
var jsx_runtime_1 = require("react/jsx-runtime");
var React = require("react");
var CheckboxPrimitive = require("@radix-ui/react-checkbox");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function Checkbox(_a) {
    var className = _a.className, _b = _a.size, size = _b === void 0 ? "default" : _b, props = __rest(_a, ["className", "size"]);
    var sizeVariants = {
        sm: "size-4",
        default: "size-5",
        lg: "size-6"
    };
    var iconVariants = {
        sm: "size-3",
        default: "size-4",
        lg: "size-5"
    };
    return ((0, jsx_runtime_1.jsx)(CheckboxPrimitive.Root, __assign({ "data-slot": "checkbox", className: (0, utils_1.cn)("peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shrink-0 rounded-[10px] border shadow-sm transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50", sizeVariants[size], className) }, props, { children: (0, jsx_runtime_1.jsx)(CheckboxPrimitive.Indicator, { "data-slot": "checkbox-indicator", className: "flex items-center justify-center text-current transition-all duration-200", children: (0, jsx_runtime_1.jsx)(lucide_react_1.CheckIcon, { className: (0, utils_1.cn)(iconVariants[size]) }) }) })));
}
