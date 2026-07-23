// Utility functions to handle question type differences between contexts

// Question type mapping for test pack (INTEGER to STRING)
export const QUESTION_TYPE_MAP: Record<number, string> = {
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

// Reverse mapping for converting STRING to INTEGER
export const QUESTION_TYPE_REVERSE_MAP: Record<string, number> = Object.fromEntries(
  Object.entries(QUESTION_TYPE_MAP).map(([id, acronym]) => [acronym, parseInt(id)])
);

/**
 * Get question type acronym from a question object
 * Handles both test pack (INTEGER) and question bank (TEXT) question types
 */
export function getQuestionTypeAcronym(question: any): string {
  // If question_type_acronym exists, use it directly
  if (question.question_type_acronym) {
    return question.question_type_acronym;
  }
  
  // If question_type is a string, return it
  if (typeof question.question_type === "string") {
    return question.question_type;
  }
  
  // If question_type is a number (test pack), convert to string
  if (typeof question.question_type === "number") {
    return QUESTION_TYPE_MAP[question.question_type] || "";
  }
  
  return "";
}

/**
 * Get question type ID from acronym
 * Used for test pack operations that need INTEGER question types
 */
export function getQuestionTypeId(acronym: string): number | null {
  return QUESTION_TYPE_REVERSE_MAP[acronym] || null;
}

/**
 * Determine if a question is from test pack context
 */
export function isTestPackQuestion(question: any): boolean {
  return !!(question.test_id || question.question_id);
}

/**
 * Determine if a question is from question bank context
 */
export function isQuestionBankQuestion(question: any): boolean {
  return !!(question.id && !question.test_id);
}

/**
 * Get the correct DnD endpoint based on context and category
 */
export function getDndEndpoint(question: any, baseUrl: string): string {
  if (isTestPackQuestion(question)) {
    // Test pack context - use category-specific endpoints
    const category = question.question_category;
    const questionId = question.question_id;
    
    switch (category) {
      case "two_buckets_single":
        return `${baseUrl}/api/test-pack/dnd/two-buckets-single/${questionId}`;
      case "two_buckets_multi":
        return `${baseUrl}/api/test-pack/dnd/two-buckets-multi/${questionId}`;
      case "one_bucket_multi":
        return `${baseUrl}/api/test-pack/dnd/one-bucket-multi/${questionId}`;
      case "one_bucket_single":
        return `${baseUrl}/api/test-pack/dnd/one-bucket-single/${questionId}`;
      case "table_dnd":
        return `${baseUrl}/api/test-pack/dnd/table_dnd/get/${questionId}`;
      case "mc_drag_drop":
        return `${baseUrl}/api/test-pack/dnd/mc-style/${questionId}`;
      case "blank_box":
        return `${baseUrl}/api/test-pack/dnd/fill-blanks/${questionId}`;
      default:
        // Fallback to generic endpoint
        return `${baseUrl}/api/test-pack/dnd/get/${questionId}`;
    }
  } else {
    // Question bank context - use pre-shsat endpoint
    return `${baseUrl}/api/pre-shsat/dnd-questions/${question.id}`;
  }
}

/**
 * Transform DnD data for QuestionModal
 * Handles both test pack and question bank responses
 */
export function transformDndDataForModal(dndData: any, originalQuestion: any): any {
  return {
    ...(dndData.question || originalQuestion),
    question_type: "DND", // Always use string for QuestionModal
    buckets: dndData.buckets || [],
    choices: dndData.choices || [],
    assignments: dndData.assignments || [],
  };
} 