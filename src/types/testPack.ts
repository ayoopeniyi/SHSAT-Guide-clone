export interface TestPack {
  id: number;
  name: string;
  description?: string;
  test_description?: string;
  default_test_text?: string;
  created_at: string;
  updated_at: string;
  question_id?: number;
  question_type_name?: string;
  question_type_acronym?: string;
  question_count?: number;
  test_id?: number;
  is_active: boolean;
  is_live: boolean;
}

export interface Choice {
  choice_label: string;
  choice_text: string;
  is_correct: boolean;
  explanation?: string;
  choice_image_url?: string;
}

export interface TestPackQuestion {
  answer?: string;
  content?: string;
  id: number;
  question_number: number;
  question_type: string;
  question: string;
  custom_passage?: string;
  choices?: {
    choice_label: string;
    choice_text: string;
    is_correct: boolean;
  }[];
  question_type_acronym?: string;
  question_type_name?: string;
  is_active?: boolean;
  question_id?: number;
}

export interface TestPackAnswerChoice {
  id: string;
  question_id: number;
  display_order: number;
  answer_text: string;
  answer_explanation: string | null;
  is_correct: boolean;
  choice_label: string;
  choice_image_url: string | null;
  choice_category_tags: any[] | null;
  choice_category_tag_rationale: string | null;
  skill_gap: string | null;
  teaching_action: string | null;
  created_by: string | null;
  last_edited_by: string | null;
  updated_at: string | null;
}
