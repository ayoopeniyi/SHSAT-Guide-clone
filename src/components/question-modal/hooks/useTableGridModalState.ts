import { useState, useEffect } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { toast } from "sonner";
import type { TagSlot } from "../../shared/ChoiceTagEditor";
import { fetchChoiceTags, saveChoiceTags, fetchBatchChoiceTags } from "../../../services/tagService";

export function useTableGridModalState(initialValues: any, isOpen: boolean, onSave: (data: any) => void, onClose: () => void, istestpack: boolean, subject?: string, categoryId?: string) {
  // State
  const [tgPrompt, setTgPrompt] = useState("");
  const [tgRowLabels, setTgRowLabels] = useState(["Row 1"]);
  const [tgColumnLabels, setTgColumnLabels] = useState(["Column 1", "Column 2"]);
  const [tgSelectionMode, setTgSelectionMode] = useState<'single' | 'multiple'>("single");
  const [tgFirstColumnHeader, setTgFirstColumnHeader] = useState("");
  const [tgAnswerMatrix, setTgAnswerMatrix] = useState<{ id?: number; row_index: number; column_index: number; is_correct: boolean }[]>([]);
  const [tgErrors, setTgErrors] = useState<string[]>([]);
  const [tgDifficulty, setTgDifficulty] = useState(3);
  const [tgExplanation, setTgExplanation] = useState("");
  const [hasPrefilled, setHasPrefilled] = useState(false);

  // Hierarchy fields for question bank
  const [tgChapter, setTgChapter] = useState<number | undefined>(undefined);
  const [tgTopic, setTgTopic] = useState<number | undefined>(undefined);
  const [tgSubTopic, setTgSubTopic] = useState<number | undefined>(undefined);
  const [tgQuestionCategory, setTgQuestionCategory] = useState<string>("Practice");

  // Tagging state: Map of "row-col" key to tag slots
  const [cellTagSlots, setCellTagSlots] = useState<Record<string, TagSlot[]>>({});

  // Prefill logic
  useEffect(() => {
    const isTableGrid =
      initialValues &&
      (initialValues.question_type === "TABLE_GRID" ||
        (initialValues.row_labels && initialValues.column_labels));

    if (isOpen && isTableGrid && !hasPrefilled) {
      const qId = initialValues?.question_id || initialValues?.id;
      const baseUrl = import.meta.env.VITE_API_URL;

      // For Test Pack, we NEED to fetch the full question detail because the initialValues might be shallow
      if (istestpack && initialValues?.question_id) {
        fetch(`${baseUrl}/api/test-pack/table-grid/get/${qId}`)
          .then(res => res.json())
          .then(data => {
            setTgPrompt(data.question || "");
            setTgRowLabels(data.row_labels || ["Row 1"]);
            setTgColumnLabels(data.column_labels || ["Column 1", "Column 2"]);
            setTgSelectionMode(data.selection_mode || "single");
            setTgFirstColumnHeader(data.first_column_header || "");
            setTgAnswerMatrix(data.answer_matrix || []);
            setTgDifficulty(data.difficulty || 3);
            setTgExplanation(data.explanation || "");
            
            // Prefill Tags using REAL Database IDs in batch
            const type = "test_pack";
            const answers = data.answer_matrix || [];
            const idsToFetch = answers.map((ans: any) => ans.id).filter(Boolean);
            
            if (idsToFetch.length > 0) {
              fetchBatchChoiceTags(idsToFetch, type).then(batchData => {
                const newTagSlots: Record<string, TagSlot[]> = {};
                answers.forEach((ans: any) => {
                  const r = ans.row_index;
                  const c = ans.column_index;
                  const realId = ans.id;
                  
                  if (realId) {
                    const tags = batchData[String(realId)] || [];
                    if (tags.length > 0) {
                      newTagSlots[`${r}-${c}`] = tags.map(t => ({
                        tag_id: t.tag_id,
                        tag_name: t.tag_name || "",
                        tag_category: t.tag_category || "",
                        rationale: t.rationale || ""
                      }));
                    }
                  }
                });
                setCellTagSlots(prev => ({ ...prev, ...newTagSlots }));
              });
            }
            setHasPrefilled(true);
          })
          .catch(err => {
            console.error("Failed to fetch full Table Grid details:", err);
            toast.error("Failed to load question details");
          });
      } else {
        // Standard prefill for Question Bank or new questions
        setTgPrompt(initialValues.question || "");
        setTgRowLabels(initialValues.row_labels || ["Row 1"]);
        setTgColumnLabels(initialValues.column_labels || ["Column 1", "Column 2"]);
        setTgSelectionMode(initialValues.selection_mode || "single");
        setTgFirstColumnHeader(initialValues.first_column_header || "");
        setTgAnswerMatrix(initialValues.answer_matrix || []);
        setTgDifficulty(initialValues.difficulty || 3);
        setTgExplanation(initialValues.explanation || "");
        setTgChapter(initialValues.chapter_number);
        setTgTopic(initialValues.topic_id);
        setTgSubTopic(initialValues.sub_topic_id);
        setTgQuestionCategory(initialValues.question_category || "Practice");

        // Prefill tags for Question Bank in batch (using real IDs as well)
        const type = "pre_shsat";
        const answers = initialValues.answer_matrix || [];
        const idsToFetch = answers.map((ans: any) => ans.id).filter(Boolean);
        
        if (idsToFetch.length > 0) {
          fetchBatchChoiceTags(idsToFetch, type).then(batchData => {
            const newTagSlots: Record<string, TagSlot[]> = {};
            answers.forEach((ans: any) => {
              if (ans.id) {
                const tags = batchData[String(ans.id)] || [];
                if (tags.length > 0) {
                  newTagSlots[`${ans.row_index}-${ans.column_index}`] = tags.map(t => ({
                    tag_id: t.tag_id,
                    tag_name: t.tag_name || "",
                    tag_category: t.tag_category || "",
                    rationale: t.rationale || ""
                  }));
                }
              }
            });
            setCellTagSlots(prev => ({ ...prev, ...newTagSlots }));
          });
        }
        setHasPrefilled(true);
      }
    }
  }, [isOpen, initialValues, hasPrefilled, istestpack]);

  // Reset state when creating new questions
  useEffect(() => {
    if (isOpen && !initialValues && !hasPrefilled) {
      setTgPrompt("");
      setTgRowLabels(["Row 1"]);
      setTgColumnLabels(["Column 1", "Column 2"]);
      setTgSelectionMode("single");
      setTgFirstColumnHeader("");
      setTgAnswerMatrix([]);
      setTgDifficulty(3);
      setTgExplanation("");
      setTgErrors([]);
      // Reset hierarchy fields
      setTgChapter(undefined);
      setTgTopic(undefined);
      setTgSubTopic(undefined);
      setTgQuestionCategory("Practice");
      setHasPrefilled(true);
    }
  }, [isOpen, initialValues, hasPrefilled]);

  // Reset prefill flag when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setHasPrefilled(false);
    } else {
      // Reset state when modal closes
      setTgPrompt("");
      setTgRowLabels(["Row 1"]);
      setTgColumnLabels(["Column 1", "Column 2"]);
      setTgSelectionMode("single");
      setTgFirstColumnHeader("");
      setTgAnswerMatrix([]);
      setTgDifficulty(3);
      setTgExplanation("");
      setTgErrors([]);
      setTgChapter(undefined);
      setTgTopic(undefined);
      setTgSubTopic(undefined);
      setTgQuestionCategory("Practice");
    }
  }, [isOpen]);

  // Auto-fix answer matrix when switching to single selection mode
  useEffect(() => {
    if (tgSelectionMode === "single") {
      fixAnswerMatrixForSingleMode();
    }
  }, [tgSelectionMode]);

  // Validation
  const validate = () => {
    const errors = [];
    if (!tgPrompt.trim()) errors.push("Prompt is required");
    const uniqueRowLabels = new Set(tgRowLabels);
    const uniqueColLabels = new Set(tgColumnLabels);
    if (uniqueRowLabels.size !== tgRowLabels.length) errors.push("Row labels must be unique");
    if (uniqueColLabels.size !== tgColumnLabels.length) errors.push("Column labels must be unique");
    const hasCorrectAnswer = tgAnswerMatrix.some((answer: any) => answer.is_correct);
    if (!hasCorrectAnswer) errors.push("At least one answer must be marked as correct");

    // Validate single-select mode: each row must have exactly one correct answer
    if (tgSelectionMode === "single") {
      for (let rowIdx = 0; rowIdx < tgRowLabels.length; rowIdx++) {
        const correctAnswersInRow = tgAnswerMatrix.filter((answer: any) =>
          answer.row_index === rowIdx && answer.is_correct
        );
        if (correctAnswersInRow.length !== 1) {
          errors.push(`Row ${rowIdx + 1} must have exactly one correct answer (found ${correctAnswersInRow.length})`);
        }
      }
    }

    setTgErrors(errors);
    return errors.length === 0;
  };

  // Save logic
  const save = async () => {
    // Validate hierarchy fields for question bank questions
    if (!istestpack && !initialValues) {
      if (!tgQuestionCategory) {
        toast.error("Question category is required.");
        return;
      }
      if (!tgChapter) {
        toast.error("Chapter is required.");
        return;
      }
      if (!tgTopic) {
        toast.error("Topic is required.");
        return;
      }
      if (!tgSubTopic) {
        toast.error("Sub-topic is required.");
        return;
      }
    }

    // Safety check for question text - use fallback for editing
    const questionText = tgPrompt || (initialValues?.question) || "";
    if (!questionText || questionText.trim() === "") {
      toast.error("Question text is required.");
      return;
    }

    try {
      if (!validate()) {
        toast.error("Please fix validation errors before saving.");
        return;
      }
      const userName = useAuthStore.getState().getUserName();
      const baseUrl = import.meta.env.VITE_API_URL;
      let endpoint = "";
      let method = initialValues ? "PUT" : "POST";
      let payload = {};
      if (istestpack || initialValues?.test_id) {
        endpoint = initialValues?.question_id
          ? `${baseUrl}/api/test-pack/table-grid/put/${initialValues.question_id}`
          : `${baseUrl}/api/test-pack/table-grid/create`;
        method = initialValues?.question_id ? "PUT" : "POST";
        payload = {
          question: tgPrompt,
          selection_mode: tgSelectionMode,
          row_labels: tgRowLabels,
          column_labels: tgColumnLabels,
          first_column_header: tgFirstColumnHeader || null,
          answer_matrix: Array.from({ length: tgRowLabels.length * tgColumnLabels.length }).reduce((acc: any[], _, i) => {
            const r = Math.floor(i / tgColumnLabels.length);
            const c = i % tgColumnLabels.length;
            const matrixEntry = tgAnswerMatrix.find(a => a.row_index === r && a.column_index === c);
            const isCorrect = matrixEntry?.is_correct || false;
            const hasTags = cellTagSlots[`${r}-${c}`]?.some(s => s.tag_name.trim());

            // Include cell in answer_matrix if it's correct OR if it has tags.
            // Tagged cells must be in the DB (even if incorrect) so tags can reference them.
            if (isCorrect || hasTags) {
              acc.push({
                row_index: r,
                column_index: c,
                is_correct: isCorrect,
                last_edited_by: userName,
              });
            }
            return acc;
          }, []),
          last_edited_by: userName,
          test_id: initialValues?.test_id,
          difficulty: tgDifficulty,
          created_by: userName,
          is_active: initialValues?.is_active,  // Preserve current active state
          explanation: tgExplanation || null,
          subject: !initialValues?.question_id ? subject : undefined,
          ...(!initialValues?.question_id && categoryId ? { question_category_id: Number(categoryId) } : {}),
        };
      } else if (initialValues?.id) {
        endpoint = `${baseUrl}/api/table-grid-questions/update/${initialValues.id}`;
        method = "PUT";
        // Ensure we have a valid question text - use initialValues.question as fallback
        const questionText = tgPrompt || initialValues.question || "";

        payload = {
          question: questionText,
          selection_mode: tgSelectionMode,
          row_labels: tgRowLabels,
          column_labels: tgColumnLabels,
          row_order: initialValues?.row_order || null,
          column_order: initialValues?.column_order || null,
          first_column_header: tgFirstColumnHeader || null,
          answers: Array.from({ length: tgRowLabels.length * tgColumnLabels.length }).reduce((acc: any[], _, i) => {
            const r = Math.floor(i / tgColumnLabels.length);
            const c = i % tgColumnLabels.length;
            const matrixEntry = tgAnswerMatrix.find(a => a.row_index === r && a.column_index === c);
            const isCorrect = matrixEntry?.is_correct || false;
            const hasTags = cellTagSlots[`${r}-${c}`]?.some(s => s.tag_name.trim());

            // Include cell if correct or tagged (needed for tagging incorrect options)
            if (isCorrect || hasTags) {
              acc.push({
                row_index: r,
                column_index: c,
                is_correct: isCorrect,
                created_by: userName,
                last_edited_by: userName,
              });
            }
            return acc;
          }, []),
          last_edited_by: userName,
          created_by: userName,
          // Hierarchy fields
          question_category: tgQuestionCategory,
          ...(tgChapter && { chapter_number: tgChapter }),
          ...(tgTopic && { topic_id: tgTopic }),
          ...(tgSubTopic && { sub_topic_id: tgSubTopic }),
          // Preserve existing question number for editing
          question_number: initialValues?.question_number || null,
          difficulty: tgDifficulty,
          explanation: tgExplanation || null,

        };
      } else {
        endpoint = `${baseUrl}/api/table-grid-questions/create`;
        method = "POST";
        payload = {
          question: questionText,
          selection_mode: tgSelectionMode,
          row_labels: tgRowLabels,
          column_labels: tgColumnLabels,
          row_order: null,
          column_order: null,
          first_column_header: tgFirstColumnHeader || null,
          answers: Array.from({ length: tgRowLabels.length * tgColumnLabels.length }).reduce((acc: any[], _, i) => {
            const r = Math.floor(i / tgColumnLabels.length);
            const c = i % tgColumnLabels.length;
            const matrixEntry = tgAnswerMatrix.find(a => a.row_index === r && a.column_index === c);
            const isCorrect = matrixEntry?.is_correct || false;
            const hasTags = cellTagSlots[`${r}-${c}`]?.some(s => s.tag_name.trim());

            // Include cell if correct or tagged (needed for tagging incorrect options)
            if (isCorrect || hasTags) {
              acc.push({
                row_index: r,
                column_index: c,
                is_correct: isCorrect,
                created_by: userName,
                last_edited_by: userName,
              });
            }
            return acc;
          }, []),
          last_edited_by: userName,
          created_by: userName,
          difficulty: tgDifficulty,
          // Hierarchy fields
          question_category: tgQuestionCategory,
          ...(tgChapter && { chapter_number: tgChapter }),
          ...(tgTopic && { topic_id: tgTopic }),
          ...(tgSubTopic && { sub_topic_id: tgSubTopic }),
          // Question numbering is auto-assigned by backend based on hierarchy
          explanation: tgExplanation || null,
        };
      }
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.detail || "Failed to save Table Grid question");
      }
      const responseData = await response.json();
      const savedQuestionId = responseData.id || responseData.question_id || initialValues?.id || initialValues?.question_id;
      // console.log("✅ Table Grid save successful, response data:", responseData);

      // Sync tags for each answer cell using the REAL database IDs from the response
      const savedAnswers = responseData.answer_matrix || responseData.answers || [];
      if (Array.isArray(savedAnswers) && savedAnswers.length > 0) {
        const type = istestpack ? "test_pack" : "pre_shsat";
        const tagPromises = savedAnswers.map((ans: any) => {
          const r = ans.row_index;
          const c = ans.column_index;
          const realId = ans.id;

          if (!realId) return Promise.resolve();

          const key = `${r}-${c}`;
          const slots = cellTagSlots[key] || [];
          if (slots.length > 0 && slots.some(s => s.tag_name.trim())) {
            const validTags = slots
              .filter(s => s.tag_name.trim())
              .map((s, i) => ({
                tag_id: s.tag_id,
                tag_name: s.tag_name.trim(),
                tag_category: (s.tag_category || "").trim() || undefined,
                tag_order: (i + 1) as 1 | 2 | 3,
                rationale: s.rationale,
              }));

            // console.log(`🔍 [TableGridModal] Syncing tags for cell [${r},${c}] using REAL ID: ${realId}`);
            return saveChoiceTags(realId, type, validTags);
          }
          return Promise.resolve();
        });
        let tagsFailed = false;
        await Promise.all(tagPromises).catch(err => {
          console.warn("Table Grid tag sync failed:", err);
          tagsFailed = true;
        });

        if (tagsFailed) {
          toast.warning("Question saved, but some reasoning patterns (tags) failed to save. Please review the tags.");
        }
      }

      toast.success(`Table Grid question ${initialValues ? "updated" : "created"} successfully`);
      onSave(responseData);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save Table Grid question");
    }
  };

  // Handlers for row/column/answer matrix
  const handleTgRowLabelChange = (idx: number, value: string) => {
    setTgRowLabels((prev) => prev.map((label, i) => (i === idx ? value : label)));
  };
  const handleTgColumnLabelChange = (idx: number, value: string) => {
    setTgColumnLabels((prev) => prev.map((label, i) => (i === idx ? value : label)));
  };
  const handleTgAddRow = () => {
    setTgRowLabels((prev) => [...prev, `Row ${prev.length + 1}`]);
  };
  const handleTgRemoveRow = (idx: number) => {
    setTgRowLabels((prev) => prev.filter((_, i) => i !== idx));
    setTgAnswerMatrix((prev: any[]) => prev.filter((a: any) => a.row_index !== idx));

    // ⭐ NEW: Shift tag indices for rows
    setCellTagSlots(prev => {
      const newSlots: Record<string, TagSlot[]> = {};
      Object.entries(prev).forEach(([key, value]) => {
        const [r, c] = key.split("-").map(Number);
        if (r < idx) {
          newSlots[key] = value;
        } else if (r > idx) {
          newSlots[`${r - 1}-${c}`] = value;
        }
        // if r === idx, it's deleted
      });
      return newSlots;
    });
  };
  const handleTgAddColumn = () => {
    setTgColumnLabels((prev) => [...prev, `Column ${prev.length + 1}`]);
  };
  const handleTgRemoveColumn = (idx: number) => {
    setTgColumnLabels((prev) => prev.filter((_, i) => i !== idx));
    setTgAnswerMatrix((prev: any[]) => prev.filter((a: any) => a.column_index !== idx));

    // ⭐ NEW: Shift tag indices for columns
    setCellTagSlots(prev => {
      const newSlots: Record<string, TagSlot[]> = {};
      Object.entries(prev).forEach(([key, value]) => {
        const [r, c] = key.split("-").map(Number);
        if (c < idx) {
          newSlots[key] = value;
        } else if (c > idx) {
          newSlots[`${r}-${c - 1}`] = value;
        }
        // if c === idx, it's deleted
      });
      return newSlots;
    });
  };
  const handleTgCellToggle = (rowIdx: number, colIdx: number) => {
    setTgAnswerMatrix((prev: any[]) => {
      const found = prev.find((a: any) => a.row_index === rowIdx && a.column_index === colIdx);

      if (tgSelectionMode === "single") {
        // Single-select mode: remove all other selections in this row, then toggle current cell
        const otherRows = prev.filter((a: any) => a.row_index !== rowIdx);
        if (found && found.is_correct) {
          // If current cell is selected, deselect it
          return otherRows;
        } else {
          // If current cell is not selected, select it (and remove others in same row)
          return [...otherRows, { row_index: rowIdx, column_index: colIdx, is_correct: true }];
        }
      } else {
        // Multi-select mode: just toggle the current cell
        if (found) {
          return prev.map((a: any) =>
            a.row_index === rowIdx && a.column_index === colIdx
              ? { ...a, is_correct: !a.is_correct }
              : a
          );
        } else {
          return [...prev, { row_index: rowIdx, column_index: colIdx, is_correct: true }];
        }
      }
    });
  };

  // Function to fix answer matrix when switching to single selection mode
  const fixAnswerMatrixForSingleMode = () => {
    if (tgSelectionMode === "single") {
      setTgAnswerMatrix((prev: any[]) => {
        const fixed: any[] = [];
        const processedRows = new Set<number>();

        // For each row, keep only the first correct answer
        for (const answer of prev) {
          if (answer.is_correct && !processedRows.has(answer.row_index)) {
            fixed.push(answer);
            processedRows.add(answer.row_index);
          }
        }

        return fixed;
      });
    }
  };

  return {
    tgPrompt,
    setTgPrompt,
    tgRowLabels,
    setTgRowLabels,
    tgColumnLabels,
    setTgColumnLabels,
    tgSelectionMode,
    setTgSelectionMode,
    tgFirstColumnHeader,
    setTgFirstColumnHeader,
    tgAnswerMatrix,
    setTgAnswerMatrix,
    tgErrors,
    setTgErrors,
    tgDifficulty,
    setTgDifficulty,
    tgExplanation,
    setTgExplanation,
    // Hierarchy fields
    tgChapter,
    setTgChapter,
    tgTopic,
    setTgTopic,
    tgSubTopic,
    setTgSubTopic,
    tgQuestionCategory,
    setTgQuestionCategory,
    // Tagging
    cellTagSlots,
    setCellTagSlots,
    validate,
    save,
    handleTgRowLabelChange,
    handleTgColumnLabelChange,
    handleTgAddRow,
    handleTgRemoveRow,
    handleTgAddColumn,
    handleTgRemoveColumn,
    handleTgCellToggle,
    fixAnswerMatrixForSingleMode,
  };
}
