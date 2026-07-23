import { useState, useEffect, useCallback } from "react";
import type { TagSlot } from "../../shared/ChoiceTagEditor";
import { fetchChoiceTags } from "../../../services/tagService";

export type BlankVariant = "placeholder" | "fill_box";

export const useBlankState = () => {
  const [blankQuestion, setBlankQuestion] = useState("");
  const [blankCorrectAnswer, setBlankCorrectAnswer] = useState("");
  const [blankExplanation, setBlankExplanation] = useState("");
  const [blankVariant, setBlankVariant] = useState<BlankVariant>("placeholder");
  
  // Tagging state
  const [choiceTagSlots, setChoiceTagSlots] = useState<TagSlot[]>([]);

  const blankValid =
    typeof blankQuestion === "string" && blankQuestion.trim().length > 0;

  const resetBlankState = useCallback(() => {
    setBlankQuestion("");
    setBlankCorrectAnswer("");
    setBlankExplanation("");
    setBlankVariant("placeholder");
    setChoiceTagSlots([]);
  }, []);

  // Effect to load initial values (moved from QuestionModalModular if needed, 
  // but for now we just handle the tag slots fetch if we have an ID)
  const loadTags = useCallback(async (id: string | number, type: "test_pack" | "pre_shsat") => {
    try {
      const tags = await fetchChoiceTags(id, type);
      if (tags.length > 0) {
        setChoiceTagSlots(tags.map(t => ({
          tag_id: t.tag_id,
          tag_name: t.tag_name || "",
          tag_category: t.tag_category || "",
          rationale: t.rationale || ""
        })));
      }
    } catch (err) {
      console.warn("Failed to load tags for blank question:", err);
    }
  }, []);

  return {
    blankQuestion,
    setBlankQuestion,
    blankCorrectAnswer,
    setBlankCorrectAnswer,
    blankExplanation,
    setBlankExplanation,
    blankVariant,
    setBlankVariant,
    blankValid,
    resetBlankState,
    choiceTagSlots,
    setChoiceTagSlots,
    loadTags,
  };
};
