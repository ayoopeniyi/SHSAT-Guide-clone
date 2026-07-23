import React from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { DialogFooter } from "../../ui/dialog";
import TableGridEditor from "../../TableGridEditor";
import { HierarchySection } from "../components/HierarchySection";
import { TagSlot } from "../../shared/ChoiceTagEditor";

interface TableGridFormProps {
  tgPrompt: string;
  setTgPrompt: (value: string) => void;
  tgSelectionMode: "single" | "multiple";
  setTgSelectionMode: (value: "single" | "multiple") => void;
  tgRowLabels: string[];
  tgColumnLabels: string[];
  tgAnswerMatrix: {
    row_index: number;
    column_index: number;
    is_correct: boolean;
  }[];
  handleTgRowLabelChange: (idx: number, value: string) => void;
  handleTgColumnLabelChange: (idx: number, value: string) => void;
  handleTgCellToggle: (rowIdx: number, colIdx: number) => void;
  handleTgAddRow: () => void;
  handleTgRemoveRow: (idx: number) => void;
  handleTgAddColumn: () => void;
  handleTgRemoveColumn: (idx: number) => void;
  tgErrors: string[];
  tgServerError: string | null;
  handleTableGridSave: () => void;
  onClose: () => void;
  tgFirstColumnHeader?: string;
  setTgFirstColumnHeader?: (value: string) => void;
  tgDifficulty?: number;
  setTgDifficulty?: (value: number) => void;
  istestpack?: boolean;
  // Hierarchy fields
  tgChapter?: number;
  setTgChapter?: (value: number | undefined) => void;
  tgTopic?: number;
  setTgTopic?: (value: number | undefined) => void;
  tgSubTopic?: number;
  setTgSubTopic?: (value: number | undefined) => void;
  tgQuestionCategory?: string;
  setTgQuestionCategory?: (value: string) => void;
  tgExplanation?: string;
  setTgExplanation?: (value: string) => void;
  // Tagging
  cellTagSlots: Record<string, TagSlot[]>;
  setCellTagSlots: React.Dispatch<React.SetStateAction<Record<string, TagSlot[]>>>;
}

export const TableGridForm: React.FC<TableGridFormProps> = ({
  tgPrompt,
  setTgPrompt,
  tgSelectionMode,
  setTgSelectionMode,
  tgRowLabels,
  tgColumnLabels,
  tgAnswerMatrix,
  handleTgRowLabelChange,
  handleTgColumnLabelChange,
  handleTgCellToggle,
  handleTgAddRow,
  handleTgRemoveRow,
  handleTgAddColumn,
  handleTgRemoveColumn,
  tgErrors,
  tgServerError,
  handleTableGridSave,
  onClose,
  tgFirstColumnHeader,
  setTgFirstColumnHeader,
  tgDifficulty,
  setTgDifficulty,
  istestpack = false,
  // Hierarchy fields
  tgChapter,
  setTgChapter,
  tgTopic,
  setTgTopic,
  tgSubTopic,
  setTgSubTopic,
  tgQuestionCategory,
  setTgQuestionCategory,
  tgExplanation,
  setTgExplanation,
  cellTagSlots,
  setCellTagSlots,
}) => {
  return (
    <div>
      <Label>Prompt</Label>
      <Input
        value={tgPrompt}
        onChange={(e) => setTgPrompt(e.target.value)}
        placeholder="Enter the table grid prompt"
      />

      <div className="mt-4">
        <Label>Difficulty (1-5)</Label>
        <Input
          type="number"
          min={1}
          max={5}
          value={tgDifficulty || 3}
          onChange={(e) => setTgDifficulty?.(Number(e.target.value))}
          placeholder="Enter difficulty level (1-5)"
        />
      </div>

      {/* {istestpack && (
        <div className="mt-4">
          <Label>Difficulty (1-5)</Label>
          <Input
            type="number"
            min={1}
            max={5}
            value={tgDifficulty || 3}
            onChange={(e) => setTgDifficulty?.(Number(e.target.value))}
            placeholder="Enter difficulty level (1-5)"
          />
        </div>
      )} */}

      <div className="mt-4">
        <Label>First Column Header (optional)</Label>
        <Input
          value={tgFirstColumnHeader || ""}
          onChange={(e) => setTgFirstColumnHeader?.(e.target.value)}
          placeholder="e.g., 'Categories', 'Items', etc."
        />
      </div>
      <div className="mt-4">
        <Label>Selection Mode</Label>
        <select
          value={tgSelectionMode}
          onChange={(e) => {
            const newMode = e.target.value as "single" | "multiple";
            setTgSelectionMode(newMode);
            // Clear any existing errors when changing mode since validation rules change
            // This will be handled by the parent component's validation
          }}
          className="border rounded px-2 py-1 ml-2"
        >
          <option value="single">Single-select (radio)</option>
          <option value="multiple">Multi-select (checkbox)</option>
        </select>
      </div>
      <div className="mt-4">
        <TableGridEditor
          rowLabels={tgRowLabels}
          columnLabels={tgColumnLabels}
          answerMatrix={tgAnswerMatrix}
          selectionMode={tgSelectionMode}
          onRowLabelChange={handleTgRowLabelChange}
          onColumnLabelChange={handleTgColumnLabelChange}
          onCellToggle={handleTgCellToggle}
          onAddRow={handleTgAddRow}
          onRemoveRow={handleTgRemoveRow}
          onAddColumn={handleTgAddColumn}
          onRemoveColumn={handleTgRemoveColumn}
          errors={tgErrors}
          firstColumnHeader={tgFirstColumnHeader}
          istestpack={istestpack}
          cellTagSlots={cellTagSlots}
          setCellTagSlots={setCellTagSlots}
        />
      </div>
      <div className="mt-4">
        <Label>Live Preview (Student View)</Label>
        <TableGridEditor
          rowLabels={tgRowLabels}
          columnLabels={tgColumnLabels}
          answerMatrix={tgAnswerMatrix}
          selectionMode={tgSelectionMode}
          onRowLabelChange={() => { }}
          onColumnLabelChange={() => { }}
          onCellToggle={() => { }}
          onAddRow={() => { }}
          onRemoveRow={() => { }}
          onAddColumn={() => { }}
          onRemoveColumn={() => { }}
          previewOnly={true}
          firstColumnHeader={tgFirstColumnHeader}
        />
      </div>
      {tgServerError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{tgServerError}</p>
        </div>
      )}

      {/* Hierarchy Section for Question Bank (not test pack) */}
      {!istestpack && (
        <HierarchySection
          isTestPack={istestpack}
          questionCategory={tgQuestionCategory}
          setQuestionCategory={setTgQuestionCategory}
          chapter={tgChapter}
          setChapter={setTgChapter}
          topic={tgTopic}
          setTopic={setTgTopic}
          subTopic={tgSubTopic}
          setSubTopic={setTgSubTopic}
        />
      )}

      {/* Explanation */}
      <div className="mt-4">
        <Label>Explanation (optional)</Label>
        <Textarea
          value={tgExplanation || ""}
          onChange={(e) => setTgExplanation?.(e.target.value)}
          placeholder="Enter an explanation for this question"
          className="mt-1"
        />
      </div>
    </div>
  );
};
