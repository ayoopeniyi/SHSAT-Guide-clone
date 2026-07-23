export interface Choice {
  letter: string;
  value: string | { text: string; is_correct: boolean; explanation?: string };
  label?: string;
  choice_image_url?: string;
}

export interface HotTextRegion {
  phrase: string;
  start_idx: number;
  end_idx: number;
  is_correct: boolean;
}

export interface DnDBucket {
  label: string;
  bucket_order: number;
}

export interface DnDAssignment {
  choice_id: number;
  bucket_id: number;
}

export interface Question {
  id: number;
  content?: string | null;
  question: string;
  answer?: string | null;
  explanation?: string | null;
  question_type: string;
  question_category?: string;
  question_subtype?: string;
  topic_id?: number;
  subtopic_id?: number;
  created_at?: string;
  updated_at?: string;
  chapter_number?: number;
  chapter_title?: string;
  topic_title?: string;
  subtopic_title?: string;
  subject?: string;
  difficulty?: string;
  category?: string;
  choices?: Choice[];
  page_number?: number;
  question_number?: number;
  passage_id?: number;
  prompt?: string;
  passage?: string;
  min_selections?: number;
  max_selections?: number;
  regions?: HotTextRegion[];
  created_by?: string;
  last_edited_by?: string;
  buckets?: DnDBucket[];
  assignments?: DnDAssignment[];
  question_image_url?: string;
}

export * from "./testPack";
