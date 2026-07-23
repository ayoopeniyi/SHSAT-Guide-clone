import React from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { HierarchySection } from "../components/HierarchySection";

interface TrueFalseFormProps {
  tfQuestion: string;
  setTfQuestion: (value: string) => void;
  tfAnswer: boolean | null;
  setTfAnswer: (value: boolean) => void;
  tfExplanation: string;
  setTfExplanation: (value: string) => void;
  tfDifficulty?: number;
  setTfDifficulty?: (value: number) => void;
  isTestPack?: boolean;
  // Hierarchy fields
  tfChapter?: number;
  setTfChapter?: (value: number | undefined) => void;
  tfTopic?: number;
  setTfTopic?: (value: number | undefined) => void;
  tfSubTopic?: number;
  setTfSubTopic?: (value: number | undefined) => void;
  tfQuestionCategory?: string;
  setTfQuestionCategory?: (value: string) => void;
}

export const TrueFalseForm: React.FC<TrueFalseFormProps> = ({
  tfQuestion,
  setTfQuestion,
  tfAnswer,
  setTfAnswer,
  tfExplanation,
  setTfExplanation,
  tfDifficulty,
  setTfDifficulty,
  isTestPack,
  // Hierarchy fields
  tfChapter,
  setTfChapter,
  tfTopic,
  setTfTopic,
  tfSubTopic,
  setTfSubTopic,
  tfQuestionCategory,
  setTfQuestionCategory,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Question</Label>
        <Input
          value={tfQuestion}
          onChange={(e) => setTfQuestion(e.target.value)}
          placeholder="Enter True/False question"
        />
      </div>

      {/* Hierarchy Fields */}
      <HierarchySection
        isTestPack={isTestPack}
        questionCategory={tfQuestionCategory}
        setQuestionCategory={setTfQuestionCategory}
        chapter={tfChapter}
        setChapter={setTfChapter}
        topic={tfTopic}
        setTopic={setTfTopic}
        subTopic={tfSubTopic}
        setSubTopic={setTfSubTopic}
      />

      <div>
        <Label>Correct Answer</Label>
        <div className="flex gap-4 mt-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={tfAnswer === true}
              onChange={() => setTfAnswer(true)}
              name="tf-answer"
              className="accent-blue-600"
            />
            <span>True</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={tfAnswer === false}
              onChange={() => setTfAnswer(false)}
              name="tf-answer"
              className="accent-blue-600"
            />
            <span>False</span>
          </label>
        </div>
      </div>

      <div>
        <Label>Difficulty (1-5)</Label>
        <Input
          type="number"
          min="1"
          max="5"
          value={tfDifficulty || 3}
          onChange={(e) => setTfDifficulty?.(Number(e.target.value))}
          placeholder="Enter difficulty level (1-5)"
        />
      </div>

      <div>
        <Label>Explanation (optional)</Label>
        <Textarea
          value={tfExplanation}
          onChange={(e) => setTfExplanation(e.target.value)}
          placeholder="Explanation for the correct answer"
          rows={3}
        />
      </div>


    </div>
  );
};
