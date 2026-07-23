// import React, { useState, useEffect, useRef, useCallback } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "./ui/dialog";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Label } from "./ui/label";
// import { Textarea } from "./ui/textarea";
// import HotTextEditor from "./HotTextEditor";
// import { toast } from "sonner";
// import { useAuthStore } from "../stores/authStore";
// import { usePostHogAnalytics, trackQuestionCreation } from "../lib/posthog-analytics";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "./ui/select";
// import ImageUpload from "./ImageUpload";

// import TableGridEditor from "./TableGridEditor";
// import {
//   QuestionModalProps,
//   MCChoice,
//   MCVariant,
//   DnDBucket,
//   DnDChoice,
//   DnDAssignment,
//   QUESTION_TYPES,
//   DND_SUBTYPES,
//   DnDSubtype,
//   MultipleChoiceForm,
//   MultiAnswerForm,
//   BlankForm,
//   HotTextForm,
//   TrueFalseForm,
//   DragDropForm,
//   TableGridForm,
//   RaySelectorForm,
//   GraphSelectorForm,
//   RaySelectorInteractivePreview,
//   GraphSelectorInteractivePreview,
// } from "./question-modal";
// import {
//   useMCState,
//   useMAState,
//   useBlankState,
//   useTFState,
//   useRaySelectorState,
//   useGraphSelectorState,
//   type BlankVariant,
// } from "./question-modal/hooks";
// import {
//   handleTgRowLabelChange,
//   handleTgColumnLabelChange,
//   handleTgAddRow,
//   handleTgRemoveRow,
//   handleTgAddColumn,
//   handleTgRemoveColumn,
//   handleTgCellToggle,
//   validateTableGrid,
//   handleTableGridSave,
//   // handleRaySelectorSave,
//   handleGraphSelectorSave,
// } from "./question-modal/handlers";
// import { RCForm } from "./question-modal/question-types/RCForm";
// import { useMCModalState } from "./question-modal/hooks/useMCModalState";
// import { useMAModalState } from "./question-modal/hooks/useMAModalState";
// import { useTFModalState } from "./question-modal/hooks/useTFModalState";
// import { useDnDModalState } from "./question-modal/hooks/useDnDModalState";
// import { useBlankModalState } from "./question-modal/hooks/useBlankModalState";
// import { useTableGridModalState } from "./question-modal/hooks/useTableGridModalState";
// import { useGraphSelectorModalState } from "./question-modal/hooks/useGraphSelectorModalState";
// import { GraphSelectorPoint } from "../services/graphSelectorService";
// import { useRaySelectorModalState } from "./question-modal/hooks/useRaySelectorModalState";
// import { useHotTextModalState } from "./question-modal/hooks/useHotTextModalState";
// import { testPackService } from "../services/testPackService";
// import { EquationCalculatorForm } from "./question-modal/question-types/EquationCalculatorForm";
// import { useEquationCalculatorState } from "./question-modal/hooks/useEquationCalculatorState";

// // Removed duplicate interfaces and components - now imported from question-modal module

// export const QuestionModal: React.FC<QuestionModalProps> = function QuestionModal({
//   isOpen,
//   onClose,
//   onSave,
//   initialValues,
//   istestpack,
//   isPassageEdit = false,
// }): JSX.Element {
//   // Extract isPassageEdit from initialValues if not provided as prop
//   const shouldEditPassage = isPassageEdit || initialValues?.isPassageEdit;
//   // Initialize questionType - let useEffect handle the setting based on initialValues
//   const [questionType, setQuestionType] = useState("MC");

//   // Analytics hook
//   const analytics = usePostHogAnalytics();

//   // Subject and Category state (for test pack only)
//   const [subject, setSubject] = useState<string>("");
//   const [mainTopicId, setMainTopicId] = useState<string>("");
//   const [categoryId, setCategoryId] = useState<string>("");
//   const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
//   const [mainTopics, setMainTopics] = useState<Array<{ id: number; name: string }>>([]);
//   const [categoriesLoading, setCategoriesLoading] = useState(false);
//   const [categoriesError, setCategoriesError] = useState<string | null>(null);
//   const [mainTopicsLoading, setMainTopicsLoading] = useState(false);
//   const [mainTopicsError, setMainTopicsError] = useState<string | null>(null);

//   // Subject to parent ID mapping
//   const SUBJECT_TO_PARENT_ID = {
//     "Mathematics": 867,
//     "ELA": 976
//   };

//   // Add logging to see what initialValues we receive
//   console.log("🎭 QuestionModal render:", {
//     isOpen,
//     initialValueQuestionType: initialValues?.question_type,
//     currentQuestionTypeState: questionType,
//     hasInitialValues: !!initialValues,
//     initialValuesId: initialValues?.id,
//   });

//   // ⭐ CRITICAL FIX: Update questionType when initialValues change (for async loading)
//   useEffect(() => {
//     console.log("🔄 useEffect triggered - initialValues changed:", {
//       hasInitialValues: !!initialValues,
//       questionType: initialValues?.question_type,
//       questionTypeAcronym: initialValues?.question_type_acronym,
//       isOpen,
//     });

//     if (isOpen && initialValues) {
//       // FIXED: For passage editing, check shouldEditPassage flag first and override type to RC
//       // This ensures that when editing a passage, we show the passage form regardless of original question type
//       if (shouldEditPassage) {
//         console.log("📝 Detected passage editing mode, forcing RC form for passage editing");
//         setQuestionType("RC"); // Use RC form for passage editing
//         return;
//       }

//       // Otherwise proceed with normal question type detection
//       const detectedType =
//         initialValues.question_type || initialValues.question_type_acronym;
//       if (detectedType) {
//         console.log("📝 Updating questionType to:", detectedType);
//         setQuestionType(detectedType);
//       } else {
//         console.log("📝 No question type detected, setting questionType to MC");
//         setQuestionType("MC");
//       }
//     } else if (isOpen && !initialValues) {
//       console.log("📝 No initialValues, setting questionType to MC");
//       setQuestionType("MC");
//     }
//   }, [initialValues, isOpen, shouldEditPassage]);

//   // Debug: Track questionType changes
//   useEffect(() => {
//     console.log("🎯 questionType state changed to:", questionType);
//   }, [questionType]);

//   // Use custom hooks for state management
//   const mcState = useMCState();
//   const {
//     mcQuestion,
//     setMcQuestion,
//     mcChoices,
//     setMcChoices,
//     mcExplanation,
//     setMcExplanation,
//     mcVariant,
//     setMcVariant,
//     addMcChoice,
//     removeMcChoice,
//     updateMcChoice,
//     setCorrectChoice,
//     mcValid,
//     resetMCState,
//   } = mcState;

//   const maState = useMAState();
//   const {
//     maQuestion,
//     setMaQuestion,
//     maExplanation,
//     setMaExplanation,
//     maChoices,
//     setMaChoices,
//     addMaChoice,
//     removeMaChoice,
//     updateMaChoice,
//     maValid,
//     resetMAState,
//   } = maState;

//   const blankState = useBlankState();
//   const {
//     blankQuestion,
//     setBlankQuestion,
//     blankCorrectAnswer,
//     setBlankCorrectAnswer,
//     blankExplanation,
//     setBlankExplanation,
//     blankVariant,
//     setBlankVariant,
//     blankValid,
//     resetBlankState,
//   } = blankState;

//   const tfState = useTFState();
//   const {
//     tfQuestion,
//     setTfQuestion,
//     tfAnswer,
//     setTfAnswer,
//     tfExplanation,
//     setTfExplanation,
//     tfValid,
//     resetTFState,
//   } = tfState;

//   // DND Subtype state
//   const [dndSubtype, setDndSubtype] =
//     useState<DnDSubtype>("two_buckets_single");

//   const dndState = useDnDModalState(initialValues, isOpen, onSave, onClose, !!istestpack, dndSubtype, subject, categoryId);

//   // Graph Selector state
//   const graphSelectorState = useGraphSelectorState();
//   const {
//     graphPrompt,
//     setGraphPrompt,
//     xMin,
//     setXMin,
//     xMax,
//     setXMax,
//     yMin,
//     setYMin,
//     yMax,
//     setYMax,
//     gridInterval,
//     setGridInterval,
//     maxSelectablePoints,
//     setMaxSelectablePoints,
//     showAxes,
//     setShowAxes,
//     showLabels,
//     setShowLabels,
//     snapToGrid,
//     setSnapToGrid,
//     graphInstruction,
//     setGraphInstruction,
//     availablePoints,
//     setAvailablePoints,
//     correctPoints,
//     setCorrectPoints,
//     graphExplanation,
//     setGraphExplanation,
//     graphSelectorValid,
//     resetGraphSelectorState,
//     xAxisLabel,
//     setXAxisLabel,
//     yAxisLabel,
//     setYAxisLabel,
//   } = graphSelectorState;

//   // Table Grid state
//   const [tgPrompt, setTgPrompt] = useState("");
//   const [tgRowLabels, setTgRowLabels] = useState<string[]>(["Row 1"]);
//   const [tgColumnLabels, setTgColumnLabels] = useState<string[]>([
//     "Column 1",
//     "Column 2",
//   ]);
//   const [tgSelectionMode, setTgSelectionMode] = useState<"single" | "multiple">(
//     "single",
//   );
//   const [tgFirstColumnHeader, setTgFirstColumnHeader] = useState<string>("");
//   const [tgAnswerMatrix, setTgAnswerMatrix] = useState<
//     { row_index: number; column_index: number; is_correct: boolean }[]
//   >([]);
//   const [tgErrors, setTgErrors] = useState<string[]>([]);
//   const [tgServerError, setTgServerError] = useState<string | null>(null);
//   const [tgDifficulty, setTgDifficulty] = useState<number>(3);

//   // Difficulty state variables for all question types
//   const [mcDifficulty, setMcDifficulty] = useState<number>(3);
//   const [maDifficulty, setMaDifficulty] = useState<number>(3);
//   const [blankDifficulty, setBlankDifficulty] = useState<number>(3);
//   const [dndDifficulty, setDndDifficulty] = useState<number>(3);
//   const [graphDifficulty, setGraphDifficulty] = useState<number>(3);
//   const [tfDifficulty, setTfDifficulty] = useState<number>(3);
//   const [rcDifficulty, setRcDifficulty] = useState<number>(3);

//   // Image upload state
//   const [questionImageUrl, setQuestionImageUrl] = useState<string | undefined>(
//     undefined,
//   );

//   // Get user info for component-wide use
//   const userName = useAuthStore.getState().getUserName();

//   // RC state
//   const [rcPassage, setRcPassage] = useState("");
//   const [rcTopicId, setRcTopicId] = useState<number | undefined>();
//   const [rcSubTopicId, setRcSubTopicId] = useState<number | undefined>();
//   const [rcImageUrl, setRcImageUrl] = useState<string | undefined>();
//   const [rcStartPage, setRcStartPage] = useState<number | undefined>();
//   const [rcEndPage, setRcEndPage] = useState<number | undefined>();

//   // Update RC state when initialValues change
//   useEffect(() => {
//     if (initialValues) {
//       setRcPassage(initialValues.passage || "");
//       setRcStartPage(initialValues.start_page || undefined);
//       setRcEndPage(initialValues.end_page || undefined);
//       setRcImageUrl(initialValues.image_url || "");
//       setRcDifficulty(initialValues.difficulty || 3);
//     }
//   }, [initialValues]);

//   // RC handlers - removed since RC only creates passages, not questions with choices

//   // Helper function to upload temporary images after question creation
//   const uploadTemporaryImage = async (questionId: number, dataUrl: string) => {
//     const userName = useAuthStore.getState().getUserName();

//     // Convert data URL to File
//     const response = await fetch(dataUrl);
//     const blob = await response.blob();
//     const file = new File([blob], "question-image.png", { type: blob.type });

//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("last_edited_by", userName || "Unknown");

//     const uploadResponse = await fetch(
//       `${import.meta.env.VITE_API_URL}/api/images/upload/question/${questionId}`,
//       {
//         method: "POST",
//         body: formData,
//       },
//     );

//     if (!uploadResponse.ok) {
//       const errorData = await uploadResponse.json();
//       throw new Error(errorData.detail || "Image upload failed");
//     }

//     const uploadData = await uploadResponse.json();
//     if (uploadData.success && uploadData.image_url) {
//       setQuestionImageUrl(uploadData.image_url);
//       return uploadData.image_url;
//     } else {
//       throw new Error("Invalid response from image upload");
//     }
//   };

//   // Helper function to upload choice images after question creation
//   const uploadChoiceImages = async (
//     questionId: number,
//     choices: MCChoice[],
//   ) => {
//     const userName = useAuthStore.getState().getUserName();

//     for (let i = 0; i < choices.length; i++) {
//       const choice = choices[i];
//       const imageUrl = choice.value.choice_image_url;

//       if (imageUrl && imageUrl.startsWith("data:")) {
//         try {
//           // Convert data URL to File
//           const response = await fetch(imageUrl);
//           const blob = await response.blob();
//           const file = new File([blob], `choice-${choice.letter}-image.png`, {
//             type: blob.type,
//           });

//           const formData = new FormData();
//           formData.append("file", file);
//           formData.append("choice_index", String(i));
//           formData.append("choice_label", choice.letter);
//           formData.append("choice_text", choice.value.text);
//           formData.append("created_by", userName || "Unknown");
//           formData.append("last_edited_by", userName || "Unknown");

//           const uploadResponse = await fetch(
//             `${import.meta.env.VITE_API_URL}/api/images/upload/new-choice/${questionId}`,
//             {
//               method: "POST",
//               body: formData,
//             },
//           );

//           if (!uploadResponse.ok) {
//             const errorData = await uploadResponse.json();
//             console.error(
//               `Failed to upload image for choice ${choice.letter}:`,
//               errorData,
//             );
//             // Don't throw - continue with other images
//           } else {
//             const uploadData = await uploadResponse.json();
//             console.log(
//               `Choice ${choice.letter} image uploaded:`,
//               uploadData.image_url,
//             );
//           }
//         } catch (error) {
//           console.error(
//             `Error uploading image for choice ${choice.letter}:`,
//             error,
//           );
//           // Don't throw - continue with other images
//         }
//       }
//     }
//   };

//   // Helper function to upload choice image for existing question
//   const handleChoiceImageUpload = async (
//     choiceIndex: number,
//     imageUrl: string,
//   ) => {
//     try {
//       // For existing questions, we need to get the choice ID
//       const choice = mcChoices[choiceIndex];
//       const choiceId = (choice.value as any).id;

//       if (choiceId) {
//         // Update choice image via API for existing choice
//         updateMcChoice(choiceIndex, "choice_image_url", imageUrl);
//         toast.success("Choice image uploaded successfully");
//       } else {
//         // This is a new choice during editing, just update local state
//         updateMcChoice(choiceIndex, "choice_image_url", imageUrl);
//       }
//     } catch (error) {
//       console.error("Error uploading choice image:", error);
//       toast.error("Failed to upload choice image");
//     }
//   };

//   const handleChoiceImageDelete = async (choiceIndex: number) => {
//     try {
//       updateMcChoice(choiceIndex, "choice_image_url", undefined);
//       toast.success("Choice image deleted successfully");
//     } catch (error) {
//       console.error("Error deleting choice image:", error);
//       toast.error("Failed to delete choice image");
//     }
//   };

//   // Table Grid handlers (replace inline functions with imported handlers)
//   const tgRowLabelChange = handleTgRowLabelChange(setTgRowLabels);
//   const tgColumnLabelChange = handleTgColumnLabelChange(setTgColumnLabels);
//   const tgAddRow = handleTgAddRow(setTgRowLabels);
//   const tgRemoveRow = handleTgRemoveRow(setTgRowLabels, setTgAnswerMatrix);
//   const tgAddColumn = handleTgAddColumn(setTgColumnLabels);
//   const tgRemoveColumn = handleTgRemoveColumn(
//     setTgColumnLabels,
//     setTgAnswerMatrix,
//   );
//   const tgCellToggle = handleTgCellToggle(setTgAnswerMatrix, tgSelectionMode);
//   const tgValidate = () =>
//     validateTableGrid(
//       tgPrompt,
//       tgRowLabels,
//       tgColumnLabels,
//       tgSelectionMode,
//       tgAnswerMatrix,
//       setTgErrors,
//     );
//   const tableGridSave = () =>
//     handleTableGridSave(
//       tgValidate,
//       onSave,
//       tgPrompt,
//       tgSelectionMode,
//       tgRowLabels,
//       tgColumnLabels,
//       tgAnswerMatrix,
//       tgFirstColumnHeader || null,
//       useAuthStore,
//       subject,
//       categoryId,
//     );

//   // Ray Selector state now provided by hooks

//   // Handle DND subtype changes
//   useEffect(() => {
//     if (questionType === "DND") {
//       let subtype: DnDSubtype = "two_buckets_single"; // default

//       console.log("🔍 [QuestionModal] Detecting DND subtype:", {
//         question_category: initialValues?.question_category,
//         questionType
//       });

//       // Only try to get category if initialValues exists
//       if (initialValues?.question_category) {
//         // Only set if it's one of our valid subtypes
//         if (
//           [
//             "two_buckets_single",
//             "two_buckets_multi",
//             "one_bucket_multi",
//             "one_bucket_single",
//             "table_dnd",
//             "drag_drop",
//             "fill_box",
//             "multi_assignment",
//           ].includes(initialValues.question_category)
//         ) {
//           subtype = initialValues.question_category as DnDSubtype;
//           console.log("🔍 [QuestionModal] Set DND subtype to:", subtype);
//         } else {
//           console.warn("⚠️ [QuestionModal] Unknown DND subtype:", initialValues.question_category);
//         }
//       } else {
//         console.log("🔍 [QuestionModal] No question_category found, using default:", subtype);
//       }
//       setDndSubtype(subtype);

