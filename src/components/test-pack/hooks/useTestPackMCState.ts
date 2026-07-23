import { useState } from "react";

export interface TestPackMCChoiceValue {
  id?: number;
  text: string;
  is_correct: boolean;
  choice_image_url?: string;
}

export interface TestPackMCChoice {
  letter: string;
  value: TestPackMCChoiceValue;
}

export const useTestPackMCState = () => {
  const [mcQuestion, setMcQuestion] = useState("");
  const [mcChoices, setMcChoices] = useState<TestPackMCChoice[]>([
    { letter: "A", value: { text: "", is_correct: false } },
    { letter: "B", value: { text: "", is_correct: false } },
    { letter: "C", value: { text: "", is_correct: false } },
    { letter: "D", value: { text: "", is_correct: false } },
  ]);
  const [mcExplanation, setMcExplanation] = useState("");
  const [mcVariant, setMcVariant] = useState("standard");

  const resetMCState = () => {
    setMcQuestion("");
    setMcChoices([
      { letter: "A", value: { text: "", is_correct: false } },
      { letter: "B", value: { text: "", is_correct: false } },
      { letter: "C", value: { text: "", is_correct: false } },
      { letter: "D", value: { text: "", is_correct: false } },
    ]);
    setMcExplanation("");
    setMcVariant("standard");
  };

  const addMcChoice = () => {
    const nextLetter = String.fromCharCode(65 + mcChoices.length); // A, B, C, D, E, etc.
    setMcChoices((prev) => [
      ...prev,
      { letter: nextLetter, value: { text: "", is_correct: false } },
    ]);
  };

  const removeMcChoice = (index: number) => {
    if (mcChoices.length > 2) {
      // Minimum 2 choices
      setMcChoices((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateMcChoice = (
    index: number,
    updates: Partial<TestPackMCChoice>,
  ) => {
    setMcChoices((prev) =>
      prev.map((choice, i) =>
        i === index ? { ...choice, ...updates } : choice,
      ),
    );
  };

  const setCorrectChoice = (index: number) => {
    setMcChoices((prev) =>
      prev.map((choice, i) => ({
        ...choice,
        value: { ...choice.value, is_correct: i === index },
      })),
    );
  };

  const validateMC = () => {
    if (!mcQuestion.trim()) return false;
    if (mcChoices.length < 2) return false;
    if (mcChoices.some((choice) => !choice.value.text.trim())) return false;
    // Exactly one correct answer required for MC
    const correctCount = mcChoices.filter(
      (choice) => choice.value.is_correct,
    ).length;
    if (correctCount !== 1) return false;
    return true;
  };

  return {
    mcQuestion,
    setMcQuestion,
    mcChoices,
    setMcChoices,
    mcExplanation,
    setMcExplanation,
    mcVariant,
    setMcVariant,
    addMcChoice,
    removeMcChoice,
    updateMcChoice,
    setCorrectChoice,
    resetMCState,
    mcValid: validateMC(),
  };
};
