import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { DnDBucket, DnDChoice, DnDSubtype } from "../types";
import { FormKitDnDPreview } from "../dnd-components/FormKitDnDPreview";
import { MCDragDropPreview } from "../dnd-components/MCDragDropPreview";
import { TableDnDPreview } from "../dnd-components/TableDnDPreview";
import { HierarchySection } from "../components/HierarchySection";
import { ChoiceTagEditor, TagSlot } from "../../shared/ChoiceTagEditor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../../ui/dialog";
import { Tags, X } from "lucide-react";

interface DragDropFormProps {
  dndQuestion: string;
  setDndQuestion: (value: string) => void;
  dndChoices: DnDChoice[];
  updateDndChoice: (idx: number, label: string) => void;
  removeDndChoice: (idx: number) => void;
  addDndChoice: () => void;
  dndBuckets: DnDBucket[];
  updateDndBucket: (idx: number, label: string) => void;
  addDndBucket: () => void;
  removeDndBucket: (idx: number) => void;
  dndCorrectAssignments: { [bucketIdx: number]: number[] };
  setDndCorrectAssignments: React.Dispatch<
    React.SetStateAction<{ [bucketIdx: number]: number[] }>
  >;
  poolChoices: number[];
  setPoolChoices: React.Dispatch<React.SetStateAction<number[]>>;
  previewAssignments: { [bucketIdx: number]: number[] };
  setPreviewAssignments: React.Dispatch<
    React.SetStateAction<{ [bucketIdx: number]: number[] }>
  >;
  dndExplanation: string;
  setDndExplanation: (value: string) => void;
  dndSubtype: DnDSubtype;
  dndDifficulty?: number;
  setDndDifficulty?: (value: number) => void;
  tableColumnHeaders?: [string, string];
  setTableColumnHeaders?: (headers: [string, string]) => void;
  isTestPack?: boolean;
  // Hierarchy fields
  dndChapter?: number;
  setDndChapter?: (value: number | undefined) => void;
  dndTopic?: number;
  setDndTopic?: (value: number | undefined) => void;
  dndSubTopic?: number;
  setDndSubTopic?: (value: number | undefined) => void;
  dndQuestionCategory?: string;
  setDndQuestionCategory?: (value: string) => void;
  // Tagging
  choiceTagSlots: Record<string, TagSlot[]>;
  setChoiceTagSlots: React.Dispatch<React.SetStateAction<Record<string, TagSlot[]>>>;
}

