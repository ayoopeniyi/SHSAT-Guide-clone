import { useState, useEffect, useRef, useCallback } from 'react';
import { useCacheStore } from '../../../stores/cacheStore';
import { fetchQuestions } from '../../../actions/QuestionBankActions';
import type { Question } from '../../../types/questionBank';

interface UseQuestionBankDataProps {
  searchDebounced: string;
  currentPage: number;
  questionsPerPage: number;
  filtersInitialLoading: boolean;
  handleFilterApply: (
    callback: (params: URLSearchParams) => Promise<any>,
    search?: string,
    pagination?: { page: number; per_page: number }
  ) => Promise<void>;
}

export const useQuestionBankData = ({
  searchDebounced,
  currentPage,
  questionsPerPage,
  filtersInitialLoading,
  handleFilterApply,
}: UseQuestionBankDataProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalChapters, setTotalChapters] = useState(0);
  const [totalPassages, setTotalPassages] = useState(0);
  const [displayPassages, setDisplayPassages] = useState<any[]>([]);
  const [isShowingPassages, setIsShowingPassages] = useState(false);

  const setCache = useCacheStore((s) => s.setCache);
  const getCache = useCacheStore((s) => s.getCache);
  const clearCache = useCacheStore((s) => s.clearCache);
  const abortControllerRef = useRef<AbortController | null>(null);
  const handleFilterApplyRef = useRef(handleFilterApply);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update the ref when handleFilterApply changes
  useEffect(() => {
    handleFilterApplyRef.current = handleFilterApply;
  }, [handleFilterApply]);

  // Cache keys
  const questionsCacheKey = "questionBankQuestions";
  const totalQuestionsCacheKey = "questionBankTotalQuestions";

  const setFromData = useCallback((data: any) => {
    if ('passages' in data) {
      setDisplayPassages(data.passages || []);
      setTotalPassages(data.total || 0);
      setQuestions([]);
      setTotalQuestions(0);
      setIsShowingPassages(true);
    } else {
      setQuestions(data.questions || []);
      setTotalQuestions(data.total || 0);
      setDisplayPassages([]);
      setTotalPassages(0);
      setIsShowingPassages(false);
    }
  }, []);

  const fetchQuestionsData = useCallback(async (skipCache = false) => {
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Don't fetch if already loading
    if (loading) {
      return;
    }

    // Debounce the fetch to prevent rapid calls
    fetchTimeoutRef.current = setTimeout(async () => {
      await handleFilterApplyRef.current(
        async (params: URLSearchParams) => {
          try {
            setLoading(true);
            if (abortControllerRef.current) {
              abortControllerRef.current.abort();
            }
            const controller = new AbortController();
            abortControllerRef.current = controller;

            // Per-page cache key using params
            const cacheKey = `qb:${params.toString()}`;
            if (skipCache) {
              clearCache(cacheKey);
            }
            const cached = getCache(cacheKey);
            if (cached && !skipCache) {
              setFromData(cached);
            }

            const data = await fetchQuestions(params);

            // Check if we're getting passages or questions
            setFromData(data);
            setCache(cacheKey, data);
            // keep legacy caches for any other consumers
            if ('passages' in data) {
              setCache(questionsCacheKey, data.passages || []);
              setCache(totalQuestionsCacheKey, data.total || 0);
            } else {
              setCache(questionsCacheKey, data.questions || []);
              setCache(totalQuestionsCacheKey, data.total || 0);
            }

            // Prefetch next page in background
            const currPage = Number(params.get('page') || currentPage || 1);
            const nextParams = new URLSearchParams(params.toString());
            nextParams.set('page', String(currPage + 1));
            const nextKey = `qb:${nextParams.toString()}`;
            if (!getCache(nextKey)) {
              fetchQuestions(nextParams).then((nextData) => {
                setCache(nextKey, nextData);
              }).catch(() => { });
            }
          } catch (err) {
            if (err instanceof DOMException && err.name === "AbortError") {
              return;
            }
            setError(
              err instanceof Error ? err.message : "Failed to load questions",
            );
          } finally {
            setLoading(false);
          }
        },
        searchDebounced,
        { page: currentPage, per_page: questionsPerPage },
      );
    }, 300); // 300ms debounce
  }, [searchDebounced, currentPage, questionsPerPage, setCache]); // REMOVED loading

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const clearCacheAndRefresh = useCallback(() => {
    clearCache(questionsCacheKey);
    clearCache(totalQuestionsCacheKey);
    fetchQuestionsData(true); // true to skip cache
  }, [clearCache, fetchQuestionsData]);

  const resetToFirstPage = useCallback(() => {
    // This would need to be handled by the parent component
    // since page state is managed there
  }, []);

  // Immediate fetch on page change (no debounce), keep-previous-data UX
  useEffect(() => {
    if (filtersInitialLoading) return;
    const run = async () => {
      try {
        setIsFetchingPage(true);
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        await handleFilterApplyRef.current(
          async (params: URLSearchParams) => {
            const cacheKey = `qb:${params.toString()}`;
            const cached = getCache(cacheKey);
            if (cached) {
              setFromData(cached);
            }

            const data = await fetchQuestions(params);
            setFromData(data);
            setCache(cacheKey, data);
            if ('passages' in data) {
              setCache("questionBankQuestions", data.passages || []);
              setCache("questionBankTotalQuestions", data.total || 0);
            } else {
              setCache("questionBankQuestions", data.questions || []);
              setCache("questionBankTotalQuestions", data.total || 0);
            }

            // Prefetch next page
            const currPage = Number(params.get('page') || currentPage || 1);
            const nextParams = new URLSearchParams(params.toString());
            nextParams.set('page', String(currPage + 1));
            const nextKey = `qb:${nextParams.toString()}`;
            if (!getCache(nextKey)) {
              fetchQuestions(nextParams).then((nextData) => {
                setCache(nextKey, nextData);
              }).catch(() => { });
            }
          },
          searchDebounced,
          { page: currentPage, per_page: questionsPerPage },
        );
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setError(err instanceof Error ? err.message : "Failed to load questions");
        }
      } finally {
        setIsFetchingPage(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Debounced fetch on search/filter changes
  useEffect(() => {
    if (!filtersInitialLoading) {
      fetchQuestionsData();
    }
  }, [searchDebounced, filtersInitialLoading, fetchQuestionsData]);

  return {
    questions,
    loading,
    isFetchingPage,
    error,
    totalQuestions,
    totalChapters,
    totalPassages,
    displayPassages,
    isShowingPassages,
    fetchQuestions: fetchQuestionsData,
    clearCacheAndRefresh,
    resetToFirstPage,
  };
}; 