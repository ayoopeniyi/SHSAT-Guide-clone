import { useCallback } from 'react';
import { fetchRaySelectorDetails } from '../../../actions/RaySelectorActions';
import { fetchDndDetails } from '../../../actions/DndQuestionActions';
import { fetchTableGridDetails } from '../../../actions/TableGridActions';
import { fetchGraphSelectorDetails } from '../../../actions/GraphSelectorActions';
import { fetchHotTextDetails } from '../../../actions/HotTextActions';
import { hasAllRequiredFields } from '../utils/questionBankUtils';
import type { Question } from '../../../types/questionBank';

interface UseQuestionEditingProps {
  onOpenRaySelectorModal: (question: Question) => void;
  onOpenDndModal: (question: Question) => void;
  onOpenTableGridModal: (question: Question) => void;
  onOpenGraphSelectorModal: (question: Question) => void;
  onOpenHotTextModal: (question: Question) => void;
  onOpenBlankModal: (question: Question) => void;
  onOpenEquationCalculatorModal: (question: Question) => void;
  onOpenEditQuestionModal: (question: Question) => void;
  onSetLoadingRaySelectorEdit: (loading: boolean) => void;
  onSetLoadingDndEdit: (loading: boolean) => void;
  onSetLoadingTableGridEdit: (loading: boolean) => void;
  onSetLoadingGraphSelectorEdit: (loading: boolean) => void;
}

