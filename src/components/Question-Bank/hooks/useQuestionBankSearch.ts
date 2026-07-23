import { useState, useEffect, useRef, useCallback } from 'react';

export const useQuestionBankSearch = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setSearchDebounced(searchInput);
    }, 300);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchInput]);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const handleSearchInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(searchInput);
    }
  }, [searchInput]);

  const clearSearch = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
    setSearchDebounced("");
  }, []);

  const applySearch = useCallback(() => {
    setSearchQuery(searchInput);
  }, [searchInput]);

  return {
    // State
    searchInput,
    searchQuery,
    searchDebounced,
    
    // Actions
    handleSearchInputChange,
    handleSearchInputKeyDown,
    clearSearch,
    applySearch,
  };
}; 