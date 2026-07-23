import React from "react";
import QuestionModal from "../QuestionModal";
import { EditChoicesModal } from "./modals/EditChoicesModal";
import { EditQuestionModal } from "./modals/EditQuestionModal";
import { AddQuestionsToPassageModal } from "./modals/AddQuestionsToPassageModal";
import { PassageDetailsModal } from "./modals/PassageDetailsModal";
import type { Question, Choice } from "../../types/questionBank";

interface QuestionBankModalsProps {
  // Modal states
  modalStates: {
    showEditModal: boolean;
    editingQuestion: Question | null;
    editChoices: any[];
    savingChoices: boolean;
    editError: string | null;
    modalRenderKey: number;
    showEditQuestionModal: boolean;
    currentQuestion: Question | null;
    showQuestionModal: boolean;
    editHotTextModalOpen: boolean;
    editingHotText: Question | null;
    editingPassage?: Question | null;
    editingBlank?: Question | null;
    editRaySelectorModalOpen: boolean;
    editingRaySelector: Question | null;
    loadingRaySelectorEdit: boolean;
    editDndModalOpen: boolean;
    editingDnd: Question | null;
    loadingDndEdit: boolean;
    editTableGridModalOpen: boolean;
    editingTableGrid: Question | null;
    loadingTableGridEdit: boolean;
    editGraphSelectorModalOpen: boolean;
    editingGraphSelector: Question | null;
    loadingGraphSelectorEdit: boolean;
    editEquationCalculatorModalOpen: boolean;
    editingEquationCalculator: Question | null;
    showAddQuestionsToPassageModal: boolean;
    selectedPassageForQuestions: number | null;
    showPassageDetailsModal: boolean;
    selectedPassageData: any | null;
  };

  // Modal actions
  onCloseEditChoicesModal: () => void;
  onCloseEditQuestionModal: () => void;
  onCloseQuestionModal: () => void;
  onCloseHotTextModal: () => void;
  onCloseRaySelectorModal: () => void;
  onCloseDndModal: () => void;
  onCloseTableGridModal: () => void;
  onCloseGraphSelectorModal: () => void;
  onCloseEquationCalculatorModal: () => void;
  onCloseAddQuestionsToPassageModal: () => void;
  onClosePassageDetailsModal: () => void;

  // Save handlers
  onSaveChoices: (question: Question, choices: Choice[]) => Promise<void>;
  onUpdateQuestion: (newText: string, explanation?: string | null) => Promise<void>;
  onAddQuestion: (questionData: any) => void;
  onEditHotTextSave: (data: any) => void;
  onEditRaySelectorSave: (data: any) => void;
  onEditDndSave: (data: any) => void;
  onEditTableGridSave: (data: any) => void;
  onEditGraphSelectorSave: (data: any) => void;
  onEditEquationCalculatorSave: (data: any) => void;
  onEditBlankSave: (data: any) => void;
  onAddQuestionsToPassage: () => void;

  // Refresh handlers
  onRefresh?: () => void;
  onCacheClear?: () => void;

  // Other props
  userName: string;
  passageState: any;
  passageQuestionTypes: any;
  onUpdateQuestionType: (type: any, value: number) => void;
  getQuestionTypeDisplayName: (type: any) => string;
  // Add these for edit choices modal
  editChoices: any[];
  onChoicesChange: (newChoices: any[]) => void;
  onAddChoice: () => void;
  onRemoveChoice: (idx: number) => void;
  choiceType?: "pre_shsat" | "test_pack";
}

