import { useState } from "react";

export const useMAState = () => {
  const [maQuestion, setMaQuestion] = useState("");
  const [maChoices, setMaChoices] = useState([
    {
      choice_label: "A",
      choice_text: "",
      is_correct: false,
      explanation: "",
      choice_image_url: undefined,
      id: undefined,
    },
    {
      choice_label: "B",
      choice_text: "",
      is_correct: false,
      explanation: "",
      choice_image_url: undefined,
      id: undefined,
    },
    {
      choice_label: "C",
      choice_text: "",
      is_correct: false,
      explanation: "",
      choice_image_url: undefined,
      id: undefined,
    },
  ]);
  const [maExplanation, setMaExplanation] = useState("");

  const addMaChoice = () => {
    const nextLabel = String.fromCharCode(65 + maChoices.length);
    const newChoices = [
      ...maChoices,
      {
        choice_label: nextLabel,
        choice_text: "",
        is_correct: false,
        explanation: "",
        choice_image_url: undefined,
        id: undefined,
      },
    ];
    setMaChoices(newChoices);
  };

  const removeMaChoice = (idx: number) => {
    if (maChoices.length > 3)
      setMaChoices(maChoices.filter((_, i) => i !== idx));
  };

  const updateMaChoice = (
    idx: number,
    field: "choice_text" | "is_correct" | "explanation" | "choice_image_url",
    value: any,
  ) => {
    setMaChoices(
      maChoices.map((c, i) => (i === idx ? { ...c, [field]: value } : c)),
    );
  };

  const maValid =
    typeof maQuestion === "string" &&
    maQuestion.length > 0 &&
    maChoices.length >= 3 &&
    maChoices.filter((c) => c.is_correct).length >= 2 &&
    maChoices.every(
      (c) =>
        c.choice_text &&
        typeof c.choice_text === "string" &&
        c.choice_text.trim().length > 0,
    );

  const resetMAState = () => {
    setMaQuestion("");
    setMaExplanation("");
    setMaChoices([
      {
        choice_label: "A",
        choice_text: "",
        is_correct: false,
        explanation: "",
        choice_image_url: undefined,
        id: undefined,
      },
      {
        choice_label: "B",
        choice_text: "",
        is_correct: false,
        explanation: "",
        choice_image_url: undefined,
        id: undefined,
      },
      {
        choice_label: "C",
        choice_text: "",
        is_correct: false,
        explanation: "",
        choice_image_url: undefined,
        id: undefined,
      },
    ]);
  };

  return {
    maQuestion,
    setMaQuestion,
    maChoices,
    setMaChoices,
    maExplanation,
    setMaExplanation,
    addMaChoice,
    removeMaChoice,
    updateMaChoice,
    maValid,
    resetMAState,
  };
};
