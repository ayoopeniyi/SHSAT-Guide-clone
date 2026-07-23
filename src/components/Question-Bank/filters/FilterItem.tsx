import React from "react";
import { Loader2 } from "lucide-react";
import type { FilterItemProps } from "./types";

export const FilterItem: React.FC<FilterItemProps> = ({
  filter,
  value,
  error,
  options = [],
  disabled = false,
  loading = false,
  onChange,
}) => {
  const handleChange = (newValue: string) => {
    /* console.log("🔍 [FilterItem] handleChange called with value:", newValue, "for filter:", filter.key); */
    onChange(newValue);
  };

  const renderInput = () => {
    if (filter.type === "dropdown" || filter.type === "dependent-dropdown") {
      return (
        <div className="relative">
          <select
            className={`w-full border rounded px-2 py-1 text-sm ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
            value={value}
            disabled={disabled || loading}
            onChange={(e) => handleChange(e.target.value)}
          >
            <option value="">Any</option>
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          {loading && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
      );
    }

    // Text input
    return (
      <input
        type="text"
        className={`w-full border rounded px-2 py-1 text-sm ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
        placeholder={
          filter.placeholder || `Enter ${filter.label.toLowerCase()}`
        }
        value={value}
        disabled={disabled || loading}
        onChange={(e) => handleChange(e.target.value)}
      />
    );
  };

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600">
        {filter.label}
        {filter.validation?.required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      {renderInput()}

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

      {loading &&
        filter.type !== "dropdown" &&
        filter.type !== "dependent-dropdown" && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Loading...</span>
          </div>
        )}
    </div>
  );
};