export const QuestionBankModals: React.FC<QuestionBankModalsProps> = ({
  modalStates,
  onCloseEditChoicesModal,
  onCloseEditQuestionModal,
  onCloseQuestionModal,
  onCloseHotTextModal,
  onCloseRaySelectorModal,
  onCloseDndModal,
  onCloseTableGridModal,
  onCloseGraphSelectorModal,
  onCloseEquationCalculatorModal,
  onCloseAddQuestionsToPassageModal,
  onClosePassageDetailsModal,
  onSaveChoices,
  onUpdateQuestion,
  onAddQuestion,
  onEditHotTextSave,
  onEditRaySelectorSave,
  onEditDndSave,
  onEditTableGridSave,
  onEditGraphSelectorSave,
  onEditEquationCalculatorSave,
  onEditBlankSave,
  onAddQuestionsToPassage,
  onRefresh,
  onCacheClear,
  userName,
  passageState,
  passageQuestionTypes,
  onUpdateQuestionType,
  getQuestionTypeDisplayName,
  // Add these for edit choices modal
  editChoices,
  onChoicesChange,
  onAddChoice,
  onRemoveChoice,
  choiceType = "pre_shsat",
}) => {
  return (
    <>
      {/* Edit Choices Modal */}
      <EditChoicesModal
        isOpen={modalStates.showEditModal}
        onClose={onCloseEditChoicesModal}
        question={modalStates.editingQuestion}
        choices={editChoices}
        onChoicesChange={onChoicesChange}
        onSave={async () => {
          if (modalStates.editingQuestion && editChoices.length > 0) {
            await onSaveChoices(modalStates.editingQuestion, editChoices);
          }
        }}
        onAddChoice={onAddChoice}
        onRemoveChoice={onRemoveChoice}
        saving={modalStates.savingChoices}
        error={modalStates.editError}
        modalRenderKey={modalStates.modalRenderKey}
        userName={userName}
        choiceType={choiceType}
      />

      {/* Edit Question Modal */}
      <EditQuestionModal
        isOpen={modalStates.showEditQuestionModal}
        onClose={onCloseEditQuestionModal}
        onSave={async (text, imageUrl, hierarchyData, correctAnswer, difficulty, explanation) => {
          const q = modalStates.currentQuestion;
          if (!q) return;

          // For MC questions with hierarchy data, use the new function
          if (q.question_type === 'MC' && hierarchyData) {
            const { updateMCQuestionWithHierarchy } = await import('../../actions/QuestionBankActions');
            await updateMCQuestionWithHierarchy(q.id, {
              question: text,
              chapter_number: hierarchyData.chapter_number,
              topic_id: hierarchyData.topic_id,
              sub_topic_id: hierarchyData.sub_topic_id,
              question_category: hierarchyData.question_category,
            }, userName);
          } else {
            // For BLANK questions, use the specific BLANK endpoint
            if (q.question_type === "BLANK" || q.question_type === "BLANK_PLACEHOLDER" || q.question_type === "BLANK_FILL_BOX") {
              const updateData = {
                question: text,
                last_edited_by: userName
              };
              if (correctAnswer) {
                updateData.correct_answer = correctAnswer;
                updateData.answer = correctAnswer; // Also update the answer field for consistency
              }

              // Call the specific BLANK endpoint
              const apiBase = import.meta.env.VITE_API_URL;
              const response = await fetch(`${apiBase}/api/pre-shsat/questions/blank/${q.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
              });

              if (!response.ok) {
                throw new Error(`Failed to update BLANK question: ${response.statusText}`);
              }

              // Refresh the UI after successful update
              if (onCacheClear) onCacheClear();
              if (onRefresh) onRefresh();
            } else {
              // For other question types, use the original function
              await onUpdateQuestion(text, explanation);
            }
          }

          // If imageUrl is a data URL and we have an id, upload it now
          try {
            const isData = typeof imageUrl === 'string' && imageUrl.startsWith('data:');
            if (q?.id && imageUrl && isData) {
              const apiBase = import.meta.env.VITE_API_URL;
              const res = await fetch(imageUrl);
              const blob = await res.blob();
              const form = new FormData();
              form.append('file', blob, 'question-image');
              form.append('last_edited_by', userName);
              form.append('replace_existing', 'true');
              await fetch(`${apiBase}/api/images/upload/question/${q.id}`, { method: 'POST', body: form });
            }
          } catch { }
        }}
        question={modalStates.currentQuestion}
      />

      {/* Question Modal — used for creating, editing passages, and editing BLANK questions */}
      <QuestionModal
        isOpen={modalStates.showQuestionModal}
        onClose={onCloseQuestionModal}
        onSave={modalStates.editingPassage ? onAddQuestion : (data: any) => {
          if (data && (data.question_type === 'BLANK' || data.question_type === 'GI' || data.question_type === 'RESP')) {
            onEditBlankSave(data);
          } else {
            onAddQuestion(data);
          }
        }}
        initialValues={modalStates.editingBlank || modalStates.editingPassage || null}
        isPassageEdit={!!modalStates.editingPassage}
      />

      {/* Hot Text Modal */}
      {modalStates.editingHotText && (
        <QuestionModal
          isOpen={modalStates.editHotTextModalOpen}
          onClose={onCloseHotTextModal}
          onSave={onEditHotTextSave}
          initialValues={modalStates.editingHotText}
        />
      )}

      {/* Ray Selector Modal */}
      {modalStates.editingRaySelector && (
        <QuestionModal
          isOpen={modalStates.editRaySelectorModalOpen}
          onClose={onCloseRaySelectorModal}
          onSave={onEditRaySelectorSave}
          initialValues={modalStates.editingRaySelector}
        />
      )}

      {/* DnD Modal */}
      {modalStates.editingDnd && (
        <QuestionModal
          isOpen={modalStates.editDndModalOpen}
          onClose={onCloseDndModal}
          onSave={onEditDndSave}
          initialValues={modalStates.editingDnd}
        />
      )}

      {/* Table Grid Modal */}
      {modalStates.editingTableGrid && (
        <QuestionModal
          isOpen={modalStates.editTableGridModalOpen}
          onClose={onCloseTableGridModal}
          onSave={onEditTableGridSave}
          initialValues={modalStates.editingTableGrid}
        />
      )}

      {/* Graph Selector Modal */}
      {modalStates.editingGraphSelector && (
        <QuestionModal
          isOpen={modalStates.editGraphSelectorModalOpen}
          onClose={onCloseGraphSelectorModal}
          onSave={onEditGraphSelectorSave}
          initialValues={modalStates.editingGraphSelector}
        />
      )}

      {/* Equation Calculator Modal */}
      {modalStates.editingEquationCalculator && (
        <QuestionModal
          isOpen={modalStates.editEquationCalculatorModalOpen}
          onClose={onCloseEquationCalculatorModal}
          onSave={onEditEquationCalculatorSave}
          initialValues={modalStates.editingEquationCalculator}
        />
      )}

      {/* Add Questions to Passage Modal */}
      <AddQuestionsToPassageModal
        isOpen={modalStates.showAddQuestionsToPassageModal}
        onClose={onCloseAddQuestionsToPassageModal}
        selectedPassageId={modalStates.selectedPassageForQuestions}
        passageState={passageState}
        passageQuestionTypes={passageQuestionTypes}
        onUpdateQuestionType={onUpdateQuestionType}
        onAddQuestions={onAddQuestionsToPassage}
        getQuestionTypeDisplayName={getQuestionTypeDisplayName}
      />

      {/* Passage Details Modal */}
      <PassageDetailsModal
        isOpen={modalStates.showPassageDetailsModal}
        onClose={onClosePassageDetailsModal}
        selectedPassageData={modalStates.selectedPassageData}
        onAddMoreQuestions={() => {
          onClosePassageDetailsModal();
          // This would need to be handled by parent
        }}
      />
    </>
  );
}; 