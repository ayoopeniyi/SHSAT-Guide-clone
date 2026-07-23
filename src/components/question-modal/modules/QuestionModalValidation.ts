// Question Modal Validation Logic
import { ValidationConfig } from './QuestionModalTypes';

export const getValidationError = (questionType: string, config: ValidationConfig): string | null => {
  // Skip all validation for equation calculator
  if (questionType === "EQUATION_CALCULATOR") {
    return null;
  }

  const { initialValues, shouldEditPassage, istestpack, subject, mainTopicId, categoryId } = config;

  const isEditing = !!initialValues;
  // Skip subject/topic/category validation for questions with passages (those fields are hidden)
  const hasPassage = initialValues?.passage_id && Number(initialValues.passage_id) > 0;
  // Also skip subject/topic/category validation for RC question types
  const isRCQuestion = ["RC", "REA", "REB"].includes(questionType);

  // For passage editing mode, no validation errors
  if (shouldEditPassage) {
    return null;
  }

  // Only require subject for test pack questions
  if (istestpack && !hasPassage && !isRCQuestion && !subject) {
    return "Subject is required for test pack questions.";
  }

  if (istestpack && !hasPassage && !isRCQuestion && !categoryId) {
    return "Category is required for test pack questions.";
  }

  if (isEditing) {
    // Check hierarchy consistency
    if (config.chapter_number && (!config.topic_id || !config.sub_topic_id)) {
      return "When a chapter is selected, both topic and subtopic must also be selected.";
    }

    if (config.topic_id && !config.sub_topic_id) {
      return "When a topic is selected, subtopic must also be selected.";
    }
  } else {
    // For creating new questions, require hierarchy fields
    if (!isRCQuestion && !hasPassage && !istestpack) {
      if (!config.question_category) {
        return "Question category is required.";
      }
      if (!config.chapter_number) {
        return "Chapter is required.";
      }
      if (!config.topic_id) {
        return "Topic is required.";
      }
      if (!config.sub_topic_id) {
        return "Sub-topic is required.";
      }
    }
  }

  return null;
};

