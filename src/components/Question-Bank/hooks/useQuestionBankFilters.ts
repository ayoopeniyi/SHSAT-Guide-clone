import { useState, useEffect, useCallback } from "react";
import {
  createQuestionBankFilters,
  defaultQuestionBankFilters,
  type FilterState,
  type FilterDefinition,
} from "../filters";
import {
  fetchChapters,
  fetchTopics,
  fetchSubTopics,
  fetchPassages,
} from "../actions";
import {
  initializeFilterState,
  updateFilterValue,
  validateFilters,
  buildApiParams,
} from "../utils/filterUtils";
import type { Chapter, Passage } from "../actions/types";

export const useQuestionBankFilters = () => {
  // Core filter state
  const [filterState, setFilterState] = useState<FilterState>(() =>
    initializeFilterState(defaultQuestionBankFilters),
  );

  // Static data
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [filters, setFilters] = useState<FilterDefinition[]>([]);

  // Passage-specific state
  const [passageState, setPassageState] = useState({
    selectedPassage: "",
    passages: [] as Passage[],
    loading: false,
  });

  // Loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        /* console.log("🔍 [useQuestionBankFilters] Initializing filter data..."); */
        setInitialLoading(true);

        // Fetch chapters
        /* console.log("🔍 [useQuestionBankFilters] Fetching chapters..."); */
        const chaptersResult = await fetchChapters();
        /* console.log("🔍 [useQuestionBankFilters] Chapters result:", chaptersResult); */
        
        if (chaptersResult.success) {
          /* console.log("🔍 [useQuestionBankFilters] Setting chapters:", chaptersResult.data); */
          setChapters(chaptersResult.data);
          
          /* console.log("🔍 [useQuestionBankFilters] Creating filters..."); */
          const createdFilters = createQuestionBankFilters(chaptersResult.data);
          /* console.log("🔍 [useQuestionBankFilters] Created filters:", createdFilters); */
          setFilters(createdFilters);
        } else {
          console.error("🔍 [useQuestionBankFilters] Failed to fetch chapters:", chaptersResult.error);
        }

        // Fetch passages for the passage filter
        /* console.log("🔍 [useQuestionBankFilters] Fetching passages..."); */
        const passagesResult = await fetchPassages();
        if (passagesResult.success) {
          setPassageState((prev) => ({
            ...prev,
            passages: passagesResult.data,
            loading: false,
          }));
        } else {
          setPassageState((prev) => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error("🔍 [useQuestionBankFilters] Error initializing filter data:", error);
        setPassageState((prev) => ({ ...prev, loading: false }));
      } finally {
        setInitialLoading(false);
        /* console.log("🔍 [useQuestionBankFilters] Initialization completed"); */
      }
    };

    initializeData();
  }, []);

  // Cleanup loading states when filters change
  useEffect(() => {
    // Reset all loading states when filters are updated
    setFilterState((prevState) => ({
      ...prevState,
      loading: Object.keys(prevState.loading).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {} as Record<string, boolean>),
    }));
  }, [filters]);

  // Cleanup effect to reset loading states on unmount
  useEffect(() => {
    return () => {
      // Reset all loading states when component unmounts
      setFilterState((prevState) => ({
        ...prevState,
        loading: Object.keys(prevState.loading).reduce((acc, key) => {
          acc[key] = false;
          return acc;
        }, {} as Record<string, boolean>),
      }));
    };
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback(
    async (key: string, value: string) => {
      /* console.log("🔍 [useQuestionBankFilters] handleFilterChange called with key:", key, "value:", value); */
      /* console.log("🔍 [useQuestionBankFilters] Current filters:", filters); */
      /* console.log("🔍 [useQuestionBankFilters] Current chapters:", chapters); */
      
      setFilterState((prevState) => {
        const newState = updateFilterValue(prevState, key, value, filters);

        // Handle dependent dropdown loading
        // Find filters that depend on the current filter
        const dependentFilters = filters.filter((f) => f.dependsOn === key);
        /* console.log("🔍 [useQuestionBankFilters] Dependent filters found:", dependentFilters.map(f => f.key)); */
        
        if (dependentFilters.length > 0 && value) {
          /* console.log("🔍 [useQuestionBankFilters] Found dependent filters, processing them..."); */
          
          // Set loading state for dependent filters
          const loadingState = { ...newState.loading };
          dependentFilters.forEach((depFilter) => {
            loadingState[depFilter.key] = true;
          });

          // Clear dependent filter values when parent changes, but preserve options if they exist
          const updatedValues = { ...newState.values };
          const updatedDynamicOptions = { ...newState.dynamicOptions };
          
          dependentFilters.forEach((depFilter) => {
            // Clear the value but preserve options if they're already loaded
            updatedValues[depFilter.key] = "";
            // Only clear options if they don't exist or if this is a different parent value
            if (!updatedDynamicOptions[depFilter.key] || updatedDynamicOptions[depFilter.key].length === 0) {
              updatedDynamicOptions[depFilter.key] = [];
            }
          });

          // Process each dependent filter with timeout protection
          (async () => {
            for (const depFilter of dependentFilters) {
              if (depFilter.onSelectionChange) {
                // Check if options are already loaded for this parent value
                const existingOptions = updatedDynamicOptions[depFilter.key];
                
                // If options already exist and are not empty, don't reload them
                if (existingOptions && existingOptions.length > 0) {
                  /* console.log("🔍 [useQuestionBankFilters] Options already loaded for", depFilter.key, "with value", value); */
                  setFilterState((currentState) => ({
                    ...currentState,
                    loading: {
                      ...currentState.loading,
                      [depFilter.key]: false,
                    },
                    values: updatedValues, // Clear dependent values
                    errors: (() => {
                      const newErrors = { ...currentState.errors };
                      delete newErrors[depFilter.key];
                      return newErrors;
                    })(),
                  }));
                  continue;
                }
                
                // Set a fallback timeout to ensure loading state is reset
                const fallbackTimeout = setTimeout(() => {
                  console.warn("🔍 [useQuestionBankFilters] Fallback timeout triggered for", depFilter.key);
                  setFilterState((currentState) => ({
                    ...currentState,
                    loading: {
                      ...currentState.loading,
                      [depFilter.key]: false,
                    },
                    errors: {
                      ...currentState.errors,
                      [depFilter.key]: "Request timed out",
                    },
                  }));
                }, 15000); // 15 second fallback timeout
                
                try {
                  /* console.log("🔍 [useQuestionBankFilters] Loading options for dependent filter:", depFilter.key); */
                  
                  // Add timeout protection to prevent infinite loading
                  const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
                  });
                  
                  const optionsPromise = depFilter.onSelectionChange(value);
                  const options = await Promise.race([optionsPromise, timeoutPromise]);
                  
                  // Clear the fallback timeout since we got a response
                  clearTimeout(fallbackTimeout);
                  
                  /* console.log("🔍 [useQuestionBankFilters] Loaded options for", depFilter.key, ":", options); */
                  
                  setFilterState((currentState) => ({
                    ...currentState,
                    dynamicOptions: {
                      ...currentState.dynamicOptions,
                      [depFilter.key]: options as any,
                    },
                    loading: {
                      ...currentState.loading,
                      [depFilter.key]: false,
                    },
                    values: updatedValues, // Clear dependent values
                    errors: (() => {
                      const newErrors = { ...currentState.errors };
                      delete newErrors[depFilter.key];
                      return newErrors;
                    })(),
                  }));
                  
                  /* console.log("🔍 [useQuestionBankFilters] Successfully updated state for", depFilter.key); */
                } catch (error) {
                  // Clear the fallback timeout since we got an error
                  clearTimeout(fallbackTimeout);
                  
                  console.error("🔍 [useQuestionBankFilters] Error in onSelectionChange for", depFilter.key, ":", error);
                  setFilterState((currentState) => ({
                    ...currentState,
                    loading: {
                      ...currentState.loading,
                      [depFilter.key]: false,
                    },
                    dynamicOptions: {
                      ...currentState.dynamicOptions,
                      [depFilter.key]: [] as any,
                    },
                    errors: {
                      ...currentState.errors,
                      [depFilter.key]: error instanceof Error ? error.message : "Failed to load options",
                    },
                  }));
                }
              }
            }
          })();

          return { 
            ...newState, 
            loading: loadingState,
            values: updatedValues,
            dynamicOptions: updatedDynamicOptions
          };
        } else {
          /* console.log("🔍 [useQuestionBankFilters] No dependent filters found or no value"); */
        }

        return newState;
      });

      // Handle passage filter special case
      if (key === "passage_filter") {
        setPassageState((prev) => ({
          ...prev,
          selectedPassage: value,
        }));
      }
    },
    [filters, chapters],
  );

  // Handle passages fetch
  const handlePassagesFetch = useCallback(async () => {
    setPassageState((prev) => ({ ...prev, loading: true }));

    try {
      const result = await fetchPassages(true); // Force refresh
      if (result.success) {
        setPassageState((prev) => ({
          ...prev,
          passages: result.data,
          loading: false,
        }));
      } else {
        setPassageState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error fetching passages:", error);
      setPassageState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // Preload dependent options for current filter values
  const preloadDependentOptions = useCallback(async () => {
    /* console.log("🔍 [useQuestionBankFilters] Preloading dependent options for current filter values"); */
    
    // Find all dependent filters that have parent values but no loaded options
    const dependentFiltersToLoad = filters.filter((filter) => {
      if (filter.type !== "dependent-dropdown" || !filter.dependsOn) return false;
      
      const parentValue = filterState.values[filter.dependsOn];
      const hasOptions = filterState.dynamicOptions[filter.key] && filterState.dynamicOptions[filter.key].length > 0;
      
      return parentValue && !hasOptions;
    });

    /* console.log("🔍 [useQuestionBankFilters] Dependent filters to preload:", dependentFiltersToLoad.map(f => f.key)); */

    // Load options for each dependent filter
    for (const filter of dependentFiltersToLoad) {
      if (filter.onSelectionChange) {
        const parentValue = filterState.values[filter.dependsOn!];
        
        try {
          /* console.log("🔍 [useQuestionBankFilters] Preloading options for", filter.key, "with parent value", parentValue); */
          
          const options = await filter.onSelectionChange(parentValue);
          
          setFilterState((currentState) => ({
            ...currentState,
            dynamicOptions: {
              ...currentState.dynamicOptions,
              [filter.key]: options as any,
            },
          }));
          
          /* console.log("🔍 [useQuestionBankFilters] Successfully preloaded options for", filter.key); */
        } catch (error) {
          console.error("🔍 [useQuestionBankFilters] Error preloading options for", filter.key, ":", error);
        }
      }
    }
  }, [filterState.values, filterState.dynamicOptions, filters]);

  // Validate and apply filters
  const handleFilterApply = useCallback(
    async (
      onApply: (params: URLSearchParams) => void | Promise<void>,
      search: string = "",
      pagination = { page: 1, per_page: 20 },
    ) => {
      setApplying(true);

      try {
        // Validate filters first
        const validatedState = validateFilters(filterState, filters);
        setFilterState(validatedState);

        // If there are errors, don't apply
        if (Object.keys(validatedState.errors).length > 0) {
          setApplying(false);
          return;
        }

        // Preload dependent options before applying filters
        await preloadDependentOptions();

        // Build API parameters
        const params = buildApiParams(filterState.values, search, pagination);

        // Call the apply callback
        await onApply(params);
      } catch (error) {
        console.error("Error applying filters:", error);
      } finally {
        setApplying(false);
      }
    },
    [filterState.values, filters, preloadDependentOptions], // Only depend on the actual values, not the entire state object
  );

  // Clear all filters
  const handleFilterClear = useCallback(() => {
    setFilterState(initializeFilterState(defaultQuestionBankFilters));
    setPassageState((prev) => ({
      ...prev,
      selectedPassage: "",
    }));
  }, []);

  // Get current filter values for external use
  const getCurrentFilters = useCallback(() => {
    return filterState.values;
  }, [filterState.values]);

  // Check if filters have values
  const hasActiveFilters = useCallback(() => {
    return Object.values(filterState.values).some(
      (value) => value && value.trim() !== "",
    );
  }, [filterState.values]);

  // Ensure dependent options are loaded when filter modal is opened
  const ensureDependentOptionsLoaded = useCallback(async () => {
    /* console.log("🔍 [useQuestionBankFilters] Ensuring dependent options are loaded"); */
    await preloadDependentOptions();
  }, [preloadDependentOptions]);

  return {
    // State
    filterState,
    filters,
    passageState,
    chapters,

    // Loading states
    initialLoading,
    applying,

    // Handlers
    handleFilterChange,
    handleFilterApply,
    handleFilterClear,
    handlePassagesFetch,

    // Utilities
    getCurrentFilters,
    hasActiveFilters,
    ensureDependentOptionsLoaded,
  };
};