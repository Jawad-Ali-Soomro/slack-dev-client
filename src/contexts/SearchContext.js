"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchProvider = exports.useSearch = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var SearchContext = (0, react_1.createContext)();
var useSearch = function () {
    var context = (0, react_1.useContext)(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};
exports.useSearch = useSearch;
var SearchProvider = function (_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(''), searchTerm = _b[0], setSearchTerm = _b[1];
    var _c = (0, react_1.useState)([]), searchResults = _c[0], setSearchResults = _c[1];
    var _d = (0, react_1.useState)(false), isSearching = _d[0], setIsSearching = _d[1];
    var handleSearch = function (term) {
        setSearchTerm(term);
        setIsSearching(true);
        // Search logic will be handled by individual components
    };
    var clearSearch = function () {
        setSearchTerm('');
        setSearchResults([]);
        setIsSearching(false);
    };
    var value = {
        searchTerm: searchTerm,
        setSearchTerm: setSearchTerm,
        searchResults: searchResults,
        setSearchResults: setSearchResults,
        isSearching: isSearching,
        setIsSearching: setIsSearching,
        handleSearch: handleSearch,
        clearSearch: clearSearch
    };
    return ((0, jsx_runtime_1.jsx)(SearchContext.Provider, { value: value, children: children }));
};
exports.SearchProvider = SearchProvider;
