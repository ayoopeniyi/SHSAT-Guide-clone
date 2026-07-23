import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";

import ImageUpload from "../../ImageUpload";
import { HierarchySection } from "../components/HierarchySection";
import { ChoiceTagEditor, TagSlot } from "../../shared/ChoiceTagEditor";

interface MAChoice {
  choice_label: string;
  choice_text: string;
  is_correct: boolean;
  explanation: string;
  choice_image_url?: string;
  id?: number;
}

interface MultiAnswerFormProps {
  maQuestion: string;
  setMaQuestion: (value: string) => void;
  maExplanation: string;
  setMaExplanation: (value: string) => void;
  maChoices: MAChoice[];
  updateMaChoice: (
    idx: number,
    field: "choice_text" | "is_correct" | "explanation" | "choice_image_url",
    value: any,
  ) => void;
  removeMaChoice: (idx: number) => void;
  addMaChoice: () => void;
  questionImageUrl?: string;
  onQuestionImageUploaded?: (imageUrl: string) => void;
  onQuestionImageDeleted?: () => void;
  onChoiceImageUploaded?: (choiceIndex: number, imageUrl: string) => void;
  onChoiceImageDeleted?: (choiceIndex: number) => void;
  questionId?: number;
  userName?: string;
  maDifficulty?: number;
  setMaDifficulty?: (value: number) => void;
  isTestPack?: boolean;
  // Hierarchy fields
  maChapter?: number;
  setMaChapter?: (value: number | undefined) => void;
  maTopic?: number;
  setMaTopic?: (value: number | undefined) => void;
  maSubTopic?: number;
  setMaSubTopic?: (value: number | undefined) => void;
  maQuestionCategory?: string;
  setMaQuestionCategory?: (value: string) => void;
  hideChoices?: boolean;
  choiceTagSlots: Record<string, TagSlot[]>;
  setChoiceTagSlots: React.Dispatch<React.SetStateAction<Record<string, TagSlot[]>>>;
}

