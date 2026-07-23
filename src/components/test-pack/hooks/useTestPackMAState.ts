import { useState } from "react";

export interface TestPackMAChoice {
  id?: number;
  choice_label: string;
  choice_text: string;
  is_correct: boolean;
  choice_image_url?: string;
}

export const useTestPackMAState = () => {
  const [maQuestion, setMaQuestion] = useState("");
  const [maChoices, setMaChoices] = useState<TestPackMAChoice[]>([
    { choice_label: "A", choice_text: "", is_correct: false },
    { choice_label: "B", choice_text: "", is_correct: false },
    { choice_label: "C", choice_text: "", is_correct: false },
    { choice_label: "D", choice_text: "", is_correct: false },
  ]);

  const resetMAState = () => {
    setMaQuestion("");
    setMaChoices([
      { choice_label: "A", choice_text: "", is_correct: false },
      { choice_label: "B", choice_text: "", is_correct: false },
      { choice_label: "C", choice_text: "", is_correct: false },
      { choice_label: "D", choice_text: "", is_correct: false },
    ]);
  };

  const addMaChoice = () => {
    const nextLabel = String.fromCharCode(65 + maChoices.length); // A, B, C, D, E, etc.
    setMaChoices((prev) => [
      ...prev,
      { choice_label: nextLabel, choice_text: "", is_correct: false },
    ]);
  };

  const removeMaChoice = (index: number) => {
    if (maChoices.length > 2) {
      // Minimum 2 choices
      setMaChoices((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateMaChoice = (
    index: number,
    updates: Partial<TestPackMAChoice>,
  ) => {
    setMaChoices((prev) =>
      prev.map((choice, i) =>
        i === index ? { ...choice, ...updates } : choice,
      ),
    );
  };

  const validateMA = () => {
    if (!maQuestion.trim()) return false;
    if (maChoices.length < 2) return false;
    if (maChoices.some((choice) => !choice.choice_text.trim())) return false;
    // At least one correct answer required for MA
    const correctCount = maChoices.filter((choice) => choice.is_correct).length;
    if (correctCount === 0) return false;
    return true;
  };

  return {
    maQuestion,
    setMaQuestion,
    maChoices,
    setMaChoices,
    addMaChoice,
    removeMaChoice,
    updateMaChoice,
    resetMAState,
    maValid: validateMA(),
  };
};
