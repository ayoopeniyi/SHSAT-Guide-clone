import React from "react";
import { Book, FileText } from "lucide-react";

interface QuestionBankHeaderStatsProps {
  chaptersLength: number;
  totalQuestions: number;
}

export const QuestionBankHeaderStats: React.FC<QuestionBankHeaderStatsProps> = ({
  chaptersLength,
  totalQuestions,
}) => {
  return (
    <main>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Book className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Total Chapters</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">{chaptersLength}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Total Questions</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">{totalQuestions}</p>
        </div>
      </div>
    </main>
  );
}; 