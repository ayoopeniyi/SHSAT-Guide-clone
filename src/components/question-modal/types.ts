export interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questionData: any) => void;
  initialValues?: any;
  istestpack?: boolean;
  isPassageEdit?: boolean;
}

export interface MCChoice {
  letter: string;
  value: {
    text: string;
    is_correct: boolean;
    explanation?: string;
    choice_image_url?: string;
  };
}

export interface RCChoice {
  letter: string;
  value: {
    text: string;
    is_correct: boolean;
    explanation?: string;
  };
}

export type RCChoices = Array<RCChoice>;

// MC Variant types
export type MCVariant = "standard" | "drag_drop";

export const MC_VARIANTS = [
  { value: "standard", label: "Standard (Radio buttons)" },
  { value: "drag_drop", label: "Drag & Drop (with placeholders)" },
] as const;

// DND Types
export interface DnDBucket {
  id?: number;
  label: string;
  bucket_order: number;
}

export interface DnDChoice {
  id?: number;
  label: string;
  choice_order: number;
}

export interface DnDAssignment {
  choice_id: number;
  bucket_id: number;
}

// DND Subtype definitions
export const DND_SUBTYPES = [
  {
    value: "two_buckets_single",
    label: "Two Buckets Single (One choice per bucket)",
  },
  {
    value: "two_buckets_multi",
    label: "Two Buckets Multi (Multiple choices per bucket)",
  },
  {
    value: "one_bucket_multi",
    label: "One Bucket Multi (Single bucket, multiple choices)",
  },
  {
    value: "one_bucket_single",
    label: "One Bucket Single (Single bucket, single choice)",
  },
  {
    value: "table_dnd",
    label: "Table DND (Categorization Table)",
  },
] as const;

export type DnDSubtype = (typeof DND_SUBTYPES)[number]["value"] | "drag_drop" | "fill_box" | "multi_assignment";

// Question Types
export const QUESTION_TYPES = [
  { value: "MC", label: "Multiple Choice" },
  { value: "MA", label: "Multi-Answer" },
  // { value: 'TF', label: 'True/False' },
  { value: "HOT_TEXT", label: "Hot Text" },
  { value: "BLANK", label: "Blank" },
  { value: "DND", label: "Drag and Drop" },
  { value: "TABLE_GRID", label: "Table Grid (Matrix)" },
  { value: "RAY_SELECTOR", label: "Ray Selector" },
  { value: "GRAPH_SELECTOR", label: "Graph Selector" },
  { value: "RC", label: "Reading Comprehension" },
  { value: "EQUATION_CALCULATOR", label: "Equation Calculator" },
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number]["value"];
