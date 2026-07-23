import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { toast } from "sonner";
import type { BlankVariant } from "./useBlankState";
import { TagSlot, EMPTY_SLOT } from "../../shared/ChoiceTagEditor";
import { fetchChoiceTags, saveChoiceTags } from "../../../services/tagService";

// Draft persistence utilities
const getDraftKey = (isTestPack: boolean, editingId?: string | number) => {
  const context = isTestPack ? 'testpack' : 'questionbank';
  const id = editingId ? `_${editingId}` : '';
  return `question_draft_BLANK_${context}${id}`;
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

export function useBlankModalState(initialValues: any, isOpen: boolean, onSave: (data: any) => void, onClose: () => void, istestpack: boolean, subject?: string, categoryId?: string) {
  // State
  const [blankQuestion, setBlankQuestion] = useState("");
  const [blankCorrectAnswer, setBlankCorrectAnswer] = useState("");
  const [blankExplanation, setBlankExplanation] = useState("");
  const [questionImageUrl, setQuestionImageUrl] = useState<string | undefined>(undefined);
  const [blankVariant, setBlankVariant] = useState<BlankVariant>("placeholder");
  const [blankDifficulty, setBlankDifficulty] = useState<number>(3);
  const [hasPrefilled, setHasPrefilled] = useState(false);

  // Hierarchy fields for question bank
  const [blankChapter, setBlankChapter] = useState<number | undefined>(undefined);
  const [blankTopic, setBlankTopic] = useState<number | undefined>(undefined);
  const [blankSubTopic, setBlankSubTopic] = useState<number | undefined>(undefined);
  const [blankQuestionCategory, setBlankQuestionCategory] = useState<string>("Practice");

  // Tagging state (Blank question uses question_id as the choice_id)
  const [choiceTagSlots, setChoiceTagSlots] = useState<TagSlot[]>([]);

  // Debug hierarchy field changes
  useEffect(() => {
    /* console.log("🔍 [BlankModal] Hierarchy fields changed:", {
      blankChapter,
      blankTopic,
      blankSubTopic,
      blankQuestionCategory,
      istestpack,
      initialValues: !!initialValues
    }); */
  }, [blankChapter, blankTopic, blankSubTopic, blankQuestionCategory, istestpack, initialValues]);

  const editingId = initialValues?.id || initialValues?.question_id;
  const isCreating = !initialValues;

  // Save draft whenever state changes (only for new questions)
  const saveDraft = useCallback(() => {
    if (isCreating && isOpen) {
      const draftData = {
        blankQuestion,
        blankCorrectAnswer,
        blankExplanation,
        blankVariant,
        blankDifficulty,
        blankChapter,
        blankTopic,
        blankSubTopic,
        blankQuestionCategory,
        subject,
        categoryId
      };
      saveDraftToLocalStorage(draftData, istestpack, editingId);
    }
  }, [blankQuestion, blankCorrectAnswer, blankExplanation, blankVariant, blankDifficulty, blankChapter, blankTopic, blankSubTopic, blankQuestionCategory, subject, categoryId, isCreating, isOpen, istestpack, editingId]);

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
    const qt = (initialValues?.question_type || initialValues?.question_type_acronym || "").toUpperCase();
    const isBlankType = ["BLANK", "GI", "RESP"].includes(qt);
    if (
      isOpen &&
      initialValues &&
      isBlankType &&
      !hasPrefilled
    ) {
      /* console.log("🔍 [BlankModal] Prefilling from initialValues:", initialValues); */
      /* console.log("🔍 [BlankModal] Hierarchy fields in initialValues:", {
        chapter_number: initialValues.chapter_number,
        topic_id: initialValues.topic_id,
        sub_topic_id: initialValues.sub_topic_id,
        question_category: initialValues.question_category
      }); */
      setBlankQuestion(initialValues.question || "");
      setBlankCorrectAnswer(initialValues.answer || initialValues.correct_answer || "");
      setBlankExplanation(initialValues.explanation || "");
      setQuestionImageUrl(initialValues.question_image_url || undefined);
      setBlankVariant((initialValues.question_category as BlankVariant) || "placeholder");
      setBlankDifficulty(initialValues.difficulty || 3);
      // Load hierarchy fields
      setBlankChapter(initialValues.chapter_number);
      setBlankTopic(initialValues.topic_id);
      setBlankSubTopic(initialValues.sub_topic_id);
      setBlankQuestionCategory(initialValues.question_category || "Practice");

      // Prefill Tags
      const qId = initialValues.id || initialValues.question_id;
      if (qId) {
        fetchChoiceTags(qId, istestpack ? "test_pack" : "pre_shsat")
          .then(tags => {
            if (tags.length > 0) {
              setChoiceTagSlots(tags.map(t => ({
                tag_id: t.tag_id,
                tag_name: t.tag_name || "",
                tag_category: t.tag_category || "",
                rationale: t.rationale || ""
              })));
            } else {
              setChoiceTagSlots([]);
            }
          })
          .catch(err => console.warn("Failed to fetch blank tags", err))
          .finally(() => {
            setHasPrefilled(true);
          });
      } else {
        setHasPrefilled(true);
      }
    }
    if (isOpen && !initialValues && !hasPrefilled) {
      // Try to load draft first
      const draft = loadDraftFromLocalStorage(istestpack, editingId);
      if (draft) {
        /* console.log('🔄 Restoring BLANK draft from localStorage'); */
        setBlankQuestion(draft.blankQuestion || "");
        setBlankCorrectAnswer(draft.blankCorrectAnswer || "");
        setBlankExplanation(draft.blankExplanation || "");
        setBlankVariant(draft.blankVariant || "placeholder");
        setBlankDifficulty(draft.blankDifficulty || 3);
        // Load hierarchy fields from draft
        setBlankChapter(draft.blankChapter);
        setBlankTopic(draft.blankTopic);
        setBlankSubTopic(draft.blankSubTopic);
        setBlankQuestionCategory(draft.blankQuestionCategory || "Practice");
      } else {
        // Reset to defaults if no draft
        /* console.log("🔍 [BlankModal] Initializing new blank question with defaults"); */
        setBlankQuestion("");
        setBlankCorrectAnswer("");
        setBlankExplanation("");
        setBlankVariant("placeholder");
        setBlankDifficulty(3);
        // Reset hierarchy fields
        setBlankChapter(undefined);
        setBlankTopic(undefined);
        setBlankSubTopic(undefined);
        setBlankQuestionCategory("Practice");
        setChoiceTagSlots([]);
      }
      setHasPrefilled(true);
    }
  }, [isOpen, initialValues, hasPrefilled, istestpack, editingId]);

  // Reset prefill flag when modal opens/closes or initialValues change
  useEffect(() => {
    if (isOpen) setHasPrefilled(false);
  }, [isOpen, initialValues]);

  // Validation
  const blankValid = typeof blankQuestion === "string" && blankQuestion.trim().length > 0;

  // Save logic
  const save = async () => {
    // Debug hierarchy fields
    /* console.log("🔍 [BlankModal] Hierarchy fields:", {
      blankQuestionCategory,
      blankChapter,
      blankTopic,
      blankSubTopic,
      istestpack,
      initialValues: !!initialValues
    }); */

    // Validate hierarchy fields for question bank questions
    if (!istestpack && !initialValues) {
      if (!blankQuestionCategory) {
        toast.error("Question category is required.");
        return;
      }
      if (!blankChapter) {
        toast.error("Chapter is required.");
        return;
      }
      if (!blankTopic) {
        toast.error("Topic is required.");
        return;
      }
      if (!blankSubTopic) {
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
      if (initialValues?.test_id) {
        // Test pack context
        if (initialValues?.question_id) {
          // Edit operation - do not include subject/category_id
          if (blankVariant === "placeholder") {
            endpoint = `${baseUrl}/api/test-pack/blank/placeholder/put/${initialValues.question_id}`;
          } else if (blankVariant === "fill_box") {
            endpoint = `${baseUrl}/api/test-pack/blank/fill-box/put/${initialValues.question_id}`;
          } else {
            throw new Error('Invalid blank question category. Must be either "placeholder" or "fill_box".');
          }
          method = "PUT";
          payload = {
            question: blankQuestion,
            question_type: "BLANK",
            question_category: blankVariant,
            question_image_url: questionImageUrl,
            correct_answer: blankCorrectAnswer,
            explanation: blankExplanation,
            difficulty: blankDifficulty,
            test_id: initialValues.test_id,
            is_active: initialValues.is_active,  // Preserve current active state
            last_edited_by: userName,
          };
        } else {
          // Create operation - include subject/category_id
          if (blankVariant === "placeholder") {
            endpoint = `${baseUrl}/api/test-pack/blank/create/placeholder`;
          } else if (blankVariant === "fill_box") {
            endpoint = `${baseUrl}/api/test-pack/blank/create/fill-box`;
          } else {
            throw new Error('Invalid blank question category. Must be either "placeholder" or "fill_box".');
          }
          method = "POST";
          payload = {
            question: blankQuestion,
            question_type: "BLANK",
            question_category: blankVariant,
            question_image_url: questionImageUrl,
            correct_answer: blankCorrectAnswer,
            explanation: blankExplanation,
            difficulty: blankDifficulty,
            test_id: initialValues.test_id,
            created_by: userName,  // Always set created_by for test pack questions
            last_edited_by: userName,
            subject: subject,
            question_category_id: Number(categoryId),
          };
        }
      } else if (initialValues?.id) {
        endpoint = `${baseUrl}/api/pre-shsat/questions/blank/${initialValues.id}`;
        method = "PATCH";
        payload = {
          question: blankQuestion,
          question_category: blankVariant,
          correct_answer: blankCorrectAnswer,
          explanation: blankExplanation,
          last_edited_by: userName,
          // Hierarchy fields for question bank - ensure they are included
          chapter_number: blankChapter || undefined,
          topic_id: blankTopic || undefined,
          sub_topic_id: blankSubTopic || undefined,
        };
      } else {
        endpoint = `${baseUrl}/api/pre-shsat/questions/blank`;
        method = "POST";
        payload = {
          question: blankQuestion,
          question_type: "BLANK",
          question_category: blankQuestionCategory || "Practice",
          correct_answer: blankCorrectAnswer,
          explanation: blankExplanation,
          difficulty: blankDifficulty,
          created_by: userName,
          last_edited_by: userName,
          // Hierarchy fields for question bank - ensure they are included
          chapter_number: blankChapter || undefined,
          topic_id: blankTopic || undefined,
          sub_topic_id: blankSubTopic || undefined,
        };
      }

      // For new questions (POST), explicitly exclude id field
      if (method === "POST" && 'id' in payload) {
        delete (payload as any).id;
        /* console.log("🔒 Removed id field from payload for new BLANK question creation"); */
      }

      // Debug payload
      /* console.log("🔍 [BlankModal] Payload being sent:", payload); */
      /* console.log("🔍 [BlankModal] Endpoint:", endpoint); */
      /* console.log("🔍 [BlankModal] Method:", method); */
      /* console.log("🔍 [BlankModal] Is test pack:", istestpack); */
      /* console.log("🔍 [BlankModal] Has initial values:", !!initialValues); */

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.detail || "Failed to save BLANK question");
      }
      const data = await response.json();
      const savedQuestionId = data.id || data.question_id || initialValues?.id || initialValues?.question_id;

      // Sync tags (using question_id as the choice_id for BLANK questions)
      if (savedQuestionId) {
        const validTags = choiceTagSlots
          .filter(s => s.tag_name.trim())
          .map((s, i) => ({
            tag_id: s.tag_id,
            tag_name: s.tag_name.trim(),
            tag_category: s.tag_category.trim() || undefined,
            tag_order: (i + 1) as 1 | 2 | 3,
            rationale: s.rationale
          }));

        await saveChoiceTags(savedQuestionId, istestpack ? "test_pack" : "pre_shsat", validTags);
      }

      toast.success(`BLANK question ${initialValues ? "updated" : "created"} successfully`);

      // Clear draft on successful save
      clearDraft();

      onSave(data);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save BLANK question");
    }
  };

  // Enhanced close handler that clears draft
  const handleClose = useCallback(() => {
    clearDraft();
    onClose();
  }, [clearDraft, onClose]);

  return {
    blankQuestion,
    setBlankQuestion,
    blankCorrectAnswer,
    setBlankCorrectAnswer,
    blankExplanation,
    setBlankExplanation,
    questionImageUrl,
    setQuestionImageUrl,
    blankVariant,
    setBlankVariant,
    blankDifficulty,
    setBlankDifficulty,
    blankValid,
    save,
    clearDraft,
    handleClose,
    // Hierarchy fields
    blankChapter,
    setBlankChapter,
    blankTopic,
    setBlankTopic,
    blankSubTopic,
    setBlankSubTopic,
    blankQuestionCategory,
    setBlankQuestionCategory,
    // Tagging
    choiceTagSlots,
    setChoiceTagSlots,
  };
}
