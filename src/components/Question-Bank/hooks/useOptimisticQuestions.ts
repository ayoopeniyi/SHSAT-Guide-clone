import { useState, useEffect, useCallback } from 'react';
import type { Question } from '../../../types/questionBank';
import { useToast } from '../../ui/use-toast';

export function useOptimisticQuestions({
  questions,
  handleDeleteQuestion,
  handleUpdateQuestionChoices, // new prop
  handleUpdateQuestionText,
}: {
  questions: Question[];
  handleDeleteQuestion: (question: Question) => Promise<void>;
  handleUpdateQuestionChoices?: (question: Question, choices: any[]) => Promise<void>;
  handleUpdateQuestionText?: (questionId: number, newText: string) => Promise<void>;
}) {
  const [questionsState, setQuestionsState] = useState<Question[]>(questions);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setQuestionsState(questions);
  }, [questions]);

  const handleDeleteQuestionOptimistic = useCallback(async (question: Question) => {
    setDeletingQuestionId(question.id);
    setQuestionsState((prev) => prev.filter((q) => q.id !== question.id));
    try {
      await handleDeleteQuestion(question);
      // No need to do anything else, as the fetch will update the state
    } catch (error) {
      setQuestionsState((prev) => [...prev, question]);
      toast({
        title: "Error deleting question",
        description: (error as any)?.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setDeletingQuestionId(null);
    }
  }, [handleDeleteQuestion, toast]);

  // Optimistic update for editing choices
  const handleUpdateQuestionChoicesOptimistic = useCallback(
    async (question: Question, newChoices: any[]) => {
      if (!handleUpdateQuestionChoices) return;
      const prevQuestions = questionsState;
      setQuestionsState((prev) =>
        prev.map((q) =>
          q.id === question.id ? { ...q, choices: newChoices } : q
        )
      );
      try {
        await handleUpdateQuestionChoices(question, newChoices);
        // No need to do anything else, as the fetch will update the state
      } catch (error) {
        setQuestionsState(prevQuestions); // revert
        toast({
          title: "Error updating choices",
          description: (error as any)?.message || "Unknown error",
          variant: "destructive",
        });
      }
    },
    [handleUpdateQuestionChoices, questionsState, toast]
  );

  // Optimistic update for editing question text
  const handleUpdateQuestionTextOptimistic = useCallback(
    async (questionId: number, newText: string) => {
      if (!handleUpdateQuestionText) return;
      const prevQuestions = questionsState;
      setQuestionsState((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, question: newText } : q
        )
      );
      try {
        await handleUpdateQuestionText(questionId, newText);
        // No need to do anything else, as the fetch will update the state
      } catch (error) {
        setQuestionsState(prevQuestions); // revert
        toast({
          title: "Error updating question text",
          description: (error as any)?.message || "Unknown error",
          variant: "destructive",
        });
      }
    },
    [handleUpdateQuestionText, questionsState, toast]
  );

  return {
    questionsState,
    handleDeleteQuestionOptimistic,
    deletingQuestionId,
    handleUpdateQuestionChoicesOptimistic, // new
    handleUpdateQuestionTextOptimistic,
  };
} 