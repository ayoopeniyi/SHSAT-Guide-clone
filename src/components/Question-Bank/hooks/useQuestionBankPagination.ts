import { useState, useCallback, useMemo } from 'react';

interface UseQuestionBankPaginationProps {
  totalQuestions: number;
  totalPassages: number;
  isShowingPassages: boolean;
  questionsPerPage: number;
}

export const useQuestionBankPagination = ({
  totalQuestions,
  totalPassages,
  isShowingPassages,
  questionsPerPage,
}: UseQuestionBankPaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);

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
    return Math.min(
      indexOfFirstItem + questionsPerPage,
      total
    );
  }, [indexOfFirstItem, isShowingPassages, totalPassages, totalQuestions, questionsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  return {
    // State
    currentPage,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    
    // Actions
    handlePageChange,
    resetToFirstPage,
    goToNextPage,
    goToPreviousPage,
  };
}; 