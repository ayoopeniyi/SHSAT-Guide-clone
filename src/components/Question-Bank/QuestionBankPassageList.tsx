import { Plus } from "lucide-react";
import { QuestionCard } from "../QuestionCard";
import { Passage } from "./actions";
import { Question } from "../../types/questionBank";

interface QuestionBankPassageListProps {
  passages: Passage[];
  questions: Question[];
  isShowingPassages: boolean;
  totalPassages: number;
  totalQuestions: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
}

const QuestionBankPassageList = ({ passages, questions, isShowingPassages, totalPassages, totalQuestions, indexOfFirstItem, indexOfLastItem }: QuestionBankPassageListProps) => {
  return (
    <main>
      <div className="flex-1 pb-16 pl-2">
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
          <div className="masonry-container w-full max-w-full overflow-hidden">
            <div className="masonry-grid">
              {isShowingPassages
                ? // Display passages
                  passages.map((passage) => (
                    <div key={passage.id} className="masonry-item">
                      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Passage #{passage.id}
                          </h3>
                          <div className="flex gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                              {passage.question_count} questions
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-gray-700 text-sm line-clamp-3">
                            {passage.passage?.substring(0, 200)}...
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {passage.topic_title && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                              {passage.topic_title}
                            </span>
                          )}
                          {passage.sub_topic_title && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                              {passage.sub_topic_title}
                            </span>
                          )}
                          {passage.start_page && passage.end_page && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                              Pages {passage.start_page}-{passage.end_page}
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            <div>
                              Created:{" "}
                              {new Date(
                                passage.created_at,
                              ).toLocaleDateString()}
                            </div>
                            <div>
                              Updated:{" "}
                              {new Date(
                                passage.updated_at,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <button
                            onClick={() => {}}
                            className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Add Questions
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                : // Display questions
                  questions.map((q) => (
                    <div key={q.id} className="masonry-item">
                      <QuestionCard
                        question={q}
                        onEditChoices={() => {}}
                        onEditQuestion={() => {}}
                        onDelete={() => {}}
                      />
                    </div>
                  ))}
            </div>
        </div>
      </div>
    </main>
  );
};

export default QuestionBankPassageList;