import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Save } from 'lucide-react';
import { EditableBadge } from './EditableBadge';
import { useEditableBadges } from '../../hooks/useEditableBadges';
import { getQuestionTypeAcronym } from './utils';

interface Question {
  id: number;
  chapter_number?: number;
  chapter_title?: string;
  topic_id?: number;
  topic_title?: string;
  sub_topic_id?: number;
  sub_topic_title?: string;
  question_type?: string;
  question_subtype?: string;
  question_category?: string;
  [key: string]: any;
}

interface EditableMetaInfoSectionProps {
  question: Question;
  context?: "question-bank" | "test-pack";
}

export const EditableMetaInfoSection: React.FC<EditableMetaInfoSectionProps> = ({
  question,
  context = "question-bank"
}) => {
  // Handle case where question has chapter_title but no chapter_number
  // This can happen if the data is corrupted or incomplete
  const hasValidChapterNumber = question.chapter_number && typeof question.chapter_number === 'number';
  const hasValidChapterTitle = question.chapter_title && question.chapter_title.trim() !== '';

  // Only initialize with chapter data if we have both a valid number and title
  const initialChapter = (hasValidChapterNumber && hasValidChapterTitle)
    ? { id: question.chapter_number, title: question.chapter_title }
    : null;

  const {
    chapter,
    topic,
    subtopic,
    chapters,
    topics,
    subtopics,
    loading,
    hasUnsavedChanges,
    handleChapterChange,
    handleTopicChange,
    handleSubtopicChange,
    saveChanges,
  } = useEditableBadges({
    questionId: question.id,
    initialChapter,
    initialTopic: (question.topic_id && typeof question.topic_id === 'number' && question.topic_title)
      ? { id: question.topic_id, title: question.topic_title }
      : null,
    initialSubtopic: (question.sub_topic_id && typeof question.sub_topic_id === 'number' && question.sub_topic_title)
      ? { id: question.sub_topic_id, title: question.sub_topic_title }
      : null,
    context
  });

  // Debug logging to see what we're getting (moved after hook call)
  /* console.log('EditableMetaInfoSection - Question data:', {
    id: question.id,
    chapter_number: question.chapter_number,
    chapter_title: question.chapter_title,
    topic_id: question.topic_id,
    topic_title: question.topic_title,
    sub_topic_id: question.sub_topic_id,
    sub_topic_title: question.sub_topic_title
  }); */

  /* console.log('EditableMetaInfoSection - Chapters data:', {
    chapters: chapters,
    chaptersLength: chapters.length,
    chaptersLoading: loading.chapters
  }); */

  // Difficulty badge helper functions
  const getDifficultyColor = (difficulty: any) => {
    if (typeof difficulty === "number") {
      switch (difficulty) {
        case 1: return "bg-green-100 text-green-800 border-green-200";
        case 2: return "bg-lime-100 text-lime-800 border-lime-200";
        case 3: return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case 4: return "bg-orange-100 text-orange-800 border-orange-200";
        case 5: return "bg-red-100 text-red-800 border-red-200";
        default: return "bg-gray-100 text-gray-800 border-gray-200";
      }
    } else {
      const difficultyStr = String(difficulty).toUpperCase();
      switch (difficultyStr) {
        case 'VERY EASY':
        case 'EASY':
          return "bg-green-100 text-green-800 border-green-200";
        case 'MEDIUM':
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case 'HARD':
        case 'VERY HARD':
          return "bg-red-100 text-red-800 border-red-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    }
  };

  const getDifficultyText = (difficulty: any) => {
    if (typeof difficulty === "number") {
      const text = ({ 1: "Very Easy", 2: "Easy", 3: "Medium", 4: "Hard", 5: "Very Hard" } as any)[difficulty] || `Level ${difficulty}`;
      return `${difficulty} - ${text}`;
    }
    return String(difficulty);
  };

  return (
    <div className="text-xs text-gray-500 mb-2">
      {/* All badges in a single line */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Question Type Badge - Not editable */}
        {getQuestionTypeAcronym(question) && (
          <Badge variant="default" className="bg-purple-100 text-purple-800 font-medium">
            {getQuestionTypeAcronym(question) === "BLANK" && (question as any).question_category === "fill_box"
              ? "Blank Box Question"
              : getQuestionTypeAcronym(question) === "BLANK"
                ? "Blank Question"
                : `${getQuestionTypeAcronym(question)} Question`}
          </Badge>
        )}

        {/* Question Subtype Badge - Not editable */}
        {question.question_subtype && (
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 font-medium">
            {question.question_subtype === 'drag_drop' ? 'Drag & Drop' :
              question.question_subtype === 'standard' ? 'Standard' :
                question.question_subtype === 'two_buckets_single' ? 'Two Buckets Single' :
                  question.question_subtype === 'two_buckets_multi' ? 'Two Buckets Multi' :
                    question.question_subtype === 'one_bucket_multi' ? 'One Bucket Multi' :
                      question.question_subtype === 'one_bucket_single' ? 'One Bucket Single' :
                        question.question_subtype === 'table_dnd' ? 'Table DND' :
                          question.question_subtype === 'fill_box' ? 'Fill Box' :
                            question.question_subtype === 'single' ? 'Single Select' :
                              question.question_subtype === 'multiple' ? 'Multi Select' :
                                question.question_subtype}
          </Badge>
        )}

        {/* Question Category Badge - Not editable */}
        {question.question_category && question.question_category !== 'standard' && (
          <Badge variant="secondary" className={`font-medium capitalize ${question.question_category.toLowerCase() === 'drill'
            ? 'bg-orange-100 text-orange-800'
            : question.question_category.toLowerCase() === 'practice'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
            }`}>
            {question.question_category}
          </Badge>
        )}

        {/* Difficulty Badge - Not editable */}
        {question.difficulty && (
          <Badge variant={"default"} className={getDifficultyColor(question.difficulty)}>
            {getDifficultyText(question.difficulty)}
          </Badge>
        )}

        {/* Chapter Badge - Editable */}
        {context !== 'test-pack' && (
          <EditableBadge
            label="Chapter"
            value={chapter && chapter.id && chapter.title ? `Ch ${chapter.id}: ${chapter.title}` : null}
            badgeVariant="outline"
            badgeClassName="bg-gray-50 text-gray-700 border-gray-300"
            onRemove={() => handleChapterChange(null)}
            onAdd={handleChapterChange}
            options={chapters}
            disabled={loading.saving}
          />
        )}

        {/* Topic Badge - Editable */}
        {context !== 'test-pack' && (
          <EditableBadge
            label="Topic"
            value={topic?.title || null}
            badgeVariant="outline"
            badgeClassName="bg-blue-50 text-blue-700 border-blue-300"
            onRemove={() => handleTopicChange(null)}
            onAdd={handleTopicChange}
            options={topics}
            disabled={loading.saving || !chapter}
          />
        )}

        {/* Sub-topic Badge - Editable */}
        {context !== 'test-pack' && (
          <EditableBadge
            label="Sub-topic"
            value={subtopic?.title || null}
            badgeVariant="outline"
            badgeClassName="bg-green-50 text-green-700 border-green-300"
            onRemove={() => handleSubtopicChange(null)}
            onAdd={handleSubtopicChange}
            options={subtopics}
            disabled={loading.saving || !topic}
          />
        )}

        {/* Save Button - Only show when there are unsaved changes */}
        {hasUnsavedChanges && (
          <Button
            variant="outline"
            size="sm"
            onClick={saveChanges}
            disabled={loading.saving}
            className="h-6 px-2 text-xs bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
          >
            {loading.saving ? (
              <div className="h-3 w-3 border border-green-700 border-t-transparent rounded-full animate-spin mr-1" />
            ) : (
              <Save className="h-3 w-3 mr-1" />
            )}
            Save Changes
          </Button>
        )}
      </div>
    </div>
  );
};
