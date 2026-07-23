import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Checkbox } from "../../ui/checkbox";
import { useAuthStore } from "../../../stores/authStore";
import { toast } from "sonner";
import { testPackService } from "../../../services/testPackService";
import { BlankForm } from "../../question-modal/question-types/BlankForm";
import {
  useTestPackMCState,
  useTestPackMAState,
  useTestPackTableGridState,
  useTestPackGraphSelectorState,
  useTestPackBlankState,
  useTestPackRaySelectorState,
} from "../hooks";
import { HotTextForm } from "../../question-modal/question-types/HotTextForm";
import ImageUpload from "../../ImageUpload";
import { TagSlot } from "@/components/shared/ChoiceTagEditor";

interface TestPackEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: any;
  onSave?: (question: any) => void;
}

export const TestPackEditModal: React.FC<TestPackEditModalProps> = ({
  isOpen,
  onClose,
  question,
  onSave,
}) => {
  /* console.log(
    "[TestPackEditModal] Rendered. isOpen:",
    isOpen,
    "question:",
    question,
  ); */
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [questionTypeMap, setQuestionTypeMap] = useState<
    Record<number, string>
  >({});
  const [question_type_id, setQuestion_type_id] = useState<number | null>(null);
  const [typeId, setTypeId] = useState<string>("MC");

  // MC state
  const mcState = useTestPackMCState();
  const {
    mcQuestion,
    setMcQuestion,
    mcChoices,
    setMcChoices,
    mcVariant,
    setMcVariant,
    addMcChoice,
    removeMcChoice,
    updateMcChoice,
    setCorrectChoice,
    resetMCState,
    mcValid,
  } = mcState;

  // MA state
  const maState = useTestPackMAState();
  const {
    maQuestion,
    setMaQuestion,
    maChoices,
    setMaChoices,
    addMaChoice,
    removeMaChoice,
    updateMaChoice,
    resetMAState,
    maValid,
  } = maState;

  // Question image state
  const [questionImageUrl, setQuestionImageUrl] = useState<string | undefined>(undefined);

  // Table Grid state
  const tgState = useTestPackTableGridState();
  const {
    tgQuestion,
    setTgQuestion,
    tgSelectionMode,
    setTgSelectionMode,
    tgRowLabels,
    setTgRowLabels,
    tgColumnLabels,
    setTgColumnLabels,
    tgRowOrder,
    setTgRowOrder,
    tgColumnOrder,
    setTgColumnOrder,
    tgFirstColumnHeader,
    setTgFirstColumnHeader,
    tgAnswerMatrix,
    setTgAnswerMatrix,
    resetTableGridState,
    validateTableGrid,
  } = tgState;

  // Graph Selector state
  const gsState = useTestPackGraphSelectorState();
  const {
    gsQuestion,
    setGsQuestion,
    gsXMin,
    setGsXMin,
    gsXMax,
    setGsXMax,
    gsYMin,
    setGsYMin,
    gsYMax,
    setGsYMax,
    gsMaxSelectablePoints,
    setGsMaxSelectablePoints,
    gsGraphInstruction,
    setGsGraphInstruction,
    gsGraphType,
    setGsGraphType,
    gsShowAxes,
    setGsShowAxes,
    gsShowLabels,
    setGsShowLabels,
    gsSnapToGrid,
    setGsSnapToGrid,
    gsGridInterval,
    setGsGridInterval,
    gsXAxisLabel,
    setGsXAxisLabel,
    gsYAxisLabel,
    setGsYAxisLabel,
    gsPoints,
    setGsPoints,
    addPoint,
    removePoint,
    updatePoint,
    resetGraphSelectorState,
    validateGraphSelector,
  } = gsState;

  // Blank state
  const blankState = useTestPackBlankState();
  const {
    blankQuestion,
    setBlankQuestion,
    blankCorrectAnswer,
    setBlankCorrectAnswer,
    blankVariant,
    setBlankVariant,
    resetBlankState,
    blankValid,
  } = blankState;

  // Ray Selector state
  const rsState = useTestPackRaySelectorState();
  const {
    rsQuestion,
    setRsQuestion,
    rsNumberlineMin,
    setRsNumberlineMin,
    rsNumberlineMax,
    setRsNumberlineMax,
    rsTickInterval,
    setRsTickInterval,
    rsRayType,
    setRsRayType,
    rsRayEndpoint,
    setRsRayEndpoint,
    rsExplanation,
    setRsExplanation,
    resetRaySelectorState,
    validateRaySelector,
  } = rsState;
  const [rsDifficulty, setRsDifficulty] = useState(1);

  const userName = useAuthStore((state) => state.getUserName());

  // Field validation functions
  const hasRequiredTableGridFields = (q: any) => {
    return q.row_labels && q.column_labels && q.answer_matrix;
  };

  const hasRequiredGraphSelectorFields = (q: any) => {
    return (
      q.x_min !== undefined &&
      q.x_max !== undefined &&
      q.y_min !== undefined &&
      q.y_max !== undefined &&
      q.points
    );
  };

  const hasRequiredRaySelectorFields = (q: any) => {
    return (
      q.numberline_min !== undefined &&
      q.numberline_max !== undefined &&
      q.tick_interval !== undefined &&
      q.ray_correct_type &&
      q.ray_correct_position !== undefined
    );
  };

  // API fetching functions
  const fetchTableGridDetails = async (questionId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/test-pack/table-grid/get/${questionId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch TABLE_GRID details");
      return await response.json();
    } catch (error) {
      console.error("Error fetching TABLE_GRID details:", error);
      throw error;
    }
  };

  const fetchGraphSelectorDetails = async (questionId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/test-pack/graph-selector/${questionId}/details`,
      );
      if (!response.ok)
        throw new Error("Failed to fetch GRAPH_SELECTOR details");
      return await response.json();
    } catch (error) {
      console.error("Error fetching GRAPH_SELECTOR details:", error);
      throw error;
    }
  };

  const fetchMCDetails = async (questionId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/test-pack/questions/${questionId}/choices`,
      );
      if (!response.ok) throw new Error("Failed to fetch MC details");
      return await response.json();
    } catch (error) {
      console.error("Error fetching MC details:", error);
      throw error;
    }
  };

  const fetchMADetails = async (questionId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/test-pack/questions/${questionId}/choices`,
      );
      if (!response.ok) throw new Error("Failed to fetch MA details");
      return await response.json();
    } catch (error) {
      console.error("Error fetching MA details:", error);
      throw error;
    }
  };

  const fetchRaySelectorDetails = async (questionId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/test-pack/ray-selector/get/${questionId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch RAY_SELECTOR details");
      return await response.json();
    } catch (error) {
      console.error("Error fetching RAY_SELECTOR details:", error);
      throw error;
    }
  };

  // Add state for HotText initial values
  const [hotTextInitialValues, setHotTextInitialValues] = useState<any>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuestionImageUrl(undefined);
    }
  }, [isOpen]);

  // Initialize with question data when modal opens
  useEffect(() => {
    if (isOpen && question) {
      const type = question.question_type_acronym;
      console.debug("[TestPackEditModal] Opened modal for question:", question);
      console.debug("[TestPackEditModal] Detected question type:", type);
      setQuestion_type_id(type);
      setTypeId(type);

      if (type === "MC") {
        setMcQuestion(question.question || "");
        setQuestionImageUrl(question.question_image_url || undefined);
        const hasChoices =
          question.choices &&
          Array.isArray(question.choices) &&
          question.choices.length > 0;

        if (!hasChoices) {
          setLoadingData(true);
          fetchMCDetails(question.question_id)
            .then((data) => {
              const mappedChoices = (data.choices || []).map((choice: any) => ({
                letter: choice.choice_label || choice.letter,
                value: {
                  text:
                    choice.answer_text ||
                    choice.choice_text ||
                    choice.value?.text ||
                    "",
                  is_correct:
                    choice.is_correct || choice.value?.is_correct || false,
                  choice_image_url:
                    choice.choice_image_url || choice.value?.choice_image_url,
                },
              }));
              setMcChoices(mappedChoices);
              setLoadingData(false);
            })
            .catch(() => {
              setMcChoices([
                { letter: "A", value: { text: "", is_correct: false } },
                { letter: "B", value: { text: "", is_correct: false } },
              ]);
              setLoadingData(false);
              toast.warning(
                "Could not load choices. Please add them manually.",
              );
            });
        } else {
          const mappedChoices = (question.choices || []).map((choice: any) => ({
            letter: choice.choice_label || choice.letter,
            value: {
              text:
                choice.answer_text ||
                choice.choice_text ||
                choice.value?.text ||
                "",
              is_correct:
                choice.is_correct || choice.value?.is_correct || false,
              choice_image_url:
                choice.choice_image_url || choice.value?.choice_image_url,
            },
          }));
          setMcChoices(mappedChoices);
        }
        setMcVariant(question.question_category || "standard");
      } else if (type === "MA") {
        setMaQuestion(question.question || "");
        setQuestionImageUrl(question.question_image_url || undefined);
        const hasChoices =
          question.choices &&
          Array.isArray(question.choices) &&
          question.choices.length > 0;

        const mapMaChoices = (choices: any[] = []) =>
          choices.map((c: any) => ({
            choice_label: c.choice_label || c.letter,
            choice_text: c.choice_text || c.answer_text || c.value?.text || "",
            is_correct: c.is_correct || c.value?.is_correct || false,
            choice_image_url:
              c.choice_image_url || c.value?.choice_image_url || null,
            id: c.id,
          }));

        if (!hasChoices) {
          setLoadingData(true);
          fetchMADetails(question.question_id)
            .then((data) => {
              setMaChoices(mapMaChoices(data.choices || []));
              setLoadingData(false);
            })
            .catch(() => {
              setMaChoices([
                { choice_label: "A", choice_text: "", is_correct: false },
                { choice_label: "B", choice_text: "", is_correct: false },
                { choice_label: "C", choice_text: "", is_correct: false },
              ]);
              setLoadingData(false);
              toast.warning(
                "Could not load choices. Please add them manually.",
              );
            });
        } else {
          setMaChoices(mapMaChoices(question.choices || []));
        }
      } else if (type === "TABLE_GRID") {
        // Check if TABLE_GRID has all required fields
        const hasAllFields = hasRequiredTableGridFields(question);
        /* console.log("TABLE_GRID field check:", { hasAllFields, question }); */

        if (!hasAllFields) {
          // Fetch full details
          setLoadingData(true);
          fetchTableGridDetails(question.question_id)
            .then((fullData) => {
              /* console.log("TABLE_GRID API data received:", fullData); */
              setTgQuestion(fullData.question || "");
              setQuestionImageUrl(fullData.question_image_url || undefined);
              setTgSelectionMode(fullData.selection_mode || "single");
              setTgRowLabels(fullData.row_labels || []);
              setTgColumnLabels(fullData.column_labels || []);
              setTgRowOrder(fullData.row_order || []);
              setTgColumnOrder(fullData.column_order || []);
              setTgFirstColumnHeader(fullData.first_column_header || "");
              setTgAnswerMatrix(fullData.answer_matrix || []);
              setLoadingData(false);
            })
            .catch((error) => {
              console.error(
                "TABLE_GRID API fetch failed, using fallback:",
                error,
              );
              // Fallback to original question data
              setTgQuestion(question.question || "");
              setTgSelectionMode(question.selection_mode || "single");
              setTgRowLabels(question.row_labels || []);
              setTgColumnLabels(question.column_labels || []);
              setTgRowOrder(question.row_order || []);
              setTgColumnOrder(question.column_order || []);
              setTgFirstColumnHeader(question.first_column_header || "");
              setTgAnswerMatrix(question.answer_matrix || []);
              setLoadingData(false);
              toast.warning(
                "Some data may be incomplete. Please verify all fields.",
              );
            });
        } else {
          // Use existing complete data
          setTgQuestion(question.question || "");
          setQuestionImageUrl(question.question_image_url || undefined);
          setTgSelectionMode(question.selection_mode || "single");
          setTgRowLabels(question.row_labels || []);
          setTgColumnLabels(question.column_labels || []);
          setTgRowOrder(question.row_order || []);
          setTgColumnOrder(question.column_order || []);
          setTgFirstColumnHeader(question.first_column_header || "");
          setTgAnswerMatrix(question.answer_matrix || []);
        }
      } else if (type === "GRAPH_SELECTOR") {
        // Check if GRAPH_SELECTOR has all required fields
        const hasAllFields = hasRequiredGraphSelectorFields(question);
        /* console.log("GRAPH_SELECTOR field check:", { hasAllFields, question }); */

        if (!hasAllFields) {
          // Fetch full details
          setLoadingData(true);
          fetchGraphSelectorDetails(question.question_id)
            .then((fullData) => {
              /* console.log("GRAPH_SELECTOR API data received:", fullData); */
              setGsQuestion(fullData.question || "");
              setQuestionImageUrl(fullData.question_image_url || undefined);
              setGsXMin(fullData.x_min || -5);
              setGsXMax(fullData.x_max || 5);
              setGsYMin(fullData.y_min || -5);
              setGsYMax(fullData.y_max || 5);
              setGsMaxSelectablePoints(fullData.max_selectable_points);
              setGsGraphInstruction(fullData.graph_instruction || "");
              setGsGraphType(fullData.graph_type || "cartesian");
              setGsShowAxes(fullData.show_axes !== false);
              setGsShowLabels(fullData.show_labels !== false);
              setGsSnapToGrid(fullData.snap_to_grid !== false);
              setGsGridInterval(fullData.grid_interval || 1.0);
              setGsXAxisLabel(fullData.x_axis_label || "");
              setGsYAxisLabel(fullData.y_axis_label || "");
              setGsPoints(fullData.points || []);
              setLoadingData(false);
            })
            .catch((error) => {
              console.error(
                "GRAPH_SELECTOR API fetch failed, using fallback:",
                error,
              );
              // Fallback to original question data
              setGsQuestion(question.question || "");
              setGsXMin(question.x_min || -5);
              setGsXMax(question.x_max || 5);
              setGsYMin(question.y_min || -5);
              setGsYMax(question.y_max || 5);
              setGsMaxSelectablePoints(question.max_selectable_points);
              setGsGraphInstruction(question.graph_instruction || "");
              setGsGraphType(question.graph_type || "cartesian");
              setGsShowAxes(question.show_axes !== false);
              setGsShowLabels(question.show_labels !== false);
              setGsSnapToGrid(question.snap_to_grid !== false);
              setGsGridInterval(question.grid_interval || 1.0);
              setGsXAxisLabel(question.x_axis_label || "");
              setGsYAxisLabel(question.y_axis_label || "");
              setGsPoints(question.points || []);
              setLoadingData(false);
              toast.warning(
                "Some data may be incomplete. Please verify all fields.",
              );
            });
        } else {
          // Use existing complete data
          setGsQuestion(question.question || "");
          setQuestionImageUrl(question.question_image_url || undefined);
          setGsXMin(question.x_min || -5);
          setGsXMax(question.x_max || 5);
          setGsYMin(question.y_min || -5);
          setGsYMax(question.y_max || 5);
          setGsMaxSelectablePoints(question.max_selectable_points);
          setGsGraphInstruction(question.graph_instruction || "");
          setGsGraphType(question.graph_type || "cartesian");
          setGsShowAxes(question.show_axes !== false);
          setGsShowLabels(question.show_labels !== false);
          setGsSnapToGrid(question.snap_to_grid !== false);
          setGsGridInterval(question.grid_interval || 1.0);
          setGsXAxisLabel(question.x_axis_label || "");
          setGsYAxisLabel(question.y_axis_label || "");
          setGsPoints(question.points || []);
        }
      } else if (type === "BLANK") {
        setBlankQuestion(question.question || "");
        setBlankCorrectAnswer(question.correct_answer || "");
        setQuestionImageUrl(question.question_image_url || undefined);
        setBlankVariant(
          question.question_category === "fill_box"
            ? "fill_box"
            : "placeholder",
        );
      } else if (type === "HOT_TEXT") {
        // Fetch full Hot Text details if not all fields are present
        const hasAllFields =
          question.regions &&
          question.min_selections !== undefined &&
          question.max_selections !== undefined &&
          question.custom_passage !== undefined;
        if (!hasAllFields && question.question_id) {
          setLoadingData(true);
          testPackService
            .getHotTextQuestion(question.question_id)
            .then((fullData) => {
              setHotTextInitialValues({
                ...fullData,
                passage: fullData.custom_passage || "",
              });
              setLoadingData(false);
            })
            .catch(() => {
              setHotTextInitialValues({
                ...question,
                passage: question.custom_passage || "",
              });
              setLoadingData(false);
              toast.warning(
                "Could not load full Hot Text details. Please verify all fields.",
              );
            });
        } else {
          setHotTextInitialValues({
            ...question,
            passage: question.custom_passage || "",
          });
        }
      } else if (type === "RAY_SELECTOR") {
        // Check if RAY_SELECTOR has all required fields
        const hasAllFields = hasRequiredRaySelectorFields(question);
        /* console.log("RAY_SELECTOR field check:", { hasAllFields, question }); */

        if (!hasAllFields && question.question_id) {
          // Fetch full details
          setLoadingData(true);
          fetchRaySelectorDetails(question.question_id)
            .then((fullData) => {
              /* console.log("RAY_SELECTOR API data received:", fullData); */
              setRsQuestion(fullData.question || "");
              setQuestionImageUrl(fullData.question_image_url || undefined);
              setRsNumberlineMin(fullData.numberline_min || -10);
              setRsNumberlineMax(fullData.numberline_max || 10);
              setRsTickInterval(fullData.tick_interval || 1);
              setRsRayType(fullData.ray_correct_type || "closed_right");
              setRsRayEndpoint(fullData.ray_correct_position || 0);
              setRsExplanation(fullData.explanation || "");
              setRsDifficulty(fullData.difficulty || 1);
              setLoadingData(false);
            })
            .catch((error) => {
              console.error(
                "RAY_SELECTOR API fetch failed, using fallback:",
                error,
              );
              // Fallback to original question data
              setRsQuestion(question.question || "");
              setRsNumberlineMin(question.numberline_min || -10);
              setRsNumberlineMax(question.numberline_max || 10);
              setRsTickInterval(question.tick_interval || 1);
              setRsRayType(question.ray_correct_type || "closed_right");
              setRsRayEndpoint(question.ray_correct_position || 0);
              setRsExplanation(question.explanation || "");
              setRsDifficulty(question.difficulty || 1);
              setLoadingData(false);
              toast.warning(
                "Some data may be incomplete. Please verify all fields.",
              );
            });
        } else {
          // Use existing complete data
          setRsQuestion(question.question || "");
          setQuestionImageUrl(question.question_image_url || undefined);
          setRsNumberlineMin(question.numberline_min || -10);
          setRsNumberlineMax(question.numberline_max || 10);
          setRsTickInterval(question.tick_interval || 1);
          setRsRayType(question.ray_correct_type || "closed_right");
          setRsRayEndpoint(question.ray_correct_position || 0);
          setRsExplanation(question.explanation || "");
          setRsDifficulty(question.difficulty || 1);
        }
      }
    }
  }, [isOpen, question]);

  useEffect(() => {
    testPackService.getQuestionTypeMap().then(setQuestionTypeMap);
  }, []);

  useEffect(() => {
    if (question && question.question_type) {
      // If question_type is an integer, use it directly; if acronym, find the id
      if (typeof question.question_type === "number") {
        setQuestion_type_id(question.question_type);
      } else {
        const found = Object.entries(questionTypeMap).find(
          ([, v]) => v === question.question_type,
        );
        setQuestion_type_id(found ? Number(found[0]) : null);
      }
    }
  }, [question, questionTypeMap]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetMCState();
      resetMAState();
      resetTableGridState();
      resetGraphSelectorState();
      resetBlankState();
      resetRaySelectorState();
      setRsDifficulty(1);
      setLoadingData(false);
      setHotTextInitialValues(null);
    }
  }, [isOpen]);

  const handleSave = async () => {
    /* console.log("TestPackEditModal handleSave called for question:", question); */
    if (!question?.question_id) {
      toast.error("No question ID found");
      return;
    }

    setLoading(true);
    try {
      let payload: any = {};
      let updateResponse: any = null;

      const auditFields = {
        last_edited_by: userName,
        updated_at: new Date().toISOString(),
      };

      const type =
        question_type_id !== null ? questionTypeMap[question_type_id] : "MC";

      if (type === "MC") {
        if (!mcValid) {
          toast.error("Please fill out all required fields for MC question");
          return;
        }

        payload = {
          test_id: question.test_id,
          question: mcQuestion,
          choices: mcChoices,
          question_category: mcVariant,
          question_image_url: questionImageUrl,
          created_by: question.created_by,
          ...auditFields,
        };

        updateResponse = await testPackService.editMCQuestion(
          question.question_id,
          payload,
        );
      } else if (type === "MA") {
        if (!maValid) {
          toast.error("Please fill out all required fields for MA question");
          return;
        }

        payload = {
          test_id: question.test_id,
          question: maQuestion,
          choices: maChoices,
          question_category: "standard",
          question_image_url: questionImageUrl,
          created_by: question.created_by,
          ...auditFields,
        };

        updateResponse = await testPackService.editMAQuestion(
          question.question_id,
          payload,
        );
      } else if (type === "TABLE_GRID") {
        if (!validateTableGrid()) {
          toast.error(
            "Please fill out all required fields for Table Grid question",
          );
          return;
        }

        payload = {
          question: tgQuestion,
          selection_mode: tgSelectionMode,
          row_labels: tgRowLabels,
          column_labels: tgColumnLabels,
          row_order: tgRowOrder,
          column_order: tgColumnOrder,
          first_column_header: tgFirstColumnHeader,
          answer_matrix: tgAnswerMatrix,
          test_id: question.test_id,
          difficulty: question.difficulty || 1,
          question_image_url: questionImageUrl,
          created_by: question.created_by,
          is_active: question.is_active,  // Preserve current active state
          ...auditFields,
        };

        updateResponse = await testPackService.editTableGridQuestion(
          question.question_id,
          payload,
        );
      } else if (type === "GRAPH_SELECTOR") {
        if (!validateGraphSelector()) {
          toast.error(
            "Please fill out all required fields for Graph Selector question",
          );
          return;
        }

        payload = {
          question: gsQuestion,
          x_min: gsXMin,
          x_max: gsXMax,
          y_min: gsYMin,
          y_max: gsYMax,
          max_selectable_points: gsMaxSelectablePoints,
          graph_instruction: gsGraphInstruction,
          graph_type: gsGraphType,
          show_axes: gsShowAxes,
          show_labels: gsShowLabels,
          snap_to_grid: gsSnapToGrid,
          grid_interval: gsGridInterval,
          x_axis_label: gsXAxisLabel,
          y_axis_label: gsYAxisLabel,
          points: gsPoints,
          test_id: question.test_id,
          difficulty: question.difficulty || 1,
          question_image_url: questionImageUrl,
          created_by: question.created_by,
          ...auditFields,
        };

        updateResponse = await testPackService.editGraphSelectorQuestion(
          question.question_id,
          payload,
        );
      } else if (type === "BLANK") {
        if (!blankValid) {
          toast.error("Please fill out all required fields for BLANK question");
          return;
        }

        payload = {
          test_id: question.test_id,
          question: blankQuestion,
          correct_answer: blankCorrectAnswer,
          question_category: blankVariant,
          question_image_url: questionImageUrl,
          is_active: question.is_active,  // Preserve current active state
          created_by: question.created_by,
          ...auditFields,
        };

        updateResponse = await testPackService.editBlankQuestion(
          question.question_id,
          payload,
        );
      } else if (type === "HOT_TEXT") {
        if (!hotTextInitialValues) return;
        
        const auditFields = {
          last_edited_by: userName,
          updated_at: new Date().toISOString(),
        };
        
        payload = {
          question: hotTextInitialValues.question,
          custom_passage: hotTextInitialValues.passage,
          min_selections: hotTextInitialValues.min_selections,
          max_selections: hotTextInitialValues.max_selections,
          regions: hotTextInitialValues.regions,
          test_id: question.test_id,
          difficulty: hotTextInitialValues.difficulty,
          created_by: question.created_by,
          ...auditFields,
        };

        updateResponse = await testPackService.editHotTextQuestion(
          question.question_id,
          payload,
        );
      } else if (type === "RAY_SELECTOR") {
        if (!validateRaySelector()) {
          toast.error(
            "Please fill out all required fields for Ray Selector question",
          );
          return;
        }

        payload = {
          question: rsQuestion,
          numberline_min: rsNumberlineMin,
          numberline_max: rsNumberlineMax,
          tick_interval: rsTickInterval,
          ray_correct_type: rsRayType,
          ray_correct_position: rsRayEndpoint,
          explanation: rsExplanation,
          test_id: question.test_id,
          difficulty: rsDifficulty || 1,
          question_image_url: questionImageUrl,
          created_by: question.created_by,
          ...auditFields,
        };

        updateResponse = await testPackService.editRaySelectorQuestion(
          question.question_id,
          payload,
        );
      }

      toast.success("Question updated successfully");
      if (onSave) onSave(updateResponse);
      onClose();
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update question",
      );
    } finally {
      setLoading(false);
    }
  };

  const isValid = () => {
    const type =
      question_type_id !== null ? questionTypeMap[question_type_id] : "MC";
    switch (type) {
      case "MC":
        return mcValid;
      case "MA":
        return maValid;
      case "TABLE_GRID":
        return validateTableGrid();
      case "GRAPH_SELECTOR":
        return validateGraphSelector();
      case "BLANK":
        return blankValid;
      case "HOT_TEXT":
        return blankValid;
      case "RAY_SELECTOR":
        return validateRaySelector();
      default:
        return false;
    }
  };

  // Helper functions for TableGrid
  const addTgRow = () => {
    const newRowIndex = tgRowLabels.length;
    setTgRowLabels([...tgRowLabels, `Row ${newRowIndex + 1}`]);
    setTgRowOrder([...tgRowOrder, newRowIndex]);
  };

  const removeTgRow = (index: number) => {
    if (tgRowLabels.length <= 1) return;
    setTgRowLabels(tgRowLabels.filter((_, i) => i !== index));
    setTgRowOrder(tgRowOrder.filter((_, i) => i !== index));
    setTgAnswerMatrix(
      tgAnswerMatrix.filter((answer) => answer.row_index !== index),
    );
  };

  const addTgColumn = () => {
    const newColIndex = tgColumnLabels.length;
    setTgColumnLabels([...tgColumnLabels, `Column ${newColIndex + 1}`]);
    setTgColumnOrder([...tgColumnOrder, newColIndex]);
  };

  const removeTgColumn = (index: number) => {
    if (tgColumnLabels.length <= 1) return;
    setTgColumnLabels(tgColumnLabels.filter((_, i) => i !== index));
    setTgColumnOrder(tgColumnOrder.filter((_, i) => i !== index));
    setTgAnswerMatrix(
      tgAnswerMatrix.filter((answer) => answer.column_index !== index),
    );
  };

  const updateTgRowLabel = (index: number, value: string) => {
    const newLabels = [...tgRowLabels];
    newLabels[index] = value;
    setTgRowLabels(newLabels);
  };

  const updateTgColumnLabel = (index: number, value: string) => {
    const newLabels = [...tgColumnLabels];
    newLabels[index] = value;
    setTgColumnLabels(newLabels);
  };

  const toggleTgCell = (rowIndex: number, colIndex: number) => {
    const existingIndex = tgAnswerMatrix.findIndex(
      (answer) =>
        answer.row_index === rowIndex && answer.column_index === colIndex,
    );

    if (existingIndex >= 0) {
      // Remove the answer
      setTgAnswerMatrix(tgAnswerMatrix.filter((_, i) => i !== existingIndex));
    } else {
      // Add the answer
      setTgAnswerMatrix([
        ...tgAnswerMatrix,
        {
          row_index: rowIndex,
          column_index: colIndex,
          is_correct: true,
        },
      ]);
    }
  };

  const isCellSelected = (rowIndex: number, colIndex: number) => {
    return tgAnswerMatrix.some(
      (answer) =>
        answer.row_index === rowIndex && answer.column_index === colIndex,
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            Edit{" "}
            {question_type_id !== null
              ? questionTypeMap[question_type_id]
              : "MC"}{" "}
            Question
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">
              Question Type:{" "}
              <span className="font-medium">
                {question_type_id !== null
                  ? questionTypeMap[question_type_id]
                  : "MC"}
              </span>
              {loadingData && (
                <span className="ml-2 text-blue-600">
                  Loading complete data...
                </span>
              )}
            </div>
          </div>

          {/* Show loading indicator when fetching data */}
          {loadingData && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Fetching missing question data...</span>
              </div>
            </div>
          )}

          {/* Only show forms when not loading */}
          {!loadingData && (
            <>
              {/* MC Form */}
              {question_type_id !== null &&
                questionTypeMap[question_type_id] === "MC" && (
                  <div className="space-y-4">
                    <div>
                      <Label>Question</Label>
                      <Textarea
                        value={mcQuestion}
                        onChange={(e) => setMcQuestion(e.target.value)}
                        placeholder="Enter question"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Question Image (optional)</Label>
                      <div className="text-xs text-gray-500 mb-2">
                        Upload, replace, or remove the question image
                      </div>
                      <ImageUpload
                        currentImageUrl={questionImageUrl}
                        onImageUploaded={(imageUrl) => setQuestionImageUrl(imageUrl)}
                        onImageDeleted={() => setQuestionImageUrl(undefined)}
                        uploadId={question?.question_id}
                        uploadType="question"
                        userName={useAuthStore.getState().getUserName()}
                        className="mt-2"
                        isTestPack={true}
                      />
                    </div>

                    <div>
                      <Label>Variant</Label>
                      <Select value={mcVariant} onValueChange={setMcVariant}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="drag_drop">Drag & Drop</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Choices</Label>
                      {mcChoices.map((choice, idx) => (
                        <div
                          key={idx}
                          className="p-3 border rounded bg-gray-50 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold w-8">
                              {choice.letter}.
                            </span>
                            <Input
                              className="flex-1"
                              value={choice.value.text}
                              onChange={(e) =>
                                updateMcChoice(idx, {
                                  value: {
                                    ...choice.value,
                                    text: e.target.value,
                                  },
                                })
                              }
                              placeholder={`Choice ${choice.letter}`}
                            />
                            <input
                              type="radio"
                              checked={choice.value.is_correct}
                              onChange={() => setCorrectChoice(idx)}
                              name="mc-correct"
                            />
                            <span className="text-xs">Correct</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMcChoice(idx)}
                              disabled={mcChoices.length <= 2}
                            >
                              ×
                            </Button>
                          </div>

                          {/* Choice Image Upload */}
                          <div>
                            <Label className="text-xs">Choice Image (optional)</Label>
                            <ImageUpload
                              currentImageUrl={choice.value.choice_image_url}
                              onImageUploaded={(imageUrl) =>
                                updateMcChoice(idx, {
                                  value: {
                                    ...choice.value,
                                    choice_image_url: imageUrl,
                                  },
                                })
                              }
                              onImageDeleted={() =>
                                updateMcChoice(idx, {
                                  value: {
                                    ...choice.value,
                                    choice_image_url: undefined,
                                  },
                                })
                              }
                              uploadId={choice.value.id ? Number(choice.value.id) : undefined}
                              uploadType="choice"
                              questionId={Number(question.question_id)}
                              choiceIndex={idx}
                              choiceLabel={choice.letter}
                              choiceText={choice.value.text}
                              userName={useAuthStore.getState().getUserName()}
                              allowTemporary={!choice.value.id}
                              isEditing={!!choice.value.id}
                              className="mt-1"
                              isTestPack={true}
                            />
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addMcChoice}
                        disabled={mcChoices.length >= 6}
                      >
                        Add Choice
                      </Button>
                    </div>
                  </div>
                )}

              {/* MA Form */}
              {question_type_id !== null &&
                questionTypeMap[question_type_id] === "MA" && (
                  <div className="space-y-4">
                    <div>
                      <Label>Question</Label>
                      <Textarea
                        value={maQuestion}
                        onChange={(e) => setMaQuestion(e.target.value)}
                        placeholder="Enter question"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Question Image (optional)</Label>
                      <div className="text-xs text-gray-500 mb-2">
                        Upload, replace, or remove the question image
                      </div>
                      <ImageUpload
                        currentImageUrl={questionImageUrl}
                        onImageUploaded={(imageUrl) => setQuestionImageUrl(imageUrl)}
                        onImageDeleted={() => setQuestionImageUrl(undefined)}
                        uploadId={question?.question_id}
                        uploadType="question"
                        userName={useAuthStore.getState().getUserName()}
                        className="mt-2"
                        isTestPack={true}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Choices</Label>
                      {maChoices.map((choice, idx) => (
                        <div
                          key={idx}
                          className="p-3 border rounded bg-gray-50 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold w-8">
                              {choice.choice_label}.
                            </span>
                            <Input
                              className="flex-1"
                              value={choice.choice_text}
                              onChange={(e) =>
                                updateMaChoice(idx, {
                                  choice_text: e.target.value,
                                })
                              }
                              placeholder={`Choice ${choice.choice_label}`}
                            />
                            <input
                              type="checkbox"
                              checked={choice.is_correct}
                              onChange={(e) =>
                                updateMaChoice(idx, {
                                  is_correct: e.target.checked,
                                })
                              }
                            />
                            <span className="text-xs">Correct</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMaChoice(idx)}
                              disabled={maChoices.length <= 3}
                            >
                              ×
                            </Button>
                          </div>

                          {/* Choice Image Upload */}
                          <div>
                            <Label className="text-xs">Choice Image (optional)</Label>
                            <ImageUpload
                              currentImageUrl={choice.choice_image_url}
                              onImageUploaded={(imageUrl) =>
                                updateMaChoice(idx, {
                                  choice_image_url: imageUrl,
                                })
                              }
                              onImageDeleted={() =>
                                updateMaChoice(idx, {
                                  choice_image_url: undefined,
                                })
                              }
                              uploadId={choice.id ? Number(choice.id) : undefined}
                              uploadType="choice"
                              questionId={Number(question.question_id)}
                              choiceIndex={idx}
                              choiceLabel={choice.choice_label}
                              choiceText={choice.choice_text}
                              userName={useAuthStore.getState().getUserName()}
                              allowTemporary={!choice.id}
                              isEditing={!!choice.id}
                              className="mt-1"
                              isTestPack={true}
                            />
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addMaChoice}
                        disabled={maChoices.length >= 8}
                      >
                        Add Choice
                      </Button>
                    </div>
                  </div>
                )}

              {/* Table Grid Form */}
              {question_type_id !== null &&
                questionTypeMap[question_type_id] === "TABLE_GRID" && (
                  <div className="space-y-4">
                    <div>
                      <Label>Question</Label>
                      <Textarea
                        value={tgQuestion}
                        onChange={(e) => setTgQuestion(e.target.value)}
                        placeholder="Enter table grid question"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Selection Mode</Label>
                      <Select
                        value={tgSelectionMode}
                        onValueChange={(value: "single" | "multiple") =>
                          setTgSelectionMode(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single Select</SelectItem>
                          <SelectItem value="multiple">
                            Multiple Select
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>First Column Header (optional)</Label>
                      <Input
                        value={tgFirstColumnHeader}
                        onChange={(e) => setTgFirstColumnHeader(e.target.value)}
                        placeholder="e.g., 'Categories'"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Row Labels</Label>
                        {tgRowLabels.map((label, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <Input
                              value={label}
                              onChange={(e) =>
                                updateTgRowLabel(idx, e.target.value)
                              }
                              placeholder={`Row ${idx + 1}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTgRow(idx)}
                              disabled={tgRowLabels.length <= 1}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addTgRow}
                        >
                          Add Row
                        </Button>
                      </div>

                      <div>
                        <Label>Column Labels</Label>
                        {tgColumnLabels.map((label, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <Input
                              value={label}
                              onChange={(e) =>
                                updateTgColumnLabel(idx, e.target.value)
                              }
                              placeholder={`Column ${idx + 1}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTgColumn(idx)}
                              disabled={tgColumnLabels.length <= 1}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addTgColumn}
                        >
                          Add Column
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>
                        Answer Matrix (Click cells to mark as correct)
                      </Label>
                      <div className="border rounded p-2 bg-white">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="border p-2 bg-gray-100">
                                {tgFirstColumnHeader || ""}
                              </th>
                              {tgColumnLabels.map((label, idx) => (
                                <th
                                  key={idx}
                                  className="border p-2 bg-gray-100"
                                >
                                  {label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tgRowLabels.map((rowLabel, rowIdx) => (
                              <tr key={rowIdx}>
                                <td className="border p-2 bg-gray-100 font-medium">
                                  {rowLabel}
                                </td>
                                {tgColumnLabels.map((_, colIdx) => (
                                  <td
                                    key={colIdx}
                                    className="border p-2 text-center"
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleTgCell(rowIdx, colIdx)
                                      }
                                      className={`w-6 h-6 rounded ${isCellSelected(rowIdx, colIdx)
                                          ? "bg-blue-500 text-white"
                                          : "bg-gray-200 hover:bg-gray-300"
                                        }`}
                                    >
                                      {isCellSelected(rowIdx, colIdx)
                                        ? "✓"
                                        : ""}
                                    </button>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {/* Show warning if Save is disabled due to no correct answers */}
                      {!validateTableGrid() && (
                        <div className="text-red-500 text-sm mt-2">
                          Please enter a question, fill all row/column labels,
                          and select at least one correct cell.
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Graph Selector Form */}
              {question_type_id !== null &&
                questionTypeMap[question_type_id] === "GRAPH_SELECTOR" && (
                  <div className="space-y-4">
                    <div>
                      <Label>Question</Label>
                      <Textarea
                        value={gsQuestion}
                        onChange={(e) => setGsQuestion(e.target.value)}
                        placeholder="Enter graph selector question"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Graph Instruction</Label>
                      <Input
                        value={gsGraphInstruction}
                        onChange={(e) => setGsGraphInstruction(e.target.value)}
                        placeholder="e.g., 'Click on the coordinate plane to select points'"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <Label>X Min</Label>
                        <Input
                          type="number"
                          value={gsXMin}
                          onChange={(e) => setGsXMin(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>X Max</Label>
                        <Input
                          type="number"
                          value={gsXMax}
                          onChange={(e) => setGsXMax(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Y Min</Label>
                        <Input
                          type="number"
                          value={gsYMin}
                          onChange={(e) => setGsYMin(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Y Max</Label>
                        <Input
                          type="number"
                          value={gsYMax}
                          onChange={(e) => setGsYMax(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label>Grid Interval</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={gsGridInterval}
                          onChange={(e) =>
                            setGsGridInterval(Number(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <Label>Max Selectable Points</Label>
                        <Input
                          type="number"
                          value={gsMaxSelectablePoints || ""}
                          onChange={(e) =>
                            setGsMaxSelectablePoints(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label>Graph Type</Label>
                        <Select
                          value={gsGraphType}
                          onValueChange={setGsGraphType}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cartesian">Cartesian</SelectItem>
                            <SelectItem value="number_line">
                              Number Line
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>X Axis Label</Label>
                        <Input
                          value={gsXAxisLabel}
                          onChange={(e) => setGsXAxisLabel(e.target.value)}
                          placeholder="e.g., 'Time'"
                        />
                      </div>
                      <div>
                        <Label>Y Axis Label</Label>
                        <Input
                          value={gsYAxisLabel}
                          onChange={(e) => setGsYAxisLabel(e.target.value)}
                          placeholder="e.g., 'Distance'"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showAxes"
                          checked={!!gsShowAxes}
                          onCheckedChange={(checked) =>
                            setGsShowAxes(Boolean(checked))
                          }
                        />
                        <Label htmlFor="showAxes">Show Axes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showLabels"
                          checked={!!gsShowLabels}
                          onCheckedChange={(checked) =>
                            setGsShowLabels(Boolean(checked))
                          }
                        />
                        <Label htmlFor="showLabels">Show Labels</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="snapToGrid"
                          checked={!!gsSnapToGrid}
                          onCheckedChange={(checked) =>
                            setGsSnapToGrid(Boolean(checked))
                          }
                        />
                        <Label htmlFor="snapToGrid">Snap to Grid</Label>
                      </div>
                    </div>

                    <div>
                      <Label>Points</Label>
                      {gsPoints.map((point, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <Input
                            type="number"
                            value={point.x}
                            onChange={(e) =>
                              updatePoint(idx, { x: Number(e.target.value) })
                            }
                            placeholder="X"
                            className="w-20"
                          />
                          <Input
                            type="number"
                            value={point.y}
                            onChange={(e) =>
                              updatePoint(idx, { y: Number(e.target.value) })
                            }
                            placeholder="Y"
                            className="w-20"
                          />
                          <Input
                            value={point.point_label || ""}
                            onChange={(e) =>
                              updatePoint(idx, { point_label: e.target.value })
                            }
                            placeholder="Label (optional)"
                            className="flex-1"
                          />
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={!!point.is_correct}
                              onCheckedChange={(checked) =>
                                updatePoint(idx, {
                                  is_correct: Boolean(checked),
                                })
                              }
                            />
                            <span className="text-xs">Correct</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePoint(idx)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          addPoint({ x: 0, y: 0, is_correct: false })
                        }
                      >
                        Add Point
                      </Button>
                    </div>
                  </div>
                )}

              {/* BLANK Form */}
              {question_type_id !== null &&
                questionTypeMap[question_type_id] === "BLANK" && (
                  <BlankForm
                    blankQuestion={blankQuestion}
                    setBlankQuestion={setBlankQuestion}
                    blankCorrectAnswer={blankCorrectAnswer}
                    setBlankCorrectAnswer={setBlankCorrectAnswer}
                    blankVariant={blankVariant}
                    setBlankVariant={setBlankVariant}
                  />
                )}

              {/* Hot Text Form */}
              {question_type_id !== null &&
                questionTypeMap[question_type_id] === "HOT_TEXT" &&
                !loadingData &&
                hotTextInitialValues && (
                  <HotTextForm
                    question={hotTextInitialValues.question || ""}
                    setQuestion={(q) => setHotTextInitialValues({ ...hotTextInitialValues, question: q })}
                    prompt={hotTextInitialValues.prompt || ""}
                    setPrompt={(p) => setHotTextInitialValues({ ...hotTextInitialValues, prompt: p })}
                    passage={hotTextInitialValues.passage || ""}
                    setPassage={(p) => setHotTextInitialValues({ ...hotTextInitialValues, passage: p })}
                    minSelections={hotTextInitialValues.min_selections || 1}
                    setMinSelections={(n) => setHotTextInitialValues({ ...hotTextInitialValues, min_selections: n })}
                    maxSelections={hotTextInitialValues.max_selections || 5}
                    setMaxSelections={(n) => setHotTextInitialValues({ ...hotTextInitialValues, max_selections: n })}
                    regions={hotTextInitialValues.regions || []}
                    setRegions={(r) => setHotTextInitialValues({ ...hotTextInitialValues, regions: r })}
                    difficulty={hotTextInitialValues.difficulty || 1}
                    setDifficulty={(d) => setHotTextInitialValues({ ...hotTextInitialValues, difficulty: d })}
                    onCancel={onClose}
                    initialValues={hotTextInitialValues}
                    istestpack={true}
                  />
                )}

              {/* Ray Selector Form */}
              {question_type_id !== null &&
                questionTypeMap[question_type_id] === "RAY_SELECTOR" && (
                  <div className="space-y-4">
                    <div>
                      <Label>Question/Prompt</Label>
                      <Textarea
                        value={rsQuestion}
                        onChange={(e) => setRsQuestion(e.target.value)}
                        placeholder="Enter ray selector question or prompt"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Difficulty (1-5)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm"
                        value={rsDifficulty || 1}
                        onChange={(e) =>
                          setRsDifficulty(Number(e.target.value))
                        }
                        placeholder="1 (Easy) - 5 (Hard)"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Number Line Min</Label>
                        <Input
                          type="number"
                          value={rsNumberlineMin}
                          onChange={(e) =>
                            setRsNumberlineMin(Number(e.target.value))
                          }
                          placeholder="e.g., -10"
                        />
                      </div>
                      <div>
                        <Label>Number Line Max</Label>
                        <Input
                          type="number"
                          value={rsNumberlineMax}
                          onChange={(e) =>
                            setRsNumberlineMax(Number(e.target.value))
                          }
                          placeholder="e.g., 10"
                        />
                      </div>
                      <div>
                        <Label>Tick Interval</Label>
                        <Input
                          type="number"
                          step="any"
                          value={rsTickInterval}
                          onChange={(e) =>
                            setRsTickInterval(Number(e.target.value))
                          }
                          placeholder="e.g., 1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Ray Type (Correct Answer)</Label>
                        <Select value={rsRayType} onValueChange={setRsRayType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="closed_left">
                              ◀● Closed Left
                            </SelectItem>
                            <SelectItem value="open_left">
                              ◀○ Open Left
                            </SelectItem>
                            <SelectItem value="open_right">
                              ○▶ Open Right
                            </SelectItem>
                            <SelectItem value="closed_right">
                              ●▶ Closed Right
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Endpoint Value (Correct Answer)</Label>
                        <Input
                          type="number"
                          step="any"
                          value={rsRayEndpoint}
                          onChange={(e) =>
                            setRsRayEndpoint(Number(e.target.value))
                          }
                          placeholder="Enter endpoint value"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Explanation (optional)</Label>
                      <Textarea
                        value={rsExplanation}
                        onChange={(e) => setRsExplanation(e.target.value)}
                        placeholder="Explanation for the correct ray"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
            </>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading || loadingData}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || loadingData || !isValid()}
          >
            {loading
              ? "Saving..."
              : loadingData
                ? "Loading..."
                : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};