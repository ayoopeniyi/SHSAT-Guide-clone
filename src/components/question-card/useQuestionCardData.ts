import { useEffect, useRef, useState } from "react";
import { getQuestionTypeAcronym } from "./utils";
import { fetchBatchChoiceTags, ChoiceTag } from "../../services/tagService";

export function useQuestionCardData(question: any, context: "question-bank" | "test-pack") {
  const [tableGridData, setTableGridData] = useState<any>(null);
  const [loadingTableGrid, setLoadingTableGrid] = useState(false);
  const [raySelectorData, setRaySelectorData] = useState<any>(null);
  const [loadingRaySelector, setLoadingRaySelector] = useState(false);
  const [graphSelectorData, setGraphSelectorData] = useState<any>(null);
  const [loadingGraphSelector, setLoadingGraphSelector] = useState(false);
  const [dndData, setDndData] = useState<any>(null);
  const [loadingDnd, setLoadingDnd] = useState(false);
  const [testPackMCData, setTestPackMCData] = useState<any>(null);
  const [loadingTestPackMC] = useState(false);

  // Tag state — keyed by choice/cell/region/point id (string) for most types,
  // or by "rowIdx-colIdx" for TABLE_GRID,
  // or by String(questionId) for BLANK/RAY/CALC.
  const [choiceTags, setChoiceTags] = useState<Record<string, ChoiceTag[]>>({});
  const [hotTextRegions, setHotTextRegions] = useState<any[]>([]);

  const fetchedDataRef = useRef<Set<string>>(new Set());

  const questionId = question.id || (question as any).question_id;
  const questionType = getQuestionTypeAcronym(question);
  const questionUpdatedAt = question.updated_at || question.created_at || "";
  // Include content hash or length to ensure it reacts if updated_at is missing
  const contentSeed = `${(question.question || "").length}_${(question.passage || "").length}`;
  const questionKey = `${questionId}_${questionType}_${context}_${questionUpdatedAt}_${contentSeed}`;
  const choiceType = context === "test-pack" ? "test_pack" : "pre_shsat";

  // ── Type-specific data fetching (guarded by fetchedDataRef) ──────────────

  useEffect(() => {
    if (fetchedDataRef.current.has(questionKey)) return;

    if (questionType === "TABLE_GRID") {
      const hasAllFields = (question as any).row_labels && (question as any).column_labels && (question as any).answer_matrix?.length > 0 && (question as any).answer_matrix?.[0]?.id !== undefined;
      if (!hasAllFields) {
        setLoadingTableGrid(true);
        const isTestPack = (question as any).test_id !== undefined;
        const endpoint = isTestPack
          ? `${import.meta.env.VITE_API_URL}/api/test-pack/table-grid/get/${(question as any).question_id}`
          : `${import.meta.env.VITE_API_URL}/api/table-grid-questions/get-details/${question.id}`;
        fetch(endpoint, { cache: 'no-store' })
          .then((res) => res.json())
          .then((data) => { setTableGridData(data); setLoadingTableGrid(false); fetchedDataRef.current.add(questionKey); })
          .catch(() => { setLoadingTableGrid(false); fetchedDataRef.current.add(questionKey); });
      } else {
        setTableGridData(question);
        fetchedDataRef.current.add(questionKey);
      }
    } else if (questionType === "RAY_SELECTOR") {
      const hasAllFields = question.numberline_min !== undefined && question.numberline_max !== undefined && question.tick_interval !== undefined;
      if (!hasAllFields) {
        setLoadingRaySelector(true);
        const endpoint = (context === "test-pack" && (question as any).test_id && (question as any).question_id)
          ? `${import.meta.env.VITE_API_URL}/api/test-pack/ray-selector/get/${(question as any).question_id}`
          : `${import.meta.env.VITE_API_URL}/api/ray-selector/get/${question.id}`;
        fetch(endpoint, { cache: 'no-store' })
          .then((res) => res.json())
          .then((data) => { setRaySelectorData(data); setLoadingRaySelector(false); fetchedDataRef.current.add(questionKey); })
          .catch(() => { setLoadingRaySelector(false); fetchedDataRef.current.add(questionKey); });
      } else {
        setRaySelectorData(question);
        fetchedDataRef.current.add(questionKey);
      }
    } else if (questionType === "GRAPH_SELECTOR") {
      const hasAllFields = (question as any).x_min !== undefined && (question as any).x_max !== undefined && (question as any).y_min !== undefined && (question as any).y_max !== undefined && (question as any).points?.length > 0 && (question as any).points?.[0]?.id !== undefined;
      if (!hasAllFields) {
        setLoadingGraphSelector(true);
        const endpoint = (context === "test-pack" && (question as any).test_id && (question as any).question_id)
          ? `${import.meta.env.VITE_API_URL}/api/test-pack-graph-selector/get/${(question as any).question_id}`
          : `${import.meta.env.VITE_API_URL}/api/graph-selector/get-details/${question.id}`;
        fetch(endpoint, { cache: 'no-store' })
          .then((res) => res.json())
          .then((data) => { setGraphSelectorData(data); setLoadingGraphSelector(false); fetchedDataRef.current.add(questionKey); })
          .catch(() => { setLoadingGraphSelector(false); fetchedDataRef.current.add(questionKey); });
      } else {
        setGraphSelectorData({ ...question, graph_instruction: (question as any).graph_instruction || "", points: (question as any).points || [] });
        fetchedDataRef.current.add(questionKey);
      }
    } else if (questionType === "DND") {
      const hasAllFields = (question as any).buckets && (question as any).choices && (question as any).assignments;
      if (!hasAllFields) {
        setLoadingDnd(true);

        const getDndEndpoint = async () => {
          if (context === "test-pack" && (question as any).test_id && (question as any).question_id) {
            return `${import.meta.env.VITE_API_URL}/api/test-pack/dnd/get/${(question as any).question_id}`;
          } else {
            const questionResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/pre-shsat/questions/${question.id}`, { cache: 'no-store' });
            if (!questionResponse.ok) throw new Error("Failed to fetch question details");
            const questionData = await questionResponse.json();

            let endpoint = `${import.meta.env.VITE_API_URL}/api/pre-shsat/dnd-questions/${question.id}`;

            if (questionData.question_subtype) {
              switch (questionData.question_subtype) {
                case "table_dnd":
                  endpoint = `${import.meta.env.VITE_API_URL}/api/pre-shsat/dnd-questions/table_dnd/${question.id}`;
                  break;
                case "two_buckets_multi":
                  endpoint = `${import.meta.env.VITE_API_URL}/api/pre-shsat/dnd-questions/dnd_multi/${question.id}`;
                  break;
                case "one_bucket_multi":
                  endpoint = `${import.meta.env.VITE_API_URL}/api/pre-shsat/dnd-questions/dnd_one_bucket_multi/${question.id}`;
                  break;
                case "one_bucket_single":
                  endpoint = `${import.meta.env.VITE_API_URL}/api/pre-shsat/dnd-questions/dnd_one_bucket_single/${question.id}`;
                  break;
                default:
                  endpoint = `${import.meta.env.VITE_API_URL}/api/pre-shsat/dnd-questions/${question.id}`;
                  break;
              }
            }
            return endpoint;
          }
        };

        getDndEndpoint()
          .then(endpoint => fetch(endpoint, { cache: 'no-store' }))
          .then((res) => res.json())
          .then((data) => {
            const structuredData = {
              ...data.question,
              buckets: data.buckets,
              choices: data.choices,
              assignments: data.assignments
            };
            setDndData(structuredData);
            setLoadingDnd(false);
            fetchedDataRef.current.add(questionKey);
          })
          .catch(() => { setLoadingDnd(false); fetchedDataRef.current.add(questionKey); });
      } else {
        setDndData(question);
        fetchedDataRef.current.add(questionKey);
      }
    } else if (context === "test-pack" && questionType === "MC") {
      setTestPackMCData(question);
      fetchedDataRef.current.add(questionKey);
    }
  }, [questionKey, questionType, context]);

  // ── Tag fetching effects (no fetchedDataRef guard — always re-fetch on mount) ──

  // MC / MA — tags per answer choice
  useEffect(() => {
    if (!["MC", "MA"].includes(questionType)) return;
    const choices = (question.choices || []) as any[];
    const ids = choices.map((c: any) => c.id).filter(Boolean);
    if (!ids.length) return;
    fetchBatchChoiceTags(ids, choiceType).then(setChoiceTags).catch(() => { });
  }, [questionId, questionType, choiceType, questionUpdatedAt]);

  // DND — tags per draggable choice (loaded after dndData resolves)
  useEffect(() => {
    if (questionType !== "DND" || !dndData?.choices) return;
    const ids = (dndData.choices as any[]).map((c: any) => c.id).filter(Boolean);
    if (!ids.length) return;
    fetchBatchChoiceTags(ids, choiceType).then(setChoiceTags).catch(() => { });
  }, [questionId, questionType, dndData, choiceType]);

  // TABLE_GRID — tags per answer cell (keyed by String(cell.id), loaded after tableGridData resolves)
  useEffect(() => {
    if (questionType !== "TABLE_GRID" || !tableGridData?.answer_matrix) return;
    const matrix = tableGridData.answer_matrix as any[];
    const cellsWithIds = matrix.filter((cell: any) => cell.id != null);
    if (!cellsWithIds.length) return;
    const ids = cellsWithIds.map((cell: any) => cell.id);
    fetchBatchChoiceTags(ids, choiceType).then(setChoiceTags).catch(() => { });
  }, [questionId, questionType, tableGridData, choiceType]);

  // HOT_TEXT — fetch regions with DB IDs, then tags per region
  useEffect(() => {
    if (questionType !== "HOT_TEXT") return;
    if (!questionId) return;

    // Use content-based dependencies to ensure reactivity even if updated_at is missing
    const contentHash = `${question.question || ""}${question.passage || ""}${(question.regions || []).length}`;
    // For test-pack, the backend queries test_pack_questions by question_id column (not id PK)
    const hotTextId = context === "test-pack" ? ((question as any).question_id || questionId) : questionId;
    const endpoint = context === "test-pack"
      ? `${import.meta.env.VITE_API_URL}/api/test-pack/hot-text/get/${hotTextId}`
      : `${import.meta.env.VITE_API_URL}/api/pre-shsat/hot-text-question/${questionId}`;
    fetch(endpoint, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return undefined;
        const regions = data.regions || [];
        setHotTextRegions(regions);
        const ids = regions.map((r: any) => r.id).filter(Boolean);
        if (!ids.length) return undefined;
        return fetchBatchChoiceTags(ids, choiceType);
      })
      .then((tags) => { if (tags) setChoiceTags(tags); })
      .catch(() => { });
  }, [questionId, questionType, choiceType, questionUpdatedAt, context, question.question, question.passage, question.regions]);

  // GRAPH_SELECTOR — tags per selectable point (loaded after graphSelectorData resolves)
  useEffect(() => {
    if (questionType !== "GRAPH_SELECTOR" || !graphSelectorData?.points) return;
    const points = (graphSelectorData.points || []) as any[];
    const ids = points.map((p: any) => p.id).filter(Boolean);
    if (!ids.length) return;
    fetchBatchChoiceTags(ids, choiceType).then(setChoiceTags).catch(() => { });
  }, [questionId, questionType, graphSelectorData, choiceType]);

  // BLANK / RAY_SELECTOR / EQUATION_CALCULATOR — question-level tags (questionId as choice_id)
  // In test-pack, tags may be stored under question.question_id instead of question.id —
  // fetch both and remap to questionId key so the display lookup always works.
  useEffect(() => {
    if (!["BLANK", "RAY_SELECTOR", "EQUATION_CALCULATOR"].includes(questionType)) return;
    if (!questionId) return;
    const altId = context === "test-pack" ? (question as any).question_id : undefined;
    const ids = altId != null && String(altId) !== String(questionId) ? [questionId, altId] : [questionId];
    fetchBatchChoiceTags(ids, choiceType)
      .then((result) => {
        if (altId != null && String(altId) !== String(questionId) &&
          (result[String(altId)]?.length ?? 0) > 0 && !(result[String(questionId)]?.length)) {
          setChoiceTags({ ...result, [String(questionId)]: result[String(altId)] });
        } else {
          setChoiceTags(result);
        }
      })
      .catch(() => { });
  }, [questionId, questionType, choiceType, questionUpdatedAt]);

  useEffect(() => () => { if (fetchedDataRef.current.has(questionKey)) fetchedDataRef.current.delete(questionKey); }, [questionKey]);

  return {
    tableGridData,
    loadingTableGrid,
    raySelectorData,
    loadingRaySelector,
    graphSelectorData,
    loadingGraphSelector,
    dndData,
    loadingDnd,
    testPackMCData,
    loadingTestPackMC,
    choiceTags,
    hotTextRegions,
    questionId,
  };
}
