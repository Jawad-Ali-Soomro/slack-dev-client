"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var framer_motion_1 = require("framer-motion");
var button_1 = require("../components/ui/button");
var lucide_react_1 = require("lucide-react");
var NotFound = function () {
    var navigate = (0, react_router_dom_1.useNavigate)();
    var containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.2
            }
        }
    };
    var itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6
            }
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4", children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { className: "text-center max-w-2xl mx-auto", variants: containerVariants, initial: "hidden", animate: "visible", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { variants: itemVariants, className: "mb-8", children: (0, jsx_runtime_1.jsx)("h1", { className: "text-6xl sm:text-8xl lg:text-9xl  text-gray-300 dark:text-gray-600 mb-4", children: "404" }) }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { variants: itemVariants, className: "mb-8", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl sm:text-3xl  text-gray-900 dark:text-white mb-4", children: "Page Not Found" }), (0, jsx_runtime_1.jsx)("p", { className: "text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 px-4", children: "The page you're looking for doesn't exist or has been moved." })] }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { variants: itemVariants, className: "flex flex-col  gap-3 sm:gap-4 justify-center items-center px-4 w-full", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { onClick: function () { return navigate('/'); }, className: "w-[300px] flex items-center justify-center gap-2 px-6 py-3 bg-black text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors", children: "Go Home" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: function () { return navigate(-1); }, variant: "outline", className: "flex items-center w-[300px] justify-center gap-2 px-6 py-3  border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-black transition-colors", children: "Go Back" })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { variants: itemVariants, className: "mt-8 sm:mt-12 px-4", children: (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: ["Need help? Try searching for what you're looking for or", ' ', (0, jsx_runtime_1.jsx)("button", { onClick: function () { return navigate('/contact'); }, className: "text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:underline", children: "contact support" })] }) })] }) }));
};
exports.default = NotFound;
