import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown, ChevronRight } from "lucide-react";

interface Subtopic {
  id: number;
  topic_id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Topic {
  id: number;
  chapter_number: number;
  title: string;
  created_at: string;
  updated_at: string;
  sub_topics: Subtopic[];
}

export function ChapterDetailsPage() {
  const { chapterNumber } = useParams<{ chapterNumber: string }>();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<number[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/pre-shsat/chapters/${chapterNumber}/topics-with-subtopics`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch topics");
        }
        const data = await response.json();
        // Ensure data is an array and has the expected structure
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received from server");
        }
        // Sort topics by their ID to maintain order
        const sortedTopics = [...data].sort((a, b) => a.id - b.id);
        setTopics(sortedTopics);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load topics");
      } finally {
        setLoading(false);
      }
    };

    if (chapterNumber) {
      fetchTopics();
    }
  }, [chapterNumber]);

  const toggleTopic = (topicId: number) => {
    setExpandedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId],
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600 py-8">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/teachers")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        {/* Chapter Topics */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Chapter {chapterNumber} Topics
          </h2>

          {topics.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No topics available for this chapter.
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => (
                <div key={topic.id} className="border rounded-lg">
                  <button
                    onClick={() => toggleTopic(topic.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-lg">{topic.title}</span>
                    {topic.sub_topics &&
                      topic.sub_topics.length > 0 &&
                      (expandedTopics.includes(topic.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      ))}
                  </button>

                  {expandedTopics.includes(topic.id) &&
                    topic.sub_topics &&
                    topic.sub_topics.length > 0 && (
                      <div className="border-t bg-gray-50 p-4">
                        <div className="space-y-2">
                          {topic.sub_topics.map((subtopic) => (
                            <div
                              key={subtopic.id}
                              className="flex items-center pl-4 py-2 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <span className="text-gray-700">
                                {subtopic.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
