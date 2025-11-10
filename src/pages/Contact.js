"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var Header_1 = require("../components/Header");
var Footer_1 = require("../components/Footer");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var Contact = function () {
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center relative pt-30 overflow-hidden bg-gray-50 dark:bg-black min-h-screen", children: [(0, jsx_runtime_1.jsx)(Header_1.default, {}), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.main, { className: "container mx-auto px-6 py-20", variants: containerVariants, initial: "hidden", animate: "visible", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center mb-20", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.h1, { variants: itemVariants, className: "text-6xl  text-gray-900 dark:text-white  mb-6", style: { fontWeight: 900 }, children: "Contact Us" }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.p, { variants: itemVariants, className: "text-xl max-w-3xl mx-auto ", children: "Get in touch with our team for support, partnerships, or questions" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid lg:grid-cols-2 gap-12", children: [(0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { variants: itemVariants, children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-3xl text-gray-900 dark:text-white  mb-8", style: { fontWeight: 600 }, children: "Get in Touch" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-6", children: [
                                            {
                                                icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Mail, {}),
                                                title: "Email",
                                                info: "hello@corestack.dev"
                                            },
                                            {
                                                icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Phone, {}),
                                                title: "Phone",
                                                info: "+1 (555) 123-4567"
                                            },
                                            {
                                                icon: (0, jsx_runtime_1.jsx)(lucide_react_1.MapPin, {}),
                                                title: "Address",
                                                info: "123 Tech Street, San Francisco, CA 94105"
                                            }
                                        ].map(function (contact, index) { return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { className: "glass-card p-6 rounded-[10px] flex items-center space-x-4", whileHover: { y: -5 }, children: [(0, jsx_runtime_1.jsx)("div", { className: "w-[60px] h-[60px] bg-black rounded-[10px] flex items-center justify-center dark:bg-white", children: (0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 text-white dark:text-black flex items-center justify-center", children: contact.icon }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg  text-gray-600 dark:text-white ", style: { fontWeight: 700 }, children: contact.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm  text-gray-600 dark:text-gray-300 ", children: contact.info })] })] }, index)); }) })] }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { variants: itemVariants, children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-3xl text-gray-900 dark:text-white  mb-8", style: { fontWeight: 600 }, children: "Send Message" }), (0, jsx_runtime_1.jsxs)("form", { className: "space-y-6", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Your Name", className: "w-full p-4 glass-card rounded-[10px] border-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400   text-sm" }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("input", { type: "email", placeholder: "Your Email", className: "w-full p-4 glass-card rounded-[10px] border-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400   text-sm" }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Subject", className: "w-full p-4 glass-card rounded-[10px] border-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400   text-sm" }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("textarea", { rows: 6, placeholder: "Your Message", className: "w-full p-4 glass-card rounded-[10px] border-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400   text-sm resize-none" }) }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.button, { type: "submit", className: "w-full p-4 bg-black text-white rounded-[10px]  text-sm  hover:bg-black transition-colors flex items-center justify-center space-x-2 dark:bg-white dark:text-black dark:hover:bg-gray-200", whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Send, { className: "w-5 h-5 icon" }), (0, jsx_runtime_1.jsx)("span", { children: "Send Message" })] })] })] })] })] }), (0, jsx_runtime_1.jsx)(Footer_1.default, {})] }));
};
exports.default = Contact;