// DnD Assignment UI Component
const DnDAssignmentUI: React.FC<{
  dndBuckets: DnDBucket[];
  dndChoices: DnDChoice[];
  dndCorrectAssignments: { [bucketIdx: number]: number[] };
  setDndCorrectAssignments: React.Dispatch<
    React.SetStateAction<{ [bucketIdx: number]: number[] }>
  >;
  dndSubtype: DnDSubtype;
}> = ({
  dndBuckets,
  dndChoices,
  dndCorrectAssignments,
  setDndCorrectAssignments,
  dndSubtype,
}) => {
  const handleAssignmentChange = (
    bucketIdx: number,
    choiceIdx: number,
    checked: boolean,
  ) => {
    if (dndSubtype === "two_buckets_single" || dndSubtype === "one_bucket_single") {
      // Single assignment: each choice can only be in one bucket
      setDndCorrectAssignments((prev) => {
        const newAssignments = { ...prev };

        // Remove choice from all buckets first
        Object.keys(newAssignments).forEach((bIdx) => {
          const bIdxNum = Number(bIdx);
          newAssignments[bIdxNum] =
            newAssignments[bIdxNum]?.filter((idx) => idx !== choiceIdx) || [];
        });

        // Add to selected bucket if checked
        if (checked) {
          newAssignments[bucketIdx] = [
            ...(newAssignments[bucketIdx] || []),
            choiceIdx,
          ];
        }

        return newAssignments;
      });
    } else {
      // Multi assignment: choices can be in multiple buckets
      setDndCorrectAssignments((prev) => {
        const arr = prev[bucketIdx] || [];
        if (checked) {
          return { ...prev, [bucketIdx]: [...arr, choiceIdx] };
        } else {
          return {
            ...prev,
            [bucketIdx]: arr.filter((idx) => idx !== choiceIdx),
          };
        }
      });
    }
  };

  // Filter buckets based on subtype
  const visibleBuckets =
    (dndSubtype === "one_bucket_multi" || dndSubtype === "one_bucket_single") ? dndBuckets.slice(0, 1) : dndBuckets;
  const gridCols =
    (dndSubtype === "one_bucket_multi" || dndSubtype === "one_bucket_single") ? "grid-cols-1" : "grid-cols-2";

  return (
    <div className="mt-4">
      <Label>Assign Correct Answers (Teacher)</Label>
      <div className={`grid ${gridCols} gap-4`}>
        {visibleBuckets.map((bucket, bucketIdx) => (
          <div key={bucketIdx} className="border rounded p-3 bg-white">
            <div className="font-medium mb-2">{bucket.label}</div>
            <div className="flex flex-col gap-2">
              {dndChoices.map((choice, choiceIdx) => {
                const isChecked =
                  dndCorrectAssignments[bucketIdx]?.includes(choiceIdx) ||
                  false;
                const isInOtherBucket =
                  (dndSubtype === "two_buckets_single" || dndSubtype === "one_bucket_single") &&
                  Object.entries(dndCorrectAssignments).some(
                    ([bIdx, arr]) =>
                      Number(bIdx) !== bucketIdx && arr.includes(choiceIdx),
                  );

                return (
                  <label key={choiceIdx} className="flex items-center gap-2">
                    <input
                      type={dndSubtype === "one_bucket_single" ? "radio" : "checkbox"}
                      name={dndSubtype === "one_bucket_single" ? `bucket-${bucketIdx}` : undefined}
                      checked={isChecked}
                      disabled={
                        (dndSubtype === "two_buckets_single" || dndSubtype === "one_bucket_single") && isInOtherBucket
                      }
                      onChange={(e) =>
                        handleAssignmentChange(
                          bucketIdx,
                          choiceIdx,
                          e.target.checked,
                        )
                      }
                    />
                    <span className={isInOtherBucket ? "text-gray-400" : ""}>
                      {choice.label}
                      {isInOtherBucket && " (assigned elsewhere)"}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Show assignment type info */}
      <div className="mt-2 text-sm text-gray-600">
        {(dndSubtype === "two_buckets_single" || dndSubtype === "one_bucket_single") && (
          <p>
            Single Assignment: Each choice can only be assigned to one bucket.
          </p>
        )}
        {dndSubtype === "multi_assignment" && (
          <p>Multi Assignment: Choices can be assigned to multiple buckets.</p>
        )}
      </div>
    </div>
  );
};

export const DragDropForm: React.FC<DragDropFormProps> = ({
  dndQuestion,
  setDndQuestion,
  dndChoices,
  updateDndChoice,
  removeDndChoice,
  addDndChoice,
  dndBuckets,
  updateDndBucket,
  addDndBucket,
  removeDndBucket,
  dndCorrectAssignments,
  setDndCorrectAssignments,
  poolChoices,
  setPoolChoices,
  previewAssignments,
  setPreviewAssignments,
  dndExplanation,
  setDndExplanation,
  dndSubtype,
  dndDifficulty,
  setDndDifficulty,
  tableColumnHeaders,
  setTableColumnHeaders,
  isTestPack,
  // Hierarchy fields
  dndChapter,
  setDndChapter,
  dndTopic,
  setDndTopic,
  dndSubTopic,
  setDndSubTopic,
  dndQuestionCategory,
  setDndQuestionCategory,
  choiceTagSlots,
  setChoiceTagSlots,
}) => {
  /* console.log('🔍 [DragDropForm] Rendered with dndSubtype:', dndSubtype); */
  /* console.log('🔍 [DragDropForm] dndBuckets length:', dndBuckets.length); */
  /* console.log('🔍 [DragDropForm] Will show table_dnd section?', dndSubtype === "table_dnd"); */
  /* console.log('🔍 [DragDropForm] Will show regular bucket section?', !["drag_drop", "fill_box", "table_dnd"].includes(dndSubtype)); */
  /* console.log('[DragDropForm] Preview will show:', dndSubtype === "table_dnd" ? "TableDnDPreview" : dndSubtype === "drag_drop" ? "MCDragDropPreview" : "FormKitDnDPreview"); */
  // State for toggling each choice image upload (if DND choices support images)
  // Remove the import for ImageUpload and all image upload logic for DND choices

  // Keep showChoiceImageUpload in sync with dndChoices length
  React.useEffect(() => {
    // This effect is no longer needed as showChoiceImageUpload is removed.
    // Keeping it for now to avoid breaking existing functionality, but it will be empty.
  }, [dndChoices.length]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Prompt</Label>
        <Textarea
          value={
            typeof dndQuestion === "string"
              ? dndQuestion
              : (dndQuestion as any)?.question || ""
          }
          onChange={(e) => setDndQuestion(e.target.value)}
          placeholder={
            dndSubtype === "drag_drop"
              ? "Enter the prompt with __ (two or more underscores) where you want the answer box to appear"
              : "Enter the prompt for the drag and drop question"
          }
          className="min-h-[100px]"
        />
      </div>
      <div>
        <Label>Answer Pool</Label>
        <div className="space-y-2 mb-2">
          {dndChoices.map((choice, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={choice.label}
                onChange={(e) => updateDndChoice(idx, e.target.value)}
                placeholder={`Choice ${idx + 1}`}
              />
              
              {/* Tagging Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={`h-8 flex items-center gap-1.5 transition-all ${
                        (choiceTagSlots[idx]?.filter(s => s.tag_name.trim()).length || 0) > 0
                          ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 shadow-sm"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                      title="Tag this choice"
                    >
                      <Tags className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">
                        Edit Tags ({choiceTagSlots[idx]?.filter(s => s.tag_name.trim()).length || 0})
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
                    <DialogHeader className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                      <DialogTitle className="text-xl font-bold text-gray-900 flex items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
                            <Tags className="h-5 w-5" />
                          </div>
                          Tagging Choice: <span className="text-blue-600">"{choice.label || `Choice ${idx + 1}`}"</span>
                        </div>
                        <DialogClose asChild>
                          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                            <X className="h-5 w-5" />
                          </button>
                        </DialogClose>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar min-h-0 pt-4">
                      <ChoiceTagEditor
                        choiceType={isTestPack ? "test_pack" : "pre_shsat"}
                        localSlots={choiceTagSlots[idx] || []}
                        onLocalSlotsChange={(newSlots) => {
                          setChoiceTagSlots(prev => ({
                            ...prev,
                            [idx]: newSlots
                          }));
                        }}
                      />
                    </div>
                  </DialogContent>
                </Dialog>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeDndChoice(idx)}
                disabled={dndChoices.length <= 2}
              >
                ×
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDndChoice}
          >
            + Add Choice
          </Button>
        </div>
      </div>

      {/* Only show bucket labels for regular DND types */}
      {!["drag_drop", "fill_box", "table_dnd"].includes(dndSubtype) && (
        <div>
          <Label>
            {(dndSubtype === "one_bucket_multi" || dndSubtype === "one_bucket_single")
              ? "Bucket Label"
              : "Bucket Labels"}
          </Label>
          <div
            className={
              (dndSubtype === "one_bucket_multi" || dndSubtype === "one_bucket_single")
                ? "grid grid-cols-1 gap-4"
                : "grid grid-cols-2 gap-4"
            }
          >
            {((dndSubtype === "one_bucket_multi" || dndSubtype === "one_bucket_single")
              ? dndBuckets.slice(0, 1)
              : dndBuckets
            ).map((bucket, idx) => (
              <div key={idx}>
                <Input
                  value={bucket.label}
                  onChange={(e) => updateDndBucket(idx, e.target.value)}
                  placeholder={
                    (dndSubtype === "one_bucket_multi" || dndSubtype === "one_bucket_single")
                      ? "Bucket"
                      : `Bucket ${idx + 1}`
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table Row Labels for Table DND */}
      {dndSubtype === "table_dnd" && (
        <div>
          <Label>Table Column Headers</Label>
          <div className="flex gap-4 mb-2">
            <Input
              value={tableColumnHeaders?.[0] || ''}
              onChange={e => setTableColumnHeaders?.([e.target.value, tableColumnHeaders?.[1] || ''])}
              placeholder="First column header (e.g., Paragraphs)"
              className="w-1/2"
            />
            <Input
              value={tableColumnHeaders?.[1] || ''}
              onChange={e => setTableColumnHeaders?.([tableColumnHeaders?.[0] || '', e.target.value])}
              placeholder="Second column header (e.g., Ellen's Primary Mood)"
              className="w-1/2"
            />
          </div>
          <Label>Table Row Labels</Label>
          <div className="space-y-2">
            {dndBuckets.map((bucket, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={bucket.label}
                  onChange={(e) => updateDndBucket(idx, e.target.value)}
                  placeholder={`Row ${idx + 1} (e.g., Para 1-2)`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    /* console.log("🔍 [DragDropForm] Remove bucket clicked:", idx, "Current buckets:", dndBuckets.length); */
                    removeDndBucket(idx);
                  }}
                  disabled={dndBuckets.length <= 2}
                >
                  ×
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                /* console.log("🔍 [DragDropForm] Add bucket clicked. Current buckets:", dndBuckets.length); */
                addDndBucket();
              }}
            >
              + Add Row
            </Button>
          </div>
          {/* Validation messages */}
          {dndBuckets.length < 2 && (
            <div className="text-red-600 text-sm mt-1">
              Table DND requires at least 2 rows
            </div>
          )}
          {dndChoices.length < 2 && (
            <div className="text-red-600 text-sm mt-1">
              Answer pool must have at least 2 options
            </div>
          )}
        </div>
      )}

      {/* Show different assignment UI based on subtype */}
      {dndSubtype === "drag_drop" ? (
        <div className="mt-4">
          <Label>Correct Answer</Label>
          <div className="border rounded p-3 bg-white">
            <div className="font-medium mb-2">Select the correct answer</div>
            <div className="flex flex-col gap-2">
              {dndChoices.map((choice, choiceIdx) => (
                <label key={choiceIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={dndCorrectAssignments[0]?.includes(choiceIdx)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDndCorrectAssignments({ 0: [choiceIdx] });
                      }
                    }}
                  />
                  <span>{choice.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ) : dndSubtype === "fill_box" ? (
        <div className="mt-4">
          <Label>Correct Answer</Label>
          <div className="border rounded p-3 bg-white">
            <div className="font-medium mb-2">Select the correct answer</div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                {dndChoices.map((choice, choiceIdx) => (
                  <label key={choiceIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={dndCorrectAssignments[0]?.includes(choiceIdx)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDndCorrectAssignments({ 0: [choiceIdx] });
                        }
                      }}
                    />
                    <span>{choice.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : dndSubtype === "table_dnd" ? (
        <div className="mt-4">
          <Label>Assign Answers to Table Rows</Label>
          <div className="border rounded p-3 bg-white">
            <div className="font-medium mb-2">Select the correct answer for each row:</div>
            <div className="space-y-3">
              {dndBuckets.map((bucket, bucketIdx) => (
                <div key={bucketIdx} className="border-b pb-2">
                  <div className="font-medium mb-2">{bucket.label}:</div>
                  <div className="flex flex-col gap-2">
                    {dndChoices.map((choice, choiceIdx) => (
                      <label key={choiceIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`bucket-${bucketIdx}`}
                          checked={dndCorrectAssignments[bucketIdx]?.includes(choiceIdx)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDndCorrectAssignments(prev => ({
                                ...prev,
                                [bucketIdx]: [choiceIdx],
                              }));
                            }
                          }}
                        />
                        <span>{choice.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <DnDAssignmentUI
          dndBuckets={dndBuckets}
          dndChoices={dndChoices}
          dndCorrectAssignments={dndCorrectAssignments}
          setDndCorrectAssignments={setDndCorrectAssignments}
          dndSubtype={dndSubtype}
        />
      )}
      <div className="mt-4">
        <Label>Live Preview (Student)</Label>
        {dndSubtype === "drag_drop" ? (
          <MCDragDropPreview
            mcQuestion={dndQuestion}
            mcChoices={dndChoices.map((choice, idx) => ({
              letter: choice.label,
              value: {
                text: choice.label,
                is_correct: dndCorrectAssignments[0]?.includes(idx),
              },
            }))}
            isPreview={true}
            showLabels={false}
          />
        ) : dndSubtype === "fill_box" ? (
          <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-4">
            <div className="text-base font-medium">{dndQuestion}</div>
            <div className="space-y-2">
              {dndChoices.map((choice, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 bg-blue-100 text-blue-800 border border-blue-300 rounded-md text-sm font-medium inline-block mr-2"
                >
                  {choice.label}
                </div>
              ))}
              <div className="mt-2">
                <div className="border-2 border-dashed border-gray-300 rounded p-2 bg-gray-50 inline-flex items-center justify-center min-w-[100px] min-h-[40px]">
                  <div className="text-gray-400 italic text-sm">Fill box</div>
                </div>
              </div>
            </div>
          </div>
        ) : dndSubtype === "table_dnd" ? (
          <TableDnDPreview
            dndQuestion={dndQuestion}
            dndChoices={dndChoices}
            dndBuckets={dndBuckets}
            poolChoices={poolChoices}
            setPoolChoices={setPoolChoices}
            previewAssignments={previewAssignments}
            setPreviewAssignments={setPreviewAssignments}
            dndSubtype={dndSubtype}
            isPreview={true}
            tableColumnHeaders={tableColumnHeaders}
          />
        ) : (
          <FormKitDnDPreview
            dndQuestion={dndQuestion}
            dndChoices={dndChoices}
            dndBuckets={dndBuckets}
            poolChoices={poolChoices}
            setPoolChoices={setPoolChoices}
            previewAssignments={previewAssignments}
            setPreviewAssignments={setPreviewAssignments}
            dndSubtype={dndSubtype}
          />
        )}
      </div>
      <div>
        <Label>Difficulty (1-5)</Label>
        <Input
          type="number"
          min="1"
          max="5"
          value={dndDifficulty || 3}
          onChange={(e) => setDndDifficulty?.(Number(e.target.value))}
          placeholder="Enter difficulty level (1-5)"
        />
      </div>

      <div>
        <Label>Explanation (optional)</Label>
        <Textarea
          value={dndExplanation}
          onChange={(e) => setDndExplanation(e.target.value)}
          placeholder="Explanation for the correct answers"
        />
      </div>

      {/* Hierarchy Fields */}
      <HierarchySection
        isTestPack={isTestPack}
        questionCategory={dndQuestionCategory}
        setQuestionCategory={setDndQuestionCategory}
        chapter={dndChapter}
        setChapter={setDndChapter}
        topic={dndTopic}
        setTopic={setDndTopic}
        subTopic={dndSubTopic}
        setSubTopic={setDndSubTopic}
      />
    </div>
  );
};