//       // Set other DND fields with null checks
//       if (initialValues?.buckets) {
//         dndState.setDndBuckets(initialValues.buckets);
//       }
//       if (initialValues?.choices) {
//         dndState.setDndChoices(initialValues.choices);
//       }
//       if (
//         initialValues?.assignments &&
//         initialValues.buckets &&
//         initialValues.choices
//       ) {
//         // Convert assignments to our format
//         const assignmentMap: Record<number, number[]> = {};
//         initialValues.assignments.forEach((assignment: any) => {
//           const bucketIndex = initialValues.buckets.findIndex(
//             (b: any) => b.id === assignment.bucket_id,
//           );
//           const choiceIndex = initialValues.choices.findIndex(
//             (c: any) => c.id === assignment.choice_id,
//           );
//           if (bucketIndex >= 0 && choiceIndex >= 0) {
//             if (!assignmentMap[bucketIndex]) {
//               assignmentMap[bucketIndex] = [];
//             }
//             assignmentMap[bucketIndex].push(choiceIndex);
//           }
//         });
//         dndState.setDndCorrectAssignments(assignmentMap);
//       }
//     }
//   }, [questionType, initialValues]);

//   // Clear TABLE_GRID errors when selection mode changes since validation rules are different
//   useEffect(() => {
//     if (questionType === "TABLE_GRID") {
//       setTgErrors([]);
//       setTgServerError(null); // Also clear server errors
//     }
//   }, [tgSelectionMode, questionType]);

//   // Clear TABLE_GRID server errors when user makes any changes to the form
//   useEffect(() => {
//     if (questionType === "TABLE_GRID" && tgServerError) {
//       setTgServerError(null);
//     }
//   }, [
//     tgPrompt,
//     tgRowLabels,
//     tgColumnLabels,
//     tgAnswerMatrix,
//     questionType,
//     tgServerError,
//   ]);

//   // Clear TABLE_GRID validation errors when user makes changes that could fix them
//   useEffect(() => {
//     if (questionType === "TABLE_GRID" && tgErrors.length > 0) {
//       // Re-run validation when user makes changes - this will clear errors if they're fixed
//       const timer = setTimeout(() => {
//         tgValidate();
//       }, 300); // Debounce validation to avoid too frequent calls

//       return () => clearTimeout(timer);
//     }
//   }, [
//     tgPrompt,
//     tgRowLabels,
//     tgColumnLabels,
//     tgAnswerMatrix,
//     tgSelectionMode,
//     questionType,
//   ]);

//   // Initialize Table Grid with default answer when switching to TABLE_GRID type
//   useEffect(() => {
//     if (
//       questionType === "TABLE_GRID" &&
//       !initialValues &&
//       tgAnswerMatrix.length === 0
//     ) {
//       // Set default selection for single-select mode (Row 1, Column 1)
//       if (tgSelectionMode === "single") {
//         setTgAnswerMatrix([
//           { row_index: 0, column_index: 0, is_correct: true },
//         ]);
//       }
//     }
//   }, [questionType, tgSelectionMode, initialValues]);

//   // Save handler for Graph Selector
//   const graphSelectorSave = () => {
//     // Detect test pack context by presence of test_id in initialValues
//     const isTestPack = Boolean(initialValues && initialValues.test_id);
//     const testId = isTestPack ? initialValues.test_id : null;
//     if (isTestPack) {
//       return handleGraphSelectorSave(
//         graphSelectorValid,
//         toast,
//         graphPrompt,
//         xMin,
//         xMax,
//         yMin,
//         yMax,
//         gridInterval,
//         maxSelectablePoints,
//         showAxes,
//         showLabels,
//         snapToGrid,
//         graphInstruction,
//         availablePoints,
//         graphExplanation,
//         useAuthStore,
//         initialValues,
//         onSave,
//         resetGraphSelectorState,
//         xAxisLabel,
//         yAxisLabel,
//         true,
//         testId,
//         subject,
//         categoryId,
//       );
//     } else {
//       // Question bank logic (unchanged)
//       return handleGraphSelectorSave(
//         graphSelectorValid,
//         toast,
//         graphPrompt,
//         xMin,
//         xMax,
//         yMin,
//         yMax,
//         gridInterval,
//         maxSelectablePoints,
//         showAxes,
//         showLabels,
//         snapToGrid,
//         graphInstruction,
//         availablePoints,
//         graphExplanation,
//         useAuthStore,
//         initialValues,
//         onSave,
//         resetGraphSelectorState,
//         xAxisLabel,
//         yAxisLabel,
//         false,
//         null,
//         subject,
//         categoryId,
//       );
//     }
//   };

//   // Hot Text state
//   const hotText = useHotTextModalState(
//     initialValues,
//     isOpen,
//     onSave,
//     onClose,
//     !!istestpack,
//     subject,
//     categoryId
//   );

//   // Equation Calculator state
//   const equationCalculatorState = useEquationCalculatorState();
//   const {
//     question: equationQuestion,
//     setQuestion: setEquationQuestion,
//     correctAnswer: equationCorrectAnswer,
//     setCorrectAnswer: setEquationCorrectAnswer,
//     questionImageUrl: equationQuestionImageUrl,
//     setQuestionImageUrl: setEquationQuestionImageUrl,
//     difficulty: equationDifficulty,
//     setDifficulty: setEquationDifficulty,
//     isValid: equationIsValid,
//     resetState: resetEquationCalculatorState,
//     setInitialValues: setEquationCalculatorInitialValues,
//   } = equationCalculatorState;

//   // Debug EQUATION_CALCULATOR state
//   useEffect(() => {
//     if (questionType === "EQUATION_CALCULATOR") {
//       console.log("🔍 [EQUATION_CALCULATOR] State update:", {
//         equationQuestion: equationQuestion?.length,
//         equationCorrectAnswer: equationCorrectAnswer?.length,
//         equationIsValid,
//         questionType
//       });
//     }
//   }, [questionType, equationQuestion, equationCorrectAnswer, equationIsValid]);

//   // Handle save
//   const handleSave = async () => {
//     console.log("🚀 handleSave called for questionType:", questionType);
//     const userName = useAuthStore.getState().getUserName();
//     const baseUrl = import.meta.env.VITE_API_URL;
//     let endpoint = "";
//     let payload = {};
//     let method = initialValues ? "PUT" : "POST";

//     // --- FIX: Use correct passage endpoint based on context ---
//     if (initialValues?.passage_id) {
//       // Check if this is test pack context or question bank context
//       const isTestPackContext = Boolean(initialValues?.test_id || istestpack);
//       // GUARD: passage_id must be a valid number
//       if (typeof initialValues.passage_id !== 'number' || isNaN(initialValues.passage_id) || !Number.isInteger(initialValues.passage_id)) {
//         console.error("❌ Invalid passage_id for passage update:", initialValues.passage_id, initialValues);
//         console.error("Stack trace:", new Error().stack);
//         toast.error("Cannot update passage: invalid passage_id (frontend bug)");
//         throw new Error("Cannot update passage: invalid passage_id (frontend bug)");
//       }
//       // Use the correct endpoint and payload format for passage update
//       payload = {
//         passage: rcPassage,
//         last_edited_by: userName,
//         image_url: rcImageUrl || ""
//       };
//       if (isTestPackContext) {
//         // Use the new test pack endpoint
//         try {
//           const data = await testPackService.editPassage(initialValues.passage_id, {
//             ...payload,
//             test_id: initialValues.test_id,
//             difficulty: rcDifficulty,
//             ...(rcStartPage !== undefined ? { start_page: rcStartPage } : {}),
//             ...(rcEndPage !== undefined ? { end_page: rcEndPage } : {}),
//           });
//           toast.success("Passage updated successfully");
//           onSave(data);
//           onClose();
//           return;
//         } catch (error: any) {
//           toast.error(error.message || "Failed to update test pack passage");
//           throw error;
//         }
//       } else {
//         // Use the question bank endpoint
//         endpoint = `${baseUrl}/api/passages/update/${initialValues.passage_id}`;
//         method = "PUT";
//         // Log for debugging
//         console.log("🚀 Making API call to (passage update):", endpoint, "passage_id:", initialValues.passage_id);
//         const response = await fetch(endpoint, {
//           method,
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(payload),
//         });
//         if (!response.ok) {
//           const errorData = await response.json();
//           console.error("❌ API Error:", errorData);
//           console.error("❌ Failed endpoint:", endpoint);
//           console.error("❌ Failed method:", method);
//           throw new Error(
//             `Failed to update passage at ${endpoint}: ${errorData.message || errorData.detail || "Unknown error"}`,
//           );
//         }
//         const data = await response.json();
//         console.log("✅ Passage save successful:", data);
//         toast.success("Passage updated successfully");
//         onSave(data);
//         onClose();
//         return;
//       }
//     }
//     // --- END FIX ---

//     // Remove the problematic GLOBAL CATCH section that interferes with passage editing
//     // Passage editing is already handled above with proper validation

//     try {
//       switch (questionType) {
//         case "TABLE_GRID":
//           if (!tgValidate()) {
//             toast.error("Please fix validation errors before saving.");
//             return;
//           }

//           // Validate unique labels
//           const uniqueRowLabels = new Set(tgRowLabels);
//           const uniqueColLabels = new Set(tgColumnLabels);
//           if (uniqueRowLabels.size !== tgRowLabels.length) {
//             throw new Error("Row labels must be unique");
//           }
//           if (uniqueColLabels.size !== tgColumnLabels.length) {
//             throw new Error("Column labels must be unique");
//           }

//           // Validate at least one correct answer
//           const hasCorrectAnswer = tgAnswerMatrix.some(
//             (answer) => answer.is_correct,
//           );
//           if (!hasCorrectAnswer) {
//             throw new Error("At least one answer must be marked as correct");
//           }

//           if (istestpack) {
//             endpoint = initialValues?.question_id
//               ? `${baseUrl}/api/test-pack/table-grid/put/${initialValues.question_id}`
//               : `${baseUrl}/api/test-pack/table-grid/create`;
//             method = initialValues?.question_id ? "PUT" : "POST";

//             payload = {
//               question: tgPrompt,
//               selection_mode: tgSelectionMode,
//               row_labels: tgRowLabels,
//               column_labels: tgColumnLabels,
//               first_column_header: tgFirstColumnHeader || null,
//               answer_matrix: tgAnswerMatrix.map((answer) => ({
//                 row_index: answer.row_index,
//                 column_index: answer.column_index,
//                 is_correct: answer.is_correct,
//                 last_edited_by: userName,
//               })),
//               last_edited_by: userName,
//               test_id: initialValues.test_id,
//               // question_id: initialValues.question_id,
//               difficulty: tgDifficulty,
//               created_by: userName,
//               is_active: initialValues?.is_active,  // Preserve current active state
//             };
//           } else {
//             endpoint = initialValues?.id
//               ? `${baseUrl}/api/table-grid-questions/update/${initialValues.id}`
//               : `${baseUrl}/api/table-grid-questions/create`;
//             method = initialValues?.id ? "PUT" : "POST";

//             payload = {
//               question: tgPrompt,
//               selection_mode: tgSelectionMode,
//               row_labels: tgRowLabels,
//               column_labels: tgColumnLabels,
//               first_column_header: tgFirstColumnHeader || null,
//               answers: tgAnswerMatrix.map((answer) => ({
//                 row_index: answer.row_index,
//                 column_index: answer.column_index,
//                 is_correct: answer.is_correct,
//                 last_edited_by: userName,
//               })),
//               last_edited_by: userName,
//               created_by: userName,
//             };
//           }

//           break;

//         case "MC":
//           if (initialValues?.test_id) {
//             // Check if this is an edit operation (has question_id) or create operation
//             if (initialValues?.question_id) {
//               // Edit operation - use update endpoint
//               endpoint = `${baseUrl}/api/test-pack/mc/edit/${initialValues.question_id}`;
//               method = "PUT";
//               // Do NOT include subject and question_category_id during edit
//               payload = {
//                 question: mcQuestion,
//                 choices: mcChoices.map((choice) => ({
//                   letter: choice.letter,
//                   value: {
//                     text: choice.value.text,
//                     is_correct: choice.value.is_correct,
//                     explanation: choice.value.explanation,
//                     choice_image_url: choice.value.choice_image_url,
//                   },
//                 })),
//                 correct_answer: mcChoices.find((c) => c.value.is_correct)?.letter || "",
//                 explanation: mcExplanation,
//                 question_type: "MC",
//                 question_category: mcVariant || "standard",
//                 question_image_url: questionImageUrl,
//                 difficulty: mcDifficulty,
//                 created_by: undefined,
//                 last_edited_by: userName,
//                 test_id: initialValues.test_id,
//               };
//             } else {
//               // Create operation - use create endpoint
//               endpoint = `${baseUrl}/api/test-pack/mc/create`;
//               method = "POST";
//               // INCLUDE subject and question_category_id during creation
//               payload = {
//                 question: mcQuestion,
//                 choices: mcChoices.map((choice) => ({
//                   letter: choice.letter,
//                   value: {
//                     text: choice.value.text,
//                     is_correct: choice.value.is_correct,
//                     explanation: choice.value.explanation,
//                     choice_image_url: choice.value.choice_image_url,
//                   },
//                 })),
//                 correct_answer: mcChoices.find((c) => c.value.is_correct)?.letter || "",
//                 explanation: mcExplanation,
//                 question_type: "MC",
//                 question_category: mcVariant || "standard",
//                 question_image_url: questionImageUrl,
//                 difficulty: mcDifficulty,
//                 created_by: userName,
//                 last_edited_by: userName,
//                 test_id: initialValues.test_id,
//                 subject: subject || "Mathematics", // fallback for safety
//                 question_category_id: Number(categoryId) || 1, // fallback for safety
//               };
//             }
//           } else if (istestpack) {
//             // Fallback: if istestpack is true but initialValues is missing
//             endpoint = `${baseUrl}/api/test-pack/mc/create`;
//             method = "POST";
//             payload = {
//               question: mcQuestion,
//               choices: mcChoices.map((choice) => ({
//                 letter: choice.letter,
//                 value: {
//                   text: choice.value.text,
//                   is_correct: choice.value.is_correct,
//                   explanation: choice.value.explanation,
//                   choice_image_url: choice.value.choice_image_url,
//                 },
//               })),
//               correct_answer: mcChoices.find((c) => c.value.is_correct)?.letter || "",
//               explanation: mcExplanation,
//               question_type: "MC",
//               question_category: mcVariant || "standard",
//               question_image_url: questionImageUrl,
//               difficulty: mcDifficulty,
//               created_by: userName,
//               last_edited_by: userName,
//               subject: subject || "Mathematics",
//               question_category_id: Number(categoryId) || 1,
//             };
//           } else if (initialValues?.id) {
//             endpoint = `${baseUrl}/api/pre-shsat/questions/${initialValues.id}`;
//             method = "PUT";
//             console.log(
//               "[MC] Using question bank UPDATE endpoint:",
//               endpoint,
//               "method:",
//               method,
//               "id:",
//               initialValues.id,
//             );
//           } else {
//             endpoint = `${baseUrl}/api/pre-shsat/questions/mc`;
//             method = "POST";
//             console.log(
//               "[MC] Using question bank CREATE endpoint:",
//               endpoint,
//               "method:",
//               method,
//             );
//           }

//           // Transform choices to match backend format
//           const transformedChoices = mcChoices.map((choice) => ({
//             letter: choice.letter,
//             value: {
//               text: choice.value.text,
//               is_correct: choice.value.is_correct,
//               explanation: choice.value.explanation,
//               choice_image_url: choice.value.choice_image_url,
//             },
//           }));

//           // Find the correct answer (letter of the correct choice)
//           const correctAnswer =
//             mcChoices.find((c) => c.value.is_correct)?.letter || "";

//           payload = {
//             question: mcQuestion,
//             choices: transformedChoices,
//             correct_answer: correctAnswer,
//             explanation: mcExplanation,
//             question_type: "MC",
//             question_category: mcVariant || "standard",
//             question_image_url: questionImageUrl,
//             difficulty: mcDifficulty,
//             created_by: userName,  // Always set created_by for test pack questions
//             last_edited_by: userName,
//           };

//           // Add test_id for test pack questions
//           if (initialValues?.test_id) {
//             (payload as any).test_id = initialValues.test_id;
//           }
//           // Add subject and question_category_id for test pack questions
//           if (istestpack) {
//             (payload as any).subject = subject;
//             (payload as any).question_category_id = Number(categoryId);
//           }
//           break;

//         case "MA":
//           console.log("[MA] Debug - initialValues:", initialValues);
//           console.log("[MA] Debug - test_id:", initialValues?.test_id);
//           console.log("[MA] Debug - id:", initialValues?.id);

