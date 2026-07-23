import { toast } from "sonner";

// Old @dnd-kit handlers removed - now using FormKit alternatives

// Table Grid Handlers
export const handleTgRowLabelChange =
  (setTgRowLabels: any) => (idx: number, value: string) => {
    setTgRowLabels((labels: string[]) =>
      labels.map((l, i) => (i === idx ? value : l)),
    );
  };
export const handleTgColumnLabelChange =
  (setTgColumnLabels: any) => (idx: number, value: string) => {
    setTgColumnLabels((labels: string[]) =>
      labels.map((l, i) => (i === idx ? value : l)),
    );
  };
export const handleTgAddRow = (setTgRowLabels: any) => () => {
  setTgRowLabels((labels: string[]) => [...labels, `Row ${labels.length + 1}`]);
};
export const handleTgRemoveRow =
  (setTgRowLabels: any, setTgAnswerMatrix: any) => (idx: number) => {
    setTgRowLabels((labels: string[]) => labels.filter((_, i) => i !== idx));
    setTgAnswerMatrix((matrix: any[]) => {
      let newMatrix = matrix.filter((a) => a.row_index !== idx);
      newMatrix = newMatrix.map((a) =>
        a.row_index > idx ? { ...a, row_index: a.row_index - 1 } : a,
      );
      return newMatrix;
    });
  };
export const handleTgAddColumn = (setTgColumnLabels: any) => () => {
  setTgColumnLabels((labels: string[]) => [
    ...labels,
    `Column ${labels.length + 1}`,
  ]);
};
export const handleTgRemoveColumn =
  (setTgColumnLabels: any, setTgAnswerMatrix: any) => (idx: number) => {
    setTgColumnLabels((labels: string[]) => labels.filter((_, i) => i !== idx));
    setTgAnswerMatrix((matrix: any[]) =>
      matrix
        .filter((a) => a.column_index !== idx)
        .map((a) => ({
          ...a,
          column_index:
            a.column_index > idx ? a.column_index - 1 : a.column_index,
        })),
    );
  };
export const handleTgCellToggle =
  (setTgAnswerMatrix: any, tgSelectionMode: "single" | "multiple") =>
  (rowIdx: number, colIdx: number) => {
    setTgAnswerMatrix((matrix: any[]) => {
      if (tgSelectionMode === "single") {
        // For single mode, remove any existing answer for this row and add the new one
        const otherRows = matrix.filter((a) => a.row_index !== rowIdx);
        const existingAnswer = matrix.find(
          (a) => a.row_index === rowIdx && a.column_index === colIdx,
        );

        // If clicking the same cell that's already selected, do nothing
        if (existingAnswer) {
          return matrix;
        }

        // Add the new answer for this row
        return [
          ...otherRows,
          { row_index: rowIdx, column_index: colIdx, is_correct: true },
        ];
      } else {
        // For multiple mode, toggle the selected cell
        const idx = matrix.findIndex(
          (a) => a.row_index === rowIdx && a.column_index === colIdx,
        );
        if (idx >= 0) {
          return matrix.filter((_, i) => i !== idx);
        } else {
          return [
            ...matrix,
            { row_index: rowIdx, column_index: colIdx, is_correct: true },
          ];
        }
      }
    });
  };

export const validateTableGrid = (
  prompt: string,
  rowLabels: string[],
  columnLabels: string[],
  selectionMode: "single" | "multiple",
  answerMatrix: {
    row_index: number;
    column_index: number;
    is_correct: boolean;
  }[],
  setErrors: (errors: string[]) => void,
) => {
  const errors: string[] = [];

  // Validate prompt
  if (!prompt.trim()) {
    errors.push("Please enter a prompt for the table grid question.");
  }

  // Validate row and column labels
  if (rowLabels.length < 1) {
    errors.push("At least one row is required.");
  }
  if (columnLabels.length < 2) {
    errors.push("At least two columns are required.");
  }
  if (new Set(rowLabels).size !== rowLabels.length) {
    errors.push("Row labels must be unique.");
  }
  if (new Set(columnLabels).size !== columnLabels.length) {
    errors.push("Column labels must be unique.");
  }
  if (rowLabels.some((l) => !l.trim())) {
    errors.push("Row labels cannot be blank.");
  }
  if (columnLabels.some((l) => !l.trim())) {
    errors.push("Column labels cannot be blank.");
  }

  // Validate answers
  if (selectionMode === "single") {
    // For single selection mode, each row must have exactly one answer
    for (let rowIdx = 0; rowIdx < rowLabels.length; rowIdx++) {
      const rowAnswers = answerMatrix.filter(
        (a) => a.row_index === rowIdx && a.is_correct,
      );
      if (rowAnswers.length !== 1) {
        errors.push(
          `Row "${rowLabels[rowIdx]}" must have exactly one answer selected.`,
        );
      }
    }
  } else {
    // For multiple selection mode, each row must have at least one answer
    for (let rowIdx = 0; rowIdx < rowLabels.length; rowIdx++) {
      const rowAnswers = answerMatrix.filter(
        (a) => a.row_index === rowIdx && a.is_correct,
      );
      if (rowAnswers.length === 0) {
        errors.push(
          `Row "${rowLabels[rowIdx]}" must have at least one answer selected.`,
        );
      }
    }
  }

  setErrors(errors);
  return errors.length === 0;
};

