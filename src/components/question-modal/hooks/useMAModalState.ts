import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { toast } from "sonner";
import type { TagSlot } from "../../shared/ChoiceTagEditor";
import { saveChoiceTags } from "../../../services/tagService";

// Draft persistence utilities
const getDraftKey = (isTestPack: boolean, editingId?: string | number) => {
  const context = isTestPack ? 'testpack' : 'questionbank';
  const id = editingId ? `_${editingId}` : '';
  return `question_draft_MA_${context}${id}`;
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

export function useMAModalState(initialValues: any, isOpen: boolean, onSave: (data: any) => void, onClose: () => void, istestpack: boolean, subject?: string, categoryId?: string) {
  // State (from useMAState)
  const [maQuestion, setMaQuestion] = useState("");
  const [maChoices, setMaChoices] = useState([
    { choice_label: "A", choice_text: "", is_correct: false, explanation: "", choice_image_url: undefined, id: undefined },
    { choice_label: "B", choice_text: "", is_correct: false, explanation: "", choice_image_url: undefined, id: undefined },
    { choice_label: "C", choice_text: "", is_correct: false, explanation: "", choice_image_url: undefined, id: undefined },
  ]);
  const [maExplanation, setMaExplanation] = useState("");
  const [maDifficulty, setMaDifficulty] = useState<number>(3);
  const [questionImageUrl, setQuestionImageUrl] = useState<string | undefined>(undefined);
  const [hasPrefilled, setHasPrefilled] = useState(false);
  // Per-choice tag slots (local during creation)
  const [choiceTagSlots, setChoiceTagSlots] = useState<Record<string, TagSlot[]>>(() => ({
    A: [],
    B: [],
    C: [],
  }));

  // Hierarchy fields for question bank
  const [maChapter, setMaChapter] = useState<number | undefined>(undefined);
  const [maTopic, setMaTopic] = useState<number | undefined>(undefined);
  const [maSubTopic, setMaSubTopic] = useState<number | undefined>(undefined);
  const [maQuestionCategory, setMaQuestionCategory] = useState<string>("Practice");

  const editingId = initialValues?.id || initialValues?.question_id;
  const isCreating = !initialValues;

  // Save draft whenever state changes (only for new questions)
  const saveDraft = useCallback(() => {
    if (isCreating && isOpen) {
      const draftData = {
        maQuestion,
        maExplanation,
        maChoices,
        maDifficulty,
        questionImageUrl,
        maChapter,
        maTopic,
        maSubTopic,
        maQuestionCategory,
        choiceTagSlots,
        subject,
        categoryId
      };
      saveDraftToLocalStorage(draftData, istestpack, editingId);
    }
  }, [maQuestion, maExplanation, maChoices, maDifficulty, questionImageUrl, maChapter, maTopic, maSubTopic, maQuestionCategory, choiceTagSlots, subject, categoryId, isCreating, isOpen, istestpack, editingId]);

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

  // Prefill logic
  useEffect(() => {
    if (
      isOpen &&
      initialValues &&
      (initialValues.question_type === "MA" ||
        initialValues.question_type_acronym === "MA")
    ) {
      setMaQuestion(initialValues.question || "");
      setMaExplanation(initialValues.explanation || "");
      setQuestionImageUrl(initialValues.question_image_url || undefined);
      // console.log("🔍 [useMAModalState] First RAW choice:", JSON.stringify(initialValues.choices?.[0], null, 2));
      if (initialValues.choices && Array.isArray(initialValues.choices)) {
        // Helper to strip HTML tags (answer_text from API may contain <p>...</p>)
        const stripHtml = (html: string) => html ? html.replace(/<[^>]*>/g, '').trim() : "";
        const convertedChoices = initialValues.choices.map((choice: any, idx: number) => ({
          choice_label: choice.choice_label || String.fromCharCode(65 + idx),
          choice_text: stripHtml(choice.answer_text || "") || choice.choice_text || choice.text || "",
          is_correct: choice.is_correct || false,
          explanation: choice.answer_explanation || choice.explanation || "",
          choice_image_url: choice.choice_image_url || undefined,
          id: choice.id || undefined,
        }));
        // console.log("✅ [useMAModalState] Converted first choice:", JSON.stringify(convertedChoices[0], null, 2));
        setMaChoices(convertedChoices);
      }
      setMaDifficulty(initialValues.difficulty || 3);
      // Load hierarchy fields
      setMaChapter(initialValues.chapter_number);
      setMaTopic(initialValues.topic_id);
      setMaSubTopic(initialValues.sub_topic_id);
      setMaQuestionCategory(initialValues.question_category || "Practice");
      setHasPrefilled(true);
    }
    if (isOpen && !initialValues && !hasPrefilled) {
      // Try to load draft first
      const draft = loadDraftFromLocalStorage(istestpack, editingId);
      if (draft) {
        // console.log('🔄 Restoring MA draft from localStorage');
        setMaQuestion(draft.maQuestion || "");
        setMaExplanation(draft.maExplanation || "");
        setMaChoices(draft.maChoices || [
          { choice_label: "A", choice_text: "", is_correct: false, explanation: "", choice_image_url: undefined, id: undefined },
          { choice_label: "B", choice_text: "", is_correct: false, explanation: "", choice_image_url: undefined, id: undefined },
          { choice_label: "C", choice_text: "", is_correct: false, explanation: "", choice_image_url: undefined, id: undefined },
        ]);
        setMaDifficulty(draft.maDifficulty || 3);
        setQuestionImageUrl(draft.questionImageUrl);
        // Load hierarchy fields from draft
        setMaChapter(draft.maChapter);
        setMaTopic(draft.maTopic);
        setMaSubTopic(draft.maSubTopic);
        setMaQuestionCategory(draft.maQuestionCategory || "Practice");
      } else {
        // Reset to defaults if no draft
        setMaQuestion("");
        setMaExplanation("");
        setMaChoices([
          { choice_label: "A", choice_text: "", is_correct: false, explanation: "", choice_image_url: undefined, id: undefined },
          { choice_label: "B", choice_text: "", is_correct: false, explanation: "", choice_image_url: undefined, id: undefined },
          { choice_label: "C", choice_text: "", is_correct: false, explanation: "", choice_image_url: undefined, id: undefined },
        ]);
        setQuestionImageUrl(undefined);
        setMaDifficulty(3);
        // Reset hierarchy fields
        setMaChapter(undefined);
        setMaTopic(undefined);
        setMaSubTopic(undefined);
        setMaQuestionCategory("Practice");
      }
      setHasPrefilled(true);
    }
  }, [isOpen, initialValues, hasPrefilled, istestpack, editingId]);

  // Reset prefill flag when modal opens/closes or initialValues change
  useEffect(() => {
    if (isOpen) setHasPrefilled(false);
  }, [isOpen, initialValues]);

  // MA logic
  const addMaChoice = () => {
    const nextLabel = String.fromCharCode(65 + maChoices.length);
    setMaChoices([
      ...maChoices,
      { choice_label: nextLabel, choice_text: "", is_correct: false, explanation: "", choice_image_url: undefined, id: undefined },
    ]);
    // Initialize tag slot for the new label
    setChoiceTagSlots(prev => ({ ...prev, [nextLabel]: [] }));
  };

  const removeMaChoice = (idx: number) => {
    if (maChoices.length > 3) {
      const choiceToRemove = maChoices[idx];
      if (!choiceToRemove) return;

      setMaChoices(maChoices.filter((_, i) => i !== idx));
      // Clean up tag slots for the removed label
      setChoiceTagSlots(prev => {
        const next = { ...prev };
        delete next[choiceToRemove.choice_label];
        return next;
      });
    }
  };

  const updateMaChoice = (
    idx: number,
    field: "choice_text" | "is_correct" | "explanation" | "choice_image_url",
    value: any,
  ) => {
    setMaChoices(
      maChoices.map((c, i) => (i === idx ? { ...c, [field]: value } : c)),
    );
  };

  const maValid =
    typeof maQuestion === "string" &&
    maQuestion.length > 0 &&
    maChoices.length >= 3 &&
    maChoices.filter((c) => c.is_correct).length >= 2 &&
    maChoices.every(
      (c) =>
        c.choice_text &&
        typeof c.choice_text === "string" &&
        c.choice_text.trim().length > 0,
    );

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Save logic
  const save = async () => {
    if (isSaving) return;
    setIsSaving(true);
    // Validate hierarchy fields for question bank questions
    if (!istestpack && !initialValues) {
      if (!maQuestionCategory) {
        toast.error("Question category is required.");
        return;
      }
      if (!maChapter) {
        toast.error("Chapter is required.");
        return;
      }
      if (!maTopic) {
        toast.error("Topic is required.");
        return;
      }
      if (!maSubTopic) {
        toast.error("Sub-topic is required.");
        return;
      }
    }

    try {
      const userName = useAuthStore.getState().getUserName();
      const baseUrl = import.meta.env.VITE_API_URL;
      let endpoint = "";
      let method = initialValues ? "PUT" : "POST";
      if (initialValues?.test_id) {
        if (initialValues?.question_id) {
          endpoint = `${baseUrl}/api/test-pack/ma/put/${initialValues.question_id}`;
          method = "PUT";
        } else {
          endpoint = `${baseUrl}/api/test-pack/ma/create`;
          method = "POST";
        }
      } else if (initialValues?.id) {
        endpoint = `${baseUrl}/api/pre-shsat/questions/${initialValues.id}`;
        method = "PUT";
      } else {
        endpoint = `${baseUrl}/api/pre-shsat/questions/ma`;
        method = "POST";
      }
      const correctLabels = maChoices.filter((c) => c.is_correct).map((c) => c.choice_label).join(",");

      // Transform choices based on whether it's test pack or pre-shsat
      let transformedChoices;
      if (initialValues?.test_id) {
        // Test pack format: use choice_label, choice_text, is_correct
        transformedChoices = maChoices.map((choice) => ({
          choice_label: choice.choice_label,
          choice_text: choice.choice_text,
          is_correct: choice.is_correct,
          choice_image_url: choice.choice_image_url,
        }));
      } else {
        // Pre-shsat format: use letter and value (same as MC questions)
        transformedChoices = maChoices.map((choice) => ({
          letter: choice.choice_label,
          value: {
            text: choice.choice_text,
            is_correct: choice.is_correct,
            explanation: choice.explanation,
            choice_image_url: choice.choice_image_url,
          },
        }));
      }

      const payload: any = {
        question: maQuestion,
        question_type: "MA",
        question_image_url: questionImageUrl,
        choices: transformedChoices,
        correct_answer: correctLabels,
        answer: correctLabels,
        explanation: maExplanation,
        difficulty: maDifficulty,
        created_by: userName,  // Always set created_by for test pack questions
        last_edited_by: userName,
        // Hierarchy fields for question bank
        question_category: maQuestionCategory,
        chapter_number: maChapter,
        topic_id: maTopic,
        sub_topic_id: maSubTopic,
      };
      if (initialValues?.test_id) {
        payload.test_id = initialValues.test_id;
        // For test pack creation, include subject and question_category_id if both are provided and not editing
        if (!initialValues?.question_id && subject && categoryId) {
          payload.subject = subject;
          payload.question_category_id = Number(categoryId);
        }
        // Preserve current active state for edit operations
        if (initialValues?.question_id) {
          payload.is_active = initialValues.is_active;
        }
      }

      // For new questions (POST), explicitly exclude id field
      if (method === "POST" && payload.id) {
        delete payload.id;
        // console.log("🔒 Removed id field from payload for new MA question creation");
      }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.detail || "Failed to save MA question");
        return;
      }
      const data = await response.json();
      toast.success(`MA question ${initialValues ? "updated" : "created"} successfully`);

      // Save tags after question creation
      const newQuestionId = data?.id || data?.question_id;
      const returnedChoices = data?.choice_details || data?.choices || [];

      // console.group("🏷️ MA Tag Persistence Flow");
      // console.log("Question ID:", newQuestionId);
      // console.log("Returned Choices (Meta):", returnedChoices);
      // console.log("Local Tag Slots Map:", choiceTagSlots);

      if (newQuestionId && Array.isArray(returnedChoices) && returnedChoices.length > 0) {
        const tagPromises = returnedChoices.map((choice: any) => {
          const label = choice.choice_label || choice.label;
          // Look up tags using the stable label key
          const slots = choiceTagSlots[label] ?? [];

          // console.log(`Choice ${label}: Found ${slots.length} slots in local state.`);

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

            // console.log(`Choice ${label} (ID ${choice.id}): Saving ${validTags.length} tags.`, validTags);
            return saveChoiceTags(choice.id, istestpack ? "test_pack" : "pre_shsat", validTags);
          }
          // console.log(`Choice ${label}: No tags to save.`);
          return Promise.resolve();
        });

        let tagsFailed = false;
        await Promise.all(tagPromises).catch(err => {
          console.warn("Some tags failed to save after MA question creation:", err);
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
      toast.error(error instanceof Error ? error.message : "Failed to save MA question");
    } finally {
      setIsSaving(false);
    }
  };

  // Enhanced close handler that clears draft
  const handleClose = useCallback(() => {
    clearDraft();
    onClose();
  }, [clearDraft, onClose]);

  return {
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
    questionImageUrl,
    setQuestionImageUrl,
    maDifficulty,
    setMaDifficulty,
    save,
    isSaving,
    clearDraft,
    handleClose,
    // Hierarchy fields
    maChapter,
    setMaChapter,
    maTopic,
    setMaTopic,
    maSubTopic,
    setMaSubTopic,
    maQuestionCategory,
    setMaQuestionCategory,
    choiceTagSlots,
    setChoiceTagSlots,
  };
}

