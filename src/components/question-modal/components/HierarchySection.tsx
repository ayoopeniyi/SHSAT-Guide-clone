import React, { useEffect } from "react";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useHierarchy } from "../../../hooks/useHierarchy";

interface HierarchySectionProps {
  isTestPack?: boolean;
  questionCategory?: string;
  setQuestionCategory?: (value: string) => void;
  chapter?: number;
  setChapter?: (value: number | undefined) => void;
  topic?: number;
  setTopic?: (value: number | undefined) => void;
  subTopic?: number;
  setSubTopic?: (value: number | undefined) => void;
}

export const HierarchySection: React.FC<HierarchySectionProps> = ({
  isTestPack = false,
  questionCategory = "Practice",
  setQuestionCategory,
  chapter,
  setChapter,
  topic,
  setTopic,
  subTopic,
  setSubTopic,
}) => {
  const hierarchy = useHierarchy(chapter, topic, subTopic);

  // Sync hierarchy state with parent component when user makes selections
  const handleChapterChange = (chapterNumber: number | undefined) => {
    /* console.log("🔍 [HierarchySection] handleChapterChange called with:", chapterNumber); */
    /* console.log("🔍 [HierarchySection] setChapter function:", setChapter); */
    hierarchy.setSelectedChapter(chapterNumber);
    setChapter?.(chapterNumber);
    // Reset topic and subtopic when chapter changes
    setTopic?.(undefined);
    setSubTopic?.(undefined);
  };

  const handleTopicChange = (topicId: number | undefined) => {
    /* console.log("🔍 [HierarchySection] handleTopicChange called with:", topicId); */
    /* console.log("🔍 [HierarchySection] setTopic function:", setTopic); */
    hierarchy.setSelectedTopic(topicId);
    setTopic?.(topicId);
    // Reset subtopic when topic changes
    setSubTopic?.(undefined);
  };

  const handleSubTopicChange = (subTopicId: number | undefined) => {
    /* console.log("🔍 [HierarchySection] handleSubTopicChange called with:", subTopicId); */
    /* console.log("🔍 [HierarchySection] setSubTopic function:", setSubTopic); */
    hierarchy.setSelectedSubTopic(subTopicId);
    setSubTopic?.(subTopicId);
  };

  // Sync parent state with hierarchy state when parent values change
  useEffect(() => {
    if (chapter !== hierarchy.selectedChapter) {
      hierarchy.setSelectedChapter(chapter);
    }
  }, [chapter, hierarchy]);

  useEffect(() => {
    if (topic !== hierarchy.selectedTopic) {
      hierarchy.setSelectedTopic(topic);
    }
  }, [topic, hierarchy]);

  useEffect(() => {
    if (subTopic !== hierarchy.selectedSubTopic) {
      hierarchy.setSelectedSubTopic(subTopic);
    }
  }, [subTopic, hierarchy]);

  // Don't show hierarchy fields for test pack
  if (isTestPack) {
    return null;
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-lg font-medium text-gray-900">Question Organization</h3>
      
      {/* Question Category */}
      <div>
        <Label htmlFor="question-category">Question Category</Label>
        <Select 
          value={questionCategory} 
          onValueChange={(value) => {
            /* console.log("🔍 [HierarchySection] Question category changed to:", value); */
            /* console.log("🔍 [HierarchySection] setQuestionCategory function:", setQuestionCategory); */
            setQuestionCategory?.(value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Practice">Practice</SelectItem>
            <SelectItem value="Drill">Drill</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Chapter Dropdown */}
        <div>
          <Label htmlFor="chapter">Chapter</Label>
          <Select 
            value={hierarchy.selectedChapter?.toString() || ""} 
            onValueChange={(value) => {
              const chapterNum = value ? parseInt(value) : undefined;
              handleChapterChange(chapterNum);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select chapter..." />
            </SelectTrigger>
            <SelectContent>
              {hierarchy.chapters.map((chapter) => (
                <SelectItem key={chapter.chapter_number} value={chapter.chapter_number.toString()}>
                  Ch {chapter.chapter_number}: {chapter.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hierarchy.chaptersLoading && <p className="text-xs text-gray-500 mt-1">Loading chapters...</p>}
          {hierarchy.chaptersError && <p className="text-xs text-red-500 mt-1">{hierarchy.chaptersError}</p>}
        </div>

        {/* Topic Dropdown */}
        <div>
          <Label htmlFor="topic">Topic</Label>
          <Select 
            value={hierarchy.selectedTopic?.toString() || ""} 
            onValueChange={(value) => {
              const topicNum = value ? parseInt(value) : undefined;
              handleTopicChange(topicNum);
            }}
            disabled={!hierarchy.selectedChapter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select topic..." />
            </SelectTrigger>
            <SelectContent>
              {hierarchy.topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id.toString()}>
                  {topic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hierarchy.topicsLoading && <p className="text-xs text-gray-500 mt-1">Loading topics...</p>}
          {hierarchy.topicsError && <p className="text-xs text-red-500 mt-1">{hierarchy.topicsError}</p>}
        </div>

        {/* Sub-topic Dropdown */}
        <div>
          <Label htmlFor="sub-topic">Sub-topic</Label>
          <Select 
            value={hierarchy.selectedSubTopic?.toString() || ""} 
            onValueChange={(value) => {
              const subTopicNum = value ? parseInt(value) : undefined;
              handleSubTopicChange(subTopicNum);
            }}
            disabled={!hierarchy.selectedTopic}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sub-topic..." />
            </SelectTrigger>
            <SelectContent>
              {hierarchy.subTopics.map((subTopic) => (
                <SelectItem key={subTopic.id} value={subTopic.id.toString()}>
                  {subTopic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hierarchy.subTopicsLoading && <p className="text-xs text-gray-500 mt-1">Loading sub-topics...</p>}
          {hierarchy.subTopicsError && <p className="text-xs text-red-500 mt-1">{hierarchy.subTopicsError}</p>}
        </div>
      </div>
    </div>
  );
};
