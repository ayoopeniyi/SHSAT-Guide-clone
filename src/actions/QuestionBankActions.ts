// QuestionBankActions.ts - API operations for Question Bank

// TypeScript Interfaces
interface QuestionResponse {
  questions: Question[];
  total: number;
  passages?: any[];
}

interface PassageResponse {
  passages: any[];
  total: number;
}

interface UpdateQuestionPayload {
  question: string;
  difficulty?: number;
  explanation?: string | null;
  last_edited_by: string;
}

interface DeleteQuestionResponse {
  success: boolean;
  message: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Question type from your existing types
interface Question {
  id: number;
  question: string;
  question_type: string;
  question_category?: string;
  difficulty: number;
  choices?: any[];
  created_at?: string;
  updated_at?: string;
  // Add other properties as needed
}

/**
 * Fetch questions and passages based on search parameters
 * @param params - URLSearchParams containing filters, search, pagination
 * @returns Promise<QuestionResponse | PassageResponse>
 */
export const fetchQuestions = async (params: URLSearchParams): Promise<QuestionResponse | PassageResponse> => {
  const apiBase = import.meta.env.VITE_API_URL;

  try {
    const url = `${apiBase}/api/pre-shsat/questions?${params.toString()}`;
    /* console.log("Fetching questions with URL:", url); */
    /* console.log("Filter params:", Object.fromEntries(params.entries())); */

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;

      switch (response.status) {
        case 400:
          throw new Error(`Bad Request: ${errorMessage}`);
        case 401:
          throw new Error(`Unauthorized: ${errorMessage}`);
        case 403:
          throw new Error(`Forbidden: ${errorMessage}`);
        case 404:
          throw new Error(`Not Found: ${errorMessage}`);
        case 500:
          throw new Error(`Server Error: ${errorMessage}`);
        default:
          throw new Error(`Request failed: ${errorMessage}`);
      }
    }

    const data = await response.json();

    // Check if we're getting passages or questions
    if (data.passages) {
      // We're getting passages
      return {
        passages: data.passages || [],
        total: data.total || 0
      };
    } else {
      // We're getting questions
      return {
        questions: data.questions || [],
        total: data.total || 0
      };
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request was aborted");
    }
    throw new Error(`Failed to fetch questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Update question text
 * @param questionId - ID of the question to update
 * @param newText - New question text
 * @param userName - Username for audit trail
 * @returns Promise<void>
 */
export const updateQuestionText = async (
  questionId: number,
  newText: string,
  userName: string,
  difficulty?: number,
  explanation?: string | null,
): Promise<void> => {
  const apiBase = import.meta.env.VITE_API_URL;

  try {
    const payload: UpdateQuestionPayload = {
      question: newText,
      last_edited_by: userName,
      difficulty: difficulty,
      explanation: explanation
    };

    const response = await fetch(
      `${apiBase}/api/pre-shsat/questions/${questionId}/text`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;

      switch (response.status) {
        case 400:
          throw new Error(`Bad Request: ${errorMessage}`);
        case 401:
          throw new Error(`Unauthorized: ${errorMessage}`);
        case 403:
          throw new Error(`Forbidden: ${errorMessage}`);
        case 404:
          throw new Error(`Question not found: ${errorMessage}`);
        case 500:
          throw new Error(`Server Error: ${errorMessage}`);
        default:
          throw new Error(`Failed to update question: ${errorMessage}`);
      }
    }
  } catch (error) {
    throw new Error(`Failed to update question text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Update MC question with hierarchy data
 */
export const updateMCQuestionWithHierarchy = async (
  questionId: number,
  questionData: {
    question: string;
    difficulty?: number;
    chapter_number?: number;
    topic_id?: number;
    sub_topic_id?: number;
    question_category?: string;
  },
  userName: string
): Promise<void> => {
  const apiBase = import.meta.env.VITE_API_URL;

  try {
    const payload = {
      ...questionData,
      last_edited_by: userName,
    };

    const response = await fetch(
      `${apiBase}/api/pre-shsat/questions/${questionId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;

      switch (response.status) {
        case 400:
          throw new Error(`Bad Request: ${errorMessage}`);
        case 401:
          throw new Error('Unauthorized: Please check your credentials');
        case 403:
          throw new Error('Forbidden: You do not have permission to update this question');
        case 404:
          throw new Error('Question not found');
        case 422:
          throw new Error(`Validation Error: ${errorMessage}`);
        default:
          throw new Error(errorMessage);
      }
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server');
    }
    throw error;
  }
};

/**
 * Update question text and image (if provided)
 */
export const updateQuestionTextAndImage = async (
  questionId: number,
  newText: string,
  questionImageUrl: string | undefined,
  userName: string,
  difficulty?: number,
): Promise<void> => {
  const apiBase = import.meta.env.VITE_API_URL;
  try {
    const payload: any = {
      question: newText,
      last_edited_by: userName,
    };
    if (typeof questionImageUrl !== 'undefined') {
      payload.question_image_url = questionImageUrl;
    }
    if (difficulty !== undefined) {
      payload.difficulty = difficulty;
    }

    const response = await fetch(
      `${apiBase}/api/pre-shsat/questions/${questionId}/text`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
  } catch (error) {
    throw new Error(
      `Failed to update question: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};

/**
 * Update question text for MA (Multi-Answer) questions
 * @param questionId - ID of the question to update
 * @param newText - New question text
 * @param explanation - Question explanation
 * @param userName - Username for audit trail
 * @returns Promise<void>
 */
export const updateMAQuestionText = async (
  questionId: number,
  newText: string,
  explanation: string | null,
  userName: string,
  difficulty?: number
): Promise<void> => {
  const apiBase = import.meta.env.VITE_API_URL;

  try {
    const payload = {
      question: newText,
      explanation: explanation,
      difficulty: difficulty,
      last_edited_by: userName,
    };

    const response = await fetch(
      `${apiBase}/api/pre-shsat/questions/ma/${questionId}/text`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;

      switch (response.status) {
        case 400:
          throw new Error(`Bad Request: ${errorMessage}`);
        case 401:
          throw new Error(`Unauthorized: ${errorMessage}`);
        case 403:
          throw new Error(`Forbidden: ${errorMessage}`);
        case 404:
          throw new Error(`MA Question not found: ${errorMessage}`);
        case 500:
          throw new Error(`Server Error: ${errorMessage}`);
        default:
          throw new Error(`Failed to update MA question: ${errorMessage}`);
      }
    }
  } catch (error) {
    throw new Error(`Failed to update MA question text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Delete a question
 * @param questionId - ID of the question to delete
 * @returns Promise<DeleteQuestionResponse>
 */
export const deleteQuestion = async (questionId: number): Promise<DeleteQuestionResponse> => {
  const apiBase = import.meta.env.VITE_API_URL;

  try {
    const response = await fetch(
      `${apiBase}/api/pre-shsat/questions/${questionId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;

      switch (response.status) {
        case 400:
          throw new Error(`Bad Request: ${errorMessage}`);
        case 401:
          throw new Error(`Unauthorized: ${errorMessage}`);
        case 403:
          throw new Error(`Forbidden: ${errorMessage}`);
        case 404:
          throw new Error(`Question not found: ${errorMessage}`);
        case 500:
          throw new Error(`Server Error: ${errorMessage}`);
        default:
          throw new Error(`Failed to delete question: ${errorMessage}`);
      }
    }

    return {
      success: true,
      message: "Question deleted successfully"
    };
  } catch (error) {
    throw new Error(`Failed to delete question: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Fetch questions only (without passages)
 * @param params - URLSearchParams containing filters, search, pagination
 * @returns Promise<QuestionResponse>
 */
export const fetchQuestionsOnly = async (params: URLSearchParams): Promise<QuestionResponse> => {
  const apiBase = import.meta.env.VITE_API_URL;

  try {
    const url = `${apiBase}/api/pre-shsat/questions?${params.toString()}`;
    /* console.log("Fetching questions only with URL:", url); */

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;

      switch (response.status) {
        case 400:
          throw new Error(`Bad Request: ${errorMessage}`);
        case 401:
          throw new Error(`Unauthorized: ${errorMessage}`);
        case 403:
          throw new Error(`Forbidden: ${errorMessage}`);
        case 404:
          throw new Error(`Not Found: ${errorMessage}`);
        case 500:
          throw new Error(`Server Error: ${errorMessage}`);
        default:
          throw new Error(`Request failed: ${errorMessage}`);
      }
    }

    const data = await response.json();

    return {
      questions: data.questions || [],
      total: data.total || 0
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request was aborted");
    }
    throw new Error(`Failed to fetch questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Fetch passages only
 * @param params - URLSearchParams containing filters, search, pagination
 * @returns Promise<PassageResponse>
 */
export const fetchPassagesOnly = async (params: URLSearchParams): Promise<PassageResponse> => {
  const apiBase = import.meta.env.VITE_API_URL;

  try {
    const url = `${apiBase}/api/pre-shsat/questions?${params.toString()}`;
    /* console.log("Fetching passages only with URL:", url); */

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;

      switch (response.status) {
        case 400:
          throw new Error(`Bad Request: ${errorMessage}`);
        case 401:
          throw new Error(`Unauthorized: ${errorMessage}`);
        case 403:
          throw new Error(`Forbidden: ${errorMessage}`);
        case 404:
          throw new Error(`Not Found: ${errorMessage}`);
        case 500:
          throw new Error(`Server Error: ${errorMessage}`);
        default:
          throw new Error(`Request failed: ${errorMessage}`);
      }
    }

    const data = await response.json();

    return {
      passages: data.passages || [],
      total: data.total || 0
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request was aborted");
    }
    throw new Error(`Failed to fetch passages: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 