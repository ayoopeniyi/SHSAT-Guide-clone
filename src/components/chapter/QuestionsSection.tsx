import { useState } from "react";
import { Question } from "../../lib/types";
import { Search, Filter, ChevronRight } from "lucide-react";
import {
  renderBlankQuestionPreview,
  renderFillBoxQuestion,
} from "../../utils/blankQuestionUtils";

interface QuestionsSectionProps {
  questions: Question[];
}

export function QuestionsSection({ questions }: QuestionsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [blankAnswers, setBlankAnswers] = useState<{ [key: number]: string }>(
    {},
  );
  const questionTypes = [
    "all",
    ...new Set(questions.map((q) => q.question_type)),
  ];

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.content
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === "all" || question.question_type === selectedType;
    return matchesSearch && matchesType;
  });

  // Helper function to render question content based on type
  const renderQuestionContent = (question: Question) => {
    if (question.question_type === "BLANK") {
      return (
        <div className="mb-4">
          {(question as any).question_category === "fill_box"
            ? renderFillBoxQuestion(question.content, {
                disabled: false,
                showInstruction: true,
                instructionClassName: "text-sm text-gray-600 italic",
                value: blankAnswers[question.id] || "",
                onChange: (value) =>
                  setBlankAnswers((prev) => ({
                    ...prev,
                    [question.id]: value,
                  })),
                placeholder: "Enter your answer here...",
              })
            : renderBlankQuestionPreview(question.content, {
                showInstruction: true,
                instructionClassName: "text-sm text-gray-600 italic",
              })}
        </div>
      );
    }

    // Default rendering for other question types
    return <p className="text-gray-900 mb-4">{question.content}</p>;
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Questions</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              {questionTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {filteredQuestions.map((question, index) => (
          <div key={question.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-gray-500">
                Question {index + 1}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {question.question_type}
              </span>
            </div>
            {renderQuestionContent(question)}
            <div className="mt-4 pt-4 border-t">
              <details className="group">
                <summary className="list-none cursor-pointer">
                  <div className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
                    Show Answer
                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-open:rotate-90" />
                  </div>
                </summary>
                <div className="mt-3 text-gray-700">
                  <p className="font-medium">Answer: {question.answer}</p>
                  {question.explanation && (
                    <p className="mt-2 text-sm text-gray-600">
                      {question.explanation}
                    </p>
                  )}
                </div>
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
