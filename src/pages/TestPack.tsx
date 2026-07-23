import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  BookOpen,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import TestPackFilter, {
  FilterState,
} from "../components/test-pack/TestPackFilter";
import { TestPackQuestionsGrid } from "../components/test-pack/TestPackQuestionsGrid";
import { testPackService } from "../services/testPackService";
import { TestPackQuestionModal } from "../components/TestPackQuestionModal";
import { QuestionModal } from "../components/QuestionModal";
import { EditQuestionModal } from "../components/EditQuestionModal";
import { TestPackEditChoicesModal } from "../components/test-pack/modals/TestPackEditChoicesModal";
import { QuestionNumberEditor } from "../components/question-reordering/QuestionNumberEditor";
import { QuestionReorderingModal } from "../components/question-reordering/QuestionReorderingModal";
import { usePostHog } from 'posthog-js/react';
import { useAuthStore } from "../stores/authStore";
import { TrackedButton } from "../components/TrackedButton";
// import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

interface Test {
  id: number;
  name: string;
  test_description?: string;
  default_test_text?: string;
  created_at: string;
  updated_at: string;
  root_test_id?: number | null;
}

interface Question {
  id: number;
  question_id: number;
  question: string;
  passage_id?: number | null;
  custom_passage?: string | null;
  question_number: number;
  difficulty: number;
  question_category_id: number;
  question_type: string | number;
  question_type_acronym?: string;
  question_type_name?: string;
  test_id: number;
  content?: string;
  answer?: string;
  explanation?: string;
  choices?: any[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  last_edited_by?: string;
  is_active: boolean;
  // Add fields needed for RC questions
  passage?: string;
  page_number?: number;
  chapter_number?: number;
  chapter_title?: string;
  topic_title?: string;
  subtopic_title?: string;
  // Add other question fields as needed
}

const STORAGE_KEY = "testpack-state";

// const navigate = useNavigate()

// const handleBack = () => {
//       navigate("/teachers");
// };

// State persistence helper functions
const saveStateToStorage = (state: any) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to save state to localStorage:", error);
  }
};

const getStateFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn("Failed to load state from localStorage:", error);
    return null;
  }
};

const transformQuestionTypeForApi = (questionType: string | null) => {
  if (!questionType) return {};

  // Special handling for RC - send as string to trigger passage-based filtering
  if (questionType === "RC") return { question_type: "RC" };

  // Use integer IDs for all other question types
  if (questionType === "MC_FULL" || questionType === "MC_STANDARD") return { question_type: 40, question_category: "standard" };
  if (questionType === "MC_DRAG_DROP") return { question_type: 40, question_category: "drag_drop" };
  if (questionType === "MA") return { question_type: 44 };
  if (questionType === "TF") return { question_type: 41 };
  if (questionType === "GI") return { question_type: 39 };
  if (questionType === "BLANK") return { question_type: 42 };
  if (questionType === "BLANK_FILL_BOX") return { question_type: 42, question_category: "fill_box" };
  if (questionType === "REA") return { question_type: 36 };
  if (questionType === "REB") return { question_type: 37 };
  if (questionType === "HOT_TEXT") return { question_type: 45 };
  if (questionType === "TABLE_GRID_SINGLE") return { question_type: 47, question_category: "single" };
  if (questionType === "TABLE_GRID_MULTI") return { question_type: 47, question_category: "multiple" };
  if (questionType === "RAY_SELECTOR") return { question_type: 49 };
  if (questionType === "GRAPH_SELECTOR") return { question_type: 50 };
  if (questionType === "EQUATION_CALCULATOR") return { question_type: 51 };
  if (questionType === "DND_SINGLE") return { question_type: 46, question_category: "two_buckets_single" };
  if (questionType === "DND_MULTI") return { question_type: 46, question_category: "two_buckets_multi" };
  if (questionType === "DND_ONE_BUCKET_MULTI") return { question_type: 46, question_category: "one_bucket_multi" };
  if (questionType === "DND_ONE_BUCKET_SINGLE") return { question_type: 46, question_category: "one_bucket_single" };
  if (questionType === "DND_TABLE") return { question_type: 46, question_category: "table_dnd" };
  return { question_type: questionType };
};

