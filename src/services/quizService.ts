import { supabase } from "../lib/supabase";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  created_at: string;
}

export interface QuizAnswer {
  question_id: string;
  selected_option: string;
}

export interface QuizSubmission {
  user_id: string;
  name: string;
  email: string;
  answers: QuizAnswer[];
}

export interface QuizResult {
  score: number;
  total_questions: number;
  percentage: number;
  answers: Array<{
    question: string;
    selected_answer: string;
    correct_answer: string;
    explanation: string | null;
    is_correct: boolean;
  }>;
}

export const quizService = {
  // Get questions from backend
  async getQuestions(): Promise<QuizQuestion[]> {
    try {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as QuizQuestion[];
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }
  },

  // Submit quiz answers
  async submitQuiz(submission: QuizSubmission): Promise<QuizResult> {
    try {
      // First, check if user exists
      const { data: existingUser, error: userCheckError } = await supabase
        .from("user_info")
        .select("*")
        .eq("email", submission.email)
        .single();

      if (userCheckError && userCheckError.code !== "PGRST116") {
        throw userCheckError;
      }

      // If user doesn't exist, create new user
      if (!existingUser) {
        const { error: userError } = await supabase.from("user_info").insert({
          user_id: submission.user_id,
          name: submission.name,
          email: submission.email,
          created_at: new Date().toISOString(),
        });

        if (userError) throw userError;
      }

      // Get all questions to calculate score
      const { data: questions, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("*");

      if (questionsError) throw questionsError;

      // Calculate score
      const questionMap = new Map(questions.map((q) => [q.id, q]));
      let score = 0;
      const answers_with_explanations = [];

      for (const answer of submission.answers) {
        const question = questionMap.get(answer.question_id);
        if (!question) continue;

        const is_correct = answer.selected_option === question.correct_answer;
        if (is_correct) score++;

        answers_with_explanations.push({
          question: question.question,
          selected_answer: answer.selected_option,
          correct_answer: question.correct_answer,
          explanation: question.explanation,
          is_correct,
        });
      }

      // Calculate percentage
      const total_questions = questions.length;
      const percentage = (score / total_questions) * 100;

      // Create result
      const result: QuizResult = {
        score,
        total_questions,
        percentage,
        answers: answers_with_explanations,
      };

      return result;
    } catch (error) {
      console.error("Error submitting quiz:", error);
      throw error;
    }
  },
};
