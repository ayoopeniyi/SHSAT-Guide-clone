// Question Modal State Management Hook
import { useState, useEffect } from 'react';
import { QuestionModalState } from './QuestionModalTypes';

export const useQuestionModalState = (
  istestpack: boolean,
  isOpen: boolean,
  initialValues: any
): Omit<QuestionModalState, 'questionType' | 'setQuestionType'> => {
  // Subject and Category state (for test pack only)
  const [subject, setSubject] = useState<string>("");
  const [mainTopicId, setMainTopicId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [mainTopics, setMainTopics] = useState<Array<{ id: number; name: string }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [mainTopicsLoading, setMainTopicsLoading] = useState(false);
  const [mainTopicsError, setMainTopicsError] = useState<string | null>(null);

  // Subject to parent ID mapping
  const SUBJECT_TO_PARENT_ID = {
    "Mathematics": 867,
    "ELA": 976
  };

  // Fetch main topics when subject changes (test pack only)
  useEffect(() => {
    if (istestpack && isOpen && subject) {
      setMainTopicsLoading(true);
      setMainTopicsError(null);
      
      // Build the URL with parent_id for main topics
      const parentId = SUBJECT_TO_PARENT_ID[subject as keyof typeof SUBJECT_TO_PARENT_ID];
      const url = `${import.meta.env.VITE_API_URL}/api/test-pack/categories/get-all?parent_id=${parentId}`;
      
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch main topics");
          return res.json();
        })
        .then((data) => {
          setMainTopics(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          setMainTopicsError("Could not load main topics");
          setMainTopics([]);
        })
        .finally(() => setMainTopicsLoading(false));
    } else if (istestpack && isOpen && !subject) {
      setMainTopics([]);
      setMainTopicId("");
    }
  }, [istestpack, isOpen, subject]);

  // Fetch sub-categories when main topic changes (test pack only)
  useEffect(() => {
    if (istestpack && isOpen && mainTopicId) {
      setCategoriesLoading(true);
      setCategoriesError(null);
      
      // Build the URL with parent_id for sub-categories
      const url = `${import.meta.env.VITE_API_URL}/api/test-pack/categories/get-all?parent_id=${mainTopicId}`;
      
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch categories");
          return res.json();
        })
        .then((data) => {
          setCategories(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          setCategoriesError("Could not load categories");
          setCategories([]);
        })
        .finally(() => setCategoriesLoading(false));
    } else if (istestpack && isOpen && !mainTopicId) {
      setCategories([]);
      setCategoryId("");
    }
  }, [istestpack, isOpen, mainTopicId]);

  // Prefill subject/category on edit (test pack only)
  useEffect(() => {
    if (istestpack && isOpen && initialValues) {
      /* console.log("🔍 Prefilling subject/category for test pack question:", {
        subject: initialValues.subject,
        question_category_id: initialValues.question_category_id,
        has_category_id: !!initialValues.question_category_id
      }); */
      
      // Map old subject values to new ones for backward compatibility
      let subjectValue = initialValues.subject || "";
      if (subjectValue === "Math") {
        subjectValue = "Mathematics";
      }
      setSubject(subjectValue);
      
      if (initialValues.question_category_id) {
        // Fetch the parent category to set mainTopicId correctly
        const categoryId = String(initialValues.question_category_id);
        
        // Fetch category details to get parent_id
        fetch(`${import.meta.env.VITE_API_URL}/api/test-pack/categories/get-all`)
          .then((res) => res.json())
          .then((allCategories) => {
            /* console.log("🔍 All categories fetched:", allCategories.length); */
            const currentCategory = allCategories.find((cat: any) => cat.id === Number(categoryId));
            if (currentCategory && currentCategory.parent_id) {
              /* console.log("🔍 Found category parent:", {
                categoryId,
                parentId: currentCategory.parent_id,
                categoryName: currentCategory.name
              }); */
              setMainTopicId(String(currentCategory.parent_id));
              setCategoryId(categoryId);
            } else {
              console.warn("⚠️ Could not find parent for category:", {
                categoryId,
                currentCategory,
                hasParent: !!currentCategory?.parent_id
              });
              setCategoryId(categoryId);
            }
          })
          .catch((err) => {
            console.error("❌ Error fetching category details:", err);
            // Fallback: just set the category
            setCategoryId(categoryId);
          });
      }
    } else if (istestpack && isOpen && !initialValues) {
      setSubject("");
      setMainTopicId("");
      setCategoryId("");
    }
  }, [istestpack, isOpen, initialValues]);

  return {
    subject,
    setSubject,
    mainTopicId,
    setMainTopicId,
    categoryId,
    setCategoryId,
    categories,
    setCategories,
    mainTopics,
    setMainTopics,
    categoriesLoading,
    setCategoriesLoading,
    categoriesError,
    setCategoriesError,
    mainTopicsLoading,
    setMainTopicsLoading,
    mainTopicsError,
    setMainTopicsError,
  };
};
