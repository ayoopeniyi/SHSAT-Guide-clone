// Question Modal Handlers and Save Logic
import { toast } from "sonner";
import { useAuthStore } from "../../../stores/authStore";
import { trackQuestionCreation } from "../../../lib/posthog-analytics";
import { testPackService } from "../../../services/testPackService";
import { saveChoiceTags } from "../../../services/tagService";
import type { TagSlot } from "../../shared/ChoiceTagEditor";
// import { getQuestionTypeAcronym } from "../../../utils/questionTypeUtils";

export const handleQuestionSave = async (
  // Core
  questionType: string,
  initialValues: any,
  istestpack: boolean,
  subject: string,
  categoryId: string,
  onSave: (data: any) => void,
  onClose: () => void,
  analytics: any,
  // State objects for each question type
  mcState: any,
  maState: any,
  blankState: any,
  tfState: any,
  dndState: any,
  graphSelectorState: any,
  tableGridState: any,
  raySelectorState: any,
  hotTextState: any,
  equationCalculatorState: any,
  rcState: any,
  // Other shared state
  questionImageUrl: string | undefined,
  dndSubtype: string,
  tgPrompt: string,
  tgRowLabels: string[],
  tgColumnLabels: string[],
  tgSelectionMode: string,
  tgAnswerMatrix: any[],
  tgFirstColumnHeader: string,
  tgDifficulty: number,
  tgErrors: string[],
  // Save handlers
  handleDnDSave: () => Promise<void>,
  graphSelectorSave: () => void,
  tableGridSave: () => void,
  // Validation
  tgValidate: () => boolean,
  graphSelectorValid: boolean,
  // DND specific
  dndBuckets: any[],
  dndChoices: any[],
  dndCorrectAssignments: any,
  dndQuestion: string,
  dndExplanation: string,
  dndDifficulty: number,
  tableColumnHeaders: string[],
  // Graph Selector specific
  graphPrompt: string,
  xMin: string,
  xMax: string,
  yMin: string,
  yMax: string,
  gridInterval: string,
  maxSelectablePoints: string,
  showAxes: boolean,
  showLabels: boolean,
  snapToGrid: boolean,
  graphInstruction: string,
  availablePoints: any[],
  graphExplanation: string,
  xAxisLabel: string,
  yAxisLabel: string,
  graphDifficulty: number,
  resetGraphSelectorState: () => void,
  // RC specific
  rcPassage: string,
  rcStartPage: number | undefined,
  rcEndPage: number | undefined,
  rcImageUrl: string | undefined,
  rcDifficulty: number,
  // Equation Calculator specific
  equationQuestion: string,
  equationCorrectAnswer: string,
  equationQuestionImageUrl: string | undefined,
  equationDifficulty: number,
  equationQuestionCategory: string | undefined,
  equationChapter: number | undefined,
  equationTopic: number | undefined,
  equationSubTopic: number | undefined,
  equationExplanation: string,
  resetEquationCalculatorState: () => void,
  eqTagSlots: TagSlot[],
  // Tag slots for Blank and Graph Selector
  blankTagSlots: TagSlot[],
  graphPointTagSlots: Record<string, TagSlot[]>,
): Promise<void> => {
  // console.log("🚀 handleSave called for questionType:", questionType);

  const userName = useAuthStore.getState().getUserName();
  const baseUrl = import.meta.env.VITE_API_URL;
  let endpoint = "";
  let payload = {};
  let method = initialValues ? "PUT" : "POST";

  // --- FIX: Use correct passage endpoint based on context ---
  if (initialValues?.passage_id) {
    // Check if this is test pack context or question bank context
    const isTestPackContext = Boolean(initialValues?.test_id || istestpack);
    // GUARD: passage_id must be a valid number
    if (typeof initialValues.passage_id !== 'number' || isNaN(initialValues.passage_id) || !Number.isInteger(initialValues.passage_id)) {
      console.error("❌ Invalid passage_id for passage update:", initialValues.passage_id, initialValues);
      console.error("Stack trace:", new Error().stack);
      toast.error("Cannot update passage: invalid passage_id (frontend bug)");
      throw new Error("Cannot update passage: invalid passage_id (frontend bug)");
    }
    // Use the correct endpoint and payload format for passage update
    payload = {
      passage: rcPassage,
      last_edited_by: userName,
      image_url: rcImageUrl || ""
    };
    if (isTestPackContext) {
      // Use the new test pack endpoint
      try {
        const data = await testPackService.editPassage(initialValues.passage_id, {
          ...payload,
          test_id: initialValues.test_id,
          difficulty: rcDifficulty,
          ...(rcStartPage !== undefined ? { start_page: rcStartPage } : {}),
          ...(rcEndPage !== undefined ? { end_page: rcEndPage } : {}),
        });
        toast.success("Passage updated successfully");
        onSave(data);
        onClose();
        return;
      } catch (error: any) {
        toast.error(error.message || "Failed to update test pack passage");
        throw error;
      }
    } else {
      // Use the question bank endpoint
      endpoint = `${baseUrl}/api/passages/update/${initialValues.passage_id}`;
      method = "PUT";
      // Log for debugging
      // console.log("🚀 Making API call to (passage update):", endpoint, "passage_id:", initialValues.passage_id);

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ API Error:", errorData);
        console.error("❌ Failed endpoint:", endpoint);
        console.error("❌ Failed method:", method);
        throw new Error(
          `Failed to update passage at ${endpoint}: ${errorData.message || errorData.detail || "Unknown error"}`,
        );
      }
      const data = await response.json();
      // console.log("✅ Passage save successful:", data);

      toast.success("Passage updated successfully");
      onSave(data);
      onClose();
      return;
    }
  }

  try {
    switch (questionType) {
      case "TABLE_GRID":
        if (!tgValidate()) {
          toast.error("Please fix validation errors before saving.");
          return;
        }

        // Validate unique labels
        const uniqueRowLabels = new Set(tgRowLabels);
        const uniqueColLabels = new Set(tgColumnLabels);
        if (uniqueRowLabels.size !== tgRowLabels.length) {
          throw new Error("Row labels must be unique");
        }
        if (uniqueColLabels.size !== tgColumnLabels.length) {
          throw new Error("Column labels must be unique");
        }

        // Validate at least one correct answer
        const hasCorrectAnswer = tgAnswerMatrix.some(
          (answer) => answer.is_correct,
        );
        if (!hasCorrectAnswer) {
          throw new Error("At least one answer must be marked as correct");
        }

        if (istestpack) {
          endpoint = initialValues?.question_id
            ? `${baseUrl}/api/test-pack/table-grid/put/${initialValues.question_id}`
            : `${baseUrl}/api/test-pack/table-grid/create`;
          method = initialValues?.question_id ? "PUT" : "POST";

          payload = {
            question: tgPrompt,
            selection_mode: tgSelectionMode,
            row_labels: tgRowLabels,
            column_labels: tgColumnLabels,
            first_column_header: tgFirstColumnHeader || null,
            answer_matrix: tgAnswerMatrix.map((answer) => ({
              row_index: answer.row_index,
              column_index: answer.column_index,
              is_correct: answer.is_correct,
              last_edited_by: userName,
            })),
            explanation: tableGridState?.tgExplanation || null,
            last_edited_by: userName,
            test_id: initialValues.test_id,
            difficulty: tgDifficulty,
            created_by: userName,
            is_active: initialValues?.is_active,  // Preserve current active state
            subject: subject,
            question_category_id: Number(categoryId) || null,
          };
        } else {
          endpoint = initialValues?.id
            ? `${baseUrl}/api/table-grid-questions/update/${initialValues.id}`
            : `${baseUrl}/api/table-grid-questions/create`;
          method = initialValues?.id ? "PUT" : "POST";

          payload = {
            question: tgPrompt,
            selection_mode: tgSelectionMode,
            row_labels: tgRowLabels,
            column_labels: tgColumnLabels,
            row_order: initialValues?.row_order || null,
            column_order: initialValues?.column_order || null,
            first_column_header: tgFirstColumnHeader || null,
            answers: tgAnswerMatrix.map((answer) => ({
              row_index: answer.row_index,
              column_index: answer.column_index,
              is_correct: answer.is_correct,
              created_by: userName,
              last_edited_by: userName,
            })),
            explanation: tableGridState?.tgExplanation || null,
            last_edited_by: userName,
            created_by: userName,
            // Hierarchy fields
            question_category: tableGridState?.tgQuestionCategory || "Practice",
            chapter_number: tableGridState?.tgChapter || null,
            topic_id: tableGridState?.tgTopic || null,
            sub_topic_id: tableGridState?.tgSubTopic || null,
            // Preserve existing question number for editing
            question_number: initialValues?.question_number || null,
          };
        }
        break;

      case "MC":
        if (initialValues?.test_id) {
          // Check if this is an edit operation (has question_id) or create operation
          if (initialValues?.question_id) {
            // Edit operation - use update endpoint
            endpoint = `${baseUrl}/api/test-pack/mc/edit/${initialValues.question_id}`;
            method = "PUT";
            // Do NOT include subject and question_category_id during edit
            payload = {
              question: mcState.mcQuestion,
              choices: mcState.mcChoices.map((choice: any) => ({
                letter: choice.letter,
                value: {
                  text: choice.value.text,
                  is_correct: choice.value.is_correct,
                  explanation: choice.value.explanation,
                  choice_image_url: choice.value.choice_image_url,
                },
              })),
              correct_answer: mcState.mcChoices.find((c: any) => c.value.is_correct)?.letter || "",
              explanation: mcState.mcExplanation,
              question_type: "MC",
              question_category: mcState.mcVariant || "standard",
              question_image_url: questionImageUrl,
              difficulty: mcState.mcDifficulty,
              created_by: undefined,
              last_edited_by: userName,
              test_id: initialValues.test_id,
            };
          } else {
            // Create operation - use create endpoint
            endpoint = `${baseUrl}/api/test-pack/mc/create`;
            method = "POST";
            // INCLUDE subject and question_category_id during creation
            payload = {
              question: mcState.mcQuestion,
              choices: mcState.mcChoices.map((choice: any) => ({
                letter: choice.letter,
                value: {
                  text: choice.value.text,
                  is_correct: choice.value.is_correct,
                  explanation: choice.value.explanation,
                  choice_image_url: choice.value.choice_image_url,
                },
              })),
              correct_answer: mcState.mcChoices.find((c: any) => c.value.is_correct)?.letter || "",
              explanation: mcState.mcExplanation,
              question_type: "MC",
              question_category: mcState.mcVariant || "standard",
              question_image_url: questionImageUrl,
              difficulty: mcState.mcDifficulty,
              created_by: userName,
              last_edited_by: userName,
              test_id: initialValues.test_id,
              subject: subject || "Mathematics", // fallback for safety
              question_category_id: Number(categoryId) || null,
            };
          }
        } else if (istestpack) {
          // Fallback: if istestpack is true but initialValues is missing
          endpoint = `${baseUrl}/api/test-pack/mc/create`;
          method = "POST";
          payload = {
            question: mcState.mcQuestion,
            choices: mcState.mcChoices.map((choice: any) => ({
              letter: choice.letter,
              value: {
                text: choice.value.text,
                is_correct: choice.value.is_correct,
                explanation: choice.value.explanation,
                choice_image_url: choice.value.choice_image_url,
              },
            })),
            correct_answer: mcState.mcChoices.find((c: any) => c.value.is_correct)?.letter || "",
            explanation: mcState.mcExplanation,
            question_type: "MC",
            question_category: mcState.mcVariant || "standard",
            question_image_url: questionImageUrl,
            difficulty: mcState.mcDifficulty,
            created_by: userName,
            last_edited_by: userName,
            subject: subject || "Mathematics",
            question_category_id: Number(categoryId) || null,
          };
        } else if (initialValues?.id) {
          endpoint = `${baseUrl}/api/pre-shsat/questions/${initialValues.id}`;
          method = "PUT";
          /* console.log(
            "[MC] Using question bank UPDATE endpoint:",
            endpoint,
            "method:",
            method,
            "id:",
            initialValues.id,
          ); */

        } else {
          endpoint = `${baseUrl}/api/pre-shsat/questions/mc`;
          method = "POST";
          /* console.log(
            "[MC] Using question bank CREATE endpoint:",
            endpoint,
            "method:",
            method,
          ); */

        }

        // Transform choices to match backend format
        const transformedChoices = mcState.mcChoices.map((choice: any) => ({
          letter: choice.letter,
          value: {
            text: choice.value.text,
            is_correct: choice.value.is_correct,
            explanation: choice.value.explanation,
            choice_image_url: choice.value.choice_image_url,
          },
        }));

        // Find the correct answer (letter of the correct choice)
        const correctAnswer =
          mcState.mcChoices.find((c: any) => c.value.is_correct)?.letter || "";

        payload = {
          question: mcState.mcQuestion,
          choices: transformedChoices,
          correct_answer: correctAnswer,
          explanation: mcState.mcExplanation,
          question_type: "MC",
          question_category: mcState.mcVariant || "standard",
          question_image_url: questionImageUrl,
          difficulty: mcState.mcDifficulty,
          created_by: userName,  // Always set created_by for test pack questions
          last_edited_by: userName,
        };

        // Add test_id for test pack questions
        if (initialValues?.test_id) {
          (payload as any).test_id = initialValues.test_id;
        }
        // Add subject and question_category_id for test pack questions
        if (istestpack) {
          (payload as any).subject = subject;
          (payload as any).question_category_id = Number(categoryId);
        }
        break;

      case "MA":
        /* console.log("[MA] Debug - initialValues:", initialValues);
        console.log("[MA] Debug - test_id:", initialValues?.test_id);
        console.log("[MA] Debug - id:", initialValues?.id); */


        if (initialValues?.test_id) {
          // Check if this is an edit operation (has question_id) or create operation
          if (initialValues?.question_id) {
            // Edit operation - use update endpoint
            endpoint = `${baseUrl}/api/test-pack/ma/put/${initialValues.question_id}`;
            method = "PUT";
            /* console.log(
              "[MA] Using test pack update endpoint:",
              endpoint,
              "method:",
              method,
            ); */

          } else {
            // Create operation - use create endpoint
            endpoint = `${baseUrl}/api/test-pack/ma/create`;
            method = "POST";
            /* console.log(
              "[MA] Using test pack create endpoint:",
              endpoint,
              "method:",
              method,
            ); */

          }
        } else if (initialValues?.id) {
          endpoint = `${baseUrl}/api/pre-shsat/questions/${initialValues.id}`;
          method = "PUT";
          /* console.log(
            "[MA] Using question bank update endpoint:",
            endpoint,
            "method:",
            method,
          ); */

        } else {
          endpoint = `${baseUrl}/api/pre-shsat/questions/ma`;
          method = "POST";
          /* console.log(
            "[MA] Using question bank create endpoint:",
            endpoint,
            "method:",
            method,
          ); */

        }

        // Get correct answers as comma-separated list
        const correctLabels = maState.maChoices
          .filter((c: any) => c.is_correct)
          .map((c: any) => c.choice_label)
          .join(",");

        // Transform choices based on whether it's test pack or pre-shsat
        let maTransformedChoices;
        if (initialValues?.test_id) {
          // Test pack format: use choice_label, choice_text, is_correct
          maTransformedChoices = maState.maChoices.map((choice: any) => ({
            choice_label: choice.choice_label,
            choice_text: choice.choice_text,
            is_correct: choice.is_correct,
            choice_image_url: choice.choice_image_url,
          }));
        } else {
          // Pre-shsat format: use letter and value (same as MC questions)
          maTransformedChoices = maState.maChoices.map((choice: any) => ({
            letter: choice.choice_label,
            value: {
              text: choice.choice_text,
              is_correct: choice.is_correct,
              explanation: choice.explanation,
              choice_image_url: choice.choice_image_url,
            },
          }));
        }

        payload = {
          question: maState.maQuestion,
          question_type: "MA",
          question_image_url: questionImageUrl,
          choices: maTransformedChoices,
          correct_answer: correctLabels,
          answer: correctLabels, // Backend expects both fields
          explanation: maState.maExplanation,
          difficulty: maState.maDifficulty,
          created_by: userName,  // Always set created_by for test pack questions
          last_edited_by: userName,
        };

        // Add test_id for test pack questions
        if (initialValues?.test_id) {
          (payload as any).test_id = initialValues.test_id;
          // Preserve current active state for edit operations
          if (initialValues?.question_id) {
            (payload as any).is_active = initialValues.is_active;
          }
          (payload as any).subject = subject;
          (payload as any).question_category_id = Number(categoryId) || null;
        }
        break;

      case "BLANK":
        if (initialValues?.test_id) {
          // Check if this is an edit operation (has question_id) or create operation
          if (initialValues?.question_id) {
            // Edit operation - use update endpoints
            if (blankState.blankVariant === "placeholder") {
              endpoint = `${baseUrl}/api/test-pack/blank/placeholder/put/${initialValues.question_id}`;
            } else if (blankState.blankVariant === "fill_box") {
              endpoint = `${baseUrl}/api/test-pack/blank/fill-box/put/${initialValues.question_id}`;
            } else {
              throw new Error(
                'Invalid blank question category. Must be either "placeholder" or "fill_box".',
              );
            }
            method = "PUT";
          } else {
            // Create operation - use create endpoints
            if (blankState.blankVariant === "placeholder") {
              endpoint = `${baseUrl}/api/test-pack/blank/create/placeholder`;
            } else if (blankState.blankVariant === "fill_box") {
              endpoint = `${baseUrl}/api/test-pack/blank/create/fill-box`;
            } else {
              throw new Error(
                'Invalid blank question category. Must be either "placeholder" or "fill_box".',
              );
            }
            method = "POST";
          }
        } else if (initialValues?.id) {
          endpoint = `${baseUrl}/api/pre-shsat/questions/blank/${initialValues.id}`;
          method = "PATCH";
        } else {
          endpoint = `${baseUrl}/api/pre-shsat/questions/blank`;
          method = "POST";
        }

        // Validate question category
        if (!["placeholder", "fill_box"].includes(blankState.blankVariant)) {
          throw new Error(
            'Invalid blank question category. Must be either "placeholder" or "fill_box".',
          );
        }

        payload = {
          question: blankState.blankQuestion,
          question_type: "BLANK",
          question_category: blankState.blankQuestionCategory || "Practice",
          correct_answer: blankState.blankCorrectAnswer,
          explanation: blankState.blankExplanation,
          difficulty: blankState.blankDifficulty,
          created_by: userName,  // Always set created_by for test pack questions
          last_edited_by: userName,
          // Hierarchy fields for question bank
          chapter_number: blankState.blankChapter || undefined,
          topic_id: blankState.blankTopic || undefined,
          sub_topic_id: blankState.blankSubTopic || undefined,
        };

        // Add test_id for test pack questions
        if (initialValues?.test_id) {
          (payload as any).test_id = initialValues.test_id;
          // Preserve current active state for edit operations
          if (initialValues?.question_id) {
            (payload as any).is_active = initialValues.is_active;
          }
          (payload as any).subject = subject;
          (payload as any).question_category_id = Number(categoryId) || null;
        }
        break;

      case "DND":
        return handleDnDSave();

      case "GRAPH_SELECTOR":
        if (!graphSelectorValid) {
          throw new Error(
            "Please fill in all required fields for the graph selector question.",
          );
        }

        let isTestPackGraphSelector = false;
        let testPackTestId = undefined;
        if ((initialValues as any)?.test_id) {
          isTestPackGraphSelector = true;
          testPackTestId = (initialValues as any).test_id;
        } else if (
          typeof window !== "undefined" &&
          (window as any).testPackTestId
        ) {
          isTestPackGraphSelector = true;
          testPackTestId = (window as any).testPackTestId;
        }

        // Set endpoint and method based on add/edit and test pack/question bank
        method = "POST";
        if (isTestPackGraphSelector && !initialValues) {
          endpoint = `${baseUrl}/api/test-pack/graph-selector/create`;
          method = "POST";
        } else if (
          isTestPackGraphSelector &&
          initialValues &&
          (initialValues as any).question_id
        ) {
          endpoint = `${baseUrl}/api/test-pack/graph-selector/put/${(initialValues as any).question_id}`;
          method = "PATCH";
        } else if (!initialValues) {
          endpoint = `${baseUrl}/api/graph-selector/create`;
          method = "POST";
        } else if (initialValues && initialValues.id) {
          endpoint = `${baseUrl}/api/graph-selector/update/${initialValues.id}`;
          method = "PUT";
        } else {
          throw new Error("No valid question ID for update");
        }

        // Debug: Log mode, endpoint, and payload
        /* console.log(
          "[GraphSelector] isTestPack:",
          isTestPackGraphSelector,
          "isAddMode:",
          !initialValues,
        ); */

        // console.log("[GraphSelector] Endpoint:", endpoint, "Method:", method);


        // Validate grid interval
        if (Number(gridInterval) <= 0) {
          throw new Error("Grid interval must be greater than 0.");
        }

        // Validate at least one correct point
        if (!availablePoints.some((p) => p.is_correct)) {
          throw new Error("At least one point must be marked as correct.");
        }

        // Validate points are within range
        const xMinNum = Number(xMin);
        const xMaxNum = Number(xMax);
        const yMinNum = Number(yMin);
        const yMaxNum = Number(yMax);
        const invalidPoints = availablePoints.filter(
          (p) =>
            p.x < xMinNum || p.x > xMaxNum || p.y < yMinNum || p.y > yMaxNum,
        );
        if (invalidPoints.length > 0) {
          throw new Error("All points must be within the graph bounds.");
        }

        // Build payload matching question bank, but add test_id for test pack
        payload = {
          question: graphPrompt,
          x_min: xMinNum,
          x_max: xMaxNum,
          y_min: yMinNum,
          y_max: yMaxNum,
          grid_interval: Number(gridInterval),
          max_selectable_points: maxSelectablePoints
            ? Number(maxSelectablePoints)
            : null,
          graph_instruction: graphInstruction,
          graph_type: "cartesian",
          show_axes: showAxes,
          show_labels: showLabels,
          snap_to_grid: snapToGrid,
          x_axis_label: xAxisLabel,
          y_axis_label: yAxisLabel,
          points: availablePoints.map((p) => ({
            x: p.x,
            y: p.y,
            is_correct: p.is_correct,
            point_label: p.point_label || null,
            created_by: userName,
            last_edited_by: userName,
          })),
          explanation: graphExplanation || null,
          difficulty: graphDifficulty,
          created_by: userName,
          last_edited_by: userName,
          // Add hierarchy fields for question bank
          question_category: graphSelectorState.questionCategory || "Practice",
          chapter_number: graphSelectorState.chapter,
          topic_id: graphSelectorState.topic,
          sub_topic_id: graphSelectorState.subTopic,
          ...(initialValues?.question_number && { question_number: initialValues.question_number }), // Only include if exists
        };
        if (isTestPackGraphSelector && testPackTestId) {
          (payload as any).test_id = testPackTestId;
          (payload as any).subject = subject;
          (payload as any).question_category_id = Number(categoryId) || null;
        }
        // Debug: Log payload
        // console.log("[GraphSelector] Payload:", payload);

        break;

      case "RC":
      case "REA":
      case "REB":
        // Check if this is test pack context
        const isTestPackRC = istestpack || initialValues?.test_id;

        if (isTestPackRC) {
          // Test pack RC logic
          if (!initialValues?.passage_id) {
            endpoint = `${baseUrl}/api/test-pack/passages/create`;
            method = "POST";
            payload = {
              passage: rcPassage,
              created_by: userName,
              last_edited_by: userName,
              test_id: initialValues?.test_id,
              difficulty: rcDifficulty,
              ...(rcStartPage !== undefined ? { start_page: rcStartPage } : {}),
              ...(rcEndPage !== undefined ? { end_page: rcEndPage } : {}),
              ...(rcImageUrl ? { image_url: rcImageUrl } : {}),
            };
          } else {
            endpoint = `${baseUrl}/api/test-pack/passages/update/${initialValues.passage_id}`;
            method = "PUT";
            payload = {
              passage: rcPassage,
              created_by: userName,
              last_edited_by: userName,
              test_id: initialValues?.test_id,
              difficulty: rcDifficulty,
              ...(rcStartPage !== undefined
                ? { start_page: rcStartPage }
                : {}),
              ...(rcEndPage !== undefined ? { end_page: rcEndPage } : {}),
              ...(rcImageUrl ? { image_url: rcImageUrl } : {}),
            };
          }
        } else {
          // Question bank RC logic (existing code)
          endpoint = initialValues?.id
            ? `${baseUrl}/api/passages/${initialValues.id}`
            : `${baseUrl}/api/passages`;
          method = initialValues?.id ? "PUT" : "POST";
          payload = {
            passage: rcPassage,
            topic_id: undefined, // These fields are not used in test pack
            sub_topic_id: undefined,
            image_url: rcImageUrl,
            start_page: rcStartPage,
            end_page: rcEndPage,
            created_by: userName,  // Always set created_by for test pack questions
            last_edited_by: userName,
          };
        }
        break;

      case "HOT_TEXT":
        // All Hot Text save logic is now handled by the hotText modal state hook and its save method. Remove any HotTextForm usage here.
        break;

      case "EQUATION_CALCULATOR":
        // Add validation with user-friendly messages
        if (!equationQuestion.trim() && !equationCorrectAnswer.trim()) {
          toast.error("Please enter at least a question or correct answer");
          return;
        }

        if (initialValues?.test_id) {
          // Check if this is an edit operation (has question_id) or create operation
          if (initialValues?.question_id) {
            // Edit operation - use update endpoint
            endpoint = `${baseUrl}/api/test-pack/equation-calculator/update/${initialValues.question_id}`;
            method = "PUT";
          } else {
            // Create operation - use create endpoint
            endpoint = `${baseUrl}/api/test-pack/equation-calculator/create`;
            method = "POST";
          }
        } else if (initialValues?.id) {
          // Question bank edit operation
          endpoint = `${baseUrl}/api/pre-shsat/questions/equation-calculator/update/${initialValues.id}`;
          method = "PUT";
        } else {
          // Question bank create operation
          endpoint = `${baseUrl}/api/pre-shsat/questions/equation-calculator/create`;
          method = "POST";
        }

        /* console.log("🔍 [EQUATION_CALCULATOR] Creating payload with:", {
          equationQuestion,
          equationCorrectAnswer,
          equationQuestionCategory,
          equationChapter,
          equationTopic,
          equationSubTopic
        }); */


        /* console.log("🔍 [EQUATION_CALCULATOR] Hierarchy fields debug:", {
          equationQuestionCategory: equationQuestionCategory,
          equationChapter: equationChapter,
          equationTopic: equationTopic,
          equationSubTopic: equationSubTopic,
          types: {
            equationQuestionCategory: typeof equationQuestionCategory,
            equationChapter: typeof equationChapter,
            equationTopic: typeof equationTopic,
            equationSubTopic: typeof equationSubTopic
          }
        }); */


        // Ensure we have a valid answer - if empty, don't create the question
        if (!equationCorrectAnswer || equationCorrectAnswer.trim() === "") {
          toast.error("Please enter a correct answer for the equation calculator question");
          return;
        }

        payload = {
          question: equationQuestion || "Question placeholder",
          correct_answers: [
            {
              answer: equationCorrectAnswer.trim(),
              is_primary: true,
              created_by: userName,
              last_edited_by: userName,
            }
          ],
          explanation: equationExplanation || null,
          question_type: "EQUATION_CALCULATOR",
          question_category: equationQuestionCategory || "equation_calculator",
          chapter_number: equationChapter,
          topic_id: equationTopic,
          sub_topic_id: equationSubTopic,
          difficulty: equationDifficulty,
          page_number: null,
          question_number: initialValues?.question_number || null, // Preserve existing question number
          question_image_url: equationQuestionImageUrl,
          created_by: userName,
          last_edited_by: userName,
        };

        // console.log("🔍 [EQUATION_CALCULATOR] Final payload before sending:", payload);


        // Add test pack specific fields
        if (initialValues?.test_id) {
          (payload as any).test_id = initialValues.test_id;
          (payload as any).difficulty = equationDifficulty;
          (payload as any).question_image_url = equationQuestionImageUrl;
          // Database constraint: if question_number exists, is_active must be true.
          // On create (no question_id yet), we must default to inactive because question_number is null.
          // On edit, preserve the existing active state.
          (payload as any).is_active = initialValues?.question_id ? initialValues.is_active : false;
          (payload as any).question_type = 51; // Set question type to 51 for Equation Calculator
          (payload as any).subject = subject || "Mathematics"; // Include subject like MC
          (payload as any).question_category_id = Number(categoryId) || null; // Include category_id like MC
        } else {
          // Add question bank specific fields (hierarchy fields)
          (payload as any).difficulty = equationDifficulty;
          (payload as any).question_image_url = equationQuestionImageUrl;
          (payload as any).question_type = "EQUATION_CALCULATOR";
          (payload as any).question_category = equationQuestionCategory || "Practice";
          (payload as any).chapter_number = equationChapter;
          (payload as any).topic_id = equationTopic;
          (payload as any).sub_topic_id = equationSubTopic;
        }
        break;

      default:
        throw new Error(`Unsupported question type: ${questionType}`);
    }

    // Make the API call
    /* console.log("🚀 Making API call to:", endpoint);
    console.log("📦 With payload:", payload);
    console.log("📝 Using method:", method); */


    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ API Error:", errorData);
      console.error("❌ Failed endpoint:", endpoint);
      console.error("❌ Failed method:", method);
      throw new Error(
        `Failed to ${initialValues ? "update" : "create"} ${questionType} question at ${endpoint}: ${errorData.message || errorData.detail || "Unknown error"}`,
      );
    }

    const data = await response.json();

    // If we saved a question successfully and have a data URL for question image, upload it now to persist in storage
    try {
      const isDataUrl = typeof questionImageUrl === 'string' && questionImageUrl.startsWith('data:');
      const savedQuestionId = (initialValues?.id || data?.id);
      if (isDataUrl && savedQuestionId && (questionType === 'MC' || questionType === 'MA' || questionType === 'BLANK')) {
        const apiBase = import.meta.env.VITE_API_URL;
        const uploadEndpoint = istestpack && initialValues?.test_id
          ? `${apiBase}/api/images/test-pack/upload/question/${initialValues?.question_id || savedQuestionId}`
          : `${apiBase}/api/images/upload/question/${savedQuestionId}`;

        // Convert data URL to Blob
        const res = await fetch(questionImageUrl);
        const blob = await res.blob();
        const form = new FormData();
        form.append('file', blob, 'question-image');
        form.append('last_edited_by', userName || 'system');
        form.append('replace_existing', 'true');

        const uploadResp = await fetch(uploadEndpoint, { method: 'POST', body: form });
        if (!uploadResp.ok) {
          console.warn('Question image upload failed', await uploadResp.text());
        }
      }
    } catch (e) {
      console.warn('Question image post-save upload error:', e);
    }
    // console.log("✅ Save successful:", data);


    // Double fetch after update with 3-5 second delay
    if (initialValues) {
      // console.log("🔄 [Double Fetch] Starting delayed refetch after update...");


      // First immediate fetch
      try {
        const immediateFetchResponse = await fetch(`${baseUrl}${endpoint.replace('/create', '').replace('/update', '')}/${data.id || data.question_id}`);
        if (immediateFetchResponse.ok) {
          const immediateData = await immediateFetchResponse.json();
          // console.log("🔄 [Double Fetch] Immediate fetch result:", immediateData);

        }
      } catch (e) {
        console.warn("🔄 [Double Fetch] Immediate fetch failed:", e);
      }

      // Second delayed fetch (3-5 seconds)
      setTimeout(async () => {
        try {
          /* console.log("🔄 [Double Fetch] Starting delayed fetch after 4 seconds...");
          const delayedFetchResponse = await fetch(`${baseUrl}${endpoint.replace('/create', '').replace('/update', '')}/${data.id || data.question_id}`);
          if (delayedFetchResponse.ok) {
            const delayedData = await delayedFetchResponse.json();
            console.log("🔄 [Double Fetch] Delayed fetch result:", delayedData);
            // Call onSave again with the fresh data
            onSave(delayedData);
          } */

        } catch (e) {
          console.warn("🔄 [Double Fetch] Delayed fetch failed:", e);
        }
      }, 4000); // 4 second delay
    }

    // Track question creation/editing analytics
    if (!initialValues) {
      // New question created
      trackQuestionCreation(analytics, {
        questionId: data.question_id || data.id,
        questionType: questionType as any,
        difficulty: data.difficulty || 3,
        subject: data.subject || subject || 'Unknown',
        numOptions: data.choices?.length || 0,
        hasPassage: !!(data.passage_id || initialValues?.passage_id),
        passageId: data.passage_id || initialValues?.passage_id,
        testId: data.test_id || initialValues?.test_id,
        isTestPack: istestpack
      });
    } else {
      // Question edited
      analytics.trackQuestionEdited(
        data.question_id || data.id,
        questionType as any,
        {
          question_updated: true,
          difficulty_changed: data.difficulty !== initialValues.difficulty,
          subject_changed: data.subject !== initialValues.subject
        },
        {
          old_difficulty: initialValues.difficulty,
          new_difficulty: data.difficulty,
          old_subject: initialValues.subject,
          new_subject: data.subject
        }
      );
    }

    // Sync tags for Equation Calculator
    if (questionType === "EQUATION_CALCULATOR" && eqTagSlots && eqTagSlots.length > 0) {
      const qId = data.question_id || data.id;
      const type = istestpack ? "test_pack" : "pre_shsat";
      if (qId) {
        try {
          // Add tag_order if missing
          const tagsWithOrder = eqTagSlots.map((tag, index) => ({
            ...tag,
            tag_order: (index + 1) as 1 | 2 | 3
          }));
          await saveChoiceTags(qId, type, tagsWithOrder);
          // console.log("✅ Equation tags synced successfully");

        } catch (tagError) {
          console.error("❌ Failed to sync equation tags:", tagError);
        }
      }
    }

    toast.success(
      `${questionType} question ${initialValues ? "updated" : "created"} successfully`,
    );
    onSave(data);
    onClose();
  } catch (error) {
    console.error("❌ Error saving question:", error);
    toast.error(
      error instanceof Error ? error.message : "Failed to save question",
    );
  }
};
