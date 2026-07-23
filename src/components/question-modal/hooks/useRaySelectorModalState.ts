import { useState, useEffect } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { toast } from "sonner";
import type { TagSlot } from "../../shared/ChoiceTagEditor";
import { fetchChoiceTags, saveChoiceTags } from "../../../services/tagService";

export const useRaySelectorModalState = (
  initialValues: any,
  isOpen: boolean,
  onSave: (data: any) => void,
  isTestPack: boolean = false,
  subject: string = "",
  categoryId: string = ""
) => {
  // State
  const [rayPrompt, setRayPrompt] = useState("");
  const [numberlineMin, setNumberlineMin] = useState("");
  const [numberlineMax, setNumberlineMax] = useState("");
  const [tickInterval, setTickInterval] = useState("");
  const [rayType, setRayType] = useState("closed_right");
  const [rayEndpoint, setRayEndpoint] = useState("");
  const [rayExplanation, setRayExplanation] = useState("");
  const [selectedRayType, setSelectedRayType] = useState<string | null>(null);
  const [selectedRayEndpoint, setSelectedRayEndpoint] = useState<number | null>(null);
  const [rayDifficulty, setRayDifficulty] = useState<number>(1);
  const [hasPrefilled, setHasPrefilled] = useState(false);

  // Hierarchy fields for question bank
  const [rayChapter, setRayChapter] = useState<number | undefined>(undefined);
  const [rayTopic, setRayTopic] = useState<number | undefined>(undefined);
  const [raySubTopic, setRaySubTopic] = useState<number | undefined>(undefined);
  const [rayQuestionCategory, setRayQuestionCategory] = useState<string>("Practice");

  // Tagging state: Single array of slots for the ray question
  const [rayTagSlots, setRayTagSlots] = useState<TagSlot[]>([]);


  const rayTypes = [
    { value: "closed_left", label: "◀●" },
    { value: "open_left", label: "◀○" },
    { value: "open_right", label: "○▶" },
    { value: "closed_right", label: "●▶" },
  ];

  // Validation
  const raySelectorValid =
    typeof rayPrompt === "string" &&
    rayPrompt.trim().length > 0 &&
    numberlineMin !== "" &&
    numberlineMax !== "" &&
    tickInterval !== "" &&
    !isNaN(Number(numberlineMin)) &&
    !isNaN(Number(numberlineMax)) &&
    !isNaN(Number(tickInterval)) &&
    Number(numberlineMin) < Number(numberlineMax) &&
    Number(tickInterval) > 0 &&
    rayEndpoint !== "" &&
    !isNaN(Number(rayEndpoint)) &&
    Number(rayEndpoint) >= Number(numberlineMin) &&
    Number(rayEndpoint) <= Number(numberlineMax) &&
    !!rayType;

  // Prefill logic
  useEffect(() => {
    if (
      isOpen &&
      initialValues &&
      (initialValues.question_type === "RAY_SELECTOR" || initialValues.question_type_acronym === "RAY_SELECTOR" || initialValues.question_type === 49) &&
      !hasPrefilled
    ) {
      setRayPrompt(initialValues.question || "");
      setNumberlineMin(
        initialValues.numberline_min != null ? String(initialValues.numberline_min) : ""
      );
      setNumberlineMax(
        initialValues.numberline_max != null ? String(initialValues.numberline_max) : ""
      );
      setTickInterval(
        initialValues.tick_interval != null ? String(initialValues.tick_interval) : ""
      );
      setRayType(initialValues.ray_correct_type || "closed_right");
      setRayEndpoint(
        initialValues.ray_correct_position != null ? String(initialValues.ray_correct_position) : ""
      );
      setRayExplanation(initialValues.explanation || "");
      setSelectedRayType(initialValues.ray_correct_type || null);
      setSelectedRayEndpoint(initialValues.ray_correct_position ?? null);
      setRayDifficulty(initialValues.difficulty || 1);
      // Load hierarchy fields
      setRayChapter(initialValues.chapter_number);
      setRayTopic(initialValues.topic_id);
      setRaySubTopic(initialValues.sub_topic_id);
      setRayQuestionCategory(initialValues.question_category || "Practice");

      // Prefill Tags using question_id
      const type = isTestPack ? "test_pack" : "pre_shsat";
      const qId = initialValues.question_id || initialValues.id;
      if (qId) {
        fetchChoiceTags(qId, type).then(tags => {
          if (tags.length > 0) {
            setRayTagSlots(tags.map(t => ({
              tag_id: t.tag_id,
              tag_name: t.tag_name || "",
              tag_category: t.tag_category || "",
              rationale: t.rationale || ""
            })));
          }
        });
      }

      setHasPrefilled(true);

    }
  }, [isOpen, initialValues, hasPrefilled]);

  // Reset state when modal closes or when switching between questions
  useEffect(() => {
    if (!isOpen) {
      setHasPrefilled(false);
    }
  }, [isOpen]);

  // Reset state when initialValues change (switching between different questions)
  useEffect(() => {
    if (isOpen && initialValues) {
      setHasPrefilled(false);
    }
  }, [isOpen, initialValues?.question_id]);

  // Save logic
  const save = async () => {
    // Validate hierarchy fields for question bank questions
    if (!isTestPack && !initialValues) {
      if (!rayQuestionCategory) {
        toast.error("Question category is required.");
        return;
      }
      if (!rayChapter) {
        toast.error("Chapter is required.");
        return;
      }
      if (!rayTopic) {
        toast.error("Topic is required.");
        return;
      }
      if (!raySubTopic) {
        toast.error("Sub-topic is required.");
        return;
      }
    }

    if (!rayType || !rayEndpoint) {
      toast.error("Please select a ray type and enter an endpoint.");
      return;
    }
    if (!raySelectorValid) {
      toast.error("All fields are required and endpoint must be within bounds.");
      return;
    }
    try {
      const isEditing =
        initialValues &&
        initialValues.id &&
        (initialValues.question_type === "RAY_SELECTOR" || initialValues.question_type_acronym === "RAY_SELECTOR" || initialValues.question_type === 49);
      const basePayload = {
        question: rayPrompt,
        question_type: "RAY_SELECTOR",
        numberline_min: Number(numberlineMin),
        numberline_max: Number(numberlineMax),
        tick_interval: Number(tickInterval),
        ray_correct_type: rayType,
        ray_correct_position: Number(rayEndpoint),
        explanation: rayExplanation || null,
        difficulty: rayDifficulty || 1,
        subject: subject,
        ...(categoryId ? { question_category_id: Number(categoryId) } : {}),
        // Hierarchy fields - only include if they have values
        ...(rayQuestionCategory && { question_category: rayQuestionCategory }),
        ...(rayChapter && { chapter_number: rayChapter }),
        ...(rayTopic && { topic_id: rayTopic }),
        ...(raySubTopic && { sub_topic_id: raySubTopic }),
        ...(initialValues?.question_number && { question_number: initialValues.question_number }),
      };
      const payload = isEditing
        ? {
          ...basePayload,
          last_edited_by: useAuthStore.getState().getUserName(),
        }
        : {
          ...basePayload,
          created_by: useAuthStore.getState().getUserName(),
          last_edited_by: useAuthStore.getState().getUserName(),
        };
      let response;
      const baseUrl =
        import.meta.env.VITE_API_URL ||
        "https://eznnseebbi.execute-api.ap-southeast-2.amazonaws.com/dev";
      if (isTestPack || initialValues?.test_id) {
        const testId = initialValues?.test_id;
        const testPackPayload = {
          ...payload,
          test_id: testId,
          difficulty: payload.difficulty || 1,
          // Database constraint: if question_number exists, is_active must be true
          // If question_number is null, is_active should be false
          ...(payload.question_number
            ? { is_active: true }
            : (isEditing
              ? (initialValues?.is_active !== undefined ? { is_active: initialValues.is_active } : { is_active: false })
              : { is_active: false }
            )
          ),
        };
        if (!initialValues || !initialValues.question_id) {
          response = await fetch(`${baseUrl}/api/test-pack/ray-selector/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testPackPayload),
          });
        } else {
          response = await fetch(
            `${baseUrl}/api/test-pack/ray-selector/update/${initialValues.question_id}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(testPackPayload),
            }
          );
        }
      } else {
        if (isEditing) {
          response = await fetch(
            `${baseUrl}/api/ray-selector/update/${initialValues.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );
        } else {
          response = await fetch(`${baseUrl}/api/ray-selector/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to save Ray Selector question");
      }
      const data = await response.json();
      const savedQuestionId = data.question_id || data.id || data.question?.id || initialValues?.id || initialValues?.question_id;

      // Sync tags using question_id
      if (rayTagSlots.length > 0 && rayTagSlots.some(s => s.tag_name.trim())) {
        const type = isTestPack ? "test_pack" : "pre_shsat";
        const validTags = rayTagSlots
          .filter(s => s.tag_name.trim())
          .map((s, i) => ({
            tag_id: s.tag_id,
            tag_name: s.tag_name.trim(),
            tag_category: (s.tag_category || "").trim() || undefined,
            tag_order: (i + 1) as 1 | 2 | 3,
            rationale: s.rationale,
          }));
        let tagsFailed = false;
        await saveChoiceTags(savedQuestionId, type, validTags).catch(err => {
          console.warn("Ray Selector tag sync failed:", err);
          tagsFailed = true;
        });

        if (tagsFailed) {
          toast.warning("Question saved, but some reasoning patterns (tags) failed to save. Please review the tags.");
        }
      }

      toast.success(`Ray Selector question ${initialValues ? "updated" : "created"} successfully`);

      // Reset the prefill flag to allow fresh data loading
      setHasPrefilled(false);

      onSave(data);
      // Let the parent component handle closing the modal and refreshing the UI
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save Ray Selector question"
      );
    }
  };

  // Reset function to clear all state
  const resetState = () => {
    setRayPrompt("");
    setNumberlineMin("");
    setNumberlineMax("");
    setTickInterval("");
    setRayType("closed_right");
    setRayEndpoint("");
    setRayExplanation("");
    setSelectedRayType(null);
    setSelectedRayEndpoint(null);
    setRayDifficulty(1);
    // Reset hierarchy fields
    setRayChapter(undefined);
    setRayTopic(undefined);
    setRaySubTopic(undefined);
    setRayQuestionCategory("Practice");
    setRayTagSlots([]);
    setHasPrefilled(false);
  };

  return {
    rayPrompt,
    setRayPrompt,
    numberlineMin,
    setNumberlineMin,
    numberlineMax,
    setNumberlineMax,
    tickInterval,
    setTickInterval,
    rayType,
    setRayType,
    rayEndpoint,
    setRayEndpoint,
    rayExplanation,
    setRayExplanation,
    selectedRayType,
    setSelectedRayType,
    selectedRayEndpoint,
    setSelectedRayEndpoint,
    rayTypes,
    raySelectorValid,
    rayDifficulty,
    setRayDifficulty,
    // Hierarchy fields
    rayChapter,
    setRayChapter,
    rayTopic,
    setRayTopic,
    raySubTopic,
    setRaySubTopic,
    rayQuestionCategory,
    setRayQuestionCategory,
    // Tagging
    rayTagSlots,
    setRayTagSlots,
    save,
    resetState,
  };
} 