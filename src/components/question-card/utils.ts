// utility helpers for QuestionCard

export type BadgeVariant = "secondary" | "destructive" | "outline" | "default";

export const subjectColors: Record<string, string> = {
  Math: "border-blue-500",
  ELA: "border-green-500",
};

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

export function getQuestionTypeAcronym(question: any) {
  if (typeof question.question_type === "string") return question.question_type;
  return QUESTION_TYPE_MAP[question.question_type] || "MC";
}

export const relabelChoices = (choices: any[]): any[] => {
  return choices.map((choice, idx) => ({
    ...choice,
    choice_label: String.fromCharCode(65 + idx),
    letter: String.fromCharCode(65 + idx),
  }));
};

export const getChoiceText = (choice: any) => {
  const text =
    (choice as any).choice_text ||
    (choice as any).answer_text ||
    ((choice as any).value && (choice as any).value.text) ||
    (choice as any).value ||
    "";
  return text;
};

export const getQuestionTypeDisplayName = (questionType: string): string => {
  const typeMap: Record<string, string> = {
    MC: "Multiple Choice",
    MA: "Multiple Answer",
    BLANK: "Fill in the Blank",
    DND: "Drag and Drop",
    HOT_TEXT: "Hot Text",
    RAY_SELECTOR: "Ray Selector",
    GRAPH_SELECTOR: "Graph Selector",
    RC: "Reading Comprehension",
    EQUATION_CALCULATOR: "Equation Calculator",
  };
  return typeMap[questionType] || questionType;
};

export const getDeleteConfirmationMessage = (questionType: string): string => {
  const messages: Record<string, string> = {
    MC: "Are you sure you want to delete this multiple choice question? This will permanently remove the question and all its choices. This action cannot be undone.",
    MA: "Are you sure you want to delete this multiple answer question? This will permanently remove the question and all its choices. This action cannot be undone.",
    TF: "Are you sure you want to delete this true/false question? This action cannot be undone.",
    BLANK:
      "Are you sure you want to delete this fill-in-the-blank question? This action cannot be undone.",
    DND: "Are you sure you want to delete this drag and drop question? This will permanently remove the question, buckets, choices, and assignments. This action cannot be undone.",
    HOT_TEXT:
      "Are you sure you want to delete this hot text question? This will permanently remove the question and all highlighted regions. This action cannot be undone.",
    RAY_SELECTOR:
      "Are you sure you want to delete this ray selector question? This action cannot be undone.",
    GRAPH_SELECTOR:
      "Are you sure you want to delete this graph selector question? This will permanently remove the question and all graph points. This action cannot be undone.",
    RC: "Are you sure you want to delete this reading comprehension question? This will permanently remove the question, passage, and all associated choices. This action cannot be undone.",
    EQUATION_CALCULATOR: "Are you sure you want to delete this equation calculator question? This action cannot be undone.",
  };
  return (
    messages[questionType] ||
    "Are you sure you want to delete this question? This action cannot be undone."
  );
};


