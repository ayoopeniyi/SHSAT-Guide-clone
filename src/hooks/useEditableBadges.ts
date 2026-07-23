import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// API base URL - use localhost for development, production URL for production
const API_BASE_URL = import.meta.env.VITE_API_URL;

interface BadgeData {
  id: number | string;
  title: string;
  [key: string]: any;
}

interface EditableBadgesState {
  // Current values
  chapter: { id: number | string | undefined; title: string | undefined; chapter_number?: number } | null;
  topic: { id: number | string | undefined; title: string | undefined } | null;
  subtopic: { id: number | string | undefined; title: string | undefined } | null;

  // Available options
  chapters: BadgeData[];
  topics: BadgeData[];
  subtopics: BadgeData[];

  // Loading states
  loading: {
    chapters: boolean;
    topics: boolean;
    subtopics: boolean;
    saving: boolean;
  };

  // Temporary changes (not saved yet)
  tempChanges: {
    chapter: { id: number | string | undefined; title: string | undefined; chapter_number?: number } | null;
    topic: { id: number | string | undefined; title: string | undefined } | null;
    subtopic: { id: number | string | undefined; title: string | undefined } | null;
  };
}

interface UseEditableBadgesProps {
  questionId: number;
  initialChapter?: { id: number | string | undefined; title: string | undefined; chapter_number?: number } | null;
  initialTopic?: { id: number; title: string } | null;
  initialSubtopic?: { id: number; title: string } | null;
  onSave?: () => void;
  context?: "question-bank" | "test-pack";
}

