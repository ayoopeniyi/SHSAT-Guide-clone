import { X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageUpload from "../../ImageUpload";
import { useAuthStore } from "../../../stores/authStore";
import type { Question } from "../../../types/questionBank";
import { useHierarchy } from "../../../hooks/useHierarchy";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";

export interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newText: string, imageUrl?: string, hierarchyData?: {
    chapter_number?: number;
    topic_id?: number;
    sub_topic_id?: number;
    question_category?: string;
  }, correctAnswer?: string, difficulty?: number, explanation?: string) => Promise<void>;
  question: Question | null;
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  question,
}) => {
  const [newQuestionText, setNewQuestionText] = useState("");
  const [questionImageUrl, setQuestionImageUrl] = useState<string | undefined>(undefined);
  const [questionCategory, setQuestionCategory] = useState<string>("Practice");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [difficulty, setIsDifficulty] = useState<number>(3)
  const userName = useAuthStore((s) => s.getUserName());
  const quillRef = useRef<ReactQuill>(null);

  // Initialize hierarchy hook with question's initial values
  const hierarchy = useHierarchy(
    question?.chapter_number,
    question?.topic_id,
    question?.sub_topic_id
  );

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    if (question) {
      setNewQuestionText(question.question || "");
      setQuestionImageUrl(question.question_image_url || undefined);
      setQuestionCategory(question.question_category || "Practice");
      setCorrectAnswer(question.answer || (question as any).correct_answer || "");
      setExplanation(question.explanation || "");
      // Ensure difficulty is a number (question.difficulty may be a string)
      const parsedDifficulty =
        question.difficulty === undefined || question.difficulty === null
          ? 3
          : typeof question.difficulty === "string"
            ? parseInt(question.difficulty, 10) || 3
            : question.difficulty;
      setIsDifficulty(parsedDifficulty);
    }
  }, [question]);

  // Hierarchy values are now set via useHierarchy hook initialization

  if (!isOpen) return null;

  const handleSave = async () => {
    const hierarchyData = {
      chapter_number: hierarchy.selectedChapter,
      topic_id: hierarchy.selectedTopic,
      sub_topic_id: hierarchy.selectedSubTopic,
      question_category: questionCategory,
    };

    /* console.log('Saving with hierarchy data:', hierarchyData); */
    /* console.log('Selected chapter:', hierarchy.selectedChapter); */
    /* console.log('Question chapter:', question?.chapter_number); */

    await onSave(newQuestionText, questionImageUrl, hierarchyData, correctAnswer, difficulty, explanation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onDragOver={(e) => { e.preventDefault(); }}
      onDrop={async (e) => {
        try {
          if (!e.dataTransfer?.files?.length) return;
          const file = e.dataTransfer.files[0];
          if (!file.type.startsWith('image/')) return;
          const dataUrl = await readFileAsDataUrl(file);
          setQuestionImageUrl(dataUrl);
        } catch { }
      }}
      onPaste={async (e) => {
        try {
          const item = Array.from(e.clipboardData?.items || []).find((i) => i.type.startsWith('image/'));
          if (!item) return;
          const file = item.getAsFile();
          if (!file) return;
          const dataUrl = await readFileAsDataUrl(file);
          setQuestionImageUrl(dataUrl);
        } catch { }
      }}
    >
      <style>{`body { overflow: hidden !important; }`}</style>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Question</h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
            <ReactQuill
              ref={quillRef}
              value={newQuestionText}
              onChange={setNewQuestionText}
              placeholder="Enter the question text..."
              theme="snow"
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ["bold", "italic", "underline", "strike"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["link"],
                  ["clean"],
                ],
              }}
              className="min-h-[140px]"
            />
          </div>

          <div className="mt-4">
            <Label htmlFor="explanation">Explanation (optional)</Label>
            <textarea
              id="explanation"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical min-h-[80px] mt-2"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Enter an explanation for the correct answer..."
            />
          </div>

          <div className="mt-4">
            <Label htmlFor="difficulty">Difficulty Level (1-5)</Label>
            <Input
              id="difficulty"
              type="number"
              min="1"
              max="5"
              value={difficulty}
              onChange={(e) => setIsDifficulty(Number(e.target.value))}
              placeholder="Enter difficulty level (1-5)"
            />
          </div>

          {/* Show correct answer field for BLANK questions */}
          {(question?.question_type === "BLANK_PLACEHOLDER" || question?.question_type === "BLANK_FILL_BOX" || question?.question_type === "BLANK") && (
            <div className="mt-4">
              <Label htmlFor="correct-answer">Correct Answer</Label>
              <Input
                id="correct-answer"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Enter the correct answer..."
                className="mt-2"
              />
              <div className="text-xs text-gray-500 mt-1">
                This is the expected answer for the blank question.
              </div>
            </div>
          )}

          {/* Hierarchy Fields - Show for MC, MA, BLANK, and EQUATION_CALCULATOR questions */}
          {(question?.question_type === "MC" || question?.question_type === "MA" || question?.question_type === "BLANK" || question?.question_type === "BLANK_PLACEHOLDER" || question?.question_type === "BLANK_FILL_BOX" || question?.question_type === "EQUATION_CALCULATOR") && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Question Organization</h3>

              {/* Question Category */}
              <div>
                <Label htmlFor="question-category">Question Category</Label>
                <Select value={questionCategory} onValueChange={setQuestionCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Practice">Practice</SelectItem>
                    <SelectItem value="Drill">Drill</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Chapter Dropdown */}
                <div>
                  <Label htmlFor="chapter">Chapter</Label>
                  <Select
                    value={hierarchy.selectedChapter?.toString() || ""}
                    onValueChange={(value) => hierarchy.setSelectedChapter(value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select chapter..." />
                    </SelectTrigger>
                    <SelectContent>
                      {hierarchy.chapters.map((chapter) => (
                        <SelectItem key={chapter.chapter_number} value={chapter.chapter_number.toString()}>
                          Ch {chapter.chapter_number}: {chapter.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hierarchy.chaptersLoading && <p className="text-xs text-gray-500 mt-1">Loading chapters...</p>}
                  {hierarchy.chaptersError && <p className="text-xs text-red-500 mt-1">{hierarchy.chaptersError}</p>}
                </div>

                {/* Topic Dropdown */}
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Select
                    value={hierarchy.selectedTopic?.toString() || ""}
                    onValueChange={(value) => hierarchy.setSelectedTopic(value ? parseInt(value) : undefined)}
                    disabled={!hierarchy.selectedChapter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select topic..." />
                    </SelectTrigger>
                    <SelectContent>
                      {hierarchy.topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id.toString()}>
                          {topic.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hierarchy.topicsLoading && <p className="text-xs text-gray-500 mt-1">Loading topics...</p>}
                  {hierarchy.topicsError && <p className="text-xs text-red-500 mt-1">{hierarchy.topicsError}</p>}
                </div>

                {/* Sub-topic Dropdown */}
                <div>
                  <Label htmlFor="sub-topic">Sub-topic</Label>
                  <Select
                    value={hierarchy.selectedSubTopic?.toString() || ""}
                    onValueChange={(value) => hierarchy.setSelectedSubTopic(value ? parseInt(value) : undefined)}
                    disabled={!hierarchy.selectedTopic}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub-topic..." />
                    </SelectTrigger>
                    <SelectContent>
                      {hierarchy.subTopics.map((subTopic) => (
                        <SelectItem key={subTopic.id} value={subTopic.id.toString()}>
                          {subTopic.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hierarchy.subTopicsLoading && <p className="text-xs text-gray-500 mt-1">Loading sub-topics...</p>}
                  {hierarchy.subTopicsError && <p className="text-xs text-red-500 mt-1">{hierarchy.subTopicsError}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Image (optional)</label>
            <ImageUpload
              currentImageUrl={questionImageUrl}
              onImageUploaded={(imageUrl) => setQuestionImageUrl(imageUrl)}
              onImageDeleted={() => setQuestionImageUrl(undefined)}
              uploadId={question?.id}
              uploadType="question"
              userName={userName}
              allowTemporary={!question?.id}
              isEditing={!!question?.id}
            />
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
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
