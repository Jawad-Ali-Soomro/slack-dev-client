"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidebarProvider = exports.useSidebar = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var SidebarContext = (0, react_1.createContext)();
var useSidebar = function () {
    var context = (0, react_1.useContext)(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};
exports.useSidebar = useSidebar;
var SidebarProvider = function (_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(true), isOpen = _b[0], setIsOpen = _b[1];
    var toggleSidebar = function () {
        setIsOpen(function (prev) { return !prev; });
    };
    var closeSidebar = function () {
        setIsOpen(false);
    };
    var openSidebar = function () {
        setIsOpen(true);
    };
    var isMobile = window.innerWidth <= 768;
    return ((0, jsx_runtime_1.jsx)(SidebarContext.Provider, { value: {
            isOpen: isOpen,
            isMobile: isMobile,
            toggleSidebar: toggleSidebar,
            closeSidebar: closeSidebar,
            openSidebar: openSidebar
        }, children: children }));
};
exports.SidebarProvider = SidebarProvider;
