import { useState, useCallback } from 'react';
import type { Question } from '../../../types/questionBank';

interface ModalStates {
  // Edit Choices Modal
  showEditModal: boolean;
  editingQuestion: Question | null;
  editChoices: any[];
  savingChoices: boolean;
  editError: string | null;
  modalRenderKey: number;

  // Edit Question Modal
  showEditQuestionModal: boolean;
  currentQuestion: Question | null;

  // Question Modal
  showQuestionModal: boolean;
  editingPassage?: Question | null;
  editingBlank?: Question | null;

  // Hot Text Modal
  editHotTextModalOpen: boolean;
  editingHotText: Question | null;

  // Ray Selector Modal
  editRaySelectorModalOpen: boolean;
  editingRaySelector: Question | null;
  loadingRaySelectorEdit: boolean;

  // DnD Modal
  editDndModalOpen: boolean;
  editingDnd: Question | null;
  loadingDndEdit: boolean;

  // Table Grid Modal
  editTableGridModalOpen: boolean;
  editingTableGrid: Question | null;
  loadingTableGridEdit: boolean;

  // Graph Selector Modal
  editGraphSelectorModalOpen: boolean;
  editingGraphSelector: Question | null;
  loadingGraphSelectorEdit: boolean;

  // Equation Calculator Modal
  editEquationCalculatorModalOpen: boolean;
  editingEquationCalculator: Question | null;

  // Add Questions to Passage Modal
  showAddQuestionsToPassageModal: boolean;
  selectedPassageForQuestions: number | null;

  // Passage Details Modal
  showPassageDetailsModal: boolean;
  selectedPassageData: any | null;
}

