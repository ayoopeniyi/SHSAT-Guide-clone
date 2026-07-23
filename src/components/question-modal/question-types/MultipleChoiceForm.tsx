import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { MCChoice, MCVariant, MC_VARIANTS } from "../types";
import { MCDragDropPreview } from "../dnd-components/MCDragDropPreview";
import ImageUpload from "../../ImageUpload";
import { HierarchySection } from "../components/HierarchySection";
import { ChoiceTagEditor, TagSlot } from "../../shared/ChoiceTagEditor";

interface MultipleChoiceFormProps {
  mcQuestion: string;
  setMcQuestion: (value: string) => void;
  mcChoices: MCChoice[];
  updateMcChoice: (
    idx: number,
    field: "text" | "is_correct" | "explanation" | "choice_image_url",
    value: any,
  ) => void;
  setCorrectChoice: (idx: number) => void;
  removeMcChoice: (idx: number) => void;
  mcExplanation: string;
  setMcExplanation: (value: string) => void;
  addMcChoice: () => void;
  mcVariant: MCVariant;
  setMcVariant: (variant: MCVariant) => void;
  questionImageUrl?: string;
  onQuestionImageUploaded?: (imageUrl: string) => void;
  onQuestionImageDeleted?: () => void;
  onChoiceImageUploaded?: (choiceIndex: number, imageUrl: string) => void;
  onChoiceImageDeleted?: (choiceIndex: number) => void;
  questionId?: number;
  userName?: string;
  mcDifficulty?: number;
  setMcDifficulty?: (value: number) => void;
  isTestPack?: boolean;
  // New fields for question bank categorization
  mcChapter?: number;
  setMcChapter?: (chapter: number | undefined) => void;
  mcTopic?: number;
  setMcTopic?: (topic: number | undefined) => void;
  mcSubTopic?: number;
  setMcSubTopic?: (subTopic: number | undefined) => void;
  mcQuestionCategory?: string;
  setMcQuestionCategory?: (category: string) => void;
  // Flag to show/hide the new fields (only for question bank, not test pack)
  showHierarchyFields?: boolean;
  hideChoices?: boolean;
  choiceTagSlots: Record<string, TagSlot[]>;
  setChoiceTagSlots: React.Dispatch<React.SetStateAction<Record<string, TagSlot[]>>>;
}

