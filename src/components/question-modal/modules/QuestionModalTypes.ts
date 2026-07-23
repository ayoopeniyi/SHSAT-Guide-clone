// Question Modal Types and Interfaces
import { QuestionModalProps } from '../types';

export interface QuestionModalState {
  questionType: string;
  setQuestionType: (type: string) => void;
  subject: string;
  setSubject: (subject: string) => void;
  mainTopicId: string;
  setMainTopicId: (id: string) => void;
  categoryId: string;
  setCategoryId: (id: string) => void;
  categories: Array<{ id: number; name: string }>;
  setCategories: (categories: Array<{ id: number; name: string }>) => void;
  mainTopics: Array<{ id: number; name: string }>;
  setMainTopics: (topics: Array<{ id: number; name: string }>) => void;
  categoriesLoading: boolean;
  setCategoriesLoading: (loading: boolean) => void;
  categoriesError: string | null;
  setCategoriesError: (error: string | null) => void;
  mainTopicsLoading: boolean;
  setMainTopicsLoading: (loading: boolean) => void;
  mainTopicsError: string | null;
  setMainTopicsError: (error: string | null) => void;
}

export interface QuestionModalContext {
  isOpen: boolean;
  initialValues: any;
  onSave: (data: any) => void;
  onClose: () => void;
  istestpack: boolean;
  isPassageEdit: boolean;
  shouldEditPassage: boolean;
}

export interface FormRendererProps {
  questionType: string;
  shouldEditPassage: boolean;
  initialValues: any;
  istestpack: boolean;
  subject: string;
  categoryId: string;
  onClose: () => void;
}

export interface FooterRendererProps {
  questionType: string;
  shouldEditPassage: boolean;
  canSave: (type: string) => boolean;
  onClose: () => void;
  onSave: () => void;
}

export interface PrefillConfig {
  questionType: string;
  initialValues: any;
  hasPrefilled: boolean;
  setHasPrefilled: (prefilled: boolean) => void;
}

export interface ValidationConfig {
  questionType: string;
  initialValues: any;
  shouldEditPassage: boolean;
  istestpack: boolean;
  subject: string;
  mainTopicId: string;
  categoryId: string;
  chapter_number?: number;
  topic_id?: number;
  sub_topic_id?: number;
  question_category?: string;
}
