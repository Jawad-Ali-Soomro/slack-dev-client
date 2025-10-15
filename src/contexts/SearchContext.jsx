import React, { createContext, useContext, useState } from 'react'

const SearchContext = createContext()

export const useSearch = () => {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (term) => {
    setSearchTerm(term)
    setIsSearching(true)
    // Search logic will be handled by individual components
  }

  const clearSearch = () => {
    setSearchTerm('')
    setSearchResults([])
    setIsSearching(false)
  }

  const value = {
    searchTerm,
    setSearchTerm,
    searchResults,
    setSearchResults,
    isSearching,
    setIsSearching,
    handleSearch,
    clearSearch
  }

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}

