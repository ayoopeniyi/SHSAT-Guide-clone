import { useState, useCallback } from "react";
import type { TagSlot } from "../../shared/ChoiceTagEditor";
import { fetchBatchChoiceTags } from "../../../services/tagService";

interface GraphSelectorPoint {
  x: number;
  y: number;
  is_correct: boolean;
  point_label?: string;
  id?: number;
}

export const useGraphSelectorState = () => {
  const [graphPrompt, setGraphPrompt] = useState("");
  const [xMin, setXMin] = useState("");
  const [xMax, setXMax] = useState("");
  const [yMin, setYMin] = useState("");
  const [yMax, setYMax] = useState("");
  const [gridInterval, setGridInterval] = useState("1");
  const [maxSelectablePoints, setMaxSelectablePoints] = useState("");
  const [showAxes, setShowAxes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [graphInstruction, setGraphInstruction] = useState("");
  const [availablePoints, setAvailablePoints] = useState<GraphSelectorPoint[]>(
    [],
  );
  const [correctPoints, setCorrectPoints] = useState<GraphSelectorPoint[]>([]);
  const [graphExplanation, setGraphExplanation] = useState("");
  const [xAxisLabel, setXAxisLabel] = useState("");
  const [yAxisLabel, setYAxisLabel] = useState("");
  
  // Tagging state: Index of point to its tag slots
  const [pointTagSlots, setPointTagSlots] = useState<Record<string, TagSlot[]>>({});

  // Validation
  const graphSelectorValid =
    typeof graphPrompt === "string" &&
    graphPrompt.trim().length > 0 &&
    xMin !== "" &&
    xMax !== "" &&
    yMin !== "" &&
    yMax !== "" &&
    gridInterval !== "" &&
    !isNaN(Number(xMin)) &&
    !isNaN(Number(xMax)) &&
    !isNaN(Number(yMin)) &&
    !isNaN(Number(yMax)) &&
    !isNaN(Number(gridInterval)) &&
    Number(xMin) < Number(xMax) &&
    Number(yMin) < Number(yMax) &&
    Number(gridInterval) > 0 &&
    availablePoints.some((p) => p.is_correct); // At least one correct point

  const resetGraphSelectorState = useCallback(() => {
    setGraphPrompt("");
    setXMin("");
    setXMax("");
    setYMin("");
    setYMax("");
    setGridInterval("1");
    setMaxSelectablePoints("");
    setShowAxes(true);
    setShowLabels(true);
    setSnapToGrid(true);
    setGraphInstruction("");
    setAvailablePoints([]);
    setCorrectPoints([]);
    setGraphExplanation("");
    setXAxisLabel("");
    setYAxisLabel("");
    setPointTagSlots({});
  }, []);

  // Helper to load tags for multiple points
  const loadPointTags = useCallback(async (points: GraphSelectorPoint[], type: "test_pack" | "pre_shsat") => {
    const idsToFetch = points.map(p => p.id).filter(Boolean) as number[];
    if (idsToFetch.length === 0) return;

    try {
      const batchData = await fetchBatchChoiceTags(idsToFetch, type);
      const newTagSlots: Record<string, TagSlot[]> = {};
      
      points.forEach((point, idx) => {
        if (point.id && batchData[String(point.id)]) {
          newTagSlots[idx] = batchData[String(point.id)].map(t => ({
            tag_id: t.tag_id,
            tag_name: t.tag_name || "",
            tag_category: t.tag_category || "",
            rationale: t.rationale || ""
          }));
        }
      });
      setPointTagSlots(prev => ({ ...prev, ...newTagSlots }));
    } catch (err) {
      console.warn("Failed to load point tags for graph selector:", err);
    }
  }, []);

  return {
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
    resetGraphSelectorState,
    xAxisLabel,
    setXAxisLabel,
    yAxisLabel,
    setYAxisLabel,
    pointTagSlots,
    setPointTagSlots,
    loadPointTags,
  };
};