export const MultipleChoiceForm: React.FC<MultipleChoiceFormProps> = ({
  mcQuestion,
  setMcQuestion,
  mcChoices,
  updateMcChoice,
  setCorrectChoice,
  removeMcChoice,
  mcExplanation,
  setMcExplanation,
  addMcChoice,
  mcVariant,
  setMcVariant,
  questionImageUrl,
  onQuestionImageUploaded,
  onQuestionImageDeleted,
  onChoiceImageUploaded,
  onChoiceImageDeleted,
  questionId,
  userName,
  mcDifficulty,
  setMcDifficulty,
  isTestPack,
  mcChapter,
  setMcChapter,
  mcTopic,
  setMcTopic,
  mcSubTopic,
  setMcSubTopic,
  mcQuestionCategory,
  setMcQuestionCategory,
  showHierarchyFields = false,
  hideChoices = false,
  choiceTagSlots,
  setChoiceTagSlots,
}) => {
  // Initialize hierarchy hook with current values


  // Check if there are any choices with text to show in preview
  const hasChoicesWithText = mcChoices.some(
    (choice) => choice.value.text.trim().length > 0,
  );

  // State for toggling question image upload
  const [showQuestionImageUpload, setShowQuestionImageUpload] = useState(!!questionImageUrl);
  // State for toggling each choice image upload
  const [showChoiceImageUpload, setShowChoiceImageUpload] = useState<{ [idx: number]: boolean }>(
    () => Object.fromEntries(mcChoices.map((_, idx) => [idx, !!mcChoices[idx].value.choice_image_url]))
  );

  // Keep showChoiceImageUpload in sync with mcChoices length
  React.useEffect(() => {
    setShowChoiceImageUpload((prev) => {
      const newState = { ...prev };
      mcChoices.forEach((choice, idx) => {
        if (!(idx in newState)) {
          newState[idx] = !!choice.value.choice_image_url;
        }
      });
      // Remove indices that no longer exist
      Object.keys(newState).forEach((key) => {
        const idx = Number(key);
        if (idx >= mcChoices.length) {
          delete newState[idx];
        }
      });
      return newState;
    });
  }, [mcChoices.length]);

  return (
    <div className="space-y-4">
      <div>
        <Label>MC Question Variant</Label>
        <Select
          value={mcVariant}
          onValueChange={(value: MCVariant) => setMcVariant(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MC_VARIANTS.map((variant) => (
              <SelectItem key={variant.value} value={variant.value}>
                {variant.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hierarchy fields for question bank (not test pack) */}
      {showHierarchyFields && (
        <HierarchySection
          isTestPack={false}
          questionCategory={mcQuestionCategory}
          setQuestionCategory={setMcQuestionCategory}
          chapter={mcChapter}
          setChapter={setMcChapter}
          topic={mcTopic}
          setTopic={setMcTopic}
          subTopic={mcSubTopic}
          setSubTopic={setMcSubTopic}
        />
      )}
      <div>
        <Label>Question</Label>
        <Input
          value={mcQuestion}
          onChange={(e) => setMcQuestion(e.target.value)}
          placeholder={
            mcVariant === "drag_drop"
              ? "Enter question with __ or more underscores for drop zones"
              : "Enter question"
          }
        />
        <div>
          <Label>Difficulty (1-5)</Label>
          <Input
            type="number"
            min="1"
            max="5"
            value={mcDifficulty}
            onChange={(e) => setMcDifficulty?.(Number(e.target.value))}
            placeholder="Enter difficulty level (1-5)"
          />
        </div>
        {mcVariant === "drag_drop" && (
          <div className="text-sm text-gray-600 mt-1">
            Use __ or more underscores in your question text where you want
            students to drag choices. Example: "Move the correct answer to the
            ____."
          </div>
        )}
      </div>

      {/* Question Image Upload - Only for standard MC, not drag_drop */}
      {mcVariant === "standard" && (
        <div>
          <Label>Question Image (optional)</Label>
          <div className="text-xs text-gray-500 mb-2">
            {questionId
              ? "Note: Question images are saved immediately upon upload"
              : "Note: Image will be uploaded when the question is saved"}
          </div>
          {(!questionImageUrl && !showQuestionImageUpload) ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setShowQuestionImageUpload(true)}>
              Add Image
            </Button>
          ) : (
            <div className="mt-2">
              <ImageUpload
                currentImageUrl={questionImageUrl}
                onImageUploaded={onQuestionImageUploaded || (() => { })}
                onImageDeleted={() => {
                  onQuestionImageDeleted && onQuestionImageDeleted();
                  setShowQuestionImageUpload(false);
                }}
                uploadId={typeof questionId === 'object' ? (questionId as any).question_id : questionId}
                uploadType="question"
                userName={userName}
                allowTemporary={!questionId}
                className="mt-2"
                isTestPack={isTestPack}
                // Debugging
                {...(import.meta.env.DEV ? console.log('[ImageUpload] MC uploadId:', questionId, 'isTestPack:', isTestPack) : null, {})}
              />
              {questionImageUrl && (
                <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => {
                  onQuestionImageDeleted && onQuestionImageDeleted();
                  setShowQuestionImageUpload(false);
                }}>
                  Remove Image
                </Button>
              )}
            </div>
          )}
        </div>
      )}
      {!hideChoices && (
        <div className="space-y-2">
          <Label>Choices</Label>
          {mcChoices.map((choice, idx) => (
            <div
              key={`choice-${idx}-${choice.letter}`}
              className="mb-4 p-2 border rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-2 mb-2">
                <Input
                  className="flex-1"
                  value={choice.value.text}
                  onChange={(e) => updateMcChoice(idx, "text", e.target.value)}
                  placeholder={`Choice ${choice.letter}`}
                />
                <input
                  type="radio"
                  checked={choice.value.is_correct}
                  onChange={() => setCorrectChoice(idx)}
                  name="mc-correct"
                  className="accent-blue-600"
                />
                <span className="text-xs">Correct</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMcChoice(idx)}
                  disabled={mcChoices.length <= 2}
                >
                  ×
                </Button>
              </div>
              <div>
                <Label className="text-xs">Explanation (optional)</Label>
                <Textarea
                  className="mt-1"
                  value={choice.value.explanation || ""}
                  onChange={(e) =>
                    updateMcChoice(idx, "explanation", e.target.value)
                  }
                  placeholder="Explanation for this choice"
                  rows={2}
                />
              </div>

              {/* Choice Tags */}
              {!choice.value.is_correct && (
                <ChoiceTagEditor
                  choiceId={(choice.value as any).id}
                  choiceType={isTestPack ? "test_pack" : "pre_shsat"}
                  localSlots={choiceTagSlots[choice.letter] ?? []}
                  onLocalSlotsChange={(slots) =>
                    setChoiceTagSlots((prev) => ({
                      ...prev,
                      [choice.letter]: slots,
                    }))
                  }
                />
              )}

              {/* Choice Image Upload - Only for standard MC, not drag_drop */}
              {mcVariant === "standard" && (
                <div className="mt-3">
                  <Label className="text-xs">Choice Image (optional)</Label>
                  <div className="text-xs text-gray-500 mb-2">
                    {questionId
                      ? "Note: Choice images are saved immediately upon upload"
                      : "Note: Image will be uploaded when the question is saved"}
                  </div>
                  {(!choice.value.choice_image_url && !showChoiceImageUpload[idx]) ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowChoiceImageUpload((prev) => ({ ...prev, [idx]: true }))}>
                      Add Image
                    </Button>
                  ) : (
                    <div className="mt-2">
                      <ImageUpload
                        currentImageUrl={choice.value.choice_image_url}
                        onImageUploaded={(imageUrl) => {
                          if (onChoiceImageUploaded && questionId) {
                            onChoiceImageUploaded(idx, imageUrl);
                          } else {
                            updateMcChoice(idx, "choice_image_url", imageUrl);
                          }
                        }}
                        onImageDeleted={() => {
                          if (onChoiceImageDeleted && questionId) {
                            onChoiceImageDeleted(idx);
                          } else {
                            updateMcChoice(idx, "choice_image_url", undefined);
                          }
                          setShowChoiceImageUpload((prev) => ({ ...prev, [idx]: false }));
                        }}
                        uploadId={questionId ? (choice.value as any).id : undefined}
                        uploadType="choice"
                        userName={userName}
                        allowTemporary={!questionId}
                        className="mt-2"
                        choiceIndex={idx}
                        choiceLabel={choice.letter}
                        choiceText={choice.value.text}
                        isTestPack={isTestPack}
                      />
                      {choice.value.choice_image_url && (
                        <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => {
                          if (onChoiceImageDeleted && questionId) {
                            onChoiceImageDeleted(idx);
                          } else {
                            updateMcChoice(idx, "choice_image_url", undefined);
                          }
                          setShowChoiceImageUpload((prev) => ({ ...prev, [idx]: false }));
                        }}>
                          Remove Image
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addMcChoice}
            disabled={mcChoices.length >= 6}
          >
            Add Choice
          </Button>
        </div>
      )}
      <div>
        <Label>Explanation (optional)</Label>
        <Textarea
          value={mcExplanation}
          onChange={(e) => setMcExplanation(e.target.value)}
          placeholder="Explanation"
        />
      </div>



      {/* Show preview only for drag_drop variant when there are choices with text */}
      {mcVariant === "drag_drop" && mcQuestion.trim() && hasChoicesWithText && (
        <div className="space-y-2">
          <Label>Teacher Preview (Test functionality)</Label>
          <MCDragDropPreview
            mcQuestion={mcQuestion}
            mcChoices={mcChoices}
            isPreview={true}
            showLabels={true}
          />
        </div>
      )}


    </div>
  );
};