function TestPack() {
  // PostHog tracking
  const posthog = usePostHog();
  const getUserName = useAuthStore((state) => state.getUserName);
  const user = useAuthStore((state) => state.user);

  // Initialize state with persisted values
  const [tests, setTests] = useState<Test[]>([]);
  const [questionType, setQuestionType] = useState<string | null>(() => {
    const saved = getStateFromStorage();
    // Only restore filters if the session is very recent (less than 1 minute)
    if (saved?.timestamp && Date.now() - saved.timestamp < 60000) {
      return saved?.questionType || null;
    }
    return null;
  });
  const [questionNumber, setQuestionNumber] = useState<string | null>(() => {
    const saved = getStateFromStorage();
    // Only restore filters if the session is very recent (less than 1 minute)
    if (saved?.timestamp && Date.now() - saved.timestamp < 60000) {
      return saved?.questionNumber || null;
    }
    return null;
  });
  const [hasPassage, setHasPassage] = useState<string | null>(() => {
    const saved = getStateFromStorage();
    // Only restore filters if the session is very recent (less than 1 minute)
    if (saved?.timestamp && Date.now() - saved.timestamp < 60000) {
      return saved?.hasPassage || null;
    }
    return null;
  });
  const [isActive, setIsActive] = useState<string | null>(null); // <-- Add state for isActive
  const [selectedTest, setSelectedTest] = useState<Test | null>(() => {
    const saved = getStateFromStorage();
    return saved?.selectedTest || null;
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(() => {
    const saved = getStateFromStorage();
    return saved?.searchQuery || "";
  });
  const [showFilters, setShowFilters] = useState(() => {
    const saved = getStateFromStorage();
    return saved?.showFilters || false;
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string>("");
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = getStateFromStorage();
    return saved?.currentPage || 1;
  });
  const questionsPerPage = 10;
  const { toast } = useToast();
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [editQuestionModal, setEditQuestionModal] = useState<{
    open: boolean;
    question: any;
  }>({ open: false, question: null });

  const [editPassageModal, setEditPassageModal] = useState<{
    open: boolean;
    question: any;
  }>({ open: false, question: null });

  const [editTextModal, setEditTextModal] = useState<{
    open: boolean;
    question: any;
  }>({ open: false, question: null });
  const [editChoicesModal, setEditChoicesModal] = useState<{
    open: boolean;
    question: any | null;
  }>({ open: false, question: null });
  const [questionNumberEditor, setQuestionNumberEditor] = useState<{
    open: boolean;
    question: any | null;
  }>({ open: false, question: null });
  const [reorderModal, setReorderModal] = useState<{
    open: boolean;
    questions: any[];
  }>({ open: false, questions: [] });
  const [pageInput, setPageInput] = useState(() => {
    const saved = getStateFromStorage();
    return saved?.currentPage?.toString() || "1";
  });

  // Effect to persist state whenever key state changes
  useEffect(() => {
    const stateToSave = {
      selectedTest,
      searchQuery,
      showFilters,
      currentPage,
      questionType,
      questionNumber,
      hasPassage,
      isActive, // <-- Save isActive
      timestamp: Date.now(),
    };
    saveStateToStorage(stateToSave);
  }, [
    selectedTest,
    searchQuery,
    showFilters,
    currentPage,
    questionType,
    questionNumber,
    hasPassage,
    isActive, // <-- Add isActive to deps
  ]);

  useEffect(() => {
    fetchTests();
  }, []);

  // Effect to restore selected test after tests are loaded
  useEffect(() => {
    if (tests.length > 0 && selectedTest) {
      // Verify that the saved selected test still exists in the current tests list
      const testExists = tests.find((t) => t.id === selectedTest.id);
      if (!testExists) {
        // If saved test no longer exists, clear it
        setSelectedTest(null);
        toast({
          title: "Test Not Found",
          description: "The previously selected test is no longer available.",
          variant: "destructive",
        });
      } else {
        // State was successfully restored
        const savedState = getStateFromStorage();
        if (
          savedState &&
          savedState.timestamp &&
          Date.now() - savedState.timestamp < 300000
        ) {
          // 5 minutes
          toast({
            title: "Filters Restored",
            description: `Restored your previous view: ${selectedTest.name}`,
            duration: 3000,
          });
        } else {
          // If the saved state is old, clear the filters but keep the test
          setQuestionType(null);
          setQuestionNumber(null);
          setHasPassage(null);
          setIsActive(null); // <-- Clear isActive
        }
      }
    }
  }, [tests, selectedTest, toast]);

  useEffect(() => {
    if (selectedTest) {
      fetchTestQuestions(
        selectedTest.id,
        questionType,
        questionNumber,
        currentPage,
        hasPassage,
        isActive // <-- Pass isActive
      );
    } else {
      setQuestions([]);
      setTotalQuestions(0);
    }
  }, [selectedTest, currentPage, questionType, questionNumber, hasPassage, isActive]); // <-- Add isActive to deps

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/test-pack/tests`);
      if (!response.ok) throw new Error("Failed to fetch tests");
      const data = await response.json();
      setTests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tests");
      toast({
        title: "Error",
        description: "Failed to load tests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTestQuestions = async (
    testId: number,
    questionType: string | null,
    questionNumber: string | null,
    page: number,
    hasPassage: string | null,
    isActive: string | null // <-- Add isActive param
  ) => {
    try {
      const params: Record<string, string> = {};
      if (questionNumber) params.question_number = questionNumber;
      if (hasPassage) params.has_passage = hasPassage;
      if (isActive && isActive !== "") params.is_active = isActive; // <-- Add is_active param
      const typeParams = transformQuestionTypeForApi(questionType);
      Object.assign(params, typeParams);
      const queryString = Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&");
      const url = `${API_URL}/api/test-pack/tests/${testId}/questions-with-choices?t=${Date.now()}${queryString ? `&${queryString}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch test questions");
      const data = await response.json();
      setQuestions(data);
      setTotalQuestions(data.length);
      // --- Pagination sync fix ---
      const totalPages = Math.max(1, Math.ceil(data.length / questionsPerPage));
      if (page > totalPages) {
        setCurrentPage(totalPages);
        setPageInput(totalPages.toString());
      } else if (page < 1) {
        setCurrentPage(1);
        setPageInput("1");
      } else {
        setPageInput(page.toString());
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load test questions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateTest = () => {
    const userName = getUserName();
    /* console.log('PostHog tracking - Create Test Pack:', {
      userName,
      user,
      userEmail: user?.email,
      userNameFromUser: user?.name
    }); */

    posthog.capture('create_test_pack_button_clicked', {
      user_name: userName,
      user_email: user?.email || 'unknown',
      user_id: user?.id || 'unknown',
      user_role: user?.role || 'unknown',
      timestamp: new Date().toISOString()
    });

    setShowCreateDialog(true);
  };

  const handleConfirmCreate = async () => {
    if (!selectedTestId) {
      toast({
        title: "Error",
        description: "Please select a test to clone.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/test-pack/clone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_test_id: parseInt(selectedTestId),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create test");
      }

      setShowCreateDialog(false);
      setSelectedTestId("");
      toast({
        title: "Success",
        description: "Test created successfully.",
      });
      fetchTests();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create test. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (filters: FilterState) => {
    if (filters.selectedTestId) {
      const test = tests.find((t) => t.id === filters.selectedTestId);
      setSelectedTest(test || null);

      // Clear filters when selecting a new test (unless they were explicitly set)
      if (test && test.id !== selectedTest?.id) {
        setQuestionType(null);
        setQuestionNumber(null);
        setHasPassage(null);
        setIsActive(null); // <-- Reset isActive
      } else {
        // Only apply filters if we're staying on the same test
        setQuestionType(filters.questionType || null);
        setQuestionNumber(filters.questionNumber || null);
        setHasPassage(filters.hasPassage || null);
        setIsActive(filters.isActive || null); // <-- Set isActive
      }
    } else {
      setSelectedTest(null);
      setQuestionType(filters.questionType || null);
      setQuestionNumber(filters.questionNumber || null);
      setHasPassage(filters.hasPassage || null);
      setIsActive(filters.isActive || null); // <-- Set isActive
    }
    setCurrentPage(1); // Reset to first page when applying filters
  };

  const handleClearFilters = () => {
    setSelectedTest(null);
    setQuestionType(null);
    setQuestionNumber(null);
    setHasPassage(null);
    setIsActive(null); // <-- Clear isActive
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  // Calculate total pages for questions
  const filteredQuestions = questions.filter(
    (question) =>
      !searchQuery ||
      question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (question.custom_passage &&
        question.custom_passage
          .toLowerCase()
          .includes(searchQuery.toLowerCase())),
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTest]);

  // Handler for adding a question
  const handleAddQuestion = () => {
    if (!selectedTest) {
      toast({
        title: "Error",
        description: "Please select a test first before adding questions.",
        variant: "destructive",
      });
      return;
    }

    const userName = getUserName();
    /* console.log('PostHog tracking - Add Question:', {
      userName,
      user,
      userEmail: user?.email,
      userNameFromUser: user?.name
    }); */

    posthog.capture('add_question_button_clicked', {
      user_name: userName,
      user_email: user?.email || 'unknown',
      user_id: user?.id || 'unknown',
      user_role: user?.role || 'unknown',
      test_id: selectedTest.id,
      timestamp: new Date().toISOString()
    });

    setShowAddQuestionModal(true);
  };

  // Handler for saving a new question
  const handleSaveQuestion = async (questionData: any) => {
    if (!selectedTest) return;
    try {
      // The modal already handles the API call, just refresh the questions
      setShowAddQuestionModal(false);
      toast({ title: "Success", description: "Question added to test pack." });
      // Refresh questions while preserving current page and filters
      fetchTestQuestions(
        selectedTest.id,
        questionType,
        questionNumber,
        currentPage,
        hasPassage,
        isActive // <-- Pass isActive
      );
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add question.",
        variant: "destructive",
      });
    }
  };

  // Pagination controls
  const totalPages = Math.max(1, Math.ceil(totalQuestions / questionsPerPage));

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let page = parseInt(e.target.value, 10);
    if (isNaN(page) || page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
    setPageInput(page.toString());
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      let page = parseInt(pageInput, 10);
      if (isNaN(page) || page < 1) page = 1;
      if (page > totalPages) page = totalPages;
      setCurrentPage(page);
      setPageInput(page.toString());
    }
  };

  // Helper to update a question in the questions array
  const updateQuestionInState = (updatedQuestion: any) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.question_id === updatedQuestion.question_id
          ? { ...q, ...updatedQuestion }
          : q,
      ),
    );
  };

  // Helper to refresh questions while preserving state
  const refreshQuestions = () => {
    if (selectedTest) {
      fetchTestQuestions(
        selectedTest.id,
        questionType,
        questionNumber,
        currentPage,
        hasPassage,
        isActive // <-- Pass isActive
      );
    }
  };

  // Helper to clear persisted state (useful for testing or reset)
  const clearPersistedState = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear persisted state:", error);
    }
  };

  // Handler for deleting a question in the test pack
  const handleDeleteQuestion = async (question: any) => {
    try {
      const baseUrl = API_URL;
      let endpoint = "";
      // Use acronym for type
      const type = question.question_type_acronym || question.question_type;
      if (type === "HOT_TEXT") {
        endpoint = `${baseUrl}/api/test-pack/hot-text/delete/${question.question_id}`;
      } else if (type === "MC") {
        endpoint = `${baseUrl}/api/test-pack/mc/delete/${question.question_id}`;
      } else if (type === "MA") {
        endpoint = `${baseUrl}/api/test-pack/ma/delete/${question.question_id}`;
      } else if (type === "BLANK") {
        endpoint = `${baseUrl}/api/test-pack/blank/delete/${question.question_id}`;
      } else if (type === "TABLE_GRID") {
        endpoint = `${baseUrl}/api/test-pack/table-grid/delete/${question.question_id}`;
      } else if (type === "RAY_SELECTOR") {
        endpoint = `${baseUrl}/api/test-pack/ray-selector/delete/${question.question_id}`;
      } else if (type === "DND") {
        endpoint = `${baseUrl}/api/test-pack/dnd/delete/${question.question_id}`;
      } else if (type === "GRAPH_SELECTOR") {
        endpoint = `${baseUrl}/api/test-pack/graph-selector/delete/${question.question_id}`;
      } else if (type === "EQUATION_CALCULATOR") {
        endpoint = `${baseUrl}/api/test-pack/equation-calculator/delete/${question.question_id}`;
      } else if (question.passage_id && Number(question.passage_id) > 0) {
        // Delete passage for ANY question type that has a passage (RC, REA, REB, MC, MA, etc.)
        endpoint = `${baseUrl}/api/test-pack/passages/delete/${question.passage_id}`;
      } else {
        toast({ title: "Error", description: `Unknown question type: ${type}`, variant: "destructive" });
        return;
      }
      const resp = await fetch(endpoint, { method: "DELETE" });
      if (!resp.ok) {
        const errorData = await resp.json();
        toast({ title: "Error", description: errorData.detail || "Failed to delete question", variant: "destructive" });
        return;
      }
      toast({ title: "Success", description: "Question deleted successfully" });
      refreshQuestions();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete question", variant: "destructive" });
    }
  };

  // Handler for opening bulk reordering modal
  const handleReorderQuestions = () => {
    if (!selectedTest) {
      toast({ title: "Error", description: "Please select a test first", variant: "destructive" });
      return;
    }

    // Get the first 10 questions for reordering
    const questionsToReorder = questions.slice(0, 10);
    setReorderModal({ open: true, questions: questionsToReorder });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-8xl mx-auto">

        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <Link to="/teachers">
            <button className="flex items-center gap-2 px-4 py-2 mb-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm sm:text-base">
              <ChevronLeft className="w-4 h-4" />
              Back to Teacher Dashboard
            </button>
          </Link>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1">Test Packs</h1>
              <p className="text-gray-600 text-sm sm:text-base">Manage and organize your test content</p>
            </div>
            {(() => {
              const savedState = getStateFromStorage();
              if (savedState && savedState.timestamp) {
                const timeDiff = Date.now() - savedState.timestamp;
                const minutesAgo = Math.floor(timeDiff / 60000);
                if (minutesAgo < 60) {
                  return (
                    <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 self-start sm:self-center">
                      Filters saved{" "}
                      {minutesAgo === 0 ? "just now" : `${minutesAgo}m ago`}
                    </div>
                  );
                }
              }
              return null;
            })()}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col items-center justify-center text-center">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mb-2 sm:mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{tests.length}</div>
              <div className="text-gray-600 text-sm sm:text-base">Total Tests</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col items-center justify-center text-center">
              <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mb-2 sm:mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{totalQuestions}</div>
              <div className="text-gray-600 text-sm sm:text-base">Total Questions</div>
            </div>
          </div>
        </div>

        {/* Mobile filter overlay toggle */}
        <div className="flex justify-between items-center mb-4 sm:hidden">
          <TrackedButton
            trackingName="test_pack_filters_button_mobile"
            trackingContext={{
              page: 'test_pack',
              action: 'toggle_filters',
              current_state: showFilters ? 'visible' : 'hidden'
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-4 py-3 rounded-lg text-sm font-medium w-full justify-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </TrackedButton>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

          {/* Desktop filters */}
          <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${showFilters ? 'w-[280px]' : 'w-0 overflow-hidden'}`}>
            {showFilters && (
              <div className="sticky top-4 w-[280px]">
                <TestPackFilter
                  questionType={questionType}
                  questionNumber={questionNumber}
                  hasPassage={hasPassage}
                  availableTests={tests}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  isLoading={loading}
                  initialSelectedTestId={selectedTest?.id || null}
                />
              </div>
            )}
          </div>

          {/* Mobile filters overlay */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end">
              <div className="w-4/5 max-w-sm bg-white h-full p-4 overflow-auto shadow-xl">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    X
                  </button>
                </div>
                <TestPackFilter
                  questionType={questionType}
                  questionNumber={questionNumber}
                  hasPassage={hasPassage}
                  availableTests={tests}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  isLoading={loading}
                  initialSelectedTestId={selectedTest?.id || null}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* Search + Filter + Buttons */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6 w-full lg:items-center">
              {/* Search Bar */}
              <div className="relative w-full lg:w-64 flex-shrink-0 h-11 sm:h-12">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <Input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full h-11 sm:h-12 text-sm sm:text-base"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full">
                  <TrackedButton
                    trackingName="test_pack_add_question_button"
                    trackingContext={{
                      page: 'test_pack',
                      action: 'add_question',
                      test_id: selectedTest?.id
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-1 sm:flex-none justify-center text-sm h-11 sm:h-12"
                    onClick={handleAddQuestion}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Question</span>
                    <span className="sm:hidden">Add</span>
                  </TrackedButton>

                  <TrackedButton
                    trackingName="test_pack_filters_button"
                    trackingContext={{
                      page: 'test_pack',
                      action: 'toggle_filters',
                      current_state: showFilters ? 'visible' : 'hidden'
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-1 sm:flex-none justify-center text-sm h-11 sm:h-12 hidden sm:flex"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </TrackedButton>

                  <TrackedButton
                    trackingName="test_pack_create_test_button"
                    trackingContext={{
                      page: 'test_pack',
                      action: 'create_test'
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-1 sm:flex-none justify-center text-sm h-11 sm:h-12"
                    onClick={handleCreateTest}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Create Test</span>
                    <span className="sm:hidden">New Test</span>
                  </TrackedButton>

                  <TrackedButton
                    trackingName="test_pack_reorder_questions_button"
                    trackingContext={{
                      page: 'test_pack',
                      action: 'reorder_questions',
                      test_id: selectedTest?.id
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white gap-2 flex-1 sm:flex-none justify-center text-sm h-11 sm:h-12"
                    onClick={handleReorderQuestions}
                    disabled={!selectedTest || questions.length === 0}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Reorder</span>
                    <span className="sm:hidden">Reorder</span>
                  </TrackedButton>

                  {/* Debug/Reset button - can be removed in production */}
                  <TrackedButton
                    trackingName="test_pack_reset_view_button"
                    trackingContext={{
                      page: 'test_pack',
                      action: 'reset_view',
                      purpose: 'clear_filters_and_refresh'
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs flex-1 sm:flex-none h-11 sm:h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      clearPersistedState();
                      window.location.reload();
                    }}
                    title="Clear saved filters and refresh"
                  >
                    {/* <RefreshCw className="h-4 w-4" /> */}
                    <span className="hidden sm:inline">Reset View</span>
                    <span className="sm:hidden">Reset</span>
                  </TrackedButton>
                </div>
              </div>
            </div>

            {/* Pagination Controls and Counts */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3 w-full">
              {/* Left: Showing X-Y of Z */}
              <div className="text-sm text-gray-600 order-2 sm:order-1 text-center sm:text-left">
                Showing {questions.length > 0 ? (currentPage - 1) * questionsPerPage + 1 : 0}-
                {Math.min(currentPage * questionsPerPage, questions.length)} of {questions.length} questions
              </div>

              {/* Center: Pagination */}
              <div className="flex justify-center items-center gap-2 order-1 sm:order-2">
                <TrackedButton
                  trackingName="test_pack_pagination_prev_button"
                  trackingContext={{
                    page: 'test_pack',
                    action: 'pagination',
                    direction: 'previous',
                    current_page: currentPage,
                    total_pages: totalPages
                  }}
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  className="p-2 sm:p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      setPageInput((currentPage - 1).toString());
                    }
                  }}
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </TrackedButton>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={pageInput}
                    min={1}
                    max={totalPages}
                    onChange={handlePageInputChange}
                    onBlur={handlePageInputBlur}
                    onKeyDown={handlePageInputKeyDown}
                    className="w-12 text-center font-semibold border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-1 text-sm"
                    aria-label="Current page"
                  />
                  <span className="text-sm text-gray-500">/ {totalPages}</span>
                </div>

                <TrackedButton
                  trackingName="test_pack_pagination_next_button"
                  trackingContext={{
                    page: 'test_pack',
                    action: 'pagination',
                    direction: 'next',
                    current_page: currentPage,
                    total_pages: totalPages
                  }}
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  className="p-2 sm:p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                      setPageInput((currentPage + 1).toString());
                    }
                  }}
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </TrackedButton>
              </div>

              {/* Right: Active/Inactive counts */}
              <div className="flex gap-4 text-sm items-center justify-center sm:justify-end order-3">
                <span className="inline-flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">Active: {questions.filter(q => q.is_active).length}</span>
                </span>
                <span className="inline-flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-700 font-medium">Inactive: {questions.filter(q => !q.is_active).length}</span>
                </span>
              </div>
            </div>

            {/* Questions Grid */}
            {selectedTest ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <TestPackQuestionsGrid
                  questions={questions}
                  searchQuery={searchQuery}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  questionsPerPage={questionsPerPage}
                  hasPassageFilter={hasPassage as 'yes' | 'no' | 'any' | undefined}
                  onPageChange={setCurrentPage}
                  onRefresh={refreshQuestions}
                  onEditChoices={async (question) => { setEditChoicesModal({ open: true, question }); }}
                  onEditQuestion={async (question) => { setEditQuestionModal({ open: true, question }); }}
                  onEditQuestionText={async (question) => { setEditTextModal({ open: true, question }); }}
                  onEditPassage={async (question) => { setEditPassageModal({ open: true, question }); }}

                  onDeleteQuestion={handleDeleteQuestion}
                  onEditQuestionNumber={(question) => {
                    setQuestionNumberEditor({ open: true, question });
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="max-w-md mx-auto">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Test Selected</h3>
                  <p className="text-gray-500 mb-6">
                    Select a test from the filters to view and manage its questions.
                  </p>
                  <TrackedButton
                    trackingName="test_pack_select_test_prompt"
                    trackingContext={{
                      page: 'test_pack',
                      action: 'select_test_prompt'
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setShowFilters(true)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Open Filters to Select Test
                  </TrackedButton>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* All your existing modals remain exactly the same */}
        {/* Add Question Modal */}
        {showAddQuestionModal && (
          <QuestionModal
            isOpen={showAddQuestionModal}
            onClose={() => setShowAddQuestionModal(false)}
            onSave={handleSaveQuestion}
            initialValues={{ test_id: selectedTest?.id || 0 }}
            istestpack={true}
          />
        )}

        {/* Create Test Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Create New Test</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-4">
                <Label className="text-base font-medium">Select a test to clone:</Label>
                <RadioGroup
                  value={selectedTestId}
                  onValueChange={setSelectedTestId}
                  className="space-y-3 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg"
                >
                  {tests.map((test) => (
                    <div key={test.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <RadioGroupItem
                        value={test.id.toString()}
                        id={`test-${test.id}`}
                        className="h-5 w-5"
                      />
                      <Label htmlFor={`test-${test.id}`} className="text-sm font-normal cursor-pointer flex-1">
                        {test.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <TrackedButton
                trackingName="test_pack_create_dialog_cancel_button"
                trackingContext={{
                  page: 'test_pack',
                  action: 'dialog_cancel',
                  dialog_type: 'create_test'
                }}
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </TrackedButton>
              <TrackedButton
                trackingName="test_pack_create_dialog_confirm_button"
                trackingContext={{
                  page: 'test_pack',
                  action: 'dialog_confirm',
                  dialog_type: 'create_test',
                  selected_test_id: selectedTestId
                }}
                onClick={handleConfirmCreate}
                className="flex-1 sm:flex-none"
              >
                Create Test
              </TrackedButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Keep all other modals exactly as they were */}
        {/* Edit Question Modal */}
        {editQuestionModal.open && editQuestionModal.question && (
          <QuestionModal
            isOpen={editQuestionModal.open}
            onClose={() => setEditQuestionModal({ open: false, question: null })}
            istestpack={true}
            initialValues={editQuestionModal.question}
            onSave={async (data) => {
              /* console.log("🔄 [TestPack] Edit Question onSave called", { selectedTest: selectedTest?.id, data }); */
              setEditQuestionModal({ open: false, question: null });
              // Optimistic update: immediately reflect saved choices/text from save response
              if (data && data.question_id) {
                const updatedChoices = data.choice_details || data.choices;
                setQuestions((prev: any[]) => prev.map((q: any) => {
                  if (q.question_id === data.question_id) {
                    return {
                      ...q,
                      question: data.question || q.question,
                      ...(updatedChoices ? { choices: updatedChoices } : {}),
                      updated_at: data.updated_at || new Date().toISOString(),
                    };
                  }
                  return q;
                }));
              }
              // Full server refresh
              if (selectedTest) {
                const testId = selectedTest.id;
                fetchTestQuestions(testId, questionType, questionNumber, currentPage, hasPassage, isActive);
                setTimeout(() => {
                  fetchTestQuestions(testId, questionType, questionNumber, currentPage, hasPassage, isActive);
                }, 1500);
              } else {
                console.warn("⚠️ [TestPack] selectedTest is null, cannot refresh!");
              }
            }}
          />
        )}

        {/* Edit Text Modal */}
        {editTextModal.open && editTextModal.question && (
          <EditQuestionModal
            isOpen={editTextModal.open}
            onClose={() => setEditTextModal({ open: false, question: null })}
            isTestPack={true}
            onSave={async (data) => {
              /* console.log("🔄 [TestPack] Edit Text onSave called", { selectedTest: selectedTest?.id }); */
              setEditTextModal({ open: false, question: null });
              if (selectedTest) {
                /* console.log("🔄 [TestPack] Calling fetchTestQuestions after edit text save"); */
                fetchTestQuestions(selectedTest.id, questionType, questionNumber, currentPage, hasPassage, isActive);
              }
            }}
            question={editTextModal.question}
          />
        )}

        {/* Edit Choices Modal */}
        {editChoicesModal.open && editChoicesModal.question && (
          <TestPackEditChoicesModal
            isOpen={editChoicesModal.open}
            onClose={() => setEditChoicesModal({ open: false, question: null })}
            question={editChoicesModal.question}
            onSave={(updatedQuestion) => {
              /* console.log("🔄 [TestPack] Edit Choices onSave called", { selectedTest: selectedTest?.id, updatedQuestion }); */
              setEditChoicesModal({ open: false, question: null });
              if (selectedTest) {
                /* console.log("🔄 [TestPack] Calling fetchTestQuestions after edit choices save"); */
                fetchTestQuestions(selectedTest.id, questionType, questionNumber, currentPage, hasPassage, isActive);
              }
            }}
          />
        )}

        {/* Edit Passage Modal */}
        {editPassageModal.open && editPassageModal.question && (
          <QuestionModal
            isOpen={editPassageModal.open}
            onClose={() => setEditPassageModal({ open: false, question: null })}
            istestpack={true}
            initialValues={editPassageModal.question}
            isPassageEdit={true}
            onSave={async (data) => {
              setEditPassageModal({ open: false, question: null });
              if (selectedTest) {
                fetchTestQuestions(selectedTest.id, questionType, questionNumber, currentPage, hasPassage, isActive);
              }
            }}
          />
        )}

        {/* Question Number Editor Modal */}
        {questionNumberEditor.open && questionNumberEditor.question && selectedTest && (
          <QuestionNumberEditor
            isOpen={questionNumberEditor.open}
            onClose={() => setQuestionNumberEditor({ open: false, question: null })}
            question={questionNumberEditor.question}
            testId={selectedTest.id}
            onSuccess={refreshQuestions}
          />
        )}

        {/* Question Reordering Modal */}
        {reorderModal.open && selectedTest && (
          <QuestionReorderingModal
            isOpen={reorderModal.open}
            onClose={() => setReorderModal({ open: false, questions: [] })}
            testId={selectedTest.id}
            questions={reorderModal.questions}
            onSuccess={refreshQuestions}
          />
        )}
      </div>
    </div>
  );
}

export default TestPack;
