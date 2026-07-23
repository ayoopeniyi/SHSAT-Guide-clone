import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { MCChoice, MCVariant } from "../types";
import { toast } from "sonner";
import type { TagSlot } from "../../shared/ChoiceTagEditor";
import { saveChoiceTags } from "../../../services/tagService";

// Draft persistence utilities
const getDraftKey = (isTestPack: boolean, editingId?: string | number) => {
  const context = isTestPack ? 'testpack' : 'questionbank';
  const id = editingId ? `_${editingId}` : '';
  return `question_draft_MC_${context}${id}`;
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
      // Only use drafts that are less than 24 hours old
      if (Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
        return draft;
      } else {
        // Remove old draft
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

export function useMCModalState(initialValues: any, isOpen: boolean, onSave: (data: any) => void, onClose: () => void, istestpack: boolean, subject?: string, categoryId?: string) {
  // State (from useMCState)
  const [mcQuestion, setMcQuestion] = useState("");
  const [mcChoices, setMcChoices] = useState<MCChoice[]>([
    { letter: "A", value: { text: "", is_correct: false, choice_image_url: undefined } },
    { letter: "B", value: { text: "", is_correct: false, choice_image_url: undefined } },
  ]);
  const [mcExplanation, setMcExplanation] = useState("");
  const [mcVariant, setMcVariant] = useState<MCVariant>("standard");
  const [questionImageUrl, setQuestionImageUrl] = useState<string | undefined>(undefined);
  const [mcDifficulty, setMcDifficulty] = useState<number>(3);

  // New hierarchy fields for question bank
  const [mcChapter, setMcChapter] = useState<number | undefined>(undefined);
  const [mcTopic, setMcTopic] = useState<number | undefined>(undefined);
  const [mcSubTopic, setMcSubTopic] = useState<number | undefined>(undefined);
  const [mcQuestionCategory, setMcQuestionCategory] = useState<string>("Practice");

  const userName = useAuthStore.getState().getUserName();
  const [hasPrefilled, setHasPrefilled] = useState(false);
  // Per-choice tag slots (local during creation, saved post-question-save)
  const [choiceTagSlots, setChoiceTagSlots] = useState<Record<string, TagSlot[]>>(() => ({
    A: [],
    B: [],
  }));

  const editingId = initialValues?.id || initialValues?.question_id;
  const isCreating = !initialValues;

  // Save draft whenever state changes (only for new questions)
  const saveDraft = useCallback(() => {
    if (isCreating && isOpen) {
      const draftData = {
        mcQuestion,
        mcChoices,
        mcExplanation,
        mcVariant,
        questionImageUrl,
        mcDifficulty,
        mcChapter,
        mcTopic,
        mcSubTopic,
        mcQuestionCategory,
        choiceTagSlots,
        subject,
        categoryId
      };
      saveDraftToLocalStorage(draftData, istestpack, editingId);
    }
  }, [mcQuestion, mcChoices, mcExplanation, mcVariant, questionImageUrl, mcDifficulty, mcChapter, mcTopic, mcSubTopic, mcQuestionCategory, choiceTagSlots, subject, categoryId, isCreating, isOpen, istestpack, editingId]);

  // Auto-save draft when state changes
  useEffect(() => {
    if (isCreating && isOpen && hasPrefilled) {
      const timeoutId = setTimeout(saveDraft, 500); // Debounce saves
      return () => clearTimeout(timeoutId);
    }
  }, [saveDraft, isCreating, isOpen, hasPrefilled]);

  // Load draft on modal open (only for new questions)
  useEffect(() => {
    if (isOpen && isCreating && !hasPrefilled) {
      const draft = loadDraftFromLocalStorage(istestpack, editingId);
      if (draft) {
        // console.log('🔄 Restoring MC draft from localStorage');
        setMcQuestion(draft.mcQuestion || "");
        setMcChoices(draft.mcChoices || [
          { letter: "A", value: { text: "", is_correct: false, choice_image_url: undefined } },
          { letter: "B", value: { text: "", is_correct: false, choice_image_url: undefined } },
        ]);
        setMcExplanation(draft.mcExplanation || "");
        setMcVariant(draft.mcVariant || "standard");
        setQuestionImageUrl(draft.questionImageUrl);
        setMcDifficulty(draft.mcDifficulty || 3);
        // Load hierarchy fields
        setMcChapter(draft.mcChapter);
        setMcTopic(draft.mcTopic);
        setMcSubTopic(draft.mcSubTopic);
        setMcQuestionCategory(draft.mcQuestionCategory || "Practice");
        if (draft.choiceTagSlots) setChoiceTagSlots(draft.choiceTagSlots);
        // Don't restore subject/categoryId here as they're managed by parent component
      }
      setHasPrefilled(true);
    }
  }, [isOpen, isCreating, hasPrefilled, istestpack, editingId]);

  // Clear draft on successful save or modal close
  const clearDraft = useCallback(() => {
    if (isCreating) {
      clearDraftFromLocalStorage(istestpack, editingId);
    }
  }, [isCreating, istestpack, editingId]);

  // Prefill logic for editing
  useEffect(() => {
    if (
      isOpen &&
      initialValues &&
      (initialValues.question_type === "MC" ||
        initialValues.question_type_acronym === "MC")
    ) {
      setMcQuestion(initialValues.question || "");
      setMcExplanation(initialValues.explanation || "");
      setQuestionImageUrl(initialValues.question_image_url || undefined);
      setMcVariant((initialValues.question_subtype as MCVariant) || (initialValues.question_category as MCVariant) || "standard");
      // Load hierarchy fields for question bank
      setMcChapter(initialValues.chapter_number);
      setMcTopic(initialValues.topic_id);
      setMcSubTopic(initialValues.sub_topic_id);
      setMcQuestionCategory(initialValues.question_category || "Practice");
      // console.log("🔍 [useMCModalState] First RAW choice:", JSON.stringify(initialValues.choices?.[0], null, 2));
      if (initialValues.choices && Array.isArray(initialValues.choices)) {
        // Helper to strip HTML tags (answer_text from API may contain <p>...</p>)
        const stripHtml = (html: string) => html ? html.replace(/<[^>]*>/g, '').trim() : "";
        const convertedChoices = initialValues.choices.map((choice: any, idx: number) => ({
          letter: choice.choice_label || choice.letter || String.fromCharCode(65 + idx),
          value: {
            text: stripHtml(choice.answer_text || "") || choice.choice_text || choice.value?.text || choice.text || "",
            is_correct: choice.is_correct || choice.value?.is_correct || false,
            explanation: choice.answer_explanation || choice.explanation || choice.value?.explanation || "",
            choice_image_url: choice.choice_image_url || choice.value?.choice_image_url || undefined,
            id: choice.id || choice.value?.id || undefined,
          },
        }));
        // console.log("✅ [useMCModalState] Converted first choice:", JSON.stringify(convertedChoices[0], null, 2));
        setMcChoices(convertedChoices);
      }
      setMcDifficulty(initialValues.difficulty || 3);
      setHasPrefilled(true);
    }
    if (isOpen && !initialValues && !hasPrefilled) {
      // Reset state for new questions if no draft was loaded
      const draft = loadDraftFromLocalStorage(istestpack, editingId);
      if (!draft) {
        setMcQuestion("");
        setMcChoices([
          { letter: "A", value: { text: "", is_correct: false, choice_image_url: undefined } },
          { letter: "B", value: { text: "", is_correct: false, choice_image_url: undefined } },
        ]);
        setMcExplanation("");
        setMcVariant("standard");
        setQuestionImageUrl(undefined);
        setMcDifficulty(3);
      }
      setHasPrefilled(true);
    }
  }, [isOpen, initialValues, hasPrefilled, istestpack, editingId]);

  // Reset prefill flag when modal opens/closes
  useEffect(() => {
    if (isOpen) setHasPrefilled(false);
  }, [isOpen]);

  // MC logic
  const addMcChoice = () => {
    const nextLabel = String.fromCharCode(65 + mcChoices.length);
    setMcChoices([
      ...mcChoices,
      { letter: nextLabel, value: { text: "", is_correct: false, choice_image_url: undefined } },
    ]);
    // Initialize tag slot for the new label
    setChoiceTagSlots(prev => ({ ...prev, [nextLabel]: [] }));
  };

  const removeMcChoice = (idx: number) => {
    const choiceToRemove = mcChoices[idx];
    if (!choiceToRemove) return;

    setMcChoices(mcChoices.filter((_, i) => i !== idx));
    // Clean up tag slots for the removed label
    setChoiceTagSlots(prev => {
      const next = { ...prev };
      delete next[choiceToRemove.letter];
      return next;
    });
  };

  const updateMcChoice = (
    idx: number,
    field: "text" | "is_correct" | "explanation" | "choice_image_url",
    value: any,
  ) => {
    setMcChoices(
      mcChoices.map((c, i) => {
        if (i === idx) {
          const updatedValue = { ...c.value };
          if (field === "choice_image_url") {
            updatedValue.choice_image_url = value || undefined;
          } else {
            updatedValue[field] = value as never;
          }
          return { ...c, value: updatedValue };
        }
        return c;
      })
    );
  };

  const setCorrectChoice = (idx: number) => {
    setMcChoices(
      mcChoices.map((c, i) => ({
        ...c,
        value: { ...c.value, is_correct: i === idx },
      }))
    );
  };

  const mcValid =
    typeof mcQuestion === "string" &&
    mcQuestion.trim().length > 0 &&
    mcChoices.length >= 2 &&
    mcChoices.some((c) => c.value.is_correct) &&
    mcChoices.every(
      (c) =>
        c.value.text &&
        typeof c.value.text === "string" &&
        c.value.text.trim().length > 0,
    );

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Save logic
  const save = async () => {
    if (isSaving) return;
    setIsSaving(true);
    // Validate hierarchy fields for question bank questions
    if (!istestpack && !initialValues) {
      if (!mcQuestionCategory) {
        toast.error("Question category is required.");
        return;
      }
      if (!mcChapter) {
        toast.error("Chapter is required.");
        return;
      }
      if (!mcTopic) {
        toast.error("Topic is required.");
        return;
      }
      if (!mcSubTopic) {
        toast.error("Sub-topic is required.");
        return;
      }
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      let endpoint = "";
      let method = initialValues ? "PUT" : "POST";
      if (initialValues?.test_id) {
        if (initialValues?.question_id) {
          endpoint = `${baseUrl}/api/test-pack/mc/edit/${initialValues.question_id}`;
          method = "PUT";
        } else {
          endpoint = `${baseUrl}/api/test-pack/mc/create`;
          method = "POST";
        }
      } else if (initialValues?.id) {
        endpoint = `${baseUrl}/api/pre-shsat/questions/${initialValues.id}`;
        method = "PUT";
      } else {
        endpoint = `${baseUrl}/api/pre-shsat/questions/mc`;
        method = "POST";
      }
      const transformedChoices = mcChoices.map((choice) => ({
        letter: choice.letter,
        value: {
          text: choice.value.text,
          is_correct: choice.value.is_correct,
          explanation: choice.value.explanation,
          choice_image_url: choice.value.choice_image_url,
        },
      }));
      const correctAnswer = mcChoices.find((c) => c.value.is_correct)?.letter || "";
      const payload: any = {
        question: mcQuestion,
        choices: transformedChoices,
        correct_answer: correctAnswer,
        explanation: mcExplanation,
        question_type: "MC",
        question_subtype: mcVariant || "standard",
        question_image_url: questionImageUrl,
        difficulty: mcDifficulty,
        created_by: userName,  // Always set created_by for test pack questions
        last_edited_by: userName,
      };

      // Add hierarchy fields for question bank (non-test pack) questions
      if (!istestpack && !initialValues?.test_id) {
        payload.chapter_number = mcChapter;
        payload.topic_id = mcTopic;
        payload.sub_topic_id = mcSubTopic;
        payload.question_category = mcQuestionCategory; // Override with hierarchy category
        payload.question_subtype = mcVariant; // Add subtype for variants
      }
      if (initialValues?.test_id) {
        payload.test_id = initialValues.test_id;
        // If creating (not editing), include subject and question_category_id
        if (!initialValues?.question_id && subject && categoryId) {
          payload.subject = subject;
          payload.question_category_id = Number(categoryId);
        }
      }
      // Also handle fallback for istestpack create (no initialValues)
      if (!initialValues && istestpack && subject && categoryId) {
        payload.subject = subject;
        payload.question_category_id = Number(categoryId);
      }
      if (method === "POST" && payload.id) {
        delete payload.id;
        // console.log("🔒 Removed id field from payload for new question creation");
      }

      // console.log("🚀 MC API call endpoint:", endpoint);
      // console.log("📦 MC API call payload:", payload);
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.detail || "Failed to save MC question");
        return;
      }
      const data = await response.json();
      toast.success(`MC question ${initialValues ? "updated" : "created"} successfully`);

      // Save tags after question creation
      const savedQuestionId = data?.id || data?.question_id;
      const returnedChoices = data?.choice_details || data?.choices || [];

      // console.group("🏷️ MC Tag Persistence Flow");
      // console.log("Question ID:", savedQuestionId);
      // console.log("Returned Choices (Meta):", returnedChoices);
      // console.log("Local Tag Slots Map:", choiceTagSlots);

      if (savedQuestionId && Array.isArray(returnedChoices) && returnedChoices.length > 0) {
        const tagPromises = returnedChoices.map((choice: any) => {
          const letter = choice.choice_label || choice.letter;
          // Look up tags using the stable letter key
          const slots = choiceTagSlots[letter] ?? [];

          // console.log(`Choice ${letter}: Found ${slots.length} slots in local state.`);

          if (slots.some(s => s.tag_name.trim())) {
            const validTags = slots
              .filter(s => s.tag_name.trim())
              .map((s, i) => ({
                tag_id: s.tag_id,
                tag_name: s.tag_name.trim(),
                tag_category: (s.tag_category || "").trim() || undefined,
                tag_order: (i + 1) as 1 | 2 | 3,
                rationale: s.rationale,
              }));

            // console.log(`Choice ${letter} (ID ${choice.id}): Saving ${validTags.length} tags.`, validTags);
            return saveChoiceTags(choice.id, istestpack ? "test_pack" : "pre_shsat", validTags);
          }
          // console.log(`Choice ${letter}: No tags to save.`);
          return Promise.resolve();
        });

        let tagsFailed = false;
        await Promise.all(tagPromises).catch(err => {
          console.warn("Some tags failed to save after MC question creation:", err);
          tagsFailed = true;
        });

        if (tagsFailed) {
          toast.warning("Question saved, but some reasoning patterns (tags) failed to save.");
        }
      } else {
        // console.warn("Skipping tag save: missing question ID or choice details in response.");
      }
      // console.groupEnd();

      // Clear draft on successful save
      clearDraft();

      onSave(data);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save MC question");
    } finally {
      setIsSaving(false);
    }
  };

  // Enhanced close handler that clears draft
  const handleClose = useCallback(() => {
    clearDraft();
    onClose();
  }, [clearDraft, onClose]);

  // Image upload handlers (optional, can be passed in or handled here)

  return {
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
    questionImageUrl,
    setQuestionImageUrl,
    mcDifficulty,
    setMcDifficulty,
    // New hierarchy fields
    mcChapter,
    setMcChapter,
    mcTopic,
    setMcTopic,
    mcSubTopic,
    setMcSubTopic,
    mcQuestionCategory,
    setMcQuestionCategory,
    save,
    isSaving,
    clearDraft,
    handleClose,
    choiceTagSlots,
    setChoiceTagSlots,
  };
}
