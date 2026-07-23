import React, { useEffect, useRef, useState } from "react";
import { dragAndDrop } from "@formkit/drag-and-drop";
import { MCChoice } from "../types";

interface MCDragDropPreviewProps {
  mcQuestion: string;
  mcChoices: MCChoice[];
  isPreview?: boolean; // true for teacher preview, false for question card
  showLabels?: boolean; // true during creation/editing, false during preview/student view
}

export const MCDragDropPreview: React.FC<MCDragDropPreviewProps> = ({
  mcQuestion,
  mcChoices,
  isPreview = true,
  showLabels = false,
}) => {
  const choicesPoolRef = useRef<HTMLDivElement>(null);
  const dropZoneRefs = useRef<Array<HTMLSpanElement | null>>([]);

  // Parse question for number of blanks (drop zones)
  const underscoreRegex = /_{2,}/g;
  const blanksCount = (mcQuestion?.match(underscoreRegex) || []).length || 1;

  // State: which choice is dropped in each blank (null if empty)
  const [droppedChoices, setDroppedChoices] = useState<(number | null)[]>(
    Array(blanksCount).fill(null)
  );
  // State: which choices are still in the pool
  const [poolChoices, setPoolChoices] = useState<number[]>([]);

  // Reset state and refs when choices or blanks change
  useEffect(() => {
    setDroppedChoices(Array(blanksCount).fill(null));
    setPoolChoices((mcChoices || []).map((_, idx) => idx));
    // Ensure refs array matches blanksCount
    dropZoneRefs.current = Array(blanksCount).fill(null);
  }, [mcChoices, blanksCount]);

  // Helper: get choice text
  const getChoiceText = (idx: number) => (mcChoices || [])[idx]?.value.text || "";
  // Helper: get choice label
  const getChoiceLabel = (idx: number) => (mcChoices || [])[idx]?.letter || "";

  // Render question with multiple drop zones
  const renderQuestionWithDropZones = () => {
    if (!mcQuestion) return <div className="text-base font-medium">No question provided</div>;
    const parts = mcQuestion.split(/_{2,}/g);
    return (
      <div className="text-base font-medium">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < blanksCount && (
              <span
                ref={el => (dropZoneRefs.current[index] = el)}
                className={`inline-flex items-center mx-1 min-h-[28px] min-w-[80px] border-2 border-dashed border-gray-300 rounded px-2 bg-gray-50 transition-all ${
                  isPreview
                    ? "hover:border-blue-500 hover:bg-blue-50"
                    : "bg-gray-100 border-gray-200"
                }`}
                style={{ zIndex: 20, position: "relative" }}
              >
                {droppedChoices[index] !== null ? (
                  <span className="px-2 py-0.5 bg-blue-500 text-white rounded font-medium text-sm break-words overflow-wrap-anywhere max-w-full">
                    {getChoiceText(droppedChoices[index]!)}
                  </span>
                ) : (
                  <span className="text-gray-400 italic text-sm"></span>
                )}
              </span>
            )}
          </span>
        ))}
      </div>
    );
  };

  // Set up drag and drop for choices pool
  useEffect(() => {
    if (!choicesPoolRef.current) return;
    const cleanup = dragAndDrop({
      parent: choicesPoolRef.current,
      getValues: () => poolChoices.map(idx => getChoiceText(idx)),
      setValues: () => {},
      config: { group: "mc-dnd-group", sortable: false },
    });
    return cleanup;
  }, [poolChoices, mcChoices, showLabels]);

  // Set up drag and drop for each drop zone
  useEffect(() => {
    if (!isPreview) return;
    // Defensive: ensure refs array matches blanksCount
    if (dropZoneRefs.current.length !== blanksCount) {
      dropZoneRefs.current = Array(blanksCount).fill(null);
    }
    const cleanups: (() => void)[] = [];
    dropZoneRefs.current.forEach((ref, blankIdx) => {
      if (!ref) return;
      const cleanup = dragAndDrop({
        parent: ref,
        getValues: () =>
          droppedChoices[blankIdx] !== null
            ? [getChoiceText(droppedChoices[blankIdx]!)]
            : [],
        setValues: (newValues) => {
          if (newValues.length === 0) {
            // Remove from blank, return to pool
            setDroppedChoices(prev => {
              const updated = [...prev];
              if (updated[blankIdx] !== null) {
                setPoolChoices(pool => [...pool, updated[blankIdx]!]);
              }
              updated[blankIdx] = null;
              return updated;
            });
          } else {
            // Add to blank, remove from pool and from any other blank
            const newChoiceText = newValues[newValues.length - 1];
            const newChoiceIdx = (mcChoices || []).findIndex(
              c => c.value.text === newChoiceText
            );
            if (newChoiceIdx !== -1) {
              setDroppedChoices(prev => {
                // Remove this choice from any other blank
                const updated = prev.map((val, idx) =>
                  idx !== blankIdx && val === newChoiceIdx ? null : val
                );
                updated[blankIdx] = newChoiceIdx;
                return updated;
              });
              setPoolChoices(prev => prev.filter(idx => idx !== newChoiceIdx));
            }
          }
        },
        config: { group: "mc-dnd-group", sortable: false },
      });
      if (typeof cleanup === 'function') cleanups.push(cleanup);
    });
    return () => { cleanups.filter(fn => typeof fn === 'function').forEach(fn => fn()); };
  }, [droppedChoices, poolChoices, mcChoices, showLabels, isPreview, blanksCount]);

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white" style={{ zIndex: 20, position: 'relative' }}>
      <div className="mb-4">{renderQuestionWithDropZones()}</div>
      <div ref={choicesPoolRef} className="flex flex-wrap gap-2">
        {(poolChoices || []).map(choiceIdx => (
          <div
            key={choiceIdx}
            className={`px-4 py-2 border rounded-md bg-blue-100 border-blue-300 text-blue-800 break-words overflow-wrap-anywhere max-w-full ${
              isPreview
                ? "cursor-grab hover:bg-blue-200 transition-colors"
                : "cursor-default"
            }`}
            style={{ zIndex: 20, position: 'relative' }}
          >
            {showLabels && (
              <span className="font-semibold mr-1 flex-shrink-0">{getChoiceLabel(choiceIdx)}.</span>
            )}
            <span className="break-words overflow-wrap-anywhere">{getChoiceText(choiceIdx)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
