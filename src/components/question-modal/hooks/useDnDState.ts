import { useState } from "react";
import { DnDBucket, DnDChoice } from "../types";

export const useDnDState = () => {
  const [dndQuestion, setDndQuestion] = useState("");
  const [dndBuckets, setDndBuckets] = useState<DnDBucket[]>([
    { label: "Even Numbers", bucket_order: 0 },
    { label: "Odd Numbers", bucket_order: 1 },
  ]);
  const [dndChoices, setDndChoices] = useState<DnDChoice[]>([
    { label: "2", choice_order: 0 },
    { label: "3", choice_order: 1 },
    { label: "4", choice_order: 2 },
    { label: "5", choice_order: 3 },
  ]);
  const [dndCorrectAssignments, setDndCorrectAssignments] = useState<{
    [bucketIdx: number]: number[];
  }>({
    0: [0, 2], // Even numbers (2, 4) go to bucket 0
    1: [1, 3], // Odd numbers (3, 5) go to bucket 1
  });
  const [dndStudentAssignments, setDndStudentAssignments] = useState<{
    [bucketIdx: number]: number | null;
  }>({ 0: null, 1: null });
  const [dndExplanation, setDndExplanation] = useState("");
  const [poolChoices, setPoolChoices] = useState<number[]>(() => []);
  const [previewAssignments, setPreviewAssignments] = useState<{
    [bucketIdx: number]: number[];
  }>(() => {
    const initial: { [bucketIdx: number]: number[] } = {};
    [0, 1].forEach((idx) => {
      initial[idx] = [];
    });
    return initial;
  });

  const addDndChoice = () => {
    setDndChoices([
      ...dndChoices,
      { label: "", choice_order: dndChoices.length },
    ]);
  };

  const removeDndChoice = (idx: number) => {
    // Remove the choice
    setDndChoices(dndChoices.filter((_, i) => i !== idx));

    // Clean up assignments that reference this choice index
    setDndCorrectAssignments((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((bucketIdx) => {
        const bucketId = Number(bucketIdx);
        // Remove the deleted choice index and adjust remaining indices
        updated[bucketId] = updated[bucketId]
          .filter((choiceIdx) => choiceIdx !== idx) // Remove the deleted choice
          .map((choiceIdx) => (choiceIdx > idx ? choiceIdx - 1 : choiceIdx)); // Adjust indices
      });
      return updated;
    });

    // Also clean up poolChoices and previewAssignments
    setPoolChoices(
      (prev) =>
        prev
          .filter((choiceIdx) => choiceIdx !== idx) // Remove the deleted choice
          .map((choiceIdx) => (choiceIdx > idx ? choiceIdx - 1 : choiceIdx)), // Adjust indices
    );

    setPreviewAssignments((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((bucketIdx) => {
        const bucketId = Number(bucketIdx);
        updated[bucketId] = updated[bucketId]
          .filter((choiceIdx) => choiceIdx !== idx) // Remove the deleted choice
          .map((choiceIdx) => (choiceIdx > idx ? choiceIdx - 1 : choiceIdx)); // Adjust indices
      });
      return updated;
    });
  };

  const updateDndChoice = (idx: number, label: string) => {
    setDndChoices(dndChoices.map((c, i) => (i === idx ? { ...c, label } : c)));
  };

  const updateDndBucket = (idx: number, label: string) => {
    setDndBuckets(dndBuckets.map((b, i) => (i === idx ? { ...b, label } : b)));
  };

  // Function to validate based on subtype
  const getDndValid = (subtype?: string) => {
    const basicValid =
      typeof dndQuestion === "string" &&
      dndQuestion.trim().length > 0 &&
      dndChoices.length >= 2 &&
      dndChoices.every(
        (c) => c && typeof c.label === "string" && c.label.trim().length > 0,
      );

    if (subtype === "one_bucket_multi") {
      return (
        basicValid &&
        dndBuckets.length >= 1 &&
        dndBuckets[0] &&
        typeof dndBuckets[0].label === "string" &&
        dndBuckets[0].label.trim().length > 0 &&
        dndCorrectAssignments[0]?.length > 0
      );
    } else {
      return (
        basicValid &&
        dndBuckets.length === 2 &&
        dndBuckets.every(
          (b) => b && typeof b.label === "string" && b.label.trim().length > 0,
        ) &&
        dndCorrectAssignments[0]?.length > 0 &&
        dndCorrectAssignments[1]?.length > 0
      );
    }
  };

  const dndValid = getDndValid();

  const resetDnDState = () => {
    setDndQuestion("");
    setDndBuckets([
      { label: "Even Numbers", bucket_order: 0 },
      { label: "Odd Numbers", bucket_order: 1 },
    ]);
    setDndChoices([
      { label: "2", choice_order: 0 },
      { label: "3", choice_order: 1 },
      { label: "4", choice_order: 2 },
      { label: "5", choice_order: 3 },
    ]);
    setDndCorrectAssignments({ 0: [0, 2], 1: [1, 3] });
    setDndStudentAssignments({ 0: null, 1: null });
    setDndExplanation("");
  };

  return {
    dndQuestion,
    setDndQuestion,
    dndBuckets,
    setDndBuckets,
    dndChoices,
    setDndChoices,
    dndCorrectAssignments,
    setDndCorrectAssignments,
    dndStudentAssignments,
    setDndStudentAssignments,
    dndExplanation,
    setDndExplanation,
    poolChoices,
    setPoolChoices,
    previewAssignments,
    setPreviewAssignments,
    addDndChoice,
    removeDndChoice,
    updateDndChoice,
    updateDndBucket,
    dndValid,
    getDndValid,
    resetDnDState,
  };
};
