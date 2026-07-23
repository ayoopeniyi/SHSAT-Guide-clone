/**
 * tagService.ts
 *
 * API client for the Answer Choice Tagging system.
 * 
 * Schema:
 *   public.pre_shsat_tags / public.pre_shsat_answer_choice_tags (choice_id INT)
 *   dev.test_pack_tags / dev.test_pack_answer_choice_tags (choice_id UUID)
 *
 * Tags are free-form: teachers define their own names & categories.
 */
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ChoiceType = "pre_shsat" | "test_pack";

export interface TagDefinition {
  id: string;
  name: string;
  description?: string;
  category?: string;
  is_active: boolean;
}

export interface ChoiceTag {
  category: string | undefined;
  id?: string;
  choice_id: string | number;
  tag_id?: string;
  tag_name: string;
  tag_category?: string;
  tag_order: 1 | 2 | 3;
  rationale?: string;
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Fetch available tags for autocomplete suggestions.
 */
export async function fetchAvailableTags(choiceType: ChoiceType = "pre_shsat"): Promise<TagDefinition[]> {
  try {
    const res = await fetch(`${API_URL}/api/tags?choice_type=${choiceType}&is_active=true`);
    if (!res.ok) {
      const errorText = await res.text();
      // console.error("[tagService] fetchAvailableTags failed:", errorText);
      toast.error("Failed to fetch available tags. Please try again.");
      return [];
    }
    return await res.json();
  } catch (err) {
    // console.error("[tagService] fetchAvailableTags error:", err);
    toast.error("Failed to fetch available tags. Please try again.");
    return [];
  }
}

/**
 * Fetch existing tags for a specific answer choice.
 */
export async function fetchChoiceTags(
  choiceId: string | number,
  choiceType: ChoiceType,
): Promise<ChoiceTag[]> {
  try {
    const res = await fetch(
      `${API_URL}/api/choices/${choiceType}/${choiceId}/tags`,
    );
    if (!res.ok) {
      const errorText = await res.text();
      // console.error("[tagService] fetchChoiceTags failed:", errorText);
      toast.error("Failed to fetch choice tags.");
      return [];
    }
    return await res.json();
  } catch (err) {
    // console.error("[tagService] fetchChoiceTags error:", err);
    toast.error("Failed to fetch choice tags.");
    return [];
  }
}

/**
 * Fetch tags for multiple choices in one batch request.
 */
export async function fetchBatchChoiceTags(
  choiceIds: Array<string | number>,
  choiceType: ChoiceType,
): Promise<Record<string, ChoiceTag[]>> {
  if (choiceIds.length === 0) return {};
  
  try {
    const res = await fetch(`${API_URL}/api/choices/${choiceType}/tags/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice_ids: choiceIds }),
    });
    
    if (!res.ok) {
      throw new Error(`Batch fetch error: ${res.statusText}`);
    }
    
    return await res.json();
  } catch (err) {
    // console.error("[tagService] fetchBatchChoiceTags error:", err);
    toast.error("Failed to fetch tags for some choices.");
    return {};
  }
}

/**
 * Save (replace) all tags for a specific answer choice.
 * Creates the tag in backend if name is new.
 * Standardized signature: (id, type, tags).
 */
export async function saveChoiceTags(
  choiceId: string | number,
  choiceType: ChoiceType,
  tags: Array<{
    tag_id?: string;
    tag_name: string;
    tag_category?: string;
    tag_order: 1 | 2 | 3;
    rationale?: string;
  }>,
): Promise<ChoiceTag[]> {
  try {
    const payload = tags.slice(0, 3).map((t, i) => ({
      tag_id: t.tag_id || null,
      tag_name: t.tag_name.trim(),
      tag_category: t.tag_category?.trim() || null,
      tag_order: t.tag_order || (i + 1) as 1 | 2 | 3,
      rationale: t.rationale || "",
    }));

    const res = await fetch(
      `${API_URL}/api/choices/${choiceType}/${choiceId}/tags/bulk`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      const errorText = await res.text();
      // console.error("[tagService] Save failed:", errorText);
      toast.error("Failed to save tags. Please try again.");
      throw new Error(`Failed to save tags: ${errorText}`);
    }
    return await res.json();
  } catch (err) {
    // console.error("[tagService] Save error:", err);
    toast.error("Failed to save tags. Please try again.");
    throw err;
  }
}