//           if (initialValues?.test_id) {
//             // Check if this is an edit operation (has question_id) or create operation
//             if (initialValues?.question_id) {
//               // Edit operation - use update endpoint
//               endpoint = `${baseUrl}/api/test-pack/ma/put/${initialValues.question_id}`;
//               method = "PUT";
//               console.log(
//                 "[MA] Using test pack update endpoint:",
//                 endpoint,
//                 "method:",
//                 method,
//               );
//             } else {
//               // Create operation - use create endpoint
//               endpoint = `${baseUrl}/api/test-pack/ma/create`;
//               method = "POST";
//               console.log(
//                 "[MA] Using test pack create endpoint:",
//                 endpoint,
//                 "method:",
//                 method,
//               );
//             }
//           } else if (initialValues?.id) {
//             endpoint = `${baseUrl}/api/pre-shsat/questions/${initialValues.id}`;
//             method = "PUT";
//             console.log(
//               "[MA] Using question bank update endpoint:",
//               endpoint,
//               "method:",
//               method,
//             );
//           } else {
//             endpoint = `${baseUrl}/api/pre-shsat/questions/ma`;
//             method = "POST";
//             console.log(
//               "[MA] Using question bank create endpoint:",
//               endpoint,
//               "method:",
//               method,
//             );
//           }

//           // Get correct answers as comma-separated list
//           const correctLabels = maChoices
//             .filter((c) => c.is_correct)
//             .map((c) => c.choice_label)
//             .join(",");

//           payload = {
//             question: maQuestion,
//             question_type: "MA",
//             question_image_url: questionImageUrl,
//             choices: maChoices.map((choice) => ({
//               choice_label: choice.choice_label,
//               choice_text: choice.choice_text,
//               is_correct: choice.is_correct,
//               choice_image_url: choice.choice_image_url,
//               explanation: choice.explanation,
//             })),
//             correct_answer: correctLabels,
//             answer: correctLabels, // Backend expects both fields
//             explanation: maExplanation,
//             difficulty: maDifficulty,
//             created_by: userName,  // Always set created_by for test pack questions
//             last_edited_by: userName,
//           };

//           // Add test_id for test pack questions
//           if (initialValues?.test_id) {
//             (payload as any).test_id = initialValues.test_id;
//             // Preserve current active state for edit operations
//             if (initialValues?.question_id) {
//               (payload as any).is_active = initialValues.is_active;
//             }
//           }
//           break;

//         case "BLANK":
//           if (initialValues?.test_id) {
//             // Check if this is an edit operation (has question_id) or create operation
//             if (initialValues?.question_id) {
//               // Edit operation - use update endpoints
//               if (blankVariant === "placeholder") {
//                 endpoint = `${baseUrl}/api/test-pack/blank/placeholder/put/${initialValues.question_id}`;
//               } else if (blankVariant === "fill_box") {
//                 endpoint = `${baseUrl}/api/test-pack/blank/fill-box/put/${initialValues.question_id}`;
//               } else {
//                 throw new Error(
//                   'Invalid blank question category. Must be either "placeholder" or "fill_box".',
//                 );
//               }
//               method = "PUT";
//             } else {
//               // Create operation - use create endpoints
//               if (blankVariant === "placeholder") {
//                 endpoint = `${baseUrl}/api/test-pack/blank/create/placeholder`;
//               } else if (blankVariant === "fill_box") {
//                 endpoint = `${baseUrl}/api/test-pack/blank/create/fill-box`;
//               } else {
//                 throw new Error(
//                   'Invalid blank question category. Must be either "placeholder" or "fill_box".',
//                 );
//               }
//               method = "POST";
//             }
//           } else if (initialValues?.id) {
//             endpoint = `${baseUrl}/api/pre-shsat/questions/${initialValues.id}`;
//             method = "PUT";
//           } else {
//             endpoint = `${baseUrl}/api/pre-shsat/questions/blank`;
//             method = "POST";
//           }

//           // Validate question category
//           if (!["placeholder", "fill_box"].includes(blankVariant)) {
//             throw new Error(
//               'Invalid blank question category. Must be either "placeholder" or "fill_box".',
//             );
//           }

//           payload = {
//             question: blankQuestion,
//             question_type: "BLANK",
//             question_category: blankVariant,
//             correct_answer: blankCorrectAnswer,
//             explanation: blankExplanation,
//             difficulty: blankDifficulty,
//             created_by: userName,  // Always set created_by for test pack questions
//             last_edited_by: userName,
//           };

//           // Add test_id for test pack questions
//           if (initialValues?.test_id) {
//             (payload as any).test_id = initialValues.test_id;
//             // Preserve current active state for edit operations
//             if (initialValues?.question_id) {
//               (payload as any).is_active = initialValues.is_active;
//             }
//           }
//           break;

//         case "DND":
//           return handleDnDSave();

//         case "GRAPH_SELECTOR":
//           if (!graphSelectorValid) {
//             throw new Error(
//               "Please fill in all required fields for the graph selector question.",
//             );
//           }

//           let isTestPackGraphSelector = false;
//           let testPackTestId = undefined;
//           if ((initialValues as any)?.test_id) {
//             isTestPackGraphSelector = true;
//             testPackTestId = (initialValues as any).test_id;
//           } else if (
//             typeof window !== "undefined" &&
//             (window as any).testPackTestId
//           ) {
//             isTestPackGraphSelector = true;
//             testPackTestId = (window as any).testPackTestId;
//           }

//           // Set endpoint and method based on add/edit and test pack/question bank
//           method = "POST";
//           if (isTestPackGraphSelector && isAddMode) {
//             endpoint = `${baseUrl}/api/test-pack/graph-selector/create`;
//             method = "POST";
//           } else if (
//             isTestPackGraphSelector &&
//             initialValues &&
//             (initialValues as any).question_id
//           ) {
//             endpoint = `${baseUrl}/api/test-pack/graph-selector/put/${(initialValues as any).question_id}`;
//             method = "PATCH";
//           } else if (isAddMode) {
//             endpoint = `${baseUrl}/api/graph-selector/create`;
//             method = "POST";
//           } else if (initialValues && initialValues.id) {
//             endpoint = `${baseUrl}/api/graph-selector/update/${initialValues.id}`;
//             method = "PUT";
//           } else {
//             throw new Error("No valid question ID for update");
//           }

//           // Debug: Log mode, endpoint, and payload
//           console.log(
//             "[GraphSelector] isTestPack:",
//             isTestPackGraphSelector,
//             "isAddMode:",
//             isAddMode,
//           );
//           console.log("[GraphSelector] Endpoint:", endpoint, "Method:", method);

//           // Validate grid interval
//           if (Number(gridInterval) <= 0) {
//             throw new Error("Grid interval must be greater than 0.");
//           }

//           // Validate at least one correct point
//           if (!availablePoints.some((p) => p.is_correct)) {
//             throw new Error("At least one point must be marked as correct.");
//           }

//           // Validate points are within range
//           const xMinNum = Number(xMin);
//           const xMaxNum = Number(xMax);
//           const yMinNum = Number(yMin);
//           const yMaxNum = Number(yMax);
//           const invalidPoints = availablePoints.filter(
//             (p) =>
//               p.x < xMinNum || p.x > xMaxNum || p.y < yMinNum || p.y > yMaxNum,
//           );
//           if (invalidPoints.length > 0) {
//             throw new Error("All points must be within the graph bounds.");
//           }

//           // Build payload matching question bank, but add test_id for test pack
//           payload = {
//             question: graphPrompt,
//             x_min: xMinNum,
//             x_max: xMaxNum,
//             y_min: yMinNum,
//             y_max: yMaxNum,
//             grid_interval: Number(gridInterval),
//             max_selectable_points: maxSelectablePoints
//               ? Number(maxSelectablePoints)
//               : null,
//             graph_instruction: graphInstruction,
//             graph_type: "cartesian",
//             show_axes: showAxes,
//             show_labels: showLabels,
//             snap_to_grid: snapToGrid,
//             x_axis_label: xAxisLabel,
//             y_axis_label: yAxisLabel,
//             points: availablePoints.map((p) => ({
//               x: p.x,
//               y: p.y,
//               is_correct: p.is_correct,
//               point_label: p.point_label || null,
//               created_by: userName,
//               last_edited_by: userName,
//             })),
//             difficulty: graphDifficulty,
//             created_by: userName,
//             last_edited_by: userName,
//           };
//           if (isTestPackGraphSelector && testPackTestId) {
//             (payload as any).test_id = testPackTestId;
//           }
//           // Debug: Log payload
//           console.log("[GraphSelector] Payload:", payload);
//           break;

//         case "RC":
//         case "REA":
//         case "REB":
//           // Check if this is test pack context
//           const isTestPackRC = istestpack || initialValues?.test_id;

//           if (isTestPackRC) {
//             // Test pack RC logic
//             if (!initialValues?.passage_id) {
//               endpoint = `${baseUrl}/api/test-pack/passages/create`;
//               method = "POST";
//               payload = {
//                 passage: rcPassage,
//                 created_by: userName,
//                 last_edited_by: userName,
//                 test_id: initialValues?.test_id,
//                 difficulty: rcDifficulty,
//                 ...(rcStartPage !== undefined ? { start_page: rcStartPage } : {}),
//                 ...(rcEndPage !== undefined ? { end_page: rcEndPage } : {}),
//                 ...(rcImageUrl ? { image_url: rcImageUrl } : {}),
//               };
//             } else {
//               endpoint = `${baseUrl}/api/test-pack/passages/update/${initialValues.passage_id}`;
//               method = "PUT";
//               payload = {
//                 passage: rcPassage,
//                 created_by: userName,
//                 last_edited_by: userName,
//                 test_id: initialValues?.test_id,
//                 difficulty: rcDifficulty,
//                 ...(rcStartPage !== undefined
//                   ? { start_page: rcStartPage }
//                   : {}),
//                 ...(rcEndPage !== undefined ? { end_page: rcEndPage } : {}),
//                 ...(rcImageUrl ? { image_url: rcImageUrl } : {}),
//               };
//             }
//           } else {
//             // Question bank RC logic (existing code)
//             endpoint = initialValues?.id
//               ? `${baseUrl}/api/passages/${initialValues.id}`
//               : `${baseUrl}/api/passages`;
//             method = initialValues?.id ? "PUT" : "POST";
//             payload = {
//               passage: rcPassage,
//               topic_id: rcTopicId,
//               sub_topic_id: rcSubTopicId,
//               image_url: rcImageUrl,
//               start_page: rcStartPage,
//               end_page: rcEndPage,
//               created_by: userName,  // Always set created_by for test pack questions
//               last_edited_by: userName,
//             };
//           }
//           break;

//         case "HOT_TEXT":
//           // All Hot Text save logic is now handled by the hotText modal state hook and its save method. Remove any HotTextForm usage here.
//           break;

//         case "EQUATION_CALCULATOR":
//           // Add validation with user-friendly messages
//           if (!equationQuestion.trim() && !equationCorrectAnswer.trim()) {
//             toast.error("Please enter at least a question or correct answer");
//             return;
//           }

//           if (initialValues?.test_id) {
//             // Check if this is an edit operation (has question_id) or create operation
//             if (initialValues?.question_id) {
//               // Edit operation - use update endpoint
//               endpoint = `${baseUrl}/api/test-pack/equation-calculator/update/${initialValues.question_id}`;
//               method = "PUT";
//             } else {
//               // Create operation - use create endpoint
//               endpoint = `${baseUrl}/api/test-pack/equation-calculator/create`;
//               method = "POST";
//             }
//           } else if (initialValues?.id) {
//             // Question bank edit operation
//             endpoint = `${baseUrl}/api/pre-shsat/questions/equation-calculator/update/${initialValues.id}`;
//             method = "PUT";
//           } else {
//             // Question bank create operation
//             endpoint = `${baseUrl}/api/pre-shsat/questions/equation-calculator/create`;
//             method = "POST";
//           }

//           payload = {
//             question: equationQuestion || "Question placeholder", // Provide default if empty
//             correct_answers: [
//               {
//                 answer: equationCorrectAnswer || "Answer placeholder", // Provide default if empty
//                 is_primary: true,
//                 created_by: userName,
//                 last_edited_by: userName,
//               }
//             ],
//             created_by: userName,  // Always set created_by for test pack questions
//             last_edited_by: userName,
//           };

//           // Add test pack specific fields
//           if (initialValues?.test_id) {
//             (payload as any).test_id = initialValues.test_id;
//             (payload as any).difficulty = equationDifficulty;
//             (payload as any).question_image_url = equationQuestionImageUrl;
//             (payload as any).is_active = initialValues?.question_id ? initialValues.is_active : true; // Preserve current active state for edits, default to true for new questions
//             (payload as any).question_type = 51; // Set question type to 51 for Equation Calculator
//             (payload as any).subject = subject || "Mathematics"; // Include subject like MC
//             (payload as any).question_category_id = Number(categoryId) || 1; // Include category_id like MC
//           }
//           break;

//         default:
//           throw new Error(`Unsupported question type: ${questionType}`);
//       }

//       // Make the API call
//       console.log("🚀 Making API call to:", endpoint);
//       console.log("📦 With payload:", payload);
//       console.log("📝 Using method:", method);

//       const response = await fetch(endpoint, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error("❌ API Error:", errorData);
//         console.error("❌ Failed endpoint:", endpoint);
//         console.error("❌ Failed method:", method);
//         throw new Error(
//           `Failed to ${initialValues ? "update" : "create"} ${questionType} question at ${endpoint}: ${errorData.message || errorData.detail || "Unknown error"}`,
//         );
//       }

//       const data = await response.json();
//       console.log("✅ Save successful:", data);

//       // Track question creation/editing analytics
//       if (!initialValues) {
//         // New question created
//         trackQuestionCreation(analytics, {
//           questionId: data.question_id || data.id,
//           questionType: questionType as any,
//           difficulty: data.difficulty || 3,
//           subject: data.subject || subject || 'Unknown',
//           numOptions: data.choices?.length || 0,
//           hasPassage: !!(data.passage_id || initialValues?.passage_id),
//           passageId: data.passage_id || initialValues?.passage_id,
//           testId: data.test_id || initialValues?.test_id,
//           isTestPack: istestpack
//         });
//       } else {
//         // Question edited
//         analytics.trackQuestionEdited(
//           data.question_id || data.id,
//           questionType as any,
//           {
//             question_updated: true,
//             difficulty_changed: data.difficulty !== initialValues.difficulty,
//             subject_changed: data.subject !== initialValues.subject
//           },
//           {
//             old_difficulty: initialValues.difficulty,
//             new_difficulty: data.difficulty,
//             old_subject: initialValues.subject,
//             new_subject: data.subject
//           }
//         );
//       }

//       toast.success(
//         `${questionType} question ${initialValues ? "updated" : "created"} successfully`,
//       );
//       onSave(data);
//       onClose();
//     } catch (error) {
//       console.error("❌ Error saving question:", error);
//       toast.error(
//         error instanceof Error ? error.message : "Failed to save question",
//       );
//     }
//   };

//   // Helper function to determine if we can save (more lenient for editing)
//   const canSave = (questionType: string) => {
//     const isEditing = !!initialValues;
//     // Skip subject/topic/category validation for questions with passages (those fields are hidden)
//     const hasPassage = initialValues?.passage_id && Number(initialValues.passage_id) > 0;
//     // Also skip subject/topic/category validation for RC question types
//     const isRCQuestion = ["RC", "REA", "REB"].includes(questionType);

//     // Debug logging for passage editing
//     if (hasPassage) {
//       console.log("🔍 canSave for passage:", { 
//         questionType, 
//         isEditing, 
//         hasPassage, 
//         rcPassage: rcPassage?.length,
//         rcStartPage,
//         rcEndPage 
//       });
//     }

//     // For passage editing mode, always allow save if passage content exists
//     if (shouldEditPassage) {
//       console.log("🔍 [canSave] Passage editing mode check:", { 
//         shouldEditPassage, 
//         rcPassage: rcPassage?.length, 
//         rcPassageContent: rcPassage?.substring(0, 50) + "...",
//         hasContent: rcPassage && rcPassage.trim().length > 0,
//         hasPassageId: initialValues?.passage_id
//       });
//       // For passage editing, allow save if:
//       // 1. There's passage content, OR
//       // 2. We have a passage_id (content might be loading), OR  
//       // 3. User is actively editing (content might be empty but user is typing)
//       return (rcPassage && rcPassage.trim().length > 0) || 
//              (initialValues?.passage_id && Number(initialValues.passage_id) > 0);
//     }

//     // Only require subject/topic/category for non-RC questions and questions without passages
//     if (istestpack && !hasPassage && !isRCQuestion && (!subject || !mainTopicId || !categoryId)) return false;

