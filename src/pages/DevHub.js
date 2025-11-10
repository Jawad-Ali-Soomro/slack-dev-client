"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var Header_1 = require("../components/Header");
var Footer_1 = require("../components/Footer");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var DevHub = function () {
    var containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2
            }
        }
    };
    var itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center relative pt-30 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 min-h-screen", children: [(0, jsx_runtime_1.jsx)(Header_1.default, {}), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.main, { className: "container mx-auto px-6 py-20", variants: containerVariants, initial: "hidden", animate: "visible", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center mb-20", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.h1, { variants: itemVariants, className: "text-6xl  text-gray-900 dark:text-white  mb-6", style: { fontWeight: 900 }, children: "Dev Hub" }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.p, { variants: itemVariants, className: "text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto ", style: { fontWeight: 800 }, children: "Your central hub for development resources, tutorials, and community" })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.section, { variants: itemVariants, className: "grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20", children: [
                            {
                                icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Code, {}),
                                title: "Code Examples",
                                description: "Browse through hundreds of code snippets and examples for various programming languages.",
                                count: "500+"
                            },
                            {
                                icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Book, {}),
                                title: "Tutorials",
                                description: "Step-by-step guides and tutorials to help you master new technologies and frameworks.",
                                count: "200+"
                            },
                            {
                                icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Users, {}),
                                title: "Community",
                                description: "Connect with other developers, ask questions, and share your knowledge with the community.",
                                count: "50K+"
                            },
                            {
                                icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Zap, {}),
                                title: "Tools",
                                description: "Discover and access powerful development tools to boost your productivity.",
                                count: "100+"
                            }
                        ].map(function (category, index) { return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { className: "glass-card p-8 rounded-[10px] text-center", whileHover: { y: -5 }, children: [(0, jsx_runtime_1.jsx)("div", { className: "w-[80px] h-[80px] bg-black rounded-[10px] flex items-center justify-center mb-6 mx-auto dark:bg-white", children: (0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 text-white flex items-center justify-center", children: category.icon }) }), (0, jsx_runtime_1.jsx)("div", { className: "text-2xl  text-black mb-2 dark:text-white", children: category.count }), (0, jsx_runtime_1.jsx)("h3", { className: "text-xl  text-gray-600 dark:text-white mb-4 ", style: { fontWeight: 900 }, children: category.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm  text-gray-600 dark:text-gray-300  leading-relaxed", children: category.description })] }, index)); }) }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.section, { variants: itemVariants, className: "mb-20", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-4xl text-gray-900 dark:text-white  text-center mb-16", style: { fontWeight: 900 }, children: "Featured Resources" }), (0, jsx_runtime_1.jsx)("div", { className: "grid md:grid-cols-3 gap-8", children: [
                                    {
                                        title: "React Best Practices",
                                        category: "Tutorial",
                                        description: "Learn the latest React patterns and best practices for building scalable applications.",
                                        readTime: "15 min read"
                                    },
                                    {
                                        title: "API Integration Guide",
                                        category: "Code Example",
                                        description: "Comprehensive guide on integrating third-party APIs with authentication and error handling.",
                                        readTime: "20 min read"
                                    },
                                    {
                                        title: "Deployment Automation",
                                        category: "Tool",
                                        description: "Automate your deployment process with our CI/CD pipeline templates and configurations.",
                                        readTime: "10 min setup"
                                    }
                                ].map(function (resource, index) { return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { className: "glass-card p-8 rounded-[10px]", whileHover: { y: -5 }, children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm  text-black  mb-2 dark:text-white", children: resource.category }), (0, jsx_runtime_1.jsx)("h3", { className: "text-xl  text-gray-600 dark:text-white mb-4 ", style: { fontWeight: 900 }, children: resource.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm  text-gray-600 dark:text-gray-300  leading-relaxed mb-4", children: resource.description }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-xs  text-gray-500 dark:text-gray-400 ", children: resource.readTime }), (0, jsx_runtime_1.jsx)("button", { className: "text-xs  text-white  w-[40px] h-10 bg-black rounded-[10px] flex items-center justify-center dark:bg-white dark:text-black", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowRight, { className: "w-4 h-4 icon" }) })] })] }, index)); }) })] }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.section, { variants: itemVariants, className: "text-center mb-20", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-4xl text-gray-900 dark:text-white  mb-16", style: { fontWeight: 900 }, children: "Community Highlights" }), (0, jsx_runtime_1.jsx)("div", { className: "grid md:grid-cols-4 gap-8", children: [
                                    { number: "50K+", label: "Active Developers" },
                                    { number: "10K+", label: "Code Snippets" },
                                    { number: "5K+", label: "Discussions" },
                                    { number: "1K+", label: "Contributors" }
                                ].map(function (stat, index) { return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { className: "glass-card p-8 rounded-[10px]", whileHover: { y: -5 }, children: [(0, jsx_runtime_1.jsx)("div", { className: "text-4xl  text-black mb-2 dark:text-white", children: stat.number }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm  text-gray-600 dark:text-gray-300 ", children: stat.label })] }, index)); }) })] }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.section, { variants: itemVariants, className: "text-center", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-4xl text-gray-900 dark:text-white  mb-8", style: { fontWeight: 900 }, children: "Join the Community" }), (0, jsx_runtime_1.jsx)("p", { className: "text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto  mb-10", style: { fontWeight: 800 }, children: "Start learning, sharing, and building with thousands of developers worldwide" }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.button, { className: "px-12 py-4 bg-black text-white rounded-[10px]  text-lg  hover:bg-black transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-200", whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: "Explore Dev Hub" })] })] }), (0, jsx_runtime_1.jsx)(Footer_1.default, {})] }));
};
exports.default = DevHub;
