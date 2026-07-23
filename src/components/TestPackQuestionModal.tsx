import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useAuthStore } from "../stores/authStore";
import { toast } from "sonner";
import { MultipleChoiceForm } from "./question-modal/question-types/MultipleChoiceForm";
import { MultiAnswerForm } from "./question-modal/question-types/MultiAnswerForm";
import { BlankForm } from "./question-modal/question-types/BlankForm";
import { useMCState } from "./question-modal/hooks/useMCState";
import { useMAState } from "./question-modal/hooks/useMAState";
import {
  useTestPackTableGridState,
  useTestPackGraphSelectorState,
  useTestPackBlankState,
  useTestPackRaySelectorState,
} from "./test-pack/hooks";
import { RCForm } from "./question-modal/question-types/RCForm";
import { TagSlot } from "./shared/ChoiceTagEditor";
import { saveChoiceTags } from "../services/tagService";

interface TestPackQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: any;
  testId: number;
  onSave?: (question: any) => void;
}

export const TestPackQuestionModal: React.FC<TestPackQuestionModalProps> = ({
  isOpen,
  onClose,
  initialValues,
  testId,
  onSave,
}) => {
  /* console.log("TestPackQuestionModal rendered with:", {
    isOpen,
    testId,
    initialValues,
  }); */

  // Support MC, MA, TABLE_GRID, GRAPH_SELECTOR, RAY_SELECTOR, BLANK, RC, REA, REB, EQUATION_CALCULATOR
  const [questionType, setQuestionType] = useState<
    | "MC"
    | "MA"
    | "TABLE_GRID"
    | "GRAPH_SELECTOR"
    | "RAY_SELECTOR"
    | "BLANK"
    | "RC"
    | "REA"
    | "REB"
    | "EQUATION_CALCULATOR"
  >("MC");

  // MC state
  const [choiceTagSlots, setChoiceTagSlots] = useState<Record<string, TagSlot[]>>({});
  const [blankTagSlots, setBlankTagSlots] = useState<TagSlot[]>([]);
  const mcState = useMCState();
  const {
    mcQuestion,
    setMcQuestion,
    mcChoices,
    setMcChoices,
    mcExplanation,
    setMcExplanation,
    mcVariant,
    setMcVariant,
    addMcChoice,
    removeMcChoice,
    updateMcChoice,
    setCorrectChoice,
    mcValid,
    resetMCState,
  } = mcState;

  // MA state
  const maState = useMAState();
  const {
    maQuestion,
    setMaQuestion,
    maExplanation,
    setMaExplanation,
    maChoices,
    setMaChoices,
    addMaChoice,
    removeMaChoice,
    updateMaChoice,
    maValid,
    resetMAState,
  } = maState;

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

  // BLANK state
  const blankState = useTestPackBlankState();
  const {
    blankQuestion,
    setBlankQuestion,
    blankCorrectAnswer,
    setBlankCorrectAnswer,
    blankVariant,
    setBlankVariant,
    // blankExplanation,
    // setBlankExplanation,
    resetBlankState,
    blankValid,
  } = blankState;

  // Ray Selector state
  const [rsDifficulty, setRsDifficulty] = useState(1);
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

  // RC form state
  const [rcPassage, setRcPassage] = useState("");
  const [rcStartPage, setRcStartPage] = useState<number | undefined>(undefined);
  const [rcEndPage, setRcEndPage] = useState<number | undefined>(undefined);
  const [rcImageUrl, setRcImageUrl] = useState<string>("");

  // Prefill state on open for editing
  useEffect(() => {
    if (isOpen && initialValues) {
      setQuestionType(initialValues.question_type || "MC");
      if (initialValues.question_type === "MC") {
        setMcQuestion(initialValues.question || "");
        setMcChoices(initialValues.choices || []);
        setMcExplanation(initialValues.explanation || "");
        setMcVariant(initialValues.question_category || "standard");
      } else if (initialValues.question_type === "MA") {
        setMaQuestion(initialValues.question || "");
        setMaChoices(initialValues.choices || []);
        setMaExplanation(initialValues.explanation || "");
      } else if (initialValues.question_type === "TABLE_GRID") {
        setTgQuestion(initialValues.question || "");
        setTgSelectionMode(initialValues.selection_mode || "single");
        setTgRowLabels(initialValues.row_labels || []);
        setTgColumnLabels(initialValues.column_labels || []);
        setTgRowOrder(initialValues.row_order || []);
        setTgColumnOrder(initialValues.column_order || []);
        setTgFirstColumnHeader(initialValues.first_column_header || "");
        setTgAnswerMatrix(initialValues.answer_matrix || []);
      } else if (initialValues.question_type === "GRAPH_SELECTOR") {
        setGsQuestion(initialValues.question || "");
        setGsXMin(initialValues.x_min || -5);
        setGsXMax(initialValues.x_max || 5);
        setGsYMin(initialValues.y_min || -5);
        setGsYMax(initialValues.y_max || 5);
        setGsMaxSelectablePoints(initialValues.max_selectable_points);
        setGsGraphInstruction(initialValues.graph_instruction || "");
        setGsGraphType(initialValues.graph_type || "cartesian");
        setGsShowAxes(initialValues.show_axes !== false);
        setGsShowLabels(initialValues.show_labels !== false);
        setGsSnapToGrid(initialValues.snap_to_grid !== false);
        setGsGridInterval(initialValues.grid_interval || 1.0);
        setGsXAxisLabel(initialValues.x_axis_label || "");
        setGsYAxisLabel(initialValues.y_axis_label || "");
        setGsPoints(initialValues.points || []);
      } else if (initialValues.question_type === "BLANK") {
        setBlankQuestion(initialValues.question || "");
        setBlankCorrectAnswer(initialValues.correct_answer || "");
        setBlankVariant(
          initialValues.question_category === "fill_box"
            ? "fill_box"
            : "placeholder",
        );
        // setBlankExplanation(initialValues.explanation || "");
      } else if (initialValues.question_type === "RAY_SELECTOR") {
        setRsQuestion(initialValues.question || "");
        setRsNumberlineMin(initialValues.numberline_min || -10);
        setRsNumberlineMax(initialValues.numberline_max || 10);
        setRsTickInterval(initialValues.tick_interval || 1);
        setRsRayType(initialValues.ray_correct_type || "closed_right");
        setRsRayEndpoint(initialValues.ray_correct_position || 0);
        setRsExplanation(initialValues.explanation || "");
        setRsDifficulty(initialValues.difficulty || 1);
      } else if (initialValues.question_type === "RC" || 
                 initialValues.question_type === "REA" || 
                 initialValues.question_type === "REB" ||
                 (initialValues.passage_id && Number(initialValues.passage_id) > 0)) {
        // Handle RC, REA, REB, or ANY question with passage (MC, MA, etc.)
        setRcPassage(initialValues.passage || "");
        setRcStartPage(initialValues.start_page || undefined);
        setRcEndPage(initialValues.end_page || undefined);
        setRcImageUrl(initialValues.image_url || "");
      }
    } else if (isOpen && !initialValues) {
      setQuestionType("MC");
      resetMCState();
      resetMAState();
      resetTableGridState();
      resetGraphSelectorState();
      resetBlankState();
      resetRaySelectorState();
      setRsDifficulty(1);
      setChoiceTagSlots({});
      setBlankTagSlots([]);
    }
    // eslint-disable-next-line
  }, [isOpen, initialValues]);

  const userName = useAuthStore.getState().getUserName();

  const handleSave = async () => {
    if (!testId || testId === 0) {
      toast.error("Please select a test first before adding questions.");
      return;
    }

    let payload: any = {};
    let endpoint = "";

    /* console.log("VITE_API_URL:", import.meta.env.VITE_API_URL); */
    /* console.log("testId:", testId); */
    /* console.log("questionType:", questionType); */

    if (questionType === "MC") {
      endpoint = `${import.meta.env.VITE_API_URL}/api/test-pack/mc/create`;
      payload = {
        test_id: testId,
        question: mcQuestion,
        choices: mcChoices.map((choice) => ({
          letter: choice.letter,
          value: {
            text: choice.value.text,
            is_correct: choice.value.is_correct,
            choice_image_url: choice.value.choice_image_url || null,
          },
        })),
        question_category: mcVariant || "standard",
        explanation: mcExplanation,
        created_by: userName,
        last_edited_by: userName,
      };
    } else if (questionType === "MA") {
      endpoint = `${import.meta.env.VITE_API_URL}/api/test-pack/ma/create`;
      payload = {
        test_id: testId,
        question: maQuestion,
        choices: maChoices.map((choice) => ({
          choice_label: choice.choice_label,
          choice_text: choice.choice_text,
          is_correct: choice.is_correct,
          choice_image_url: choice.choice_image_url || null,
        })),
        question_category: "standard",
        question_type: "MA", // Ensure type is set
        question_type_acronym: "MA", // Ensure acronym is set
        explanation: maExplanation,
        created_by: userName,
        last_edited_by: userName,
      };
    } else if (questionType === "TABLE_GRID") {
      endpoint = `${import.meta.env.VITE_API_URL}/api/test-pack/table-grid/create`;
      payload = {
        question: tgQuestion,
        selection_mode: tgSelectionMode,
        row_labels: tgRowLabels,
        column_labels: tgColumnLabels,
        row_order: tgRowOrder,
        column_order: tgColumnOrder,
        first_column_header: tgFirstColumnHeader,
        answer_matrix: tgAnswerMatrix,
        test_id: testId,
        difficulty: 1,
        created_by: userName,
        last_edited_by: userName,
      };
    } else if (questionType === "GRAPH_SELECTOR") {
      endpoint = `${import.meta.env.VITE_API_URL}/api/test-pack/graph-selector/create`;
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
        test_id: testId,
        difficulty: 1,
        created_by: userName,
        last_edited_by: userName,
      };
    } else if (questionType === "BLANK") {
      const endpointPath =
        blankVariant === "fill_box" ? "create/fill-box" : "create/placeholder";
      endpoint = `${import.meta.env.VITE_API_URL}/api/test-pack/blank/${endpointPath}`;
      payload = {
        test_id: testId,
        question: blankQuestion,
        correct_answer: blankCorrectAnswer,
        difficulty: 1,
        created_by: userName,
        last_edited_by: userName,
      };
    } else if (questionType === "RAY_SELECTOR") {
      endpoint = `${import.meta.env.VITE_API_URL}/api/test-pack/ray-selector/create`;
      payload = {
        test_id: testId,
        question: rsQuestion,
        numberline_min: rsNumberlineMin,
        numberline_max: rsNumberlineMax,
        tick_interval: rsTickInterval,
        ray_correct_type: rsRayType,
        ray_correct_position: rsRayEndpoint,
        explanation: rsExplanation,
        difficulty: rsDifficulty || 1,
        created_by: userName,
        last_edited_by: userName,
      };
    } else if (initialValues?.passage_id && Number(initialValues.passage_id) > 0) {
      // Handle ANY question with passage (RC, REA, REB, MC, MA, etc.)
      if (!initialValues?.passage_id) {
        endpoint = `${import.meta.env.VITE_API_URL}/api/test-pack/passages/create`;
        payload = {
          passage: rcPassage,
          created_by: userName,
          last_edited_by: userName,
          test_id: testId,
          ...(rcStartPage !== undefined ? { start_page: rcStartPage } : {}),
          ...(rcEndPage !== undefined ? { end_page: rcEndPage } : {}),
          ...(rcImageUrl ? { image_url: rcImageUrl } : {}),
        };
      } else {
        endpoint = `${import.meta.env.VITE_API_URL}/api/test-pack/passages/update/${initialValues.passage_id}`;
        payload = {
          passage: rcPassage,
          created_by: userName,
          last_edited_by: userName,
          test_id: testId,
          ...(rcStartPage !== undefined ? { start_page: rcStartPage } : {}),
          ...(rcEndPage !== undefined ? { end_page: rcEndPage } : {}),
          ...(rcImageUrl ? { image_url: rcImageUrl } : {}),
        };
      }
      try {
        /* console.log("Sending payload to:", endpoint); */
        /* console.log("Payload structure:", JSON.stringify(payload, null, 2)); */
        const method = !initialValues?.passage_id ? "POST" : "PUT";
        const response = await fetch(endpoint, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to update passage");
        }

        const data = await response.json();
        /* console.log("Success response:", data); */
        toast.success("Passage updated successfully");
        if (onSave) onSave(data);
        onClose();
        return; // Return early to avoid falling through to the duplicate try-catch
      } catch (error) {
        console.error("Error updating passage:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update passage",
        );
        return; // Return early to avoid falling through to the duplicate try-catch
      }
    } else {
      toast.error("Unsupported question type.");
      return;
    }
    try {
      /* console.log("Sending payload to:", endpoint); */
      /* console.log("Payload structure:", JSON.stringify(payload, null, 2)); */
      /* console.log("MC Choices structure:", mcChoices); */
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add question");
      }

      const data = await response.json();
      /* console.log("Success response:", data); */

      // Save tags after successful save
      const savedQuestionId = data?.id || data?.question_id;
      const returnedChoices = data?.choices || data?.choice_details || [];

      if (savedQuestionId && Array.isArray(returnedChoices) && returnedChoices.length > 0) {
        const tagPromises = returnedChoices.map((choice: any) => {
          const letter = choice.choice_label || choice.letter;
          const slots = choiceTagSlots[letter] ?? [];

          if (slots.some((s) => s.tag_name.trim())) {
            const validTags = slots
              .filter((s) => s.tag_name.trim())
              .map((s, i) => ({
                tag_id: s.tag_id,
                tag_name: s.tag_name.trim(),
                tag_category: (s.tag_category || "").trim() || undefined,
                tag_order: (i + 1) as 1 | 2 | 3,
                rationale: s.rationale,
              }));

            return saveChoiceTags(
              choice.id,
              "test_pack",
              validTags
            );
          }
          return Promise.resolve();
        });

        await Promise.all(tagPromises).catch((err) => {
          console.warn("Some tags failed to save:", err);
          toast.warning("Question saved, but some reasoning patterns failed to save.");
        });
      }

      // Sync tags for Blank question
      if (questionType === "BLANK" && blankTagSlots && blankTagSlots.length > 0) {
        const qId = data.question_id || data.id;
        if (qId) {
          try {
            await saveChoiceTags(qId, "test_pack", blankTagSlots.map((s, i) => ({
              ...s,
              tag_order: (i + 1) as 1 | 2 | 3
            })));
          } catch (tagError) {
            console.error("Failed to sync tags for blank question:", tagError);
          }
        }
      }

      toast.success("Question added successfully");
      if (onSave) onSave(data);
      onClose();
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add question",
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {initialValues ? "Edit Question" : "Add Question"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {(!testId || testId === 0) && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Please select a test from the filters before adding questions.
              </p>
            </div>
          )}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Question Type</label>
            <select
              className="border rounded px-2 py-1"
              value={questionType}
              onChange={(e) =>
                setQuestionType(
                  e.target.value as
                    | "MC"
                    | "MA"
                    | "TABLE_GRID"
                    | "GRAPH_SELECTOR"
                    | "RAY_SELECTOR"
                    | "BLANK"
                    | "RC"
                    | "REA"
                    | "REB"
                    | "EQUATION_CALCULATOR",
                )
              }
              disabled={!!initialValues}
            >
              <option value="MC">Multiple Choice</option>
              <option value="MA">Multiple Answer</option>
              <option value="TABLE_GRID">Table Grid</option>
              <option value="GRAPH_SELECTOR">Graph Selector</option>
              <option value="RAY_SELECTOR">Ray Selector</option>
              <option value="BLANK">Fill in the Blank</option>
              <option value="RC">Reading Comprehension</option>
              <option value="REA">Reading Comprehension A</option>
              <option value="REB">Reading Comprehension B</option>
              <option value="EQUATION_CALCULATOR">Equation Calculator</option>
            </select>
          </div>
          {questionType === "MC" && (
            <MultipleChoiceForm
              mcQuestion={mcQuestion}
              setMcQuestion={setMcQuestion}
              mcChoices={mcChoices}
              updateMcChoice={updateMcChoice}
              setCorrectChoice={setCorrectChoice}
              removeMcChoice={removeMcChoice}
              mcVariant={mcVariant}
              setMcVariant={setMcVariant}
              questionImageUrl={undefined}
              onQuestionImageUploaded={() => {}}
              onQuestionImageDeleted={() => {}}
              onChoiceImageUploaded={() => {}}
              onChoiceImageDeleted={() => {}}
              questionId={initialValues?.question_id || initialValues?.id}
              userName={userName}
              mcExplanation={mcExplanation}
              setMcExplanation={setMcExplanation}
              addMcChoice={addMcChoice}
              isTestPack={true}
              choiceTagSlots={choiceTagSlots}
              setChoiceTagSlots={setChoiceTagSlots}
            />
          )}
          {questionType === "MA" && (
            <MultiAnswerForm
              maQuestion={maQuestion}
              setMaQuestion={setMaQuestion}
              maExplanation={maExplanation}
              setMaExplanation={setMaExplanation}
              maChoices={maChoices}
              updateMaChoice={updateMaChoice}
              removeMaChoice={removeMaChoice}
              addMaChoice={addMaChoice}
              questionImageUrl={undefined}
              onQuestionImageUploaded={() => {}}
              onQuestionImageDeleted={() => {}}
              onChoiceImageUploaded={() => {}}
              onChoiceImageDeleted={() => {}}
              questionId={initialValues?.question_id || initialValues?.id}
              userName={userName}
              isTestPack={true}
              choiceTagSlots={choiceTagSlots}
              setChoiceTagSlots={setChoiceTagSlots}
            />
          )}
          {questionType === "TABLE_GRID" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={tgQuestion}
                  onChange={(e) => setTgQuestion(e.target.value)}
                  placeholder="Enter the table grid question"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selection Mode
                </label>
                <select
                  value={tgSelectionMode}
                  onChange={(e) =>
                    setTgSelectionMode(e.target.value as "single" | "multiple")
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="single">Single Select</option>
                  <option value="multiple">Multiple Select</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Column Header (optional)
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={tgFirstColumnHeader}
                  onChange={(e) => setTgFirstColumnHeader(e.target.value)}
                  placeholder="e.g., Categories, Items, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Row Labels
                </label>
                {tgRowLabels.map((label, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={label}
                      onChange={(e) => {
                        const newLabels = [...tgRowLabels];
                        newLabels[idx] = e.target.value;
                        setTgRowLabels(newLabels);
                      }}
                      placeholder={`Row ${idx + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tgRowLabels.length > 1) {
                          setTgRowLabels(
                            tgRowLabels.filter((_, i) => i !== idx),
                          );
                        }
                      }}
                      className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setTgRowLabels([
                      ...tgRowLabels,
                      `Row ${tgRowLabels.length + 1}`,
                    ])
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Row
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Column Labels
                </label>
                {tgColumnLabels.map((label, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={label}
                      onChange={(e) => {
                        const newLabels = [...tgColumnLabels];
                        newLabels[idx] = e.target.value;
                        setTgColumnLabels(newLabels);
                      }}
                      placeholder={`Column ${idx + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tgColumnLabels.length > 1) {
                          setTgColumnLabels(
                            tgColumnLabels.filter((_, i) => i !== idx),
                          );
                        }
                      }}
                      className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setTgColumnLabels([
                      ...tgColumnLabels,
                      `Column ${tgColumnLabels.length + 1}`,
                    ])
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Column
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer Matrix (Select correct cells)
                </label>
                <div className="border border-gray-300 rounded-md p-4 bg-gray-50 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 p-2 bg-gray-100 min-w-[100px]">
                          {tgFirstColumnHeader || ""}
                        </th>
                        {tgColumnLabels.map((colLabel, colIdx) => (
                          <th
                            key={colIdx}
                            className="border border-gray-300 p-2 bg-gray-100 min-w-[100px]"
                          >
                            {colLabel}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tgRowLabels.map((rowLabel, rowIdx) => (
                        <tr key={rowIdx}>
                          <td className="border border-gray-300 p-2 bg-gray-100 font-medium">
                            {rowLabel}
                          </td>
                          {tgColumnLabels.map((_, colIdx) => {
                            const isCorrect = tgAnswerMatrix.some(
                              (answer) =>
                                answer.row_index === rowIdx &&
                                answer.column_index === colIdx &&
                                answer.is_correct,
                            );
                            return (
                              <td
                                key={colIdx}
                                className="border border-gray-300 p-2 text-center"
                              >
                                <input
                                  type={
                                    tgSelectionMode === "single"
                                      ? "radio"
                                      : "checkbox"
                                  }
                                  name={
                                    tgSelectionMode === "single"
                                      ? `row-${rowIdx}`
                                      : undefined
                                  }
                                  checked={isCorrect}
                                  onChange={() => {
                                    const existingIndex =
                                      tgAnswerMatrix.findIndex(
                                        (answer) =>
                                          answer.row_index === rowIdx &&
                                          answer.column_index === colIdx,
                                      );

                                    if (tgSelectionMode === "single") {
                                      // For single mode, clear the row and set only this cell
                                      const newMatrix = tgAnswerMatrix.filter(
                                        (answer) => answer.row_index !== rowIdx,
                                      );
                                      newMatrix.push({
                                        row_index: rowIdx,
                                        column_index: colIdx,
                                        is_correct: true,
                                      });
                                      setTgAnswerMatrix(newMatrix);
                                    } else {
                                      // For multiple mode, toggle this cell
                                      if (existingIndex >= 0) {
                                        setTgAnswerMatrix(
                                          tgAnswerMatrix.filter(
                                            (_, i) => i !== existingIndex,
                                          ),
                                        );
                                      } else {
                                        setTgAnswerMatrix([
                                          ...tgAnswerMatrix,
                                          {
                                            row_index: rowIdx,
                                            column_index: colIdx,
                                            is_correct: true,
                                          },
                                        ]);
                                      }
                                    }
                                  }}
                                  className="w-4 h-4"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {questionType === "GRAPH_SELECTOR" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={gsQuestion}
                  onChange={(e) => setGsQuestion(e.target.value)}
                  placeholder="Enter the graph selector question"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Graph Instructions (optional)
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={gsGraphInstruction}
                  onChange={(e) => setGsGraphInstruction(e.target.value)}
                  placeholder="Additional instructions for students"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    X Min
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={gsXMin}
                    onChange={(e) => setGsXMin(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    X Max
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={gsXMax}
                    onChange={(e) => setGsXMax(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Y Min
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={gsYMin}
                    onChange={(e) => setGsYMin(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Y Max
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={gsYMax}
                    onChange={(e) => setGsYMax(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points (mark correct ones)
                </label>
                <div className="space-y-2">
                  {gsPoints.map((point, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="number"
                        placeholder="X"
                        className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm"
                        value={point.x}
                        onChange={(e) =>
                          updatePoint(idx, {
                            ...point,
                            x: Number(e.target.value),
                          })
                        }
                      />
                      <input
                        type="number"
                        placeholder="Y"
                        className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm"
                        value={point.y}
                        onChange={(e) =>
                          updatePoint(idx, {
                            ...point,
                            y: Number(e.target.value),
                          })
                        }
                      />
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={point.is_correct}
                          onChange={(e) =>
                            updatePoint(idx, {
                              ...point,
                              is_correct: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Correct</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removePoint(idx)}
                        className="px-2 py-1 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addPoint({ x: 0, y: 0, is_correct: false })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Point
                  </button>
                </div>
              </div>
            </div>
          )}
          {questionType === "RAY_SELECTOR" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question/Prompt
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={rsQuestion}
                  onChange={(e) => setRsQuestion(e.target.value)}
                  placeholder="Enter the ray selector question or prompt"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty (1-5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={rsDifficulty || 1}
                  onChange={(e) => setRsDifficulty(Number(e.target.value))}
                  placeholder="1 (Easy) - 5 (Hard)"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number Line Min
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={rsNumberlineMin}
                    onChange={(e) => setRsNumberlineMin(Number(e.target.value))}
                    placeholder="e.g., -10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number Line Max
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={rsNumberlineMax}
                    onChange={(e) => setRsNumberlineMax(Number(e.target.value))}
                    placeholder="e.g., 10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tick Interval
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={rsTickInterval}
                    onChange={(e) => setRsTickInterval(Number(e.target.value))}
                    placeholder="e.g., 1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ray Type (Correct Answer)
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={rsRayType}
                    onChange={(e) => setRsRayType(e.target.value)}
                  >
                    <option value="closed_left">◀● Closed Left</option>
                    <option value="open_left">◀○ Open Left</option>
                    <option value="open_right">○▶ Open Right</option>
                    <option value="closed_right">●▶ Closed Right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endpoint Value (Correct Answer)
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={rsRayEndpoint}
                    onChange={(e) => setRsRayEndpoint(Number(e.target.value))}
                    placeholder="Enter endpoint value"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Explanation (optional)
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  value={rsExplanation}
                  onChange={(e) => setRsExplanation(e.target.value)}
                  placeholder="Explanation for the correct ray"
                />
              </div>
            </div>
          )}
          {questionType === "BLANK" && (
            <BlankForm
              blankQuestion={blankQuestion}
              setBlankQuestion={setBlankQuestion}
              // blankExplanation={blankExplanation}
              // setBlankExplanation={setBlankExplanation}
              blankCorrectAnswer={blankCorrectAnswer}
              setBlankCorrectAnswer={setBlankCorrectAnswer}
              blankVariant={blankVariant}
              setBlankVariant={setBlankVariant}
              isTestPack={true}
              choiceTagSlots={blankTagSlots}
              setChoiceTagSlots={setBlankTagSlots}
              choiceId={initialValues?.question_id || initialValues?.id} blankExplanation={""} setBlankExplanation={function (value: string): void {
                throw new Error("Function not implemented.");
              } }            />
          )}
          {(questionType === "RC" || 
            questionType === "REA" || 
            questionType === "REB" ||
            (initialValues?.passage_id && Number(initialValues.passage_id) > 0)) && (
            <RCForm
              rcPassage={rcPassage}
              setRcPassage={setRcPassage}
              rcStartPage={rcStartPage}
              setRcStartPage={setRcStartPage}
              rcEndPage={rcEndPage}
              setRcEndPage={setRcEndPage}
              rcImageUrl={rcImageUrl}
              setRcImageUrl={setRcImageUrl}
            />
          )}
        </div>

        <DialogFooter className="flex-shrink-0 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              /* console.log("Save button clicked in TestPackQuestionModal"); */
              handleSave();
            }}
            disabled={
              !testId ||
              testId === 0 ||
              (questionType === "MC" && !mcValid) ||
              (questionType === "MA" && !maValid) ||
              (questionType === "TABLE_GRID" && !validateTableGrid()) ||
              (questionType === "GRAPH_SELECTOR" && !validateGraphSelector()) ||
              (questionType === "RAY_SELECTOR" && !validateRaySelector()) ||
              (questionType === "BLANK" && !blankValid) ||
              ((questionType === "RC" || 
                questionType === "REA" || 
                questionType === "REB" ||
                (initialValues?.passage_id && Number(initialValues.passage_id) > 0)) &&
                (!rcPassage || !rcStartPage || !rcEndPage))
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
