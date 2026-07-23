import React from "react";

interface ResultsSummaryProps {
  isShowingPassages: boolean;
  totalPassages: number;
  totalQuestions: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  isShowingPassages,
  totalPassages,
  totalQuestions,
  indexOfFirstItem,
  indexOfLastItem,
}) => {
  return (
    <div className="mb-4 text-gray-600 text-sm">
      Showing{" "}
      {isShowingPassages
        ? totalPassages === 0
          ? 0
          : indexOfFirstItem + 1
        : totalQuestions === 0
          ? 0
          : indexOfFirstItem + 1}{" "}
      - {indexOfLastItem} of{" "}
      {isShowingPassages ? totalPassages : totalQuestions}{" "}
      {isShowingPassages ? "passages" : "questions"}
    </div>
  );
}; 