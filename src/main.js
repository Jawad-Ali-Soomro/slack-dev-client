"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var client_1 = require("react-dom/client");
require("./index.css");
var App_jsx_1 = require("./App.jsx");
var ThemeContext_jsx_1 = require("./contexts/ThemeContext.jsx");
(0, client_1.createRoot)(document.getElementById('root')).render(
// <StrictMode>
(0, jsx_runtime_1.jsx)(ThemeContext_jsx_1.ThemeProvider, { children: (0, jsx_runtime_1.jsx)(App_jsx_1.default, {}) })
// </StrictMode>,
);
