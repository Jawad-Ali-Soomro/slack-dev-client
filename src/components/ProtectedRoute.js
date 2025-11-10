"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var react_router_dom_1 = require("react-router-dom");
var AuthContext_1 = require("../contexts/AuthContext");
var framer_motion_1 = require("framer-motion");
var HorizontalLoader_1 = require("./HorizontalLoader");
var Sidebar_1 = require("./Sidebar");
var DashboardHeader_1 = require("./DashboardHeader");
var SidebarContext_1 = require("../contexts/SidebarContext");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var ProtectedRoute = function (_a) {
    var children = _a.children, _b = _a.requireAuth, requireAuth = _b === void 0 ? true : _b;
    var _c = (0, AuthContext_1.useAuth)(), isAuthenticated = _c.isAuthenticated, loading = _c.loading;
    var _d = (0, SidebarContext_1.useSidebar)(), isOpen = _d.isOpen, toggleSidebar = _d.toggleSidebar, isMobile = _d.isMobile;
    var location = (0, react_router_dom_1.useLocation)();
    // Show loading spinner while checking auth status
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(HorizontalLoader_1.default, { message: "Authenticating...", subMessage: "Checking your credentials", progress: 50, className: "min-h-screen" }));
    }
    // If route requires authentication and user is not authenticated
    if (requireAuth && !isAuthenticated) {
        return (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    // If route requires no authentication (like login/signup) and user is authenticated
    if (!requireAuth && isAuthenticated) {
        return (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/dashboard", replace: true });
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-white dark:bg-black", children: [(0, jsx_runtime_1.jsx)(DashboardHeader_1.default, {}), (0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsx)("div", { onClick: function (e) { return e.stopPropagation(); }, children: (0, jsx_runtime_1.jsx)(Sidebar_1.default, {}) }), (0, jsx_runtime_1.jsx)("div", { className: "".concat(isOpen ? "md:pl-30" : "", " transition-all  flex-1 pr-10 md:pt-20 pt-25 pl-10 overflow-hidden"), children: children })] })] }));
};
exports.default = ProtectedRoute;