export const handleTableGridSave = async (
  tgValidate: () => boolean,
  onSave: (data: any) => void,
  tgPrompt: string,
  tgSelectionMode: "single" | "multiple",
  tgRowLabels: string[],
  tgColumnLabels: string[],
  tgAnswerMatrix: {
    row_index: number;
    column_index: number;
    is_correct: boolean;
  }[],
  tgFirstColumnHeader: string | null,
  useAuthStore: any,
  subject?: string,
  categoryId?: string,
) => {
  if (!tgValidate()) {
    return;
  }

  const userName = useAuthStore.getState().getUserName();

  // Convert answer matrix to the format expected by the backend
  const answers = tgAnswerMatrix.map((answer) => ({
    row_index: answer.row_index,
    column_index: answer.column_index,
    is_correct: answer.is_correct,
    last_edited_by: userName,
  }));

  const payload = {
    question: tgPrompt,
    selection_mode: tgSelectionMode,
    row_labels: tgRowLabels,
    column_labels: tgColumnLabels,
    first_column_header: tgFirstColumnHeader,
    answers: answers,
    last_edited_by: userName,
    ...(subject && categoryId && {
      subject: subject,
      question_category_id: Number(categoryId),
    }),
  };

  try {
    await onSave(payload);
  } catch (error) {
    console.error("Error saving table grid question:", error);
    throw error;
  }
};

export const handleRaySelectorSave = async (
  selectedRayType: any,
  selectedRayEndpoint: any,
  raySelectorValid: any,
  toast: any,
  rayPrompt: any,
  numberlineMin: any,
  numberlineMax: any,
  tickInterval: any,
  useAuthStore: any,
  rayType: any,
  rayEndpoint: any,
  rayExplanation: any,
  initialValues: any,
  onSave: any,
  setQuestionType: any,
  setRayPrompt: any,
  setNumberlineMin: any,
  setNumberlineMax: any,
  setTickInterval: any,
  setRayType: any,
  setRayEndpoint: any,
  setRayExplanation: any,
  setSelectedRayType: any,
  setSelectedRayEndpoint: any,
  onClose: any,
  isTestPack: boolean = false,
  testId: number | null = null,
  difficulty: number = 1,
) => {
  if (!selectedRayType || selectedRayEndpoint === null) {
    toast.error("Please select a ray and place it on the number line.");
    return;
  }
  if (!raySelectorValid) {
    toast.error("All fields are required and endpoint must be within bounds.");
    return;
  }
  try {
    const isEditing =
      initialValues &&
      initialValues.id &&
      initialValues.question_type === "RAY_SELECTOR";
    const basePayload = {
      question: rayPrompt,
      numberline_min: Number(numberlineMin),
      numberline_max: Number(numberlineMax),
      tick_interval: Number(tickInterval),
      ray_correct_type: selectedRayType,
      ray_correct_position: Number(rayEndpoint),
      explanation: rayExplanation || null,
      difficulty: difficulty || 1,
      ...(initialValues?.question_number && { question_number: initialValues.question_number }),
    };

    const payload = isEditing
      ? {
          ...basePayload,
          last_edited_by: useAuthStore.getState().getUserName(),
        }
      : {
          ...basePayload,
          created_by: useAuthStore.getState().getUserName(),
          last_edited_by: useAuthStore.getState().getUserName(),
        };

    let response;
    const baseUrl =
      import.meta.env.VITE_API_URL ||
      "https://eznnseebbi.execute-api.ap-southeast-2.amazonaws.com/dev";

    if (isTestPack && testId) {
      const testPackPayload = {
        ...payload,
        test_id: testId,
        difficulty: payload.difficulty || 1,
        // Database constraint: if question_number exists, is_active must be true
        // If question_number is null, is_active should be false
        ...(payload.question_number 
          ? { is_active: true }
          : (isEditing 
              ? (initialValues?.is_active !== undefined ? { is_active: initialValues.is_active } : { is_active: false })
              : { is_active: false }
            )
        ),
      };

      if (!initialValues || !initialValues.question_id) {
        response = await fetch(`${baseUrl}/api/test-pack/ray-selector/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testPackPayload),
        });
      } else {
        response = await fetch(
          `${baseUrl}/api/test-pack/ray-selector/update/${initialValues.question_id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testPackPayload),
          },
        );
      }
    } else {
      if (isEditing) {
        response = await fetch(
          `${baseUrl}/api/ray-selector/update/${initialValues.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
      } else {
        response = await fetch(`${baseUrl}/api/ray-selector/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Failed to save Ray Selector question",
      );
    }
    const data = await response.json();
    onSave({ success: true, type: "RAY_SELECTOR" });
    setQuestionType("MC");
    setRayPrompt("");
    setNumberlineMin("");
    setNumberlineMax("");
    setTickInterval("");
    setRayType("closed_right");
    setRayEndpoint("");
    setRayExplanation("");
    setSelectedRayType(null);
    setSelectedRayEndpoint(null);
    onClose();
  } catch (error) {
    toast.error(
      error instanceof Error
        ? error.message
        : "Failed to save Ray Selector question",
    );
  }
};

