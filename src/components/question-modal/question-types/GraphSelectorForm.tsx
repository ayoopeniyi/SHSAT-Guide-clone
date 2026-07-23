import React from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Checkbox } from "../../ui/checkbox";
import { Button } from "../../ui/button";
import { GraphSelectorInteractivePreview } from "../graph-selector/GraphSelectorInteractivePreview";
import { HierarchySection } from "../components/HierarchySection";
import { ChoiceTagEditor, TagSlot } from "../../shared/ChoiceTagEditor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../../ui/dialog";
import { Tags, X } from "lucide-react";

interface GraphSelectorPoint {
  x: number;
  y: number;
  is_correct: boolean;
  point_label?: string;
}

interface GraphSelectorFormProps {
  graphPrompt: string;
  setGraphPrompt: (value: string) => void;
  xMin: string;
  setXMin: (value: string) => void;
  xMax: string;
  setXMax: (value: string) => void;
  yMin: string;
  setYMin: (value: string) => void;
  yMax: string;
  setYMax: (value: string) => void;
  gridInterval: string;
  setGridInterval: (value: string) => void;
  maxSelectablePoints: string;
  setMaxSelectablePoints: (value: string) => void;
  showAxes: boolean;
  setShowAxes: (value: boolean) => void;
  showLabels: boolean;
  setShowLabels: (value: boolean) => void;
  snapToGrid: boolean;
  setSnapToGrid: (value: boolean) => void;
  graphInstruction: string;
  setGraphInstruction: (value: string) => void;
  availablePoints: GraphSelectorPoint[];
  setAvailablePoints: (points: GraphSelectorPoint[]) => void;
  correctPoints: GraphSelectorPoint[];
  setCorrectPoints: (points: GraphSelectorPoint[]) => void;
  graphExplanation: string;
  setGraphExplanation: (value: string) => void;
  graphSelectorValid: boolean;
  xAxisLabel: string;
  setXAxisLabel: (value: string) => void;
  yAxisLabel: string;
  setYAxisLabel: (value: string) => void;
  graphDifficulty?: number;
  setGraphDifficulty?: (value: number) => void;
  isTestPack?: boolean;
  // Hierarchy fields
  graphChapter?: number;
  setGraphChapter?: (value: number | undefined) => void;
  graphTopic?: number;
  setGraphTopic?: (value: number | undefined) => void;
  graphSubTopic?: number;
  setGraphSubTopic?: (value: number | undefined) => void;
  graphQuestionCategory?: string;
  setGraphQuestionCategory?: (value: string) => void;
  // Tagging
  pointTagSlots: Record<string, TagSlot[]>;
  setPointTagSlots: React.Dispatch<React.SetStateAction<Record<string, TagSlot[]>>>;
}

