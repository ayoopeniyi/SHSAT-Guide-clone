import React from "react";
import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import { DnDSubtype } from "../types";
import { ChoiceTagPills } from "../../question-card/ChoiceTagPills";
import type { ChoiceTag } from "../../../services/tagService";

interface FormKitDnDReadOnlyProps {
  dndQuestion: string;
  dndChoices: any[];
  dndBuckets: any[];
  assignments?: any[];
  dndSubtype?: DnDSubtype;
  choiceTags?: Record<string, ChoiceTag[]>;
}

interface DraggableChoice {
  id: number;
  label: string;
  type: "choice";
}

export const FormKitDnDReadOnly: React.FC<FormKitDnDReadOnlyProps> = ({
  dndQuestion,
  dndChoices,
  dndBuckets,
  assignments = [],
  dndSubtype = "single_assignment",
  choiceTags,
}) => {
  /* console.log("🔍 [FormKitDnDReadOnly] Received props:", {
    dndSubtype,
    dndBuckets,
    dndChoices,
    assignments
  }); */

  /* console.log("🔍 [FormKitDnDReadOnly] Conditional rendering check:", {
    isOneBucket: dndSubtype === "one_bucket_multi" || dndSubtype === "one_bucket_single",
    shouldShowSecondBucket: dndSubtype !== "one_bucket_multi" && dndSubtype !== "one_bucket_single"
  }); */
  // Show ALL choices in the pool - assignments are for backend only
  const poolItems: DraggableChoice[] = dndChoices.map((choice) => ({
    id: choice.id,
    label: choice.label,
    type: "choice",
  }));

  // Set up drag and drop for choice pool (draggable only, no drops)
  const [poolRef, poolValues] = useDragAndDrop<HTMLDivElement, DraggableChoice>(
    poolItems,
    {
      sortable: false,
      dragHandle: ".drag-handle", // Require specific handle for dragging
    },
  );

  return (
    <div className="space-y-3">
      {/* Choice Pool */}
      <div>
        <div className="font-semibold mb-1 text-gray-700">Choices Pool</div>
        <div
          ref={poolRef}
          className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-white inline-flex flex-wrap gap-2 min-h-[60px] items-start"
          style={{ minWidth: "fit-content", width: "auto" }}
        >
          {poolValues.map((choice) => {
            const tags = choiceTags?.[String(choice.id)] || [];
            return (
              <div
                key={choice.id}
                data-label={choice.label}
                className="drag-handle px-2 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded-md text-sm font-medium cursor-move transition-all hover:bg-blue-200 hover:shadow-md break-words overflow-wrap-anywhere max-w-full"
              >
                {choice.label}
                <ChoiceTagPills tags={tags} />
              </div>
            );
          })}
          {poolValues.length === 0 && (
            <div className="text-gray-400 text-sm italic py-3 px-4">
              All choices have been assigned
            </div>
          )}
        </div>
      </div>

      {/* Buckets */}
      <div>
        {dndSubtype === "table_dnd" ? (
          // Table DND rendering
          <div>
            <div className="font-semibold mb-1 text-gray-700">Table:</div>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b border-gray-200">Row</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b border-gray-200">Answer</th>
                  </tr>
                </thead>
                <tbody>
                  {dndBuckets.map((bucket, index) => (
                    <tr key={index} className="border-b border-gray-200 last:border-b-0">
                      <td className="px-3 py-2 text-sm text-gray-900 font-medium">
                        {bucket.label}
                      </td>
                      <td className="px-3 py-2">
                        <div className="border-2 border-dashed border-gray-300 rounded p-3 min-h-[60px] bg-white">
                          <div className="text-gray-400 text-sm italic text-center">
                            Drop answer here
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Regular bucket rendering
          <>
            <div className="font-semibold mb-1 text-gray-700">
              {(dndSubtype === "one_bucket_multi" || dndSubtype === "one_bucket_single") ? "Bucket" : "Buckets"}
            </div>
            <div
              className={
                (dndSubtype === "one_bucket_multi" || dndSubtype === "one_bucket_single")
                  ? "grid grid-cols-1 gap-3 w-1/2"
                  : "grid grid-cols-2 gap-3"
              }
            >
              {/* Bucket 0 */}
              <div>
                <div className="font-medium mb-1 text-gray-600">
                  {dndBuckets[0]?.label || "Bucket 1"}
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 min-h-[80px] bg-white">
                  <div className="text-gray-400 text-sm italic w-full text-center py-3">
                    Drag choices here
                  </div>
                </div>
              </div>

              {/* Bucket 1 - Only show for two bucket modes */}
              {(dndSubtype !== "one_bucket_multi" && dndSubtype !== "one_bucket_single") && (
                <div>
                  <div className="font-medium mb-1 text-gray-600">
                    {dndBuckets[1]?.label || "Bucket 2"}
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 min-h-[80px] bg-white">
                    <div className="text-gray-400 text-sm italic w-full text-center py-3">
                      Drag choices here
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

