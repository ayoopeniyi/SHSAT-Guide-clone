import { useState } from "react";

export type BlankVariant = "placeholder" | "fill_box";

export interface TestPackBlankState {
  blankQuestion: string;
  blankCorrectAnswer: string;
  blankVariant: BlankVariant;
}

export const useTestPackBlankState = () => {
  const [blankQuestion, setBlankQuestion] = useState("");
  const [blankCorrectAnswer, setBlankCorrectAnswer] = useState("");
  const [blankVariant, setBlankVariant] = useState<BlankVariant>("placeholder");

  const resetBlankState = () => {
    setBlankQuestion("");
    setBlankCorrectAnswer("");
    setBlankVariant("placeholder");
  };

  const blankValid =
    blankQuestion.trim() !== "" && blankCorrectAnswer.trim() !== "";

  return {
    blankQuestion,
    setBlankQuestion,
    blankCorrectAnswer,
    setBlankCorrectAnswer,
    blankVariant,
    setBlankVariant,
    resetBlankState,
    blankValid,
  };
};
