"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeProvider = exports.useTheme = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var ThemeContext = (0, react_1.createContext)();
var useTheme = function () {
    var context = (0, react_1.useContext)(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
exports.useTheme = useTheme;
var ThemeProvider = function (_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(function () {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'dark';
        }
        return 'dark';
    }), theme = _b[0], setTheme = _b[1];
    (0, react_1.useEffect)(function () {
        var root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    var toggleTheme = function () {
        setTheme(function (prev) { return prev === 'light' ? 'dark' : 'light'; });
    };
    return ((0, jsx_runtime_1.jsx)(ThemeContext.Provider, { value: { theme: theme, setTheme: setTheme, toggleTheme: toggleTheme }, children: children }));
};
exports.ThemeProvider = ThemeProvider;
