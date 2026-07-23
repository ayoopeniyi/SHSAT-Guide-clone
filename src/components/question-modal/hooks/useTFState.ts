import { useState } from "react";

export const useTFState = () => {
  const [tfQuestion, setTfQuestion] = useState("");
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);
  const [tfExplanation, setTfExplanation] = useState("");

  const tfValid = tfQuestion.trim().length > 0 && tfAnswer !== null;

  const resetTFState = () => {
    setTfQuestion("");
    setTfAnswer(null);
    setTfExplanation("");
  };

  return {
    tfQuestion,
    setTfQuestion,
    tfAnswer,
    setTfAnswer,
    tfExplanation,
    setTfExplanation,
    tfValid,
    resetTFState,
  };
};
