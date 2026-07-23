import { useCallback } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { useCacheStore } from '../../../stores/cacheStore';
import {
  updateQuestionText,
  updateMAQuestionText,
  deleteQuestion
} from '../../../actions/QuestionBankActions';
import { updateQuestionChoices } from '../../../actions/QuestionChoicesActions';
import { updateDndQuestion } from '../../../actions/DndQuestionActions';
import { updateHotTextQuestion } from '../../../actions/HotTextActions';
import { uploadChoiceImage } from '../../../actions/ImageActions';
import type { Question, Choice } from '../../../types/questionBank';
import { useToast } from '../../../components/ui/use-toast';

interface UseQuestionActionsProps {
  onRefresh: () => void;
  onCacheClear: () => void;
}

export const useQuestionActions = ({ onRefresh, onCacheClear }: UseQuestionActionsProps) => {
  const userName = useAuthStore.getState().getUserName();
  const { toast } = useToast();

  // Helper function to upload temporary choice images
  const uploadTemporaryChoiceImage = useCallback(async (choiceId: number, dataUrl: string) => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], "choice-image.png", { type: blob.type });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("last_edited_by", userName || "Unknown");

    const uploadResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/api/images/upload/choice/${choiceId}`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.detail || "Image upload failed");
    }

    const uploadData = await uploadResponse.json();
    if (!uploadData.success || !uploadData.image_url) {
      throw new Error("Invalid response from image upload");
    }

    return uploadData.image_url;
  }, [userName]);

  // Delete question
  const handleDeleteQuestion = useCallback(async (question: Question) => {
    try {
      await deleteQuestion(question.id);

      // Clear cache and refresh data after successful deletion
      onCacheClear();
      onRefresh();

      toast({
        title: "Question deleted",
        description: "The question has been successfully deleted.",
        variant: "default",
      });
    } catch (error: any) {
      if (error?.message?.includes('not found') || error?.message?.includes('404')) {
        toast({
          title: "Question not found",
          description: "This question may have already been deleted.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error deleting question",
          description: error?.message || "Unknown error",
          variant: "destructive",
        });
      }
      console.error("Error deleting question:", error);
    }
  }, [toast, onCacheClear, onRefresh]);

  // Update question text
  const handleUpdateQuestionText = useCallback(async (questionId: number, newText: string, explanation?: string | null) => {
    try {
      await updateQuestionText(questionId, newText, userName, undefined, explanation);
    } catch (error) {
      console.error("Error updating question:", error);
      throw error;
    }
  }, [userName]);

  // Update MA question text
  const handleUpdateMAQuestionText = useCallback(async (questionId: number, newText: string, explanation: string | null) => {
    try {
      await updateMAQuestionText(questionId, newText, explanation, userName);
      onCacheClear();
      onRefresh();
    } catch (error) {
      console.error("Error updating MA question:", error);
      throw error;
    }
  }, [userName, onCacheClear, onRefresh]);

  // Save choices (question type agnostic)
  const handleSaveChoices = useCallback(async (question: Question, choices: Choice[]) => {
    try {
      if (question.question_type === "DND") {
        // Handle DND questions with the DND endpoint
        const choiceIdToIndex = new Map();
        choices.forEach((choice, idx) => {
          if (choice.id) choiceIdToIndex.set(choice.id, idx);
        });

        const payload = {
          question: question.question,
          buckets: question.buckets?.map((b, idx) => ({
            label: b.label,
            bucket_order: idx,
            created_by: userName,
            last_edited_by: userName,
          })) || [],
          choices: choices.map((c, idx) => ({
            label: c.choice_label,
            choice_order: idx,
            created_by: userName,
            last_edited_by: userName,
          })),
          assignments: question.assignments?.map((a) => ({
            choice_id: choiceIdToIndex.get(a.choice_id),
            bucket_id: a.bucket_id,
            created_by: userName,
            last_edited_by: userName,
          })) || [],
          explanation: question.explanation || null,
        };
        await updateDndQuestion(question.id, payload, userName);
      } else {
        // Handle MC/MA/other questions with the standard endpoint
        const originalChoiceLabels = new Set(
          (question.choices || []).map(
            (c) => (c as any).choice_label ?? (c as any).letter,
          ),
        );
        const currentChoiceLabels = new Set(
          choices.map((c) => c.choice_label),
        );
        const deletedChoiceLabels = Array.from(originalChoiceLabels).filter(
          (label) => !currentChoiceLabels.has(label),
        );

        const responseData = await updateQuestionChoices(
          question.id,
          choices,
          deletedChoiceLabels,
          userName,
        );

        // After saving choices, handle temporary images for new choices
        const savedChoices = responseData.choices || [];
        for (let i = 0; i < choices.length; i++) {
          const choice = choices[i];
          const choiceImageUrl = (choice as any).choice_image_url;
          if (
            choiceImageUrl &&
            choiceImageUrl.startsWith("data:") &&
            !(choice as any).id
          ) {
            try {
              const savedChoice = savedChoices.find(
                (sc: any) => sc.choice_label === choice.choice_label,
              );
              if (savedChoice && savedChoice.id) {
                await uploadChoiceImage(savedChoice.id, choiceImageUrl, userName);
              }
            } catch (imageError) {
              // Don't throw here - choices were saved successfully, image is just a bonus
            }
          }
        }
      }

      onCacheClear();
      onRefresh();
    } catch (error) {
      console.error("Error saving choices:", error);
      throw error;
    }
  }, [userName, uploadTemporaryChoiceImage]);

  // Save Hot Text question
  const handleHotTextSave = useCallback(async (question: Question | null, data: any) => {
    try {
      if (question) {
        await updateHotTextQuestion(question.id, data, userName);
      } else {
        const payload = {
          ...data,
          created_by: userName,
          last_edited_by: userName,
        };
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/hot-text-question`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        if (!response.ok) throw new Error("Failed to save HOT_TEXT question");
      }

      onCacheClear();
      onRefresh();
    } catch (error) {
      console.error("Error saving Hot Text question:", error);
      throw error;
    }
  }, [userName, onCacheClear, onRefresh]);

  return {
    // Actions
    handleDeleteQuestion,
    handleUpdateQuestionText,
    handleUpdateMAQuestionText,
    handleSaveChoices,
    handleHotTextSave,
    uploadTemporaryChoiceImage,
  };
}; 