import { X } from "lucide-react";
import { FilterItem } from "./FilterItem";
import { PassageFilterItem } from "./PassageFilterItem";
import type { FilterContainerProps, PassageFilterState } from "./types";

interface FilterContainerExtendedProps extends FilterContainerProps {
  passageState: PassageFilterState;
  onPassagesFetch: () => void;
}
export const FilterContainer: React.FC<FilterContainerExtendedProps> = ({
  filters,
  state,
  onFilterChange,
  onFilterApply,
  onFilterClear,
  onClose,
  loading = false,
  passageState,
  onPassagesFetch,
}) => {
  const { values, errors, dynamicOptions } = state;

  const handleFilterChange = (key: string, value: string) => {
    /* console.log("🔍 [FilterContainer] handleFilterChange called with key:", key, "value:", value); */
    onFilterChange(key, value);
  };

  const isFilterDisabled = (filter: any) => {
    if (!filter.dependsOn) return false;

    const dependentValue = values[filter.dependsOn];
    return !dependentValue || dependentValue === "";
  };

  const getFilterOptions = (filter: any) => {
    // For dependent dropdowns, use dynamic options
    if (filter.type === "dependent-dropdown") {
      return dynamicOptions[filter.key] || [];
    }

    // For regular dropdowns, use static options
    return filter.options || [];
  };

  const renderFilter = (filter: any) => {
    const commonProps = {
      filter,
      value: values[filter.key] || "",
      error: errors[filter.key],
      disabled: isFilterDisabled(filter),
      loading: state.loading[filter.key] || false,
      onChange: (value: string) => handleFilterChange(filter.key, value),
    };

    if (filter.type === "passage-selector") {
      return (
        <PassageFilterItem
          key={filter.key}
          {...commonProps}
          passageState={passageState}
          onPassagesFetch={onPassagesFetch}
        />
      );
    }

    return (
      <FilterItem
        key={filter.key}
        {...commonProps}
        options={getFilterOptions(filter)}
      />
    );
  };

  const hasErrors = Object.keys(errors).length > 0;
  const hasValues = Object.values(values).some((value) => value !== "");

  return (
    <div className="w-56 flex-shrink-0 mb-8 sticky top-24">
      <div className="bg-white rounded-lg shadow-sm p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-4">
          {filters.map((filter) => renderFilter(filter))}
        </div>

        {/* Error Summary */}
        {hasErrors && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">
                Please fix the following errors:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(errors).map(([key, error]) => (
                  <li key={key} className="text-xs">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 space-y-2">
          <button
            className="w-full py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onFilterClear}
            disabled={loading || (!hasValues && !hasErrors)}
          >
            Clear All Filters
          </button>

          <button
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onFilterApply}
            disabled={loading || hasErrors}
          >
            {loading ? "Applying..." : "Apply Filters"}
          </button>
        </div>

        {/* Filter Status */}
        {hasValues && (
          <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            <div className="font-medium mb-1">Active Filters:</div>
            <div className="space-y-1">
              {Object.entries(values)
                .filter(([_, value]) => value !== "")
                .map(([key, value]) => {
                  const filter = filters.find((f) => f.key === key);
                  const displayValue =
                    filter?.type === "dropdown" ||
                    filter?.type === "dependent-dropdown"
                      ? getFilterOptions(filter).find(
                          (opt: any) => opt.value.toString() === value,
                        )?.label || value
                      : value;

                  return (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium">{filter?.label}:</span>
                      <span className="truncate ml-2">{displayValue}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
