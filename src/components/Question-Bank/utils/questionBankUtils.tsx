// questionBankUtils.ts - Utility functions for Question Bank
import React from "react";
import { QuestionType } from "./questionBank";

/**
 * Render a badge with specified text and color
 */
export const renderBadge = (text: string, color: string) => (
  <span
    className={`px-2 py-0.5 rounded text-xs font-medium bg-${color}-100 text-${color}-800 mr-1 mb-1 inline-block`}
  >
    {text}
  </span>
);

/**
 * Get display name for question type
 */
export const getQuestionTypeDisplayName = (type: QuestionType): string => {
  return type === "MC_STANDARD"
    ? "Multiple Choice"
    : type === "MC_DRAG_DROP"
      ? "Drag & Drop (MC)"
      : type === "MA"
        ? "Multi-Answer"
        : type === "BLANK_PLACEHOLDER"
          ? "Blank/Fill-in"
          : type === "BLANK_FILL_BOX"
            ? "Drag & Drop (Fill Box)"
            : type === "TABLE_GRID"
              ? "Table Grid (Matrix)"
            : type === "DND_TWO_BUCKETS_SINGLE"
              ? "DnD (2 Buckets, Single)"
              : type === "DND_TWO_BUCKETS_MULTI"
                ? "DnD (2 Buckets, Multi)"
                : "DnD (1 Bucket, Multi)";
};

/**
 * Highlight passage regions (from HotTextReviewCard)
 */
export const getHighlightedPassage = (passage: string, regions: any[]) => {
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

/**
 * Reset passage question types to default values
 */
export const getDefaultPassageQuestionTypes = (): Record<QuestionType, number> => ({
  MC_STANDARD: 0,
  MC_DRAG_DROP: 0,
  MA: 0,
  BLANK_PLACEHOLDER: 0,
  BLANK_FILL_BOX: 0,
  TABLE_GRID: 0,
  DND_TWO_BUCKETS_SINGLE: 0,
  DND_TWO_BUCKETS_MULTI: 0,
  DND_ONE_BUCKET_MULTI: 0,
});

/**
 * Check if a question has all required fields for editing
 */
export const hasAllRequiredFields = (question: any, questionType: string): boolean => {
  switch (questionType) {
    case "RAY_SELECTOR":
      return (
        question.numberline_min !== undefined &&
        question.numberline_max !== undefined &&
        question.tick_interval !== undefined
      );
    case "DND":
      return question.buckets && question.dnd_choices && question.assignments;
    case "TABLE_GRID":
      return question.row_labels && question.column_labels && question.answer_matrix;
    case "GRAPH_SELECTOR":
      return (
        (question as any).x_min !== undefined &&
        (question as any).x_max !== undefined &&
        (question as any).y_min !== undefined &&
        (question as any).y_max !== undefined &&
        (question as any).points
      );
    default:
      return true;
  }
}; 