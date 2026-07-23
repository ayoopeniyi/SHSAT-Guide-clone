import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useAuthStore } from "../stores/authStore";
import ImageUpload from "./ImageUpload";

export interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string, imageUrl: string | undefined, hierarchyData: any, correctAnswer: string, difficulty: number) => void; // ⭐ UPDATE THIS
  question: any;
  isTestPack?: boolean;
}

// Sanitize HTML to remove only Quill artifacts
function sanitizeHtml(html: string): string {
  // Remove only Quill cursor spans and nothing else
  return html
    .replace(/<span class="ql-cursor">.*?<\/span>/g, "")
    .replace(/<span class="ql-cursor"><\/span>/g, "");
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  question,
  isTestPack = false,
}) => {
  const [questionText, setQuestionText] = useState("");
  const [questionImageUrl, setQuestionImageUrl] = useState<string | undefined>(
    undefined,
  );
  const [correctAnswer, setCorrectAnswer] = useState("");
  const userName = useAuthStore((state) => state.getUserName());
  const [difficulty, setDifficulty] = useState<number>(question?.difficulty || 3);

  // Initialize question text, image, and correct answer when modal opens
  useEffect(() => {
    if (isOpen && question) {
      setQuestionText(question.question || "");
      setQuestionImageUrl(question.question_image_url || undefined);
      setCorrectAnswer(question.answer || question.correct_answer || "");
    }
  }, [isOpen, question]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuestionText("");
      setQuestionImageUrl(undefined);
      setCorrectAnswer("");
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!questionText.trim()) {
      return; // Don't save empty questions
    }

    const auditFields = {
      last_edited_by: userName,
      updated_at: new Date().toISOString(),
    };

    const saveData = {
      ...question,
      question: sanitizeHtml(questionText.trim()),
      difficulty: difficulty,
      ...auditFields,
    };

    // Always include question_image_url if present
    if (questionImageUrl) {
      saveData.question_image_url = questionImageUrl;
    }

    // Include correct answer for BLANK questions
    if (question?.question_type === "BLANK" && correctAnswer.trim()) {
      saveData.correct_answer = correctAnswer.trim();
      saveData.answer = correctAnswer.trim(); // Also update the answer field for consistency
    }

      onSave(
    sanitizeHtml(questionText.trim()),
    questionImageUrl,
    null, // hierarchyData - you can add this later if needed
    correctAnswer.trim(),
    difficulty
  );
    onClose();
  };

  const isValid = questionText.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="question-text">Question Text</Label>
            <div className="mt-2">
              <ReactQuill
                id="question-text"
                value={questionText}
                onChange={setQuestionText}
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
                className="min-h-[120px]"
              />
            </div>
            {/* Debug: Show raw HTML being saved */}
            <div className="mt-2 p-2 bg-gray-50 border rounded text-xs text-gray-600">
              <strong>Raw HTML:</strong>
              <pre className="whitespace-pre-wrap">
                {sanitizeHtml(questionText)}
              </pre>
            </div>
          </div>

          {/* Show correct answer field for BLANK questions */}
          {question?.question_type === "BLANK" && (
            <div>
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

          <div>
  <Label>Difficulty Level (1-5)</Label>
  <Input
    type="number"
    min="1"
    max="5"
    value={difficulty}
    onChange={(e) => setDifficulty(Number(e.target.value))}
    placeholder="Enter difficulty level (1-5)"
  />
</div>

          {/* Always show image upload for all question types */}
          <div>
            <Label>Question Image (optional)</Label>
            <div className="text-xs text-gray-500 mb-2">
              Upload, replace, or remove the question image
            </div>
            <ImageUpload
              currentImageUrl={questionImageUrl}
              onImageUploaded={(imageUrl) => setQuestionImageUrl(imageUrl)}
              onImageDeleted={() => setQuestionImageUrl(undefined)}
              uploadId={isTestPack ? question?.question_id : question?.id}
              uploadType="question"
              userName={userName}
              className="mt-2"
              isTestPack={isTestPack}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            Save Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuestionModal;