export const MultiAnswerForm: React.FC<MultiAnswerFormProps> = ({
  maQuestion,
  setMaQuestion,
  maExplanation,
  setMaExplanation,
  maChoices,
  updateMaChoice,
  removeMaChoice,
  addMaChoice,
  questionImageUrl,
  onQuestionImageUploaded,
  onQuestionImageDeleted,
  onChoiceImageUploaded,
  onChoiceImageDeleted,
  questionId,
  userName,
  maDifficulty,
  setMaDifficulty,
  isTestPack,
  // Hierarchy fields
  maChapter,
  setMaChapter,
  maTopic,
  setMaTopic,
  maSubTopic,
  setMaSubTopic,
  maQuestionCategory,
  setMaQuestionCategory,
  hideChoices = false,
  choiceTagSlots,
  setChoiceTagSlots,
}) => {
  // State for toggling question image upload
  const [showQuestionImageUpload, setShowQuestionImageUpload] = useState(!!questionImageUrl);
  // State for toggling each choice image upload
  const [showChoiceImageUpload, setShowChoiceImageUpload] = useState<{ [idx: number]: boolean }>(
    () => Object.fromEntries(maChoices.map((_, idx) => [idx, !!maChoices[idx].choice_image_url]))
  );

  // Keep showChoiceImageUpload in sync with maChoices length
  React.useEffect(() => {
    setShowChoiceImageUpload((prev) => {
      const newState = { ...prev };
      maChoices.forEach((choice, idx) => {
        if (!(idx in newState)) {
          newState[idx] = !!choice.choice_image_url;
        }
      });
      // Remove indices that no longer exist
      Object.keys(newState).forEach((key) => {
        const idx = Number(key);
        if (idx >= maChoices.length) {
          delete newState[idx];
        }
      });
      return newState;
    });
  }, [maChoices.length]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Question</Label>
        <Textarea
          value={maQuestion}
          onChange={(e) => setMaQuestion(e.target.value)}
          placeholder="Enter question"
        />
      </div>
      <div>
        <Label>Question Explanation (optional)</Label>
        <Textarea
          value={maExplanation}
          onChange={(e) => setMaExplanation(e.target.value)}
          placeholder="Enter explanation for the question"
        />
      </div>
      <div>
        <Label>Difficulty (1-5)</Label>
        <Input
          type="number"
          min="1"
          max="5"
          value={maDifficulty || 3}
          onChange={(e) => setMaDifficulty?.(Number(e.target.value))}
          placeholder="Enter difficulty level (1-5)"
        />
      </div>

      {/* Hierarchy Fields */}
      <HierarchySection
        isTestPack={isTestPack}
        questionCategory={maQuestionCategory}
        setQuestionCategory={setMaQuestionCategory}
        chapter={maChapter}
        setChapter={setMaChapter}
        topic={maTopic}
        setTopic={setMaTopic}
        subTopic={maSubTopic}
        setSubTopic={setMaSubTopic}
      />

      {/* Question Image Upload */}
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
              {...(import.meta.env.DEV ? console.log('[ImageUpload] MA uploadId:', questionId, 'isTestPack:', isTestPack) : null, {})}
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
      {!hideChoices && (
        <div className="space-y-2">
          <Label>Choices</Label>
          {maChoices.map((choice, idx) => (
            <div
              key={choice.choice_label}
              className="mb-4 p-2 border rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-2 mb-2">
                <Input
                  className="flex-1"
                  value={choice.choice_text}
                  onChange={(e) =>
                    updateMaChoice(idx, "choice_text", e.target.value)
                  }
                  placeholder={`Choice ${choice.choice_label}`}
                />
                <input
                  type="checkbox"
                  checked={choice.is_correct}
                  onChange={(e) =>
                    updateMaChoice(idx, "is_correct", e.target.checked)
                  }
                  className="accent-blue-600"
                />
                <span className="text-xs">Correct</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMaChoice(idx)}
                  disabled={maChoices.length <= 3}
                >
                  ×
                </Button>
              </div>
              <div>
                <Label className="text-xs">Explanation (optional)</Label>
                <Textarea
                  className="mt-1"
                  value={choice.explanation || ""}
                  onChange={(e) =>
                    updateMaChoice(idx, "explanation", e.target.value)
                  }
                  placeholder="Explanation for this choice"
                  rows={2}
                />
              </div>

              {/* Choice Tags */}
              {!choice.is_correct && (
                <ChoiceTagEditor
                  choiceId={choice.id}
                  choiceType={isTestPack ? "test_pack" : "pre_shsat"}
                  localSlots={choiceTagSlots[choice.choice_label] ?? []}
                  onLocalSlotsChange={(slots) =>
                    setChoiceTagSlots((prev) => ({
                      ...prev,
                      [choice.choice_label]: slots,
                    }))
                  }
                />
              )}

              {/* Choice Image Upload */}
              <div className="mt-3">
                <Label className="text-xs">Choice Image (optional)</Label>
                <div className="text-xs text-gray-500 mb-2">
                  {questionId
                    ? "Note: Choice images are saved immediately upon upload"
                    : "Note: Image will be uploaded when the question is saved"}
                </div>
                {(!choice.choice_image_url && !showChoiceImageUpload[idx]) ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowChoiceImageUpload((prev) => ({ ...prev, [idx]: true }))}>
                    Add Image
                  </Button>
                ) : (
                  <div className="mt-2">
                    <ImageUpload
                      currentImageUrl={choice.choice_image_url}
                      onImageUploaded={(imageUrl) => {
                        if (onChoiceImageUploaded && questionId) {
                          onChoiceImageUploaded(idx, imageUrl);
                        } else {
                          updateMaChoice(idx, "choice_image_url", imageUrl);
                        }
                      }}
                      onImageDeleted={() => {
                        if (onChoiceImageDeleted && questionId) {
                          onChoiceImageDeleted(idx);
                        } else {
                          updateMaChoice(idx, "choice_image_url", undefined);
                        }
                        setShowChoiceImageUpload((prev) => ({ ...prev, [idx]: false }));
                      }}
                      uploadId={questionId ? choice.id : undefined}
                      uploadType="choice"
                      userName={userName}
                      allowTemporary={!questionId}
                      className="mt-2"
                      choiceIndex={idx}
                      choiceLabel={choice.choice_label}
                      choiceText={choice.choice_text}
                      isTestPack={isTestPack}
                    />
                    {choice.choice_image_url && (
                      <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => {
                        if (onChoiceImageDeleted && questionId) {
                          onChoiceImageDeleted(idx);
                        } else {
                          updateMaChoice(idx, "choice_image_url", undefined);
                        }
                        setShowChoiceImageUpload((prev) => ({ ...prev, [idx]: false }));
                      }}>
                        Remove Image
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addMaChoice}
            disabled={maChoices.length >= 8}
          >
            Add Choice
          </Button>
        </div>
      )}


      <div className="mt-4">
        <Label>Preview</Label>
        <div className="border rounded p-2 bg-gray-50 text-gray-700">
          <div className="mb-2">{maQuestion}</div>
          <div className="flex flex-col gap-2">
            {maChoices.map((choice) => (
              <label
                key={choice.choice_label}
                className="flex items-center gap-2"
              >
                <input type="checkbox" disabled className="accent-blue-600" />
                <span className="font-semibold">{choice.choice_label}.</span>
                <span>{choice.choice_text}</span>
              </label>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
};
