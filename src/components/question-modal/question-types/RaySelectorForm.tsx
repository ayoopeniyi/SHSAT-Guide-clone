import React from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { RaySelectorInteractivePreview } from "../ray-selector/RaySelectorInteractivePreview";
import { HierarchySection } from "../components/HierarchySection";
import { ChoiceTagEditor, TagSlot } from "../../shared/ChoiceTagEditor";
import { Tags } from "lucide-react";

interface RaySelectorFormProps {
  rayPrompt: string;
  setRayPrompt: (value: string) => void;
  numberlineMin: string;
  setNumberlineMin: (value: string) => void;
  numberlineMax: string;
  setNumberlineMax: (value: string) => void;
  tickInterval: string;
  setTickInterval: (value: string) => void;
  rayTypes: Array<{ value: string; label: string }>;
  selectedRayType: string | null;
  setSelectedRayType: (value: string | null) => void;
  selectedRayEndpoint: number | null;
  setSelectedRayEndpoint: (value: number | null) => void;
  rayType: string;
  setRayType: (value: string) => void;
  rayEndpoint: string;
  setRayEndpoint: (value: string) => void;
  rayExplanation: string;
  setRayExplanation: (value: string) => void;
  raySelectorValid: boolean;
  rayDifficulty?: number;
  setRayDifficulty?: (value: number) => void;
  isTestPack?: boolean;
  // Hierarchy fields
  rayChapter?: number;
  setRayChapter?: (value: number | undefined) => void;
  rayTopic?: number;
  setRayTopic?: (value: number | undefined) => void;
  raySubTopic?: number;
  setRaySubTopic?: (value: number | undefined) => void;
  rayQuestionCategory?: string;
  setRayQuestionCategory?: (value: string) => void;
  // Tagging
  rayTagSlots: TagSlot[];
  setRayTagSlots: React.Dispatch<React.SetStateAction<TagSlot[]>>;
  choiceId?: string | number;
}

export const RaySelectorForm: React.FC<RaySelectorFormProps> = ({
  rayPrompt,
  setRayPrompt,
  numberlineMin,
  setNumberlineMin,
  numberlineMax,
  setNumberlineMax,
  tickInterval,
  setTickInterval,
  rayTypes,
  selectedRayType,
  setSelectedRayType,
  selectedRayEndpoint,
  setSelectedRayEndpoint,
  rayType,
  setRayType,
  rayEndpoint,
  setRayEndpoint,
  rayExplanation,
  setRayExplanation,
  raySelectorValid,
  rayDifficulty,
  setRayDifficulty,
  isTestPack,
  // Hierarchy fields
  rayChapter,
  setRayChapter,
  rayTopic,
  setRayTopic,
  raySubTopic,
  setRaySubTopic,
  rayQuestionCategory,
  setRayQuestionCategory,
  rayTagSlots,
  setRayTagSlots,
  choiceId,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Prompt</Label>
        <Input
          value={rayPrompt}
          onChange={(e) => setRayPrompt(e.target.value)}
          placeholder="Enter the question prompt"
        />
      </div>
      <div className="flex gap-4">
        <div>
          <Label>Number Line Min</Label>
          <Input
            type="number"
            value={numberlineMin}
            onChange={(e) => setNumberlineMin(e.target.value)}
            placeholder="e.g. -10"
          />
        </div>
        <div>
          <Label>Number Line Max</Label>
          <Input
            type="number"
            value={numberlineMax}
            onChange={(e) => setNumberlineMax(e.target.value)}
            placeholder="e.g. 10"
          />
        </div>
        <div>
          <Label>Tick Interval</Label>
          <Input
            type="number"
            step="any"
            value={tickInterval}
            onChange={(e) => setTickInterval(e.target.value)}
            placeholder="e.g. 1"
          />
        </div>
      </div>
      <div>
        <Label>Live Preview (Student View)</Label>
        <RaySelectorInteractivePreview
          min={numberlineMin}
          max={numberlineMax}
          tick={tickInterval}
          rayTypes={rayTypes}
          selectedRayType={selectedRayType}
          setSelectedRayType={setSelectedRayType}
          selectedRayEndpoint={selectedRayEndpoint}
          setSelectedRayEndpoint={setSelectedRayEndpoint}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Ray Type (Correct Answer)</Label>
      </div>
      <div className="flex gap-4 mt-2">
        {rayTypes.map((rt) => (
          <label
            key={rt.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name="rayType"
              value={rt.value}
              checked={rayType === rt.value}
              onChange={() => setRayType(rt.value)}
            />
            <span className="text-lg">{rt.label}</span>
          </label>
        ))}
      </div>

      <div>
        <Label>Endpoint Value (Correct Answer)</Label>
        <Input
          type="number"
          step="any"
          value={rayEndpoint}
          onChange={(e) => setRayEndpoint(e.target.value)}
          placeholder="Enter endpoint value"
        />
        <div className="text-xs text-gray-500 mt-1">
          Must be between {numberlineMin} and {numberlineMax}
        </div>
      </div>
      <div>
        <Label>Difficulty (1-5)</Label>
        <Input
          type="number"
          min="1"
          max="5"
          value={rayDifficulty || 3}
          onChange={(e) => setRayDifficulty?.(Number(e.target.value))}
          placeholder="Enter difficulty level (1-5)"
        />
      </div>

      <div>
        <Label>Explanation (optional)</Label>
        <Textarea
          value={rayExplanation}
          onChange={(e) => setRayExplanation(e.target.value)}
          placeholder="Explanation for the correct ray"
        />
      </div>

      {/* Diagnostic Tags Section */}
      <div className="pt-2 border-t border-gray-100">
        {/* <Label className="text-base font-semibold mb-2 block text-blue-600 flex items-center gap-1">
          <Tags className="h-4 w-4" /> Reasoning Pattern Tags
        </Label> */}
        <ChoiceTagEditor
          choiceType={isTestPack ? "test_pack" : "pre_shsat"}
          localSlots={rayTagSlots || []}
          onLocalSlotsChange={setRayTagSlots}
          choiceId={choiceId}
        />
      </div>

      {!raySelectorValid && (
        <div className="text-red-600 text-sm mt-2">
          All fields are required. Endpoint must be within number line bounds.
          Tick interval must be positive. Min must be less than max.
        </div>
      )}

      {/* Hierarchy Section for Question Bank (not test pack) */}
      {!isTestPack && (
        <HierarchySection
          isTestPack={isTestPack}
          questionCategory={rayQuestionCategory}
          setQuestionCategory={setRayQuestionCategory}
          chapter={rayChapter}
          setChapter={setRayChapter}
          topic={rayTopic}
          setTopic={setRayTopic}
          subTopic={raySubTopic}
          setSubTopic={setRaySubTopic}
        />
      )}
    </div>
  );
};
