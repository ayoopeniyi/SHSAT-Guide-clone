import { useState } from "react";
import { Topic } from "../../lib/types";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TopicsNavigationProps {
  topics: Topic[];
  onTopicSelect: (topicId: number, subtopicId?: number) => void;
}

export function TopicsNavigation({
  topics,
  onTopicSelect,
}: TopicsNavigationProps) {
  const [expandedTopics, setExpandedTopics] = useState<number[]>([]);

  const toggleTopic = (topicId: number) => {
    setExpandedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId],
    );
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Topics</h2>
      <div className="space-y-2">
        {topics.map((topic) => (
          <div key={topic.id} className="border rounded-md">
            <button
              onClick={() => {
                toggleTopic(topic.id);
                onTopicSelect(topic.id);
              }}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">{topic.title}</span>
              {topic.subtopics.length > 0 && (
                <span className="text-gray-500">
                  {expandedTopics.includes(topic.id) ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </span>
              )}
            </button>
            {expandedTopics.includes(topic.id) &&
              topic.subtopics.length > 0 && (
                <div className="border-t bg-gray-50">
                  {topic.subtopics.map((subtopic) => (
                    <button
                      key={subtopic.id}
                      onClick={() => onTopicSelect(topic.id, subtopic.id)}
                      className="w-full text-left p-2 pl-6 hover:bg-gray-100 transition-colors text-sm"
                    >
                      {subtopic.title}
                    </button>
                  ))}
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
