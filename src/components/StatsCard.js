"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var framer_motion_1 = require("framer-motion");
var StatsCard = function (_a) {
    var title = _a.title, value = _a.value, _b = _a.color, color = _b === void 0 ? 'blue' : _b, Icon = _a.icon, subtitle = _a.subtitle, trend = _a.trend, trendValue = _a.trendValue, _c = _a.delay, delay = _c === void 0 ? 0 : _c;
    var colorConfig = {
        neutral: {
            bg: 'bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-300',
            text: 'text-gray-800 dark:text-gray-200',
            light: 'bg-white dark:bg-gray-800',
            border: 'border-gray-200 dark:border-gray-700'
        },
        blue: {
            bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
            text: 'text-blue-600 dark:text-blue-400',
            light: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800'
        },
        green: {
            bg: 'bg-gradient-to-br from-green-500 to-green-600',
            text: 'text-green-600 dark:text-green-400',
            light: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-200 dark:border-green-800'
        },
        purple: {
            bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
            text: 'text-purple-600 dark:text-purple-400',
            light: 'bg-purple-50 dark:bg-purple-900/20',
            border: 'border-purple-200 dark:border-purple-800'
        },
        red: {
            bg: 'bg-gradient-to-br from-red-500 to-red-600',
            text: 'text-red-600 dark:text-red-400',
            light: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800'
        },
        orange: {
            bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
            text: 'text-orange-600 dark:text-orange-400',
            light: 'bg-orange-50 dark:bg-orange-900/20',
            border: 'border-orange-200 dark:border-orange-800'
        },
        cyan: {
            bg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
            text: 'text-cyan-600 dark:text-cyan-400',
            light: 'bg-cyan-50 dark:bg-cyan-900/20',
            border: 'border-cyan-200 dark:border-cyan-800'
        }
    };
    var config = colorConfig[color] || colorConfig.neutral;
    return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: delay, duration: 0.5 }, className: "relative overflow-hidden rounded-[30px] border ".concat(config.border, " border-l-10  ").concat(config.light, " backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group"), children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 ".concat(config.bg, " opacity-5 group-hover:opacity-10 transition-opacity duration-300") }), (0, jsx_runtime_1.jsxs)("div", { className: "relative p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [Icon && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, transition: { delay: delay + 0.2, type: "spring", stiffness: 200 }, className: "p-3 ".concat(config.bg, " rounded-lg shadow-lg bg-[#fe914d]"), children: (0, jsx_runtime_1.jsx)(Icon, { className: "w-5 h-5 icon text-white dark:text-gray-800" }) })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm  text-gray-600 dark:text-gray-400 tracking-wide", children: title }), subtitle && ((0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 dark:text-gray-500 mt-1", children: subtitle }))] })] }), trend && trendValue && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { delay: delay + 0.3 }, className: "flex items-center space-x-1 px-2 py-1 rounded-full ".concat(trend === 'up'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'), children: (0, jsx_runtime_1.jsxs)("span", { className: "text-xs font-medium", children: [trend === 'up' ? '↗' : '↘', " ", trendValue, "%"] }) }))] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: delay + 0.1 }, className: "text-4xl  ".concat(config.text, " mb-2 font-bold"), children: value }), (0, jsx_runtime_1.jsx)("div", { className: "absolute bottom-0 right-0 w-20 h-20 opacity-10", children: (0, jsx_runtime_1.jsx)("div", { className: "w-full h-full ".concat(config.bg, " rounded-full transform translate-x-8 translate-y-8") }) })] })] }));
};
exports.default = StatsCard;
