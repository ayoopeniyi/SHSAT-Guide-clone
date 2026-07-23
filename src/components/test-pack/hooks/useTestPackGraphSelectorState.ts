import { useState } from "react";

export interface TestPackGraphSelectorPoint {
  x: number;
  y: number;
  is_correct: boolean;
  point_label?: string;
}

export const useTestPackGraphSelectorState = () => {
  const [gsQuestion, setGsQuestion] = useState("");
  const [gsXMin, setGsXMin] = useState(-5);
  const [gsXMax, setGsXMax] = useState(5);
  const [gsYMin, setGsYMin] = useState(-5);
  const [gsYMax, setGsYMax] = useState(5);
  const [gsMaxSelectablePoints, setGsMaxSelectablePoints] = useState<
    number | undefined
  >(undefined);
  const [gsGraphInstruction, setGsGraphInstruction] = useState("");
  const [gsGraphType, setGsGraphType] = useState("cartesian");
  const [gsShowAxes, setGsShowAxes] = useState(true);
  const [gsShowLabels, setGsShowLabels] = useState(true);
  const [gsSnapToGrid, setGsSnapToGrid] = useState(true);
  const [gsGridInterval, setGsGridInterval] = useState(1.0);
  const [gsXAxisLabel, setGsXAxisLabel] = useState("");
  const [gsYAxisLabel, setGsYAxisLabel] = useState("");
  const [gsPoints, setGsPoints] = useState<TestPackGraphSelectorPoint[]>([]);

  const resetGraphSelectorState = () => {
    setGsQuestion("");
    setGsXMin(-5);
    setGsXMax(5);
    setGsYMin(-5);
    setGsYMax(5);
    setGsMaxSelectablePoints(undefined);
    setGsGraphInstruction("");
    setGsGraphType("cartesian");
    setGsShowAxes(true);
    setGsShowLabels(true);
    setGsSnapToGrid(true);
    setGsGridInterval(1.0);
    setGsXAxisLabel("");
    setGsYAxisLabel("");
    setGsPoints([]);
  };

  const addPoint = (point: TestPackGraphSelectorPoint) => {
    setGsPoints((prev) => [...prev, point]);
  };

  const removePoint = (index: number) => {
    setGsPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePoint = (
    index: number,
    updates: Partial<TestPackGraphSelectorPoint>,
  ) => {
    setGsPoints((prev) =>
      prev.map((point, i) => (i === index ? { ...point, ...updates } : point)),
    );
  };

  const validateGraphSelector = () => {
    if (!gsQuestion.trim()) return false;
    if (gsXMin >= gsXMax || gsYMin >= gsYMax) return false;
    if (gsGridInterval <= 0) return false;
    if (gsMaxSelectablePoints !== undefined && gsMaxSelectablePoints <= 0)
      return false;
    // At least one correct point required
    if (!gsPoints.some((point) => point.is_correct)) return false;
    return true;
  };

  return {
    gsQuestion,
    setGsQuestion,
    gsXMin,
    setGsXMin,
    gsXMax,
    setGsXMax,
    gsYMin,
    setGsYMin,
    gsYMax,
    setGsYMax,
    gsMaxSelectablePoints,
    setGsMaxSelectablePoints,
    gsGraphInstruction,
    setGsGraphInstruction,
    gsGraphType,
    setGsGraphType,
    gsShowAxes,
    setGsShowAxes,
    gsShowLabels,
    setGsShowLabels,
    gsSnapToGrid,
    setGsSnapToGrid,
    gsGridInterval,
    setGsGridInterval,
    gsXAxisLabel,
    setGsXAxisLabel,
    gsYAxisLabel,
    setGsYAxisLabel,
    gsPoints,
    setGsPoints,
    addPoint,
    removePoint,
    updatePoint,
    resetGraphSelectorState,
    validateGraphSelector,
  };
};
