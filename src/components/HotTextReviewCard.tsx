import React from "react";

export interface HotTextRegion {
  phrase: string;
  start_idx: number;
  end_idx: number;
  is_correct: boolean;
}

export interface HotTextQuestion {
  question: string;
  prompt: string;
  passage: string;
  regions: HotTextRegion[];
  difficulty?: number;
}

interface HotTextReviewCardProps {
  data: HotTextQuestion;
  onEdit?: () => void;
  onDelete?: () => void;
}

const getHighlightedPassage = (passage: string, regions: HotTextRegion[]) => {
  if (!regions || regions.length === 0) return passage;
  // Sort regions by start_idx
  const sorted = [...regions].sort((a, b) => a.start_idx - b.start_idx);
  const result: React.ReactNode[] = [];
  let lastIdx = 0;
  for (let i = 0; i < sorted.length; i++) {
    const { start_idx, end_idx, is_correct } = sorted[i];
    // Add text before the region
    if (lastIdx < start_idx) {
      result.push(passage.slice(lastIdx, start_idx));
    }
    // Add highlighted region
    const regionText = passage.slice(start_idx, end_idx);
    result.push(
      <span
        key={i}
        className={
          is_correct
            ? "bg-blue-100 text-blue-800 border-2 border-blue-500 rounded px-1"
            : "bg-red-100 text-red-800 border-2 border-red-500 rounded px-1"
        }
      >
        {regionText}
      </span>,
    );
    lastIdx = end_idx;
  }
  // Add any remaining text after the last region
  if (lastIdx < passage.length) {
    result.push(passage.slice(lastIdx));
  }
  return result;
};

const HotTextReviewCard: React.FC<HotTextReviewCardProps> = ({
  data,
  onEdit,
  onDelete,
}) => {
  // Debug logs for passage and regions
  /* console.log("Passage:", data.passage); */
  /* console.log("Regions:", data.regions); */
  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto space-y-4">
      <div className="text-base text-gray-900">{data.question}</div>
      <div className="text-gray-500 italic mb-2">{data.prompt}</div>
      <div className="whitespace-pre-line text-lg leading-relaxed">
        {getHighlightedPassage(data.passage, data.regions)}
      </div>
      <div className="flex gap-2 mt-4">
        {onEdit && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={onEdit}
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={onDelete}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default HotTextReviewCard;
