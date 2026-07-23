import { useState, useEffect } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { toast } from "sonner";
import type { TagSlot } from "../../shared/ChoiceTagEditor";
import { fetchChoiceTags, saveChoiceTags, fetchBatchChoiceTags } from "../../../services/tagService";

export function useGraphSelectorModalState(initialValues: any, isOpen: boolean, onSave: (data: any) => void, onClose: () => void, istestpack: boolean, subject?: string, categoryId?: string) {
  // State
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
  const [availablePoints, setAvailablePoints] = useState<{ x: number; y: number; is_correct: boolean; point_label: string }[]>([]);
  const [correctPoints, setCorrectPoints] = useState<{ x: number; y: number; is_correct: boolean; point_label: string }[]>([]);
  const [graphExplanation, setGraphExplanation] = useState("");
  const [xAxisLabel, setXAxisLabel] = useState("");
  const [yAxisLabel, setYAxisLabel] = useState("");
  const [graphDifficulty, setGraphDifficulty] = useState(3);
  const [graphSelectorValid, setGraphSelectorValid] = useState(false);
  const [hasPrefilled, setHasPrefilled] = useState(false);

  // Hierarchy fields for question bank
  const [graphChapter, setGraphChapter] = useState<number | undefined>(undefined);
  const [graphTopic, setGraphTopic] = useState<number | undefined>(undefined);
  const [graphSubTopic, setGraphSubTopic] = useState<number | undefined>(undefined);
  const [graphQuestionCategory, setGraphQuestionCategory] = useState<string>("Practice");

  // Tagging state: Map of point index (string) to tag slots
  const [pointTagSlots, setPointTagSlots] = useState<Record<string, TagSlot[]>>({});

  // Prefill logic
  useEffect(() => {
    if (
      isOpen &&
      initialValues &&
      initialValues.question_type === "GRAPH_SELECTOR" &&
      !hasPrefilled
    ) {
      setGraphPrompt(initialValues.question || "");
      setXMin(initialValues.x_min != null ? String(initialValues.x_min) : "");
      setXMax(initialValues.x_max != null ? String(initialValues.x_max) : "");
      setYMin(initialValues.y_min != null ? String(initialValues.y_min) : "");
      setYMax(initialValues.y_max != null ? String(initialValues.y_max) : "");
      setGridInterval(initialValues.grid_interval != null ? String(initialValues.grid_interval) : "1");
      setMaxSelectablePoints(initialValues.max_selectable_points != null ? String(initialValues.max_selectable_points) : "");
      setShowAxes(initialValues.show_axes ?? true);
      setShowLabels(initialValues.show_labels ?? true);
      setSnapToGrid(initialValues.snap_to_grid ?? true);
      setGraphInstruction(initialValues.graph_instruction || "");
      setGraphExplanation(initialValues.explanation || "");
      setXAxisLabel(initialValues.x_axis_label || "");
      setYAxisLabel(initialValues.y_axis_label || "");
      setGraphDifficulty(initialValues.difficulty || 3);
      // Set available points from the fetched data
      if (initialValues.points && Array.isArray(initialValues.points)) {
        const points = initialValues.points.map((point: any) => ({
          x: point.x,
          y: point.y,
          is_correct: point.is_correct,
          point_label: point.point_label || "",
        }));
        setAvailablePoints(points);
        setCorrectPoints(points.filter((p: any) => p.is_correct));
      }
      // Load hierarchy fields
      setGraphChapter(initialValues.chapter_number);
      setGraphTopic(initialValues.topic_id);
      setGraphSubTopic(initialValues.sub_topic_id);
      setGraphQuestionCategory(initialValues.question_category || "Practice");

      // Prefill Tags for existing points
      const type = istestpack ? "test_pack" : "pre_shsat";
      const qId = initialValues?.question_id || initialValues?.id;
      
      if (initialValues.points && Array.isArray(initialValues.points)) {
        const idsToFetch = initialValues.points
          .map((p: any) => istestpack ? `gs_${qId}_x${p.x}_y${p.y}` : p.id)
          .filter(Boolean);

        if (idsToFetch.length > 0) {
          fetchBatchChoiceTags(idsToFetch, type).then(batchData => {
            const newTagSlots: Record<string, TagSlot[]> = {};
            initialValues.points.forEach((point: any, idx: number) => {
              const surrogateId = istestpack ? `gs_${qId}_x${point.x}_y${point.y}` : point.id;
              const tags = batchData[String(surrogateId)] || [];
              if (tags.length > 0) {
                newTagSlots[idx] = tags.map(t => ({
                  tag_id: t.tag_id,
                  tag_name: t.tag_name || "",
                  tag_category: t.tag_category || "",
                  rationale: t.rationale || ""
                }));
              }
            });
            setPointTagSlots(prev => ({ ...prev, ...newTagSlots }));
          })
          .catch(err => console.warn("Failed to fetch graph point tags", err))
          .finally(() => {
            setHasPrefilled(true);
          });
        } else {
          setHasPrefilled(true);
        }
      } else {
        setHasPrefilled(true);
      }
    }
  }, [isOpen, initialValues, hasPrefilled]);

  // Reset state when creating new questions
  useEffect(() => {
    if (isOpen && !initialValues && !hasPrefilled) {
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
      setGraphExplanation("");
      setXAxisLabel("");
      setYAxisLabel("");
      setGraphDifficulty(3);
      setAvailablePoints([]);
      setCorrectPoints([]);
      // Reset hierarchy fields
      setGraphChapter(undefined);
      setGraphTopic(undefined);
      setGraphSubTopic(undefined);
      setGraphQuestionCategory("Practice");
      setHasPrefilled(true);
    }
  }, [isOpen, initialValues, hasPrefilled]);

  const fetchGraphSelectorDetails = async (currentInitialValues: any, currentIsTestPack: boolean) => {
    const qId = currentInitialValues?.question_id || currentInitialValues?.id;
    if (!qId) return;

    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const typePath = currentIsTestPack ? "test-pack/graph-selector" : "graph-selector";
      const response = await fetch(`${baseUrl}/api/${typePath}/get/${qId}`);
      if (!response.ok) throw new Error("Failed to fetch details");
      const data = await response.json();
      
      const fetchedPoints = data.points || [];
      setAvailablePoints(fetchedPoints);
      setCorrectPoints(fetchedPoints.filter((p: any) => p.is_correct));
      
      // Load tags for fetched points in batch
      const type = currentIsTestPack ? "test_pack" : "pre_shsat";
      const idsToFetch = fetchedPoints.map((p: any) => p.id).filter(Boolean);
      
      if (idsToFetch.length > 0) {
        fetchBatchChoiceTags(idsToFetch, type).then(batchData => {
          const newTagSlots: Record<string, TagSlot[]> = {};
          fetchedPoints.forEach((point: any, idx: number) => {
            const targetId = point.id;
            const tags = batchData[String(targetId)] || [];
            if (tags.length > 0) {
              newTagSlots[idx] = tags.map(t => ({
                tag_id: t.tag_id,
                tag_name: t.tag_name || "",
                tag_category: t.tag_category || "",
                rationale: t.rationale || ""
              }));
            }
          });
          setPointTagSlots(prev => ({ ...prev, ...newTagSlots }));
        });
      }
    } catch (err) {
      console.error("Error fetching Graph Selector details:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setHasPrefilled(false);
      if (
        (initialValues?.question_id || initialValues?.id) &&
        initialValues.question_type === "GRAPH_SELECTOR"
      ) {
        fetchGraphSelectorDetails(initialValues, istestpack);
      }
    }
  }, [isOpen, initialValues, istestpack]);

  // Validation
  useEffect(() => {
    // Validate required fields
    const valid =
      graphPrompt.trim().length > 0 &&
      xMin !== "" &&
      xMax !== "" &&
      yMin !== "" &&
      yMax !== "" &&
      gridInterval !== "" &&
      availablePoints.some((p) => p.is_correct);
    setGraphSelectorValid(valid);
  }, [graphPrompt, xMin, xMax, yMin, yMax, gridInterval, availablePoints]);

  // Save logic
  const save = async () => {
    // Validate hierarchy fields for question bank questions
    if (!istestpack && !initialValues) {
      if (!graphQuestionCategory) {
        toast.error("Question category is required.");
        return;
      }
      if (!graphChapter) {
        toast.error("Chapter is required.");
        return;
      }
      if (!graphTopic) {
        toast.error("Topic is required.");
        return;
      }
      if (!graphSubTopic) {
        toast.error("Sub-topic is required.");
        return;
      }
    }

    try {
      if (!graphSelectorValid) {
        toast.error("Please fill in all required fields for the graph selector question.");
        return;
      }
      const userName = useAuthStore.getState().getUserName();
      const baseUrl = import.meta.env.VITE_API_URL;
      let endpoint = "";
      let method = initialValues ? "PUT" : "POST";
      let payload = {};
      let isTestPackGraphSelector = false;
      let testPackTestId = undefined;
      if ((initialValues as any)?.test_id || istestpack) {
        isTestPackGraphSelector = true;
        testPackTestId = (initialValues as any)?.test_id;
      }
      if (isTestPackGraphSelector && (!initialValues || !initialValues.question_id)) {
        endpoint = `${baseUrl}/api/test-pack/graph-selector/create`;
        method = "POST";
      } else if (isTestPackGraphSelector && initialValues && (initialValues as any).question_id) {
        endpoint = `${baseUrl}/api/test-pack/graph-selector/put/${(initialValues as any).question_id}`;
        method = "PATCH";
      } else if (!initialValues || !initialValues.id) {
        endpoint = `${baseUrl}/api/graph-selector/create`;
        method = "POST";
      } else if (initialValues && initialValues.id) {
        endpoint = `${baseUrl}/api/graph-selector/update/${initialValues.id}`;
        method = "PUT";
      } else {
        throw new Error("No valid question ID for update");
      }
      payload = {
        question: graphPrompt,
        question_type: "GRAPH_SELECTOR",
        x_min: Number(xMin),
        x_max: Number(xMax),
        y_min: Number(yMin),
        y_max: Number(yMax),
        grid_interval: Number(gridInterval),
        max_selectable_points: maxSelectablePoints ? Number(maxSelectablePoints) : null,
        graph_instruction: graphInstruction,
        graph_type: "cartesian",
        show_axes: showAxes,
        show_labels: showLabels,
        snap_to_grid: snapToGrid,
        x_axis_label: xAxisLabel,
        y_axis_label: yAxisLabel,
        points: availablePoints.map((p) => ({
          x: p.x,
          y: p.y,
          is_correct: p.is_correct,
          point_label: p.point_label || null,
          created_by: userName,
          last_edited_by: userName,
        })),
        difficulty: graphDifficulty,
        created_by: userName,
        last_edited_by: userName,
        explanation: graphExplanation || null,
        subject: !initialValues?.question_id ? subject : undefined,
        ...(!initialValues?.question_id && categoryId ? { question_category_id: Number(categoryId) } : {}),
        // Hierarchy fields - only include if they have values
        ...(graphQuestionCategory && { question_category: graphQuestionCategory }),
        ...(graphChapter && { chapter_number: graphChapter }),
        ...(graphTopic && { topic_id: graphTopic }),
        ...(graphSubTopic && { sub_topic_id: graphSubTopic }),
      };
      // For test pack creation, include subject and question_category_id if present and not editing
      if (isTestPackGraphSelector && (!initialValues || !initialValues.question_id)) {
        if (subject && categoryId) {
          (payload as any).subject = subject;
          (payload as any).question_category_id = Number(categoryId);
        }
      }
      if (isTestPackGraphSelector && testPackTestId) {
        (payload as any).test_id = testPackTestId;
      }
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.detail || "Failed to save Graph Selector question");
      }
      const data = await response.json();

      // Sync tags for each point
      const savedPoints = data.points || [];
      if (Array.isArray(savedPoints) && savedPoints.length > 0) {
        const type = istestpack ? "test_pack" : "pre_shsat";
        const savedQuestionId = data.id || data.question_id || initialValues?.id || initialValues?.question_id;
        
        const tagPromises = savedPoints.map((point: any, idx: number) => {
          const slots = pointTagSlots[idx] || [];
          if (slots.length > 0 && slots.some(s => s.tag_name.trim())) {
            const validTags = slots
              .filter(s => s.tag_name.trim())
              .map((s, i) => ({
                tag_id: s.tag_id,
                tag_name: s.tag_name.trim(),
                tag_category: (s.tag_category || "").trim() || undefined,
                tag_order: (i + 1) as 1 | 2 | 3,
                rationale: s.rationale,
              }));
            
            const targetId = point.id;
            // console.log(`🔍 [GraphSelectorModal] Syncing tags for point [${idx}] using ID: ${targetId}`);
            return saveChoiceTags(targetId, type, validTags);
          }
          return Promise.resolve();
        });
        await Promise.all(tagPromises).catch(err => console.warn("Graph Selector tag sync failed:", err));
      }

      toast.success(`Graph Selector question ${initialValues ? "updated" : "created"} successfully`);
      onSave(data);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save Graph Selector question");
    }
  };

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
    xAxisLabel,
    setXAxisLabel,
    yAxisLabel,
    setYAxisLabel,
    graphDifficulty,
    setGraphDifficulty,
    graphSelectorValid,
    // Hierarchy fields
    graphChapter,
    setGraphChapter,
    graphTopic,
    setGraphTopic,
    graphSubTopic,
    setGraphSubTopic,
    graphQuestionCategory,
    setGraphQuestionCategory,
    // Tagging
    pointTagSlots,
    setPointTagSlots,
    save,
  };
}
