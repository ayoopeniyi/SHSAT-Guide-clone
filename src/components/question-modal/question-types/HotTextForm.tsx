import React from "react";
import HotTextEditor from "../../HotTextEditor";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { HierarchySection } from "../components/HierarchySection";
import { TagSlot } from "../../shared/ChoiceTagEditor";

interface HotTextRegion {
  phrase: string;
  start_idx: number;
  end_idx: number;
  is_correct: boolean;
}

interface HotTextFormProps {
  question: string;
  setQuestion: (q: string) => void;
  prompt: string;
  setPrompt: (p: string) => void;
  passage: string;
  setPassage: (p: string) => void;
  minSelections: number;
  setMinSelections: (n: number) => void;
  maxSelections: number;
  setMaxSelections: (n: number) => void;
  regions: HotTextRegion[];
  setRegions: React.Dispatch<React.SetStateAction<HotTextRegion[]>>;
  difficulty: number;
  setDifficulty: (d: number) => void;
  onCancel: () => void;
  initialValues?: any;
  istestpack?: boolean;
  // Hierarchy fields
  hotTextChapter?: number;
  setHotTextChapter?: (value: number | undefined) => void;
  hotTextTopic?: number;
  setHotTextTopic?: (value: number | undefined) => void;
  hotTextSubTopic?: number;
  setHotTextSubTopic?: (value: number | undefined) => void;
  hotTextQuestionCategory?: string;
  setHotTextQuestionCategory?: (value: string) => void;
  hotTextExplanation?: string;
  setHotTextExplanation?: (value: string) => void;
  onSave?: (data: any) => void;
  // Tagging
  regionTagSlots?: Record<string, TagSlot[]>;
  setRegionTagSlots?: React.Dispatch<React.SetStateAction<Record<string, TagSlot[]>>>;
}

export const HotTextForm: React.FC<HotTextFormProps> = ({
  question,
  setQuestion,
  prompt,
  setPrompt,
  passage,
  setPassage,
  minSelections,
  setMinSelections,
  maxSelections,
  setMaxSelections,
  regions,
  setRegions,
  difficulty,
  setDifficulty,
  onCancel,
  istestpack = false,
  // Hierarchy fields
  hotTextChapter,
  setHotTextChapter,
  hotTextTopic,
  setHotTextTopic,
  hotTextSubTopic,
  setHotTextSubTopic,
  hotTextQuestionCategory,
  setHotTextQuestionCategory,
  hotTextExplanation,
  setHotTextExplanation,
  regionTagSlots,
  setRegionTagSlots,
}) => {
  return (
    <div>
      {/* <div className="mb-4">
          <label className="block mb-1 font-medium">Difficulty (1-5)</label>
          <input
            type="number"
            min={1}
            max={5}
            className="border rounded px-2 py-1"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
          />
        </div> */}
      {/* {istestpack && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">Difficulty (1-5)</label>
          <input
            type="number"
            min={1}
            max={5}
            className="border rounded px-2 py-1"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
          />
        </div>
      )} */}
      {!istestpack && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">Prompt</label>
          <input
            type="text"
            className="border rounded px-2 py-1 w-full"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter prompt for Hot Text question"
          />
        </div>
      )}

      {/* Hierarchy Fields */}
      <HierarchySection
        isTestPack={istestpack}
        questionCategory={hotTextQuestionCategory}
        setQuestionCategory={setHotTextQuestionCategory}
        chapter={hotTextChapter}
        setChapter={setHotTextChapter}
        topic={hotTextTopic}
        setTopic={setHotTextTopic}
        subTopic={hotTextSubTopic}
        setSubTopic={setHotTextSubTopic}
      />

      <HotTextEditor
        question={question}
        setQuestion={setQuestion}
        passage={passage}
        setPassage={setPassage}
        minSelections={minSelections}
        setMinSelections={setMinSelections}
        maxSelections={maxSelections}
        setMaxSelections={setMaxSelections}
        regions={regions}
        setRegions={setRegions}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onCancel={onCancel}
        istestpack={istestpack}
        regionTagSlots={regionTagSlots}
        setRegionTagSlots={setRegionTagSlots}
      />

      {/* Explanation */}
      <div className="mt-4">
        <Label>Explanation (optional)</Label>
        <Textarea
          value={hotTextExplanation || ""}
          onChange={(e) => setHotTextExplanation?.(e.target.value)}
          placeholder="Enter an explanation for this question"
          className="mt-1"
        />
      </div>


    </div>
  );
};
