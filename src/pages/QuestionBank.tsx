import { useState, useEffect, useRef, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../components/ui/use-toast";
import { useAuthStore } from "../stores/authStore";
import { FilterContainer } from "../components/Question-Bank/filters";
import { useQuestionBankFilters } from "../components/Question-Bank/hooks/useQuestionBankFilters";
import {
  QuestionBankDisplay,
  QuestionBankModals,
  QuestionBankStates,
  QuestionBankHeader,
  QuestionBankFilter,
  useQuestionBankModals,
  useQuestionBankSearch,
  useQuestionBankData,
  useQuestionActions,
  useQuestionEditing,
  useQuestionBankPagination,
  useOptimisticQuestions,
} from "../components/Question-Bank";
import { addQuestionsToPassage } from "../actions/PassageActions";
import {
  getQuestionTypeDisplayName,
  getDefaultPassageQuestionTypes,
} from "../components/Question-Bank/utils/questionBankUtils";
import type { QuestionType } from "../components/Question-Bank/utils/questionBank";
import type { Question, Choice } from "../types/questionBank";

function QuestionBank() {
  // Initialize the modular filter system
  const {
    filterState,
    filters: filterDefinitions,
    passageState,
    handleFilterChange,
    handleFilterApply,
    handleFilterClear,
    handlePassagesFetch,
    ensureDependentOptionsLoaded,
    applying: filtersApplying,
    initialLoading: filtersInitialLoading,
  } = useQuestionBankFilters();

  // Initialize search functionality
  const {
    searchInput,
    searchDebounced,
    handleSearchInputChange,
    handleSearchInputKeyDown,
  } = useQuestionBankSearch();

  // Initialize modal management
  const {
    modalStates,
    updateModalState,
    openEditChoicesModal,
    closeEditChoicesModal,
    openEditQuestionModal,
    closeEditQuestionModal,
    openQuestionModal,
    closeQuestionModal,
    openBlankEditModal,
    openHotTextModal,
    closeHotTextModal,
    openRaySelectorModal,
    closeRaySelectorModal,
    openDndModal,
    closeDndModal,
    openTableGridModal,
    closeTableGridModal,
    openGraphSelectorModal,
    closeGraphSelectorModal,
    openEquationCalculatorModal,
    closeEquationCalculatorModal,
    openAddQuestionsToPassageModal,
    closeAddQuestionsToPassageModal,
    closePassageDetailsModal,
  } = useQuestionBankModals();

  // Initialize pagination
  const questionsPerPage = 10;
  const {
    currentPage,
    //totalPages,
    //indexOfFirstItem,
    //indexOfLastItem,
    handlePageChange,
    resetToFirstPage,
  } = useQuestionBankPagination({
    totalQuestions: 0, // Will be updated by data hook
    totalPassages: 0, // Will be updated by data hook
    isShowingPassages: false, // Will be updated by data hook
    questionsPerPage,
  });

  // URL search params (sync page and search for smoother UX)
  const [searchParams, setSearchParams] = useSearchParams();

  // On mount, read initial values from URL
  useEffect(() => {
    const urlPage = parseInt(searchParams.get("page") || "1", 10);
    if (!Number.isNaN(urlPage) && urlPage !== currentPage) {
      handlePageChange(urlPage);
    }
    const q = searchParams.get("q") || "";
    if (q && q !== searchInput) {
      // Seed the search input from URL if present
      // We call the change handler shape by crafting a synthetic event
      handleSearchInputChange({ target: { value: q } } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL in sync with current page and debounced search
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchDebounced) params.q = searchDebounced;
    params.page = currentPage.toString();
    setSearchParams(params);
  }, [currentPage, searchDebounced, setSearchParams]);

  // Initialize data fetching
  const {
    questions,
    loading,
    error,
    totalQuestions,
    totalChapters,
    totalPassages,
    displayPassages,
    isShowingPassages,
    fetchQuestions,
    clearCacheAndRefresh,
  } = useQuestionBankData({
    searchDebounced,
    currentPage,
    questionsPerPage,
    filtersInitialLoading,
    handleFilterApply,
  });

  // Initialize question actions
  const {
    handleDeleteQuestion,
    handleUpdateQuestionText,
    handleUpdateMAQuestionText,
    handleSaveChoices,
  } = useQuestionActions({
    onRefresh: fetchQuestions,
    onCacheClear: clearCacheAndRefresh,
  });

  // Initialize question editing
  const {
    handleEditQuestionClick,
  } = useQuestionEditing({
    onOpenRaySelectorModal: openRaySelectorModal,
    onOpenDndModal: openDndModal,
    onOpenTableGridModal: openTableGridModal,
    onOpenGraphSelectorModal: openGraphSelectorModal,
    onOpenHotTextModal: openHotTextModal,
    onOpenBlankModal: openBlankEditModal,
    onOpenEquationCalculatorModal: openEquationCalculatorModal,
    onOpenEditQuestionModal: openEditQuestionModal,
    onSetLoadingRaySelectorEdit: (loading) => updateModalState({ loadingRaySelectorEdit: loading }),
    onSetLoadingDndEdit: (loading) => updateModalState({ loadingDndEdit: loading }),
    onSetLoadingTableGridEdit: (loading) => updateModalState({ loadingTableGridEdit: loading }),
    onSetLoadingGraphSelectorEdit: (loading) => updateModalState({ loadingGraphSelectorEdit: loading }),
  });

  // Local state for filters and passage questions
  const [showFilters, setShowFilters] = useState(() => {
    const stored = localStorage.getItem("showFilters");
    return stored === null ? false : stored === "true";
  });

  const [passageQuestionTypes, setPassageQuestionTypes] = useState<
    Record<QuestionType, number>
  >(getDefaultPassageQuestionTypes());

  // Local state for edit choices modal
  const [editChoices, setEditChoices] = useState<Choice[]>([]);

  // Local state for questions (for full optimistic UI)
  const [localQuestions, setLocalQuestions] = useState<Question[]>([]);
  const isFirstLoad = useRef(true);

  // Ensure dependent options are loaded when filter modal is opened
  useEffect(() => {
    if (showFilters && !filtersInitialLoading) {
      ensureDependentOptionsLoaded();
    }
  }, [showFilters, filtersInitialLoading, ensureDependentOptionsLoaded]);

  // On initial load or explicit fetch, update localQuestions
  useEffect(() => {
    if (isFirstLoad.current || loading === false) {
      setLocalQuestions(questions);
      isFirstLoad.current = false;
    }
  }, [questions, loading]);

  // Use modular optimistic questions hook with local state
  const {
    questionsState,
    handleDeleteQuestionOptimistic,
    deletingQuestionId,
    handleUpdateQuestionChoicesOptimistic,
    handleUpdateQuestionTextOptimistic,
  } = useOptimisticQuestions({
    questions: localQuestions,
    handleDeleteQuestion: async (question) => {
      await handleDeleteQuestion(question);
      setLocalQuestions((prev) => prev.filter((q) => q.id !== question.id));
    },
    handleUpdateQuestionChoices: async (question, choices) => {
      await handleSaveChoices(question, choices);
      setLocalQuestions((prev) => prev.map((q) => q.id === question.id ? { ...q, choices } : q));
    },
    handleUpdateQuestionText: async (questionId, newText) => {
      await handleUpdateQuestionText(questionId, newText);
      setLocalQuestions((prev) => prev.map((q) => q.id === questionId ? { ...q, question: newText } : q));
    },
  });

  // Get user name
  const userName = useAuthStore.getState().getUserName();
  const { toast } = useToast();

  // Move this useCallback hook before any early returns
  const handleAddModalClose = useCallback(() => {
    // This will trigger the handleClose in QuestionModal, which clears the draft
    closeQuestionModal();
  }, [closeQuestionModal]);

  // Persist showFilters state to localStorage
  useEffect(() => {
    localStorage.setItem("showFilters", showFilters ? "true" : "false");
  }, [showFilters]);

  const isMobile = useIsMobile();

  // Memoized fetch helper
  const refetchQuestions = useCallback(async () => {
    await fetchQuestions();
  }, [fetchQuestions]);

  // Handler functions for filters that close overlay on mobile
  const handleMobileFilterApply = useCallback(async () => {
    await refetchQuestions();
    resetToFirstPage();
    if (isMobile) {
      setShowFilters(false); // Close overlay on mobile only
    }
  }, [refetchQuestions, resetToFirstPage, isMobile]);

  const handleMobileFilterClear = useCallback(async () => {
    await refetchQuestions();
    handleFilterClear();
    prevQuestionId.current = ""; // Prevent the auto-apply timer from triggering again
    resetToFirstPage();
    if (isMobile) {
      setShowFilters(false); // Close overlay on mobile only
    }
  }, [refetchQuestions, handleFilterClear, resetToFirstPage, isMobile]);

  const prevQuestionId = useRef(filterState.values.question_id);

  useEffect(() => {
    const currentId = filterState.values.question_id;
    
    // Trigger on ANY meaningful change to the Question ID filter
    if (prevQuestionId.current !== currentId) {
      const timer = setTimeout(() => {
        handleMobileFilterApply();
      }, 5000);
      
      // Update ref to current value to acknowledge the change
      prevQuestionId.current = currentId;
      
      return () => clearTimeout(timer);
    }
  }, [filterState.values.question_id, handleMobileFilterApply]);

  // Show loading or error states AFTER all hooks have been called
  if (loading && isFirstLoad.current) {
    return <QuestionBankStates loading={loading} />;
  }

  if (error) {
    return <QuestionBankStates error={error} />;
  }

  // Handler to open EditChoicesModal and initialize choices
  const handleEditChoices = (question: Question) => {
    const choicesToEdit = (question.choices || []).map((c) => ({
      id: c.id,
      choice_label: c.choice_label || "",
      choice_text: c.choice_text || "",
      is_correct: c.is_correct || false,
      explanation: c.explanation || "",
      choice_image_url: c.choice_image_url || undefined,
    }));
    setEditChoices(choicesToEdit);
    openEditChoicesModal(question, choicesToEdit);
  };

  // Helper to relabel choices sequentially (A, B, C, ...)
  const relabelChoices = (choices: Choice[]): Choice[] => {
    return choices.map((choice, idx) => ({
      ...choice,
      choice_label: String.fromCharCode(65 + idx),
    }));
  };

  // Handlers for editing choices in modal
  const handleChoicesChange = (newChoices: any) => {
    setEditChoices(newChoices);
    updateModalState({ editChoices: newChoices });
  };
  const handleAddChoice = () => {
    const newChoice: Choice = {
      id: undefined,
      choice_label: "", // will be set by relabel
      choice_text: "",
      is_correct: false,
      explanation: "",
      choice_image_url: undefined,
    };
    const newChoices = relabelChoices([...editChoices, newChoice]);
    setEditChoices(newChoices);
    updateModalState({ editChoices: newChoices });
  };
  const handleRemoveChoice = (idx: number) => {
    const newChoices = relabelChoices(editChoices.filter((_, i) => i !== idx));
    setEditChoices(newChoices);
    updateModalState({ editChoices: newChoices });
  };

  // Handle question updates
  const handleUpdateQuestion = async (newText: string) => {
    if (!modalStates.currentQuestion) return;
    await handleUpdateQuestionTextOptimistic(modalStates.currentQuestion.id, newText);
    closeEditQuestionModal();
  };

  // Handle passage editing - opens QuestionModal in RC mode
  const handleEditPassage = (question: Question) => {
    /* console.log("🔍 Edit Passage Click - Question:", question); */
    // Always use a numeric passage_id for modal and backend
    const passage_id = typeof question.passage_id === 'number' && !isNaN(question.passage_id)
      ? question.passage_id
      : (typeof question.id === 'number' && !isNaN(question.id) ? question.id : undefined);
    if (!passage_id || !Number.isInteger(passage_id)) {
      console.warn("[handleEditPassage] Invalid passage_id for passage editing", question);
      toast({
        title: "Invalid Passage Edit",
        description: "Cannot edit passage: invalid passage_id.",
        variant: "destructive",
      });
      return;
    }
    // Transform question to RC format for passage editing
    const passageQuestion = {
      ...question,
      question_type: "RC", // Use RC for passage editing
      passage: question.passage || "",
      passage_id, // Always numeric
      id: question.id, // Keep id for reference
    };
    updateModalState({
      showQuestionModal: true,
      editingPassage: passageQuestion
    });
  };

  // Handle question additions and passage editing
  const handleAddQuestion = async (questionData: any) => {
    try {
      // Check if we're editing a passage (based on editingPassage state)
      if (modalStates.editingPassage) {
        // This is passage editing - the QuestionModal handles the passage update API call
        // Just close modal and refresh
        closeQuestionModal();

        // Show success toast
        toast({
          title: "Passage Updated Successfully",
          description: "The passage has been updated. Refreshing the list in a moment...",
          duration: 3000,
        });

        // Wait a bit for database to be updated, then refresh UI
        setTimeout(() => {
          clearCacheAndRefresh();
          resetToFirstPage();
        }, 1000); // 1 second delay
        return;
      }

      // Table Grid question (only if it has selection_mode AND is actually TABLE_GRID type)
      if (
        questionData.selection_mode &&
        questionData.question_type === "TABLE_GRID"
      ) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/table-grid-questions/create`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(questionData),
          },
        );
        if (!response.ok)
          throw new Error("Failed to create Table Grid question");
        closeQuestionModal();

        // Show success toast
        toast({
          title: "Question Created Successfully",
          description: "The question has been created. Refreshing the list in a moment...",
          duration: 3000,
        });

        // Wait a bit for database to be updated, then refresh UI
        setTimeout(() => {
          clearCacheAndRefresh();
          resetToFirstPage();
        }, 1000); // 1 second delay
        return;
      }
      // For all other question types (including BLANK), the QuestionModal handles the API call
      closeQuestionModal();

      // Show success toast
      toast({
        title: "Question Created Successfully",
        description: "The question has been created. Refreshing the list in a moment...",
        duration: 3000,
      });

      // Wait a bit for database to be updated, then refresh UI
      setTimeout(() => {
        clearCacheAndRefresh();
        resetToFirstPage();
      }, 1000); // 1 second delay
    } catch (err) {
      alert("Failed to refresh questions");
    }
  };

  // Handle modal saves
  const handleEditHotTextSave = async (data: any) => {
    // Optimistically update the UI with the saved data
    if (data && (data.id || data.question_id)) {
      const qId = data.id || data.question_id;
      const now = new Date().toISOString();
      setLocalQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...data, id: qId, updated_at: data.updated_at || now } : q));
    }

    closeHotTextModal();

    toast({
      title: "Question Saved Successfully",
      description: "The question has been saved.",
      duration: 3000,
    });

    // Refresh cache immediately
    clearCacheAndRefresh();
  };

  const handleEditRaySelectorSave = async (data: any) => {
    // Optimistically update the UI with the saved data
    if (data && (data.id || data.question_id)) {
      const qId = data.id || data.question_id;
      const now = new Date().toISOString();
      setLocalQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...data, id: qId, updated_at: data.updated_at || now } : q));
    }

    closeRaySelectorModal();

    toast({
      title: "Question Saved Successfully",
      description: "The question has been saved.",
      duration: 3000,
    });

    // Refresh cache immediately
    clearCacheAndRefresh();
  };

  const handleEditDndSave = async (data: any) => {
    // Optimistically update the UI with the saved data
    if (data && (data.id || data.question_id)) {
      const qId = data.id || data.question_id;
      const now = new Date().toISOString();
      setLocalQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...data, id: qId, updated_at: data.updated_at || now } : q));
    }

    closeDndModal();

    toast({
      title: "Question Saved Successfully",
      description: "The question has been saved.",
      duration: 3000,
    });

    // Refresh cache immediately
    clearCacheAndRefresh();
  };

  const handleEditTableGridSave = async (data: any) => {
    // Optimistically update the UI with the saved data
    if (data && (data.id || data.question_id)) {
      const qId = data.id || data.question_id;
      const now = new Date().toISOString();
      setLocalQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...data, id: qId, updated_at: data.updated_at || now } : q));
    }

    closeTableGridModal();

    toast({
      title: "Question Saved Successfully",
      description: "The question has been saved.",
      duration: 3000,
    });

    // Refresh cache immediately
    clearCacheAndRefresh();
  };

  const handleEditGraphSelectorSave = async (data: any) => {
    // Optimistically update the UI with the saved data
    if (data && (data.id || data.question_id)) {
      const qId = data.id || data.question_id;
      const now = new Date().toISOString();
      setLocalQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...data, id: qId, updated_at: data.updated_at || now } : q));
    }

    closeGraphSelectorModal();

    toast({
      title: "Question Saved Successfully",
      description: "The question has been saved.",
      duration: 3000,
    });

    // Refresh cache immediately
    clearCacheAndRefresh();
  };

  const handleEditEquationCalculatorSave = async (data: any) => {
    if (data && (data.id || data.question_id)) {
      const qId = data.id || data.question_id;
      const now = new Date().toISOString();
      setLocalQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...data, id: qId, updated_at: data.updated_at || now } : q));
    }

    closeEquationCalculatorModal();

    toast({
      title: "Question Saved Successfully",
      description: "The equation calculator question has been saved.",
      duration: 3000,
    });

    clearCacheAndRefresh();
  };

  const handleEditBlankSave = async (data: any) => {
    // Optimistically update the UI with the saved data
    if (data && (data.id || data.question_id)) {
      const qId = data.id || data.question_id;
      const now = new Date().toISOString();
      setLocalQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...data, id: qId, updated_at: data.updated_at || now } : q));
    }

    closeQuestionModal();

    toast({
      title: "Question Saved Successfully",
      description: "The question has been saved.",
      duration: 3000,
    });

    // Refresh cache immediately
    clearCacheAndRefresh();
  };

  // Handle add questions to passage
  const handleAddQuestionsToPassage = async () => {
    if (!modalStates.selectedPassageForQuestions) return;

    // Filter out question types with 0 count
    const filteredQuestionTypes = Object.fromEntries(
      Object.entries(passageQuestionTypes).filter(([_, count]) => count > 0),
    );

    if (Object.keys(filteredQuestionTypes).length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one question type",
        variant: "destructive",
      });
      return;
    }

    try {
      await addQuestionsToPassage(
        modalStates.selectedPassageForQuestions,
        filteredQuestionTypes,
        userName,
      );
      toast({
        title: "Success",
        description: `Created ${Object.values(filteredQuestionTypes).reduce((a, b) => a + b, 0)} questions`,
      });

      // Refresh questions and passages
      await refetchQuestions();
      handlePassagesFetch();
      closeAddQuestionsToPassageModal();
      setPassageQuestionTypes(getDefaultPassageQuestionTypes());
    } catch (error) {
      console.error("Error creating questions:", error);
      toast({
        title: "Error",
        description: "Failed to create questions",
        variant: "destructive",
      });
    }
  };

  // Update question type count
  const updatePassageQuestionType = (type: QuestionType, value: number) => {
    setPassageQuestionTypes((prev) => ({
      ...prev,
      [type]: Math.max(0, value),
    }));
  };

  // Handle add questions to specific passage
  const handleAddQuestionsToSpecificPassage = (passageId: number) => {
    openAddQuestionsToPassageModal(passageId);
  };

  // Clear filters function
  const clearFilters = useCallback(() => {
    clearCacheAndRefresh();
    handleFilterClear();
    prevQuestionId.current = ""; // Prevent the auto-apply timer
    resetToFirstPage();
  }, [clearCacheAndRefresh, handleFilterClear, resetToFirstPage]);

  // (refetchQuestions moved up)

  // Update local questions when questions state changes
  useEffect(() => {
    setLocalQuestions(questions);
  }, [questions]);


  return (
    <div className="min-h-screen px-4 md:px-10 py-4 bg-gray-50">
      <QuestionBankHeader
        onOpenQuestionModal={openQuestionModal}
        chaptersLength={totalChapters}
        totalQuestions={totalQuestions}
      />

      <QuestionBankFilter
        searchInput={searchInput}
        handleSearchInputChange={handleSearchInputChange}
        handleSearchInputKeyDown={handleSearchInputKeyDown}
        setShowFilters={setShowFilters}
        showFilters={showFilters}
      />

      <div className="flex flex-col md:flex-row gap-2">
        {/* Filters Sidebar - Desktop */}
        {showFilters && !isMobile && (
          <FilterContainer
            filters={filterDefinitions}
            state={filterState}
            onFilterChange={handleFilterChange}
            onFilterApply={handleMobileFilterApply}
            onFilterClear={handleMobileFilterClear}
            onClose={() => setShowFilters(false)}
            loading={filtersApplying}
            passageState={passageState}
            onPassagesFetch={handlePassagesFetch}
          />
        )}

        {/* Filters Sheet - Mobile */}
        <Sheet open={showFilters && isMobile} onOpenChange={(open) => !open && setShowFilters(false)}>
          <SheetContent side="left" className=" sm:max-w-md overflow-y-auto">
            <FilterContainer
              filters={filterDefinitions}
              state={filterState}
              onFilterChange={handleFilterChange}
              onFilterApply={handleMobileFilterApply}
              onFilterClear={handleMobileFilterClear}
              onClose={() => setShowFilters(false)}
              loading={filtersApplying}
              passageState={passageState}
              onPassagesFetch={handlePassagesFetch}
            />
          </SheetContent>
        </Sheet>

        {/* Questions/Passages Display */}
        <div className="flex-1 w-full">
          <QuestionBankDisplay
            isShowingPassages={isShowingPassages}
            displayPassages={displayPassages}
            questions={questionsState}
            totalPassages={totalPassages}
            totalQuestions={totalQuestions}
            currentPage={currentPage}
            questionsPerPage={questionsPerPage}
            onPageChange={handlePageChange}
            isFetchingPage={!isFirstLoad.current && loading}
            onEditChoices={handleEditChoices}
            onEditQuestion={handleEditQuestionClick}
            onEditPassage={handleEditPassage}
            onDeleteQuestion={handleDeleteQuestionOptimistic}
            onAddQuestionsToPassage={handleAddQuestionsToSpecificPassage}
            deletingQuestionId={deletingQuestionId}
          />
        </div>
      </div>

      {/* Modals */}
      <QuestionBankModals
        modalStates={modalStates}
        onCloseEditChoicesModal={closeEditChoicesModal}
        onCloseEditQuestionModal={closeEditQuestionModal}
        onCloseQuestionModal={closeQuestionModal}
        onCloseHotTextModal={closeHotTextModal}
        onCloseRaySelectorModal={closeRaySelectorModal}
        onCloseDndModal={closeDndModal}
        onCloseTableGridModal={closeTableGridModal}
        onCloseGraphSelectorModal={closeGraphSelectorModal}
        onCloseEquationCalculatorModal={closeEquationCalculatorModal}
        onCloseAddQuestionsToPassageModal={closeAddQuestionsToPassageModal}
        onClosePassageDetailsModal={closePassageDetailsModal}
        onSaveChoices={async (question, choices) => {
          if (question && choices.length > 0) {
            await handleUpdateQuestionChoicesOptimistic(question, choices);
            closeEditChoicesModal();
          }
        }}
        onUpdateQuestion={handleUpdateQuestion}
        onAddQuestion={handleAddQuestion}
        onEditHotTextSave={handleEditHotTextSave}
        onEditRaySelectorSave={handleEditRaySelectorSave}
        onEditDndSave={handleEditDndSave}
        onEditTableGridSave={handleEditTableGridSave}
        onEditGraphSelectorSave={handleEditGraphSelectorSave}
        onEditEquationCalculatorSave={handleEditEquationCalculatorSave}
        onEditBlankSave={handleEditBlankSave}
        onAddQuestionsToPassage={handleAddQuestionsToPassage}
        onRefresh={fetchQuestions}
        onCacheClear={clearCacheAndRefresh}
        userName={userName}
        passageState={passageState}
        passageQuestionTypes={passageQuestionTypes}
        onUpdateQuestionType={updatePassageQuestionType}
        getQuestionTypeDisplayName={getQuestionTypeDisplayName}
        // Pass new handlers for edit choices modal
        editChoices={editChoices}
        onChoicesChange={handleChoicesChange}
        onAddChoice={handleAddChoice}
        onRemoveChoice={handleRemoveChoice}
        choiceType="pre_shsat"
      />
    </div>
  );
}

export default QuestionBank;