//     if (isEditing) {
//       // For editing, any small change should enable save button - very lenient
//       switch (questionType) {
//         case "MC":
//           return mcQuestion.trim().length > 0 && mcChoices.length >= 2;
//         case "MA":
//           return maQuestion.trim().length > 0 && maChoices.length >= 2;
//         case "TF":
//           return tfQuestion.trim().length > 0;
//         case "BLANK":
//           return blankQuestion.trim().length > 0;
//         case "DND":
//           if (!dndState.dndQuestion.trim().length) return false;
//           switch (dndSubtype) {
//             case "two_buckets_single":
//             case "two_buckets_multi":
//               return dndState.dndBuckets.length === 2 && dndState.dndChoices.length > 0;
//             case "one_bucket_multi":
//               return dndState.dndBuckets.length === 1 && dndState.dndChoices.length > 0;
//             case "one_bucket_single":
//               // More lenient validation for editing: require at least question content or some basic structure
//               const hasQuestion = dndState.dndQuestion.trim().length > 0;
//               const hasBasicStructure = dndState.dndBuckets.length >= 1 || dndState.dndChoices.length >= 1;
//               return hasQuestion || hasBasicStructure; // Allow save if either question has content or there's basic structure
//             case "table_dnd": {
//               // Loosen validation for table_dnd in edit mode: require prompt, at least 2 buckets with labels, at least 2 choices with labels, and both column headers
//               const hasPrompt = dndState.dndQuestion.trim().length > 0;
//               const hasBuckets = dndState.dndBuckets.length >= 2 && dndState.dndBuckets.every(b => b && typeof b.label === "string" && b.label.trim().length > 0);
//               const hasChoices = dndState.dndChoices.length >= 2 && dndState.dndChoices.every(c => c && typeof c.label === "string" && c.label.trim().length > 0);
//               const hasHeaders = dnd.tableColumnHeaders && dnd.tableColumnHeaders[0] && dnd.tableColumnHeaders[0].trim().length > 0 && dnd.tableColumnHeaders[1] && dnd.tableColumnHeaders[1].trim().length > 0;
//               return hasPrompt && hasBuckets && hasChoices && hasHeaders;
//             }
//             default:
//               return false;
//           }
//         case "RAY_SELECTOR":
//           return raySelector.rayPrompt.trim().length > 0;
//         case "GRAPH_SELECTOR":
//           return graphPrompt.trim().length > 0;
//         case "TABLE_GRID":
//           return tgPrompt.trim().length > 0;
//         case "HOT_TEXT":
//           return true; // HOT_TEXT has its own validation
//         case "RC":
//         case "REA":
//         case "REB":
//           return rcPassage.trim().length > 0;
//         default:
//           // Check if this is a non-RC question type but has a passage
//           if (initialValues?.passage_id && Number(initialValues.passage_id) > 0) {
//             return rcPassage.trim().length > 0;
//           }
//           return false;
//       }
//     } else {
//       // For creating new questions, use strict validation
//       switch (questionType) {
//         case "MC":
//           return mcValid;
//         case "MA":
//           return maValid;
//         case "TF":
//           return tfValid;
//         case "BLANK":
//           return blankValid;
//         case "DND":
//           return dndState.dndValid;
//         case "RAY_SELECTOR":
//           return raySelector.raySelectorValid;
//         case "GRAPH_SELECTOR":
//           return graphSelectorValid;
//         case "TABLE_GRID":
//           return tgPrompt.trim().length > 0;
//         case "HOT_TEXT":
//           return true; // HOT_TEXT has its own validation
//         case "EQUATION_CALCULATOR":
//           // More lenient validation: require at least one field to have content
//           const hasQuestion = equationQuestion.trim().length > 0;
//           const hasAnswer = equationCorrectAnswer.trim().length > 0;
//           return hasQuestion || hasAnswer; // Allow save if either field has content
//         case "RC":
//         case "REA":
//         case "REB":
//           return rcPassage.trim().length > 0;
//         default:
//           return false;
//       }
//     }
//   };

//   // Move handleDnDSave above footerRenderers
//   const handleDnDSave = async () => {
//     console.log("🚀 DND Save button clicked");
//     console.log("Current DND subtype:", dndSubtype);
//     console.log("Current buckets:", dndState.dndBuckets);
//     console.log("Current choices:", dndState.dndChoices);
//     console.log("Current assignments:", dndState.dndCorrectAssignments);

//     try {
//       // Validate required fields
//       if (!dndState.dndQuestion) {
//         toast.error("Please enter a question");
//         return;
//       }

//       // Validate buckets based on DND subtype
//       switch (dndSubtype) {
//         case "two_buckets_single":
//         case "two_buckets_multi":
//           if (dndState.dndBuckets.length !== 2) {
//             toast.error(`${dndSubtype} requires exactly 2 buckets`);
//             return;
//           }
//           break;
//         case "one_bucket_multi":
//         case "one_bucket_single":
//           // More lenient validation for editing mode
//           if (initialValues && dndState.dndBuckets.length < 1) {
//             toast.error("One bucket variants require at least 1 bucket");
//             return;
//           } else if (!initialValues && dndState.dndBuckets.length !== 1) {
//             toast.error("One bucket variants require exactly 1 bucket");
//             return;
//           }
//           break;
//         case "table_dnd":
//           if (dndState.dndBuckets.length < 2) {
//             toast.error("Table DND requires at least 2 rows");
//             return;
//           }
//           // Check that each bucket has a label
//           if (dndState.dndBuckets.some(bucket => !bucket.label || bucket.label.trim() === '')) {
//             toast.error("All table rows must have labels");
//             return;
//           }
//           break;
//         default:
//           toast.error("Invalid DND subtype");
//           return;
//       }

//       // Validate choices - more lenient for editing
//       if (!initialValues && dndState.dndChoices.length === 0) {
//         toast.error("Please add at least one choice");
//         return;
//       }

//       // Validate assignments - more lenient for editing
//       if (!initialValues) {
//         const hasAssignments = Object.values(dndState.dndCorrectAssignments).some(
//           (choices) => choices.length > 0,
//         );
//         if (!hasAssignments) {
//           toast.error("Please assign at least one choice to a bucket");
//           return;
//         }
//       }

//       const baseUrl = import.meta.env.VITE_API_URL;
//       let endpoint;

//       // Check if this is test pack context
//       const isTestPack = Boolean(initialValues?.test_id);

//       if (isTestPack) {
//         // Test pack DND endpoints
//         if (initialValues?.question_id) {
//           // Update existing test pack DND question - use specific endpoints based on subtype
//           switch (dndSubtype) {
//             case "two_buckets_single":
//               endpoint = `${baseUrl}/api/test-pack/dnd/two-buckets-single/${initialValues.question_id}`;
//               break;
//             case "two_buckets_multi":
//               endpoint = `${baseUrl}/api/test-pack/dnd/two-buckets-multi/${initialValues.question_id}`;
//               break;
//             case "one_bucket_multi":
//               endpoint = `${baseUrl}/api/test-pack/dnd/one-bucket-multi/${initialValues.question_id}`;
//               break;
//             case "one_bucket_single":
//               endpoint = `${baseUrl}/api/test-pack/dnd/one-bucket-single/${initialValues.question_id}`;
//               break;
//             case "table_dnd":
//               endpoint = `${baseUrl}/api/test-pack/dnd/table_dnd/put/${initialValues.question_id}`;
//               break;
//             default:
//               // Fallback to generic endpoint for unknown subtypes
//               endpoint = `${baseUrl}/api/test-pack/dnd/put/${initialValues.question_id}`;
//               break;
//           }
//         } else {
//           // Create new test pack DND question
//           switch (dndSubtype) {
//             case "two_buckets_single":
//               endpoint = `${baseUrl}/api/test-pack/dnd/create/two-buckets-single`;
//               break;
//             case "two_buckets_multi":
//               endpoint = `${baseUrl}/api/test-pack/dnd/create/two-buckets-multi`;
//               break;
//             case "one_bucket_multi":
//               endpoint = `${baseUrl}/api/test-pack/dnd/create/one-bucket-multi`;
//               break;
//             case "one_bucket_single":
//               endpoint = `${baseUrl}/api/test-pack/dnd/create/one-bucket-single`;
//               break;
//             case "table_dnd":
//               endpoint = `${baseUrl}/api/test-pack/dnd/create/table-dnd`;
//               break;
//             default:
//               throw new Error("Unknown DND subtype for test pack");
//           }
//         }
//       } else {
//         // Question bank DND endpoints
//         if (initialValues?.id) {
//           endpoint = `${baseUrl}/api/pre-shsat/dnd-questions/${initialValues.id}`;
//         } else {
//           switch (dndSubtype) {
//             case "two_buckets_single":
//               endpoint = `${baseUrl}/api/pre-shsat/dnd-questions/dnd_single`;
//               break;
//             case "two_buckets_multi":
//               endpoint = `${baseUrl}/api/pre-shsat/dnd-questions/dnd_multi`;
//               break;
//             case "one_bucket_multi":
//               endpoint = `${baseUrl}/api/pre-shsat/dnd-questions/dnd_one_bucket_multi`;
//               break;
//             case "one_bucket_single":
//               endpoint = `${baseUrl}/api/pre-shsat/dnd-questions/dnd_one_bucket_single`;
//               break;
//             case "table_dnd":
//               endpoint = `${baseUrl}/api/pre-shsat/dnd-questions/table_dnd`;
//               break;
//             default:
//               throw new Error("Unknown DND subtype for question bank");
//           }
//         }
//       }

//       // Filter out any empty or undefined buckets
//       const validBuckets = dndState.dndBuckets.filter(
//         (bucket) => bucket && bucket.label,
//       );

//       // Prepare assignments - use array indices for both create and update
//       // The backend deletes all existing data and recreates it, so array indices work for both
//       const assignments = Object.entries(dndState.dndCorrectAssignments).flatMap(
//         ([bucketIdx, choiceIndices]) =>
//           choiceIndices.map((choiceIdx) => ({
//             bucket_id: Number(bucketIdx),
//             choice_id: choiceIdx,
//           })),
//       );

//       // Prepare payload
//       const payload = {
//         question: dndState.dndQuestion,
//         question_type: "DND",
//         question_category: dndSubtype,
//         buckets: validBuckets.map((bucket, idx) => ({
//           ...bucket,
//           bucket_order: idx,
//         })),
//         choices: dndState.dndChoices.map((choice, idx) => ({
//           ...choice,
//           choice_order: idx,
//         })),
//         assignments: assignments,
//         explanation: dndState.dndExplanation,
//         created_by: userName,  // Always set created_by for test pack questions
//         last_edited_by: userName,
//       };

//       // Add test pack specific fields
//       if (isTestPack) {
//         (payload as any).test_id = initialValues?.test_id;
//         (payload as any).difficulty = dndDifficulty;
//         (payload as any).is_active = initialValues?.is_active || false;
//       }

//       // Add column_headers for table_dnd questions
//       if (dndSubtype === "table_dnd") {
//         (payload as any).column_headers = dnd.tableColumnHeaders || ["Row", "Answer"];
//       }

//       console.log("📝 Sending DND payload:", JSON.stringify(payload, null, 2));
//       console.log("🎯 To endpoint:", endpoint);

//       const response = await fetch(endpoint, {
//         method:
//           initialValues?.id || initialValues?.question_id ? "PUT" : "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       const responseData = await response.json();
//       console.log("📥 Response:", responseData);

//       if (!response.ok) {
//         if (responseData.detail) {
//           // If it's a string, use it directly
//           if (typeof responseData.detail === "string") {
//             throw new Error(responseData.detail);
//           }
//           // If it's an array of validation errors, format them
//           else if (Array.isArray(responseData.detail)) {
//             const errors = responseData.detail
//               .map((err: any) => {
//                 if (err.msg) return err.msg;
//                 return JSON.stringify(err);
//               })
//               .join(", ");
//             throw new Error(errors);
//           }
//         }
//         throw new Error("Failed to save DND question");
//       }

//       console.log("✅ DND Save successful:", responseData);
//       toast.success("DND question saved successfully");

//       // After successful save, fetch the complete updated DND data for table refresh
//       const questionId = initialValues?.question_id || responseData.question_id || responseData.id;
//       if (isTestPack && questionId) {
//         try {
//           console.log("🔄 Fetching updated DND data for refresh, questionId:", questionId);

//           // Determine the correct get endpoint based on subtype
//           let getEndpoint;
//           switch (dndSubtype) {
//             case "table_dnd":
//               getEndpoint = `${baseUrl}/api/test-pack/dnd/table_dnd/get/${questionId}`;
//               break;
//             case "two_buckets_single":
//               getEndpoint = `${baseUrl}/api/test-pack/dnd/two-buckets-single/${questionId}`;
//               break;
//             case "two_buckets_multi":
//               getEndpoint = `${baseUrl}/api/test-pack/dnd/two-buckets-multi/${questionId}`;
//               break;
//             case "one_bucket_multi":
//               getEndpoint = `${baseUrl}/api/test-pack/dnd/one-bucket-multi/${questionId}`;
//               break;
//             default:
//               getEndpoint = `${baseUrl}/api/test-pack/dnd/get/${questionId}`;
//               break;
//           }

//           const fetchResponse = await fetch(getEndpoint);
//           if (fetchResponse.ok) {
//             const updatedDndData = await fetchResponse.json();
//             console.log("✅ Fetched updated DND data:", updatedDndData);

//             // Transform the data to match the expected format for the parent component
//             const transformedData = {
//               ...initialValues, // Keep original structure
//               ...updatedDndData.question, // Update question data
//               buckets: updatedDndData.buckets || [],
//               choices: updatedDndData.choices || [],
//               assignments: updatedDndData.assignments || [],
//               // Preserve other fields that might be needed
//               question_type: "DND",
//               question_category: dndSubtype,
//             };

//             // Call onSave with the complete updated data
//             onSave(transformedData);
//           } else {
//             console.warn("⚠️ Failed to fetch updated DND data, using response data");
//             onSave(responseData);
//           }
//         } catch (fetchError) {
//           console.error("❌ Error fetching updated DND data:", fetchError);
//           // Fallback to using the response data
//           onSave(responseData);
//         }
//       } else {
//         // For question bank or when questionId is not available, use response data
//         onSave(responseData);
//       }

//       // Close modal after successful save and refresh
//       onClose();
//     } catch (error) {
//       console.error("❌ Error saving DND question:", error);
//       toast.error(
//         error instanceof Error ? error.message : "Failed to save DND question",
//       );
//     }
//   };

//   // Add the MC modal state hook at the top so it's in scope for formRenderers
//   const mc = useMCModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);
//   const ma = useMAModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);
//   const tf = useTFModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);
//   const dnd = useDnDModalState(initialValues, isOpen, onSave, onClose, !!istestpack, dndSubtype, subject, categoryId);
//   const blank = useBlankModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);
//   const tableGrid = useTableGridModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);
//   const graphSelector = useGraphSelectorModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);
//   // Add this after the other modal state hooks
//   const raySelector = useRaySelectorModalState(
//     initialValues,
//     isOpen,
//     onSave,
//     !!istestpack,
//     subject,
//     categoryId
//   );
//   // const hotText = useHotTextModalState(
//   //   initialValues,
//   //   isOpen,
//   //   onSave,
//   //   onClose,
//   //   !!istestpack,
//   //   subject,
//   //   categoryId
//   // );

