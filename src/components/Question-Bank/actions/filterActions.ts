import { useCacheStore } from "../../../stores/cacheStore";
import { useAuthStore } from "../../../stores/authStore";
import type {
  ApiResponse,
  Chapter,
  Topic,
  SubTopic,
  Passage,
  FilterActionParams,
  CacheConfig,
} from "./types";

const API_BASE_URL = `${import.meta.env.VITE_API_URL || "https://eznnseebbi.execute-api.ap-southeast-2.amazonaws.com/dev"}/api`;

// Cache utilities
const getCacheStore = () => useCacheStore.getState();

const getCachedData = <T>(cacheKey: string): T | null => {
  const { getCache } = getCacheStore();
  return getCache(cacheKey);
};

const setCachedData = <T>(cacheKey: string, data: T): void => {
  const { setCache } = getCacheStore();
  setCache(cacheKey, data);
};

const clearCachedData = (cacheKey: string): void => {
  const { clearCache } = getCacheStore();
  clearCache(cacheKey);
};

// Generic fetch with caching
const fetchWithCache = async <T>(
  url: string,
  cacheConfig: CacheConfig,
): Promise<ApiResponse<T>> => {
  const { key, forceRefresh = false } = cacheConfig;

  /* console.log("🔍 [filterActions] fetchWithCache called with URL:", url); */
  /* console.log("🔍 [filterActions] API_BASE_URL:", API_BASE_URL); */
  /* console.log("🔍 [filterActions] Cache key:", key); */
  /* console.log("🔍 [filterActions] Force refresh:", forceRefresh); */

  // Check cache first
  if (!forceRefresh) {
    const cached = getCachedData<T>(key);
    if (cached) {
      /* console.log("🔍 [filterActions] Returning cached data for key:", key); */
      return { data: cached, success: true, cached: true };
    }
  }

  try {
    /* console.log("🔍 [filterActions] Making API call to:", url); */
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    /* console.log("🔍 [filterActions] Response status:", response.status); */
    /* console.log("🔍 [filterActions] Response ok:", response.ok); */

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    /* console.log("🔍 [filterActions] Response data:", data); */

    // Cache the successful response
    setCachedData(key, data);

    return { data, success: true, cached: false };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`🔍 [filterActions] Filter API Error (${url}):`, errorMessage);

    return {
      data: null as T,
      success: false,
      error: errorMessage,
    };
  }
};

// Fetch all chapters
export const fetchChapters = async (
  forceRefresh = false,
): Promise<ApiResponse<Chapter[]>> => {
  /* console.log("🔍 [filterActions] fetchChapters called with forceRefresh:", forceRefresh); */
  
  const url = `${API_BASE_URL}/pre-shsat/chapters`;
  /* console.log("🔍 [filterActions] Chapters URL:", url); */
  /* console.log("🔍 [filterActions] API_BASE_URL:", API_BASE_URL); */
  
  return fetchWithCache<Chapter[]>(url, {
    key: "filter_chapters",
    forceRefresh,
  });
};

// Fetch topics for a specific chapter
export const fetchTopics = async (
  params: FilterActionParams,
): Promise<ApiResponse<Topic[]>> => {
  const { chapterNumber, forceRefresh = false } = params;

  /* console.log("🔍 [filterActions] fetchTopics called with params:", params); */
  /* console.log("🔍 [filterActions] chapterNumber:", chapterNumber); */
  /* console.log("🔍 [filterActions] forceRefresh:", forceRefresh); */

  if (!chapterNumber) {
    /* console.log("🔍 [filterActions] No chapterNumber, returning empty array"); */
    return { data: [], success: true, cached: false };
  }

  const url = `${API_BASE_URL}/pre-shsat/chapters/${chapterNumber}/topics`;
  /* console.log("🔍 [filterActions] Topics URL:", url); */
  /* console.log("🔍 [filterActions] API_BASE_URL:", API_BASE_URL); */

  try {
    const result = await fetchWithCache<Topic[]>(
      url,
      { key: `filter_topics_${chapterNumber}`, forceRefresh },
    );
    /* console.log("🔍 [filterActions] fetchTopics result:", result); */
    return result;
  } catch (error) {
    console.error("🔍 [filterActions] fetchTopics error:", error);
    return { 
      data: [], 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      cached: false 
    };
  }
};

// Fetch subtopics for a specific topic
export const fetchSubTopics = async (
  params: FilterActionParams,
): Promise<ApiResponse<SubTopic[]>> => {
  const { topicId, forceRefresh = false } = params;

  /* console.log("🔍 [filterActions] fetchSubTopics called with params:", params); */
  /* console.log("🔍 [filterActions] topicId:", topicId); */
  /* console.log("🔍 [filterActions] forceRefresh:", forceRefresh); */

  if (!topicId) {
    /* console.log("🔍 [filterActions] No topicId, returning empty array"); */
    return { data: [], success: true, cached: false };
  }

  const url = `${API_BASE_URL}/pre-shsat/topics/${topicId}/sub-topics`;
  /* console.log("🔍 [filterActions] SubTopics URL:", url); */
  /* console.log("🔍 [filterActions] API_BASE_URL:", API_BASE_URL); */

  try {
    const result = await fetchWithCache<SubTopic[]>(
      url,
      { key: `filter_subtopics_${topicId}`, forceRefresh },
    );
    /* console.log("🔍 [filterActions] fetchSubTopics result:", result); */
    return result;
  } catch (error) {
    console.error("🔍 [filterActions] fetchSubTopics error:", error);
    return { 
      data: [], 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      cached: false 
    };
  }
};

// Fetch all passages
export const fetchPassages = async (
  forceRefresh = false,
): Promise<ApiResponse<Passage[]>> => {
  // Get user ID from auth store
  const { user } = useAuthStore.getState();
  const userId = user?.id;

  if (!userId) {
    return {
      data: [] as Passage[],
      success: false,
      error: "User not authenticated",
    };
  }

  return fetchWithCache<Passage[]>(`${API_BASE_URL}/passage-list`, {
    key: "filter_passages",
    forceRefresh,
  });
};

// Clear all filter-related cache
export const clearFilterCache = (): void => {
  const cacheKeys = ["filter_chapters", "filter_passages"];

  cacheKeys.forEach((key) => clearCachedData(key));

  // Clear topic and subtopic caches (they have dynamic keys)
  const { clearCache } = getCacheStore();
  // Note: In a real implementation, you might want to track these dynamic keys
  // For now, we'll clear them when the parent component unmounts or resets
};

// Clear specific filter cache
export const clearSpecificFilterCache = (
  filterKey: string,
  value?: string,
): void => {
  switch (filterKey) {
    case "chapter_number":
      if (value) {
        clearCachedData(`filter_topics_${value}`);
      }
      break;
    case "topic_id":
      if (value) {
        clearCachedData(`filter_subtopics_${value}`);
      }
      break;
    default:
      break;
  }
};

// Validation helpers
export const validateFilterValue = (
  value: string,
  filterKey: string,
): string | null => {
  if (!value.trim()) return null;

  switch (filterKey) {
    case "page_number":
    case "question_number":
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 1) {
        return "Must be a positive number";
      }
      break;
    case "chapter_number":
    case "topic_id":
    case "sub_topic_id":
      if (value && isNaN(parseInt(value, 10))) {
        return "Invalid selection";
      }
      break;
    default:
      break;
  }

  return null;
};
