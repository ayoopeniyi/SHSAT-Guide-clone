import { X } from "lucide-react";

interface PassageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPassageData: any;
  onAddMoreQuestions: () => void;
}

export const PassageDetailsModal = ({
  isOpen,
  onClose,
  selectedPassageData,
  onAddMoreQuestions,
}: PassageDetailsModalProps) => {
  if (!isOpen || !selectedPassageData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <style>{`body { overflow: hidden !important; }`}</style>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Passage #{selectedPassageData.passage.id}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedPassageData.passage.topic_title || "No Topic"} •
              {selectedPassageData.passage.sub_topic_title
                ? ` ${selectedPassageData.passage.sub_topic_title} •`
                : ""}
              {selectedPassageData.total_questions} questions
            </p>
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
          <div className="space-y-6">
            {/* Passage Text */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Passage Text
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedPassageData.passage.passage}
                </p>
              </div>
            </div>

            {/* Passage Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Topic</h4>
                <p className="text-blue-700">
                  {selectedPassageData.passage.topic_title || "Not assigned"}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Sub-topic</h4>
                <p className="text-green-700">
                  {selectedPassageData.passage.sub_topic_title || "Not assigned"}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Pages</h4>
                <p className="text-purple-700">
                  {selectedPassageData.passage.start_page &&
                  selectedPassageData.passage.end_page
                    ? `${selectedPassageData.passage.start_page}-${selectedPassageData.passage.end_page}`
                    : "Not specified"}
                </p>
              </div>
            </div>

            {/* Questions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Questions ({selectedPassageData.total_questions})
              </h3>
              {selectedPassageData.questions &&
              selectedPassageData.questions.length > 0 ? (
                <div className="space-y-3">
                  {selectedPassageData.questions.map(
                    (question: any, index: number) => (
                      <div
                        key={question.id}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-gray-500">
                                Q{question.question_number || index + 1}
                              </span>
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                {question.question_type}
                              </span>
                              {question.question_category && (
                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                  {question.question_category}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-900">
                              {question.question || "No question text"}
                            </p>

                            {/* Show choices for MC/MA questions */}
                            {question.choices_list &&
                              question.choices_list.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-gray-700 mb-2">
                                    Choices:
                                  </p>
                                  <div className="space-y-1">
                                    {question.choices_list.map((choice: any) => (
                                      <div
                                        key={choice.id}
                                        className="flex items-center gap-2 text-sm"
                                      >
                                        <span
                                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                            choice.is_correct
                                              ? "bg-green-100 text-green-800"
                                              : "bg-gray-100 text-gray-600"
                                          }`}
                                        >
                                          {choice.choice_label}
                                        </span>
                                        <span
                                          className={
                                            choice.is_correct
                                              ? "text-green-700 font-medium"
                                              : "text-gray-600"
                                          }
                                        >
                                          {choice.choice_text}
                                        </span>
                                        {choice.is_correct && (
                                          <span className="text-xs text-green-600">
                                            ✓ Correct
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {/* Show DND data for DND questions */}
                            {question.question_type === "DND" &&
                              question.dnd_buckets && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-gray-700 mb-2">
                                    DND Structure:
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-xs font-medium text-gray-600 mb-1">
                                        Buckets:
                                      </p>
                                      <div className="space-y-1">
                                        {question.dnd_buckets.map(
                                          (bucket: any) => (
                                            <div
                                              key={bucket.id}
                                              className="text-sm text-gray-700"
                                            >
                                              • {bucket.label}
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-gray-600 mb-1">
                                        Choices:
                                      </p>
                                      <div className="space-y-1">
                                        {question.dnd_choices.map(
                                          (choice: any) => (
                                            <div
                                              key={choice.id}
                                              className="text-sm text-gray-700"
                                            >
                                              • {choice.label}
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No questions found for this passage.</p>
                  <p className="text-sm mt-2">
                    Use the "Add Questions to Passage" button to create questions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            onClick={onAddMoreQuestions}
          >
            Add More Questions
          </button>
        </div>
      </div>
    </div>
  );
}; 