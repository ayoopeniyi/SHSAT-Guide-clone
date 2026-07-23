export interface Choice {
  id?: number;
  choice_label: string;
  choice_text: string;
  is_correct: boolean;
  explanation?: string | null;
  choice_image_url?: string;
  // The 'letter' and 'value' properties seem to be from an old structure.
  // The rest of the code uses the properties above.
  // I am commenting them out to match the de-facto structure.
  // letter: string;
  // value: string;
}

export type Question = {
  id: number;
  content?: string | null;
  question: string;
  answer?: string | null;
  explanation?: string | null;
  question_type: string;
  topic_id?: number;
  subtopic_id?: number;
  sub_topic_id?: number;
  created_at?: string;
  updated_at?: string;
  chapter_number?: number;
  chapter_title?: string;
  topic_title?: string;
  subtopic_title?: string;
  subject?: string;
  difficulty?: number;
  category?: string;
  options?: string[];
  choices?: Choice[];
  page_number?: number;
  question_number?: number;
  passage_id?: number;
  question_id?: number;
  test_id?: number;
  is_active?: boolean;
  // HOT_TEXT specific fields
  prompt?: string;
  passage?: string;
  min_selections?: number;
  max_selections?: number;
  regions?: Array<{
    phrase: string;
    start_idx: number;
    end_idx: number;
    is_correct: boolean;
  }>;
  created_by?: string;
  last_edited_by?: string;
  question_category?: string;
  question_image_url?: string;
  // Category metadata from backend
  category_name?: string;
  category_slug?: string;
  // Ray Selector fields
  numberline_min?: number;
  numberline_max?: number;
  tick_interval?: number;
  ray_correct_type?: string;
  ray_correct_position?: number;
  // Graph Selector fields
  x_min?: number;
  x_max?: number;
  y_min?: number;
  y_max?: number;
  max_selectable_points?: number;
  graph_instruction?: string;
  graph_type?: string;
  show_axes?: boolean;
  show_labels?: boolean;
  snap_to_grid?: boolean;
  grid_interval?: number;
  points?: Array<{
    id?: number;
    x: number;
    y: number;
    is_correct: boolean;
    point_label?: string;
  }>;
  // TABLE_GRID specific fields
  selection_mode?: "single" | "multiple";
  row_labels?: string[];
  column_labels?: string[];
  row_order?: number[];
  column_order?: number[];
  answer_matrix?: Array<{
    row_index: number;
    column_index: number;
    is_correct: boolean;
  }>;
  // DND specific fields
  buckets?: Array<{
    id?: number;
    label: string;
  }>;
  dnd_choices?: Array<{
    id?: number;
    label: string;
  }>;
  assignments?: Array<{
    bucket_id: number;
    choice_id: number;
  }>;
};
