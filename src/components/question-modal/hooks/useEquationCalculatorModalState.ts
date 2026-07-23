import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchChoiceTags } from "../../../services/tagService";
import type { TagSlot } from "../../shared/ChoiceTagEditor";

export function useEquationCalculatorModalState(
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
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questionImageUrl, setQuestionImageUrl] = useState<string | undefined>(undefined);
  const [difficulty, setDifficulty] = useState(3);
  const [explanation, setExplanation] = useState("");
  const [hasPrefilled, setHasPrefilled] = useState(false);

  // Hierarchy fields for question bank
  const [eqChapter, setEqChapter] = useState<number | undefined>(undefined);
  const [eqTopic, setEqTopic] = useState<number | undefined>(undefined);
  const [eqSubTopic, setEqSubTopic] = useState<number | undefined>(undefined);
  const [eqQuestionCategory, setEqQuestionCategory] = useState<string>("Practice");

  // Tagging state
  const [eqTagSlots, setEqTagSlots] = useState<TagSlot[]>([]);

  // Prefill logic
  useEffect(() => {
    if (
      isOpen &&
      initialValues &&
      (initialValues.question_type === "EQUATION_CALCULATOR" || 
       initialValues.question_type_acronym === "EQUATION_CALCULATOR" ||
       initialValues.question_type === 51) && // Added 51 for Test Pack compatibility
      !hasPrefilled
    ) {
      /* console.log("🔍 [EquationModal] Prefilling from initialValues:", initialValues); */
      setQuestion(initialValues.question || "");
      
      // Handle correct answers (usually an array for equation calculator)
      if (initialValues.correct_answers && Array.isArray(initialValues.correct_answers) && initialValues.correct_answers.length > 0) {
        setCorrectAnswer(initialValues.correct_answers[0].answer || "");
      } else {
        setCorrectAnswer(initialValues.correct_answer || initialValues.answer || "");
      }
      
      setExplanation(initialValues.explanation || "");
      setQuestionImageUrl(initialValues.question_image_url || undefined);
      setDifficulty(initialValues.difficulty || 3);
      
      // Load hierarchy fields
      setEqChapter(initialValues.chapter_number);
      setEqTopic(initialValues.topic_id);
      setEqSubTopic(initialValues.sub_topic_id);
      setEqQuestionCategory(initialValues.question_category || "Practice");

      // Prefill Tags
      const qId = initialValues.question_id || initialValues.id;
      const type = istestpack ? "test_pack" : "pre_shsat";
      if (qId) {
        /* console.log(`🔍 [EquationModal] Fetching tags for ${type} question ID:`, qId); */
        fetchChoiceTags(qId, type)
          .then(tags => {
            if (tags && Array.isArray(tags) && tags.length > 0) {
              setEqTagSlots(tags.map(t => ({
                tag_id: t.tag_id,
                tag_name: t.tag_name || "",
                tag_category: t.tag_category || t.category || "",
                rationale: t.rationale || ""
              })));
            } else {
              setEqTagSlots([]);
            }
          })
          .catch(err => {
            console.warn("Failed to fetch equation tags", err);
            setEqTagSlots([]);
          })
          .finally(() => {
            setHasPrefilled(true);
          });
      } else {
        setEqTagSlots([]);
        setHasPrefilled(true);
      }
    }
  }, [isOpen, initialValues, hasPrefilled, istestpack]);

  // Reset state when creating new questions
  useEffect(() => {
    if (isOpen && !initialValues && !hasPrefilled) {
      /* console.log("🔍 [EquationModal] Initializing new equation question"); */
      setQuestion("");
      setCorrectAnswer("");
      setExplanation("");
      setQuestionImageUrl(undefined);
      setDifficulty(3);
      // Reset hierarchy fields
      setEqChapter(undefined);
      setEqTopic(undefined);
      setEqSubTopic(undefined);
      setEqQuestionCategory("Practice");
      setEqTagSlots([]);
      setHasPrefilled(true);
    }
  }, [isOpen, initialValues, hasPrefilled]);

  // Reset prefill flag when modal opens/closes or initialValues change
  useEffect(() => {
    if (isOpen) setHasPrefilled(false);
  }, [isOpen, initialValues]);

  // Validation
  const isValid = useMemo(() => {
    const hasQuestion = question.trim().length > 0;
    const hasAnswer = correctAnswer.trim().length > 0;
    // For question bank (not test pack), also require hierarchy fields if it's a new question
    const hasHierarchyFields = istestpack || initialValues || (eqChapter !== undefined && eqTopic !== undefined && eqSubTopic !== undefined);
    
    return hasQuestion && hasAnswer && hasHierarchyFields;
  }, [question, correctAnswer, eqChapter, eqTopic, eqSubTopic, istestpack, initialValues]);

  return {
    question,
    setQuestion,
    correctAnswer,
    setCorrectAnswer,
    questionImageUrl,
    setQuestionImageUrl,
    difficulty,
    setDifficulty,
    explanation,
    setExplanation,
    isValid,
    // Hierarchy fields
    eqChapter,
    setEqChapter,
    eqTopic,
    setEqTopic,
    eqSubTopic,
    setEqSubTopic,
    eqQuestionCategory,
    setEqQuestionCategory,
    // Tagging
    eqTagSlots,
    setEqTagSlots,
  };
}
