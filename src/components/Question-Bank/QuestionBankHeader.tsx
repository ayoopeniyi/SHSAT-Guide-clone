import React from "react";
import QuestionBankNav from "./QuestionBankNav";
import QuestionBankAddQuestion from "./QuestionBankAddQuestion";
import { QuestionBankHeaderStats } from "./QuestionBankHeaderStats";

interface QuestionBankHeaderProps {
  onOpenQuestionModal: () => void;
  chaptersLength: number;
  totalQuestions: number;
}

export const QuestionBankHeader: React.FC<QuestionBankHeaderProps> = ({
  onOpenQuestionModal,
  chaptersLength,
  totalQuestions,
}) => {
  return (
    <div className="pl-2 pr-4 pt-10 pb-4">
      <QuestionBankNav />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Question Bank
          </h1>
        </div>
        <div className="flex gap-2">
          <QuestionBankAddQuestion
            setShowQuestionModal={onOpenQuestionModal}
          />
        </div>
      </div>
      <QuestionBankHeaderStats
        chaptersLength={chaptersLength}
        totalQuestions={totalQuestions}
      />
    </div>
  );
};
