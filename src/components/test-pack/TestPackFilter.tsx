import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Test {
  id: number;
  name: string;
  test_description?: string;
  default_test_text?: string;
  created_at: string;
  updated_at: string;
  root_test_id?: number | null;
}

export interface FilterState {
  selectedTestId: number | null;
  questionType: string | null;
  questionNumber: string | null;
  hasPassage: string | null;
  isActive?: string | null; // Added for Active filter
}

interface TestPackFilterProps {
  availableTests: Test[];
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
  initialSelectedTestId?: number | null;
  questionType?: string | null;
  questionNumber?: string | null;
  hasPassage?: string | null;
}

const TestPackFilter: React.FC<TestPackFilterProps> = ({
  availableTests,
  onFilterChange,
  onClearFilters,
  isLoading = false,
  initialSelectedTestId = null,
  questionType = null,
  questionNumber = null,
  hasPassage = null,
}) => {
  // Current applied filters
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    selectedTestId: initialSelectedTestId,
    questionType: questionType,
    questionNumber: questionNumber,
    hasPassage: hasPassage,
  });

  // Pending filters (what user is currently setting)
  const [pendingFilters, setPendingFilters] = useState<FilterState>({
    selectedTestId: initialSelectedTestId,
    questionType: questionType,
    questionNumber: questionNumber,
    hasPassage: hasPassage,
  });

  const [isPending, setIsPending] = useState(false);

  // Update filters when initialSelectedTestId changes (e.g., when tests are loaded)
  useEffect(() => {
    if (
      initialSelectedTestId !== null &&
      initialSelectedTestId !== appliedFilters.selectedTestId
    ) {
      const newFilters = {
        selectedTestId: initialSelectedTestId,
        questionType: questionType,
        questionNumber: questionNumber,
        hasPassage: hasPassage,
      };
      setAppliedFilters(newFilters);
      setPendingFilters(newFilters);
    }
  }, [
    initialSelectedTestId,
    appliedFilters.selectedTestId,
    questionType,
    questionNumber,
    hasPassage,
  ]);

  const handleApplyFilters = () => {
    setIsPending(true);
    setAppliedFilters(pendingFilters);
    onFilterChange(pendingFilters);
    setTimeout(() => setIsPending(false), 500); // Reset pending state after brief delay
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {
      selectedTestId: null,
      questionType: null,
      questionNumber: null,
      hasPassage: null,
    };
    setPendingFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    onClearFilters();
  };

  // Calculate filter width - only 1 field now, so smaller width
  const filterWidth = 280; // Increased for better sidebar usability

  return (
    <div
      className="bg-white border-r border-gray-200 p-4 h-fit"
      style={{ width: `${filterWidth}px` }}
    >
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900 mb-4">Filters</h3>

        {/* Test Selection */}
        <div className="space-y-2">
          <Label htmlFor="test-select">Select Test</Label>
          <Select
            value={pendingFilters.selectedTestId?.toString() || ""}
            onValueChange={(value: string) =>
              setPendingFilters((prev) => ({
                ...prev,
                selectedTestId: value ? parseInt(value) : null,
              }))
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a test" />
            </SelectTrigger>
            <SelectContent>
              {availableTests.map((test) => (
                <SelectItem key={test.id} value={test.id.toString()}>
                  {test.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Question Type
            </label>
            <select
              className="w-full border rounded px-2 py-1"
              value={pendingFilters.questionType || ""}
              onChange={(e) =>
                setPendingFilters((prev) => ({
                  ...prev,
                  questionType: e.target.value || null,
                }))
              }
            >
              <option value="">Any</option>
              <option value="MC_STANDARD">MC - Standard</option>
              <option value="MC_DRAG_DROP">MC - Drag & Drop</option>
              <option value="MC_FULL">MC Full</option>
              <option value="MA">Multi-Answer</option>
              <option value="TF">True/False</option>
              <option value="GI">Grid-In</option>
              <option value="BLANK">Blank</option>
              <option value="BLANK_FILL_BOX">Blank Box</option>
              <option value="RC">RC</option>
              <option value="HOT_TEXT">Hot Text</option>
              <option value="TABLE_GRID_SINGLE">Table Grid - Single Select</option>
              <option value="TABLE_GRID_MULTI">Table Grid - Multi Select</option>
              <option value="RAY_SELECTOR">Ray Selector</option>
              <option value="GRAPH_SELECTOR">Graph Selector</option>
              <option value="EQUATION_CALCULATOR">Equation Calculator</option>
              <option value="DND_SINGLE">DND (Single Assignment)</option>
              <option value="DND_MULTI">DND (Multi Assignment)</option>
              <option value="DND_ONE_BUCKET_MULTI">DND (One Bucket, Multi-Select)</option>
              <option value="DND_ONE_BUCKET_SINGLE">DND (One Bucket, Single-Select)</option>
              <option value="DND_TABLE">DND (Table/Grid)</option>
              {/* <option value="TABLE_DND">Table DND</option> */}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Question Number
            </label>
            <input
              type="text"
              value={pendingFilters.questionNumber || ""}
              onChange={(e) =>
                setPendingFilters((prev) => ({
                  ...prev,
                  questionNumber: e.target.value || null,
                }))
              }
              placeholder="Type here..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Has Passage?
            </label>
            <select
              className="w-full border rounded px-2 py-1"
              value={pendingFilters.hasPassage?.toString() || ""}
              onChange={(e) =>
                setPendingFilters((prev) => ({
                  ...prev,
                  hasPassage: e.target.value || null,
                }))
              }
            >
              <option value="any">Any</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Active?
            </label>
            <select
              className="w-full border rounded px-2 py-1"
              value={pendingFilters.isActive || ""}
              onChange={(e) =>
                setPendingFilters((prev) => ({
                  ...prev,
                  isActive: e.target.value || null,
                }))
              }
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <Button
            onClick={handleApplyFilters}
            className="w-full"
            disabled={isLoading || isPending}
          >
            {isPending ? "Applying..." : "Go"}
          </Button>
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="w-full"
            disabled={isLoading}
          >
            Clear All Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestPackFilter;
