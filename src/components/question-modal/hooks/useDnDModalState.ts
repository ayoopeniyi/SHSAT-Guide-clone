import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { toast } from "sonner";
import type { TagSlot } from "../../shared/ChoiceTagEditor";
import { fetchChoiceTags, saveChoiceTags, fetchBatchChoiceTags } from "../../../services/tagService";

// Draft persistence utilities
const getDraftKey = (isTestPack: boolean, editingId?: string | number) => {
  const context = isTestPack ? 'testpack' : 'questionbank';
  const id = editingId ? `_${editingId}` : '';
  return `question_draft_DND_${context}${id}`;
};

const saveDraftToLocalStorage = (draftData: any, isTestPack: boolean, editingId?: string | number) => {
  try {
    const key = getDraftKey(isTestPack, editingId);
    localStorage.setItem(key, JSON.stringify({
      ...draftData,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Failed to save draft to localStorage:', error);
  }
};

const loadDraftFromLocalStorage = (isTestPack: boolean, editingId?: string | number) => {
  try {
    const key = getDraftKey(isTestPack, editingId);
    const stored = localStorage.getItem(key);
    if (stored) {
      const draft = JSON.parse(stored);
      if (Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
        return draft;
      } else {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.warn('Failed to load draft from localStorage:', error);
  }
  return null;
};

const clearDraftFromLocalStorage = (isTestPack: boolean, editingId?: string | number) => {
  try {
    const key = getDraftKey(isTestPack, editingId);
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear draft from localStorage:', error);
  }
};

// Helper function to get initial buckets based on subtype
const getInitialBuckets = (subtype: string) => {
  if (subtype === "table_dnd") {
    return [
      { label: "Para 1-2", bucket_order: 0 },
      { label: "Para 3-4", bucket_order: 1 },
      { label: "Para 5-6", bucket_order: 2 },
    ];
  } else if (subtype === "one_bucket_multi" || subtype === "one_bucket_single") {
    return [
      { label: "Correct Answers", bucket_order: 0 },
    ];
  } else {
    return [
      { label: "Even Numbers", bucket_order: 0 },
      { label: "Odd Numbers", bucket_order: 1 },
    ];
  }
};

// Helper function to get initial assignments based on subtype
const getInitialAssignments = (subtype: string): Record<number, number[]> => {
  if (subtype === "table_dnd") {
    return { 0: [], 1: [], 2: [] };
  } else if (subtype === "one_bucket_multi" || subtype === "one_bucket_single") {
    return { 0: [0, 2] };
  } else {
    return { 0: [0, 2], 1: [1, 3] };
  }
};

// Helper function to get initial preview assignments based on subtype
const getInitialPreviewAssignments = (subtype: string): Record<number, number[]> => {
  if (subtype === "one_bucket_multi" || subtype === "one_bucket_single") {
    return { 0: [] };
  } else if (subtype === "table_dnd") {
    return { 0: [], 1: [], 2: [] };
  } else {
    return { 0: [], 1: [] };
  }
};

// Helper function to get initial choices
const getInitialChoices = () => [
  { label: "2", choice_order: 0 },
  { label: "3", choice_order: 1 },
  { label: "4", choice_order: 2 },
  { label: "5", choice_order: 3 },
];

// Data conversion helpers for prefill
const convertBuckets = (buckets: any[], subtype: string) => {
  const stripHtml = (html: string) => html ? html.replace(/<[^>]*>/g, '').trim() : "";
  return buckets.map((bucket: any, idx: number) => ({
    ...bucket,
    label: bucket.label || stripHtml(bucket.answer_text || "") || bucket.bucket_label || bucket.name || `Bucket ${idx + 1}`,
    bucket_order: bucket.bucket_order ?? bucket.display_order ?? idx,
  }));
};

const convertChoices = (choices: any[]) => {
  const stripHtml = (html: string) => html ? html.replace(/<[^>]*>/g, '').trim() : "";
  return choices.map((choice: any, idx: number) => ({
    ...choice,
    label: choice.label || stripHtml(choice.answer_text || "") || choice.choice_text || choice.text || `Choice ${idx + 1}`,
    choice_order: choice.choice_order ?? choice.display_order ?? idx,
  }));
};

const buildAssignmentMap = (assignments: any[], buckets: any[], choices: any[], subtype: string) => {
  const map: Record<number, number[]> = {};
  assignments.forEach((assignment: any) => {
    const bucketIndex = buckets.findIndex((b: any) => b.id === assignment.bucket_id);
    const choiceIndex = choices.findIndex((c: any) => c.id === assignment.choice_id);
    if (bucketIndex !== -1 && choiceIndex !== -1) {
      if (!map[bucketIndex]) map[bucketIndex] = [];
      map[bucketIndex].push(choiceIndex);
    }
  });

  // Ensure all bucket indices exist in the map
  buckets.forEach((_, idx) => {
    if (!map[idx]) map[idx] = [];
  });

  return map;
};

export function useDnDModalState(initialValues: any, isOpen: boolean, onSave: (data: any) => void, onClose: () => void, istestpack: boolean, dndSubtype: string, subject?: string, categoryId?: string) {
  /* console.log("🔍 [useDnDModalState] Initialized with:", {
    dndSubtype,
    initialValues: initialValues ? {
      question_type: initialValues.question_type,
      question_subtype: initialValues.question_subtype,
      question_category: initialValues.question_category,
      buckets: initialValues.buckets,
      choices: initialValues.choices,
      assignments: initialValues.assignments
    } : null,
    isOpen
  }); */

  // Determine the effective subtype for initialization
  const effectiveSubtype = initialValues?.question_type === "DND" ?
    (initialValues.question_subtype ||
      initialValues.dnd_subtype ||
      (initialValues.buckets?.length >= 3 ? "table_dnd" :
        initialValues.buckets?.length === 1 ? "one_bucket_multi" : "two_buckets_single")) :
    dndSubtype;

  // console.log("🔍 [useDnDModalState] Using effective subtype:", effectiveSubtype);

  // State - initialize with correct values based on initialValues or dndSubtype
  const [dndQuestion, setDndQuestion] = useState(initialValues?.question || "");
  const [dndBuckets, setDndBuckets] = useState(() => {
    if (initialValues?.buckets && Array.isArray(initialValues.buckets)) {
      const stripHtml = (html: string) => html ? html.replace(/<[^>]*>/g, '').trim() : "";
      return initialValues.buckets.map((bucket: any, idx: number) => ({
        ...bucket,
        label: bucket.label || stripHtml(bucket.answer_text || "") || bucket.bucket_label || bucket.name || `Bucket ${idx + 1}`,
        bucket_order: bucket.bucket_order ?? bucket.display_order ?? idx,
      }));
    }
    return getInitialBuckets(effectiveSubtype);
  });
  const [dndChoices, setDndChoices] = useState(() => {
    if (initialValues?.choices && Array.isArray(initialValues.choices)) {
      const stripHtml = (html: string) => html ? html.replace(/<[^>]*>/g, '').trim() : "";
      return initialValues.choices.map((choice: any, idx: number) => ({
        ...choice,
        label: choice.label || stripHtml(choice.answer_text || "") || choice.choice_text || choice.text || `Choice ${idx + 1}`,
        choice_order: choice.choice_order ?? choice.display_order ?? idx,
      }));
    }
    return [
      { label: "2", choice_order: 0 },
      { label: "3", choice_order: 1 },
      { label: "4", choice_order: 2 },
      { label: "5", choice_order: 3 },
    ];
  });
  const [dndCorrectAssignments, setDndCorrectAssignments] = useState<Record<number, number[]>>(() => {
    if (initialValues?.assignments && initialValues.buckets && initialValues.choices) {
      // Convert assignments to the expected format
      const assignments: Record<number, number[]> = {};
      initialValues.assignments.forEach((assignment: any) => {
        const bucketIndex = initialValues.buckets.findIndex((b: any) => b.id === assignment.bucket_id);
        const choiceIndex = initialValues.choices.findIndex((c: any) => c.id === assignment.choice_id);
        if (bucketIndex !== -1 && choiceIndex !== -1) {
          if (!assignments[bucketIndex]) {
            assignments[bucketIndex] = [];
          }
          assignments[bucketIndex].push(choiceIndex);
        }
      });
      return assignments;
    }
    return getInitialAssignments(effectiveSubtype);
  });
  const [dndExplanation, setDndExplanation] = useState(initialValues?.explanation || "");
  const [questionImageUrl, setQuestionImageUrl] = useState<string | undefined>(initialValues?.question_image_url);
  const [previewAssignments, setPreviewAssignments] = useState<Record<number, number[]>>(() => {
    if (initialValues?.assignments && initialValues.buckets && initialValues.choices) {
      // Convert assignments to the expected format for preview
      const assignments: Record<number, number[]> = {};
      initialValues.assignments.forEach((assignment: any) => {
        const bucketIndex = initialValues.buckets.findIndex((b: any) => b.id === assignment.bucket_id);
        const choiceIndex = initialValues.choices.findIndex((c: any) => c.id === assignment.choice_id);
        if (bucketIndex !== -1 && choiceIndex !== -1) {
          if (!assignments[bucketIndex]) {
            assignments[bucketIndex] = [];
          }
          assignments[bucketIndex].push(choiceIndex);
        }
      });
      return assignments;
    }
    return getInitialPreviewAssignments(effectiveSubtype);
  });

  // Calculate poolChoices using useMemo
  const poolChoices = useMemo(() => {
    const allAssignedIndices = Object.values(previewAssignments).flat();
    return dndChoices
      .map((_: any, idx: number) => idx)
      .filter((idx: number) => !allAssignedIndices.includes(idx));
  }, [dndChoices, previewAssignments]);
  const [dndDifficulty, setDndDifficulty] = useState(initialValues?.difficulty || 3);
  const [hasPrefilled, setHasPrefilled] = useState(!!initialValues);
  const [tableColumnHeaders, setTableColumnHeaders] = useState<[string, string]>(() => {
    if (initialValues?.column_headers && Array.isArray(initialValues.column_headers) && initialValues.column_headers.length === 2) {
      return initialValues.column_headers as [string, string];
    }
    return ["Row", "Answer"];
  });

  // Hierarchy fields for question bank
  const [dndChapter, setDndChapter] = useState<number | undefined>(undefined);
  const [dndTopic, setDndTopic] = useState<number | undefined>(undefined);
  const [dndSubTopic, setDndSubTopic] = useState<number | undefined>(undefined);
  const [dndQuestionCategory, setDndQuestionCategory] = useState<string>("Practice");

  // Tagging state: Map of choice index (string) to its tag slots
  const [choiceTagSlots, setChoiceTagSlots] = useState<Record<string, TagSlot[]>>({});

  const editingId = initialValues?.id || initialValues?.question_id;
  const isCreating = !initialValues;

  // Save draft whenever state changes (only for new questions)
  const saveDraft = useCallback(() => {
    if (isCreating && isOpen) {
      const draftData = {
        dndQuestion,
        dndBuckets,
        dndChoices,
        dndCorrectAssignments,
        dndExplanation,
        dndDifficulty,
        tableColumnHeaders,
        dndChapter,
        dndTopic,
        dndSubTopic,
        dndQuestionCategory,
        dndSubtype,
        subject,
        categoryId
      };
      saveDraftToLocalStorage(draftData, istestpack, editingId);
    }
  }, [dndQuestion, dndBuckets, dndChoices, dndCorrectAssignments, dndExplanation, dndDifficulty, tableColumnHeaders, dndChapter, dndTopic, dndSubTopic, dndQuestionCategory, dndSubtype, subject, categoryId, isCreating, isOpen, istestpack, editingId]);

  // Auto-save draft when state changes
  useEffect(() => {
    if (isCreating && isOpen && hasPrefilled) {
      const timeoutId = setTimeout(saveDraft, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [saveDraft, isCreating, isOpen, hasPrefilled]);

  // Clear draft on successful save or modal close
  const clearDraft = useCallback(() => {
    if (isCreating) {
      clearDraftFromLocalStorage(istestpack, editingId);
    }
  }, [isCreating, istestpack, editingId]);

  // Handle dndSubtype changes - update buckets, choices, and assignments when subtype changes
  // Only for new questions, not when editing existing ones
  useEffect(() => {
    if (isOpen && dndSubtype && !initialValues) {
      /* console.log("🔍 [useDnDModalState] dndSubtype changed for new question, updating state:", {
        dndSubtype,
        hasInitialValues: !!initialValues,
        currentBuckets: dndBuckets,
        currentChoices: dndChoices,
        currentAssignments: dndCorrectAssignments
      }); */

      // Update buckets based on new subtype
      const newBuckets = getInitialBuckets(dndSubtype);
      setDndBuckets(newBuckets);

      // Update assignments based on new subtype
      const newAssignments = getInitialAssignments(dndSubtype);
      setDndCorrectAssignments(newAssignments);

      // Update preview assignments
      const newPreviewAssignments = getInitialPreviewAssignments(dndSubtype);
      setPreviewAssignments(newPreviewAssignments);

      /* console.log("🔍 [useDnDModalState] Updated state for new subtype:", {
        newBuckets,
        newAssignments,
        newPreviewAssignments
      }); */
    }
  }, [dndSubtype, isOpen, initialValues]);

  // Handle dndSubtype parameter changes - this is crucial for editing mode
  // Only update preview assignments for editing mode, don't reset buckets/choices/assignments
  useEffect(() => {
    // console.log("🔍 [useDnDModalState] dndSubtype parameter changed to:", dndSubtype);

    // Only update preview assignments when editing
    if (initialValues) {
      const newPreviewAssignments = getInitialPreviewAssignments(dndSubtype);
      setPreviewAssignments(newPreviewAssignments);

      /* console.log("🔍 [useDnDModalState] Updated preview assignments for editing:", {
        dndSubtype,
        newPreviewAssignments
      }); */
    }
  }, [dndSubtype, initialValues]);

  // Handle dndSubtype changes for editing - update buckets if needed
  useEffect(() => {
    if (isOpen && initialValues && dndSubtype) {
      /* console.log("🔍 [useDnDModalState] dndSubtype changed during editing:", {
        dndSubtype,
        currentBuckets: dndBuckets,
        hasInitialValues: !!initialValues
      }); */

      // For table_dnd, ensure we have the right number of buckets
      if (dndSubtype === "table_dnd" && dndBuckets.length < 3) {
        // console.log("🔍 [useDnDModalState] Updating buckets for table_dnd");
        const newBuckets = getInitialBuckets(dndSubtype);
        setDndBuckets(newBuckets);
      }
    }
  }, [dndSubtype, isOpen, initialValues, dndBuckets.length]);

  // Prefill logic
  useEffect(() => {
    // Determine context
    const isTestPackContext = Boolean(istestpack || initialValues?.test_id);
    
    // Case 1: Editing an existing question
    if (isOpen && initialValues && !hasPrefilled) {
      if (initialValues.question_type === "DND" || initialValues.question_type_acronym === "DND") {
        // console.log("🔍 [useDnDModalState] Starting DND prefill:", initialValues);

        setDndQuestion(initialValues.question || "");
        setDndExplanation(initialValues.explanation || "");
        setDndDifficulty(initialValues.difficulty || 3);
        setQuestionImageUrl(initialValues.question_image_url || undefined);

        // Subtype detection
        let detectedSubtype = initialValues.question_subtype || initialValues.dnd_subtype;
        if (!detectedSubtype && initialValues.question_category) {
          if (["one_bucket_multi", "one_bucket_single", "two_buckets_single", "two_buckets_multi", "table_dnd"].includes(initialValues.question_category)) {
            detectedSubtype = initialValues.question_category;
          }
        }
        if (!detectedSubtype) {
          if (initialValues.buckets?.length >= 3) detectedSubtype = "table_dnd";
          else if (initialValues.buckets?.length === 1) detectedSubtype = "one_bucket_multi";
          else detectedSubtype = "two_buckets_single";
        }

        // console.log("🔍 [useDnDModalState] Detected subtype:", detectedSubtype);

        // Column headers
        if (initialValues.tableColumnHeaders || initialValues.column_headers) {
          setTableColumnHeaders(initialValues.tableColumnHeaders || initialValues.column_headers);
        }

        // Hierarchy
        setDndChapter(initialValues.chapter_number);
        setDndTopic(initialValues.topic_id);
        setDndSubTopic(initialValues.sub_topic_id);
        setDndQuestionCategory(initialValues.question_category || "Practice");

        // Fresh data fetch for real IDs (essential for tagging)
        if (isTestPackContext && (initialValues.question_id || initialValues.id)) {
          const qId = initialValues.question_id || initialValues.id;
          const baseUrl = import.meta.env.VITE_API_URL;
          fetch(`${baseUrl}/api/test-pack/dnd/get/${qId}`)
            .then(res => res.json())
            .then(dndData => {
              // console.log("✅ [useDnDModalState] Fetched fresh DND data:", dndData);
              if (dndData.buckets) setDndBuckets(convertBuckets(dndData.buckets, detectedSubtype));
              if (dndData.choices) {
                const convertedChoices = convertChoices(dndData.choices);
                setDndChoices(convertedChoices);
                
                // Tagging sync in batch
                const tagType = "test_pack";
                const idsToFetch = dndData.choices.map((c: any) => c.id).filter(Boolean);
                
                if (idsToFetch.length > 0) {
                  fetchBatchChoiceTags(idsToFetch, tagType).then(batchData => {
                    const newTagSlots: Record<string, TagSlot[]> = {};
                    dndData.choices.forEach((choice: any, idx: number) => {
                      if (choice.id) {
                        const tags = batchData[String(choice.id)] || [];
                        if (tags.length > 0) {
                          newTagSlots[idx] = tags.map(t => ({
                            tag_id: t.tag_id,
                            tag_name: t.tag_name || "",
                            tag_category: t.tag_category || "",
                            rationale: t.rationale || ""
                          }));
                        }
                      }
                    });
                    setChoiceTagSlots(prev => ({ ...prev, ...newTagSlots }));
                  });
                }
              }
              if (dndData.assignments && dndData.buckets && dndData.choices) {
                const assignmentMap = buildAssignmentMap(dndData.assignments, dndData.buckets, dndData.choices, detectedSubtype);
                setDndCorrectAssignments(assignmentMap);
                setPreviewAssignments(assignmentMap);
              }
            })
            .catch(err => console.error("❌ Error fetching fresh DND details:", err));
        } else if (!isTestPackContext && (initialValues.id || initialValues.question_id)) {
          // Question Bank tagging logic in batch
          const idsToFetch = initialValues.choices.map((c: any) => c.id).filter(Boolean);
          if (idsToFetch.length > 0) {
            fetchBatchChoiceTags(idsToFetch, "pre_shsat").then(batchData => {
              const newTagSlots: Record<string, TagSlot[]> = {};
              initialValues.choices.forEach((choice: any, idx: number) => {
                if (choice.id) {
                  const tags = batchData[String(choice.id)] || [];
                  if (tags.length > 0) {
                    newTagSlots[idx] = tags.map(t => ({
                      tag_id: t.tag_id,
                      tag_name: t.tag_name || "",
                      tag_category: t.tag_category || "",
                      rationale: t.rationale || ""
                    }));
                  }
                }
              });
              setChoiceTagSlots(prev => ({ ...prev, ...newTagSlots }));
            });
          }
        }
        setHasPrefilled(true);
      }
    } 
    // Case 2: New question (or draft)
    else if (isOpen && !initialValues && !hasPrefilled) {
      const draft = loadDraftFromLocalStorage(istestpack, editingId);
      if (draft) {
        // console.log('🔄 Restoring DND draft');
        setDndQuestion(draft.dndQuestion || "");
        setDndBuckets(draft.dndBuckets || getInitialBuckets(dndSubtype));
        setDndChoices(draft.dndChoices || getInitialChoices());
        setDndCorrectAssignments(draft.dndCorrectAssignments || {});
        setDndExplanation(draft.dndExplanation || "");
        setDndDifficulty(draft.dndDifficulty || 3);
        setTableColumnHeaders(draft.tableColumnHeaders || ["Row", "Answer"]);
        setDndChapter(draft.dndChapter);
        setDndTopic(draft.dndTopic);
        setDndSubTopic(draft.dndSubTopic);
        setDndQuestionCategory(draft.dndQuestionCategory || "Practice");
      } else {
        // Reset state for new questions
        setDndQuestion("");
        setDndBuckets(getInitialBuckets(dndSubtype));
        setDndChoices(getInitialChoices());
        setDndCorrectAssignments({});
        setDndExplanation("");
        setDndDifficulty(3);
        setTableColumnHeaders(["Row", "Answer"]);
        setDndChapter(undefined);
        setDndTopic(undefined);
        setDndSubTopic(undefined);
        setDndQuestionCategory("Practice");
      }
      setHasPrefilled(true);
    }
  }, [isOpen, initialValues, hasPrefilled, dndSubtype, istestpack, editingId]);

  // Reset prefill flag when modal opens/closes or initialValues change
  useEffect(() => {
    if (isOpen) {
      // console.log("🔍 [useDnDModalState] Modal opened, resetting hasPrefilled flag");
      setHasPrefilled(false);
    }
  }, [isOpen, initialValues]);

  // DND Valid
  const getDndValid = (subtype: string) => {
    // For one bucket variants, be more lenient with choices requirement
    const minChoices = (subtype === "one_bucket_multi" || subtype === "one_bucket_single") ? 1 : 2;

    const basicValid =
      typeof dndQuestion === "string" &&
      dndQuestion.trim().length > 0 &&
      dndBuckets.length >= 1 &&
      dndChoices.length >= minChoices &&
      dndChoices.every(
        (c: any) => c && typeof c.label === "string" && c.label.trim().length > 0
      );

    // If we're editing, be more lenient
    if (initialValues) {
      // console.log("🔍 [getDndValid] Editing mode - using lenient validation");
      return basicValid; // Allow save if basic structure is valid
    }

    /* console.log("🔍 [getDndValid] Validation check:", {
      subtype,
      dndQuestion: dndQuestion?.substring(0, 50) + "...",
      dndBuckets: dndBuckets.length,
      dndChoices: dndChoices.length,
      minChoices,
      basicValid,
      initialValues: !!initialValues,
      bucketLabels: dndBuckets.map((b: any) => b?.label),
      choiceLabels: dndChoices.map((c: any) => c?.label)
    }); */
    if (subtype === "table_dnd") {
      // For editing mode, be more lenient
      if (initialValues) {
        return basicValid; // Allow save if basic structure is valid
      }

      // For creating new questions, use stricter validation
      return (
        basicValid &&
        dndBuckets.length >= 2 &&
        dndBuckets.every(
          (b: any) => b && typeof b.label === "string" && b.label.trim().length > 0
        ) &&
        tableColumnHeaders &&
        tableColumnHeaders[0] && tableColumnHeaders[0].trim().length > 0 &&
        tableColumnHeaders[1] && tableColumnHeaders[1].trim().length > 0
      );
    } else if (subtype === "one_bucket_multi" || subtype === "one_bucket_single") {
      // More lenient validation for one bucket variants, especially for editing
      const hasQuestion = typeof dndQuestion === "string" && dndQuestion.trim().length > 0;
      const hasBasicStructure = dndBuckets.length >= 1 || dndChoices.length >= 1;

      /* console.log("🔍 [getDndValid] One bucket validation:", {
        subtype,
        hasQuestion,
        hasBasicStructure,
        dndBuckets: dndBuckets.length,
        dndChoices: dndChoices.length,
        initialValues: !!initialValues
      }); */

      // For editing mode, be more lenient
      if (initialValues) {
        const result = hasQuestion || hasBasicStructure;
        // console.log("🔍 [getDndValid] Editing mode result:", result);
        return result; // Allow save if either question has content or there's basic structure
      }

      // For creating new questions, use more lenient validation
      const hasValidQuestion = typeof dndQuestion === "string" && dndQuestion.trim().length > 0;
      const hasValidBuckets = dndBuckets.length >= 1 &&
        dndBuckets[0] &&
        typeof dndBuckets[0].label === "string" &&
        dndBuckets[0].label.trim().length > 0;
      const hasValidChoices = dndChoices.length >= 1 &&
        dndChoices.every((c: any) => c && typeof c.label === "string" && c.label.trim().length > 0);

      const result = hasValidQuestion && hasValidBuckets && hasValidChoices;
      /* console.log("🔍 [getDndValid] Creating mode result:", {
        hasValidQuestion,
        hasValidBuckets,
        hasValidChoices,
        result
      }); */

      // For one bucket multi, don't require assignments to be set up yet
      return result;
    } else {
      return (
        basicValid &&
        dndBuckets.length === 2 &&
        dndBuckets.every(
          (b: any) => b && typeof b.label === "string" && b.label.trim().length > 0
        ) &&
        dndCorrectAssignments[0]?.length > 0 &&
        dndCorrectAssignments[1]?.length > 0
      );
    }
  };
  const dndValid = getDndValid(effectiveSubtype);

  /* console.log("🔍 [useDnDModalState] Current state for validation:", {
    dndValid,
    dndSubtype,
    effectiveSubtype,
    dndQuestion: dndQuestion?.substring(0, 50) + "...",
    dndBuckets: dndBuckets.length,
    dndChoices: dndChoices.length,
    hasPrefilled,
    initialValues: !!initialValues,
    isOpen
  }); */

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Save logic
  const save = async () => {
    if (isSaving) return;
    setIsSaving(true);
    // Validate hierarchy fields for question bank questions
    if (!istestpack && !initialValues) {
      if (!dndQuestionCategory) {
        toast.error("Question category is required.");
        return;
      }
      if (!dndChapter) {
        toast.error("Chapter is required.");
        return;
      }
      if (!dndTopic) {
        toast.error("Topic is required.");
        return;
      }
      if (!dndSubTopic) {
        toast.error("Sub-topic is required.");
        return;
      }
    }

    try {
      const userName = useAuthStore.getState().getUserName();
      const baseUrl = import.meta.env.VITE_API_URL;
      let endpoint = "";
      let method = initialValues ? "PUT" : "POST";
      let payload = {};

      // Check if this is test pack context
      const isTestPack = Boolean(initialValues?.test_id || istestpack);

      if (isTestPack) {
        // Test pack logic continues as before...
        if (initialValues?.question_id) {
          // Update existing test pack DND question - use specific endpoints based on subtype
          switch (dndSubtype) {
            case "two_buckets_single":
              endpoint = `${baseUrl}/api/test-pack/dnd/two-buckets-single/${initialValues.question_id}`;
              break;
            case "two_buckets_multi":
              endpoint = `${baseUrl}/api/test-pack/dnd/two-buckets-multi/${initialValues.question_id}`;
              break;
            case "one_bucket_multi":
              endpoint = `${baseUrl}/api/test-pack/dnd/one-bucket-multi/${initialValues.question_id}`;
              break;
            case "one_bucket_single":
              endpoint = `${baseUrl}/api/test-pack/dnd/one-bucket-single/${initialValues.question_id}`;
              break;
            case "table_dnd":
              endpoint = `${baseUrl}/api/test-pack/dnd/table_dnd/put/${initialValues.question_id}`;
              break;
            default:
              // Fallback to generic endpoint for unknown subtypes
              endpoint = `${baseUrl}/api/test-pack/dnd/put/${initialValues.question_id}`;
              break;
          }
          method = "PUT";
          // For updates, the backend deletes all existing data and recreates it,
          // so we use array indices just like creates (not database IDs)
          payload = {
            question: dndQuestion,
            question_type: "DND",
            question_subtype: dndSubtype,
            question_image_url: questionImageUrl,
            buckets: dndBuckets.map((bucket: any, idx: number) => ({ ...bucket, bucket_order: idx })),
            choices: dndChoices.map((choice: any, idx: number) => ({ ...choice, choice_order: idx })),
            assignments: Object.entries(dndCorrectAssignments).flatMap(
              ([bucketIdx, choiceIndices]) =>
                choiceIndices.map((choiceIdx) => ({
                  bucket_id: Number(bucketIdx),
                  choice_id: choiceIdx,
                }))
            ),
            explanation: dndExplanation,
            test_id: initialValues?.test_id,
            difficulty: dndDifficulty,
            is_active: initialValues?.is_active || false,
            created_by: userName,
            last_edited_by: userName,
            subject: subject,
            question_category_id: categoryId && categoryId !== "" ? Number(categoryId) : null,
            column_headers: tableColumnHeaders,
          };
        } else {
          switch (dndSubtype) {
            case "two_buckets_single":
              endpoint = `${baseUrl}/api/test-pack/dnd/create/two-buckets-single`;
              break;
            case "two_buckets_multi":
              endpoint = `${baseUrl}/api/test-pack/dnd/create/two-buckets-multi`;
              break;
            case "one_bucket_multi":
              endpoint = `${baseUrl}/api/test-pack/dnd/create/one-bucket-multi`;
              break;
            case "one_bucket_single":
              endpoint = `${baseUrl}/api/test-pack/dnd/create/one-bucket-single`;
              break;
            case "table_dnd":
              endpoint = `${baseUrl}/api/test-pack/dnd/create/table-dnd`;
              break;
            default:
              throw new Error("Unknown DND subtype for test pack");
          }
          method = "POST";
          // For creates, use array indices (backend will map to new IDs)
          payload = {
            question: dndQuestion,
            question_type: "DND",
            question_subtype: dndSubtype,
            question_image_url: questionImageUrl,
            buckets: dndBuckets.map((bucket: any, idx: number) => ({ ...bucket, bucket_order: idx })),
            choices: dndChoices.map((choice: any, idx: number) => ({ ...choice, choice_order: idx })),
            assignments: Object.entries(dndCorrectAssignments).flatMap(
              ([bucketIdx, choiceIndices]) =>
                choiceIndices.map((choiceIdx) => ({
                  bucket_id: Number(bucketIdx),
                  choice_id: choiceIdx,
                }))
            ),
            explanation: dndExplanation,
            test_id: initialValues?.test_id,
            difficulty: dndDifficulty,
            is_active: initialValues?.is_active || false,
            created_by: userName,
            last_edited_by: userName,
            subject: subject,
            ...(categoryId ? { question_category_id: Number(categoryId) } : {}),
          };
        }
        // Add column_headers for table_dnd questions
        if (dndSubtype === "table_dnd") {
          (payload as any).column_headers = tableColumnHeaders;
        }
      } else if (initialValues?.id) {
        endpoint = `${baseUrl}/api/pre-shsat/dnd-questions/${initialValues.id}`;
        method = "PUT";
        payload = {
          question: dndQuestion,
          question_type: "DND",
          question_subtype: dndSubtype,
          question_image_url: questionImageUrl,
          buckets: dndBuckets.map((bucket: any, idx: number) => ({ ...bucket, bucket_order: idx })),
          choices: dndChoices.map((choice: any, idx: number) => ({ ...choice, choice_order: idx })),
          assignments: Object.entries(dndCorrectAssignments).flatMap(
            ([bucketIdx, choiceIndices]) =>
              choiceIndices.map((choiceIdx) => ({
                bucket_id: Number(bucketIdx),
                choice_id: choiceIdx,
              }))
          ),
          explanation: dndExplanation,
          difficulty: dndDifficulty,
          created_by: userName,
          last_edited_by: userName,
          // Hierarchy fields for question bank
          question_category: dndQuestionCategory,
          chapter_number: dndChapter,
          topic_id: dndTopic,
          sub_topic_id: dndSubTopic,
        };
      } else {
        switch (dndSubtype) {
          case "two_buckets_single":
            endpoint = `${baseUrl}/api/pre-shsat/dnd-questions/dnd_single`;
            break;
          case "two_buckets_multi":
            endpoint = `${baseUrl}/api/pre-shsat/dnd-questions/dnd_multi`;
            break;
          case "one_bucket_multi":
            endpoint = `${baseUrl}/api/pre-shsat/dnd-questions/dnd_one_bucket_multi`;
            break;
          case "one_bucket_single":
            endpoint = `${baseUrl}/api/pre-shsat/dnd-questions/dnd_one_bucket_single`;
            break;
          case "table_dnd":
            endpoint = `${baseUrl}/api/pre-shsat/dnd-questions/table_dnd`;
            break;
          default:
            throw new Error("Unknown DND subtype for question bank");
        }
        method = "POST";
        payload = {
          question: dndQuestion,
          question_type: "DND",
          question_subtype: dndSubtype,
          question_image_url: questionImageUrl,
          buckets: dndBuckets.map((bucket: any, idx: number) => ({ ...bucket, bucket_order: idx })),
          choices: dndChoices.map((choice: any, idx: number) => ({ ...choice, choice_order: idx })),
          assignments: Object.entries(dndCorrectAssignments).flatMap(
            ([bucketIdx, choiceIndices]) =>
              choiceIndices.map((choiceIdx) => ({
                bucket_id: Number(bucketIdx),
                choice_id: choiceIdx,
              }))
          ),
          explanation: dndExplanation,
          difficulty: dndDifficulty,
          created_by: userName,
          last_edited_by: userName,
          // Hierarchy fields for question bank
          question_category: dndQuestionCategory,
          chapter_number: dndChapter,
          topic_id: dndTopic,
          sub_topic_id: dndSubTopic,
        };
      }

      // console.log("📝 Sending DND payload:", JSON.stringify(payload, null, 2));
      // console.log("🎯 To endpoint:", endpoint);

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.detail || "Failed to save DND question");
      }

      const data = await response.json();
      toast.success(`DND question ${initialValues ? "updated" : "created"} successfully`);

      // Clear draft on successful save
      clearDraft();

      // Simple: After successful save, fetch the updated question data
      const questionId = initialValues?.question_id || data.question_id || data.id;
      if (isTestPack && questionId) {
        // console.log("🔄 [useDnDModalState] Fetching updated data for questionId:", questionId);

        // Use the generic DND get endpoint (works for all DND subtypes)
        const getEndpoint = `${baseUrl}/api/test-pack/dnd/get/${questionId}`;

        try {
          const fetchResponse = await fetch(getEndpoint);
          if (fetchResponse.ok) {
            const updatedData = await fetchResponse.json();
            // console.log("✅ [useDnDModalState] Fetched updated data:", updatedData);
            onSave(updatedData);
          } else {
            console.warn("⚠️ [useDnDModalState] Failed to fetch updated data, using response");
            onSave(data);
          }
        } catch (error) {
          console.error("❌ [useDnDModalState] Error fetching updated data:", error);
          onSave(data);
        }
      } else {
        onSave(data);
      }

      // Sync tags for each choice
      const savedChoices = data?.choices || data?.choice_details || [];
      if (Array.isArray(savedChoices) && savedChoices.length > 0) {
        const type = istestpack ? "test_pack" : "pre_shsat";
        const tagPromises = savedChoices.map((choice: any, idx: number) => {
          const slots = choiceTagSlots[idx] || [];
          if (slots.length > 0 && slots.some(s => s.tag_name.trim())) {
            const validTags = slots
              .filter(s => s.tag_name.trim())
              .map((s, i) => ({
                tag_id: s.tag_id,
                tag_name: s.tag_name.trim(),
                tag_category: s.tag_category.trim() || undefined,
                tag_order: (i + 1) as 1 | 2 | 3,
                rationale: s.rationale,
              }));
            
            const targetId = choice.id;
            // console.log(`🔍 [DnDModal] Syncing tags for choice [${idx}] using ID: ${targetId}`);
            return saveChoiceTags(targetId, type, validTags);
          }
          return Promise.resolve();
        });
        let tagsFailed = false;
        await Promise.all(tagPromises).catch(err => {
          console.warn("DND tag sync failed:", err);
          tagsFailed = true;
        });

        if (tagsFailed) {
          toast.warning("Question saved, but some reasoning patterns (tags) failed to save. Please review the tags.");
        }
      }

      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save DND question");
    } finally {
      setIsSaving(false);
    }
  };

  // Choice and bucket handlers
  const addDndChoice = () => {
    setDndChoices([...dndChoices, { label: "", choice_order: dndChoices.length }]);
  };
  const removeDndChoice = (idx: number) => {
    setDndChoices(dndChoices.filter((_: any, i: number) => i !== idx));
    setDndCorrectAssignments((prev: Record<number, number[]>) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((bucketIdx: string) => {
        const bucketId = Number(bucketIdx);
        updated[bucketId] = updated[bucketId]
          .filter((choiceIdx: number) => choiceIdx !== idx)
          .map((choiceIdx: number) => (choiceIdx > idx ? choiceIdx - 1 : choiceIdx));
      });
      return updated;
    });
    // poolChoices is now calculated via useMemo, no need to update it manually
    setPreviewAssignments((prev: Record<number, number[]>) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((bucketIdx: string) => {
        const bucketId = Number(bucketIdx);
        updated[bucketId] = updated[bucketId]
          .filter((choiceIdx: number) => choiceIdx !== idx)
          .map((choiceIdx: number) => (choiceIdx > idx ? choiceIdx - 1 : choiceIdx));
      });
      return updated;
    });
  };
  const updateDndChoice = (idx: number, label: string) => {
    setDndChoices(dndChoices.map((c: any, i: number) => (i === idx ? { ...c, label } : c)));
  };
  const updateDndBucket = (idx: number, label: string) => {
    setDndBuckets(dndBuckets.map((b: any, i: number) => (i === idx ? { ...b, label } : b)));
  };

  // Add and remove bucket functions
  const addDndBucket = () => {
    // console.log("🔍 [useDnDModalState] addDndBucket called. Current buckets:", dndBuckets.length);
    const newBucket = {
      label: `Row ${dndBuckets.length + 1}`,
      bucket_order: dndBuckets.length,
    };
    // console.log("🔍 [useDnDModalState] Adding new bucket:", newBucket);
    setDndBuckets([...dndBuckets, newBucket]);
  };

  const removeDndBucket = (idx: number) => {
    // console.log("🔍 [useDnDModalState] removeDndBucket called. Index:", idx, "Current buckets:", dndBuckets.length, "Subtype:", dndSubtype);
    // For table_dnd, allow removing buckets as long as we have at least 2
    // For other types, maintain the existing logic
    const minBuckets = dndSubtype === "table_dnd" ? 2 : 2;
    if (dndBuckets.length <= minBuckets) {
      // console.log("🔍 [useDnDModalState] Cannot remove bucket - minimum reached");
      return;
    }

    const newBuckets = dndBuckets.filter((_: any, i: number) => i !== idx);
    // Update bucket orders
    newBuckets.forEach((bucket: any, newIdx: number) => {
      bucket.bucket_order = newIdx;
    });
    setDndBuckets(newBuckets);

    // Remove assignments for this bucket
    setDndCorrectAssignments((prev) => {
      const updated = { ...prev };
      delete updated[idx];
      // Shift down assignments for buckets after the removed one
      Object.keys(updated).forEach((bucketIdx) => {
        const bucketId = Number(bucketIdx);
        if (bucketId > idx) {
          updated[bucketId - 1] = updated[bucketId];
          delete updated[bucketId];
        }
      });
      return updated;
    });

    // Update preview assignments
    setPreviewAssignments((prev) => {
      const updated = { ...prev };
      delete updated[idx];
      // Shift down assignments for buckets after the removed one
      Object.keys(updated).forEach((bucketIdx) => {
        const bucketId = Number(bucketIdx);
        if (bucketId > idx) {
          updated[bucketId - 1] = updated[bucketId];
          delete updated[bucketId];
        }
      });
      return updated;
    });
  };

  // Add a resetDnDState function
  const resetDnDState = () => {
    setDndQuestion("");
    setDndBuckets(getInitialBuckets(effectiveSubtype));
    setDndChoices([
      { label: "2", choice_order: 0 },
      { label: "3", choice_order: 1 },
      { label: "4", choice_order: 2 },
      { label: "5", choice_order: 3 },
    ]);
    setDndCorrectAssignments(getInitialAssignments(effectiveSubtype));
    setDndExplanation("");
    setDndDifficulty(3);
    setPreviewAssignments(getInitialPreviewAssignments(effectiveSubtype));
    setTableColumnHeaders(["Row", "Answer"]);
  };

  // Enhanced close handler that clears draft
  const handleClose = useCallback(() => {
    clearDraft();
    onClose();
  }, [clearDraft, onClose]);

  return {
    dndQuestion,
    setDndQuestion,
    dndBuckets,
    setDndBuckets,
    dndChoices,
    setDndChoices,
    dndCorrectAssignments,
    setDndCorrectAssignments,
    dndExplanation,
    setDndExplanation,
    questionImageUrl,
    setQuestionImageUrl,
    poolChoices,
    setPoolChoices: () => { }, // No-op since poolChoices is calculated via useMemo
    previewAssignments,
    setPreviewAssignments,
    addDndChoice,
    removeDndChoice,
    updateDndChoice,
    updateDndBucket,
    addDndBucket,
    removeDndBucket,
    dndDifficulty,
    setDndDifficulty,
    dndValid,
    getDndValid,
    save,
    isSaving,
    tableColumnHeaders,
    setTableColumnHeaders,
    resetDnDState,
    clearDraft,
    handleClose,
    // Hierarchy fields
    dndChapter,
    setDndChapter,
    dndTopic,
    setDndTopic,
    dndSubTopic,
    setDndSubTopic,
    dndQuestionCategory,
    setDndQuestionCategory,
    // Tagging
    choiceTagSlots,
    setChoiceTagSlots,
    // Return the effective subtype for the form to use
    dndSubtype: effectiveSubtype,
  };
}
