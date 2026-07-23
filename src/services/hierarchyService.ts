// Service for handling chapter/topic/subtopic hierarchy
export interface Chapter {
  chapter_number: number;
  subject?: string;
  title: string;
  start_page?: number;
  end_page?: number;
  has_practice?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Topic {
  id: number;
  chapter_number: number;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubTopic {
  id: number;
  topic_id: number;
  title: string;
  created_at?: string;
  updated_at?: string;
}

class HierarchyService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL;
  }

  // Get all chapters
  async getChapters(): Promise<Chapter[]> {
    const response = await fetch(`${this.baseUrl}/api/pre-shsat/chapters`);
    if (!response.ok) {
      throw new Error('Failed to fetch chapters');
    }
    return response.json();
  }

  // Get topics for a specific chapter
  async getTopicsForChapter(chapterNumber: number): Promise<Topic[]> {
    const response = await fetch(`${this.baseUrl}/api/pre-shsat/chapters/${chapterNumber}/topics`);
    if (!response.ok) {
      throw new Error('Failed to fetch topics');
    }
    return response.json();
  }

  // Get subtopics for a specific topic
  async getSubTopicsForTopic(topicId: number): Promise<SubTopic[]> {
    const response = await fetch(`${this.baseUrl}/api/pre-shsat/topics/${topicId}/sub-topics`);
    if (!response.ok) {
      throw new Error('Failed to fetch subtopics');
    }
    return response.json();
  }
}

export const hierarchyService = new HierarchyService();