export const useQuestionEditing = ({
  onOpenRaySelectorModal,
  onOpenDndModal,
  onOpenTableGridModal,
  onOpenGraphSelectorModal,
  onOpenHotTextModal,
  onOpenBlankModal,
  onOpenEquationCalculatorModal,
  onOpenEditQuestionModal,
  onSetLoadingRaySelectorEdit,
  onSetLoadingDndEdit,
  onSetLoadingTableGridEdit,
  onSetLoadingGraphSelectorEdit,
}: UseQuestionEditingProps) => {
  
  const handleEditQuestionClick = useCallback(async (question: Question) => {
    /* console.log(
      "🔍 Edit Question Click - Question type:",
      question.question_type,
      "Full question:",
      question,
    ); */

    // Auto-detect TABLE_GRID questions based on structure
    const isTableGrid = question.row_labels && question.column_labels && question.answer_matrix;
    const questionType = isTableGrid ? "TABLE_GRID" : question.question_type;
    
    /* console.log("🔍 [useQuestionEditing] Auto-detection:", {
      originalType: question.question_type,
      isTableGrid,
      detectedType: questionType,
      hasRowLabels: !!question.row_labels,
      hasColumnLabels: !!question.column_labels,
      hasAnswerMatrix: !!question.answer_matrix,
      rowLabelsValue: question.row_labels,
      columnLabelsValue: question.column_labels,
      answerMatrixValue: question.answer_matrix
    }); */

    if (questionType === "RAY_SELECTOR") {
      const hasAllFields = hasAllRequiredFields(question, "RAY_SELECTOR");
      if (!hasAllFields) {
        onSetLoadingRaySelectorEdit(true);
        try {
          const fullData = await fetchRaySelectorDetails(question.id);
          onOpenRaySelectorModal(fullData);
        } catch (error) {
          onOpenRaySelectorModal(question);
        } finally {
          onSetLoadingRaySelectorEdit(false);
        }
      } else {
        onOpenRaySelectorModal(question);
      }
    } else if (questionType === "HOT_TEXT") {
      // Fetch full details so regions include their DB IDs (needed for tag prefill)
      try {
        // Detect if it's a test pack question based on presence of test_id
        const isTestPack = !!question.test_id;
        const fullData = await fetchHotTextDetails(question.id, isTestPack);
        
        // Merge fetched regions (with IDs) back onto the question object
        // fullData is already standardized/flattened by fetchHotTextDetails
        const questionWithRegions = {
          ...question,
          ...fullData,
          question_type: "HOT_TEXT",
        };
        onOpenHotTextModal(questionWithRegions);
      } catch (error) {
        console.warn('[useQuestionEditing] Could not fetch HotText details, opening with list data:', error);
        onOpenHotTextModal(question);
      }

    } else if (questionType === "DND") {
      const hasAllFields = hasAllRequiredFields(question, "DND");
      if (!hasAllFields) {
        onSetLoadingDndEdit(true);
        try {
          const fullData = await fetchDndDetails(question.id);
          /* console.log("🔍 [useQuestionEditing] Fetched DND data:", {
            question: fullData.question,
            dnd_subtype: fullData.question?.dnd_subtype,
            question_category: fullData.question?.question_category,
            buckets: fullData.buckets,
            choices: fullData.choices,
            assignments: fullData.assignments
          }); */
          const transformedData = {
            ...fullData.question,
            question_type: "DND",
            question_subtype: fullData.question?.question_subtype,
            buckets: fullData.buckets,
            choices: fullData.choices,
            assignments: fullData.assignments,
          };
          /* console.log("🔍 [useQuestionEditing] Transformed DND data for modal:", {
            ...transformedData,
            question_category: transformedData.question_category,
            question_subtype: transformedData.question_subtype
          }); */
          onOpenDndModal(transformedData);
        } catch (error) {
          /* console.log("🔍 [useQuestionEditing] Failed to fetch DND data, using fallback:", {
            error,
            question: question.question,
            buckets: question.buckets,
            choices: question.dnd_choices || question.choices,
            assignments: question.assignments
          }); */
          const transformedData = {
            ...question,
            question_type: "DND",
            question_subtype: question.question_subtype,
            choices: question.dnd_choices || question.choices,
          } as Question;
          /* console.log("🔍 [useQuestionEditing] Transformed fallback DND data for modal:", transformedData); */
          onOpenDndModal(transformedData);
        } finally {
          onSetLoadingDndEdit(false);
        }
      } else {
        /* console.log("🔍 [useQuestionEditing] Using existing DND data:", {
          question: question.question,
          buckets: question.buckets,
          choices: question.dnd_choices || question.choices,
          assignments: question.assignments
        }); */
        const transformedData = {
          ...question,
          question_type: "DND",
          question_subtype: question.question_subtype,
          choices: question.dnd_choices || question.choices,
        } as Question;
        /* console.log("🔍 [useQuestionEditing] Transformed existing DND data for modal:", transformedData); */
        onOpenDndModal(transformedData);
      }
    } else if (questionType === "TABLE_GRID") {
      /* console.log("🔍 [useQuestionEditing] TABLE_GRID question data:", {
        id: question.id,
        question_type: question.question_type,
        row_labels: question.row_labels,
        column_labels: question.column_labels,
        answer_matrix: question.answer_matrix,
        hasRowLabels: !!question.row_labels,
        hasColumnLabels: !!question.column_labels,
        hasAnswerMatrix: !!question.answer_matrix
      }); */
      
      const hasAllFields = hasAllRequiredFields(question, "TABLE_GRID");
      /* console.log("🔍 [useQuestionEditing] hasAllRequiredFields result:", hasAllFields); */
      
      if (!hasAllFields) {
        onSetLoadingTableGridEdit(true);
        try {
          const fullData = await fetchTableGridDetails(question.id);
          // Ensure the question type is set correctly
          const dataWithType = { ...fullData, question_type: "TABLE_GRID" };
          /* console.log("🔍 [useQuestionEditing] Opening TABLE_GRID modal with fetched data:", dataWithType); */
          onOpenTableGridModal(dataWithType);
        } catch (error) {
          // Ensure the question type is set correctly even in fallback
          const questionWithType = { ...question, question_type: "TABLE_GRID" };
          /* console.log("🔍 [useQuestionEditing] Opening TABLE_GRID modal with fallback data:", questionWithType); */
          onOpenTableGridModal(questionWithType);
        } finally {
          onSetLoadingTableGridEdit(false);
        }
      } else {
        // Ensure the question type is set correctly
        const questionWithType = { ...question, question_type: "TABLE_GRID" };
        /* console.log("🔍 [useQuestionEditing] Opening TABLE_GRID modal with existing data:", questionWithType); */
        onOpenTableGridModal(questionWithType);
      }
    } else if (questionType === "GRAPH_SELECTOR") {
      const hasAllFields = hasAllRequiredFields(question, "GRAPH_SELECTOR");
      if (!hasAllFields) {
        onSetLoadingGraphSelectorEdit(true);
        try {
          const fullData = await fetchGraphSelectorDetails(question.id);
          const completeData = {
            ...fullData,
            question_type: "GRAPH_SELECTOR",
          };
          onOpenGraphSelectorModal(completeData);
        } catch (error) {
          const fallbackData = {
            ...question,
            question_type: "GRAPH_SELECTOR",
          };
          onOpenGraphSelectorModal(fallbackData);
        } finally {
          onSetLoadingGraphSelectorEdit(false);
        }
      } else {
        const completeData = {
          ...question,
          question_type: "GRAPH_SELECTOR",
        };
        onOpenGraphSelectorModal(completeData);
      }
    } else if (
      questionType === "BLANK" ||
      questionType === "GI" ||
      questionType === "RESP"
    ) {
      // Route BLANK to the full QuestionModal (not the simple text editor)
      // so the tag editor is rendered
      onOpenBlankModal({ ...question, question_type: "BLANK" } as Question);
    } else if (questionType === "EQUATION_CALCULATOR") {
      onOpenEquationCalculatorModal({ ...question, question_type: "EQUATION_CALCULATOR" } as Question);
    } else {
      onOpenEditQuestionModal(question);
    }
  }, [
    onOpenRaySelectorModal,
    onOpenDndModal,
    onOpenTableGridModal,
    onOpenGraphSelectorModal,
    onOpenHotTextModal,
    onOpenBlankModal,
    onOpenEquationCalculatorModal,
    onOpenEditQuestionModal,
    onSetLoadingRaySelectorEdit,
    onSetLoadingDndEdit,
    onSetLoadingTableGridEdit,
    onSetLoadingGraphSelectorEdit,
  ]);

  return {
    handleEditQuestionClick,
  };
}; 