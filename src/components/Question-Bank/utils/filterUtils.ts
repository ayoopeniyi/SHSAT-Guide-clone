import type {
  FilterValues,
  FilterState,
  FilterDefinition,
} from "../filters/types";
import {
  validateAllFilters,
  transformPassageFilterToParams,
} from "../filters/questionBankFilters";

// Initialize filter state
export const initializeFilterState = (
  defaultValues: FilterValues = {},
  filters: FilterDefinition[] = [],
): FilterState => {
  return {
    values: { ...defaultValues },
    errors: {},
    loading: {},
    dynamicOptions: {},
  };
};

// Update filter value and handle dependencies
export const updateFilterValue = (
  state: FilterState,
  key: string,
  value: string,
  filters: FilterDefinition[],
): FilterState => {
  const newValues = { ...state.values, [key]: value };

  // Clear dependent filters when parent changes
  const filter = filters.find((f) => f.key === key);
  if (filter) {
    const dependentFilters = filters.filter((f) => f.dependsOn === key);
    dependentFilters.forEach((depFilter) => {
      newValues[depFilter.key] = "";
      delete state.dynamicOptions[depFilter.key];
    });
  }

  // Clear error for this field
  const newErrors = { ...state.errors };
  delete newErrors[key];

  return {
    ...state,
    values: newValues,
    errors: newErrors,
  };
};

// Validate all filters
export const validateFilters = (
  state: FilterState,
  filters: FilterDefinition[],
): FilterState => {
  const errors = validateAllFilters(state.values, filters);

  return {
    ...state,
    errors,
  };
};

// Transform filter values to API parameters
export const transformFiltersToApiParams = (
  values: FilterValues,
): Record<string, string | number> => {
  const params: Record<string, string | number> = {};

  Object.entries(values).forEach(([key, value]) => {
    if (value && value.trim() !== "") {
      if (key === "passage_filter") {
        // Handle special passage filter transformation
        const passageParams = transformPassageFilterToParams(value);
        Object.entries(passageParams).forEach(([pKey, pValue]) => {
          if (pValue !== null) {
            params[pKey] = pValue;
          }
        });
      } else if (key === "isActive") {
        params.is_active = value;
      } else {
        params[key] = value;
      }
    }
  });

  return params;
};

// Transform question type for API
export const transformQuestionTypeForApi = (
  questionType: string,
): Record<string, string> => {
  const params: Record<string, string> = {};

  if (!questionType) return params;

  // Handle MC variants
  if (questionType === "MC_FULL") {
    params.question_type = "MC";
    // Do not set question_subtype, so all MC variants are included
  } else if (questionType === "MC_STANDARD") {
    params.question_subtype = "standard";
    params.question_type = "MC";
  } else if (questionType === "MC_DRAG_DROP") {
    params.question_subtype = "drag_drop";
    params.question_type = "MC";
  }
  // Handle DND variants
  else if (questionType === "DND_SINGLE") {
    params.question_subtype = "two_buckets_single";
    params.question_type = "DND";
  } else if (questionType === "DND_MULTI") {
    params.question_subtype = "two_buckets_multi";
    params.question_type = "DND";
  } else if (questionType === "DND_ONE_BUCKET_MULTI") {
    params.question_subtype = "one_bucket_multi";
    params.question_type = "DND";
  } else if (questionType === "DND_ONE_BUCKET_SINGLE") {
    params.question_subtype = "one_bucket_single";
    params.question_type = "DND";
  } else if (questionType === "DND_TABLE" || questionType === "TABLE_DND") {
    params.question_subtype = "table_dnd";
    params.question_type = "DND";
  }
  // Handle BLANK variants
  else if (questionType === "BLANK") {
    params.question_type = "BLANK";
  } else if (questionType === "BLANK_FILL_BOX") {
    params.question_subtype = "fill_box";
    params.question_type = "BLANK";
  }
  // Handle TABLE_GRID variants
  else if (questionType === "TABLE_GRID_SINGLE") {
    params.question_subtype = "single";
    params.question_type = "TABLE_GRID";
  } else if (questionType === "TABLE_GRID_MULTI") {
    params.question_subtype = "multiple";
    params.question_type = "TABLE_GRID";
  }
  // Default case
  else {
    params.question_type = questionType;
  }

  return params;
};

// Build complete API parameters
export const buildApiParams = (
  values: FilterValues,
  search: string = "",
  pagination: { page: number; per_page: number } = { page: 1, per_page: 20 },
): URLSearchParams => {
  const params = new URLSearchParams();

  // Add pagination
  params.append("page", pagination.page.toString());
  params.append("per_page", pagination.per_page.toString());

  // Add sorting
  params.append("sort_by", "updated_at");
  params.append("sort_order", "desc");

  // Add search
  if (search.trim()) {
    params.append("search", search.trim());
  }

  // Transform and add filters
  const filterParams = transformFiltersToApiParams(values);

  Object.entries(filterParams).forEach(([key, value]) => {
    // Skip empty values
    if (value === null || value === undefined || value === "") {
      return;
    }

    if (key === "question_type") {
      // Handle special question type transformation
      const questionTypeParams = transformQuestionTypeForApi(value as string);
      Object.entries(questionTypeParams).forEach(([qtKey, qtValue]) => {
        if (qtValue !== null && qtValue !== undefined && qtValue !== "") {
          params.append(qtKey, qtValue);
        }
      });
    } else {
      params.append(key, value.toString());
    }
  });

  return params;
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// URL synchronization helpers
export const filtersToUrlParams = (values: FilterValues): URLSearchParams => {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value && value.trim() !== "") {
      params.append(key, value);
    }
  });

  return params;
};

export const urlParamsToFilters = (
  searchParams: URLSearchParams,
  defaultValues: FilterValues,
): FilterValues => {
  const values = { ...defaultValues };

  for (const [key, value] of searchParams.entries()) {
    if (key in values) {
      values[key] = value;
    }
  }

  return values;
};

// Filter comparison utility
export const areFiltersEqual = (
  filters1: FilterValues,
  filters2: FilterValues,
): boolean => {
  const keys1 = Object.keys(filters1);
  const keys2 = Object.keys(filters2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every((key) => filters1[key] === filters2[key]);
};

// Get active filters count
export const getActiveFiltersCount = (values: FilterValues): number => {
  return Object.values(values).filter((value) => value && value.trim() !== "")
    .length;
};

// Clear dependent filters
export const clearDependentFilters = (
  values: FilterValues,
  changedKey: string,
  filters: FilterDefinition[],
): FilterValues => {
  const newValues = { ...values };

  const clearDependents = (key: string) => {
    const dependentFilters = filters.filter((f) => f.dependsOn === key);
    dependentFilters.forEach((depFilter) => {
      newValues[depFilter.key] = "";
      clearDependents(depFilter.key); // Recursively clear nested dependencies
    });
  };

  clearDependents(changedKey);
  return newValues;
};
