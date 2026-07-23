import { useState } from "react";

export interface TestPackTableGridAnswer {
  row_index: number;
  column_index: number;
  is_correct: boolean;
}

export const useTestPackTableGridState = () => {
  const [tgQuestion, setTgQuestion] = useState("");
  const [tgSelectionMode, setTgSelectionMode] = useState<"single" | "multiple">(
    "single",
  );
  const [tgRowLabels, setTgRowLabels] = useState<string[]>(["Row 1", "Row 2"]);
  const [tgColumnLabels, setTgColumnLabels] = useState<string[]>([
    "Column 1",
    "Column 2",
  ]);
  const [tgRowOrder, setTgRowOrder] = useState<number[]>([]);
  const [tgColumnOrder, setTgColumnOrder] = useState<number[]>([]);
  const [tgFirstColumnHeader, setTgFirstColumnHeader] = useState<string>("");
  const [tgAnswerMatrix, setTgAnswerMatrix] = useState<
    TestPackTableGridAnswer[]
  >([]);

  const resetTableGridState = () => {
    setTgQuestion("");
    setTgSelectionMode("single");
    setTgRowLabels(["Row 1", "Row 2"]);
    setTgColumnLabels(["Column 1", "Column 2"]);
    setTgRowOrder([]);
    setTgColumnOrder([]);
    setTgFirstColumnHeader("");
    setTgAnswerMatrix([]);
  };

  const validateTableGrid = () => {
    if (!tgQuestion.trim()) return false;
    if (tgRowLabels.length === 0 || tgColumnLabels.length === 0) return false;
    if (
      tgRowLabels.some((label) => !label.trim()) ||
      tgColumnLabels.some((label) => !label.trim())
    )
      return false;
    // At least one correct answer required
    if (!tgAnswerMatrix.some((answer) => answer.is_correct)) return false;
    return true;
  };

  return {
    tgQuestion,
    setTgQuestion,
    tgSelectionMode,
    setTgSelectionMode,
    tgRowLabels,
    setTgRowLabels,
    tgColumnLabels,
    setTgColumnLabels,
    tgRowOrder,
    setTgRowOrder,
    tgColumnOrder,
    setTgColumnOrder,
    tgFirstColumnHeader,
    setTgFirstColumnHeader,
    tgAnswerMatrix,
    setTgAnswerMatrix,
    resetTableGridState,
    validateTableGrid,
  };
};
