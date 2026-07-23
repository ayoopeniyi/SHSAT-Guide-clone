export interface Chapter {
  chapter_number: number;
  title: string;
  subject: string;
  start_page: number;
  end_page: number;
  has_practice: boolean;
}

export interface Topic {
  id: number;
  title: string;
  subtopics: Subtopic[];
}

export interface Subtopic {
  id: number;
  title: string;
}

export interface Question {
  id: number;
  content: string;
  answer: string;
  explanation?: string;
  question_type: string;
  topic_id: number;
  subtopic_id: number;
}

export interface QuestionCoverage {
  total_questions: number;
  by_topic: TopicCoverage[];
  by_type: TypeCoverage[];
}

interface TopicCoverage {
  topic_id: number;
  topic_title: string;
  question_count: number;
  subtopics: SubtopicCoverage[];
}

interface SubtopicCoverage {
  subtopic_id: number;
  subtopic_title: string;
  question_count: number;
}

interface TypeCoverage {
  question_type: string;
  count: number;
}
