import { useState, useCallback, useMemo, useEffect } from 'react';
import type { TagSlot } from '../../shared/ChoiceTagEditor';
import { fetchChoiceTags } from '../../../services/tagService';

export interface EquationCalculatorState {
  question: string;
  correctAnswer: string;
  questionImageUrl?: string;
  difficulty: number;
  explanation: string;
  isValid: boolean;
  // Hierarchy fields for question bank
  eqChapter?: number;
  eqTopic?: number;
  eqSubTopic?: number;
  eqQuestionCategory?: string;
  // Context for validation
  isTestPack?: boolean;
  // Tag Prefill Tracking
  hasPrefilledTags?: boolean;
}

export const useEquationCalculatorState = (isTestPack: boolean = false) => {
  const [question, setQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [questionImageUrl, setQuestionImageUrl] = useState<string | undefined>(undefined);
  const [difficulty, setDifficulty] = useState(3);
  const [explanation, setExplanation] = useState('');

  // Hierarchy fields for question bank
  const [eqChapter, setEqChapter] = useState<number | undefined>(undefined);
  const [eqTopic, setEqTopic] = useState<number | undefined>(undefined);
  const [eqSubTopic, setEqSubTopic] = useState<number | undefined>(undefined);
  const [eqQuestionCategory, setEqQuestionCategory] = useState<string>("Practice");

  // Tagging state: Single array of slots for the equation question
  const [eqTagSlots, setEqTagSlots] = useState<TagSlot[]>([]);

  // Debug hierarchy field changes
  const debugSetEqChapter = (value: number | undefined) => {
    // console.log("🔍 [useEquationCalculatorState] setEqChapter called with:", value);
    setEqChapter(value);
  };

  const debugSetEqTopic = (value: number | undefined) => {
    // console.log("🔍 [useEquationCalculatorState] setEqTopic called with:", value);
    setEqTopic(value);
  };

  const debugSetEqSubTopic = (value: number | undefined) => {
    // console.log("🔍 [useEquationCalculatorState] setEqSubTopic called with:", value);
    setEqSubTopic(value);
  };

  const debugSetEqQuestionCategory = (value: string) => {
    // console.log("🔍 [useEquationCalculatorState] setEqQuestionCategory called with:", value);
    setEqQuestionCategory(value);
  };

  // Debug initial state
  /* console.log("🔍 [useEquationCalculatorState] Initial state:", {
    question: question?.length,
    correctAnswer: correctAnswer?.length,
    questionTrimmed: question.trim().length,
    correctAnswerTrimmed: correctAnswer.trim().length,
    hierarchyFields: {
      eqChapter,
      eqTopic,
      eqSubTopic,
      eqQuestionCategory
    }
  }); */

  // Validation - use useMemo to make it reactive
  const isValid = useMemo(() => {
    // Require both question and answer to have content
    const hasQuestion = question.trim().length > 0;
    const hasAnswer = correctAnswer.trim().length > 0;

    // For question bank (not test pack), also require hierarchy fields
    const hasHierarchyFields = isTestPack || (eqChapter !== undefined && eqTopic !== undefined && eqSubTopic !== undefined);

    const valid = hasQuestion && hasAnswer && hasHierarchyFields;

    /* console.log("🔍 [useEquationCalculatorState] Validation check:", {
      question: question?.length,
      correctAnswer: correctAnswer?.length,
      questionTrimmed: question.trim().length,
      correctAnswerTrimmed: correctAnswer.trim().length,
      hasQuestion,
      hasAnswer,
      difficulty,
      hasHierarchyFields,
      isTestPack,
      hierarchyFields: {
        eqChapter,
        eqTopic,
        eqSubTopic,
        eqQuestionCategory
      },
      isValid: valid
    }); */
    return valid;
  }, [question, correctAnswer, eqChapter, eqTopic, eqSubTopic, isTestPack, difficulty]);

  // Reset state
  const resetState = useCallback(() => {
    setQuestion('');
    setCorrectAnswer('');
    setQuestionImageUrl(undefined);
    setDifficulty(3);
    setExplanation('');
    // Reset hierarchy fields
    setEqChapter(undefined);
    setEqTopic(undefined);
    setEqSubTopic(undefined);
    setEqQuestionCategory("Practice");
    setEqTagSlots([]);
  }, []);

  // Set initial values (for editing)
  const setInitialValues = useCallback((values: Partial<EquationCalculatorState>) => {
    if (values.question !== undefined) setQuestion(values.question);
    if (values.correctAnswer !== undefined) setCorrectAnswer(values.correctAnswer);
    if (values.questionImageUrl !== undefined) setQuestionImageUrl(values.questionImageUrl);
    if (values.difficulty !== undefined) setDifficulty(values.difficulty);
    if (values.explanation !== undefined) setExplanation(values.explanation);
    // Set hierarchy fields
    if (values.eqChapter !== undefined) setEqChapter(values.eqChapter);
    if (values.eqTopic !== undefined) setEqTopic(values.eqTopic);
    if (values.eqSubTopic !== undefined) setEqSubTopic(values.eqSubTopic);
    if (values.eqQuestionCategory !== undefined) setEqQuestionCategory(values.eqQuestionCategory);

    // Prefill Tags using questionId if not already fetched
    const qId = values.isTestPack ? (values as any).questionId : (values as any).id;
    const type = values.isTestPack ? "test_pack" : "pre_shsat";
    if (qId && !values.hasPrefilledTags) {
      fetchChoiceTags(qId, type).then(tags => {
        if (tags.length > 0) {
          setEqTagSlots(tags.map(t => ({
            tag_id: t.tag_id,
            tag_name: t.tag_name || "",
            tag_category: t.tag_category || "",
            rationale: t.rationale || ""
          })));
        }
      })
        .catch(err => console.error("Failed to fetch equation tags:", err));
    }
  }, []);

  return {
    // State
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

    // Hierarchy fields
    eqChapter,
    setEqChapter: debugSetEqChapter,
    eqTopic,
    setEqTopic: debugSetEqTopic,
    eqSubTopic,
    setEqSubTopic: debugSetEqSubTopic,
    eqQuestionCategory,
    setEqQuestionCategory: debugSetEqQuestionCategory,

    // Tagging
    eqTagSlots,
    setEqTagSlots,

    // Computed
    isValid,

    // Actions
    resetState,
    setInitialValues,
  };
};