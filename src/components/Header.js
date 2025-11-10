"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var lucide_react_1 = require("lucide-react");
var react_router_dom_1 = require("react-router-dom");
var SidebarContext_1 = require("../contexts/SidebarContext");
var AuthContext_1 = require("../contexts/AuthContext");
var ri_1 = require("react-icons/ri");
var Header = function () {
    var navigate = (0, react_router_dom_1.useNavigate)();
    var location = (0, react_router_dom_1.useLocation)();
    var toggleSidebar = (0, SidebarContext_1.useSidebar)().toggleSidebar;
    var _a = (0, AuthContext_1.useAuth)(), user = _a.user, isAuthenticated = _a.isAuthenticated;
    var isActive = function (path) { return location.pathname === path; };
    var getLinkClasses = function (path) {
        var baseClasses = " text-sm hidden md:block hover:text-gray-700 dark:hover:text-gray-500 text-black transition-all duration-300  relative";
        var activeClasses = "text-black icon border-none";
        var inactiveClasses = "text-gray-500  border-transparent";
        return "".concat(baseClasses, " ").concat(isActive(path) ? activeClasses : inactiveClasses);
    };
    return ((0, jsx_runtime_1.jsxs)("header", { className: "w-[90%] mx-auto h-20  rounded-[10px] flex items-center justify-between px-5 fixed top-10 left-1/2 -translate-x-1/2 z-100", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-8 uppercase", children: (0, jsx_runtime_1.jsx)("div", { className: "p-3 bg-white dark:bg-white rounded-full", children: (0, jsx_runtime_1.jsx)("img", { src: "/logo.png", alt: "logo", className: "w-8 h-8 cursor-pointer", onClick: function () { return navigate("/"); } }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 w-[400px] justify-between items-center uppercase px-10 bg-white rounded-full border h-14 ", children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { className: getLinkClasses("/"), style: { fontWeight: " 700 !important" }, to: "/", children: "Home" }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { className: getLinkClasses("/about"), style: { fontWeight: " 700 !important" }, to: "/about", children: "About" }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { className: getLinkClasses("/contact"), style: { fontWeight: " 700 !important" }, to: "/contact", children: "Contact" })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-2 md:gap-4", children: (0, jsx_runtime_1.jsx)("button", { onClick: function () { return navigate("/login"); }, className: "  w-[50px]  flex items-center justify-center h-[50px] md:py-4 rounded-full cursor-pointer bg-black text-white uppercase hover:bg-black transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-200", children: (0, jsx_runtime_1.jsx)(ri_1.RiLoginCircleLine, { className: "w-5 h-5 icon icon" }) }) })] }));
};
exports.default = Header;
