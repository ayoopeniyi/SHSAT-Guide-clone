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
} from "./question-modal/hooks";
import { useEquationCalculatorState } from "./question-modal/hooks/useEquationCalculatorState";
import { testPackService } from "../services/testPackService";

// Import modular components
import { useQuestionModalState } from "./question-modal/modules/QuestionModalState";
import { QuestionModalForms } from "./question-modal/modules/QuestionModalForms";
import { QuestionModalFooters } from "./question-modal/modules/QuestionModalFooters";
import { canSave, getValidationError as getValidationErrorFn } from "./question-modal/modules/QuestionModalValidation";
import { handleQuestionSave } from "./question-modal/modules/QuestionModalHandlers";

import { QuestionModalProps } from "./question-modal/types";
import { getQuestionTypeAcronym } from "../utils/questionTypeUtils";

export const QuestionModal: React.FC<QuestionModalProps> = function QuestionModal({
  isOpen,
  onClose,
  onSave,
  initialValues,
  istestpack,
  isPassageEdit = false,
}): JSX.Element {
  /* console.log("🔍 [QuestionModal] Component rendered with:", {
    isOpen,
    hasInitialValues: !!initialValues,
    questionType: initialValues?.question_type,
    question_subtype: initialValues?.question_subtype,
    initialValues: initialValues
  }); */
  // Extract isPassageEdit from initialValues if not provided as prop
  const shouldEditPassage = isPassageEdit || initialValues?.isPassageEdit;

  // Initialize questionType
  const [questionType, setQuestionType] = useState(() => {
    const acronym = getQuestionTypeAcronym(initialValues);
    return acronym || "MC";
  });

  // Analytics hook
  const analytics = usePostHogAnalytics();

  // Use modular state management
  const modalState = useQuestionModalState(!!istestpack, isOpen, initialValues);
  const { subject, setSubject, mainTopicId, setMainTopicId, categoryId, setCategoryId } = modalState;

  // DND Subtype state - initialize based on initialValues
  const [dndSubtype, setDndSubtype] = useState<DnDSubtype>(() => {
    if (initialValues?.question_type === "DND") {
      // For editing, prioritize the question_subtype from the database
      let detectedSubtype = initialValues.question_subtype || initialValues.dnd_subtype;

      // If no explicit subtype, try to detect from question_category (legacy support)
      if (!detectedSubtype && initialValues.question_category) {
        if (["one_bucket_multi", "one_bucket_single", "two_buckets_single", "two_buckets_multi", "table_dnd"].includes(initialValues.question_category)) {
          detectedSubtype = initialValues.question_category;
        }
      }

      // Fallback detection based on buckets and assignments
      if (!detectedSubtype) {
        if (initialValues.buckets?.length >= 3) {
          // Table DND can have 3 or more rows
          detectedSubtype = "table_dnd";
        } else if (initialValues.buckets?.length === 1) {
          detectedSubtype = "one_bucket_multi";
        } else if (initialValues.buckets?.length === 2) {
          // Check if it's actually a single bucket question with an empty second bucket
          const hasAssignmentsInSecondBucket = initialValues.assignments?.some((a: any) => {
            const bucketIndex = initialValues.buckets.findIndex((b: any) => b.id === a.bucket_id);
            return bucketIndex === 1;
          });
          detectedSubtype = hasAssignmentsInSecondBucket ? "two_buckets_single" : "one_bucket_multi";
        } else {
          detectedSubtype = "two_buckets_single";
        }
      }

      /* console.log("🔍 [QuestionModal] Initial DND subtype detection:", {
        question_subtype: initialValues.question_subtype,
        dnd_subtype: initialValues.dnd_subtype,
        question_category: initialValues.question_category,
        buckets_length: initialValues.buckets?.length,
        assignments: initialValues.assignments,
        detectedSubtype
      }); */

      return detectedSubtype as DnDSubtype;
    }
    return "two_buckets_single";
  });

  // Debug logging for dndSubtype changes
  useEffect(() => {
    /* console.log("🔍 [QuestionModal] dndSubtype state changed to:", dndSubtype); */
  }, [dndSubtype]);

  // Debug logging for initialValues changes
  useEffect(() => {
    /* console.log("🔍 [QuestionModal] initialValues changed:", {
      hasInitialValues: !!initialValues,
      questionType: initialValues?.question_type,
      question_subtype: initialValues?.question_subtype,
      dndSubtype: dndSubtype
    }); */
  }, [initialValues, dndSubtype]);

  // Update dndSubtype when initialValues change
  useEffect(() => {
    if (initialValues?.question_type === "DND") {
      // For editing, prioritize the question_subtype from the database
      let detectedSubtype = initialValues.question_subtype || initialValues.dnd_subtype;

      // If no explicit subtype, try to detect from question_category (legacy support)
      if (!detectedSubtype && initialValues.question_category) {
        if (["one_bucket_multi", "one_bucket_single", "two_buckets_single", "two_buckets_multi", "table_dnd"].includes(initialValues.question_category)) {
          detectedSubtype = initialValues.question_category;
        }
      }

      // Fallback detection based on buckets and assignments
      if (!detectedSubtype) {
        if (initialValues.buckets?.length >= 3) {
          // Table DND can have 3 or more rows
          detectedSubtype = "table_dnd";
        } else if (initialValues.buckets?.length === 1) {
          detectedSubtype = "one_bucket_multi";
        } else if (initialValues.buckets?.length === 2) {
          // Check if it's actually a single bucket question with an empty second bucket
          const hasAssignmentsInSecondBucket = initialValues.assignments?.some((a: any) => {
            const bucketIndex = initialValues.buckets.findIndex((b: any) => b.id === a.bucket_id);
            return bucketIndex === 1;
          });
          detectedSubtype = hasAssignmentsInSecondBucket ? "two_buckets_single" : "one_bucket_multi";
        } else {
          detectedSubtype = "two_buckets_single";
        }
      }

      /* console.log("🔍 [QuestionModal] DND subtype detection:", {
        question_subtype: initialValues.question_subtype,
        dnd_subtype: initialValues.dnd_subtype,
        question_category: initialValues.question_category,
        buckets_length: initialValues.buckets?.length,
        assignments: initialValues.assignments,
        detectedSubtype,
        currentDndSubtype: dndSubtype
      }); */

      if (detectedSubtype !== dndSubtype) {
        /* console.log("🔍 [QuestionModal] Updating dndSubtype from", dndSubtype, "to", detectedSubtype); */
        setDndSubtype(detectedSubtype as DnDSubtype);
      }
    }
  }, [initialValues]); // Remove dndSubtype from dependencies to prevent infinite loop

  // Set DND subtype based on initial values when editing
  useEffect(() => {
    /* console.log("🔍 [QuestionModal] useEffect triggered:", {
      isOpen,
      hasInitialValues: !!initialValues,
      questionType: initialValues?.question_type,
      currentDndSubtype: dndSubtype
    }); */

    if (isOpen && initialValues && initialValues.question_type === "DND") {
      // Use question_subtype field if available, otherwise fall back to dnd_subtype, question_category or bucket count
      const detectedSubtype = initialValues.question_subtype ||
        initialValues.dnd_subtype ||
        initialValues.question_category ||
        (initialValues.buckets?.length === 1 ? "one_bucket_multi" : "two_buckets_single");
      /* console.log("🔍 [QuestionModal] Setting DND subtype from initialValues:", {
        question_subtype: initialValues.question_subtype,
        dnd_subtype: initialValues.dnd_subtype,
        question_category: initialValues.question_category,
        buckets_length: initialValues.buckets?.length,
        detectedSubtype,
        currentDndSubtype: dndSubtype,
        buckets: initialValues.buckets,
        full_initialValues: initialValues
      }); */

      if (detectedSubtype !== dndSubtype) {
        /* console.log("🔍 [QuestionModal] Updating dndSubtype from", dndSubtype, "to", detectedSubtype); */
        setDndSubtype(detectedSubtype as DnDSubtype);
      } else {
        /* console.log("🔍 [QuestionModal] dndSubtype already correct:", dndSubtype); */
      }
    } else if (isOpen && !initialValues) {
      // Reset to default for new questions
      /* console.log("🔍 [QuestionModal] No initialValues, setting default subtype"); */
      setDndSubtype("two_buckets_single");
    }
  }, [isOpen, initialValues, dndSubtype]);

  // Use custom hooks for state management
  const mcState = useMCState();
  const maState = useMAState();
  const blankState = useBlankState();
  const tfState = useTFState();
  const dndState = useDnDState();
  const graphSelectorState = useGraphSelectorState();
  const equationCalculatorState = useEquationCalculatorState(!!istestpack);

  // Use modal state hooks for the actual functionality
  const mc = useMCModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);
  const ma = useMAModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);
  const tf = useTFModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);
  // For DND questions, use the detected subtype immediately
  const effectiveDndSubtype = getQuestionTypeAcronym(initialValues) === "DND" ?
    (initialValues.question_subtype ||
      initialValues.dnd_subtype ||
      (initialValues.buckets?.length >= 3 ? "table_dnd" :
        initialValues.buckets?.length === 1 ? "one_bucket_multi" : "two_buckets_single")) :
    dndSubtype;

  /* console.log("🔍 [QuestionModal] Calling useDnDModalState with dndSubtype:", effectiveDndSubtype); */
  /* console.log("🔍 [QuestionModal] initialValues for DND:", {
    question_type: initialValues?.question_type,
    question_subtype: initialValues?.question_subtype,
    dnd_subtype: initialValues?.dnd_subtype,
    question_category: initialValues?.question_category,
    buckets_length: initialValues?.buckets?.length,
    buckets: initialValues?.buckets
  }); */

  const dnd = useDnDModalState(initialValues, isOpen, onSave, onClose, !!istestpack, effectiveDndSubtype, subject, categoryId);
  const blank = useBlankModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);
  const tableGrid = useTableGridModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);
  const graphSelector = useGraphSelectorModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);
  const raySelector = useRaySelectorModalState(initialValues, isOpen, onSave, !!istestpack, subject, categoryId);
  const hotTextState = useHotTextModalState(initialValues, isOpen, onSave, onClose, !!istestpack, subject, categoryId);

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
      const detectedType = getQuestionTypeAcronym(initialValues);
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

  // Prefill Equation Calculator state when editing
  useEffect(() => {
    if (!isOpen || !initialValues) return;

    const typeAcronym = getQuestionTypeAcronym(initialValues);
    const isEquationCalc = typeAcronym === "EQUATION_CALCULATOR";
    if (!isEquationCalc) return;

    // Derive primary correct answer from multiple possible shapes
    let primaryAnswer: string = "";
    const fromArray = (initialValues as any).correct_answers?.find((a: any) => a?.is_primary)?.answer;
    const fromChoices = (initialValues as any).choices?.equation_answers?.find((a: any) => a?.is_primary)?.answer;
    const rawAnswer = fromArray || (initialValues as any).correct_answer || fromChoices || "";

    // Ensure the answer is always a string, not an object
    if (typeof rawAnswer === 'string') {
      primaryAnswer = rawAnswer;
    } else if (typeof rawAnswer === 'object' && rawAnswer !== null) {
      // If it's an object, try to extract a meaningful string representation
      primaryAnswer = rawAnswer.display || rawAnswer.text || JSON.stringify(rawAnswer);
    } else {
      primaryAnswer = String(rawAnswer || "");
    }

    equationCalculatorState.setInitialValues({
      question: initialValues.question || "",
      correctAnswer: primaryAnswer,
      questionImageUrl: (initialValues as any).question_image_url,
      difficulty: initialValues.difficulty || 3,
      explanation: initialValues.explanation || "",
    });

    // Populate tags for Blank and Graph Selector if editing
    // if (isOpen && initialValues) {
    //   const type = istestpack ? "test_pack" : "pre_shsat";
    //   const qId = initialValues.id || initialValues.question_id;

    //   if (questionType === "BLANK") {
    //     blank.loadTags(qId, type);
    //   } else if (questionType === "GRAPH_SELECTOR") {
    //     const points = initialValues.points || initialValues.available_points || [];
    //     if (points.length > 0) {
    //       graphSelector.loadPointTags(points, type);
    //     }
    //   }
    // }
  }, [isOpen, initialValues, equationCalculatorState.setInitialValues]);

  // Handle save using modular handler
  const handleSave = async () => {
    // Get current hierarchy values based on question type
    let currentChapter, currentTopic, currentSubTopic, currentQuestionCategory;

    if (initialValues) {
      // For editing, use initialValues
      currentChapter = initialValues.chapter_number;
      currentTopic = initialValues.topic_id;
      currentSubTopic = initialValues.sub_topic_id;
      currentQuestionCategory = initialValues.question_category;
    } else {
      // For creating, get current values from the appropriate hook
      switch (questionType) {
        case "MC":
          currentChapter = mc.mcChapter;
          currentTopic = mc.mcTopic;
          currentSubTopic = mc.mcSubTopic;
          currentQuestionCategory = mc.mcQuestionCategory;
          break;
        case "MA":
          currentChapter = ma.maChapter;
          currentTopic = ma.maTopic;
          currentSubTopic = ma.maSubTopic;
          currentQuestionCategory = ma.maQuestionCategory;
          break;
        case "TF":
          currentChapter = tf.tfChapter;
          currentTopic = tf.tfTopic;
          currentSubTopic = tf.tfSubTopic;
          currentQuestionCategory = tf.tfQuestionCategory;
          break;
        case "BLANK":
          currentChapter = blank.blankChapter;
          currentTopic = blank.blankTopic;
          currentSubTopic = blank.blankSubTopic;
          currentQuestionCategory = blank.blankQuestionCategory;
          break;
        case "DND":
          currentChapter = dnd.dndChapter;
          currentTopic = dnd.dndTopic;
          currentSubTopic = dnd.dndSubTopic;
          currentQuestionCategory = dnd.dndQuestionCategory;
          break;
        case "TABLE_GRID":
          currentChapter = tableGrid.tgChapter;
          currentTopic = tableGrid.tgTopic;
          currentSubTopic = tableGrid.tgSubTopic;
          currentQuestionCategory = tableGrid.tgQuestionCategory;
          break;
        case "RAY_SELECTOR":
          currentChapter = raySelector.rayChapter;
          currentTopic = raySelector.rayTopic;
          currentSubTopic = raySelector.raySubTopic;
          currentQuestionCategory = raySelector.rayQuestionCategory;
          break;
        case "GRAPH_SELECTOR":
          currentChapter = graphSelector.graphChapter;
          currentTopic = graphSelector.graphTopic;
          currentSubTopic = graphSelector.graphSubTopic;
          currentQuestionCategory = graphSelector.graphQuestionCategory;
          break;
        case "HOT_TEXT":
          currentChapter = hotTextState.hotTextChapter;
          currentTopic = hotTextState.hotTextTopic;
          currentSubTopic = hotTextState.hotTextSubTopic;
          currentQuestionCategory = hotTextState.hotTextQuestionCategory;
          break;
        case "EQUATION_CALCULATOR":
          currentChapter = equationCalculatorState.eqChapter;
          currentTopic = equationCalculatorState.eqTopic;
          currentSubTopic = equationCalculatorState.eqSubTopic;
          currentQuestionCategory = equationCalculatorState.eqQuestionCategory;
          break;
        default:
          currentChapter = undefined;
          currentTopic = undefined;
          currentSubTopic = undefined;
          currentQuestionCategory = undefined;
      }
    }

    const validationConfig = {
      questionType,
      initialValues,
      shouldEditPassage,
      istestpack: !!istestpack,
      subject,
      mainTopicId,
      categoryId,
      chapter_number: currentChapter,
      topic_id: currentTopic,
      sub_topic_id: currentSubTopic,
      question_category: currentQuestionCategory,
    };

    // Skip validation for equation calculator
    if (questionType !== "EQUATION_CALCULATOR" && !canSave(questionType, validationConfig)) {
      const validationError = getValidationError(questionType);
      if (validationError) {
        toast.error(validationError);
      } else {
        toast.error("Please fill in all required fields before saving.");
      }
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
      mcState,
      maState,
      blankState,
      tfState,
      dndState,
      graphSelectorState,
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
      equationCalculatorState.question || "",
      equationCalculatorState.correctAnswer || "",
      equationCalculatorState.questionImageUrl,
      equationCalculatorState.difficulty || 3,
      equationCalculatorState.eqQuestionCategory,
      equationCalculatorState.eqChapter,
      equationCalculatorState.eqTopic,
      equationCalculatorState.eqSubTopic,
      equationCalculatorState.explanation || "",
      equationCalculatorState.resetState || (() => { }),
      equationCalculatorState.eqTagSlots || [],
      // Pass tag slots for Blank and Graph Selector
      blank.choiceTagSlots || [],
      graphSelector.pointTagSlots || {}
    );
  };

  // Helper function to determine if we can save
  const canSaveQuestion = (type: string) => {
    // Get current hierarchy values based on question type
    let currentChapter, currentTopic, currentSubTopic, currentQuestionCategory;

    if (initialValues) {
      // For editing, use initialValues
      currentChapter = initialValues.chapter_number;
      currentTopic = initialValues.topic_id;
      currentSubTopic = initialValues.sub_topic_id;
      currentQuestionCategory = initialValues.question_category;
    } else {
      // For creating, get current values from the appropriate hook
      switch (type) {
        case "MC":
          currentChapter = mc.mcChapter;
          currentTopic = mc.mcTopic;
          currentSubTopic = mc.mcSubTopic;
          currentQuestionCategory = mc.mcQuestionCategory;
          break;
        case "MA":
          currentChapter = ma.maChapter;
          currentTopic = ma.maTopic;
          currentSubTopic = ma.maSubTopic;
          currentQuestionCategory = ma.maQuestionCategory;
          break;
        case "TF":
          currentChapter = tf.tfChapter;
          currentTopic = tf.tfTopic;
          currentSubTopic = tf.tfSubTopic;
          currentQuestionCategory = tf.tfQuestionCategory;
          break;
        case "BLANK":
          currentChapter = blank.blankChapter;
          currentTopic = blank.blankTopic;
          currentSubTopic = blank.blankSubTopic;
          currentQuestionCategory = blank.blankQuestionCategory;
          break;
        case "DND":
          currentChapter = dnd.dndChapter;
          currentTopic = dnd.dndTopic;
          currentSubTopic = dnd.dndSubTopic;
          currentQuestionCategory = dnd.dndQuestionCategory;
          break;
        case "TABLE_GRID":
          currentChapter = tableGrid.tgChapter;
          currentTopic = tableGrid.tgTopic;
          currentSubTopic = tableGrid.tgSubTopic;
          currentQuestionCategory = tableGrid.tgQuestionCategory;
          break;
        case "RAY_SELECTOR":
          currentChapter = raySelector.rayChapter;
          currentTopic = raySelector.rayTopic;
          currentSubTopic = raySelector.raySubTopic;
          currentQuestionCategory = raySelector.rayQuestionCategory;
          break;
        case "GRAPH_SELECTOR":
          currentChapter = graphSelector.graphChapter;
          currentTopic = graphSelector.graphTopic;
          currentSubTopic = graphSelector.graphSubTopic;
          currentQuestionCategory = graphSelector.graphQuestionCategory;
          break;
        case "HOT_TEXT":
          currentChapter = hotTextState.hotTextChapter;
          currentTopic = hotTextState.hotTextTopic;
          currentSubTopic = hotTextState.hotTextSubTopic;
          currentQuestionCategory = hotTextState.hotTextQuestionCategory;
          break;
        case "EQUATION_CALCULATOR":
          currentChapter = equationCalculatorState.eqChapter;
          currentTopic = equationCalculatorState.eqTopic;
          currentSubTopic = equationCalculatorState.eqSubTopic;
          currentQuestionCategory = equationCalculatorState.eqQuestionCategory;
          break;
        default:
          currentChapter = undefined;
          currentTopic = undefined;
          currentSubTopic = undefined;
          currentQuestionCategory = undefined;
      }
    }

    // For equation calculator, we need to check the actual form validation
    if (type === "EQUATION_CALCULATOR" && !initialValues) {
      // Debug logging for equation calculator validation
      /* console.log("🔍 [canSaveQuestion] Equation Calculator validation:", {
        equationCalculatorState: {
          isValid: equationCalculatorState.isValid,
          eqChapter: equationCalculatorState.eqChapter,
          eqTopic: equationCalculatorState.eqTopic,
          eqSubTopic: equationCalculatorState.eqSubTopic,
          eqQuestionCategory: equationCalculatorState.eqQuestionCategory,
          eqDifficulty: equationCalculatorState.difficulty
        },
        currentValues: {
          currentChapter,
          currentTopic,
          currentSubTopic,
          currentQuestionCategory,

        },
        questionType: type,
        istestpack: !!istestpack,
      }); */

      // For creating new equation calculator questions, check the form validation
      return equationCalculatorState.isValid && canSave(type, {
        questionType: type,
        initialValues,
        shouldEditPassage,
        istestpack: !!istestpack,
        subject,
        mainTopicId,
        categoryId,
        chapter_number: currentChapter,
        topic_id: currentTopic,
        sub_topic_id: currentSubTopic,
        question_category: currentQuestionCategory,
      });
    }

    return canSave(type, {
      questionType: type,
      initialValues,
      shouldEditPassage,
      istestpack: !!istestpack,
      subject,
      mainTopicId,
      categoryId,
      chapter_number: currentChapter,
      topic_id: currentTopic,
      sub_topic_id: currentSubTopic,
      question_category: currentQuestionCategory,
    });
  };

  // Helper function to get validation error message
  const getValidationError = (type: string) => {
    // Get current hierarchy values based on question type
    let currentChapter, currentTopic, currentSubTopic, currentQuestionCategory;

    if (initialValues) {
      // For editing, use initialValues
      currentChapter = initialValues.chapter_number;
      currentTopic = initialValues.topic_id;
      currentSubTopic = initialValues.sub_topic_id;
      currentQuestionCategory = initialValues.question_category;
    } else {
      // For creating, get current values from the appropriate hook
      switch (type) {
        case "MC":
          currentChapter = mc.mcChapter;
          currentTopic = mc.mcTopic;
          currentSubTopic = mc.mcSubTopic;
          currentQuestionCategory = mc.mcQuestionCategory;
          break;
        case "MA":
          currentChapter = ma.maChapter;
          currentTopic = ma.maTopic;
          currentSubTopic = ma.maSubTopic;
          currentQuestionCategory = ma.maQuestionCategory;
          break;
        case "TF":
          currentChapter = tf.tfChapter;
          currentTopic = tf.tfTopic;
          currentSubTopic = tf.tfSubTopic;
          currentQuestionCategory = tf.tfQuestionCategory;
          break;
        case "BLANK":
          currentChapter = blank.blankChapter;
          currentTopic = blank.blankTopic;
          currentSubTopic = blank.blankSubTopic;
          currentQuestionCategory = blank.blankQuestionCategory;
          break;
        case "DND":
          currentChapter = dnd.dndChapter;
          currentTopic = dnd.dndTopic;
          currentSubTopic = dnd.dndSubTopic;
          currentQuestionCategory = dnd.dndQuestionCategory;
          break;
        case "TABLE_GRID":
          currentChapter = tableGrid.tgChapter;
          currentTopic = tableGrid.tgTopic;
          currentSubTopic = tableGrid.tgSubTopic;
          currentQuestionCategory = tableGrid.tgQuestionCategory;
          break;
        case "RAY_SELECTOR":
          currentChapter = raySelector.rayChapter;
          currentTopic = raySelector.rayTopic;
          currentSubTopic = raySelector.raySubTopic;
          currentQuestionCategory = raySelector.rayQuestionCategory;
          break;
        case "GRAPH_SELECTOR":
          currentChapter = graphSelector.graphChapter;
          currentTopic = graphSelector.graphTopic;
          currentSubTopic = graphSelector.graphSubTopic;
          currentQuestionCategory = graphSelector.graphQuestionCategory;
          break;
        case "HOT_TEXT":
          currentChapter = hotTextState.hotTextChapter;
          currentTopic = hotTextState.hotTextTopic;
          currentSubTopic = hotTextState.hotTextSubTopic;
          currentQuestionCategory = hotTextState.hotTextQuestionCategory;
          break;
        default:
          currentChapter = undefined;
          currentTopic = undefined;
          currentSubTopic = undefined;
          currentQuestionCategory = undefined;
      }
    }

    return getValidationErrorFn(type, {
      questionType: type,
      initialValues,
      shouldEditPassage,
      istestpack: !!istestpack,
      subject,
      mainTopicId,
      categoryId,
      chapter_number: currentChapter,
      topic_id: currentTopic,
      sub_topic_id: currentSubTopic,
      question_category: currentQuestionCategory,
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
              {/* Commented out as requested - only subject is needed for test pack questions */}
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
            </div>
          )}

        {/* DND Subtype Dropdown - Always show for DND questions */}
        {questionType === "DND" && (
          <div className="mb-4">
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

        {/* Validation Error Display */}
        {(() => {
          const validationError = getValidationError(questionType);
          if (validationError) {
            return (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Validation Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {validationError}
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}

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