//   // --- Form Renderers Map ---
//   const formRenderers: Record<string, () => JSX.Element> = {
//     MC: () => (
//       <MultipleChoiceForm
//         mcQuestion={mc.mcQuestion}
//         setMcQuestion={mc.setMcQuestion}
//         mcChoices={mc.mcChoices}
//         mcExplanation={mc.mcExplanation}
//         setMcExplanation={mc.setMcExplanation}
//         mcVariant={mc.mcVariant}
//         setMcVariant={mc.setMcVariant}
//         addMcChoice={mc.addMcChoice}
//         removeMcChoice={mc.removeMcChoice}
//         updateMcChoice={mc.updateMcChoice}
//         setCorrectChoice={mc.setCorrectChoice}
//         questionImageUrl={mc.questionImageUrl}
//         onQuestionImageUploaded={mc.setQuestionImageUrl}
//         onQuestionImageDeleted={() => mc.setQuestionImageUrl(undefined)}
//         mcDifficulty={mc.mcDifficulty}
//         setMcDifficulty={mc.setMcDifficulty}
//         isTestPack={!!istestpack}
//       />
//     ),
//     MA: () => (
//       <MultiAnswerForm
//         maQuestion={ma.maQuestion}
//         setMaQuestion={ma.setMaQuestion}
//         maChoices={ma.maChoices}
//         addMaChoice={ma.addMaChoice}
//         removeMaChoice={ma.removeMaChoice}
//         updateMaChoice={ma.updateMaChoice}
//         questionImageUrl={ma.questionImageUrl}
//         onQuestionImageUploaded={ma.setQuestionImageUrl}
//         onQuestionImageDeleted={() => ma.setQuestionImageUrl(undefined)}
//         maDifficulty={ma.maDifficulty}
//         setMaDifficulty={ma.setMaDifficulty}
//         isTestPack={!!istestpack}
//       />
//     ),
//     TF: () => (
//       <TrueFalseForm
//         tfQuestion={tf.tfQuestion}
//         setTfQuestion={tf.setTfQuestion}
//         tfAnswer={tf.tfAnswer}
//         setTfAnswer={tf.setTfAnswer}
//         tfExplanation={tf.tfExplanation}
//         setTfExplanation={tf.setTfExplanation}
//         tfDifficulty={tf.tfDifficulty}
//         setTfDifficulty={tf.setTfDifficulty}
//       />
//     ),
//     HOT_TEXT: () => (
//       <HotTextForm
//         question={hotText.question}
//         setQuestion={hotText.setQuestion}
//         prompt={hotText.prompt}
//         setPrompt={hotText.setPrompt}
//         passage={hotText.passage}
//         setPassage={hotText.setPassage}
//         minSelections={hotText.minSelections}
//         setMinSelections={hotText.setMinSelections}
//         maxSelections={hotText.maxSelections}
//         setMaxSelections={hotText.setMaxSelections}
//         regions={hotText.regions}
//         setRegions={hotText.setRegions}
//         difficulty={hotText.difficulty}
//         setDifficulty={hotText.setDifficulty}
//         onCancel={onClose}
//         istestpack={!!istestpack}
//       />
//     ),
//     BLANK: () => (
//       <BlankForm
//         blankQuestion={blank.blankQuestion}
//         setBlankQuestion={blank.setBlankQuestion}
//         blankCorrectAnswer={blank.blankCorrectAnswer}
//         setBlankCorrectAnswer={blank.setBlankCorrectAnswer}
//         blankVariant={blank.blankVariant}
//         setBlankVariant={blank.setBlankVariant}
//         blankDifficulty={blank.blankDifficulty}
//         setBlankDifficulty={blank.setBlankDifficulty}
//       />
//     ),
//     DND: () => {
//       console.log("[QuestionModal] Rendering DND form", {
//         questionType,
//         dndSubtype,
//         initialValuesCategory: initialValues?.question_category,
//       });
//       return (
//         <DragDropForm
//           dndQuestion={dnd.dndQuestion}
//           setDndQuestion={dnd.setDndQuestion}
//           dndChoices={dnd.dndChoices}
//           updateDndChoice={dnd.updateDndChoice}
//           removeDndChoice={dnd.removeDndChoice}
//           addDndChoice={dnd.addDndChoice}
//           dndBuckets={dnd.dndBuckets}
//           updateDndBucket={dnd.updateDndBucket}
//           addDndBucket={dnd.addDndBucket}
//           removeDndBucket={dnd.removeDndBucket}
//           dndCorrectAssignments={dnd.dndCorrectAssignments}
//           setDndCorrectAssignments={dnd.setDndCorrectAssignments as React.Dispatch<React.SetStateAction<{ [bucketIdx: number]: number[] }>>}
//           poolChoices={dnd.poolChoices as number[]}
//           setPoolChoices={dnd.setPoolChoices as React.Dispatch<React.SetStateAction<number[]>>}
//           previewAssignments={dnd.previewAssignments as { [bucketIdx: number]: number[] }}
//           setPreviewAssignments={dnd.setPreviewAssignments as React.Dispatch<React.SetStateAction<{ [bucketIdx: number]: number[] }>>}
//           dndExplanation={dnd.dndExplanation}
//           setDndExplanation={dnd.setDndExplanation}
//           dndSubtype={dndSubtype}
//           dndDifficulty={dnd.dndDifficulty}
//           setDndDifficulty={dnd.setDndDifficulty}
//           tableColumnHeaders={dnd.tableColumnHeaders}
//           setTableColumnHeaders={dnd.setTableColumnHeaders}
//         />
//       );
//     },
//     TABLE_GRID: () => (
//       <TableGridForm
//         tgPrompt={tableGrid.tgPrompt}
//         setTgPrompt={tableGrid.setTgPrompt}
//         tgSelectionMode={tableGrid.tgSelectionMode}
//         setTgSelectionMode={tableGrid.setTgSelectionMode}
//         tgRowLabels={tableGrid.tgRowLabels}
//         tgColumnLabels={tableGrid.tgColumnLabels}
//         tgFirstColumnHeader={tableGrid.tgFirstColumnHeader}
//         setTgFirstColumnHeader={tableGrid.setTgFirstColumnHeader}
//         tgAnswerMatrix={tableGrid.tgAnswerMatrix}
//         handleTgRowLabelChange={tableGrid.handleTgRowLabelChange}
//         handleTgColumnLabelChange={tableGrid.handleTgColumnLabelChange}
//         handleTgCellToggle={tableGrid.handleTgCellToggle}
//         handleTgAddRow={tableGrid.handleTgAddRow}
//         handleTgRemoveRow={tableGrid.handleTgRemoveRow}
//         handleTgAddColumn={tableGrid.handleTgAddColumn}
//         handleTgRemoveColumn={tableGrid.handleTgRemoveColumn}
//         tgErrors={tableGrid.tgErrors}
//         tgServerError={tableGrid.tgServerError}
//         handleTableGridSave={tableGrid.save}
//         onClose={onClose}
//         tgDifficulty={tableGrid.tgDifficulty}
//         setTgDifficulty={tableGrid.setTgDifficulty}
//         istestpack={istestpack}
//       />
//     ),
//     RAY_SELECTOR: () => (
//       <RaySelectorForm
//         rayPrompt={raySelector.rayPrompt}
//         setRayPrompt={raySelector.setRayPrompt}
//         numberlineMin={raySelector.numberlineMin}
//         setNumberlineMin={raySelector.setNumberlineMin}
//         numberlineMax={raySelector.numberlineMax}
//         setNumberlineMax={raySelector.setNumberlineMax}
//         tickInterval={raySelector.tickInterval}
//         setTickInterval={raySelector.setTickInterval}
//         rayTypes={raySelector.rayTypes}
//         selectedRayType={raySelector.selectedRayType}
//         setSelectedRayType={raySelector.setSelectedRayType}
//         selectedRayEndpoint={raySelector.selectedRayEndpoint}
//         setSelectedRayEndpoint={raySelector.setSelectedRayEndpoint}
//         rayType={raySelector.rayType}
//         setRayType={raySelector.setRayType}
//         rayEndpoint={raySelector.rayEndpoint}
//         setRayEndpoint={raySelector.setRayEndpoint}
//         rayExplanation={raySelector.rayExplanation}
//         setRayExplanation={raySelector.setRayExplanation}
//         raySelectorValid={raySelector.raySelectorValid}
//         rayDifficulty={raySelector.rayDifficulty}
//         setRayDifficulty={raySelector.setRayDifficulty}
//       />
//     ),
//     GRAPH_SELECTOR: () => (
//       <GraphSelectorForm
//         graphPrompt={graphSelector.graphPrompt}
//         setGraphPrompt={graphSelector.setGraphPrompt}
//         xMin={graphSelector.xMin}
//         setXMin={graphSelector.setXMin}
//         xMax={graphSelector.xMax}
//         setXMax={graphSelector.setXMax}
//         yMin={graphSelector.yMin}
//         setYMin={graphSelector.setYMin}
//         yMax={graphSelector.yMax}
//         setYMax={graphSelector.setYMax}
//         gridInterval={graphSelector.gridInterval}
//         setGridInterval={graphSelector.setGridInterval}
//         maxSelectablePoints={graphSelector.maxSelectablePoints}
//         setMaxSelectablePoints={graphSelector.setMaxSelectablePoints}
//         correctPoints={graphSelector.correctPoints}
//         setCorrectPoints={graphSelector.setCorrectPoints as (points: GraphSelectorPoint[]) => void}
//         graphExplanation={graphSelector.graphExplanation}
//         setGraphExplanation={graphSelector.setGraphExplanation}
//         graphSelectorValid={graphSelector.graphSelectorValid}
//         xAxisLabel={graphSelector.xAxisLabel}
//         setXAxisLabel={graphSelector.setXAxisLabel}
//         yAxisLabel={graphSelector.yAxisLabel}
//         setYAxisLabel={graphSelector.setYAxisLabel}
//         graphDifficulty={graphSelector.graphDifficulty}
//         setGraphDifficulty={graphSelector.setGraphDifficulty}
//         showAxes={graphSelector.showAxes}
//         setShowAxes={graphSelector.setShowAxes}
//         showLabels={graphSelector.showLabels}
//         setShowLabels={graphSelector.setShowLabels}
//         snapToGrid={graphSelector.snapToGrid}
//         setSnapToGrid={graphSelector.setSnapToGrid}
//         graphInstruction={graphSelector.graphInstruction}
//         setGraphInstruction={graphSelector.setGraphInstruction}
//         availablePoints={graphSelector.availablePoints}
//         setAvailablePoints={graphSelector.setAvailablePoints as (points: GraphSelectorPoint[]) => void}
//       />
//     ),
//     RC: () => (
//       <RCForm
//         rcPassage={rcPassage}
//         setRcPassage={setRcPassage}
//         rcTopicId={rcTopicId}
//         setRcTopicId={setRcTopicId}
//         rcSubTopicId={rcSubTopicId}
//         setRcSubTopicId={setRcSubTopicId}
//         rcImageUrl={rcImageUrl}
//         setRcImageUrl={setRcImageUrl}
//         rcStartPage={rcStartPage}
//         setRcStartPage={setRcStartPage}
//         rcEndPage={rcEndPage}
//         setRcEndPage={setRcEndPage}
//         rcDifficulty={rcDifficulty}
//         setRcDifficulty={setRcDifficulty}
//       />
//     ),
//     // Handle ANY question with passage (RC, REA, REB, MC, MA, etc.) - combine all RC variants
//     REA: () => (
//       <RCForm
//         rcPassage={rcPassage}
//         setRcPassage={setRcPassage}
//         rcTopicId={rcTopicId}
//         setRcTopicId={setRcTopicId}
//         rcSubTopicId={rcSubTopicId}
//         setRcSubTopicId={setRcSubTopicId}
//         rcImageUrl={rcImageUrl}
//         setRcImageUrl={setRcImageUrl}
//         rcStartPage={rcStartPage}
//         setRcStartPage={setRcStartPage}
//         rcEndPage={rcEndPage}
//         setRcEndPage={setRcEndPage}
//         rcDifficulty={rcDifficulty}
//         setRcDifficulty={setRcDifficulty}
//       />
//     ),
//     REB: () => (
//       <RCForm
//         rcPassage={rcPassage}
//         setRcPassage={setRcPassage}
//         rcTopicId={rcTopicId}
//         setRcTopicId={setRcTopicId}
//         rcSubTopicId={rcSubTopicId}
//         setRcSubTopicId={setRcSubTopicId}
//         rcImageUrl={rcImageUrl}
//         setRcImageUrl={setRcImageUrl}
//         rcStartPage={rcStartPage}
//         setRcStartPage={setRcStartPage}
//         rcEndPage={rcEndPage}
//         setRcEndPage={setRcEndPage}
//         rcDifficulty={rcDifficulty}
//         setRcDifficulty={setRcDifficulty}
//       />
//     ),
//     EQUATION_CALCULATOR: () => (
//       <EquationCalculatorForm
//         question={equationQuestion}
//         setQuestion={setEquationQuestion}
//         correctAnswer={equationCorrectAnswer}
//         setCorrectAnswer={setEquationCorrectAnswer}
//         questionImageUrl={equationQuestionImageUrl}
//         onQuestionImageUploaded={setEquationQuestionImageUrl}
//         onQuestionImageDeleted={() => setEquationQuestionImageUrl(undefined)}
//         difficulty={equationDifficulty}
//         setDifficulty={setEquationDifficulty}
//         questionId={istestpack ? initialValues?.question_id : initialValues?.id}
//         userName={userName}
//         isTestPack={istestpack}
//         allowTemporary={istestpack ? !initialValues?.question_id : !initialValues?.id}
//       />
//     ),
//   };

//   // Add a function to check if DND form is valid
//   const isDnDFormValid = () => {
//     // Basic validation
//     if (!dndState.dndQuestion || !dndSubtype) return false;

//     // Bucket validation
//     if (dndSubtype === "one_bucket_multi" && dndState.dndBuckets.length !== 1)
//       return false;
//     if (dndSubtype === "one_bucket_single" && dndState.dndBuckets.length < 1)
//       return false; // More lenient: allow 1 or more buckets instead of exactly 1
//     if (
//       (dndSubtype === "two_buckets_single" ||
//         dndSubtype === "two_buckets_multi") &&
//       dndState.dndBuckets.length !== 2
//     )
//       return false;

//     // Choices validation
//     if (!dndState.dndChoices.length) return false;

//     // Assignment validation - at least one choice must be assigned
//     const hasAssignments = Object.values(dndState.dndCorrectAssignments).some(
//       (choices) => choices.length > 0,
//     );
//     if (!hasAssignments) return false;

//     return true;
//   };

//   // --- Footer Renderers Map ---
//   const footerRenderers: Record<string, JSX.Element | null> = {
//     MC: (
//       <DialogFooter className="mt-6">
//         <Button variant="outline" onClick={mc.handleClose || onClose}>
//           Cancel
//         </Button>
//         <Button onClick={mc.save} disabled={!mc.mcValid}>
//           Save
//         </Button>
//       </DialogFooter>
//     ),
//     MA: (
//       <DialogFooter className="mt-6">
//         <Button variant="outline" onClick={ma.handleClose || onClose}>
//           Cancel
//         </Button>
//         <Button onClick={ma.save} disabled={!ma.maValid}>
//           Save
//         </Button>
//       </DialogFooter>
//     ),
//     TF: (
//       <DialogFooter className="mt-6">
//         <Button variant="outline" onClick={onClose}>
//           Cancel
//         </Button>
//         <Button onClick={tf.save} disabled={!tf.tfValid}>
//           Save
//         </Button>
//       </DialogFooter>
//     ),
//     BLANK: (
//       <DialogFooter className="mt-6">
//         <Button variant="outline" onClick={blank.handleClose || onClose}>
//           Cancel
//         </Button>
//         <Button onClick={blank.save} disabled={!blank.blankValid}>
//           Save
//         </Button>
//       </DialogFooter>
//     ),
//     DND: (
//       <div className="flex justify-end gap-2">
//         <Button variant="outline" onClick={dnd.handleClose || onClose}>
//           Cancel
//         </Button>
//         <Button onClick={dnd.save} disabled={!dnd.dndValid}>
//           Save
//         </Button>
//       </div>
//     ),
//     RAY_SELECTOR: (
//       <DialogFooter className="mt-6">
//         <Button variant="outline" onClick={onClose}>
//           Cancel
//         </Button>
//         <Button
//           onClick={raySelector.save}
//           disabled={!raySelector.raySelectorValid}
//         >
//           Save
//         </Button>
//       </DialogFooter>
//     ),
//     GRAPH_SELECTOR: (
//       <DialogFooter className="mt-6">
//         <Button variant="outline" onClick={onClose}>
//           Cancel
//         </Button>
//         <Button onClick={graphSelector.save} disabled={!graphSelector.graphSelectorValid}>
//           Save
//         </Button>
//       </DialogFooter>
//     ),
//     HOT_TEXT: (
//       <DialogFooter className="mt-6">
//         <Button variant="outline" onClick={onClose}>
//           Cancel
//         </Button>
//         <Button
//           onClick={hotText.save}
//           disabled={!hotText.hotTextValid}
//         >
//           Save
//         </Button>
//       </DialogFooter>
//     ),
//     TABLE_GRID: (
//       <DialogFooter className="mt-6">
//         <Button variant="outline" onClick={onClose}>
//           Cancel
//         </Button>
//         <Button onClick={tableGrid.save} disabled={tableGrid.tgErrors.length > 0}>
//           Save
//         </Button>
//       </DialogFooter>
//     ),
//     EQUATION_CALCULATOR: (
//       <DialogFooter className="mt-6">
//         <Button variant="outline" onClick={onClose}>
//           Cancel
//         </Button>
//         <Button 
//           onClick={() => {
//             console.log("🔍 [EQUATION_CALCULATOR Save Button] Clicked:", {
//               equationIsValid,
//               equationQuestion: equationQuestion?.length,
//               equationCorrectAnswer: equationCorrectAnswer?.length,
//               questionType
//             });
//             handleSave();
//           }} 
//           disabled={!canSave("EQUATION_CALCULATOR")}
//         >
//           Save
//         </Button>
//       </DialogFooter>
//     ),
//     RC: (
//       <DialogFooter className="mt-6">
//         <Button variant="outline" onClick={onClose}>
//           Cancel
//         </Button>
//         <Button 
//           disabled={!canSave("RC")}
//           onClick={() => {
//             console.log("🔍 [Save Button] RC save button clicked:", {
//               canSave: canSave("RC"),
//               shouldEditPassage,
//               rcPassage: rcPassage?.length,
//               questionType
//             });
//             handleSave();
//           }}
//         >
//           Save Passage
//         </Button>
//       </DialogFooter>
//     ),
//     REA: (
//       <DialogFooter className="mt-6">
//         <Button variant="outline" onClick={onClose}>
//           Cancel
//         </Button>
//         <Button onClick={() => handleSave()} disabled={!canSave("REA")}>
//           Save Passage
//         </Button>
//       </DialogFooter>
//     ),
//     REB: (
//       <DialogFooter className="mt-6">
//         <Button variant="outline" onClick={onClose}>
//           Cancel
//         </Button>
//         <Button onClick={() => handleSave()} disabled={!canSave("REB")}>
//           Save Passage
//         </Button>
//       </DialogFooter>
//     ),
//   };

//   useEffect(() => {
//     // When dndChoices changes, reset poolChoices to all indices not assigned to any bucket
//     dnd.setPoolChoices((prev) => {
//       const assigned = Object.values(dnd.previewAssignments).flat();
//       const allIndices = dnd.dndChoices.map((_, idx) => idx);
//       return allIndices.filter((idx) => !assigned.includes(idx));
//     });
//   }, [dnd.dndChoices, dnd.previewAssignments]);

//   // Add a flag to track if we've already prefilled the data
//   const [hasPrefilled, setHasPrefilled] = useState(false);

//   // Reset prefill flag ONLY when modal closes
//   useEffect(() => {
//     if (!isOpen) {
//       setHasPrefilled(false);
//     }
//   }, [isOpen]);

//   // Clear TABLE_GRID errors when modal closes to prevent persistence across sessions
//   useEffect(() => {
//     if (!isOpen) {
//       setTgErrors([]); // Clear table grid errors when modal closes
//       setTgServerError(null); // Clear server errors when modal closes

//       // Reset Table Grid fields when modal closes and we're not editing
//       if (!initialValues) {
//         setTgPrompt("");
//         setTgRowLabels(["Row 1"]);
//         setTgColumnLabels(["Column 1", "Column 2"]);
//         setTgSelectionMode("single");
//         setTgFirstColumnHeader("");
//         setTgAnswerMatrix([]);
//       }
//     }
//   }, [isOpen, initialValues]);

