import axios from "axios";
import { TestPackAnswerChoice } from "../types/testPack";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://eznnseebbi.execute-api.ap-southeast-2.amazonaws.com/dev";

export const api = axios.create({
  baseURL: `${API_URL}/api/content`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    /* console.log("API Request:", config.method?.toUpperCase(), config.url); */
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    /* console.log("API Response:", response.status, response.data); */
    return response;
  },
  (error) => {
    console.error(
      "API Response Error:",
      error.response?.status,
      error.response?.data,
    );
    return Promise.reject(error);
  },
);

export interface Category {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface QuestionType {
  id: number;
  test_type_id: number | null;
  acronym: string | null;
  name: string | null;
  type: string | null;
  test_section_id: number | null;
}

export interface Question {
  id: string;
  question_id?: number;
  question: string;
  explanation: string;
  type_id: number;
  category_id: number;
  difficulty: number;
  video_url?: string;
  workbook?: string;
  test_label?: string;
  asset_filename?: string;
  asset_description?: string;
  custom_passage?: string;
  created_at?: string;
  updated_at?: string;
  version?: number;
  question_type?: QuestionType;
  has_multiple_correct: boolean;
}

export interface Answer {
  answer_text: string;
  is_correct: string;
  choice_label: string;
  answer_explanation: string;
}

export const categoryService = {
  getAll: async () => {
    try {
      const response = await api.get<Category[]>("/categories/");
      return response.data;
    } catch (error) {
      console.error("Error in getAll categories:", error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await api.get<Category>(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error in getCategoryById:", error);
      throw error;
    }
  },
};

export const questionService = {
  getAll: async (limit: number = 100, offset: number = 0) => {
    try {
      const response = await api.get<Question[]>(`/questions/?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error("Error in getAll questions:", error);
      throw error;
    }
  },

  // Add new method for fetching questions with hierarchical filters
  getWithFilters: async (filters: {
    chapter_number?: string;
    topic_id?: string;
    sub_topic_id?: string;
    page?: number;
    per_page?: number;
  }) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.chapter_number) params.append('chapter_number', filters.chapter_number);
      if (filters.topic_id) params.append('topic_id', filters.topic_id);
      if (filters.sub_topic_id) params.append('sub_topic_id', filters.sub_topic_id);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.per_page) params.append('per_page', filters.per_page.toString());
      
      const response = await api.get(`/pre-shsat/questions?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error in getWithFilters questions:", error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get<Question>(`/questions/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error in getById:", error);
      throw error;
    }
  },

  getByCategory: async (
    categoryId: number,
    limit: number = 10,
    offset: number = 0,
  ) => {
    try {
      const response = await api.get<Question[]>(
        `/questions/category/${categoryId}`,
        {
          params: { limit, offset },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error in getByCategory:", error);
      throw error;
    }
  },

  create: async (data: Omit<Question, "id">) => {
    try {
      const response = await api.post<Question>("/questions", data);
      return response.data;
    } catch (error) {
      console.error("Error in create:", error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<Question>) => {
    try {
      const response = await api.put<Question>(`/questions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error in update:", error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/questions/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error in delete:", error);
      throw error;
    }
  },

  revise: async (id: string, data: Partial<Question>) => {
    try {
      const response = await api.post<Question>(
        `/questions/${id}/revise`,
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Error in revise:", error);
      throw error;
    }
  },
};

export const questionTypeService = {
  getAll: async () => {
    try {
      const response = await api.get<QuestionType[]>("/question-types");
      return response.data;
    } catch (error) {
      console.error("Error in getAll:", error);
      throw error;
    }
  },
};

export const answerService = {
  getByQuestionId: async (questionId: string) => {
    try {
      // Get the question first to get its question_id
      const question = await questionService.getById(questionId);
      if (!question.question_id) {
        throw new Error("Question ID not found");
      }
      const response = await api.get<Answer[]>(
        `/answers/question/${question.question_id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error in getByQuestionId:", error);
      throw error;
    }
  },

  create: async (questionId: string, choiceId: number, data: Answer) => {
    try {
      // Get the question first to get its question_id
      const question = await questionService.getById(questionId);
      if (!question.question_id) {
        throw new Error("Question ID not found");
      }
      const response = await api.post<Answer>(
        `/answers/${question.question_id}/${choiceId}`,
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Error in create answer:", error);
      throw error;
    }
  },

  update: async (
    questionId: string,
    choiceId: number,
    data: Partial<Answer>,
  ) => {
    try {
      // Get the question first to get its question_id
      const question = await questionService.getById(questionId);
      if (!question.question_id) {
        throw new Error("Question ID not found");
      }
      const response = await api.put<Answer>(
        `/answers/${question.question_id}/${choiceId}`,
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Error in update answer:", error);
      throw error;
    }
  },

  delete: async (questionId: string, choiceId: number) => {
    try {
      // Get the question first to get its question_id
      const question = await questionService.getById(questionId);
      if (!question.question_id) {
        throw new Error("Question ID not found");
      }
      const response = await api.delete(
        `/answers/${question.question_id}/${choiceId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error in delete answer:", error);
      throw error;
    }
  },
};

export const fetchTestPackQuestionChoices = async (
  questionId: number,
): Promise<TestPackAnswerChoice[]> => {
  const url = `${API_URL}/api/test-pack/mc/get/${questionId}`;
  /* console.log("API - Fetching choices from:", url); */

  const response = await fetch(url);
  /* console.log("API - Response status:", response.status); */

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API - Error response:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error("Failed to fetch question choices");
  }

  const data = await response.json();
  /* console.log("API - Received data:", data); */
  return data;
};
