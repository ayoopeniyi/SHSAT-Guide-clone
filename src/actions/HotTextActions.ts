// HotTextActions.ts

export const updateHotTextQuestion = async (
  questionId: number,
  data: any,
  userName: string
) => {
  const apiBase = import.meta.env.VITE_API_URL;
  const payload = { ...data, last_edited_by: userName };
  const response = await fetch(
    `${apiBase}/api/hot-text-question/${questionId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) throw new Error("Failed to update HOT_TEXT question");
  return response.json();
};

export interface HotTextRegion {
  id: number;
  phrase: string;
  start_idx: number;
  end_idx: number;
  is_correct: boolean;
  question_id?: number;
}

export interface HotTextDetailsResponse {
  id: number;
  question_id?: number;
  question: string;
  prompt?: string;
  passage?: string;
  custom_passage?: string;
  min_selections: number;
  max_selections: number;
  regions: HotTextRegion[];
  explanation?: string | null;
  difficulty?: number;
  test_id?: number;
  question_type?: string;
  created_by?: string;
  last_edited_by?: string;
  [key: string]: any; // Allow for other question fields
}

/**
 * Fetch full Hot Text question details including regions WITH their DB IDs.
 * This is required before opening the edit modal so existing tags can be prefilled.
 * The returned object merges question fields and a `regions` array where each
 * region has an `id` (the `hot_text_regions` primary key) used for tag lookup.
 */
export const fetchHotTextDetails = async (questionId: number, isTestPack: boolean = false): Promise<HotTextDetailsResponse> => {
  const apiBase = import.meta.env.VITE_API_URL;
  const endpoint = isTestPack 
    ? `${apiBase}/api/test-pack/hot-text/get/${questionId}`
    : `${apiBase}/api/pre-shsat/hot-text-question/${questionId}`;

  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`Failed to fetch hot text details for id=${questionId}`);
  
  const data = await res.json();

  // Standardize response: Test Pack nests question fields, Pre-SHSAT flattens them
  if (isTestPack && data.question) {
    return {
      ...data.question,
      regions: data.regions || [],
    };
  }

  return data;
};