//   // Reset prefill flag when initialValues change (for TABLE_GRID async data loading)
//   // Use a ref to track the previous initialValues to avoid unnecessary resets
//   const prevInitialValuesRef = useRef(initialValues);
//   useEffect(() => {
//     const prevInitialValues = prevInitialValuesRef.current;

//     // Only reset if we're switching to a different question (different ID) or from editing to creating
//     const shouldReset =
//       (!prevInitialValues && initialValues) ||
//       (prevInitialValues && !initialValues) ||
//       prevInitialValues?.id !== initialValues?.id;

//     if (shouldReset) {
//       setHasPrefilled(false);
//     }

//     // Also update questionType when initialValues change
//     if (initialValues && initialValues.question_type) {
//       setQuestionType(initialValues.question_type);
//     } else if (
//       initialValues &&
//       initialValues.row_labels &&
//       initialValues.column_labels
//     ) {
//       // If no explicit question_type but has TABLE_GRID structure, set it
//       setQuestionType("TABLE_GRID");
//     }

//     prevInitialValuesRef.current = initialValues;
//   }, [initialValues]);

//   // Prefill MC data if editing an MC question
//   useEffect(() => {
//     if (
//       isOpen &&
//       initialValues &&
//       (initialValues.question_type === "MC" ||
//         initialValues.question_type_acronym === "MC") &&
//       !hasPrefilled
//     ) {
//       console.log("Prefilling MC modal with:", initialValues);
//       console.log("MC initialValues.difficulty:", initialValues.difficulty);
//       setQuestionType("MC");
//       setMcQuestion(initialValues.question || "");
//       setMcExplanation(initialValues.explanation || "");
//       setQuestionImageUrl(initialValues.question_image_url || undefined);
//       // Set variant based on question_category, defaulting to 'standard' for backward compatibility
//       setMcVariant(
//         (initialValues.question_category as MCVariant) || "standard",
//       );

//       // Convert choices to the expected format
//       if (initialValues.choices && Array.isArray(initialValues.choices)) {
//         const convertedChoices = initialValues.choices.map(
//           (choice: any, idx: number) => ({
//             letter:
//               choice.choice_label ||
//               choice.letter ||
//               String.fromCharCode(65 + idx),
//             value: {
//               text:
//                 choice.choice_text || choice.value?.text || choice.text || "",
//               is_correct:
//                 choice.is_correct || choice.value?.is_correct || false,
//               explanation:
//                 choice.explanation || choice.value?.explanation || "",
//               choice_image_url:
//                 choice.choice_image_url ||
//                 choice.value?.choice_image_url ||
//                 undefined,
//               id: choice.id || choice.value?.id || undefined,
//             },
//           }),
//         );
//         console.log("Setting MC choices from initialValues:", convertedChoices);
//         setMcChoices(convertedChoices);
//       }

//       // Set difficulty
//       const difficultyValue = initialValues.difficulty || 3;
//       console.log("Setting MC difficulty to:", difficultyValue);
//       setMcDifficulty(difficultyValue);

//       setHasPrefilled(true);
//     }
//   }, [isOpen, initialValues, hasPrefilled]);

//   // Prefill MA data if editing an MA question
//   useEffect(() => {
//     if (
//       isOpen &&
//       initialValues &&
//       (initialValues.question_type === "MA" ||
//         initialValues.question_type_acronym === "MA") &&
//       !hasPrefilled
//     ) {
//       console.log("Prefilling MA modal with:", initialValues);
//       console.log("MA initialValues.difficulty:", initialValues.difficulty);
//       setQuestionType("MA");
//       setMaQuestion(initialValues.question || "");
//       setQuestionImageUrl(initialValues.question_image_url || undefined);

//       // Convert choices to the expected format
//       if (initialValues.choices && Array.isArray(initialValues.choices)) {
//         const convertedChoices = initialValues.choices.map(
//           (choice: any, idx: number) => ({
//             choice_label: choice.choice_label || String.fromCharCode(65 + idx),
//             choice_text: choice.choice_text || choice.text || "",
//             is_correct: choice.is_correct || false,
//             explanation: choice.explanation || "",
//             choice_image_url: choice.choice_image_url || undefined,
//             id: choice.id || undefined,
//           }),
//         );
//         console.log("Setting MA choices from initialValues:", convertedChoices);
//         setMaChoices(convertedChoices);
//       }

//       // Set difficulty
//       const difficultyValue = initialValues.difficulty || 3;
//       console.log("Setting MA difficulty to:", difficultyValue);
//       setMaDifficulty(difficultyValue);

//       setHasPrefilled(true);
//     }
//   }, [isOpen, initialValues, hasPrefilled]);

//   // Prefill TF data if editing a TF question
//   useEffect(() => {
//     if (
//       isOpen &&
//       initialValues &&
//       initialValues.question_type === "TF" &&
//       !hasPrefilled
//     ) {
//       console.log("Prefilling TF modal with:", initialValues);
//       setQuestionType("TF");
//       setTfQuestion(initialValues.question || "");
//       setTfExplanation(initialValues.explanation || "");

//       // Convert answer string to boolean
//       if (initialValues.answer) {
//         const answerStr = String(initialValues.answer).toLowerCase();
//         setTfAnswer(answerStr === "true" || answerStr === "1");
//       }

//       // Set difficulty
//       setTfDifficulty(initialValues.difficulty || 3);

//       setHasPrefilled(true);
//     }
//   }, [isOpen, initialValues, hasPrefilled]);

//   // Prefill BLANK data if editing a BLANK question
//   useEffect(() => {
//     if (
//       isOpen &&
//       initialValues &&
//       initialValues.question_type === "BLANK" &&
//       !hasPrefilled
//     ) {
//       console.log("Prefilling BLANK modal with:", initialValues);
//       setQuestionType("BLANK");
//       blank.setBlankQuestion(initialValues.question || "");
//       blank.setBlankCorrectAnswer(
//         initialValues.answer || initialValues.correct_answer || "",
//       );
//       blank.setBlankExplanation(initialValues.explanation || "");
//       // Set variant based on question_category, defaulting to 'placeholder' for backward compatibility
//       blank.setBlankVariant(
//         (initialValues.question_category as BlankVariant) || "placeholder",
//       );

//       // Set difficulty
//       setBlankDifficulty(initialValues.difficulty || 3);

//       setHasPrefilled(true);
//     }
//   }, [isOpen, initialValues, hasPrefilled]);

//   // Prefill HOT_TEXT data if editing a HOT_TEXT question
//   useEffect(() => {
//     if (
//       isOpen &&
//       initialValues &&
//       initialValues.question_type === "HOT_TEXT" &&
//       !hasPrefilled
//     ) {
//       console.log("Prefilling HOT_TEXT modal with:", initialValues);
//       setQuestionType("HOT_TEXT");
//       setHasPrefilled(true);
//     }
//   }, [isOpen, initialValues, hasPrefilled]);

//   // Prefill DND data if editing a DND question
//   useEffect(() => {
//     const isDndQuestion =
//       initialValues &&
//       (initialValues.question_type === "DND" ||
//         initialValues.question_type_acronym === "DND");

//     if (isOpen && isDndQuestion && !hasPrefilled) {
//       setQuestionType("DND");
//       // Set DND subtype based on question_category (handle old database values)
//       let subtype: DnDSubtype = "two_buckets_single"; // default
//       if (initialValues.question_category) {
//         if ([
//           "two_buckets_single",
//           "two_buckets_multi",
//           "one_bucket_multi",
//           "one_bucket_single",
//           "table_dnd",
//           "drag_drop",
//           "fill_box",
//           "multi_assignment",
//         ].includes(initialValues.question_category)) {
//           subtype = initialValues.question_category as DnDSubtype;
//         }
//       }
//       setDndSubtype(subtype);
//       // ... rest of prefill logic ...
//     }
//   }, [isOpen, initialValues, hasPrefilled]);

//   // Prefill TABLE_GRID data if editing a TABLE_GRID question
//   useEffect(() => {
//     // Check if this is a TABLE_GRID question - could be in question_type or inferred from data structure
//     const isTableGrid =
//       initialValues &&
//       (initialValues.question_type === "TABLE_GRID" ||
//         (initialValues.row_labels &&
//           initialValues.column_labels &&
//           initialValues.answer_matrix));

//     if (isOpen && isTableGrid && !hasPrefilled) {
//       setQuestionType("TABLE_GRID");
//       setTgPrompt(initialValues.question || "");
//       setTgRowLabels(initialValues.row_labels || ["Row 1"]);
//       setTgColumnLabels(
//         initialValues.column_labels || ["Column 1", "Column 2"],
//       );
//       setTgSelectionMode(initialValues.selection_mode || "single");
//       setTgFirstColumnHeader(initialValues.first_column_header || "");
//       setTgAnswerMatrix(initialValues.answer_matrix || []);
//       setTgDifficulty(initialValues.difficulty || 3);
//       setHasPrefilled(true);
//     }
//   }, [isOpen, initialValues, hasPrefilled]);

//   // Prefill EQUATION_CALCULATOR data if editing an EQUATION_CALCULATOR question
//   useEffect(() => {
//     const isEquationCalculator =
//       initialValues &&
//       (initialValues.question_type === "EQUATION_CALCULATOR" ||
//        initialValues.question_type_acronym === "EQUATION_CALCULATOR" ||
//        initialValues.question_type === 51);

//     if (isOpen && isEquationCalculator && !hasPrefilled) {
//       console.log("Prefilling EQUATION_CALCULATOR modal with:", initialValues);
//       setQuestionType("EQUATION_CALCULATOR");

//       // Set question text
//       setEquationQuestion(initialValues.question || "");

//       // Set correct answer from choices or correct_answer field
//       let correctAnswer = "";
//       if (initialValues.choices && initialValues.choices.length > 0) {
//         // Find the primary answer from choices
//         const primaryChoice = initialValues.choices.find((choice: any) => choice.is_primary);
//         correctAnswer = primaryChoice ? primaryChoice.answer : initialValues.choices[0].answer;
//       } else if (initialValues.correct_answer) {
//         correctAnswer = initialValues.correct_answer;
//       }
//       setEquationCorrectAnswer(correctAnswer);

//       // Set other fields
//       setEquationQuestionImageUrl(initialValues.question_image_url);
//       setEquationDifficulty(initialValues.difficulty || 3);

//       setHasPrefilled(true);
//     }
//   }, [isOpen, initialValues, hasPrefilled]);

//   // Reset state when creating new questions (no initialValues)
//   useEffect(() => {
//     if (isOpen && !initialValues && !hasPrefilled) {
//       console.log("Resetting modal state for new question");
//       // Only set questionType to MC if it is still MC (i.e., user hasn't changed it)
//       setQuestionType((prev) => prev === "MC" ? "MC" : prev);
//       setMcQuestion("");
//       setMcChoices([
//         { letter: "A", value: { text: "", is_correct: false } },
//         { letter: "B", value: { text: "", is_correct: false } },
//       ]);
//       setMcExplanation("");
//       setQuestionImageUrl(undefined);
//       setMaQuestion("");
//       setMaChoices([
//         {
//           choice_label: "A",
//           choice_text: "",
//           is_correct: false,
//           explanation: "",
//           choice_image_url: undefined,
//           id: undefined,
//         },
//         {
//           choice_label: "B",
//           choice_text: "",
//           is_correct: false,
//           explanation: "",
//           choice_image_url: undefined,
//           id: undefined,
//         },
//         {
//           choice_label: "C",
//           choice_text: "",
//           is_correct: false,
//           explanation: "",
//           choice_image_url: undefined,
//           id: undefined,
//         },
//       ]);
//       blank.setBlankQuestion("");
//       blank.setBlankCorrectAnswer("");
//       blank.setBlankExplanation("");
//       setTfQuestion("");
//       setTfAnswer(null);
//       setTfExplanation("");

//       // Reset DND state properly
//       dnd.setDndQuestion("");
//       setDndSubtype("two_buckets_single");
//       dnd.resetDnDState(); // This will set proper default assignments

//       // Reset Graph Selector state
//       resetGraphSelectorState();

//       // Remove: resetRaySelectorState();

//       // Reset RC state
//       setRcPassage("");
//       setRcTopicId(undefined);
//       setRcSubTopicId(undefined);
//       setRcImageUrl(undefined);
//       setRcStartPage(undefined);
//       setRcEndPage(undefined);

//       // Reset EQUATION_CALCULATOR state
//       resetEquationCalculatorState();

//       setHasPrefilled(true);
//     }
//   }, [isOpen, initialValues, hasPrefilled, dnd.resetDnDState, resetGraphSelectorState, blank, setTfQuestion, setTfAnswer, setTfExplanation, resetEquationCalculatorState]);

//   // Prefill RC passage data for ANY question with passage_id (not just RC/REA/REB)
//   useEffect(() => {
//     const hasPassage = initialValues?.passage_id && Number(initialValues.passage_id) > 0;

//     if (isOpen && hasPassage && !hasPrefilled) {
//       console.log("🔄 Prefilling passage data for question with passage_id:", initialValues.passage_id);

//       // If passage content is already available, use it
//       if (initialValues.passage) {
//         setRcPassage(initialValues.passage);
//         setRcStartPage(initialValues.start_page || undefined);
//         setRcEndPage(initialValues.end_page || undefined);
//         setRcImageUrl(initialValues.image_url || "");
//       } else {
//         // If passage content not loaded, fetch it (similar to TestPack.tsx logic)
//         const fetchPassage = async () => {
//           try {
//             const response = await fetch(`${import.meta.env.VITE_API_URL}/api/test-pack/passages/get/${initialValues.passage_id}`);
//             if (response.ok) {
//               const passageData = await response.json();
//               setRcPassage(passageData.passage || "");
//               setRcStartPage(passageData.start_page || undefined);
//               setRcEndPage(passageData.end_page || undefined);
//               setRcImageUrl(passageData.image_url || "");
//               console.log("✅ Fetched passage data:", passageData);
//             } else {
//               console.warn("⚠️ Failed to fetch passage data");
//             }
//           } catch (error) {
//             console.error("❌ Error fetching passage:", error);
//           }
//         };
//         fetchPassage();
//       }
//     }
//   }, [isOpen, initialValues, hasPrefilled]);

//   // Add useEffect to handle bucket adjustments when DND subtype changes
//   useEffect(() => {
//     if (dndSubtype) {
//       // Adjust buckets based on DND subtype
//       switch (dndSubtype) {
//         case "one_bucket_multi":
//         case "one_bucket_single":
//           // Keep only the first bucket or create one if none exist
//           if (dndState.dndBuckets.length === 0) {
//             dnd.setDndBuckets([{ label: "Bucket", bucket_order: 0 }]);
//           } else {
//             dnd.setDndBuckets([dndState.dndBuckets[0]]);
//           }
//           // Clear assignments for removed buckets
//           const newAssignments = { 0: dndState.dndCorrectAssignments[0] || [] };
//           dnd.setDndCorrectAssignments(newAssignments);
//           break;

//         case "two_buckets_single":
//         case "two_buckets_multi":
//           // Ensure exactly two buckets
//           if (dndState.dndBuckets.length < 2) {
//             const newBuckets = [...dndState.dndBuckets];
//             while (newBuckets.length < 2) {
//               newBuckets.push({
//                 label: `Bucket ${newBuckets.length + 1}`,
//                 bucket_order: newBuckets.length,
//               });
//             }
//             dnd.setDndBuckets(newBuckets);
//           } else if (dndState.dndBuckets.length > 2) {
//             dnd.setDndBuckets(dndState.dndBuckets.slice(0, 2));
//             // Clear assignments for removed buckets
//             const newAssignments = {
//               0: dndState.dndCorrectAssignments[0] || [],
//               1: dndState.dndCorrectAssignments[1] || [],
//             };
//             dnd.setDndCorrectAssignments(newAssignments);
//           }
//           break;
//       }
//     }
//   }, [dndSubtype]); // Only run when dndSubtype changes

//   // Update the handleDnDSubtypeChange function
//   const handleDnDSubtypeChange = (newSubtype: string) => {
//     console.log("🔄 Changing DND subtype to:", newSubtype);
//     setDndSubtype(newSubtype as DnDSubtype);
//   };

//   // Update the handleAddBucket function to respect DND subtype
//   const handleAddBucket = () => {
//     if ((dndSubtype === "one_bucket_multi" || dndSubtype === "one_bucket_single") && dndState.dndBuckets.length >= 1) {
//       toast.error("One bucket variants can only have one bucket");
//       return;
//     }
//     if (
//       (dndSubtype === "two_buckets_single" ||
//         dndSubtype === "two_buckets_multi") &&
//       dndState.dndBuckets.length >= 2
//     ) {
//       toast.error("Two buckets types can only have two buckets");
//       return;
//     }

//     const newBucket = {
//       label: `Bucket ${dndState.dndBuckets.length + 1}`,
//       bucket_order: dndState.dndBuckets.length,
//     };
//     dnd.setDndBuckets([...dndState.dndBuckets, newBucket]);
//   };

//   // Update the handleRemoveBucket function to respect DND subtype
//   const handleRemoveBucket = (index: number) => {
//     if ((dndSubtype === "one_bucket_multi" || dndSubtype === "one_bucket_single") && dndState.dndBuckets.length <= 1) {
//       toast.error("One bucket variants must have one bucket");
//       return;
//     }
//     if (
//       (dndSubtype === "two_buckets_single" ||
//         dndSubtype === "two_buckets_multi") &&
//       dndState.dndBuckets.length <= 2
//     ) {
//       toast.error("Two buckets types must have two buckets");
//       return;
//     }

