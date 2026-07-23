import { Loader2 } from "lucide-react";
import type { PassageFilterProps } from "./types";

export const PassageFilterItem: React.FC<PassageFilterProps> = ({
  filter,
  value,
  error,
  disabled = false,
  loading = false,
  onChange,
  passageState,
  onPassagesFetch,
}) => {
  const { selectedPassage, passages, loading: passageLoading } = passageState;

  const handleChange = (newValue: string) => {
    onChange(newValue);

    // Trigger passage fetch if a specific passage is selected
    if (
      newValue &&
      newValue !== "yes" &&
      newValue !== "no" &&
      newValue !== ""
    ) {
      onPassagesFetch();
    }
  };

  const getSelectedPassageInfo = () => {
    if (
      !selectedPassage ||
      selectedPassage === "yes" ||
      selectedPassage === "no"
    ) {
      return null;
    }

    const passage = passages.find((p) => p.id === parseInt(selectedPassage));
    return passage;
  };

  const selectedPassageInfo = getSelectedPassageInfo();

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600">
        {filter.label}
        {filter.validation?.required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      <div className="relative">
        <select
          className={`w-full border rounded px-2 py-1 text-sm ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
          value={value}
          disabled={disabled || loading || passageLoading}
          onChange={(e) => handleChange(e.target.value)}
        >
          <option value="">Any</option>
          <option value="yes">Yes (Has Passage)</option>
          <option value="no">No (No Passage)</option>

          {passages.length > 0 && (
            <optgroup label="Specific Passages">
              {passages.map((passage) => (
                <option key={passage.id} value={passage.id.toString()}>
                  {selectedPassage === passage.id.toString() ? "✓ " : ""}
                  Passage #{passage.id} - {passage.topic_title || "No Topic"} (
                  {passage.question_count || 0} questions)
                </option>
              ))}
            </optgroup>
          )}
        </select>

        {(loading || passageLoading) && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Selected passage info */}
      {selectedPassageInfo && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
          <strong>Selected:</strong> Passage #{selectedPassageInfo.id} -{" "}
          {selectedPassageInfo.topic_title || "No Topic"}
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

      {passageLoading && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Loading passages...</span>
        </div>
      )}
    </div>
  );
};
