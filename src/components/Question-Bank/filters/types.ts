export type FilterType =
  | "text"
  | "dropdown"
  | "dependent-dropdown"
  | "passage-selector";

export interface FilterOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  metadata?: Record<string, any>;
}

export interface FilterValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null; // returns error message or null
}

export interface FilterDefinition {
  key: string;
  label: string;
  type: FilterType;
  placeholder?: string;
  options?: FilterOption[];
  dependsOn?: string;
  validation?: FilterValidation;
  onSelectionChange?: (value: string) => Promise<FilterOption[]>;
  metadata?: {
    apiEndpoint?: string;
    cacheKey?: string;
    optgroups?: boolean;
  };
}

export interface FilterValues {
  [key: string]: string;
}

export interface FilterErrors {
  [key: string]: string;
}

export interface FilterState {
  values: FilterValues;
  errors: FilterErrors;
  loading: Record<string, boolean>;
  dynamicOptions: Record<string, FilterOption[]>;
}

export interface FilterContainerProps {
  filters: FilterDefinition[];
  state: FilterState;
  onFilterChange: (key: string, value: string) => void;
  onFilterApply: () => void;
  onFilterClear: () => void;
  onClose?: () => void;
  loading?: boolean;
}

export interface FilterItemProps {
  filter: FilterDefinition;
  value: string;
  error?: string;
  options?: FilterOption[];
  disabled?: boolean;
  loading?: boolean;
  onChange: (value: string) => void;
}

// Passage-specific types
export interface PassageFilterState {
  selectedPassage: string;
  passages: Array<{
    id: number;
    topic_title: string;
    question_count: number;
  }>;
  loading: boolean;
}

export interface PassageFilterProps extends FilterItemProps {
  passageState: PassageFilterState;
  onPassagesFetch: () => void;
}