export const useEditableBadges = ({
  questionId,
  initialChapter,
  initialTopic,
  initialSubtopic,
  onSave,
  context = "question-bank"
}: UseEditableBadgesProps) => {
  // Determine API prefix based on context
  const apiPrefix = context === "test-pack" ? "test-pack" : "pre-shsat";

  const [state, setState] = useState<EditableBadgesState>({
    chapter: initialChapter || null,
    topic: initialTopic || null,
    subtopic: initialSubtopic || null,
    chapters: [],
    topics: [],
    subtopics: [],
    loading: {
      chapters: false,
      topics: false,
      subtopics: false,
      saving: false,
    },
    tempChanges: {
      chapter: initialChapter || null,
      topic: initialTopic || null,
      subtopic: initialSubtopic || null,
    },
  });

  // Load chapters
  const loadChapters = useCallback(async () => {
    /* console.log('🔄 Loading chapters from:', `${API_BASE_URL}/api/pre-shsat/chapters`); */
    setState(prev => ({ ...prev, loading: { ...prev.loading, chapters: true } }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/pre-shsat/chapters`);
      /* console.log('📡 Chapters API response status:', response.status); */
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Chapters API error response:', errorText);
        throw new Error(`Failed to fetch chapters: ${response.status} ${response.statusText}`);
      }
      const chaptersData = await response.json();
      /* console.log('✅ Chapters loaded successfully:', chaptersData); */

      // Transform chapters data to match EditableBadge expected format
      const transformedChapters = chaptersData.map((chapter: any) => ({
        id: chapter.chapter_number,
        title: chapter.title,
        ...chapter // Keep all original properties
      }));

      /* console.log('🔄 Transformed chapters:', transformedChapters); */

      setState(prev => ({
        ...prev,
        chapters: transformedChapters,
        loading: { ...prev.loading, chapters: false }
      }));
    } catch (error) {
      console.error('❌ Error loading chapters:', error);
      toast.error('Failed to load chapters');
      setState(prev => ({ ...prev, loading: { ...prev.loading, chapters: false } }));
    }
  }, []);

  // Load topics for a chapter
  const loadTopics = useCallback(async (chapterNumber: number) => {
    // Don't load topics if chapterNumber is undefined or null
    if (!chapterNumber) {
      setState(prev => ({
        ...prev,
        topics: [],
        subtopics: [],
        loading: { ...prev.loading, topics: false }
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: { ...prev.loading, topics: true } }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/pre-shsat/chapters/${chapterNumber}/topics`);
      if (!response.ok) throw new Error('Failed to fetch topics');
      const topicsData = await response.json();

      // Transform topics data to match EditableBadge expected format
      const transformedTopics = topicsData.map((topic: any) => ({
        id: topic.id,
        title: topic.title,
        ...topic // Keep all original properties
      }));

      setState(prev => ({
        ...prev,
        topics: transformedTopics,
        loading: { ...prev.loading, topics: false }
      }));
    } catch (error) {
      console.error('Error loading topics:', error);
      toast.error('Failed to load topics');
      setState(prev => ({ ...prev, loading: { ...prev.loading, topics: false } }));
    }
  }, []);

  // Load subtopics for a topic
  const loadSubtopics = useCallback(async (topicId: number) => {
    // Don't load subtopics if topicId is undefined or null
    if (!topicId) {
      setState(prev => ({
        ...prev,
        subtopics: [],
        loading: { ...prev.loading, subtopics: false }
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: { ...prev.loading, subtopics: true } }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/pre-shsat/topics/${topicId}/sub-topics`);
      if (!response.ok) throw new Error('Failed to fetch subtopics');
      const subtopicsData = await response.json();

      // Transform subtopics data to match EditableBadge expected format
      const transformedSubtopics = subtopicsData.map((subtopic: any) => ({
        id: subtopic.id,
        title: subtopic.title,
        ...subtopic // Keep all original properties
      }));

      setState(prev => ({
        ...prev,
        subtopics: transformedSubtopics,
        loading: { ...prev.loading, subtopics: false }
      }));
    } catch (error) {
      console.error('Error loading subtopics:', error);
      toast.error('Failed to load subtopics');
      setState(prev => ({ ...prev, loading: { ...prev.loading, subtopics: false } }));
    }
  }, []);

  // Handle chapter change
  const handleChapterChange = useCallback((chapter: BadgeData | null) => {
    setState(prev => ({
      ...prev,
      tempChanges: {
        chapter: chapter as { id: number; title: string } | null,
        topic: null, // Reset topic when chapter changes
        subtopic: null, // Reset subtopic when chapter changes
      }
    }));

    if (chapter) {
      const chapterNumber = chapter.chapter_number || chapter.id;
      if (chapterNumber) {
        loadTopics(chapterNumber);
      }
      // Clear topics and subtopics
      setState(prev => ({
        ...prev,
        topics: [],
        subtopics: [],
      }));
    }
  }, [loadTopics]);

  // Handle topic change
  const handleTopicChange = useCallback((topic: BadgeData | null) => {
    setState(prev => ({
      ...prev,
      tempChanges: {
        ...prev.tempChanges,
        topic: topic as { id: number; title: string } | null,
        subtopic: null, // Reset subtopic when topic changes
      }
    }));

    if (topic) {
      loadSubtopics(Number(topic.id));
      // Clear subtopics
      setState(prev => ({
        ...prev,
        subtopics: [],
      }));
    } else {
      // If topic is removed, clear subtopics list
      setState(prev => ({
        ...prev,
        subtopics: [],
      }));
    }
  }, [loadSubtopics]);

  // Handle subtopic change
  const handleSubtopicChange = useCallback((subtopic: BadgeData | null) => {
    setState(prev => ({
      ...prev,
      tempChanges: {
        ...prev.tempChanges,
        subtopic: subtopic as { id: number; title: string } | null,
      }
    }));

    // If we're removing a subtopic but still have a topic, reload subtopics
    if (!subtopic && state.tempChanges.topic) {
      loadSubtopics(Number(state.tempChanges.topic.id));
    }
  }, [loadSubtopics, state.tempChanges.topic]);

  // Save changes
  const saveChanges = useCallback(async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, saving: true } }));

    try {
      const updateData: any = {};

      if (state.tempChanges.chapter !== state.chapter) {
        updateData.chapter_number = state.tempChanges.chapter?.id || null;
      }

      if (state.tempChanges.topic !== state.topic) {
        updateData.topic_id = state.tempChanges.topic?.id || null;
      }

      if (state.tempChanges.subtopic !== state.subtopic) {
        updateData.sub_topic_id = state.tempChanges.subtopic?.id || null;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save');
        setState(prev => ({ ...prev, loading: { ...prev.loading, saving: false } }));
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/${apiPrefix}/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update question');
      }

      // Update the actual state with the saved changes
      setState(prev => ({
        ...prev,
        chapter: prev.tempChanges.chapter,
        topic: prev.tempChanges.topic,
        subtopic: prev.tempChanges.subtopic,
        loading: { ...prev.loading, saving: false },
      }));

      toast.success('Question metadata updated successfully');
      onSave?.();
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes');
      setState(prev => ({ ...prev, loading: { ...prev.loading, saving: false } }));
    }
  }, [questionId, state.tempChanges, state.chapter, state.topic, state.subtopic, onSave]);

  // Check if there are unsaved changes
  const hasUnsavedChanges =
    state.tempChanges.chapter !== state.chapter ||
    state.tempChanges.topic !== state.topic ||
    state.tempChanges.subtopic !== state.subtopic;

  // Load initial data
  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  // Load topics when chapter is set initially
  useEffect(() => {
    if (state.chapter && state.topics.length === 0) {
      const ch = state.chapter as any;
      const chapterNumber = ch.chapter_number || ch.id;
      if (chapterNumber) {
        loadTopics(Number(chapterNumber));
      }
    }
  }, [state.chapter, state.topics.length, loadTopics]);

  // Load subtopics when topic is set initially
  useEffect(() => {
    if (state.topic && state.subtopics.length === 0) {
      if (state.topic.id) {
        loadSubtopics(Number(state.topic.id));
      }
    }
  }, [state.topic, state.subtopics.length, loadSubtopics]);

  return {
    // State
    chapter: state.tempChanges.chapter,
    topic: state.tempChanges.topic,
    subtopic: state.tempChanges.subtopic,
    chapters: state.chapters,
    topics: state.topics,
    subtopics: state.subtopics,
    loading: state.loading,
    hasUnsavedChanges,

    // Actions
    handleChapterChange,
    handleTopicChange,
    handleSubtopicChange,
    saveChanges,

    // Helpers
    loadChapters,
    loadTopics,
    loadSubtopics,
  };
};
