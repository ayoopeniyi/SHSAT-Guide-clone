import { useState, useEffect } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { toast } from "sonner";

export function useTFModalState(initialValues: any, isOpen: boolean, onSave: (data: any) => void, onClose: () => void, istestpack: boolean, subject?: string, categoryId?: string) {
  // State
  const [tfQuestion, setTfQuestion] = useState("");
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);
  const [tfExplanation, setTfExplanation] = useState("");
  const [questionImageUrl, setQuestionImageUrl] = useState<string | undefined>(undefined);
  const [tfDifficulty, setTfDifficulty] = useState<number>(3);
  const [hasPrefilled, setHasPrefilled] = useState(false);

  // Hierarchy fields for question bank
  const [tfChapter, setTfChapter] = useState<number | undefined>(undefined);
  const [tfTopic, setTfTopic] = useState<number | undefined>(undefined);
  const [tfSubTopic, setTfSubTopic] = useState<number | undefined>(undefined);
  const [tfQuestionCategory, setTfQuestionCategory] = useState<string>("Practice");

  // Prefill logic
  useEffect(() => {
    if (
      isOpen &&
      initialValues &&
      (initialValues.question_type === "TF" || initialValues.question_type_acronym === "TF") &&
      !hasPrefilled
    ) {
      setTfQuestion(initialValues.question || "");
      setTfExplanation(initialValues.explanation || "");
      setQuestionImageUrl(initialValues.question_image_url || undefined);
      if (initialValues.answer !== undefined) {
        const answerStr = String(initialValues.answer).toLowerCase();
        setTfAnswer(answerStr === "true" || answerStr === "1");
      }
      setTfDifficulty(initialValues.difficulty || 3);
      // Load hierarchy fields
      setTfChapter(initialValues.chapter_number);
      setTfTopic(initialValues.topic_id);
      setTfSubTopic(initialValues.sub_topic_id);
      setTfQuestionCategory(initialValues.question_category || "Practice");
      setHasPrefilled(true);
    }
  }, [isOpen, initialValues, hasPrefilled]);

  // Reset state when creating new questions
  useEffect(() => {
    if (isOpen && !initialValues && !hasPrefilled) {
      setTfQuestion("");
      setTfAnswer(null);
      setTfExplanation("");
      setTfDifficulty(3);
      // Reset hierarchy fields
      setTfChapter(undefined);
      setTfTopic(undefined);
      setTfSubTopic(undefined);
      setTfQuestionCategory("Practice");
      setHasPrefilled(true);
    }
  }, [isOpen, initialValues, hasPrefilled]);

  // Reset prefill flag when modal opens/closes or initialValues change
  useEffect(() => {
    if (isOpen) setHasPrefilled(false);
  }, [isOpen, initialValues]);

  const tfValid = tfQuestion.trim().length > 0 && tfAnswer !== null;

  // Save logic
  const save = async () => {
    try {
      const userName = useAuthStore.getState().getUserName();
      const baseUrl = import.meta.env.VITE_API_URL;
      let endpoint = "";
      let method = initialValues ? "PUT" : "POST";
      let payload = {};

      if (initialValues?.test_id) {
        // Test pack context
        if (initialValues?.question_id) {
          endpoint = `${baseUrl}/api/test-pack/tf/put/${initialValues.question_id}`;
          method = "PUT";
        } else {
          endpoint = `${baseUrl}/api/test-pack/tf/create`;
          method = "POST";
        }
        payload = {
          question: tfQuestion,
          answer: tfAnswer,
          explanation: tfExplanation,
          question_image_url: questionImageUrl,
          difficulty: tfDifficulty,
          test_id: initialValues.test_id,
          created_by: userName,  // Always set created_by for test pack questions
          last_edited_by: userName,
        };
        // For test pack creation, include subject and question_category_id if both are provided and not editing
        if (!initialValues?.question_id && subject && categoryId) {
          (payload as any).subject = subject;
          (payload as any).question_category_id = Number(categoryId);
        }
      } else if (initialValues?.id) {
        endpoint = `${baseUrl}/api/pre-shsat/questions/${initialValues.id}`;
        method = "PUT";
        payload = {
          question: tfQuestion,
          answer: tfAnswer,
          explanation: tfExplanation,
          question_image_url: questionImageUrl,
          difficulty: tfDifficulty,
          created_by: userName,  // Always set created_by for test pack questions
          last_edited_by: userName,
          // Hierarchy fields for question bank
          question_category: tfQuestionCategory,
          chapter_number: tfChapter,
          topic_id: tfTopic,
          sub_topic_id: tfSubTopic,
        };
      } else {
        endpoint = `${baseUrl}/api/pre-shsat/questions/tf`;
        method = "POST";
        payload = {
          question: tfQuestion,
          answer: tfAnswer,
          explanation: tfExplanation,
          question_image_url: questionImageUrl,
          difficulty: tfDifficulty,
          created_by: userName,
          last_edited_by: userName,
          // Hierarchy fields for question bank
          question_category: tfQuestionCategory,
          chapter_number: tfChapter,
          topic_id: tfTopic,
          sub_topic_id: tfSubTopic,
        };
      }

      // For new questions (POST), explicitly exclude id field
      if (method === "POST" && payload.id) {
        delete payload.id;
        /* console.log("🔒 Removed id field from payload for new TF question creation"); */
      }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.detail || "Failed to save TF question");
      }
      const data = await response.json();
      toast.success(`TF question ${initialValues ? "updated" : "created"} successfully`);
      onSave(data);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save TF question");
    }
  };

  return {
    tfQuestion,
    setTfQuestion,
    tfAnswer,
    setTfAnswer,
    tfExplanation,
    setTfExplanation,
    questionImageUrl,
    setQuestionImageUrl,
    tfDifficulty,
    setTfDifficulty,
    tfValid,
    save,
    // Hierarchy fields
    tfChapter,
    setTfChapter,
    tfTopic,
    setTfTopic,
    tfSubTopic,
    setTfSubTopic,
    tfQuestionCategory,
    setTfQuestionCategory,
  };
}