export const handleGraphSelectorSave = async (
  graphSelectorValid: boolean,
  toast: any,
  graphPrompt: string,
  xMin: string,
  xMax: string,
  yMin: string,
  yMax: string,
  gridInterval: string,
  maxSelectablePoints: string,
  showAxes: boolean,
  showLabels: boolean,
  snapToGrid: boolean,
  graphInstruction: string,
  availablePoints: any[],
  graphExplanation: string,
  useAuthStore: any,
  initialValues: any,
  onSave: any,
  resetGraphSelectorState: any,
  xAxisLabel?: string,
  yAxisLabel?: string,
  isTestPack: boolean = false,
  testId?: number | null,
  subject?: string,
  categoryId?: string
) => {
  if (!graphSelectorValid) {
    toast.error(
      "Please fill all required fields and ensure at least one point is marked as correct.",
    );
    return;
  }

  try {
    const userName = useAuthStore.getState().getUserName();

    const payload: any = {
      question: graphPrompt,
      x_min: parseInt(xMin),
      x_max: parseInt(xMax),
      y_min: parseInt(yMin),
      y_max: parseInt(yMax),
      grid_interval: parseFloat(gridInterval),
      max_selectable_points: maxSelectablePoints
        ? parseInt(maxSelectablePoints)
        : null,
      show_axes: showAxes,
      show_labels: showLabels,
      snap_to_grid: snapToGrid,
      graph_instruction: graphInstruction || null,
      graph_type: "cartesian",
      x_axis_label: xAxisLabel || null,
      y_axis_label: yAxisLabel || null,
      points: availablePoints.map((point) => ({
        x: point.x,
        y: point.y,
        is_correct: point.is_correct,
        point_label: point.point_label || null,
        created_by: userName,
        last_edited_by: userName,
      })),
      explanation: graphExplanation || null,
      question_type: "GRAPH_SELECTOR",
      created_by: userName,
      last_edited_by: userName,
      difficulty: 1,
      subject: subject || "Mathematics",
      question_category_id: categoryId ? Number(categoryId) : null,
      ...(initialValues?.question_number && { question_number: initialValues.question_number }),
    };

    let endpoint, method;
    const baseUrl =
      import.meta.env.VITE_API_URL ||
      "https://eznnseebbi.execute-api.ap-southeast-2.amazonaws.com/dev";
    if (isTestPack && testId) {
      payload.test_id = testId;
      if (!initialValues || !initialValues.question_id) {
        payload.is_active = false;
        endpoint = `${baseUrl}/api/test-pack/graph-selector/create`;
        method = "POST";
      } else {
        // Database constraint: if question_number exists, is_active must be true
        // If question_number is null, preserve the current is_active state
        if (payload.question_number) {
          payload.is_active = true;
        } else if (initialValues?.is_active !== undefined) {
          payload.is_active = initialValues.is_active;
        } else {
          payload.is_active = false;
        }
        endpoint = `${baseUrl}/api/test-pack/graph-selector/put/${initialValues.question_id}`;
        method = "PATCH";
      }
    } else {
      if (initialValues && initialValues.id) {
        endpoint = `${baseUrl}/api/graph-selector/update/${initialValues.id}`;
        method = "PUT";
      } else {
        endpoint = `${baseUrl}/api/graph-selector/create`;
        method = "POST";
      }
    }

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    const result = await response.json();
    toast.success(
      initialValues
        ? "Graph selector question updated!"
        : "Graph selector question created!",
    );
    onSave(result);
    resetGraphSelectorState();
    // Let the parent component handle closing the modal and refreshing the UI
  } catch (error: any) {
    console.error("❌ Graph Selector save error:", error);
    toast.error(`Failed to save: ${error.message}`);
  }
};