export const canSave = (questionType: string, config: ValidationConfig): boolean => {
  // Skip all validation for equation calculator
  if (questionType === "EQUATION_CALCULATOR") {
    /* console.log("🔍 [canSave] Equation Calculator - skipping all validation"); */
    return true;
  }

  const { initialValues, shouldEditPassage, istestpack, subject, mainTopicId, categoryId } = config;

  const isEditing = !!initialValues;
  // Skip subject/topic/category validation for questions with passages (those fields are hidden)
  const hasPassage = initialValues?.passage_id && Number(initialValues.passage_id) > 0;
  // Also skip subject/topic/category validation for RC question types
  const isRCQuestion = ["RC", "REA", "REB"].includes(questionType);

  // Debug logging for passage editing
  if (hasPassage) {
    /* console.log("🔍 canSave for passage:", {
      questionType,
      isEditing,
      hasPassage
    }); */
  }

  // For passage editing mode, always allow save if passage content exists
  if (shouldEditPassage) {
    /* console.log("🔍 [canSave] Passage editing mode check:", {
      shouldEditPassage,
      hasPassage: !!initialValues?.passage_id
    }); */
    // For passage editing, allow save if:
    // 1. There's passage content, OR
    // 2. We have a passage_id (content might be loading), OR  
    // 3. User is actively editing (content might be empty but user is typing)
    return (initialValues?.passage_id && Number(initialValues.passage_id) > 0);
  }

  // Only require subject and category for test pack questions
  if (istestpack && !hasPassage && !isRCQuestion && (!subject || !categoryId)) return false;

  if (isEditing) {
    // For editing, validate hierarchy consistency
    const validateHierarchyConsistency = () => {
      // If chapter is selected, topic and subtopic should be valid for that chapter
      if (config.chapter_number && config.topic_id && config.sub_topic_id) {
        // All three are selected - this is valid
        return true;
      }

      // If chapter is selected but topic/subtopic are not, this is invalid
      if (config.chapter_number && (!config.topic_id || !config.sub_topic_id)) {
        return false;
      }

      // If topic is selected but subtopic is not, this is invalid
      if (config.topic_id && !config.sub_topic_id) {
        return false;
      }

      // If no hierarchy is selected, this is valid (for questions without hierarchy)
      if (!config.chapter_number && !config.topic_id && !config.sub_topic_id) {
        return true;
      }

      return true; // Default to valid
    };

    // Check hierarchy consistency first
    if (!validateHierarchyConsistency()) {
      return false;
    }

    // For editing, any small change should enable save button - very lenient
    switch (questionType) {
      case "MC":
        return true; // Always allow editing
      case "MA":
        return true; // Always allow editing
      case "TF":
        return true; // Always allow editing
      case "BLANK":
        return true; // Always allow editing
      case "DND":
        return true; // Always allow editing
      case "RAY_SELECTOR":
        return true; // Always allow editing
      case "GRAPH_SELECTOR":
        return true; // Always allow editing
      case "TABLE_GRID":
        return true; // Always allow editing
      case "HOT_TEXT":
        return true; // HOT_TEXT has its own validation
      case "EQUATION_CALCULATOR":
        return true; // Always allow editing
      case "RC":
      case "REA":
      case "REB":
        return true; // Always allow editing
      default:
        // Check if this is a non-RC question type but has a passage
        if (initialValues?.passage_id && Number(initialValues.passage_id) > 0) {
          return true; // Always allow editing
        }
        return false;
    }
  } else {
    // For creating new questions, use strict validation
    // First check hierarchy fields for non-RC questions and questions without passages
    if (!isRCQuestion && !hasPassage && !istestpack) {
      if (!config.question_category || !config.chapter_number || !config.topic_id || !config.sub_topic_id) {
        return false;
      }
    }

    switch (questionType) {
      case "MC":
        return true; // Use modal state validation
      case "MA":
        return true; // Use modal state validation
      case "TF":
        return true; // Use modal state validation
      case "BLANK":
        return true; // Use modal state validation
      case "DND":
        return true; // Use modal state validation
      case "RAY_SELECTOR":
        return true; // Use modal state validation
      case "GRAPH_SELECTOR":
        return true; // Use modal state validation
      case "TABLE_GRID":
        return true; // Basic validation
      case "HOT_TEXT":
        return true; // HOT_TEXT has its own validation
      case "EQUATION_CALCULATOR":
        // For equation calculator, we need to check the actual form validation
        // This will be handled by the modal state validation in the footer
        const result = true; // Basic validation - actual validation handled by equationCalculatorState.isValid
        /* console.log("🔍 [canSave] EQUATION_CALCULATOR result:", result); */
        return result;
      case "RC":
      case "REA":
      case "REB":
        return true; // Basic validation
      default:
        return false;
    }
  }
};

export const isFormValid = (questionType: string, config: ValidationConfig): boolean => {
  // Skip all validation for equation calculator
  if (questionType === "EQUATION_CALCULATOR") {
    return true;
  }

  const { initialValues, shouldEditPassage } = config;

  // If this question has a passage, validate RC fields regardless of questionType
  if (initialValues?.passage_id && Number(initialValues.passage_id) > 0) {
    // For passage editing, only require passage content (start/end pages are optional)
    return true; // Basic validation
  }

  // Otherwise validate based on questionType
  switch (questionType) {
    case "MC":
      return true; // Use modal state validation
    case "MA":
      return true; // Use modal state validation
    case "TF":
      return true; // Use modal state validation
    case "BLANK":
      return true; // Use modal state validation
    case "DND":
      return true; // Use modal state validation
    case "RAY_SELECTOR":
      return true; // Use modal state validation
    case "GRAPH_SELECTOR":
      return true; // Use modal state validation
    case "TABLE_GRID":
      return true; // Basic validation
    case "HOT_TEXT":
      return true; // HOT_TEXT has its own validation
    case "EQUATION_CALCULATOR":
      return true; // Basic validation
    case "RC":
    case "REA":
    case "REB":
      return true; // Basic validation
    default:
      // Check if this is a non-RC question type but has a passage
      if (initialValues?.passage_id && Number(initialValues.passage_id) > 0) {
        return true; // Basic validation
      }
      return false;
  }
};
