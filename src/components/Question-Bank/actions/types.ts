export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  cached?: boolean;
}

export interface Chapter {
  chapter_number: number;
  title: string;
  subject: string;
  start_page: number;
  end_page: number;
  has_practice: boolean;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: number;
  title: string;
  chapter_number: number;
  created_at: string;
  updated_at: string;
}

export interface SubTopic {
  id: number;
  title: string;
  topic_id: number;
  created_at: string;
  updated_at: string;
}

export interface Passage {
  id: number;
  topic_title: string;
  sub_topic_title?: string;
  question_count: number;
  passage?: string;
  start_page?: number;
  end_page?: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionsResponse {
  questions: any[];
  total: number;
  page: number;
  per_page: number;
}

export interface PassagesResponse {
  passages: Passage[];
  total: number;
  page: number;
  per_page: number;
}

export interface FilterActionParams {
  chapterNumber?: string;
  topicId?: string;
  subTopicId?: string;
  forceRefresh?: boolean;
}

export interface QuestionActionParams {
  page: number;
  per_page: number;
  filters: Record<string, string>;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface CacheConfig {
  key: string;
  ttl?: number; // time to live in milliseconds
  forceRefresh?: boolean;
}
