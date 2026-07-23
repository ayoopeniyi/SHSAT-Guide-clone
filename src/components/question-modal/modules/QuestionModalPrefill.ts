// Question Modal Prefill Logic Hook
import { useEffect, useRef, useState } from 'react';
import { PrefillConfig } from './QuestionModalTypes';
import { getQuestionTypeAcronym } from '../../../utils/questionTypeUtils';

export const useQuestionModalPrefill = (
  config: PrefillConfig,
  // Modal state hooks
  mc: any,
  ma: any,
  tf: any,
  dnd: any,
  blank: any,
  tableGrid: any,
  graphSelector: any,
  raySelector: any,
  equationCalculatorState: any,
  // Local state setters
  setQuestionType: (type: string) => void,
  setMcQuestion: (question: string) => void,
  setMcChoices: (choices: any[]) => void,
  setMcExplanation: (explanation: string) => void,
  setMcVariant: (variant: string) => void,
  setMcDifficulty: (difficulty: number) => void,
  setMaQuestion: (question: string) => void,
  setMaChoices: (choices: any[]) => void,
  setMaDifficulty: (difficulty: number) => void,
  setTfQuestion: (question: string) => void,
  setTfAnswer: (answer: boolean | null) => void,
  setTfExplanation: (explanation: string) => void,
  setTfDifficulty: (difficulty: number) => void,
  setBlankDifficulty: (difficulty: number) => void,
  setTgPrompt: (prompt: string) => void,
  setTgRowLabels: (labels: string[]) => void,
  setTgColumnLabels: (labels: string[]) => void,
  setTgSelectionMode: (mode: "single" | "multiple") => void,
  setTgFirstColumnHeader: (header: string) => void,
  setTgAnswerMatrix: (matrix: any[]) => void,
  setTgDifficulty: (difficulty: number) => void,
  setRcPassage: (passage: string) => void,
  setRcStartPage: (page: number | undefined) => void,
  setRcEndPage: (page: number | undefined) => void,
  setRcImageUrl: (url: string | undefined) => void,
  setRcDifficulty: (difficulty: number) => void,
  setDndSubtype: (subtype: string) => void,
  setDndDifficulty: (difficulty: number) => void,
  setGraphDifficulty: (difficulty: number) => void,
  setRayDifficulty: (difficulty: number) => void,
  resetGraphSelectorState: () => void,
  resetEquationCalculatorState: () => void,
  // DND state
  dndBuckets: any[],
  dndChoices: any[],
  dndAssignments: any[],
  setDndBuckets: (buckets: any[]) => void,
  setDndChoices: (choices: any[]) => void,
  setDndCorrectAssignments: (assignments: any) => void,
  // RC state
  rcPassage: string,
  setRcTopicId: (id: number | undefined) => void,
  setRcSubTopicId: (id: number | undefined) => void,
  // Other state
  setQuestionImageUrl: (url: string | undefined) => void,
  resetDnDState: () => void,
  // Props
  isOpen: boolean,
  initialValues: any,
  istestpack: boolean
) => {
  const { questionType } = config;

  // Add a flag to track if we've already prefilled the data
  const [hasPrefilledLocal, setHasPrefilledLocal] = useState(false);

  // Reset prefill flag ONLY when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasPrefilledLocal(false);
    }
  }, [isOpen]);

  // Reset prefill flag when initialValues change (for async data loading)
  // Use a ref to track the previous initialValues to avoid unnecessary resets
  const prevInitialValuesRef = useRef(initialValues);
  useEffect(() => {
    const prevInitialValues = prevInitialValuesRef.current;

    // Only reset if we're switching to a different question (different ID) or from editing to creating
    const shouldReset =
      (!prevInitialValues && initialValues) ||
      (prevInitialValues && !initialValues) ||
      prevInitialValues?.id !== initialValues?.id;

    if (shouldReset) {
      setHasPrefilledLocal(false);
    }

    // Also update questionType when initialValues change
    if (initialValues && initialValues.question_type) {
      setQuestionType(initialValues.question_type);
    } else if (
      initialValues &&
      initialValues.row_labels &&
      initialValues.column_labels
    ) {
      // If no explicit question_type but has TABLE_GRID structure, set it
      setQuestionType("TABLE_GRID");
    }

    prevInitialValuesRef.current = initialValues;
  }, [initialValues, setQuestionType]);

  // Prefill MC data if editing an MC question
  useEffect(() => {
    if (
      isOpen &&
      initialValues &&
      getQuestionTypeAcronym(initialValues) === "MC" &&
      !hasPrefilledLocal
    ) {
      /* console.log("Prefilling MC modal with:", initialValues); */
      /* console.log("MC initialValues.difficulty:", initialValues.difficulty); */
      setQuestionType("MC");
      setMcQuestion(initialValues.question || "");
      setMcExplanation(initialValues.explanation || "");
      setQuestionImageUrl(initialValues.question_image_url || undefined);
      // Set variant based on question_category, defaulting to 'standard' for backward compatibility
      setMcVariant(
        (initialValues.question_category as string) || "standard",
      );

      // Convert choices to the expected format
      if (initialValues.choices && Array.isArray(initialValues.choices)) {
        const convertedChoices = initialValues.choices.map(
          (choice: any, idx: number) => ({
            letter:
              choice.choice_label ||
              choice.letter ||
              String.fromCharCode(65 + idx),
            value: {
              text:
                choice.choice_text || choice.value?.text || choice.text || "",
              is_correct:
                choice.is_correct || choice.value?.is_correct || false,
              explanation:
                choice.explanation || choice.value?.explanation || "",
              choice_image_url:
                choice.choice_image_url ||
                choice.value?.choice_image_url ||
                undefined,
              id: choice.id || choice.value?.id || undefined,
            },
          }),
        );
        /* console.log("Setting MC choices from initialValues:", convertedChoices); */
        setMcChoices(convertedChoices);
      }

      // Set difficulty
      const difficultyValue = initialValues.difficulty || 3;
      /* console.log("Setting MC difficulty to:", difficultyValue); */
      setMcDifficulty(difficultyValue);

      setHasPrefilledLocal(true);
    }
  }, [isOpen, initialValues, hasPrefilledLocal, setQuestionType, setMcQuestion, setMcChoices, setMcExplanation, setMcVariant, setMcDifficulty, setQuestionImageUrl]);

  // Prefill MA data if editing an MA question
  useEffect(() => {
    if (
      isOpen &&
      initialValues &&
      getQuestionTypeAcronym(initialValues) === "MA" &&
      !hasPrefilledLocal
    ) {
      /* console.log("Prefilling MA modal with:", initialValues); */
      /* console.log("MA initialValues.difficulty:", initialValues.difficulty); */
      setQuestionType("MA");
      setMaQuestion(initialValues.question || "");
      setQuestionImageUrl(initialValues.question_image_url || undefined);

      // Convert choices to the expected format
      if (initialValues.choices && Array.isArray(initialValues.choices)) {
        const convertedChoices = initialValues.choices.map(
          (choice: any, idx: number) => ({
            choice_label: choice.choice_label || String.fromCharCode(65 + idx),
            choice_text: choice.choice_text || choice.text || "",
            is_correct: choice.is_correct || false,
            explanation: choice.explanation || "",
            choice_image_url: choice.choice_image_url || undefined,
            id: choice.id || undefined,
          }),
        );
        /* console.log("Setting MA choices from initialValues:", convertedChoices); */
        setMaChoices(convertedChoices);
      }

      // Set difficulty
      const difficultyValue = initialValues.difficulty || 3;
      /* console.log("Setting MA difficulty to:", difficultyValue); */
      setMaDifficulty(difficultyValue);

      setHasPrefilledLocal(true);
    }
  }, [isOpen, initialValues, hasPrefilledLocal, setQuestionType, setMaQuestion, setMaChoices, setMaDifficulty, setQuestionImageUrl]);

  // Prefill TF data if editing a TF question
  useEffect(() => {
    if (
      isOpen &&
      initialValues &&
      getQuestionTypeAcronym(initialValues) === "TF" &&
      !hasPrefilledLocal
    ) {
      /* console.log("Prefilling TF modal with:", initialValues); */
      setQuestionType("TF");
      setTfQuestion(initialValues.question || "");
      setTfExplanation(initialValues.explanation || "");

      // Convert answer string to boolean
      if (initialValues.answer) {
        const answerStr = String(initialValues.answer).toLowerCase();
        setTfAnswer(answerStr === "true" || answerStr === "1");
      }

      // Set difficulty
      setTfDifficulty(initialValues.difficulty || 3);

      setHasPrefilledLocal(true);
    }
  }, [isOpen, initialValues, hasPrefilledLocal, setQuestionType, setTfQuestion, setTfAnswer, setTfExplanation, setTfDifficulty]);

  // Prefill BLANK data if editing a BLANK question
  useEffect(() => {
    if (
      isOpen &&
      initialValues &&
      getQuestionTypeAcronym(initialValues) === "BLANK" &&
      !hasPrefilledLocal
    ) {
      /* console.log("Prefilling BLANK modal with:", initialValues); */
      setQuestionType("BLANK");
      blank.setBlankQuestion(initialValues.question || "");
      blank.setBlankCorrectAnswer(
        initialValues.answer || initialValues.correct_answer || "",
      );
      blank.setBlankExplanation(initialValues.explanation || "");
      // Set variant based on question_category, defaulting to 'placeholder' for backward compatibility
      blank.setBlankVariant(
        (initialValues.question_category as string) || "placeholder",
      );

      // Set difficulty
      setBlankDifficulty(initialValues.difficulty || 3);

      setHasPrefilledLocal(true);
    }
  }, [isOpen, initialValues, hasPrefilledLocal, setQuestionType, blank, setBlankDifficulty]);

  // Prefill HOT_TEXT data if editing a HOT_TEXT question
  useEffect(() => {
    if (
      isOpen &&
      initialValues &&
      getQuestionTypeAcronym(initialValues) === "HOT_TEXT" &&
      !hasPrefilledLocal
    ) {
      /* console.log("Prefilling HOT_TEXT modal with:", initialValues); */
      setQuestionType("HOT_TEXT");
      setHasPrefilledLocal(true);
    }
  }, [isOpen, initialValues, hasPrefilledLocal, setQuestionType]);

  // Prefill DND data if editing a DND question
  useEffect(() => {
    const isDndQuestion =
      initialValues &&
      getQuestionTypeAcronym(initialValues) === "DND";

    if (isOpen && isDndQuestion && !hasPrefilledLocal) {
      setQuestionType("DND");

      // Use the same robust subtype detection as QuestionModalModular
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

      /* console.log("🔍 [QuestionModalPrefill] DND subtype detection:", {
        question_subtype: initialValues.question_subtype,
        dnd_subtype: initialValues.dnd_subtype,
        question_category: initialValues.question_category,
        buckets_length: initialValues.buckets?.length,
        assignments: initialValues.assignments,
        detectedSubtype
      }); */

      setDndSubtype(detectedSubtype);
      // ... rest of prefill logic ...
    }
  }, [isOpen, initialValues, hasPrefilledLocal, setQuestionType, setDndSubtype]);

  // Prefill TABLE_GRID data if editing a TABLE_GRID question
  useEffect(() => {
    // Check if this is a TABLE_GRID question - could be in question_type or inferred from data structure
    const isTableGrid =
      initialValues &&
      (getQuestionTypeAcronym(initialValues) === "TABLE_GRID" ||
        (initialValues.row_labels &&
          initialValues.column_labels &&
          initialValues.answer_matrix));

    if (isOpen && isTableGrid && !hasPrefilledLocal) {
      setQuestionType("TABLE_GRID");
      setTgPrompt(initialValues.question || "");
      setTgRowLabels(initialValues.row_labels || ["Row 1"]);
      setTgColumnLabels(
        initialValues.column_labels || ["Column 1", "Column 2"],
      );
      setTgSelectionMode(initialValues.selection_mode || "single");
      setTgFirstColumnHeader(initialValues.first_column_header || "");
      setTgAnswerMatrix(initialValues.answer_matrix || []);
      setTgDifficulty(initialValues.difficulty || 3);
      setHasPrefilledLocal(true);
    }
  }, [isOpen, initialValues, hasPrefilledLocal, setQuestionType, setTgPrompt, setTgRowLabels, setTgColumnLabels, setTgSelectionMode, setTgFirstColumnHeader, setTgAnswerMatrix, setTgDifficulty]);

  // Prefill EQUATION_CALCULATOR data if editing an EQUATION_CALCULATOR question
  useEffect(() => {
    const isEquationCalculator =
      initialValues &&
      getQuestionTypeAcronym(initialValues) === "EQUATION_CALCULATOR";

    if (isOpen && isEquationCalculator && !hasPrefilledLocal) {
      /* console.log("Prefilling EQUATION_CALCULATOR modal with:", initialValues); */
      setQuestionType("EQUATION_CALCULATOR");

      // Set question text
      equationCalculatorState.setQuestion(initialValues.question || "");

      // Set correct answer from choices or correct_answer field
      let correctAnswer = "";
      if (initialValues.choices && initialValues.choices.length > 0) {
        // Find the primary answer from choices
        const primaryChoice = initialValues.choices.find((choice: any) => choice.is_primary);
        correctAnswer = primaryChoice ? primaryChoice.answer : initialValues.choices[0].answer;
      } else if (initialValues.correct_answer) {
        correctAnswer = initialValues.correct_answer;
      }
      equationCalculatorState.setCorrectAnswer(correctAnswer);

      // Set other fields
      equationCalculatorState.setQuestionImageUrl(initialValues.question_image_url);
      equationCalculatorState.setDifficulty(initialValues.difficulty || 3);

      setHasPrefilledLocal(true);
    }
  }, [isOpen, initialValues, hasPrefilledLocal, setQuestionType, equationCalculatorState]);

  // Reset state when creating new questions (no initialValues)
  useEffect(() => {
    if (isOpen && !initialValues && !hasPrefilledLocal) {
      /* console.log("Resetting modal state for new question"); */
      // Only set questionType to MC if it is still MC (i.e., user hasn't changed it)
      setQuestionType("MC");
      setMcQuestion("");
      setMcChoices([
        { letter: "A", value: { text: "", is_correct: false } },
        { letter: "B", value: { text: "", is_correct: false } },
      ]);
      setMcExplanation("");
      setQuestionImageUrl(undefined);
      setMaQuestion("");
      setMaChoices([
        {
          choice_label: "A",
          choice_text: "",
          is_correct: false,
          explanation: "",
          choice_image_url: undefined,
          id: undefined,
        },
        {
          choice_label: "B",
          choice_text: "",
          is_correct: false,
          explanation: "",
          choice_image_url: undefined,
          id: undefined,
        },
        {
          choice_label: "C",
          choice_text: "",
          is_correct: false,
          explanation: "",
          choice_image_url: undefined,
          id: undefined,
        },
      ]);
      blank.setBlankQuestion("");
      blank.setBlankCorrectAnswer("");
      blank.setBlankExplanation("");
      setTfQuestion("");
      setTfAnswer(null);
      setTfExplanation("");

      // Reset DND state properly
      dnd.setDndQuestion("");
      setDndSubtype("two_buckets_single");
      resetDnDState(); // This will set proper default assignments

      // Reset Graph Selector state
      resetGraphSelectorState();

      // Remove: resetRaySelectorState();

      // Reset RC state
      setRcPassage("");
      setRcTopicId(undefined);
      setRcSubTopicId(undefined);
      setRcImageUrl(undefined);
      setRcStartPage(undefined);
      setRcEndPage(undefined);

      // Reset EQUATION_CALCULATOR state
      resetEquationCalculatorState();

      setHasPrefilledLocal(true);
    }
  }, [isOpen, initialValues, hasPrefilledLocal, setQuestionType, setMcQuestion, setMcChoices, setMcExplanation, setQuestionImageUrl, setMaQuestion, setMaChoices, blank, setTfQuestion, setTfAnswer, setTfExplanation, dnd, setDndSubtype, resetDnDState, resetGraphSelectorState, setRcPassage, setRcTopicId, setRcSubTopicId, setRcImageUrl, setRcStartPage, setRcEndPage, resetEquationCalculatorState]);

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
        // If passage content not loaded, fetch it (similar to TestPack.tsx logic)
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
  }, [isOpen, initialValues, hasPrefilledLocal, setRcPassage, setRcStartPage, setRcEndPage, setRcImageUrl]);

  return {
    hasPrefilled: hasPrefilledLocal,
    setHasPrefilled: setHasPrefilledLocal,
  };
};
