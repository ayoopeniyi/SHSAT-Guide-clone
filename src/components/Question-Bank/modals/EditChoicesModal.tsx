import React, { useState, useEffect } from "react";
import { X, Trash2, Plus, Loader2 } from "lucide-react";
import ImageUpload from "../../ImageUpload";
import { ChoiceTagEditor, TagSlot } from "../../shared/ChoiceTagEditor";
import type { Question, Choice } from "../../../types/questionBank";
import { saveChoiceTags } from "../../../services/tagService";
import { toast } from "sonner";

export interface EditChoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  choices: Choice[];
  onChoicesChange: (newChoices: Choice[]) => void;
  onSave: () => void;
  onAddChoice: () => void;
  onRemoveChoice: (index: number) => void;
  saving: boolean;
  error: string | null;
  modalRenderKey: number;
  userName: string;
  choiceType?: "pre_shsat" | "test_pack";
}

export const EditChoicesModal: React.FC<EditChoicesModalProps> = ({
  isOpen,
  onClose,
  question,
  choices,
  onChoicesChange,
  onSave,
  onAddChoice,
  onRemoveChoice,
  saving: parentSaving,
  error,
  modalRenderKey,
  userName,
  choiceType = "pre_shsat",
}) => {
  // Local state for tags per choice (indexed by choice index)
  // Local state for tags per choice (keyed by choice label like 'A', 'B')
  const [choiceTags, setChoiceTags] = useState<Record<string, TagSlot[]>>({});
  const [internalSaving, setInternalSaving] = useState(false);

  // Reset tags when modal opens or choices change significantly
  useEffect(() => {
    if (isOpen) {
      setChoiceTags({});
    }
  }, [isOpen, modalRenderKey]);

  if (!isOpen) return null;

  const handleSaveAll = async () => {
    setInternalSaving(true);
    try {
      // 1. Save choice text/explanation/images first — this is the primary operation
      await onSave();

      // 2. Persist tags — wait for them to complete before clearing loading state
      const tagSavePromises = Object.entries(choiceTags).map(([label, slots]) => {
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
          return saveChoiceTags(choice.id, choiceType, validTags);
        }
        return Promise.resolve();
      });

      await Promise.all(tagSavePromises);
    } catch (err) {
      // console.error("Failed to save choices or tags in EditChoicesModal:", err);
      toast.warning("Choices saved, but some tags could not be updated. Please reopen and retry tags.");
    } finally {
      setInternalSaving(false);
    }
  };

  const isSaving = parentSaving || internalSaving;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <style>{`body { overflow: hidden !important; }`}</style>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        key={modalRenderKey}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Choices for Question #{question?.question_number}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            {choices.map((choice, idx) => (
              <div
                key={`${choice.choice_label}-${idx}-${choices.length}`}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md"
              >
                {/* Choice Label Row */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 font-bold rounded-full text-sm">
                    {choice.choice_label}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-1.5 ml-1">
                      Choice Text
                    </label>
                    <input
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                      value={choice.choice_text}
                      onChange={(e) => {
                        const newChoices = [...choices];
                        newChoices[idx].choice_text = e.target.value;
                        onChoicesChange(newChoices);
                      }}
                      placeholder={`Enter choice ${choice.choice_label} content...`}
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-5">
                    <label className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 cursor-pointer hover:bg-green-50 hover:border-green-200 transition-colors group">
                      {question?.question_type === "MA" ? (
                        <input
                          type="checkbox"
                          checked={!!choice.is_correct}
                          onChange={(e) => {
                            const newChoices = [...choices];
                            newChoices[idx].is_correct = e.target.checked;
                            onChoicesChange(newChoices);
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      ) : (
                        <input
                          type="radio"
                          checked={!!choice.is_correct}
                          onChange={() => {
                            const newChoices = choices.map((c, i) => ({
                              ...c,
                              is_correct: i === idx,
                            }));
                            onChoicesChange(newChoices);
                          }}
                          name={`mc-correct-${question?.id}`}
                          className="w-4 h-4 border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      )}
                      <span className="text-xs font-bold text-gray-500 group-hover:text-green-700 uppercase tracking-wider">Correct</span>
                    </label>
                    <button
                      className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
                      onClick={() => onRemoveChoice(idx)}
                      title="Remove Choice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Explanation Row */}
                <div className="mt-4">
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-1.5 ml-1">
                    Explanation (optional)
                  </label>
                  <textarea
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
                    rows={2}
                    value={choice.explanation || ""}
                    onChange={(e) => {
                      const newChoices = [...choices];
                      newChoices[idx].explanation = e.target.value;
                      onChoicesChange(newChoices);
                    }}
                    placeholder="Enter reasoning for why this choice is correct or incorrect..."
                  />
                </div>

                {/* Diagnostic Tag Editor */}
                {!choice.is_correct && (
                  <ChoiceTagEditor
                    choiceId={choice.id}
                    choiceType={choiceType}
                    localSlots={choiceTags[choice.choice_label] || []}
                    onLocalSlotsChange={(slots) => setChoiceTags(prev => ({ ...prev, [choice.choice_label]: slots }))}
                    disabled={isSaving}
                  />
                )}

                {/* Choice Image Upload - Only for standard MC, not drag_drop */}
                {question?.question_type === "MC" &&
                  question?.question_category !== "drag_drop" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Choice Image (optional)
                      </label>
                      <div className="text-xs text-gray-500 mb-2">
                        {choice.id
                          ? "Note: Choice images are saved immediately upon upload"
                          : "Note: Choice will be created first, then image uploaded"}
                      </div>
                      <ImageUpload
                        currentImageUrl={choice.choice_image_url}
                        onImageUploaded={(imageUrl, choiceId) => {
                          const newChoices = [...choices];
                          const newChoice = { ...newChoices[idx] };
                          newChoice.choice_image_url = imageUrl;
                          if (choiceId && !newChoice.id) {
                            newChoice.id = choiceId;
                          }
                          newChoices[idx] = newChoice;
                          onChoicesChange(newChoices);
                        }}
                        onImageDeleted={() => {
                          const newChoices = [...choices];
                          const newChoice = { ...newChoices[idx] };
                          newChoice.choice_image_url = undefined;
                          newChoices[idx] = newChoice;
                          onChoicesChange(newChoices);
                        }}
                        uploadId={choice.id}
                        uploadType="choice"
                        questionId={question?.id}
                        choiceIndex={idx}
                        choiceLabel={choice.choice_label}
                        choiceText={choice.choice_text}
                        userName={userName}
                        allowTemporary={!choice.id}
                        isEditing={!!choice.id}
                        className="mt-1"
                      />
                    </div>
                  )}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              onClick={onAddChoice}
            >
              <Plus className="w-4 h-4" />
              Add Choice
            </button>
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
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
            onClick={handleSaveAll}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
