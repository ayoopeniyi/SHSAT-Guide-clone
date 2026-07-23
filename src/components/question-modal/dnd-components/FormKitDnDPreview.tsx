import React, { useEffect, useRef, useState } from "react";
import { dragAndDrop } from "@formkit/drag-and-drop";
import { DnDSubtype } from "../types";

interface FormKitDnDPreviewProps {
  dndQuestion: string;
  dndChoices: any[];
  dndBuckets: any[];
  poolChoices: number[];
  setPoolChoices: React.Dispatch<React.SetStateAction<number[]>>;
  previewAssignments: { [bucketIdx: number]: number[] };
  setPreviewAssignments: React.Dispatch<
    React.SetStateAction<{ [bucketIdx: number]: number[] }>
  >;
  dndSubtype?: DnDSubtype;
}

export const FormKitDnDPreview: React.FC<FormKitDnDPreviewProps> = ({
  dndQuestion,
  dndChoices,
  dndBuckets,
  poolChoices,
  setPoolChoices,
  previewAssignments,
  setPreviewAssignments,
  dndSubtype = "single_assignment",
}) => {
  const poolRef = useRef<HTMLDivElement>(null);
  const bucket0Ref = useRef<HTMLDivElement>(null);
  const bucket1Ref = useRef<HTMLDivElement>(null);

  // State for validation warnings (only for single assignment mode)
  const [validationWarning, setValidationWarning] = useState<{
    bucketIdx: number;
    message: string;
  } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper function to get choice label from index
  const getChoiceLabel = (idx: number) => {
    return dndChoices[idx]?.label || `Choice ${idx + 1}`;
  };

  // Validation function
  const validateAssignments = () => {
    if (dndSubtype === "two_buckets_single") {
      // For single assignment, each choice should be in exactly one bucket
      const assignedChoices = new Set();
      Object.values(previewAssignments).forEach((choices) => {
        choices.forEach((choiceIdx) => assignedChoices.add(choiceIdx));
      });
      if (assignedChoices.size !== dndChoices.length) {
        return {
          valid: false,
          message: "Each choice must be assigned to exactly one bucket.",
        };
      }
    } else if (dndSubtype === "two_buckets_multi") {
      // For multi assignment, each bucket should have at least one choice
      if (
        Object.values(previewAssignments).some(
          (choices) => choices.length === 0,
        )
      ) {
        return {
          valid: false,
          message: "Each bucket must have at least one choice.",
        };
      }
    } else if (dndSubtype === "one_bucket_multi") {
      // For one bucket multi, the bucket should have at least one choice
      if (!previewAssignments[0] || previewAssignments[0].length === 0) {
        return {
          valid: false,
          message: "The bucket must have at least one choice.",
        };
      }
    }
    return { valid: true };
  };

  // Set up drag and drop for pool
  useEffect(() => {
    if (!poolRef.current) return;

    const cleanup = dragAndDrop({
      parent: poolRef.current,
      getValues: () => poolChoices.map((idx) => idx.toString()),
      setValues: (newValues) => {
        // This will be handled by the transfer logic
      },
      config: {
        group: "dnd-preview-group",
        sortable: false,
      },
    });

    return cleanup;
  }, [poolChoices, dndChoices]);

  // Set up drag and drop for bucket 0
  useEffect(() => {
    if (!bucket0Ref.current) return;

    const cleanup = dragAndDrop({
      parent: bucket0Ref.current,
      getValues: () =>
        (previewAssignments[0] || []).map((idx) => idx.toString()),
      setValues: (newValues) => {
        // Handle drops into bucket 0
        const newIndices = newValues
          .map((idxStr) => parseInt(idxStr, 10))
          .filter((idx) => !isNaN(idx) && idx >= 0 && idx < dndChoices.length);

        // Validation for single assignment mode (only after initialization)
        // Handle both old database values and new frontend values
        const isSingleAssignment =
          dndSubtype === "single_assignment" ||
          (dndSubtype as any) === "two_buckets_single" ||
          (dndSubtype as any) === "one_bucket_single";
        if (isInitialized && isSingleAssignment) {
          const currentBucket0Count = (previewAssignments[0] || []).length;
          const newBucket0Count = newIndices.length;

          /* console.log("Bucket 0 validation check:", {
            isInitialized,
            dndSubtype,
            isSingleAssignment,
            bucketsLength: dndBuckets.length,
            currentBucket0Count,
            newBucket0Count,
            newIndices,
          }); */

          // If trying to add more than one choice to bucket 0
          if (newBucket0Count > 1) {
            setValidationWarning({
              bucketIdx: 0,
              message:
                "Only one choice allowed per bucket in single assignment mode!",
            });

            // Auto-hide warning after 3 seconds
            setTimeout(() => setValidationWarning(null), 3000);

            // Don't allow the drop - keep only the first item
            const restrictedIndices = [newIndices[0]];
            setPreviewAssignments((prev) => ({
              ...prev,
              0: restrictedIndices,
            }));

            // Update pool choices
            const allAssignedIndices = [
              ...restrictedIndices,
              ...(previewAssignments[1] || []),
            ];
            const remainingPoolChoices = dndChoices
              .map((_, idx) => idx)
              .filter((idx) => !allAssignedIndices.includes(idx));
            setPoolChoices(remainingPoolChoices);
            return;
          }
        }

        // Clear any existing warning if drop is valid
        setValidationWarning(null);

        setPreviewAssignments((prev) => ({
          ...prev,
          0: newIndices,
        }));

        // Update pool choices by removing items that are now in buckets
        const allAssignedIndices = [
          ...newIndices,
          ...(previewAssignments[1] || []),
        ];
        const remainingPoolChoices = dndChoices
          .map((_, idx) => idx)
          .filter((idx) => !allAssignedIndices.includes(idx));
        setPoolChoices(remainingPoolChoices);
      },
      config: {
        group: "dnd-preview-group",
        sortable: true,
      },
    });

    return cleanup;
  }, [
    previewAssignments,
    dndChoices,
    setPreviewAssignments,
    setPoolChoices,
    dndSubtype,
    dndBuckets,
  ]);

  // Set up drag and drop for bucket 1 (if needed)
  useEffect(() => {
    if ((dndSubtype === "one_bucket_multi" || dndSubtype === "one_bucket_single") || !bucket1Ref.current) return;

    const cleanup = dragAndDrop({
      parent: bucket1Ref.current,
      getValues: () =>
        (previewAssignments[1] || []).map((idx) => idx.toString()),
      setValues: (newValues) => {
        // Handle drops into bucket 1
        const newIndices = newValues
          .map((idxStr) => parseInt(idxStr, 10))
          .filter((idx) => !isNaN(idx) && idx >= 0 && idx < dndChoices.length);

        // Validation for single assignment mode (only after initialization)
        // Handle both old database values and new frontend values
        const isSingleAssignment =
          dndSubtype === "single_assignment" ||
          (dndSubtype as any) === "two_buckets_single";
        if (isInitialized && isSingleAssignment) {
          const currentBucket1Count = (previewAssignments[1] || []).length;
          const newBucket1Count = newIndices.length;

          /* console.log("Bucket 1 validation check:", {
            isInitialized,
            dndSubtype,
            isSingleAssignment,
            bucketsLength: dndBuckets.length,
            currentBucket1Count,
            newBucket1Count,
            newIndices,
          }); */

          // If trying to add more than one choice to bucket 1
          if (newBucket1Count > 1) {
            setValidationWarning({
              bucketIdx: 1,
              message:
                "Only one choice allowed per bucket in single assignment mode!",
            });

            // Auto-hide warning after 3 seconds
            setTimeout(() => setValidationWarning(null), 3000);

            // Don't allow the drop - keep only the first item
            const restrictedIndices = [newIndices[0]];
            setPreviewAssignments((prev) => ({
              ...prev,
              1: restrictedIndices,
            }));

            // Update pool choices
            const allAssignedIndices = [
              ...(previewAssignments[0] || []),
              ...restrictedIndices,
            ];
            const remainingPoolChoices = dndChoices
              .map((_, idx) => idx)
              .filter((idx) => !allAssignedIndices.includes(idx));
            setPoolChoices(remainingPoolChoices);
            return;
          }
        }

        // Clear any existing warning if drop is valid
        setValidationWarning(null);

        setPreviewAssignments((prev) => ({
          ...prev,
          1: newIndices,
        }));

        // Update pool choices by removing items that are now in buckets
        const allAssignedIndices = [
          ...(previewAssignments[0] || []),
          ...newIndices,
        ];
        const remainingPoolChoices = dndChoices
          .map((_, idx) => idx)
          .filter((idx) => !allAssignedIndices.includes(idx));
        setPoolChoices(remainingPoolChoices);
      },
      config: {
        group: "dnd-preview-group",
        sortable: true,
      },
    });

    return cleanup;
  }, [
    previewAssignments,
    dndChoices,
    setPreviewAssignments,
    setPoolChoices,
    dndSubtype,
    dndBuckets,
  ]);

  // Reset preview assignments when choices change to keep live preview independent
  useEffect(() => {
    // Reset preview to show all choices in pool (student starting state)
    setPoolChoices(dndChoices.map((_, idx) => idx));
    setPreviewAssignments({});
    setValidationWarning(null); // Clear any warnings on reset
    setIsInitialized(true); // Mark as initialized after first reset
  }, [dndChoices, setPoolChoices, setPreviewAssignments]);

  // Additional initialization when dndSubtype changes (for edit mode)
  useEffect(() => {
    if (dndSubtype && dndChoices.length > 0) {
      /* console.log("Setting isInitialized to true:", {
        dndSubtype,
        choicesLength: dndChoices.length,
      }); */
      setIsInitialized(true);
    }
  }, [dndSubtype, dndChoices.length]);

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-4">
      {/* Question */}
      <div className="text-base font-medium text-gray-900">
        {typeof dndQuestion === "string"
          ? dndQuestion
          : (dndQuestion as any)?.question || "Drag and Drop Question"}
      </div>

      {/* Choice Pool */}
      <div>
        <div className="font-semibold mb-2 text-gray-700">Choices Pool</div>
        <div
          ref={poolRef}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white transition-colors hover:border-blue-400 hover:bg-blue-50 inline-flex flex-wrap gap-2 min-h-[80px] items-start"
          style={{ minWidth: "fit-content", width: "auto" }}
        >
          {poolChoices.map((choiceIdx) => (
            <div
              key={choiceIdx}
              data-value={choiceIdx.toString()}
              className="inline-flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-800 border border-blue-300 rounded-md text-sm font-medium cursor-grab active:cursor-grabbing transition-all hover:bg-blue-200 hover:shadow-md transform hover:scale-105 select-none break-words overflow-wrap-anywhere max-w-full"
              style={{ width: "auto", maxWidth: "fit-content" }}
            >
              {getChoiceLabel(choiceIdx)}
            </div>
          ))}
          {poolChoices.length === 0 && (
            <div className="text-gray-400 text-sm italic py-4 px-4 pointer-events-none">
              All choices have been assigned
            </div>
          )}
        </div>
      </div>

      {/* Buckets */}
      <div>
        <div className="font-semibold mb-2 text-gray-700">
          {(dndSubtype === "one_bucket_multi" || dndSubtype === "one_bucket_single") ? "Bucket" : "Buckets"}
        </div>
        <div
          className={
            (dndSubtype === "one_bucket_multi" || dndSubtype === "one_bucket_single")
              ? "grid grid-cols-1 gap-4 w-1/2"
              : "grid grid-cols-2 gap-4"
          }
        >
          {/* Bucket 0 */}
          <div>
            <div className="font-medium mb-2 text-gray-600">
              {dndBuckets[0]?.label || "Bucket 1"}
            </div>
            <div
              ref={bucket0Ref}
              className={`border-2 border-dashed rounded-lg p-4 min-h-[100px] bg-white transition-colors flex flex-wrap gap-2 items-start ${
                validationWarning?.bucketIdx === 0
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300 hover:border-green-400 hover:bg-green-50"
              }`}
            >
              {(previewAssignments[0] || []).map((choiceIdx) => (
                <div
                  key={choiceIdx}
                  data-value={choiceIdx.toString()}
                  className="inline-flex items-center justify-center px-3 py-2 bg-green-100 text-green-800 border border-green-300 rounded-md text-sm font-medium cursor-grab active:cursor-grabbing transition-all hover:bg-green-200 hover:shadow-md transform hover:scale-105 select-none break-words overflow-wrap-anywhere max-w-full"
                  style={{ width: "auto", maxWidth: "fit-content" }}
                >
                  {getChoiceLabel(choiceIdx)}
                </div>
              ))}
              {(previewAssignments[0] || []).length === 0 && (
                <div className="text-gray-400 text-sm italic w-full text-center py-4 pointer-events-none">
                  Drop choices here
                </div>
              )}
            </div>
            {/* Validation warning for bucket 0 */}
            {validationWarning?.bucketIdx === 0 && (
              <div className="mt-2 p-2 bg-red-100 border border-red-400 rounded-md">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-red-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-red-800 text-sm font-medium">
                    {validationWarning.message}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bucket 1 - Only show for two bucket modes */}
          {(dndSubtype !== "one_bucket_multi" && dndSubtype !== "one_bucket_single") && (
            <div>
              <div className="font-medium mb-2 text-gray-600">
                {dndBuckets[1]?.label || "Bucket 2"}
              </div>
              <div
                ref={bucket1Ref}
                className={`border-2 border-dashed rounded-lg p-4 min-h-[100px] bg-white transition-colors flex flex-wrap gap-2 items-start ${
                  validationWarning?.bucketIdx === 1
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 hover:border-green-400 hover:bg-green-50"
                }`}
              >
                {(previewAssignments[1] || []).map((choiceIdx) => (
                  <div
                    key={choiceIdx}
                    data-value={choiceIdx.toString()}
                    className="inline-flex items-center justify-center px-3 py-2 bg-green-100 text-green-800 border border-green-300 rounded-md text-sm font-medium cursor-grab active:cursor-grabbing transition-all hover:bg-green-200 hover:shadow-md transform hover:scale-105 select-none break-words overflow-wrap-anywhere max-w-full"
                    style={{ width: "auto", maxWidth: "fit-content" }}
                  >
                    {getChoiceLabel(choiceIdx)}
                  </div>
                ))}
                {(previewAssignments[1] || []).length === 0 && (
                  <div className="text-gray-400 text-sm italic w-full text-center py-4 pointer-events-none">
                    Drop choices here
                  </div>
                )}
              </div>
              {/* Validation warning for bucket 1 */}
              {validationWarning?.bucketIdx === 1 && (
                <div className="mt-2 p-2 bg-red-100 border border-red-400 rounded-md">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-red-600 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-red-800 text-sm font-medium">
                      {validationWarning.message}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
