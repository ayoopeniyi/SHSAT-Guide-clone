import { X } from "lucide-react";
import { QuestionType } from "../../Question-Bank/utils/questionBank";

interface AddQuestionsToPassageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPassageId: number | null;
  passageState: any;
  passageQuestionTypes: Record<QuestionType, number>;
  onUpdateQuestionType: (type: QuestionType, value: number) => void;
  onAddQuestions: () => void;
  getQuestionTypeDisplayName: (type: QuestionType) => string;
}

export const AddQuestionsToPassageModal = ({
  isOpen,
  onClose,
  selectedPassageId,
  passageState,
  passageQuestionTypes,
  onUpdateQuestionType,
  onAddQuestions,
  getQuestionTypeDisplayName,
}: AddQuestionsToPassageModalProps) => {
  if (!isOpen || !selectedPassageId) return null;

  const selectedPassage = passageState.passages.find(
    (p: any) => p.id === selectedPassageId,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <style>{`body { overflow: hidden !important; }`}</style>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Add Questions to Passage #{selectedPassageId}
            </h2>
            {selectedPassage && (
              <p className="text-sm text-gray-600 mt-1">
                {selectedPassage.topic_title || "No Topic"} • Currently has{" "}
                {selectedPassage.question_count || 0} questions
              </p>
            )}
          </div>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select the number of questions to create for this passage:
            </p>
            {Object.entries(passageQuestionTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <label className="flex-1 text-sm font-medium text-gray-700">
                  {getQuestionTypeDisplayName(type as QuestionType)}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                    onClick={() =>
                      onUpdateQuestionType(
                        type as QuestionType,
                        Math.max(0, count - 1),
                      )
                    }
                    disabled={count === 0}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={count}
                    onChange={(e) =>
                      onUpdateQuestionType(
                        type as QuestionType,
                        Math.max(0, parseInt(e.target.value) || 0),
                      )
                    }
                    className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                    min="0"
                  />
                  <button
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                    onClick={() =>
                      onUpdateQuestionType(type as QuestionType, count + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            onClick={onAddQuestions}
          >
            Create Questions
          </button>
        </div>
      </div>
    </div>
  );
}; 