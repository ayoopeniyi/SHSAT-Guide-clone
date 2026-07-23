export interface Question {
  id: number;
  question: string;
  options: string[];
}

export const quizData: Question[] = [
  {
    id: 1,
    question: "What is the main purpose of the SHSAT?",
    options: [
      "To determine high school admissions",
      "To measure general academic ability",
      "To test specific subject knowledge",
      "To evaluate extracurricular activities",
    ],
  },
  {
    id: 2,
    question: "How many questions are on the SHSAT?",
    options: ["50 questions", "75 questions", "100 questions", "125 questions"],
  },
  {
    id: 3,
    question: "What is the time limit for the SHSAT?",
    options: ["2 hours", "2.5 hours", "3 hours", "3.5 hours"],
  },
  {
    id: 4,
    question: "Which of these is NOT a specialized high school in NYC?",
    options: [
      "Stuyvesant High School",
      "Bronx Science",
      "Brooklyn Tech",
      "LaGuardia High School",
    ],
  },
  {
    id: 5,
    question:
      "What is the minimum score needed to get into a specialized high school?",
    options: [
      "There is no minimum score",
      "500 points",
      "600 points",
      "700 points",
    ],
  },
];
