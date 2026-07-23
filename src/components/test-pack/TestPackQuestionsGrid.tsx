import { QuestionCard } from "../QuestionCard";
import { RCQuestionCard } from "../RCQuestionCard";
import { Pagination } from "../shared/Pagination";

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
  passage?: string;
  page_number?: number;
  chapter_number?: number;
  chapter_title?: string;
  topic_title?: string;
  subtopic_title?: string;
  is_active: boolean;
}

interface TestPackQuestionsGridProps {
  questions: Question[];
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  questionsPerPage: number;
  onPageChange: (page: number) => void;
  onEditChoices: (question: any) => void;
  onEditQuestion: (question: any) => void;
  onEditPassage?: (question: any) => void;
  onEditQuestionText?: (question: any) => void;
  onDeleteQuestion: (question: any) => void;
  hasPassageFilter?: 'yes' | 'no' | 'any' | undefined;
  onRefresh: () => void; // Add this prop for refreshing data
  onEditQuestionNumber?: (question: any) => void;
}

const QUESTION_TYPE_MAP: Record<number, string> = {
  36: "REA",
  37: "REB",
  38: "RC",
  39: "GI",
  40: "MC",
  41: "TF",
  42: "BLANK",
  43: "RESP",
  44: "MA",
  45: "HOT_TEXT",
  46: "DND",
  47: "TABLE_GRID",
  48: "RS",
  49: "RAY_SELECTOR",
  50: "GRAPH_SELECTOR",
  51: "EQUATION_CALCULATOR",
};

// Helper functions for question transformation
const mapQuestionType = (question: Question): string => {
  // Use the question_type_acronym from the API if available
  if (question.question_type_acronym) {
    return question.question_type_acronym;
  }

  // Fallback to old mapping if acronym is not available
  if (typeof question.question_type === "number") {
    const typeMap: Record<number, string> = {
      36: "REA", // Multiple Choice
      40: "MC", // Multiple Choice Math
      42: "BLANK", // Fill in the Blank
      45: "HOT_TEXT", // Hot Text
      46: "DND", // Drag and Drop
      47: "TABLE_GRID", // Table Grid
      48: "RS", // Ray Selector
      49: "RAY_SELECTOR", // Ray Selector
      50: "GRAPH_SELECTOR", // Graph Selector
      51: "EQUATION_CALCULATOR", // Equation Calculator
      // Add more mappings as needed
    };
    return typeMap[question.question_type] || "MC";
  }

  return question.question_type?.toString() || "MC";
};

const getSubjectFromQuestionType = (question: Question): string => {
  // Determine subject based on question_type_name or question_category_id
  if (question.question_type_name) {
    const typeName = question.question_type_name.toLowerCase();
    if (
      typeName.includes("math") ||
      typeName.includes("grid-in") ||
      typeName.includes("multiple choice")
    ) {
      return "Math";
    }
    if (
      typeName.includes("reading") ||
      typeName.includes("revising") ||
      typeName.includes("editing")
    ) {
      return "ELA";
    }
  }

  // Determine subject based on question_type_acronym
  if (question.question_type_acronym) {
    const acronym = question.question_type_acronym.toUpperCase();
    // Math question types
    if (
      [
        "MC",
        "MA",
        "BLANK",
        "DND",
        "TABLE_GRID",
        "RAY_SELECTOR",
        "GRAPH_SELECTOR",
        "EQUATION_CALCULATOR",
      ].includes(acronym)
    ) {
      return "Math";
    }
    // ELA question types
    if (["RC", "HOT_TEXT"].includes(acronym)) {
      return "ELA";
    }
  }

  // Determine subject based on question_type (numeric)
  if (typeof question.question_type === "number") {
    // Math question type IDs
    const mathTypes = [40, 41, 42, 46, 47, 48, 49, 50, 51]; // MC, MA, BLANK, DND, TABLE_GRID, RS, RAY_SELECTOR, GRAPH_SELECTOR, EQUATION_CALCULATOR
    if (mathTypes.includes(question.question_type)) {
      return "Math";
    }
    // ELA question type IDs
    const elaTypes = [45]; // HOT_TEXT, RC would be here if it has a numeric ID
    if (elaTypes.includes(question.question_type)) {
      return "ELA";
    }
  }

  // Fallback based on question_category_id ranges (you can adjust these ranges)
  if (question.question_category_id) {
    // These are example ranges - adjust based on your actual category structure
    if (
      question.question_category_id >= 1000 &&
      question.question_category_id < 1100
    ) {
      return "ELA"; // Assuming 1000-1099 range is ELA
    }
    if (
      question.question_category_id >= 900 &&
      question.question_category_id < 1000
    ) {
      return "Math"; // Assuming 900-999 range is Math
    }
  }

  // Final fallback - default to Math for most question types, ELA for reading-related
  const questionText = (
    question.question ||
    question.content ||
    ""
  ).toLowerCase();
  if (
    questionText.includes("read") ||
    questionText.includes("passage") ||
    questionText.includes("text")
  ) {
    return "ELA";
  }

  return "Math"; // Default to Math for most question types
};

