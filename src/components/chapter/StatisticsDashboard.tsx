import { QuestionCoverage } from "../../lib/types";
import { BarChart, PieChart } from "lucide-react";

interface StatisticsDashboardProps {
  coverage: QuestionCoverage;
}

export function StatisticsDashboard({ coverage }: StatisticsDashboardProps) {
  const totalQuestions = coverage.total_questions;

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-6">Question Coverage</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Topic Distribution */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium">Topic Distribution</h3>
          </div>
          <div className="space-y-4">
            {coverage.by_topic.map((topic) => (
              <div key={topic.topic_id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">
                    {topic.topic_title}
                  </span>
                  <span className="text-sm text-gray-500">
                    {topic.question_count} questions
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${(topic.question_count / totalQuestions) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question Type Distribution */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-green-600" />
            <h3 className="font-medium">Question Types</h3>
          </div>
          <div className="space-y-4">
            {coverage.by_type.map((type) => (
              <div key={type.question_type}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">
                    {type.question_type.charAt(0).toUpperCase() +
                      type.question_type.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {type.count} questions
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full"
                    style={{
                      width: `${(type.count / totalQuestions) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium">Total Questions</h4>
            <p className="text-sm text-gray-600">Across all topics and types</p>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {totalQuestions}
          </div>
        </div>
      </div>
    </div>
  );
}
