// Hook for managing chapter/topic/subtopic hierarchy
import { useState, useEffect } from 'react';
import { hierarchyService, Chapter, Topic, SubTopic } from '../services/hierarchyService';

interface UseHierarchyResult {
  // Data
  chapters: Chapter[];
  topics: Topic[];
  subTopics: SubTopic[];
  
  // Selected values
  selectedChapter: number | undefined;
  selectedTopic: number | undefined;
  selectedSubTopic: number | undefined;
  
  // Setters
  setSelectedChapter: (chapterNumber: number | undefined) => void;
  setSelectedTopic: (topicId: number | undefined) => void;
  setSelectedSubTopic: (subTopicId: number | undefined) => void;
  
  // Loading states
  chaptersLoading: boolean;
  topicsLoading: boolean;
  subTopicsLoading: boolean;
  
  // Error states
  chaptersError: string | null;
  topicsError: string | null;
  subTopicsError: string | null;
}

export const useHierarchy = (
  initialChapter?: number,
  initialTopic?: number,
  initialSubTopic?: number
): UseHierarchyResult => {
  // Data states
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  
  // Selected values
  const [selectedChapter, setSelectedChapter] = useState<number | undefined>(initialChapter);
  const [selectedTopic, setSelectedTopic] = useState<number | undefined>(initialTopic);
  const [selectedSubTopic, setSelectedSubTopic] = useState<number | undefined>(initialSubTopic);
  
  // Loading states
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [subTopicsLoading, setSubTopicsLoading] = useState(false);
  
  // Error states
  const [chaptersError, setChaptersError] = useState<string | null>(null);
  const [topicsError, setTopicsError] = useState<string | null>(null);
  const [subTopicsError, setSubTopicsError] = useState<string | null>(null);

  // Update selected values when initial values change
  useEffect(() => {
    setSelectedChapter(initialChapter);
  }, [initialChapter]);

  useEffect(() => {
    setSelectedTopic(initialTopic);
  }, [initialTopic]);

  useEffect(() => {
    setSelectedSubTopic(initialSubTopic);
  }, [initialSubTopic]);

  // Fetch chapters on mount
  useEffect(() => {
    const fetchChapters = async () => {
      setChaptersLoading(true);
      setChaptersError(null);
      try {
        const data = await hierarchyService.getChapters();
        setChapters(data);
      } catch (error) {
        setChaptersError(error instanceof Error ? error.message : 'Failed to fetch chapters');
      } finally {
        setChaptersLoading(false);
      }
    };

    fetchChapters();
  }, []);

  // Fetch topics when chapter changes
  useEffect(() => {
    if (selectedChapter) {
      const fetchTopics = async () => {
        setTopicsLoading(true);
        setTopicsError(null);
        try {
          const data = await hierarchyService.getTopicsForChapter(selectedChapter);
          setTopics(data);
        } catch (error) {
          setTopicsError(error instanceof Error ? error.message : 'Failed to fetch topics');
        } finally {
          setTopicsLoading(false);
        }
      };

      fetchTopics();
    } else {
      setTopics([]);
      setSelectedTopic(undefined);
    }
  }, [selectedChapter]);

  // Fetch subtopics when topic changes
  useEffect(() => {
    if (selectedTopic) {
      const fetchSubTopics = async () => {
        setSubTopicsLoading(true);
        setSubTopicsError(null);
        try {
          const data = await hierarchyService.getSubTopicsForTopic(selectedTopic);
          setSubTopics(data);
        } catch (error) {
          setSubTopicsError(error instanceof Error ? error.message : 'Failed to fetch subtopics');
        } finally {
          setSubTopicsLoading(false);
        }
      };

      fetchSubTopics();
    } else {
      setSubTopics([]);
      setSelectedSubTopic(undefined);
    }
  }, [selectedTopic]);

  // Clear dependent selections when parent changes
  const handleChapterChange = (chapterNumber: number | undefined) => {
    setSelectedChapter(chapterNumber);
    setSelectedTopic(undefined);
    setSelectedSubTopic(undefined);
  };

  const handleTopicChange = (topicId: number | undefined) => {
    setSelectedTopic(topicId);
    setSelectedSubTopic(undefined);
  };

  return {
    chapters,
    topics,
    subTopics,
    selectedChapter,
    selectedTopic,
    selectedSubTopic,
    setSelectedChapter: handleChapterChange,
    setSelectedTopic: handleTopicChange,
    setSelectedSubTopic,
    chaptersLoading,
    topicsLoading,
    subTopicsLoading,
    chaptersError,
    topicsError,
    subTopicsError,
  };
};