export const GraphSelectorForm: React.FC<GraphSelectorFormProps> = ({
  graphPrompt,
  setGraphPrompt,
  xMin,
  setXMin,
  xMax,
  setXMax,
  yMin,
  setYMin,
  yMax,
  setYMax,
  gridInterval,
  setGridInterval,
  maxSelectablePoints,
  setMaxSelectablePoints,
  showAxes,
  setShowAxes,
  showLabels,
  setShowLabels,
  snapToGrid,
  setSnapToGrid,
  graphInstruction,
  setGraphInstruction,
  availablePoints,
  setAvailablePoints,
  correctPoints,
  setCorrectPoints,
  graphExplanation,
  setGraphExplanation,
  graphSelectorValid,
  xAxisLabel,
  setXAxisLabel,
  yAxisLabel,
  setYAxisLabel,
  graphDifficulty,
  setGraphDifficulty,
  isTestPack,
  // Hierarchy fields
  graphChapter,
  setGraphChapter,
  graphTopic,
  setGraphTopic,
  graphSubTopic,
  setGraphSubTopic,
  graphQuestionCategory,
  setGraphQuestionCategory,
  pointTagSlots,
  setPointTagSlots,
}) => {
  // Add a new point to available points
  const addNewPoint = () => {
    const newPoint: GraphSelectorPoint = {
      x: 0,
      y: 0,
      is_correct: false,
      point_label: "",
    };
    setAvailablePoints([...availablePoints, newPoint]);
  };

  // Update a specific point
  const updatePoint = (
    index: number,
    field: keyof GraphSelectorPoint,
    value: any,
  ) => {
    const updatedPoints = [...availablePoints];
    updatedPoints[index] = { ...updatedPoints[index], [field]: value };
    setAvailablePoints(updatedPoints);

    // Update correct points if this point is marked as correct
    if (field === "is_correct" || field === "x" || field === "y") {
      const newCorrectPoints = updatedPoints.filter((p) => p.is_correct);
      setCorrectPoints(newCorrectPoints);
    }
  };

  // Remove a point
  const removePoint = (index: number) => {
    const updatedPoints = availablePoints.filter((_, i) => i !== index);
    setAvailablePoints(updatedPoints);

    // Update correct points
    const newCorrectPoints = updatedPoints.filter((p) => p.is_correct);
    setCorrectPoints(newCorrectPoints);
  };

  return (
    <div className="space-y-6">
      {/* Basic Question Info */}
      <div>
        <Label>Question Prompt</Label>
        <Textarea
          value={graphPrompt}
          onChange={(e) => setGraphPrompt(e.target.value)}
          placeholder="Enter the question prompt (e.g., 'Select all points that satisfy y = 2x + 1')"
          rows={3}
        />
      </div>

      <div>
        <Label>Graph Instructions (optional)</Label>
        <Input
          value={graphInstruction}
          onChange={(e) => setGraphInstruction(e.target.value)}
          placeholder="Additional instructions for students (e.g., 'Click on the coordinate plane to select points')"
        />
      </div>

      {/* Graph Configuration */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Graph Configuration</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>X Min</Label>
            <Input
              type="number"
              value={xMin}
              onChange={(e) => setXMin(e.target.value)}
              placeholder="e.g. -5"
            />
          </div>
          <div>
            <Label>X Max</Label>
            <Input
              type="number"
              value={xMax}
              onChange={(e) => setXMax(e.target.value)}
              placeholder="e.g. 5"
            />
          </div>
          <div>
            <Label>Y Min</Label>
            <Input
              type="number"
              value={yMin}
              onChange={(e) => setYMin(e.target.value)}
              placeholder="e.g. -5"
            />
          </div>
          <div>
            <Label>Y Max</Label>
            <Input
              type="number"
              value={yMax}
              onChange={(e) => setYMax(e.target.value)}
              placeholder="e.g. 5"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Grid Interval</Label>
            <Input
              type="number"
              step="any"
              value={gridInterval}
              onChange={(e) => setGridInterval(e.target.value)}
              placeholder="e.g. 1"
            />
          </div>
          <div>
            <Label>Max Selectable Points (optional)</Label>
            <Input
              type="number"
              value={maxSelectablePoints}
              onChange={(e) => setMaxSelectablePoints(e.target.value)}
              placeholder="Leave empty for no limit"
            />
          </div>
        </div>

        {/* Axis Labels */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>X-Axis Label (optional)</Label>
            <Input
              value={xAxisLabel}
              onChange={(e) => setXAxisLabel(e.target.value)}
              placeholder="e.g. Number of balls"
            />
          </div>
          <div>
            <Label>Y-Axis Label (optional)</Label>
            <Input
              value={yAxisLabel}
              onChange={(e) => setYAxisLabel(e.target.value)}
              placeholder="e.g. Number of people"
            />
          </div>
        </div>

        {/* Display Options */}
        <div className="space-y-2">
          <Label>Display Options</Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showAxes"
                checked={showAxes}
                onCheckedChange={(checked) => setShowAxes(!!checked)}
              />
              <Label htmlFor="showAxes" className="text-sm font-normal">
                Show Axes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showLabels"
                checked={showLabels}
                onCheckedChange={(checked) => setShowLabels(!!checked)}
              />
              <Label htmlFor="showLabels" className="text-sm font-normal">
                Show Labels
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="snapToGrid"
                checked={snapToGrid}
                onCheckedChange={(checked) => setSnapToGrid(!!checked)}
              />
              <Label htmlFor="snapToGrid" className="text-sm font-normal">
                Snap to Grid
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Preview */}
      <div>
        <Label>Live Preview</Label>
        <div className="mt-2">
          <GraphSelectorInteractivePreview
            xMin={xMin}
            xMax={xMax}
            yMin={yMin}
            yMax={yMax}
            gridInterval={gridInterval}
            showAxes={showAxes}
            showLabels={showLabels}
            snapToGrid={snapToGrid}
            maxSelectablePoints={maxSelectablePoints}
            availablePoints={availablePoints}
            selectedPoints={correctPoints}
            onPointsChange={setCorrectPoints}
            xAxisLabel={xAxisLabel}
            yAxisLabel={yAxisLabel}
          />
        </div>
      </div>

      {/* Points Management */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-lg font-semibold">Available Points</Label>
          <button
            type="button"
            onClick={addNewPoint}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Add Point
          </button>
        </div>

        {availablePoints.length === 0 ? (
          <div className="text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-lg">
            No points added yet. Click "Add Point" to create clickable points on
            the graph.
          </div>
        ) : (
          <div className="space-y-3">
            {availablePoints.map((point, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex gap-2">
                  <div>
                    <Label className="text-xs">X</Label>
                    <Input
                      type="number"
                      step="any"
                      value={point.x}
                      onChange={(e) =>
                        updatePoint(index, "x", parseFloat(e.target.value) || 0)
                      }
                      className="w-20"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Y</Label>
                    <Input
                      type="number"
                      step="any"
                      value={point.y}
                      onChange={(e) =>
                        updatePoint(index, "y", parseFloat(e.target.value) || 0)
                      }
                      className="w-20"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Label (optional)</Label>
                  <Input
                    value={point.point_label || ""}
                    onChange={(e) =>
                      updatePoint(index, "point_label", e.target.value)
                    }
                    className="w-24"
                    placeholder="A, B..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={point.is_correct}
                    onCheckedChange={(checked) =>
                      updatePoint(index, "is_correct", !!checked)
                    }
                  />
                  <Label className="text-xs font-normal">Correct</Label>
                </div>
                
                {/* Tagging Dialog */}
                {!point.is_correct && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={`h-8 flex items-center gap-1.5 transition-all ${
                          (pointTagSlots[index]?.filter(s => s.tag_name.trim()).length || 0) > 0
                            ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 shadow-sm"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                        title="Tag this point"
                      >
                        <Tags className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">
                          Edit Tags ({pointTagSlots[index]?.filter(s => s.tag_name.trim()).length || 0})
                        </span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
                      <DialogHeader className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                        <DialogTitle className="text-xl font-bold text-gray-900 flex items-center justify-between gap-3 w-full">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
                              <Tags className="h-5 w-5" />
                            </div>
                            Tagging Point: <span className="text-blue-600">({point.x}, {point.y})</span> {point.point_label && <span className="text-slate-400"> - {point.point_label}</span>}
                          </div>
                          <DialogClose asChild>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                              <X className="h-5 w-5" />
                            </button>
                          </DialogClose>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar min-h-0 pt-4">
                        <ChoiceTagEditor
                          choiceType={isTestPack ? "test_pack" : "pre_shsat"}
                          localSlots={pointTagSlots[index] || []}
                          onLocalSlotsChange={(newSlots) => {
                            setPointTagSlots(prev => ({
                              ...prev,
                              [index]: newSlots
                            }));
                          }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                <button
                  type="button"
                  onClick={() => removePoint(index)}
                  className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Difficulty */}
      <div>
        <Label>Difficulty (1-5)</Label>
        <Input
          type="number"
          min="1"
          max="5"
          value={graphDifficulty || 3}
          onChange={(e) => setGraphDifficulty?.(Number(e.target.value))}
          placeholder="Enter difficulty level (1-5)"
        />
      </div>

      {/* Explanation */}
      <div>
        <Label>Explanation (optional)</Label>
        <Textarea
          value={graphExplanation}
          onChange={(e) => setGraphExplanation(e.target.value)}
          placeholder="Explanation for the correct answer"
          rows={3}
        />
      </div>

      {/* Validation Error */}
      {!graphSelectorValid && (
        <div className="text-red-600 text-sm mt-2">
          Please ensure all required fields are filled: prompt, valid coordinate
          bounds (xMin &lt; xMax, yMin &lt; yMax), positive grid interval, and
          at least one point marked as correct.
        </div>
      )}

      {/* Hierarchy Section for Question Bank (not test pack) */}
      {!isTestPack && (
        <HierarchySection
          isTestPack={isTestPack}
          questionCategory={graphQuestionCategory}
          setQuestionCategory={setGraphQuestionCategory}
          chapter={graphChapter}
          setChapter={setGraphChapter}
          topic={graphTopic}
          setTopic={setGraphTopic}
          subTopic={graphSubTopic}
          setSubTopic={setGraphSubTopic}
        />
      )}
    </div>
  );
};
