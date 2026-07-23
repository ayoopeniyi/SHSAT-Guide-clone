import { useState } from "react";
import { MCChoice, MCVariant } from "../types";

export const useMCState = () => {
  const [mcQuestion, setMcQuestion] = useState("");
  const [mcChoices, setMcChoices] = useState<MCChoice[]>([
    {
      letter: "A",
      value: { text: "", is_correct: false, choice_image_url: undefined },
    },
    {
      letter: "B",
      value: { text: "", is_correct: false, choice_image_url: undefined },
    },
  ]);
  const [mcExplanation, setMcExplanation] = useState("");
  const [mcVariant, setMcVariant] = useState<MCVariant>("standard");

  const addMcChoice = () => {
    const nextLabel = String.fromCharCode(65 + mcChoices.length);
    const newChoices = [
      ...mcChoices,
      {
        letter: nextLabel,
        value: { text: "", is_correct: false, choice_image_url: undefined },
      },
    ];
    setMcChoices(newChoices);
  };

  const removeMcChoice = (idx: number) => {
    setMcChoices(mcChoices.filter((_, i) => i !== idx));
  };

  const updateMcChoice = (
    idx: number,
    field: "text" | "is_correct" | "explanation" | "choice_image_url",
    value: any,
  ) => {
    setMcChoices(
      mcChoices.map((c, i) => {
        if (i === idx) {
          // Create a new value object with the updated field
          const updatedValue = { ...c.value };

          // If updating choice_image_url, ensure we're not duplicating it
          if (field === "choice_image_url") {
            updatedValue.choice_image_url = value || undefined; // Convert null to undefined
          } else {
            updatedValue[field] = value;
          }

          return { ...c, value: updatedValue };
        }
        return c;
      }),
    );
  };

  const setCorrectChoice = (idx: number) => {
    setMcChoices(
      mcChoices.map((c, i) => ({
        ...c,
        value: { ...c.value, is_correct: i === idx },
      })),
    );
  };

  const mcValid =
    typeof mcQuestion === "string" &&
    mcQuestion.trim().length > 0 &&
    mcChoices.length >= 2 &&
    mcChoices.some((c) => c.value.is_correct) &&
    mcChoices.every(
      (c) =>
        c.value.text &&
        typeof c.value.text === "string" &&
        c.value.text.trim().length > 0,
    );

  const resetMCState = () => {
    setMcQuestion("");
    setMcChoices([
      {
        letter: "A",
        value: { text: "", is_correct: false, choice_image_url: undefined },
      },
      {
        letter: "B",
        value: { text: "", is_correct: false, choice_image_url: undefined },
      },
    ]);
    setMcExplanation("");
    setMcVariant("standard");
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
    mcValid,
    resetMCState,
  };
};
