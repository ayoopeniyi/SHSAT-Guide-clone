import React, { useEffect, useRef } from "react";
import { QuestionCard } from "../QuestionCard";
import { Pagination } from "../shared/Pagination";
import { PassageCard } from "./PassageCard";
import { ResultsSummary } from "./ResultsSummary";
import { useQuestionBankDisplay } from "./hooks/useQuestionBankDisplay";
import type { Question } from "../../types/questionBank";

interface QuestionBankDisplayProps {
  isShowingPassages: boolean;
  displayPassages: any[];
  questions: Question[];
  totalPassages: number;
  totalQuestions: number;
  currentPage: number;
  questionsPerPage: number;
  onPageChange: (page: number) => void;
  onEditChoices: (question: Question) => void;
  onEditQuestion: (question: Question) => void;
  onEditPassage?: (question: Question) => void;
  onDeleteQuestion: (question: Question) => void;
  onAddQuestionsToPassage: (passageId: number) => void;
  deletingQuestionId?: number | null;
  isFetchingPage?: boolean;
}

export const QuestionBankDisplay: React.FC<QuestionBankDisplayProps> = ({
  isShowingPassages,
  displayPassages,
  questions,
  totalPassages,
  totalQuestions,
  currentPage,
  questionsPerPage,
  onPageChange,
  onEditChoices,
  onEditQuestion,
  onEditPassage,
  onDeleteQuestion,
  onAddQuestionsToPassage,
  deletingQuestionId,
  isFetchingPage,
}) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const { totalPages, indexOfFirstItem, indexOfLastItem } = useQuestionBankDisplay({
    questions,
    displayPassages,
    isShowingPassages,
    totalQuestions,
    totalPassages,
    questionsPerPage,
    currentPage,
  });

  // Smooth scroll to top of list on page change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);
  const renderPassageCard = (passage: any) => (
    <PassageCard
      key={passage.id}
      passage={passage}
      onAddQuestions={onAddQuestionsToPassage}
    />
  );

  const renderQuestionCard = (question: Question) => (
    <div key={question.id} className="masonry-item">
      <QuestionCard
        question={question}
        onEditChoices={onEditChoices}
        onEditQuestion={onEditQuestion}
        onEditPassage={onEditPassage}
        onDelete={() => onDeleteQuestion(question)}
        isDeleting={deletingQuestionId === question.id}
      />
    </div>
  );

  return (
    <div className="flex-1 pb-16 pl-2">
      <ResultsSummary
        isShowingPassages={isShowingPassages}
        totalPassages={totalPassages}
        totalQuestions={totalQuestions}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
      />
      {/* Move Pagination to the top */}
      <div className="mb-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          size="md"
        />
      </div>
      <div className="w-full max-w-full overflow-x-auto" ref={listRef}>
        <div className="flex flex-wrap gap-4">
          {isShowingPassages
            ? displayPassages.map(renderPassageCard)
            : questions.map(renderQuestionCard)}
        </div>
        {isFetchingPage && (
          <div className="mt-4 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}; 