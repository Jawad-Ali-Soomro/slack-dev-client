"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var Header_1 = require("../components/Header");
var Footer_1 = require("../components/Footer");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var About = function () {
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center pt-50 relative overflow-hidden bg-gray-50 dark:bg-black min-h-screen", children: [(0, jsx_runtime_1.jsx)(Header_1.default, {}), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.main, { className: "container mx-auto px-6 py-20", variants: containerVariants, initial: "hidden", animate: "visible", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center mb-20", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.h1, { variants: itemVariants, className: "text-6xl  text-gray-900 dark:text-white  mb-6", style: { fontWeight: 900 }, children: "Know Us!" }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.p, { variants: itemVariants, className: "text-xl  max-w-3xl mx-auto ", children: "Yes we are passionate developers building tools for the developer community!" }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { variants: itemVariants, className: "mt-12 relative", children: (0, jsx_runtime_1.jsx)("img", { src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1800&h=900&fit=crop", alt: "Our team working together", className: "rounded-[10px] shadow-lg mx-auto max-w-4xl w-full h-64 object-cover" }) })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.section, { variants: itemVariants, className: "grid md:grid-cols-4 gap-8 mb-20", children: [
                            { number: "2025", label: "Founded Incredibly" },
                            { number: "50K+", label: "Developers Wordwide" },
                            { number: "100+", label: "Countries Included" },
                            { number: "99.9%", label: "Uptime Guaranteed" }
                        ].map(function (stat, index) { return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { className: "text-center glass-card p-8 rounded-[10px]", whileHover: { y: -5 }, children: [(0, jsx_runtime_1.jsx)("div", { className: "text-4xl  text-black mb-2 dark:text-white", style: {
                                        fontWeight: 900
                                    }, children: stat.number }), (0, jsx_runtime_1.jsx)("div", { className: "text-gray-600 dark:text-gray-300  text-[15px] ", style: {
                                        fontWeight: 800
                                    }, children: stat.label })] }, index)); }) }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.section, { variants: itemVariants, className: "text-center mb-20", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-4xl text-gray-900 dark:text-white  mb-8", style: { fontWeight: 900 }, children: "Our Mission" }), (0, jsx_runtime_1.jsx)("p", { className: "text-lg max-w-4xl mx-auto  leading-relaxed", children: "To empower developers worldwide with cutting-edge tools and platforms that streamline the development process, enhance collaboration, and accelerate innovation in the tech industry." })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.section, { variants: itemVariants, children: (0, jsx_runtime_1.jsx)("div", { className: "grid md:grid-cols-2 gap-8", children: [
                                {
                                    icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Users, {}),
                                    title: "Community First",
                                    description: "We prioritize our developer community and build features based on real feedback.",
                                    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1800&h=900&fit=crop"
                                },
                                {
                                    icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Target, {}),
                                    title: "Innovation Driven",
                                    description: "We constantly push the boundaries of what's possible in developer tools.",
                                    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1800&h=900&fit=crop"
                                },
                                {
                                    icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Award, {}),
                                    title: "Quality Focused",
                                    description: "We maintain the highest standards in code quality, security, and performance.",
                                    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1800&h=900&fit=crop"
                                },
                                {
                                    icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Globe, {}),
                                    title: "Globally Accessible",
                                    description: "We ensure our platform is accessible to developers worldwide, regardless of location.",
                                    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1800&h=900&fit=crop"
                                }
                            ].map(function (value, index) { return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { className: "glass-card p-8 rounded-[10px] overflow-hidden", whileHover: { y: -5 }, children: [(0, jsx_runtime_1.jsx)("div", { className: "w-full h-48 mb-6 rounded-[10px] overflow-hidden", children: (0, jsx_runtime_1.jsx)("img", { src: value.image, alt: value.title, className: "w-full h-full object-cover hover:scale-105 transition-transform duration-300" }) }), (0, jsx_runtime_1.jsx)("div", { className: "w-[80px] h-[80px] bg-black rounded-[10px] flex items-center justify-center mb-6 dark:bg-white", children: (0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 text-white dark:text-black flex items-center justify-center", children: value.icon }) }), (0, jsx_runtime_1.jsx)("h3", { className: "text-xl  dark:text-white mb-4 ", children: value.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-[15px]   leading-relaxed", children: value.description })] }, index)); }) }) })] }), (0, jsx_runtime_1.jsx)(Footer_1.default, {})] }));
};
exports.default = About;