//     const newBuckets = dndState.dndBuckets.filter((_, i) => i !== index);
//     dnd.setDndBuckets(newBuckets);

//     // Remove assignments for the deleted bucket
//     const newAssignments = { ...dndState.dndCorrectAssignments };
//     delete newAssignments[index];
//     // Adjust bucket indices for remaining assignments
//     const adjustedAssignments: Record<number, number[]> = {};
//     Object.entries(newAssignments).forEach(([bucketIdx, choices]) => {
//       const adjustedIdx =
//         Number(bucketIdx) > index ? Number(bucketIdx) - 1 : Number(bucketIdx);
//       adjustedAssignments[adjustedIdx] = choices;
//     });
//     dnd.setDndCorrectAssignments(adjustedAssignments);
//   };

//   // Add this helper at the top of the component
//   const isAddMode =
//     !initialValues ||
//     (Object.keys(initialValues).length === 1 && (initialValues as any).test_id);

//   useEffect(() => {
//     if (
//       isOpen &&
//       initialValues &&
//       initialValues.question_type === "RAY_SELECTOR"
//     ) {

//     } else if (
//       isOpen &&
//       (!initialValues || initialValues.question_type !== "RAY_SELECTOR")
//     ) {
//       // setRsDifficulty(1);
//     }
//   }, [isOpen, initialValues, questionType]);

//   // Fetch main topics when subject changes (test pack only)
//   useEffect(() => {
//     if (istestpack && isOpen && subject) {
//       setMainTopicsLoading(true);
//       setMainTopicsError(null);

//       // Build the URL with parent_id for main topics
//       const parentId = SUBJECT_TO_PARENT_ID[subject as keyof typeof SUBJECT_TO_PARENT_ID];
//       const url = `${import.meta.env.VITE_API_URL}/api/test-pack/categories/get-all?parent_id=${parentId}`;

//       fetch(url)
//         .then((res) => {
//           if (!res.ok) throw new Error("Failed to fetch main topics");
//           return res.json();
//         })
//         .then((data) => {
//           setMainTopics(Array.isArray(data) ? data : []);
//         })
//         .catch((err) => {
//           setMainTopicsError("Could not load main topics");
//           setMainTopics([]);
//         })
//         .finally(() => setMainTopicsLoading(false));
//     } else if (istestpack && isOpen && !subject) {
//       setMainTopics([]);
//       setMainTopicId("");
//     }
//   }, [istestpack, isOpen, subject]);

//   // Fetch sub-categories when main topic changes (test pack only)
//   useEffect(() => {
//     if (istestpack && isOpen && mainTopicId) {
//       setCategoriesLoading(true);
//       setCategoriesError(null);

//       // Build the URL with parent_id for sub-categories
//       const url = `${import.meta.env.VITE_API_URL}/api/test-pack/categories/get-all?parent_id=${mainTopicId}`;

//       fetch(url)
//         .then((res) => {
//           if (!res.ok) throw new Error("Failed to fetch categories");
//           return res.json();
//         })
//         .then((data) => {
//           setCategories(Array.isArray(data) ? data : []);
//         })
//         .catch((err) => {
//           setCategoriesError("Could not load categories");
//           setCategories([]);
//         })
//         .finally(() => setCategoriesLoading(false));
//     } else if (istestpack && isOpen && !mainTopicId) {
//       setCategories([]);
//       setCategoryId("");
//     }
//   }, [istestpack, isOpen, mainTopicId]);

//   // Prefill subject/category on edit (test pack only)
//   useEffect(() => {
//     if (istestpack && isOpen && initialValues) {
//       console.log("🔍 Prefilling subject/category for test pack question:", {
//         subject: initialValues.subject,
//         question_category_id: initialValues.question_category_id,
//         has_category_id: !!initialValues.question_category_id
//       });

//       // Map old subject values to new ones for backward compatibility
//       let subjectValue = initialValues.subject || "";
//       if (subjectValue === "Math") {
//         subjectValue = "Mathematics";
//       }
//       setSubject(subjectValue);

//       if (initialValues.question_category_id) {
//         // Fetch the parent category to set mainTopicId correctly
//         const categoryId = String(initialValues.question_category_id);

//         // Fetch category details to get parent_id
//         fetch(`${import.meta.env.VITE_API_URL}/api/test-pack/categories/get-all`)
//           .then((res) => res.json())
//           .then((allCategories) => {
//             console.log("🔍 All categories fetched:", allCategories.length);
//             const currentCategory = allCategories.find((cat: any) => cat.id === Number(categoryId));
//             if (currentCategory && currentCategory.parent_id) {
//               console.log("🔍 Found category parent:", {
//                 categoryId,
//                 parentId: currentCategory.parent_id,
//                 categoryName: currentCategory.name
//               });
//               setMainTopicId(String(currentCategory.parent_id));
//               setCategoryId(categoryId);
//             } else {
//               console.warn("⚠️ Could not find parent for category:", {
//                 categoryId,
//                 currentCategory,
//                 hasParent: !!currentCategory?.parent_id
//               });
//               setCategoryId(categoryId);
//             }
//           })
//           .catch((err) => {
//             console.error("❌ Error fetching category details:", err);
//             // Fallback: just set the category
//             setCategoryId(categoryId);
//           });
//       }
//     } else if (istestpack && isOpen && !initialValues) {
//       setSubject("");
//       setMainTopicId("");
//       setCategoryId("");
//     }
//   }, [istestpack, isOpen, initialValues]);

//   const isFormValid = () => {
//     // If this question has a passage, validate RC fields regardless of questionType
//     if (initialValues?.passage_id && Number(initialValues.passage_id) > 0) {
//       // For passage editing, only require passage content (start/end pages are optional)
//       return rcPassage.trim().length > 0;
//     }

//     // Otherwise validate based on questionType
//     switch (questionType) {
//       case "MC":
//         return mcValid;
//       case "MA":
//         return maValid;
//       case "TF":
//         return tfValid;
//       case "BLANK":
//         return blankValid;
//       case "DND":
//         return dndState.dndValid;
//       case "RAY_SELECTOR":
//         return raySelector.raySelectorValid;
//       case "GRAPH_SELECTOR":
//         return graphSelectorValid;
//       case "TABLE_GRID":
//         return tgPrompt.trim().length > 0;
//       case "HOT_TEXT":
//         return true; // HOT_TEXT has its own validation
//       case "EQUATION_CALCULATOR":
//         // More lenient validation: require at least one field to have content
//         const hasQuestion = equationQuestion.trim().length > 0;
//         const hasAnswer = equationCorrectAnswer.trim().length > 0;
//         return hasQuestion || hasAnswer; // Allow save if either field has content
//       case "RC":
//       case "REA":
//       case "REB":
//         // For RC questions, require passage and page numbers
//         return rcPassage.trim().length > 0 && rcStartPage && rcEndPage;
//       default:
//         // Check if this is a non-RC question type but has a passage
//         if (initialValues?.passage_id && Number(initialValues.passage_id) > 0) {
//           return rcPassage.trim().length > 0;
//         }
//         return false;
//     }
//   };

//   // 1. Utility functions for draft persistence
//   const DRAFT_KEY = 'questionModalDraft';
//   function saveDraftToLocalStorage(draft: any) {
//     try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch {}
//   }
//   function loadDraftFromLocalStorage() {
//     try { const d = localStorage.getItem(DRAFT_KEY); return d ? JSON.parse(d) : null; } catch { return null; }
//   }
//   function clearDraftFromLocalStorage() {
//     try { localStorage.removeItem(DRAFT_KEY); } catch {}
//   }

//   // 2. On modal open, restore draft if adding
//   useEffect(() => {
//     if (isOpen && !initialValues) {
//       const draft = loadDraftFromLocalStorage();
//       // Always set state for all question types, not just MC
//       setQuestionType(draft?.questionType || "MC");
//       // MC
//       if (mcState.setMcQuestion) mcState.setMcQuestion(draft?.mcQuestion || "");
//       if (mcState.setMcChoices) mcState.setMcChoices(draft?.mcChoices || [
//         { letter: "A", value: { text: "", is_correct: false, choice_image_url: undefined } },
//         { letter: "B", value: { text: "", is_correct: false, choice_image_url: undefined } },
//       ]);
//       if (mcState.setMcExplanation) mcState.setMcExplanation(draft?.mcExplanation || "");
//       if (mcState.setMcVariant) mcState.setMcVariant(draft?.mcVariant || "standard");
//       // MA
//       if (maState.setMaQuestion) maState.setMaQuestion(draft?.maQuestion || "");
//       if (maState.setMaChoices) maState.setMaChoices(draft?.maChoices || [
//         { letter: "A", value: { text: "", is_correct: false } },
//         { letter: "B", value: { text: "", is_correct: false } },
//       ]);
//       // BLANK
//       if (blankState.setBlankQuestion) blankState.setBlankQuestion(draft?.blankQuestion || "");
//       if (blankState.setBlankCorrectAnswer) blankState.setBlankCorrectAnswer(draft?.blankCorrectAnswer || "");
//       if (blankState.setBlankExplanation) blankState.setBlankExplanation(draft?.blankExplanation || "");
//       if (blankState.setBlankVariant) blankState.setBlankVariant(draft?.blankVariant || "placeholder");
//       // DND (minimal example, expand as needed)
//       if (dndState.setDndQuestion) dndState.setDndQuestion(draft?.dndQuestion || "");
//       if (dndState.setDndBuckets) dndState.setDndBuckets(draft?.dndBuckets || [
//         { label: "Even Numbers", bucket_order: 0 },
//         { label: "Odd Numbers", bucket_order: 1 },
//       ]);
//       if (dndState.setDndChoices) dndState.setDndChoices(draft?.dndChoices || [
//         { label: "2", choice_order: 0 },
//         { label: "3", choice_order: 1 },
//         { label: "4", choice_order: 2 },
//         { label: "5", choice_order: 3 },
//       ]);
//       if (dndState.setDndExplanation) dndState.setDndExplanation(draft?.dndExplanation || "");
//       // Add similar for other question types as needed
//     }
//   }, [isOpen, initialValues]);

//   // 3. Save draft on every relevant change (add mode only)
//   useEffect(() => {
//     if (!initialValues) {
//       saveDraftToLocalStorage({
//         questionType,
//         mcQuestion: mcState.mcQuestion,
//         mcChoices: mcState.mcChoices,
//         mcExplanation: mcState.mcExplanation,
//         mcVariant: mcState.mcVariant,
//         // Add other fields as needed for other types
//       });
//     }
//   }, [questionType, mcState.mcQuestion, mcState.mcChoices, mcState.mcExplanation, mcState.mcVariant, initialValues]);

//   // 4. Clear draft on close or save (add mode only)
//   const handleClose = useCallback(() => {
//     if (!initialValues) clearDraftFromLocalStorage();
//     onClose();
//   }, [onClose, initialValues]);

//   return (
//     <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
//       <DialogContent className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {isAddMode
//               ? "Add Question"
//               : `Edit ${
//                   initialValues?.question_type === "TABLE_GRID"
//                     ? "Table Grid"
//                     : initialValues?.question_type === "RAY_SELECTOR"
//                       ? "Ray Selector"
//                       : initialValues?.question_type === "GRAPH_SELECTOR"
//                         ? "Graph Selector"
//                         : initialValues?.question_type === "HOT_TEXT"
//                           ? "Hot Text"
//                           : initialValues?.question_type === "DND"
//                             ? "Drag & Drop"
//                             : ""
//                 } Question`}
//           </DialogTitle>
//         </DialogHeader>
//         {/* Subject and Category dropdowns for test pack only - Hide when editing passages OR when creating RC questions */}
//         {istestpack && 
//          !(initialValues?.passage_id && Number(initialValues.passage_id) > 0) && 
//          !["RC", "REA", "REB"].includes(questionType) && (
//           <div className="mb-4 flex flex-col gap-3">
//             <div>
//               <Label>Subject</Label>
//               <select
//                 className="w-full border rounded px-2 py-1 mt-1"
//                 value={subject}
//                 onChange={(e) => {
//                   setSubject(e.target.value);
//                   setMainTopicId(""); // Clear main topic when subject changes
//                   setCategoryId(""); // Clear category when subject changes
//                 }}
//                 required
//               >
//                 <option value="" disabled>
//                   Select Subject
//                 </option>
//                 <option value="Mathematics">Mathematics</option>
//                 <option value="ELA">ELA</option>
//               </select>
//             </div>
//             <div>
//               <Label>Main Topic</Label>
//               <select
//                 className="w-full border rounded px-2 py-1 mt-1"
//                 value={mainTopicId}
//                 onChange={(e) => {
//                   setMainTopicId(e.target.value);
//                   setCategoryId(""); // Clear category when main topic changes
//                 }}
//                 required
//                 disabled={mainTopicsLoading || !!mainTopicsError || !subject}
//               >
//                 <option value="" disabled>
//                   {!subject
//                     ? "Select Subject First"
//                     : mainTopicsLoading
//                       ? "Loading..."
//                       : mainTopicsError
//                         ? mainTopicsError
//                         : "Select Main Topic"}
//                 </option>
//                 {mainTopics.map((topic) => (
//                   <option key={topic.id} value={topic.id}>
//                     {topic.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <Label>Sub-Category</Label>
//               <select
//                 className="w-full border rounded px-2 py-1 mt-1"
//                 value={categoryId}
//                 onChange={(e) => setCategoryId(e.target.value)}
//                 required
//                 disabled={categoriesLoading || !!categoriesError || !mainTopicId}
//               >
//                 <option value="" disabled>
//                   {!mainTopicId
//                     ? "Select Main Topic First"
//                     : categoriesLoading
//                       ? "Loading..."
//                       : categoriesError
//                         ? categoriesError
//                         : "Select Sub-Category"}
//                 </option>
//                 {categories.map((cat) => (
//                   <option key={cat.id} value={cat.id}>
//                     {cat.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         )}
//         {(!initialValues ||
//           (initialValues &&
//             Object.keys(initialValues).length === 1 &&
//             (initialValues as any).test_id)) && (
//           <div className="mb-4">
//             <Label>Question Type</Label>
//             <select
//               className="w-full border rounded px-2 py-1 mt-1"
//               value={questionType}
//               onChange={(e) => setQuestionType(e.target.value)}
//             >
//               {QUESTION_TYPES.map((type) => (
//                 <option key={type.value} value={type.value}>
//                   {type.label}
//                 </option>
//               ))}
//             </select>
//             {/* DND Subtype Dropdown */}
//             {questionType === "DND" && (
//               <div className="mt-3">
//                 <Label>Drag and Drop Type</Label>
//                 <select
//                   className="w-full border rounded px-2 py-1 mt-1"
//                   value={dndSubtype}
//                   onChange={(e) => setDndSubtype(e.target.value as DnDSubtype)}
//                 >
//                   {DND_SUBTYPES.map((subtype) => (
//                     <option key={subtype.value} value={subtype.value}>
//                       {subtype.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}
//           </div>
//         )}

//         {questionType === "DND" && dndState.dndBuckets.length === 0 && (
//           <div style={{ color: "orange", marginBottom: 8 }}>
//             ⚠️ This DND question is missing bucket labels. Please add them
//             below.
//             <button
//               type="button"
//               style={{
//                 marginLeft: 12,
//                 padding: "2px 8px",
//                 border: "1px solid #ccc",
//                 borderRadius: 4,
//               }}
//               onClick={() =>
//                 dnd.setDndBuckets([
//                   { label: "Bucket 1", bucket_order: 0 },
//                   { label: "Bucket 2", bucket_order: 1 },
//                 ])
//               }
//             >
//               Add Default Buckets
//             </button>
//           </div>
//         )}

//         {(() => {
//           console.log(
//             "🎨 Rendering form for questionType:",
//             questionType,
//             "Available renderers:",
//             Object.keys(formRenderers),
//             "passage_id:",
//             initialValues?.passage_id,
//             "initialValues.question_type:",
//             initialValues?.question_type
//           );

//           // For passage editing, always use RC form
//           // For DND questions, always use DND form regardless of passage_id
//           // For other questions with passage_id, use RC form to edit passage content
//           // For other questions without passage, use the actual questionType
//           const renderType = shouldEditPassage ? "RC" : questionType;

//           console.log("🎨 Final renderType:", renderType);

//           const renderer = formRenderers[renderType];
//           if (!renderer) {
//             console.error(
//               "❌ No renderer found for renderType:",
//               renderType,
//             );
//             return <div>Error: No form renderer for {renderType}</div>;
//           }
//           console.log("✅ Using renderer for:", renderType);
//           return renderer();
//         })()}
//         {(() => {
//           // Use the same logic for footer as form rendering
//           const footerType = shouldEditPassage ? "RC" : questionType;
//           return footerRenderers[footerType];
//         })()}
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default QuestionModal;

// Modular QuestionModal Component
import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { useAuthStore } from "../stores/authStore";
import { usePostHogAnalytics } from "../lib/posthog-analytics";
import {
  QUESTION_TYPES,
  DND_SUBTYPES,
  DnDSubtype,
} from "./question-modal";
import {
  useMCState,
  useMAState,
  useBlankState,
  useTFState,
  useDnDState,
  useTableGridModalState,
  useRaySelectorModalState,
  useGraphSelectorState,
  useHotTextModalState,
  useMCModalState,
  useMAModalState,
  useTFModalState,
  useDnDModalState,
  useBlankModalState,
  useGraphSelectorModalState,
  useEquationCalculatorModalState,
} from "./question-modal/hooks";
import { testPackService } from "../services/testPackService";