export const useQuestionBankModals = () => {
  const [modalStates, setModalStates] = useState<ModalStates>({
    // Edit Choices Modal
    showEditModal: false,
    editingQuestion: null,
    editChoices: [],
    savingChoices: false,
    editError: null,
    modalRenderKey: 0,

    // Edit Question Modal
    showEditQuestionModal: false,
    currentQuestion: null,

    // Question Modal
    showQuestionModal: false,
    editingPassage: null,
    editingBlank: null,

    // Hot Text Modal
    editHotTextModalOpen: false,
    editingHotText: null,

    // Ray Selector Modal
    editRaySelectorModalOpen: false,
    editingRaySelector: null,
    loadingRaySelectorEdit: false,

    // DnD Modal
    editDndModalOpen: false,
    editingDnd: null,
    loadingDndEdit: false,

    // Table Grid Modal
    editTableGridModalOpen: false,
    editingTableGrid: null,
    loadingTableGridEdit: false,

    // Graph Selector Modal
    editGraphSelectorModalOpen: false,
    editingGraphSelector: null,
    loadingGraphSelectorEdit: false,

    // Equation Calculator Modal
    editEquationCalculatorModalOpen: false,
    editingEquationCalculator: null,

    // Add Questions to Passage Modal
    showAddQuestionsToPassageModal: false,
    selectedPassageForQuestions: null,

    // Passage Details Modal
    showPassageDetailsModal: false,
    selectedPassageData: null,
  });

  const updateModalState = useCallback((updates: Partial<ModalStates>) => {
    setModalStates(prev => ({ ...prev, ...updates }));
  }, []);

  const resetAllModals = useCallback(() => {
    setModalStates({
      showEditModal: false,
      editingQuestion: null,
      editChoices: [],
      savingChoices: false,
      editError: null,
      modalRenderKey: 0,
      showEditQuestionModal: false,
      currentQuestion: null,
      showQuestionModal: false,
      editingPassage: null,
      editingBlank: null,
      editHotTextModalOpen: false,
      editingHotText: null,
      editRaySelectorModalOpen: false,
      editingRaySelector: null,
      loadingRaySelectorEdit: false,
      editDndModalOpen: false,
      editingDnd: null,
      loadingDndEdit: false,
      editTableGridModalOpen: false,
      editingTableGrid: null,
      loadingTableGridEdit: false,
      editGraphSelectorModalOpen: false,
      editingGraphSelector: null,
      loadingGraphSelectorEdit: false,
      editEquationCalculatorModalOpen: false,
      editingEquationCalculator: null,
      showAddQuestionsToPassageModal: false,
      selectedPassageForQuestions: null,
      showPassageDetailsModal: false,
      selectedPassageData: null,
    });
  }, []);

  // Edit Choices Modal
  const openEditChoicesModal = useCallback((question: Question, choices: any[]) => {
    updateModalState({
      editingQuestion: question,
      editChoices: choices,
      editError: null,
      showEditModal: true,
    });
  }, [updateModalState]);

  const closeEditChoicesModal = useCallback(() => {
    updateModalState({
      showEditModal: false,
      editingQuestion: null,
      editChoices: [],
      editError: null,
    });
  }, [updateModalState]);

  // Edit Question Modal
  const openEditQuestionModal = useCallback((question: Question) => {
    updateModalState({
      currentQuestion: question,
      showEditQuestionModal: true,
    });
  }, [updateModalState]);

  const closeEditQuestionModal = useCallback(() => {
    updateModalState({
      showEditQuestionModal: false,
      currentQuestion: null,
    });
  }, [updateModalState]);

  // Question Modal
  const openQuestionModal = useCallback(() => {
    updateModalState({ showQuestionModal: true, editingBlank: null });
  }, [updateModalState]);

  const closeQuestionModal = useCallback(() => {
    updateModalState({ 
      showQuestionModal: false,
      editingPassage: null,
      editingBlank: null,
    });
  }, [updateModalState]);

  // Open the full QuestionModal for BLANK editing (so tag editor is included)
  const openBlankEditModal = useCallback((question: Question) => {
    updateModalState({
      showQuestionModal: true,
      editingBlank: question,
      editingPassage: null,
    });
  }, [updateModalState]);

  // Hot Text Modal
  const openHotTextModal = useCallback((question: Question) => {
    updateModalState({
      editingHotText: question,
      editHotTextModalOpen: true,
    });
  }, [updateModalState]);

  const closeHotTextModal = useCallback(() => {
    updateModalState({
      editHotTextModalOpen: false,
      editingHotText: null,
    });
  }, [updateModalState]);

  // Ray Selector Modal
  const openRaySelectorModal = useCallback((question: Question) => {
    updateModalState({
      editingRaySelector: question,
      editRaySelectorModalOpen: true,
    });
  }, [updateModalState]);

  const closeRaySelectorModal = useCallback(() => {
    updateModalState({
      editRaySelectorModalOpen: false,
      editingRaySelector: null,
      loadingRaySelectorEdit: false,
    });
  }, [updateModalState]);

  // DnD Modal
  const openDndModal = useCallback((question: Question) => {
    updateModalState({
      editingDnd: question,
      editDndModalOpen: true,
    });
  }, [updateModalState]);

  const closeDndModal = useCallback(() => {
    updateModalState({
      editDndModalOpen: false,
      editingDnd: null,
      loadingDndEdit: false,
    });
  }, [updateModalState]);

  // Table Grid Modal
  const openTableGridModal = useCallback((question: Question) => {
    updateModalState({
      editingTableGrid: question,
      editTableGridModalOpen: true,
    });
  }, [updateModalState]);

  const closeTableGridModal = useCallback(() => {
    updateModalState({
      editTableGridModalOpen: false,
      editingTableGrid: null,
      loadingTableGridEdit: false,
    });
  }, [updateModalState]);

  // Graph Selector Modal
  const openGraphSelectorModal = useCallback((question: Question) => {
    updateModalState({
      editingGraphSelector: question,
      editGraphSelectorModalOpen: true,
    });
  }, [updateModalState]);

  const closeGraphSelectorModal = useCallback(() => {
    updateModalState({
      editGraphSelectorModalOpen: false,
      editingGraphSelector: null,
      loadingGraphSelectorEdit: false,
    });
  }, [updateModalState]);

  // Equation Calculator Modal
  const openEquationCalculatorModal = useCallback((question: Question) => {
    updateModalState({
      editingEquationCalculator: question,
      editEquationCalculatorModalOpen: true,
    });
  }, [updateModalState]);

  const closeEquationCalculatorModal = useCallback(() => {
    updateModalState({
      editEquationCalculatorModalOpen: false,
      editingEquationCalculator: null,
    });
  }, [updateModalState]);

  // Add Questions to Passage Modal
  const openAddQuestionsToPassageModal = useCallback((passageId: number) => {
    updateModalState({
      selectedPassageForQuestions: passageId,
      showAddQuestionsToPassageModal: true,
    });
  }, [updateModalState]);

  const closeAddQuestionsToPassageModal = useCallback(() => {
    updateModalState({
      showAddQuestionsToPassageModal: false,
      selectedPassageForQuestions: null,
    });
  }, [updateModalState]);

  // Passage Details Modal
  const openPassageDetailsModal = useCallback((passageData: any) => {
    updateModalState({
      selectedPassageData: passageData,
      showPassageDetailsModal: true,
    });
  }, [updateModalState]);

  const closePassageDetailsModal = useCallback(() => {
    updateModalState({
      showPassageDetailsModal: false,
      selectedPassageData: null,
    });
  }, [updateModalState]);

  return {
    // State
    modalStates,
    
    // Actions
    updateModalState,
    resetAllModals,
    
    // Edit Choices Modal
    openEditChoicesModal,
    closeEditChoicesModal,
    
    // Edit Question Modal
    openEditQuestionModal,
    closeEditQuestionModal,
    
    // Question Modal
    openQuestionModal,
    closeQuestionModal,
    openBlankEditModal,
    
    // Hot Text Modal
    openHotTextModal,
    closeHotTextModal,
    
    // Ray Selector Modal
    openRaySelectorModal,
    closeRaySelectorModal,
    
    // DnD Modal
    openDndModal,
    closeDndModal,
    
    // Table Grid Modal
    openTableGridModal,
    closeTableGridModal,
    
    // Graph Selector Modal
    openGraphSelectorModal,
    closeGraphSelectorModal,

    // Equation Calculator Modal
    openEquationCalculatorModal,
    closeEquationCalculatorModal,

    // Add Questions to Passage Modal
    openAddQuestionsToPassageModal,
    closeAddQuestionsToPassageModal,
    
    // Passage Details Modal
    openPassageDetailsModal,
    closePassageDetailsModal,
  };
}; 