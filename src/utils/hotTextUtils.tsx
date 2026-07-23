import React from "react";

interface HotTextRegion {
  phrase: string;
  start_idx: number;
  end_idx: number;
  is_correct: boolean;
}

export const getHighlightedPassage = (
  passage: string,
  regions: HotTextRegion[],
) => {
  if (!regions || regions.length === 0) return passage;

  const sorted = [...regions].sort((a, b) => a.start_idx - b.start_idx);
  const result: React.ReactNode[] = [];
  let lastIdx = 0;

  for (let i = 0; i < sorted.length; i++) {
    const { start_idx, end_idx, is_correct } = sorted[i];
    if (lastIdx < start_idx) {
      result.push(passage.slice(lastIdx, start_idx));
    }
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

  if (lastIdx < passage.length) {
    result.push(passage.slice(lastIdx));
  }

  return result;
};
