import React from "react";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";

interface RCFormProps {
  rcPassage: string;
  setRcPassage: (value: string) => void;
  rcTopicId?: number;
  setRcTopicId?: (value: number) => void;
  rcSubTopicId?: number;
  setRcSubTopicId?: (value: number) => void;
  rcImageUrl?: string;
  setRcImageUrl?: (value: string) => void;
  rcStartPage?: number;
  setRcStartPage?: (value: number) => void;
  rcEndPage?: number;
  setRcEndPage?: (value: number) => void;
  rcDifficulty?: number;
  setRcDifficulty?: (value: number) => void;
}

export const RCForm: React.FC<RCFormProps> = ({
  rcPassage,
  setRcPassage,
  rcTopicId,
  setRcTopicId,
  rcSubTopicId,
  setRcSubTopicId,
  rcImageUrl,
  setRcImageUrl,
  rcStartPage,
  setRcStartPage,
  rcEndPage,
  setRcEndPage,
  rcDifficulty,
  setRcDifficulty,
}) => {
  return (
    <div className="space-y-6">
      {/* Passage Section */}
      <div>
        <Label htmlFor="passage">Reading Passage</Label>
        <div className="text-xs text-gray-500 mb-2">
          Enter the reading passage text
        </div>
        <Textarea
          id="passage"
          value={rcPassage}
          onChange={(e) => setRcPassage(e.target.value)}
          placeholder="Enter the reading passage..."
          className="min-h-[200px] font-serif"
        />
      </div>

      {/* Optional Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startPage">Start Page</Label>
          <input
            type="number"
            id="startPage"
            value={rcStartPage || ""}
            onChange={(e) => setRcStartPage?.(parseInt(e.target.value))}
            className="w-full p-2 border rounded"
            placeholder="Start page number"
          />
        </div>
        <div>
          <Label htmlFor="endPage">End Page</Label>
          <input
            type="number"
            id="endPage"
            value={rcEndPage || ""}
            onChange={(e) => setRcEndPage?.(parseInt(e.target.value))}
            className="w-full p-2 border rounded"
            placeholder="End page number"
          />
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <Label htmlFor="difficulty">Difficulty (1-5)</Label>
        <input
          type="number"
          id="difficulty"
          min="1"
          max="5"
          value={rcDifficulty || 3}
          onChange={(e) => setRcDifficulty?.(Number(e.target.value))}
          className="w-full p-2 border rounded"
          placeholder="Enter difficulty level (1-5)"
        />
      </div>
    </div>
  );
};