export function TestPackQuestionsGrid({
  questions,
  searchQuery,
  currentPage,
  totalPages,
  questionsPerPage,
  onPageChange,
  onEditChoices,
  onEditQuestion,
  onEditPassage,
  onEditQuestionText,
  onDeleteQuestion,
  hasPassageFilter,
  onRefresh, // Add this prop for refreshing data
  onEditQuestionNumber,
}: TestPackQuestionsGridProps) {
  // Apply hasPassageFilter logic
  let passageFilteredQuestions: any[] = questions;

  if (hasPassageFilter === 'yes') {
    // Show unique passages only - one representative question per passage
    const seen = new Set();
    passageFilteredQuestions = questions.filter(q => {
      if (q.passage_id && Number(q.passage_id) > 0) {
        if (!seen.has(q.passage_id)) {
          seen.add(q.passage_id);
          return true;
        }
        return false;
      }
      // Exclude questions without passage
      return false;
    });
  } else if (hasPassageFilter === 'no') {
    // Show only questions without passages
    passageFilteredQuestions = questions.filter(q => !q.passage_id || Number(q.passage_id) === 0);
  } else {
    // 'any' or undefined: show all questions (both with and without passages)
    passageFilteredQuestions = questions;
  }

  // Filter and sort questions based on search query
  const filteredQuestions = passageFilteredQuestions
    .filter(
      (question) =>
        !searchQuery ||
        question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (question.custom_passage &&
          question.custom_passage
            .toLowerCase()
            .includes(searchQuery.toLowerCase())),
    )
    .sort((a, b) => {
      // Sort by question_number first, then by id as fallback
      if (a.question_number && b.question_number) {
        return a.question_number - b.question_number;
      }
      return a.id - b.id;
    });

  const inactiveCount = questions.filter((q) => q.is_active === false).length;

  // Pagination
  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = filteredQuestions.slice(startIndex, endIndex);

  if (currentQuestions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {searchQuery
            ? "No questions match your search criteria."
            : "No questions found in this test."}
        </p>
      </div>
    );
  }

  const renderQuestionCard = (question: any) => {
    // Always use acronym for question_type
    const questionType =
      typeof question.question_type === "number"
        ? QUESTION_TYPE_MAP[question.question_type] || question.question_type
        : question.question_type;

    // Transform the question to match component expectations
    const transformedQuestion = {
      ...question,
      question: question.question || question.content || "",
      content: question.question || question.content || "",
      question_type: questionType, // always string
      difficulty: question.difficulty || 3, // Keep as number, default to 3 (Medium)
      subject: getSubjectFromQuestionType(question),
      passage: question.passage || question.custom_passage || undefined,
      page_number: question.page_number,
      chapter_number: question.chapter_number,
      chapter_title: question.chapter_title,
      topic_title: question.topic_title,
      subtopic_title: question.subtopic_title,
      question_id: question.question_id,
      question_number: question.question_number,
      test_id: question.test_id,
      is_active: question.is_active,
    };

    // Use RCQuestionCard for ANY question with passage (RC, REA, REB, MC, MA, etc.)
    if (question.passage_id && Number(question.passage_id) > 0) {
      return (
        <RCQuestionCard
          question={transformedQuestion}
          onEditChoices={() => onEditChoices(transformedQuestion)}
          onEditQuestion={() => onEditQuestion(transformedQuestion)}
          onEditQuestionText={onEditQuestionText ? () => onEditQuestionText(transformedQuestion) : undefined}
          onEditPassage={onEditPassage ? () => onEditPassage(transformedQuestion) : undefined}
          onEditQuestionNumber={onEditQuestionNumber ? () => onEditQuestionNumber(transformedQuestion) : undefined}
          onDelete={() => onDeleteQuestion(transformedQuestion)}
          onSuccess={onRefresh} // Pass the onRefresh callback
          onRefresh={onRefresh}
          hasPassageFilter={hasPassageFilter}
          context="test-pack"
        />
      );
    }

    // Use regular QuestionCard for other question types
    return (
      <QuestionCard
        question={transformedQuestion as any}
        context="test-pack"
        onEditChoices={() => onEditChoices(transformedQuestion)}
        onEditQuestion={() => onEditQuestion(transformedQuestion)}
        istestpack={true}
        onDelete={() => onDeleteQuestion(transformedQuestion)}
        hasPassageFilter={hasPassageFilter}
        onRefresh={onRefresh}
        onEditQuestionNumber={onEditQuestionNumber ? () => onEditQuestionNumber(transformedQuestion) : undefined}
      />
    );
  };

  return (
    <div className="w-full">
      <div className="space-y-6">
        {/* Questions Grid - Single Column Layout */}
        <div className="w-full flex flex-col gap-4">
          {currentQuestions.map((question) => (
            <div key={question.id} className="w-full">
              {renderQuestionCard(question)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
