import React from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import {
  renderBlankQuestionPreview,
  renderFillBoxPreview,
  BLANK_QUESTION_INSTRUCTION,
} from "../../../utils/blankQuestionUtils";
import type { BlankVariant } from "../hooks/useBlankState";
import { HierarchySection } from "../components/HierarchySection";
import { ChoiceTagEditor, TagSlot } from "../../shared/ChoiceTagEditor";

interface BlankFormProps {
  blankQuestion: string;
  setBlankQuestion: (value: string) => void;
  blankExplanation?: string;
  setBlankExplanation?: (value: string) => void;
  blankCorrectAnswer: string;
  setBlankCorrectAnswer: (value: string) => void;
  blankVariant: BlankVariant;
  setBlankVariant: (value: BlankVariant) => void;
  blankDifficulty?: number;
  setBlankDifficulty?: (value: number) => void;
  isTestPack?: boolean;
  // Hierarchy fields
  blankChapter?: number;
  setBlankChapter?: (value: number | undefined) => void;
  blankTopic?: number;
  setBlankTopic?: (value: number | undefined) => void;
  blankSubTopic?: number;
  setBlankSubTopic?: (value: number | undefined) => void;
  blankQuestionCategory?: string;
  setBlankQuestionCategory?: (value: string) => void;
  // Tagging
  choiceTagSlots?: TagSlot[];
  setChoiceTagSlots?: (slots: TagSlot[]) => void;
  choiceId?: string | number;
}

export const BlankForm: React.FC<BlankFormProps> = ({
  blankQuestion,
  setBlankQuestion,
  blankExplanation,
  setBlankExplanation,
  blankCorrectAnswer,
  setBlankCorrectAnswer,
  blankVariant,
  setBlankVariant,
  blankDifficulty,
  setBlankDifficulty,
  isTestPack,
  // Hierarchy fields
  blankChapter,
  setBlankChapter,
  blankTopic,
  setBlankTopic,
  blankSubTopic,
  setBlankSubTopic,
  blankQuestionCategory,
  setBlankQuestionCategory,
  choiceTagSlots,
  setChoiceTagSlots,
  choiceId,
}) => {
  return (
    <div className="space-y-4">
      {/* Variant Selection */}
      <div>
        <Label>Blank Question Type</Label>
        <select
          value={blankVariant}
          onChange={(e) => setBlankVariant(e.target.value as BlankVariant)}
          className="border rounded px-3 py-2 ml-2 min-w-[200px]"
        >
          <option value="placeholder">
            Blank with Placeholders (use __ or more)
          </option>
          <option value="fill_box">Fill in the Box</option>
        </select>
      </div>

      {/* Question Input */}
      <div>
        <Label>Question</Label>
        <Textarea
          value={blankQuestion}
          onChange={(e) => setBlankQuestion(e.target.value)}
          placeholder={
            blankVariant === "placeholder"
              ? "Enter question (use __ or more underscores for blanks)"
              : "Enter the question text"
          }
        />
        {blankVariant === "placeholder" && (
          <div className="text-xs text-gray-500 mt-1">
            Use <span className="font-mono">__</span> or more underscores to
            indicate blanks. All blanks will render the same size.
          </div>
        )}
      </div>

      {/* Explanation Input */}
      <div>
        <Label>Explanation (optional)</Label>
        <Textarea
          value={blankExplanation || ""}
          onChange={(e) => setBlankExplanation?.(e.target.value)}
          placeholder="Enter an explanation for this question"
        />
      </div>

      {/* Hierarchy Fields */}
      <HierarchySection
        isTestPack={isTestPack}
        questionCategory={blankQuestionCategory}
        setQuestionCategory={setBlankQuestionCategory}
        chapter={blankChapter}
        setChapter={setBlankChapter}
        topic={blankTopic}
        setTopic={setBlankTopic}
        subTopic={blankSubTopic}
        setSubTopic={setBlankSubTopic}
      />

      {/* Correct Answer */}
      <div>
        <Label>Correct Answer</Label>
        <Input
          value={blankCorrectAnswer}
          onChange={(e) => setBlankCorrectAnswer(e.target.value)}
          placeholder={
            blankVariant === "placeholder"
              ? "Correct answer for the blank"
              : "Expected answer"
          }
        />
        {blankVariant === "fill_box" && (
          <div className="text-xs text-gray-500 mt-1">
            Answer matching will be case-insensitive.
          </div>
        )}
      </div>

      {/* Difficulty */}
      <div>
        <Label>Difficulty (1-5)</Label>
        <Input
          type="number"
          min="1"
          max="5"
          value={blankDifficulty || 3}
          onChange={(e) => setBlankDifficulty?.(Number(e.target.value))}
          placeholder="Enter difficulty level (1-5)"
        />
      </div>

      {/* Preview */}
      <div className="mt-4">
        <Label>Preview</Label>
        <div className="border rounded p-4 bg-gray-50 text-gray-700">
          {blankQuestion.trim() ? (
            blankVariant === "placeholder" ? (
              renderBlankQuestionPreview(blankQuestion, {
                showInstruction: true,
                instructionClassName: "text-sm text-gray-600 italic",
              })
            ) : (
              renderFillBoxPreview(blankQuestion, {
                showInstruction: true,
                instructionClassName: "text-sm text-gray-600 italic",
              })
            )
          ) : (
            <div className="text-gray-400">
              Enter a question above to see preview...
            </div>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          The instruction "{BLANK_QUESTION_INSTRUCTION}" will be automatically
          displayed before the question.
          <br />
          {blankVariant === "placeholder"
            ? "All blanks will appear as consistent-sized input boxes, regardless of underscore length."
            : "Students will see a text input box to enter their answer."}
        </div>
      </div>
      
      {/* Reasoning Pattern Tags */}
      <div className="pt-4 border-t border-gray-100">
        <ChoiceTagEditor
          choiceType={isTestPack ? "test_pack" : "pre_shsat"}
          localSlots={choiceTagSlots || []}
          onLocalSlotsChange={setChoiceTagSlots || (() => {})}
          choiceId={choiceId}
        />
      </div>
    </div>
  );
};
