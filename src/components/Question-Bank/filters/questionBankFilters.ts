import type { FilterDefinition } from "./types";
import type { Chapter } from "../actions/types";
import {
  fetchTopics,
  fetchSubTopics,
  fetchPassages,
} from "../actions/filterActions";

export const createQuestionBankFilters = (
  chapters: Chapter[],
): FilterDefinition[] => {
  /* console.log("🔍 [questionBankFilters] createQuestionBankFilters called with chapters:", chapters); */
  /* console.log("🔍 [questionBankFilters] Chapters length:", chapters.length); */

  const filters: FilterDefinition[] = [
    {
      key: "chapter_number",
      label: "Chapter",
      type: "dropdown",
      options: chapters.map((ch) => ({
        label: `${ch.chapter_number} - ${ch.title}`,
        value: ch.chapter_number.toString(),
      })),
      validation: {
        custom: (value: string) => {
          if (
            value &&
            !chapters.find((ch) => ch.chapter_number.toString() === value)
          ) {
            return "Invalid chapter selection";
          }
          return null;
        },
      },
      metadata: {
        cacheKey: "filter_chapters",
      },
    },
    {
      key: "topic_id",
      label: "Topic Title",
      type: "dependent-dropdown",
      dependsOn: "chapter_number",
      onSelectionChange: async (chapterNumber: string) => {
        /* console.log("🔍 [questionBankFilters] onSelectionChange called for topic_id with chapterNumber:", chapterNumber); */
        const result = await fetchTopics({ chapterNumber });
        /* console.log("🔍 [questionBankFilters] fetchTopics result:", result); */
        if (result.success) {
          const options = result.data.map((topic) => ({
            label: topic.title,
            value: topic.id.toString(),
          }));
          /* console.log("🔍 [questionBankFilters] Returning topic options:", options); */
          return options;
        }
        /* console.log("🔍 [questionBankFilters] fetchTopics failed, returning empty array"); */
        return [];
      },
      validation: {
        custom: (value: string) => {
          if (value && isNaN(parseInt(value, 10))) {
            return "Invalid topic selection";
          }
          return null;
        },
      },
      metadata: {
        apiEndpoint: "/api/pre-shsat/chapters/{chapterNumber}/topics",
        cacheKey: "filter_topics_{chapterNumber}",
      },
    },
    {
      key: "sub_topic_id",
      label: "Sub Topic Title",
      type: "dependent-dropdown",
      dependsOn: "topic_id",
      onSelectionChange: async (topicId: string) => {
        /* console.log("🔍 [questionBankFilters] onSelectionChange called for sub_topic_id with topicId:", topicId); */
        const result = await fetchSubTopics({ topicId });
        /* console.log("🔍 [questionBankFilters] fetchSubTopics result:", result); */
        if (result.success) {
          const options = result.data.map((subTopic) => ({
            label: subTopic.title,
            value: subTopic.id.toString(),
          }));
          /* console.log("🔍 [questionBankFilters] Returning sub-topic options:", options); */
          return options;
        }
        /* console.log("🔍 [questionBankFilters] fetchSubTopics failed, returning empty array"); */
        return [];
      },
      validation: {
        custom: (value: string) => {
          if (value && isNaN(parseInt(value, 10))) {
            return "Invalid sub-topic selection";
          }
          return null;
        },
      },
      metadata: {
        apiEndpoint: "/api/pre-shsat/sub-topics?topic_id={topicId}",
        cacheKey: "filter_subtopics_{topicId}",
      },
    },
    {
      key: "passage_filter",
      label: "Passage",
      type: "passage-selector",
      onSelectionChange: async () => {
        const result = await fetchPassages();
        if (result.success) {
          return result.data.map((passage) => ({
            label: `Passage #${passage.id} - ${passage.topic_title || "No Topic"} (${passage.question_count || 0} questions)`,
            value: passage.id.toString(),
            metadata: {
              id: passage.id,
              topic_title: passage.topic_title,
              question_count: passage.question_count,
            },
          }));
        }
        return [];
      },
      metadata: {
        apiEndpoint: "/api/passage-list",
        cacheKey: "filter_passages",
        optgroups: true,
      },
    },
    {
      key: "question_type",
      label: "Question Type",
      type: "dropdown",
      options: [
        { label: "MC - Standard", value: "MC_STANDARD" },
        { label: "MC - Drag & Drop", value: "MC_DRAG_DROP" },
        { label: "MC Full", value: "MC_FULL" }, // Added MC Full
        { label: "Multi-Answer", value: "MA" },
        { label: "True/False", value: "TF" },
        { label: "Grid-In", value: "GI" },
        { label: "Blank", value: "BLANK" },
        { label: "Blank Box", value: "BLANK_FILL_BOX" },
        { label: "RC", value: "RC" },
        { label: "Hot Text", value: "HOT_TEXT" },
        { label: "Table Grid - Single Select", value: "TABLE_GRID_SINGLE" },
        { label: "Table Grid - Multi Select", value: "TABLE_GRID_MULTI" },
        { label: "Ray Selector", value: "RAY_SELECTOR" },
        { label: "Graph Selector", value: "GRAPH_SELECTOR" },
        { label: "DND (Single Assignment)", value: "DND_SINGLE" },
        { label: "DND (Multi Assignment)", value: "DND_MULTI" },
        {
          label: "DND (One Bucket, Multi-Select)",
          value: "DND_ONE_BUCKET_MULTI",
        },
        { label: "DND (One Bucket, Single-Select)", value: "DND_ONE_BUCKET_SINGLE" },
        { label: "DND (Table/Grid)", value: "DND_TABLE" },
        { label: "Table DND", value: "TABLE_DND" }, // Added Table DND
      ],
      validation: {
        custom: (value: string) => {
          const validTypes = [
            "MC_STANDARD",
            "MC_DRAG_DROP",
            "MC_FULL",
            "MA",
            "TF",
            "GI",
            "BLANK",
            "BLANK_FILL_BOX",
            "RC",
            "HOT_TEXT",
            "TABLE_GRID_SINGLE",
            "TABLE_GRID_MULTI",
            "RAY_SELECTOR",
            "GRAPH_SELECTOR",
            "DND_SINGLE",
            "DND_MULTI",
            "DND_ONE_BUCKET_MULTI",
            "DND_ONE_BUCKET_SINGLE",
            "DND_TABLE",
          ];
          if (value && !validTypes.includes(value)) {
            return "Invalid question type";
          }
          return null;
        },
      },
    },
    {
      key: "category",
      label: "Category",
      type: "dropdown",
      options: [
        { label: "Practice", value: "practice" },
        { label: "Drill", value: "drill" },
        { label: "Uncategorized", value: "uncategorized" },
      ],
      validation: {
        custom: (value: string) => {
          if (value && !["practice", "drill", "uncategorized"].includes(value)) {
            return "Invalid category";
          }
          return null;
        },
      },
    },
    {
      key: "page_number",
      label: "Page Number",
      type: "text",
      placeholder: "Enter page number",
      validation: {
        custom: (value: string) => {
          if (value) {
            const num = parseInt(value, 10);
            if (isNaN(num) || num < 1) {
              return "Must be a positive number";
            }
          }
          return null;
        },
      },
    },
    {
      key: "question_number",
      label: "Question Number",
      type: "text",
      placeholder: "Enter question number",
      validation: {
        custom: (value: string) => {
          if (value) {
            const num = parseInt(value, 10);
            if (isNaN(num) || num < 1) {
              return "Must be a positive number";
            }
          }
          return null;
        },
      },
    },
    {
      key: "has_media",
      label: "Has Media",
      type: "dropdown",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
      validation: {
        custom: (value: string) => {
          if (value && !["true", "false"].includes(value)) {
            return "Invalid media selection";
          }
          return null;
        },
      },
    },
    {
      key: "question_id",
      label: "Question ID",
      type: "text",
      placeholder: "Enter IDs (e.g. 2246, 2247)",
      validation: {
        custom: (value: string) => {
          if (value) {
            // Allow commas, spaces, and numbers
            const isValid = /^[\d,\s]+$/.test(value);
            if (!isValid) {
              return "Must be numbers separated by commas";
            }
            
            // Validate individual numbers
            const ids = value.split(",").map(id => id.trim()).filter(id => id !== "");
            for (const id of ids) {
              if (isNaN(parseInt(id, 10)) || parseInt(id, 10) < 1) {
                return `Invalid ID: ${id}`;
              }
            }
          }
          return null;
        },
      },
    },
  ];
  /* console.log("🔍 [questionBankFilters] Returning filters:", filters); */
  return filters;
};

