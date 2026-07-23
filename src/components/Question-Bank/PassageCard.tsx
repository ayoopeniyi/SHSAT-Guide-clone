import React from "react";
import { Plus } from "lucide-react";

interface PassageCardProps {
  passage: {
    id: number;
    question_count: number;
    passage?: string;
    topic_title?: string;
    sub_topic_title?: string;
    start_page?: number;
    end_page?: number;
    created_at: string;
    updated_at: string;
  };
  onAddQuestions: (passageId: number) => void;
}

export const PassageCard: React.FC<PassageCardProps> = ({
  passage,
  onAddQuestions,
}) => {
  return (
    <div className="masonry-item">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4 ">
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
              {new Date(passage.created_at).toLocaleDateString()}
            </div>
            <div>
              Updated:{" "}
              {new Date(passage.updated_at).toLocaleDateString()}
            </div>
          </div>
          <button
            onClick={() => onAddQuestions(passage.id)}
            className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Questions
          </button>
        </div>
      </div>
    </div>
  );
}; 