// Import modular components
import { useQuestionModalState } from "./question-modal/modules/QuestionModalState";
import { QuestionModalForms } from "./question-modal/modules/QuestionModalForms";
import { QuestionModalFooters } from "./question-modal/modules/QuestionModalFooters";
import { canSave } from "./question-modal/modules/QuestionModalValidation";
import { handleQuestionSave } from "./question-modal/modules/QuestionModalHandlers";

import { QuestionModalProps } from "./question-modal/types";

export const QuestionModal: React.FC<QuestionModalProps> = function QuestionModal({
  isOpen,
  onClose,
  onSave,
  initialValues,
  istestpack,
  isPassageEdit = false,
}): JSX.Element {
  // Extract isPassageEdit from initialValues if not provided as prop
  const shouldEditPassage = isPassageEdit || initialValues?.isPassageEdit;

  // Initialize questionType
  const [questionType, setQuestionType] = useState("MC");

  // Analytics hook
  const analytics = usePostHogAnalytics();

  // Use modular state management
  const modalState = useQuestionModalState(!!istestpack, isOpen, initialValues);
  const { subject, setSubject, mainTopicId, setMainTopicId, categoryId, setCategoryId } = modalState;

  // DND Subtype state
  const [dndSubtype, setDndSubtype] = useState<DnDSubtype>("two_buckets_single");

  // Use custom hooks for state management (Modular Hooks)
  const mc = useMCModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);
  const ma = useMAModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);
  const tf = useTFModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);
  const dnd = useDnDModalState(initialValues, isOpen, onSave, onClose, !!istestpack, dndSubtype, subject, categoryId);
  const blank = useBlankModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);
  const tableGrid = useTableGridModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);
  const graphSelector = useGraphSelectorModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);
  const raySelector = useRaySelectorModalState(initialValues, isOpen, onSave, !!istestpack, subject, categoryId);
  const hotTextState = useHotTextModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);
  const equationCalculatorState = useEquationCalculatorModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);

  // Local state for RC and other fields
  const [rcPassage, setRcPassage] = useState("");
  const [rcTopicId, setRcTopicId] = useState<number | undefined>();
  const [rcSubTopicId, setRcSubTopicId] = useState<number | undefined>();
  const [rcImageUrl, setRcImageUrl] = useState<string | undefined>();
  const [rcStartPage, setRcStartPage] = useState<number | undefined>();
  const [rcEndPage, setRcEndPage] = useState<number | undefined>();
  const [rcDifficulty, setRcDifficulty] = useState<number>(3);

  // Image upload state
  const [questionImageUrl, setQuestionImageUrl] = useState<string | undefined>(undefined);

  // Get user info for component-wide use
  const userName = useAuthStore.getState().getUserName();

  // Update RC state when initialValues change
  useEffect(() => {
    if (initialValues) {
      setRcPassage(initialValues.passage || "");
      setRcStartPage(initialValues.start_page || undefined);
      setRcEndPage(initialValues.end_page || undefined);
      setRcImageUrl(initialValues.image_url || "");
      setRcDifficulty(initialValues.difficulty || 3);
    }
  }, [initialValues]);

  // ⭐ CRITICAL FIX: Update questionType when initialValues change (for async loading)
  useEffect(() => {
    /* console.log("🔄 useEffect triggered - initialValues changed:", {
      hasInitialValues: !!initialValues,
      questionType: initialValues?.question_type,
      questionTypeAcronym: initialValues?.question_type_acronym,
      isOpen,
    }); */

    if (isOpen && initialValues) {
      // FIXED: For passage editing, check shouldEditPassage flag first and override type to RC
      if (shouldEditPassage) {
        /* console.log("📝 Detected passage editing mode, forcing RC form for passage editing"); */
        setQuestionType("RC"); // Use RC form for passage editing
        return;
      }

      // Otherwise proceed with normal question type detection
      const detectedType =
        initialValues.question_type || initialValues.question_type_acronym;
      if (detectedType) {
        /* console.log("📝 Updating questionType to:", detectedType); */
        setQuestionType(detectedType);
      } else {
        /* console.log("📝 No question type detected, setting questionType to MC"); */
        setQuestionType("MC");
      }
    } else if (isOpen && !initialValues) {
      /* console.log("📝 No initialValues, setting questionType to MC"); */
      setQuestionType("MC");
    }
  }, [initialValues, isOpen, shouldEditPassage]);

  // Handle save using modular handler
  const handleSave = async () => {
    const validationConfig = {
      questionType,
      initialValues,
      shouldEditPassage,
      istestpack: !!istestpack,
      subject,
      mainTopicId,
      categoryId,

    };

    if (!canSave(questionType, validationConfig)) {
      toast.error("Please fill in all required fields before saving.");
      return;
    }
    await handleQuestionSave(
      questionType,
      initialValues,
      !!istestpack,
      subject,
      categoryId,
      onSave,
      onClose,
      analytics,
      mc,
      ma,
      blank,
      tf,
      dnd,
      graphSelector,
      tableGrid,
      raySelector,
      hotTextState,
      equationCalculatorState,
      { rcPassage, rcStartPage, rcEndPage, rcImageUrl, rcDifficulty },
      questionImageUrl,
      dndSubtype,
      tableGrid.tgPrompt || "",
      tableGrid.tgRowLabels || [],
      tableGrid.tgColumnLabels || [],
      tableGrid.tgSelectionMode || "single",
      tableGrid.tgAnswerMatrix || [],
      tableGrid.tgFirstColumnHeader || "",
      tableGrid.tgDifficulty || 3,
      tableGrid.tgErrors || [],
      dnd.save,
      graphSelector.save,
      tableGrid.save,
      tableGrid.validate || (() => true),
      graphSelector.graphSelectorValid,
      dnd.dndBuckets || [],
      dnd.dndChoices || [],
      dnd.dndCorrectAssignments || {},
      dnd.dndQuestion || "",
      dnd.dndExplanation || "",
      dnd.dndDifficulty || 3,
      dnd.tableColumnHeaders || [],
      graphSelector.graphPrompt || "",
      graphSelector.xMin || "",
      graphSelector.xMax || "",
      graphSelector.yMin || "",
      graphSelector.yMax || "",
      graphSelector.gridInterval || "",
      graphSelector.maxSelectablePoints || "",
      graphSelector.showAxes || false,
      graphSelector.showLabels || false,
      graphSelector.snapToGrid || false,
      graphSelector.graphInstruction || "",
      graphSelector.availablePoints || [],
      graphSelector.graphExplanation || "",
      graphSelector.xAxisLabel || "",
      graphSelector.yAxisLabel || "",
      graphSelector.graphDifficulty || 3,
      (() => { }), // resetGraphSelectorState not available in this hook
      rcPassage,
      rcStartPage,
      rcEndPage,
      rcImageUrl,
      rcDifficulty,
      // CORRECT PARAMETER ORDER FOR EQUATION CALCULATOR:
      equationCalculatorState.question || "",
      equationCalculatorState.correctAnswer || "",
      equationCalculatorState.questionImageUrl,
      equationCalculatorState.difficulty || 3,
      equationCalculatorState.eqQuestionCategory,
      equationCalculatorState.eqChapter,
      equationCalculatorState.eqTopic,
      equationCalculatorState.eqSubTopic,
      equationCalculatorState.explanation || "",
      (() => { }),
      equationCalculatorState.eqTagSlots || [],
      // NEW: Tagging slots for Blank and Graph Selector
      blank.choiceTagSlots || [],
      graphSelector.pointTagSlots || {}
    );
  };

  // Helper function to determine if we can save
  const canSaveQuestion = (type: string) => {
    return canSave(type, {
      questionType: type,
      initialValues,
      shouldEditPassage,
      istestpack: !!istestpack,
      subject,
      mainTopicId,
      categoryId,
    });
  };

  // Add a flag to track if we've already prefilled the data
  const [hasPrefilled, setHasPrefilled] = useState(false);

  // Reset prefill flag ONLY when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasPrefilled(false);
    }
  }, [isOpen]);

  // Prefill RC passage data for ANY question with passage_id (not just RC/REA/REB)
  useEffect(() => {
    const hasPassage = initialValues?.passage_id && Number(initialValues.passage_id) > 0;

    if (isOpen && hasPassage && !hasPrefilled) {
      /* console.log("🔄 Prefilling passage data for question with passage_id:", initialValues.passage_id); */

      // If passage content is already available, use it
      if (initialValues.passage) {
        setRcPassage(initialValues.passage);
        setRcStartPage(initialValues.start_page || undefined);
        setRcEndPage(initialValues.end_page || undefined);
        setRcImageUrl(initialValues.image_url || "");
      } else {
        // If passage content not loaded, fetch it
        const fetchPassage = async () => {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/test-pack/passages/get/${initialValues.passage_id}`);
            if (response.ok) {
              const passageData = await response.json();
              setRcPassage(passageData.passage || "");
              setRcStartPage(passageData.start_page || undefined);
              setRcEndPage(passageData.end_page || undefined);
              setRcImageUrl(passageData.image_url || "");
              /* console.log("✅ Fetched passage data:", passageData); */
            } else {
              console.warn("⚠️ Failed to fetch passage data");
            }
          } catch (error) {
            console.error("❌ Error fetching passage:", error);
          }
        };
        fetchPassage();
      }
    }
  }, [isOpen, initialValues, hasPrefilled]);

  // Utility functions for draft persistence
  const DRAFT_KEY = 'questionModalDraft';
  function saveDraftToLocalStorage(draft: any) {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch { }
  }
  function loadDraftFromLocalStorage() {
    try { const d = localStorage.getItem(DRAFT_KEY); return d ? JSON.parse(d) : null; } catch { return null; }
  }
  function clearDraftFromLocalStorage() {
    try { localStorage.removeItem(DRAFT_KEY); } catch { }
  }

  // On modal open, restore draft if adding
  useEffect(() => {
    if (isOpen && !initialValues) {
      const draft = loadDraftFromLocalStorage();
      setQuestionType(draft?.questionType || "MC");
      // Restore other state as needed
    }
  }, [isOpen, initialValues]);

  // Save draft on every relevant change (add mode only)
  useEffect(() => {
    if (!initialValues) {
      saveDraftToLocalStorage({
        questionType,
        // Add other fields as needed
      });
    }
  }, [questionType, initialValues]);

  // Clear draft on close or save (add mode only)
  const handleClose = useCallback(() => {
    if (!initialValues) clearDraftFromLocalStorage();
    onClose();
  }, [onClose, initialValues]);

  // Add a flag to track if we've already prefilled the data
  const [hasPrefilledLocal, setHasPrefilledLocal] = useState(false);

  // Reset prefill flag ONLY when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasPrefilledLocal(false);
    }
  }, [isOpen]);

  // Prefill RC passage data for ANY question with passage_id (not just RC/REA/REB)
  useEffect(() => {
    const hasPassage = initialValues?.passage_id && Number(initialValues.passage_id) > 0;

    if (isOpen && hasPassage && !hasPrefilledLocal) {
      /* console.log("🔄 Prefilling passage data for question with passage_id:", initialValues.passage_id); */

      // If passage content is already available, use it
      if (initialValues.passage) {
        setRcPassage(initialValues.passage);
        setRcStartPage(initialValues.start_page || undefined);
        setRcEndPage(initialValues.end_page || undefined);
        setRcImageUrl(initialValues.image_url || "");
      } else {
        // If passage content not loaded, fetch it
        const fetchPassage = async () => {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/test-pack/passages/get/${initialValues.passage_id}`);
            if (response.ok) {
              const passageData = await response.json();
              setRcPassage(passageData.passage || "");
              setRcStartPage(passageData.start_page || undefined);
              setRcEndPage(passageData.end_page || undefined);
              setRcImageUrl(passageData.image_url || "");
              /* console.log("✅ Fetched passage data:", passageData); */
            } else {
              console.warn("⚠️ Failed to fetch passage data");
            }
          } catch (error) {
            console.error("❌ Error fetching passage:", error);
          }
        };
        fetchPassage();
      }
    }
  }, [isOpen, initialValues, hasPrefilledLocal]);

  const isAddMode =
    !initialValues ||
    (Object.keys(initialValues).length === 1 && (initialValues as any).test_id);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isAddMode
              ? "Add Question"
              : `Edit ${initialValues?.question_type === "TABLE_GRID"
                ? "Table Grid"
                : initialValues?.question_type === "RAY_SELECTOR"
                  ? "Ray Selector"
                  : initialValues?.question_type === "GRAPH_SELECTOR"
                    ? "Graph Selector"
                    : initialValues?.question_type === "HOT_TEXT"
                      ? "Hot Text"
                      : initialValues?.question_type === "DND"
                        ? "Drag & Drop"
                        : ""
              } Question`}
          </DialogTitle>
        </DialogHeader>

        {/* Subject and Category dropdowns for test pack only */}
        {!!istestpack &&
          !(initialValues?.passage_id && Number(initialValues.passage_id) > 0) &&
          !["RC", "REA", "REB"].includes(questionType) && (
            <div className="mb-4 flex flex-col gap-3">
              <div>
                <Label>Subject</Label>
                <select
                  className="w-full border rounded px-2 py-1 mt-1"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setMainTopicId(""); // Clear main topic when subject changes
                    setCategoryId(""); // Clear category when subject changes
                  }}
                  required
                >
                  <option value="" disabled>
                    Select Subject
                  </option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="ELA">ELA</option>
                </select>
              </div>
              {/*  only subject is needed for test pack questions */}
              {/* 
              <div>
                <Label>Main Topic</Label>
                <select
                  className="w-full border rounded px-2 py-1 mt-1"
                  value={mainTopicId}
                  onChange={(e) => {
                    setMainTopicId(e.target.value);
                    setCategoryId(""); // Clear category when main topic changes
                  }}
                  required
                  disabled={mainTopicsLoading || !!mainTopicsError || !subject}
                >
                  <option value="" disabled>
                    {!subject
                      ? "Select Subject First"
                      : mainTopicsLoading
                        ? "Loading..."
                        : mainTopicsError
                          ? mainTopicsError
                          : "Select Main Topic"}
                  </option>
                  {mainTopics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Sub-Category</Label>
                <select
                  className="w-full border rounded px-2 py-1 mt-1"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  disabled={categoriesLoading || !!categoriesError || !mainTopicId}
                >
                  <option value="" disabled>
                    {!mainTopicId
                      ? "Select Main Topic First"
                      : categoriesLoading
                        ? "Loading..."
                        : categoriesError
                          ? categoriesError
                          : "Select Sub-Category"}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              */}
            </div>
          )}

        {/* Question Type Selection */}
        {(!initialValues ||
          (initialValues &&
            Object.keys(initialValues).length === 1 &&
            (initialValues as any).test_id)) && (
            <div className="mb-4">
              <Label>Question Type</Label>
              <select
                className="w-full border rounded px-2 py-1 mt-1"
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
              >
                {QUESTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {/* DND Subtype Dropdown */}
              {questionType === "DND" && (
                <div className="mt-3">
                  <Label>Drag and Drop Type</Label>
                  <select
                    className="w-full border rounded px-2 py-1 mt-1"
                    value={dndSubtype}
                    onChange={(e) => setDndSubtype(e.target.value as DnDSubtype)}
                  >
                    {DND_SUBTYPES.map((subtype) => (
                      <option key={subtype.value} value={subtype.value}>
                        {subtype.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

        {/* Form Rendering */}
        <QuestionModalForms
          questionType={questionType}
          shouldEditPassage={shouldEditPassage}
          initialValues={initialValues}
          istestpack={!!istestpack}
          subject={subject}
          categoryId={categoryId}
          onClose={onClose}
          mc={mc}
          ma={ma}
          tf={tf}
          dnd={dnd}
          blank={blank}
          tableGrid={tableGrid}
          graphSelector={graphSelector}
          raySelector={raySelector}
          hotText={hotTextState}
          equationCalculatorState={equationCalculatorState}
          rcPassage={rcPassage}
          setRcPassage={setRcPassage}
          rcTopicId={rcTopicId}
          setRcTopicId={setRcTopicId}
          rcSubTopicId={rcSubTopicId}
          setRcSubTopicId={setRcSubTopicId}
          rcImageUrl={rcImageUrl}
          setRcImageUrl={setRcImageUrl}
          rcStartPage={rcStartPage}
          setRcStartPage={setRcStartPage}
          rcEndPage={rcEndPage}
          setRcEndPage={setRcEndPage}
          rcDifficulty={rcDifficulty}
          setRcDifficulty={setRcDifficulty}
          dndSubtype={dndSubtype}
          userName={userName}
        />

        {/* Footer Rendering */}
        <QuestionModalFooters
          questionType={questionType}
          shouldEditPassage={shouldEditPassage}
          canSave={canSaveQuestion}
          onClose={onClose}
          onSave={handleSave}
          mc={mc}
          ma={ma}
          tf={tf}
          dnd={dnd}
          blank={blank}
          tableGrid={tableGrid}
          graphSelector={graphSelector}
          raySelector={raySelector}
          hotText={hotTextState}
          equationCalculatorState={equationCalculatorState}
          equationQuestion={equationCalculatorState.question || ""}
          equationCorrectAnswer={equationCalculatorState.correctAnswer || ""}
          equationIsValid={equationCalculatorState.isValid || false}
          rcPassage={rcPassage}
          rcStartPage={rcStartPage}
          rcEndPage={rcEndPage}
          handleSave={handleSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QuestionModal;
