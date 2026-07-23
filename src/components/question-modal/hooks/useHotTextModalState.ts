import { useState, useEffect } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { toast } from "sonner";
import type { TagSlot } from "../../shared/ChoiceTagEditor";
import { saveChoiceTags, fetchBatchChoiceTags } from "../../../services/tagService";

import { fetchHotTextDetails as fetchAction, HotTextDetailsResponse } from "../../../actions/HotTextActions";


export function useHotTextModalState(
  initialValues: any,
  isOpen: boolean,
  onSave: (data: any) => void,
  onClose: () => void,
  istestpack: boolean,
  subject?: string,
  categoryId?: string
) {
  // State
  const [question, setQuestion] = useState("");
  const [prompt, setPrompt] = useState("");
  const [passage, setPassage] = useState("");
  const [minSelections, setMinSelections] = useState(1);
  const [maxSelections, setMaxSelections] = useState(1);
  const [regions, setRegions] = useState<any[]>([]);
  const [difficulty, setDifficulty] = useState<number>(3);
  const [hotTextExplanation, setHotTextExplanation] = useState("");
  const [hasPrefilled, setHasPrefilled] = useState(false);

  // Hierarchy fields for question bank
  const [hotTextChapter, setHotTextChapter] = useState<number | undefined>(undefined);
  const [hotTextTopic, setHotTextTopic] = useState<number | undefined>(undefined);
  const [hotTextSubTopic, setHotTextSubTopic] = useState<number | undefined>(undefined);
  const [hotTextQuestionCategory, setHotTextQuestionCategory] = useState<string>("Practice");

  // Tagging state: Map of region index (string) to its tag slots
  const [regionTagSlots, setRegionTagSlots] = useState<Record<string, TagSlot[]>>({});

  // Prefill logic
  useEffect(() => {
    if (
      isOpen &&
      initialValues &&
      (initialValues.question_type === "HOT_TEXT" || initialValues.question_type_acronym === "HOT_TEXT") &&
      !hasPrefilled
    ) {
      setQuestion(initialValues.question || "");
      setPrompt(initialValues.prompt || "");
      setPassage(initialValues.passage || initialValues.custom_passage || "");
      setMinSelections(initialValues.min_selections || 1);
      setMaxSelections(initialValues.max_selections || 1);
      setRegions(initialValues.regions || []);
      setDifficulty(initialValues.difficulty || 3);
      setHotTextExplanation(initialValues.explanation || "");
      // Load hierarchy fields
      setHotTextChapter(initialValues.chapter_number);
      setHotTextTopic(initialValues.topic_id);
      setHotTextSubTopic(initialValues.sub_topic_id);
      setHotTextQuestionCategory(initialValues.question_category || "Practice");

      // Prefill Tags for existing regions
      const type = istestpack ? "test_pack" : "pre_shsat";
      const qId = initialValues?.question_id || initialValues?.id;
      
      if (initialValues.regions && Array.isArray(initialValues.regions)) {
        const idsToFetch = initialValues.regions
          .map((region: any) => (istestpack && !region.id) ? `ht_${qId}_s${region.start_idx}_e${region.end_idx}` : region.id)
          .filter(Boolean);

        if (idsToFetch.length > 0) {
          fetchBatchChoiceTags(idsToFetch, type).then(batchData => {
            const newTagSlots: Record<string, TagSlot[]> = {};
            initialValues.regions.forEach((region: any, idx: number) => {
              const surrogateId = (istestpack && !region.id) ? `ht_${qId}_s${region.start_idx}_e${region.end_idx}` : region.id;
              const tags = batchData[String(surrogateId)] || [];
              if (tags.length > 0) {
                newTagSlots[idx] = tags.map(t => ({
                  tag_id: t.tag_id,
                  tag_name: t.tag_name || "",
                  tag_category: t.tag_category || "",
                  rationale: t.rationale || ""
                }));
              }
            });
            setRegionTagSlots(prev => ({ ...prev, ...newTagSlots }));
          });
        }
      }

      setHasPrefilled(true);
    }
  }, [isOpen, initialValues, hasPrefilled, istestpack]);

  // Reset state when creating new questions
  useEffect(() => {
    if (isOpen && !initialValues && !hasPrefilled) {
      setQuestion("");
      setPrompt("");
      setPassage("");
      setMinSelections(1);
      setMaxSelections(1);
      setRegions([]);
      setDifficulty(3);
      setHotTextExplanation("");
      setHasPrefilled(true);
    }
  }, [isOpen, initialValues, hasPrefilled]);

  useEffect(() => {
    if (isOpen) {
      setHasPrefilled(false);
      if (
        (initialValues?.question_id || initialValues?.id) &&
        (initialValues.question_type === "HOT_TEXT" || initialValues.question_type_acronym === "HOT_TEXT")
      ) {
        fetchHotTextDetails(initialValues, istestpack);
      }
    }
  }, [isOpen, initialValues, istestpack]);

  const fetchHotTextDetails = async (currentInitialValues: any, currentIsTestPack: boolean) => {
    const qId = currentInitialValues?.question_id || currentInitialValues?.id;
    if (!qId) return;

    try {
      const data: HotTextDetailsResponse = await fetchAction(qId, currentIsTestPack);
      
      // Standardized flat response always has regions at root
      const fetchedRegions = data.regions || [];
      setRegions(fetchedRegions);
      
      // Load tags for fetched regions in batch
      const type = currentIsTestPack ? "test_pack" : "pre_shsat";
      const idsToFetch = fetchedRegions.map((region) => region.id).filter(Boolean);

      
      if (idsToFetch.length > 0) {
        fetchBatchChoiceTags(idsToFetch, type).then(batchData => {
          const newTagSlots: Record<string, TagSlot[]> = {};
          fetchedRegions.forEach((region: any, idx: number) => {
            if (region.id) {
              const tags = batchData[String(region.id)] || [];
              if (tags.length > 0) {
                newTagSlots[idx] = tags.map(t => ({
                  tag_id: t.tag_id,
                  tag_name: t.tag_name || "",
                  tag_category: t.tag_category || "",
                  rationale: t.rationale || ""
                }));
              }
            }
          });
          setRegionTagSlots(prev => ({ ...prev, ...newTagSlots }));
        })
        .catch(err => console.warn("Failed to fetch hot text region tags", err));
      }
    } catch (err) {
      console.error("Error fetching Hot Text details:", err);
    }
  };

  // Validation
  const hotTextValid =
    question.trim().length > 0 &&
    passage.trim().length > 0 &&
    regions.length > 0 &&
    minSelections > 0 &&
    maxSelections >= minSelections;

  // Save logic
  const save = async () => {
    // Validate hierarchy fields for question bank questions
    if (!istestpack && !initialValues) {
      if (!hotTextQuestionCategory) {
        toast.error("Question category is required.");
        return;
      }
      if (!hotTextChapter) {
        toast.error("Chapter is required.");
        return;
      }
      if (!hotTextTopic) {
        toast.error("Topic is required.");
        return;
      }
      if (!hotTextSubTopic) {
        toast.error("Sub-topic is required.");
        return;
      }
    }

    const userName = useAuthStore.getState().getUserName();
    const baseUrl = import.meta.env.VITE_API_URL;
    try {
      let endpoint = "";
      let method = "POST";
      let payload: any = {};
      if (istestpack || initialValues?.test_id) {
        endpoint = initialValues?.question_id
          ? `${baseUrl}/api/test-pack/hot-text/update/${initialValues.question_id}`
          : `${baseUrl}/api/test-pack/hot-text/create`;
        method = initialValues?.question_id ? "PATCH" : "POST";
        payload = {
          question,
          custom_passage: passage,
          min_selections: minSelections,
          max_selections: maxSelections,
          regions: regions.map((region) => ({
            phrase: region.phrase,
            start_idx: region.start_idx,
            end_idx: region.end_idx,
            is_correct: region.is_correct,
          })),
          test_id: initialValues?.test_id,
          difficulty: difficulty || 3,
          created_by: userName,
          last_edited_by: userName,
          subject: subject,
          question_category_id: categoryId && categoryId !== "" ? Number(categoryId) : undefined,
          explanation: hotTextExplanation || null,
        };
      } else {
        endpoint = initialValues?.id
          ? `${baseUrl}/api/pre-shsat/hot-text-question/${initialValues.id}`
          : `${baseUrl}/api/pre-shsat/hot-text-question`;
        method = initialValues?.id ? "PATCH" : "POST";
        payload = {
          question,
          prompt,
          passage,
          min_selections: minSelections,
          max_selections: maxSelections,
          regions: regions.map((region) => ({
            phrase: region.phrase,
            start_idx: region.start_idx,
            end_idx: region.end_idx,
            is_correct: region.is_correct,
          })),
          created_by: userName,
          last_edited_by: userName,
          subject: subject || undefined,
          question_category_id: categoryId ? Number(categoryId) : undefined,
          // Hierarchy fields for question bank
          question_category: hotTextQuestionCategory,
          chapter_number: hotTextChapter,
          topic_id: hotTextTopic,
          sub_topic_id: hotTextSubTopic,
          difficulty: difficulty,
          explanation: hotTextExplanation || null,
        };
      }
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.detail || "Failed to save Hot Text question"
        );
      }
      const responseData = await response.json();
      // console.log("✅ Hot Text save successful, response data:", responseData);

      // Sync tags for each region
      const savedRegions = responseData.regions || responseData.hot_text_regions || responseData.hottext_regions || [];
      if (Array.isArray(savedRegions) && savedRegions.length > 0) {
        const type = istestpack ? "test_pack" : "pre_shsat";
        
        const tagPromises = savedRegions.map((region: any) => {

          // Find the original local index for this region to get its tags
          const localIdx = regions.findIndex(r =>
            Number(r.start_idx) === Number(region.start_idx) &&
            Number(r.end_idx) === Number(region.end_idx)
          );

          if (localIdx === -1) {
            console.warn("⚠️ Hot Text sync: could not find local region matching server region", region, "Local regions:", regions);
          }

          const slots = localIdx !== -1 ? (regionTagSlots[localIdx] || []) : [];
          if (slots.length > 0 && slots.some(s => s.tag_name.trim())) {
            const validTags = slots
              .filter(s => s.tag_name.trim())
              .map((s, i) => ({
                tag_id: s.tag_id,
                tag_name: s.tag_name.trim(),
                tag_category: (s.tag_category || "").trim() || undefined,
                tag_order: (i + 1) as 1 | 2 | 3,
                rationale: s.rationale,
              }));

            const targetId = region.id;
            // console.log(`🔍 [HotTextModal] Syncing tags for region using ID: ${targetId}`);
            return saveChoiceTags(targetId, type, validTags);
          }
          return Promise.resolve();
        });
        let tagsFailed = false;
        await Promise.all(tagPromises).catch(err => {
          console.warn("Hot Text tag sync failed:", err);
          tagsFailed = true;
        });

        if (tagsFailed) {
          toast.warning("Question saved, but some reasoning patterns (tags) failed to save. Please review the tags.");
        }
      }

      toast.success(
        `Hot Text question ${initialValues ? "updated" : "created"} successfully`
      );
      onSave(responseData);
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save Hot Text question"
      );
    }
  };

  return {
    question,
    setQuestion,
    prompt,
    setPrompt,
    save,
    passage,
    setPassage,
    minSelections,
    setMinSelections,
    maxSelections,
    setMaxSelections,
    regions,
    setRegions,
    difficulty,
    setDifficulty,
    hotTextValid,
    hotTextExplanation,
    setHotTextExplanation,
    initialValues: initialValues || {},
    // Hierarchy fields
    hotTextChapter,
    setHotTextChapter,
    hotTextTopic,
    setHotTextTopic,
    hotTextSubTopic,
    setHotTextSubTopic,
    hotTextQuestionCategory,
    setHotTextQuestionCategory,
    regionTagSlots,
    setRegionTagSlots,
  };
}