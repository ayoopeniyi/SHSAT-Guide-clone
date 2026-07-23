import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { useAuthStore } from "../../../stores/authStore";
import { toast } from "sonner";
import { testPackService } from "../../../services/testPackService";
import ImageUpload from "../../ImageUpload";
import { ChoiceTagEditor, TagSlot } from "../../shared/ChoiceTagEditor";
import { saveChoiceTags } from "../../../services/tagService";

interface TestPackEditChoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: any;
  onSave?: (question: any) => void;
}

interface EditChoice {
  choice_label: string;
  choice_text: string;
  is_correct: boolean;
  choice_image_url?: string;
  id?: string;
}

const QUESTION_TYPE_MAP: Record<number, string> = {
  36: "REA",
  37: "REB",
  38: "RC",
  39: "GI",
  40: "MC",
  41: "TF",
  42: "BLANK",
  43: "RESP",
  44: "MA",
  45: "HOT_TEXT",
  46: "DND",
  47: "TABLE_GRID",
  48: "RS",
  49: "RAY_SELECTOR",
  50: "GRAPH_SELECTOR",
};

function getQuestionTypeAcronym(q: any) {
  if (typeof q.question_type === "string") return q.question_type;
  if (typeof q.question_type === "number")
    return QUESTION_TYPE_MAP[q.question_type] || "";
  return "";
}

export const TestPackEditChoicesModal: React.FC<
  TestPackEditChoicesModalProps