// Default filter values
export const defaultQuestionBankFilters = {
  chapter_number: "",
  topic_id: "",
  sub_topic_id: "",
  passage_filter: "",
  question_type: "",
  category: "",
  page_number: "",
  question_number: "",
  question_id: "",
  has_media: "",
};

// Helper function to transform passage filter value to API params
export const transformPassageFilterToParams = (passageFilterValue: string) => {
  if (!passageFilterValue) {
    return { has_passage: "", passage_id: null };
  }

  if (passageFilterValue === "yes") {
    return { has_passage: "true", passage_id: null };
  }

  if (passageFilterValue === "no") {
    return { has_passage: "false", passage_id: null };
  }

  // Specific passage ID - ensure it's a valid integer
  const passageId = parseInt(passageFilterValue, 10);
  if (isNaN(passageId)) {
    return { has_passage: "", passage_id: null };
  }

  return { has_passage: "", passage_id: passageId };
};

// Helper function to validate all filters
export const validateAllFilters = (
  values: Record<string, string>,
  filters: FilterDefinition[],
): Record<string, string> => {
  const errors: Record<string, string> = {};

  filters.forEach((filter) => {
    const value = values[filter.key] || "";

    if (filter.validation) {
      const { required, minLength, maxLength, pattern, custom } =
        filter.validation;

      // Required validation
      if (required && !value.trim()) {
        errors[filter.key] = `${filter.label} is required`;
        return;
      }

      // Skip other validations if empty and not required
      if (!value.trim()) return;

      // Length validations
      if (minLength && value.length < minLength) {
        errors[filter.key] =
          `${filter.label} must be at least ${minLength} characters`;
        return;
      }

      if (maxLength && value.length > maxLength) {
        errors[filter.key] =
          `${filter.label} must not exceed ${maxLength} characters`;
        return;
      }

      // Pattern validation
      if (pattern && !pattern.test(value)) {
        errors[filter.key] = `${filter.label} format is invalid`;
        return;
      }

      // Custom validation
      if (custom) {
        const customError = custom(value);
        if (customError) {
          errors[filter.key] = customError;
          return;
        }
      }
    }
  });

  return errors;
};
