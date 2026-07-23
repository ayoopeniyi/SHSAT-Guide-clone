import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Chapter, Topic, Question, QuestionCoverage } from "../lib/types";
import { ChapterHeader } from "../components/chapter/ChapterHeader";
import { TopicsNavigation } from "../components/chapter/TopicsNavigation";
import { QuestionsSection } from "../components/chapter/QuestionsSection";
import { StatisticsDashboard } from "../components/chapter/StatisticsDashboard";
//testing

// Temporary mock data for testing
const mockChapter: Chapter = {
  chapter_number: 1,
  title: "Introduction to Algebra",
  subject: "Mathematics",
  start_page: 1,
  end_page: 20,
  has_practice: true,
};

const mockTopics: Topic[] = [
  {
    id: 1,
    title: "Basic Operations",
    subtopics: [
      { id: 1, title: "Addition & Subtraction" },
      { id: 2, title: "Multiplication & Division" },
    ],
  },
];

const mockQuestions: Question[] = [
  {
    id: 1,
    content: "What is 2 + 2?",
    answer: "4",
    explanation: "Basic addition",
    question_type: "practice",
    topic_id: 1,
    subtopic_id: 1,
  },
];

const mockCoverage: QuestionCoverage = {
  total_questions: 10,
  by_topic: [
    {
      topic_id: 1,
      topic_title: "Basic Operations",
      question_count: 5,
      subtopics: [
        {
          subtopic_id: 1,
          subtopic_title: "Addition & Subtraction",
          question_count: 3,
        },
      ],
    },
  ],
  by_type: [
    {
      question_type: "practice",
      count: 10,
    },
  ],
};

export function ChapterPage() {
  const { chapterNumber } = useParams<{ chapterNumber: string }>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChapterHeader chapter={mockChapter} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-3">
            <TopicsNavigation
              topics={mockTopics}
              onTopicSelect={(topicId, subtopicId) => {
                /* console.log("Selected:", { topicId, subtopicId }); */
              }}
            />
          </div>

          <div className="lg:col-span-9 space-y-6">
            <StatisticsDashboard coverage={mockCoverage} />
            <QuestionsSection questions={mockQuestions} />
          </div>
        </div>
      </div>
    </div>
  );
}
