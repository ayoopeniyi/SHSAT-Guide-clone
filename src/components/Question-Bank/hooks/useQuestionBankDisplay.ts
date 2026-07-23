import { useMemo } from 'react';
import type { Question } from '../../../types/questionBank';

interface UseQuestionBankDisplayProps {
  questions: Question[];
  displayPassages: any[];
  isShowingPassages: boolean;
  totalQuestions: number;
  totalPassages: number;
  questionsPerPage: number;
  currentPage: number;
}

export const useQuestionBankDisplay = ({
  questions,
  displayPassages,
  isShowingPassages,
  totalQuestions,
  totalPassages,
  questionsPerPage,
  currentPage,
}: UseQuestionBankDisplayProps) => {
  // Calculate pagination values
  const totalPages = useMemo(() => {
    const total = isShowingPassages ? totalPassages : totalQuestions;
    return Math.max(1, Math.ceil(total / questionsPerPage));
  }, [isShowingPassages, totalPassages, totalQuestions, questionsPerPage]);

  const indexOfFirstItem = useMemo(() => {
    return (currentPage - 1) * questionsPerPage;
  }, [currentPage, questionsPerPage]);

  const indexOfLastItem = useMemo(() => {
    const total = isShowingPassages ? totalPassages : totalQuestions;
    const itemsInCurrentView = isShowingPassages ? displayPassages.length : questions.length;
    return Math.min(
      indexOfFirstItem + itemsInCurrentView,
      total
    );
  }, [indexOfFirstItem, isShowingPassages, totalPassages, totalQuestions, displayPassages.length, questions.length]);

  return {
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
  };
}; 