> = ({ isOpen, onClose, question, onSave }) => {
  /* console.log("TestPackEditChoicesModal render:", { isOpen, question }); */
  const [loading, setLoading] = useState(false);
  const [initializingChoices, setInitializingChoices] = useState(false);
  const [choiceTags, setChoiceTags] = useState<Record<string, TagSlot[]>>({});
  const [tagsSaving, setTagsSaving] = useState(false);
  const [choices, setChoices] = useState<EditChoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  const userName = useAuthStore((state) => state.getUserName());

  const normalizeChoices = (rawChoices: any[] = []): EditChoice[] => {
    return rawChoices.map((choice, index) => {
      const label =
        choice?.choice_label ??
        choice?.letter ??
        choice?.label ??
        choice?.value?.choice_label ??
        String.fromCharCode(65 + index);

      const rawText =
        choice?.choice_text ??
        choice?.answer_text ??
        (typeof choice?.value === "string"
          ? choice.value
          : choice?.value?.text) ??
        choice?.text ??
        "";

      const isCorrect =
        typeof choice?.is_correct === "boolean"
          ? choice.is_correct
          : typeof choice?.value?.is_correct === "boolean"
            ? choice.value.is_correct
            : false;

      const imageUrl =
        choice?.choice_image_url ??
        (typeof choice?.value === "object" && choice?.value
          ? choice.value.choice_image_url
          : undefined);

      return {
        choice_label: label || String.fromCharCode(65 + index),
        choice_text: String(rawText || ""),
        is_correct: isCorrect,
        choice_image_url: imageUrl || undefined,
        id: choice?.id ?? choice?.value?.id,
      };
    });
  };

  const loadChoices = async () => {
    if (!isOpen || !question) return;

    const hasInlineChoices =
      Array.isArray(question.choices) && question.choices.length > 0;

    if (hasInlineChoices) {
      /* console.log(
        "TestPackEditChoicesModal useEffect: initializing choices from inline data",
        question.choices,
      ); */
      setError(null);
      setChoices(normalizeChoices(question.choices));
      return;
    }

    if (!question.question_id) {
      setChoices([]);
      return;
    }

    setInitializingChoices(true);
    setError(null);

    try {
      const type = getQuestionTypeAcronym(question);
      let fetchedChoices: any[] = [];

      if (type === "MC") {
        const data = await testPackService.getMCQuestion(question.question_id);
        fetchedChoices = data?.choices || [];
      } else if (type === "MA") {
        const data = await testPackService.getMAQuestion(question.question_id);
        fetchedChoices = data?.choices || [];
      } else if (
        ["RC", "REA", "REB"].includes(type) ||
        (question.passage_id && Number(question.passage_id) > 0)
      ) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/test-pack/questions/${question.question_id}/choices`,
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData?.detail || "Failed to fetch choices for this question",
          );
        }
        const data = await response.json();
        fetchedChoices =
          Array.isArray(data) ? data : Array.isArray(data?.choices) ? data.choices : [];
      }

      const normalized = normalizeChoices(fetchedChoices);

      if (normalized.length === 0) {
        setChoices([
          { choice_label: "A", choice_text: "", is_correct: false },
          { choice_label: "B", choice_text: "", is_correct: false },
        ]);
      } else {
        setChoices(normalized);
      }
    } catch (fetchError) {
      console.error("Error loading choices:", fetchError);
      const errorMessage =
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load choices for this question";
      setError(errorMessage);
      toast.error(errorMessage);
      setChoices([
        { choice_label: "A", choice_text: "", is_correct: false },
        { choice_label: "B", choice_text: "", is_correct: false },
      ]);
    } finally {
      setInitializingChoices(false);
    }
  };

  // Initialize choices when modal opens
  useEffect(() => {
    loadChoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, question?.question_id]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setChoices([]);
      setError(null);
      setInitializingChoices(false);
    }
  }, [isOpen]);

  const addChoice = () => {
    const nextLabel = String.fromCharCode(65 + choices.length); // A, B, C, D, etc.
    setChoices((prev) => [
      ...prev,
      {
        choice_label: nextLabel,
        choice_text: "",
        is_correct: false,
      },
    ]);
  };

  const removeChoice = (index: number) => {
    if (choices.length > 2) {
      // Minimum 2 choices
      setChoices((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateChoice = (index: number, field: keyof EditChoice, value: any) => {
    setChoices((prev) =>
      prev.map((choice, i) =>
        i === index ? { 
          ...choice, 
          [field]: field === 'choice_text' ? String(value || "") : value 
        } : choice,
      ),
    );
  };

  const setCorrectChoice = (index: number) => {
    const type = getQuestionTypeAcronym(question);
    if (type === "MC") {
      // For MC, only one correct answer
      setChoices((prev) =>
        prev.map((choice, i) => ({
          ...choice,
          is_correct: i === index,
        })),
      );
    } else {
      // For MA, toggle the choice
      setChoices((prev) =>
        prev.map((choice, i) =>
          i === index ? { ...choice, is_correct: !choice.is_correct } : choice,
        ),
      );
    }
  };

  const validateChoices = () => {
    if (choices.length < 2) return false;
    if (choices.some((choice) => !choice.choice_text || typeof choice.choice_text !== 'string' || !choice.choice_text.trim())) return false;

    const correctCount = choices.filter((choice) => choice.is_correct).length;
    if (
      getQuestionTypeAcronym(question) === "MC" &&
      correctCount !== 1
    )
      return false;
    if (
      getQuestionTypeAcronym(question) === "MA" &&
      correctCount === 0
    )
      return false;

    return true;
  };

  const handleSave = async () => {
    /* console.log("Save button clicked in TestPackEditChoicesModal"); */
    /* console.log("handleSave called with:", { question, choices }); */
    if (!question?.question_id) {
      toast.error("No question ID found");
      return;
    }

    if (!validateChoices()) {
      toast.error(
        "Please ensure all choices are filled and at least one is marked as correct",
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const auditFields = {
        last_edited_by: userName,
        updated_at: new Date().toISOString(),
      };

      let payload: any = {};
      let updateResponse: any = null;

      // Replicate question bank flow: build deleted_choice_labels
      const originalChoiceLabels = new Set(
        (question.choices || []).map((c: any) => c.choice_label ?? c.letter),
      );
      const currentChoiceLabels = new Set(
        choices.map((c: any) => c.choice_label),
      );
      const deletedChoiceLabels = Array.from(originalChoiceLabels).filter(
        (label) => !currentChoiceLabels.has(label),
      );

      const type = getQuestionTypeAcronym(question);
      /* console.log(
        "DEBUG: question_type:",
        question.question_type,
        "resolved type:",
        type,
      ); */

      if (type === "MC") {
        /* console.log("MC branch taken"); */
        const mcChoices = choices.map((choice) => ({
          letter: choice.choice_label,
          value: {
            text: choice.choice_text,
            is_correct: choice.is_correct,
            choice_image_url: choice.choice_image_url || null,
          },
        }));
        payload = {
          test_id: question.test_id,
          question: question.question,
          choices: mcChoices,
          question_category: question.question_category || "standard",
          created_by: question.created_by,
          deleted_choice_labels: deletedChoiceLabels,
          ...auditFields,
        };
        /* console.log("Payload for MC (PUT):", payload); */
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/test-pack/mc/edit/${question.question_id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            },
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to update MC choices");
          }
          updateResponse = await response.json();
          /* console.log("MC PUT API call success:", updateResponse); */
        } catch (err) {
          console.error("MC PUT API call error:", err);
          throw err;
        }
      } else if (type === "MA") {
        /* console.log("MA branch taken"); */
        const maChoices = choices.map((choice) => ({
          choice_label: choice.choice_label,
          choice_text: choice.choice_text,
          is_correct: choice.is_correct,
          choice_image_url: choice.choice_image_url || null,
        }));
        payload = {
          test_id: question.test_id,
          question: question.question,
          choices: maChoices,
          question_category: "standard",
          created_by: question.created_by,
          deleted_choice_labels: deletedChoiceLabels,
          ...auditFields,
        };
        /* console.log("Payload for MA (PUT):", payload); */
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/test-pack/ma/put/${question.question_id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            },
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to update MA choices");
          }
          updateResponse = await response.json();
          /* console.log("MA PUT API call success:", updateResponse); */
        } catch (err) {
          console.error("MA PUT API call error:", err);
          throw err;
        }
      } else if (type === "RC" || type === "REA" || type === "REB" || 
                 (question.passage_id && Number(question.passage_id) > 0)) {
        /* console.log(`${type} branch taken - handling question with passage`); */
        // For RC, REA, REB, or ANY question with passage, use the generic choices endpoint
        const elaChoices = choices.map((choice) => ({
          letter: choice.choice_label,
          value: {
            text: choice.choice_text,
            is_correct: choice.is_correct,
            choice_image_url: choice.choice_image_url || null,
          },
        }));
        payload = {
          test_id: question.test_id,
          question: question.question,
          choices: elaChoices,
          question_category: question.question_category || "standard",
          created_by: question.created_by,
          deleted_choice_labels: deletedChoiceLabels,
          ...auditFields,
        };
        /* console.log(`Payload for ${type} (PUT):`, payload); */
        try {
          // Use the generic choices endpoint for RC, REA, and REB questions
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/test-pack/questions/${question.question_id}/choices`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            },
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Failed to update ${type} choices`);
          }
          updateResponse = await response.json();
          /* console.log(`${type} PUT API call success:`, updateResponse); */
        } catch (err) {
          console.error(`${type} PUT API call error:`, err);
          throw err;
        }
      } else {
        // Fallback for unknown type
        toast.error("Unknown question type for editing choices.");
        setLoading(false);
        return;
      }

      // Only show success and close after successful API call
      toast.success("Choices updated successfully");
      if (onSave) onSave(updateResponse);
      onClose();
    } catch (error) {
      console.error("Error updating choices:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update choices";
      setError(errorMessage);
      toast.error(errorMessage);
      // Do NOT close the modal on error
    } finally {
      setLoading(false);
    }
  };

  if (!question) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>
              Edit Choices - Question #{question?.question_number}
            </DialogTitle>
            <Badge variant="outline">{question?.question_type}</Badge>
          </div>
          <div className="text-sm text-gray-600">
            {getQuestionTypeAcronym(question) === "MC"
              ? "Select exactly one correct answer"
              : "Select one or more correct answers"}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          )}

          {initializingChoices ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Loading choices...
            </div>
          ) : (
            <div className="space-y-4">
              {choices.map((choice, index) => (
                <div
                  key={`${choice.choice_label}-${index}`}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  {/* Choice Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 font-bold rounded-full text-sm">
                      {choice.choice_label}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Choice Text
                      </label>
                      <input
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={String(choice.choice_text || "")}
                        onChange={(e) =>
                          updateChoice(index, "choice_text", e.target.value)
                        }
                        placeholder={`Enter choice ${choice.choice_label}`}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        {getQuestionTypeAcronym(question) === "MA" ? (
                          <input
                            type="checkbox"
                            checked={choice.is_correct}
                            onChange={() => setCorrectChoice(index)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        ) : (
                          <input
                            type="radio"
                            checked={choice.is_correct}
                            onChange={() => setCorrectChoice(index)}
                            name="mc-correct"
                            className="border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        )}
                        <span className="text-green-700">Correct</span>
                      </label>
                      <button
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition-colors"
                        onClick={() => removeChoice(index)}
                        title="Remove Choice"
                        disabled={choices.length <= 2}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Choice Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Choice Image (optional)
                    </label>
                    <ImageUpload
                      currentImageUrl={choice.choice_image_url}
                      onImageUploaded={(imageUrl) =>
                        updateChoice(index, "choice_image_url", imageUrl)
                      }
                      onImageDeleted={() =>
                        updateChoice(index, "choice_image_url", undefined)
                      }
                      uploadId={choice.id ? Number(choice.id) : undefined}
                      uploadType="choice"
                      questionId={Number(question.question_id)}
                      choiceIndex={index}
                      choiceLabel={choice.choice_label}
                      choiceText={String(choice.choice_text || "")}
                      userName={userName}
                      allowTemporary={!choice.id}
                      isEditing={!!choice.id}
                      className="mt-1"
                      isTestPack={true}
                    />
                  </div>

                  {/* Diagnostic Tag Editor */}
                  {!choice.is_correct && (
                    <ChoiceTagEditor
                      choiceId={choice.id}
                      choiceType="test_pack"
                      localSlots={choiceTags[choice.choice_label] || []}
                      onLocalSlotsChange={(slots) => setChoiceTags(prev => ({ ...prev, [choice.choice_label]: slots }))}
                      disabled={loading || tagsSaving}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              onClick={addChoice}
              disabled={initializingChoices}
            >
              <Plus className="w-4 h-4" />
              Add Choice
            </button>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 mt-6">
          <Button variant="outline" onClick={onClose} disabled={loading || initializingChoices || tagsSaving}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setTagsSaving(true);
              try {
                // Save tags first
                const tagPromises = Object.entries(choiceTags).map(([label, slots]) => {
                  const choice = choices.find(c => c.choice_label === label);
                  if (choice && choice.id) {
                    const validTags = slots
                      .filter((s) => s.tag_name.trim())
                      .map((s, i) => ({
                        tag_id: s.tag_id,
                        tag_name: s.tag_name.trim(),
                        tag_category: s.tag_category.trim() || undefined,
                        tag_order: (i + 1) as 1 | 2 | 3,
                        rationale: s.rationale,
                      }));
                    return saveChoiceTags(choice.id, "test_pack", validTags);
                  }
                  return Promise.resolve();
                });
                await Promise.all(tagPromises);
                handleSave();
              } catch (err) {
                console.error("Failed to save test pack tags:", err);
                toast.error("Failed to save some choice tags");
                handleSave();
              } finally {
                setTagsSaving(false);
              }
            }}
            disabled={loading || initializingChoices || tagsSaving || !validateChoices()}
          >
            {(loading || tagsSaving) ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
