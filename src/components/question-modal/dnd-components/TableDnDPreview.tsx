import React, { useState, useEffect, useRef } from 'react';
import { dragAndDrop } from '@formkit/drag-and-drop';
import { DnDBucket, DnDChoice, DnDSubtype } from '../types';

interface TableDnDPreviewProps {
  dndQuestion: string;
  dndChoices: DnDChoice[];
  dndBuckets: DnDBucket[];
  poolChoices: number[];
  setPoolChoices: React.Dispatch<React.SetStateAction<number[]>>;
  previewAssignments: { [bucketIdx: number]: number[] };
  setPreviewAssignments: React.Dispatch<React.SetStateAction<{ [bucketIdx: number]: number[] }>>;
  dndSubtype: DnDSubtype;
  isPreview?: boolean;
  tableColumnHeaders?: [string, string];
}

export const TableDnDPreview: React.FC<TableDnDPreviewProps> = ({
  dndQuestion,
  dndChoices,
  dndBuckets,
  poolChoices,
  setPoolChoices,
  previewAssignments,
  setPreviewAssignments,
  dndSubtype,
  isPreview = false,
  tableColumnHeaders,
}) => {
  const poolRef = useRef<HTMLDivElement>(null);
  const bucketRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Helper function to get choice label from index
  const getChoiceLabel = (idx: number) => {
    return dndChoices[idx]?.label || `Choice ${idx + 1}`;
  };

  // Set up drag and drop for pool
  useEffect(() => {
    if (!poolRef.current) return;

    const cleanup = dragAndDrop({
      parent: poolRef.current,
      getValues: () => poolChoices.map((idx) => getChoiceLabel(idx)),
      setValues: (newValues) => {
        // This will be handled by the transfer logic
      },
      config: {
        group: "table-dnd-group",
        sortable: false,
      },
    });

    return cleanup;
  }, [poolChoices, dndChoices]);

  // Set up drag and drop for each bucket
  useEffect(() => {
    bucketRefs.current.forEach((bucketRef, bucketIdx) => {
      if (!bucketRef) return;

      const cleanup = dragAndDrop({
        parent: bucketRef,
        getValues: () =>
          (previewAssignments[bucketIdx] || []).map((idx) => getChoiceLabel(idx)),
        setValues: (newValues) => {
          // Handle drops into bucket
          const newIndices = newValues
            .map((label) =>
              dndChoices.findIndex((choice) => choice.label === label),
            )
            .filter((idx) => idx !== -1);

          // For table DND, only allow one choice per bucket
          if (newIndices.length > 1) {
            // Keep only the first item
            const restrictedIndices = [newIndices[0]];
            setPreviewAssignments((prev) => ({
              ...prev,
              [bucketIdx]: restrictedIndices,
            }));

            // Update pool choices
            const allAssignedIndices = Object.values(previewAssignments)
              .flat()
              .filter((idx) => idx !== bucketIdx)
              .concat(restrictedIndices);
            const remainingPoolChoices = dndChoices
              .map((_, idx) => idx)
              .filter((idx) => !allAssignedIndices.includes(idx));
            setPoolChoices(remainingPoolChoices);
            return;
          }

          setPreviewAssignments((prev) => ({
            ...prev,
            [bucketIdx]: newIndices,
          }));

          // Update pool choices by removing items that are now in buckets
          const allAssignedIndices = Object.entries(previewAssignments)
            .filter(([key]) => parseInt(key) !== bucketIdx)
            .flatMap(([, indices]) => indices)
            .concat(newIndices);
          const remainingPoolChoices = dndChoices
            .map((_, idx) => idx)
            .filter((idx) => !allAssignedIndices.includes(idx));
          setPoolChoices(remainingPoolChoices);
        },
        config: {
          group: "table-dnd-group",
          sortable: true,
        },
      });

      return cleanup;
    });
  }, [previewAssignments, dndChoices, setPreviewAssignments, setPoolChoices]);

  const removeFromBucket = (bucketIdx: number) => {
    const assignedChoices = previewAssignments[bucketIdx] || [];
    if (assignedChoices.length > 0) {
      const choiceIdx = assignedChoices[0];
      
      // Add back to pool
      setPoolChoices(prev => [...prev, choiceIdx]);
      
      // Remove from bucket
      setPreviewAssignments(prev => {
        const newAssignments = { ...prev };
        delete newAssignments[bucketIdx];
        return newAssignments;
      });
    }
  };

  const availableChoices = dndChoices.filter((_, idx) => poolChoices.includes(idx));

  return (
    <div className="space-y-4">
      <div className="text-base font-medium mb-4">{dndQuestion}</div>
      
      {/* Answer Pool */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Answer Pool:</h4>
        <div 
          ref={poolRef}
          className="border border-gray-300 rounded p-3 bg-gray-50 min-h-[60px]"
        >
          {availableChoices.map((choice, idx) => (
            <div
              key={`choice-${idx}`}
              className="bg-blue-100 text-blue-800 px-3 py-2 rounded-md text-sm font-medium inline-block mr-2 mb-2 cursor-move break-words overflow-wrap-anywhere max-w-full"
            >
              {choice.label}
            </div>
          ))}
          {availableChoices.length === 0 && (
            <div className="text-gray-400 italic text-sm">No answers available</div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Table:</h4>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-3 text-left font-medium">{(tableColumnHeaders?.[0] || 'Row')}</th>
              <th className="border border-gray-300 p-3 text-left font-medium">{(tableColumnHeaders?.[1] || 'Answer')}</th>
            </tr>
          </thead>
          <tbody>
            {dndBuckets.map((bucket, bucketIdx) => {
              const assignedChoiceIdx = previewAssignments[bucketIdx]?.[0];
              const assignedChoice = assignedChoiceIdx !== undefined ? dndChoices[assignedChoiceIdx] : null;
              
              return (
                <tr key={bucketIdx}>
                  <td className="border border-gray-300 p-3 font-medium">
                    {bucket.label}
                  </td>
                  <td className="border border-gray-300 p-3">
                    <div 
                      ref={(el) => (bucketRefs.current[bucketIdx] = el)}
                      className="min-h-[60px] border-2 border-dashed border-gray-300 rounded p-2 flex items-center justify-center"
                    >
                      {assignedChoice ? (
                        <div className="bg-green-100 text-green-800 px-3 py-2 rounded-md text-sm font-medium break-words overflow-wrap-anywhere max-w-full">
                          {assignedChoice.label}
                        </div>
                      ) : (
                        <div className="text-gray-400 italic text-sm">
                          Drop answer here
                        </div>
                      )}
                    </div>
                    {assignedChoice && !isPreview && (
                      <button
                        type="button"
                        onClick={() => removeFromBucket(bucketIdx)}
                        className="mt-2 text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 