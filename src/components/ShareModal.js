"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var button_1 = require("./ui/button");
var input_1 = require("./ui/input");
var sonner_1 = require("sonner");
var bs_1 = require("react-icons/bs");
var ShareModal = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, postId = _a.postId, postTitle = _a.postTitle, postDescription = _a.postDescription;
    var _b = (0, react_1.useState)(''), postUrl = _b[0], setPostUrl = _b[1];
    (0, react_1.useEffect)(function () {
        if (isOpen && postId) {
            var url = "".concat(window.location.origin, "/post/").concat(postId);
            setPostUrl(url);
        }
    }, [isOpen, postId]);
    var handleCopyLink = function () {
        navigator.clipboard.writeText(postUrl)
            .then(function () { return sonner_1.toast.success('Link copied to clipboard!'); })
            .catch(function () { return sonner_1.toast.error('Failed to copy link.'); });
    };
    var shareOnTwitter = function () {
        var text = encodeURIComponent("".concat(postTitle || 'Check out this post!', ": ").concat(postDescription || ''));
        window.open("https://twitter.com/intent/tweet?url=".concat(encodeURIComponent(postUrl), "&text=").concat(text), '_blank');
    };
    var shareOnFacebook = function () {
        window.open("https://www.facebook.com/sharer/sharer.php?u=".concat(encodeURIComponent(postUrl)), '_blank');
    };
    var shareOnWhatsapp = function () {
        var text = encodeURIComponent("".concat(postTitle || 'Check out this post!', ": ").concat(postDescription || '', " ").concat(postUrl));
        window.open("https://api.whatsapp.com/send?text=".concat(text), '_blank');
    };
    var shareViaEmail = function () {
        var subject = encodeURIComponent("Check out this post: ".concat(postTitle || ''));
        var body = encodeURIComponent("".concat(postDescription || '', "\n\nRead more here: ").concat(postUrl));
        window.open("mailto:?subject=".concat(subject, "&body=").concat(body), '_blank');
    };
    if (!isOpen)
        return null;
    return ((0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { children: isOpen && ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50", onClick: onClose, children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: "bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-md w-full p-6", onClick: function (e) { return e.stopPropagation(); }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl  text-gray-900 dark:text-white", children: "Share Post" }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-6 h-6" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)(input_1.Input, { type: "text", value: postUrl, readOnly: true, className: "flex-1 h-12 rounded-[10px]" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleCopyLink, className: "h-12 rounded-[10px] w-12", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Link, { className: "w-4 h-4 icon " }) })] }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: shareOnTwitter, className: "h-12 rounded-[10px] flex items-center justify-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Twitter, { className: "w-5 h-5 icon text-blue-400" }), "Twitter"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: shareOnFacebook, className: "h-12 rounded-[10px] flex items-center justify-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Facebook, { className: "w-5 h-5 icon text-blue-600" }), "Facebook"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: shareOnWhatsapp, className: "h-12 rounded-[10px] flex items-center justify-center gap-2", children: [(0, jsx_runtime_1.jsx)(bs_1.BsWhatsapp, { className: "w-5 h-5 icon text-green-500" }), "WhatsApp"] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: shareViaEmail, className: "h-12 rounded-[10px] flex items-center justify-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Mail, { className: "w-5 h-5 icon text-gray-500" }), "Email"] })] }) })] })] }) })) }));
};
exports.default = ShareModal;
