import React, { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { formatDate } from "../utils/dateUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Trash2, Power, Copy, Check } from "lucide-react";
import { FormKitDnDReadOnly } from "./question-modal/dnd-components/FormKitDnDReadOnly";
import { MCDragDropPreview } from "./question-modal/dnd-components/MCDragDropPreview";
import { toast } from "sonner";
import { testPackService } from "../services/testPackService";
import { BulkQuestionModal } from "./test-pack/modals/BulkQuestionModal";
import { TableDnDPreview } from "./question-modal/dnd-components/TableDnDPreview";
import TableGridEditor from "./TableGridEditor";
import { FormKitDnDPreview } from "./question-modal/dnd-components/FormKitDnDPreview";
import { getDndEndpoint, transformDndDataForModal, getQuestionTypeAcronym } from "../utils/questionTypeUtils";
import { fetchBatchChoiceTags } from "../services/tagService";
import type { ChoiceTag } from "../services/tagService";
import { ChoiceTagPills } from "./question-card/ChoiceTagPills";
import { usePostHog } from 'posthog-js/react';
import { useAuthStore } from "../stores/authStore";
import { QuestionNumberEditor } from "./question-reordering/QuestionNumberEditor";
import { ActivateQuestionModal } from "./question-reordering/ActivateQuestionModal";
import { EditableMetaInfoSection } from "./question-card/EditableMetaInfoSection";

export interface RCQuestionCardProps {
  question: any;
  onEditChoices?: (question: any) => void;
  onEditQuestion: (question: any) => void;
  onEditPassage?: (question: any) => void;
  onEditQuestionText?: (question: any) => void;
  onEditQuestionNumber?: (question: any) => void;
  onDelete: (questionId: string) => void;
  hasPassageFilter?: 'yes' | 'no' | 'any' | undefined;
  onSuccess?: () => void;
  context?: string;
  onRefresh?: () => void;
}

const getQuestionTypeDisplayName = (questionType: string): string => {
  const typeMap: Record<string, string> = {
    MC: "Multiple Choice",
    MA: "Multiple Answer",
    // 'TF': 'True/False',
    BLANK: "Fill in the Blank",
    DND: "Drag and Drop",
    HOT_TEXT: "Hot Text",
    RAY_SELECTOR: "Ray Selector",
    GRAPH_SELECTOR: "Graph Selector",
    TABLE_GRID: "Table-Grid",
  };
  return typeMap[questionType] || questionType;
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const subjectColors: Record<string, string> = {
  Math: "border-blue-500",
  ELA: "border-green-500",
};

export const RCQuestionCard: React.FC<RCQuestionCardProps> = ({
  question,
  onEditChoices,
  onEditQuestion,
  onEditPassage,
  onEditQuestionText,
  onEditQuestionNumber,
  onDelete,
  hasPassageFilter,
  onSuccess,
  context,
  onRefresh,
}) => {
  // Guard: If question is missing (deleted), do not render or fetch
  if (!question) return null;

  const posthog = usePostHog();
  const getUserName = useAuthStore((state) => state.getUserName);
  const user = useAuthStore((state) => state.user);

  const [dndData, setDndData] = useState<any>(null);
  const [loadingDnd, setLoadingDnd] = useState(false);
  const [tableGridData, setTableGridData] = useState<any>(null);
  const [loadingTableGrid, setLoadingTableGrid] = useState(false);
  const [tableGridCellTags, setTableGridCellTags] = useState<Record<string, ChoiceTag[]>>({});
  const [dndChoiceTags, setDndChoiceTags] = useState<Record<string, ChoiceTag[]>>({});
  const [mcmaTags, setMcmaTags] = useState<Record<string, ChoiceTag[]>>({});
  const [hotTextRegions, setHotTextRegions] = useState<any[]>([]);
  const [hotTextTags, setHotTextTags] = useState<Record<string, ChoiceTag[]>>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showBulkQuestionModal, setShowBulkQuestionModal] = useState(false);
  const [questionNumberEditor, setQuestionNumberEditor] = useState<{ open: boolean; question: any | null }>({ open: false, question: null });
  const [activateModal, setActivateModal] = useState<{ open: boolean; question: any | null }>({ open: false, question: null });
  const [copied, setCopied] = useState(false);

  // Fetch DND data if needed
  useEffect(() => {
    if (!question) return;
    if (question.question_type === "DND") {
      const hasAllFields =
        question.buckets && question.choices && question.assignments;
      if (!hasAllFields) {
        setLoadingDnd(true);
        let endpoint = "";
        if (
          context === "test-pack" &&
          (question as any).test_id &&
          (question as any).question_id
        ) {
          endpoint = `${import.meta.env.VITE_API_URL}/api/test-pack/dnd/get/${(question as any).question_id}`;
        } else {
          endpoint = `${import.meta.env.VITE_API_URL}/api/pre-shsat/dnd-questions/${question.id}`;
        }
        fetch(endpoint)
          .then((res) => res.json())
          .then((data) => {
            // Structure the DND data properly - merge question data with buckets, choices, assignments
            const structuredData = {
              ...data.question,
              buckets: data.buckets,
              choices: data.choices,
              assignments: data.assignments
            };
            setDndData(structuredData);
            setLoadingDnd(false);
          })
          .catch(() => setLoadingDnd(false));
      } else {
        setDndData(question);
      }
    }
    if (question.question_type === "TABLE_GRID") {
      const hasAllFields =
        (question as any).row_labels &&
        (question as any).column_labels &&
        (question as any).answer_matrix?.length > 0 &&
        (question as any).answer_matrix?.[0]?.id != null;
      if (!hasAllFields) {
        setLoadingTableGrid(true);
        const isTestPack = question.test_id !== undefined;
        const endpoint = isTestPack
          ? `${import.meta.env.VITE_API_URL}/api/test-pack/table-grid/get/${question.question_id || question.id}`
          : `${import.meta.env.VITE_API_URL}/api/table-grid-questions/get-details/${question.id}`;
        fetch(endpoint)
          .then((res) => res.json())
          .then((data) => {
            setTableGridData(data);
            setLoadingTableGrid(false);
          })
          .catch(() => setLoadingTableGrid(false));
      } else {
        setTableGridData(question);
      }
    }
  }, [question]);

  // Fetch TABLE_GRID cell tags once tableGridData is available
  useEffect(() => {
    if (!tableGridData?.answer_matrix) return;
    const matrix = tableGridData.answer_matrix as any[];
    const cellsWithIds = matrix.filter((cell: any) => cell.id != null);
    if (!cellsWithIds.length) return;
    const choiceType = context === "test-pack" ? "test_pack" : "pre_shsat";
    fetchBatchChoiceTags(cellsWithIds.map((c: any) => c.id), choiceType)
      .then(setTableGridCellTags)
      .catch(() => {});
  }, [tableGridData, context]);

  // Fetch DND choice tags once dndData is available
  useEffect(() => {
    if (!dndData?.choices) return;
    const ids = (dndData.choices as any[]).map((c: any) => c.id).filter(Boolean);
    if (!ids.length) return;
    const choiceType = context === "test-pack" ? "test_pack" : "pre_shsat";
    fetchBatchChoiceTags(ids, choiceType).then(setDndChoiceTags).catch(() => {});
  }, [dndData, context]);

  // Fetch MC/MA choice tags
  useEffect(() => {
    if (!["MC", "MA"].includes(question.question_type)) return;
    const choices = (question.choices || []) as any[];
    const ids = choices.map((c: any) => c.id).filter(Boolean);
    if (!ids.length) return;
    const choiceType = context === "test-pack" ? "test_pack" : "pre_shsat";
    fetchBatchChoiceTags(ids, choiceType).then(setMcmaTags).catch(() => {});
  }, [question.id, (question as any).question_id, question.question_type, (question as any).updated_at, context]);

  // Fetch HOT_TEXT region tags
  useEffect(() => {
    if (question.question_type !== "HOT_TEXT") return;
    const qId = (question as any).question_id || question.id;
    if (!qId) return;
    const choiceType = context === "test-pack" ? "test_pack" : "pre_shsat";
    const endpoint = context === "test-pack"
      ? `${import.meta.env.VITE_API_URL}/api/test-pack/hot-text/get/${qId}`
      : `${import.meta.env.VITE_API_URL}/api/pre-shsat/hot-text-question/${qId}`;
    fetch(endpoint)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return undefined;
        const regions = data.regions || [];
        setHotTextRegions(regions);
        const ids = regions.map((r: any) => r.id).filter(Boolean);
        if (!ids.length) return undefined;
        return fetchBatchChoiceTags(ids, choiceType);
      })
      .then((tags) => { if (tags) setHotTextTags(tags); })
      .catch(() => {});
  }, [question.id, (question as any).question_id, question.question_type, (question as any).updated_at, context]);

  const badge = (text: string, color: "default" | "secondary" | "destructive" | "outline" | null | undefined) => (
    <Badge variant={color} className="mr-1 mb-1">
      {text}
    </Badge>
  );

  const handleEditChoices = (question: any) => {
    // PostHog tracking
    const userName = getUserName();
    /* console.log('PostHog tracking - Edit Choices:', {
      userName,
      user,
      userEmail: user?.email,
      userNameFromUser: user?.name
    }); */

    posthog.capture('edit_choices_button_clicked', {
      user_name: userName,
      user_email: user?.email || 'unknown',
      user_id: user?.id || 'unknown',
      user_role: user?.role || 'unknown',
      question_id: question.question_id || question.id,
      question_type: question.question_type,
      subject: question.subject,
      timestamp: new Date().toISOString()
    });

    const normalizedChoices = (question.choices || []).map((choice: any) => {
      if (typeof choice.value === "string") {
        return {
          ...choice,
          value: { text: choice.value, is_correct: false, explanation: "" },
        };
      }
      return choice;
    });
    onEditChoices?.({ ...question, choices: normalizedChoices });
  };

  const handleDelete = async () => {
    // PostHog tracking
    const userName = getUserName();
    /* console.log('PostHog tracking - Delete Question:', {
      userName,
      user,
      userEmail: user?.email,
      userNameFromUser: user?.name
    }); */

    posthog.capture('delete_question_button_clicked', {
      user_name: userName,
      user_email: user?.email || 'unknown',
      user_id: user?.id || 'unknown',
      user_role: user?.role || 'unknown',
      question_id: question.question_id || question.id,
      question_type: question.question_type,
      subject: question.subject,
      timestamp: new Date().toISOString()
    });

    // Let the parent's optimistic delete handler handle the API call
    // This prevents duplicate delete calls and 404s
    onDelete(question.id);
  };

  const handleToggleActive = async () => {
    if (!question.question_id || !question.test_id) {
      toast.error("Cannot toggle question: missing question or test ID");
      return;
    }

    // PostHog tracking
    const userName = getUserName();
    /* console.log('PostHog tracking - User info:', {
      userName,
      user,
      userEmail: user?.email,
      userNameFromUser: user?.name
    }); */

    posthog.capture('active_button_clicked', {
      user_name: userName,
      user_email: user?.email || 'unknown',
      user_id: user?.id || 'unknown',
      user_role: user?.role || 'unknown'
    });

    // If trying to activate an inactive question, show the activation modal
    if (!question.is_active) {
      setActivateModal({ open: true, question });
      return;
    }

    // If deactivating, proceed with the normal toggle
    setIsToggling(true);
    try {
      await testPackService.toggleQuestionActive(
        question.question_id,
        question.test_id,
        false, // deactivate
      );
      toast.success("Question deactivated successfully");
      if (onRefresh) onRefresh(); // Use onRefresh callback to refresh the parent's data
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to toggle question status";
      toast.error(errorMessage);
      console.error("Error toggling question status:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleCopyId = () => {
    const id = question.id?.toString() || "";
    if (id) {
      navigator.clipboard.writeText(id);
      setCopied(true);
      toast.success("Question ID copied to clipboard");
      setTimeout(() => setCopied(false), 5000);
    }
  };

  const handleAddQuestions = () => {
    setShowBulkQuestionModal(true);
  };

  const handleBulkQuestionSuccess = () => {
    onSuccess?.(); // Call the callback to refresh the data
  };

  return (
    <>
      <div
        className={`bg-white rounded-lg shadow-sm relative hover:shadow-md transition-shadow border-l-4 w-full max-w-full overflow-hidden ${subjectColors[question.subject || ""] || "border-gray-200"
          }`}
      >
        {!hasPassageFilter || hasPassageFilter === 'any' ? (
          <div className="flex flex-row h-full min-w-0 max-w-full">
            {/* Left side - Passage */}
            <div className="w-1/2 p-4 border-r overflow-y-auto overflow-x-hidden max-h-[600px] min-w-0 max-w-full">
              {/* Header Row: Question # and Page # */}
              <div className="flex justify-between items-center mb-2 min-w-0">
                <span className="flex items-center gap-2">
                  {question.question_number ? (
                    <span className="text-lg font-semibold text-gray-800">Q{question.question_number}</span>
                  ) : (
                    <span className="text-lg font-semibold text-gray-400">No number</span>
                  )}
                </span>
                {question.page_number && <span className="text-sm text-gray-500">Page {question.page_number}</span>}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1 mb-2">
                {question.subject && (
                  <Badge
                    variant="default"
                    className={
                      question.subject === "Math" || question.subject === "Mathematics"
                        ? "bg-blue-100 text-blue-800"
                        : question.subject === "ELA"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                    }
                  >
                    {question.subject === "Math" ? "Mathematics" : question.subject}
                  </Badge>
                )}
                {/* New Category badge */}
                {question.category_name && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {question.category_name}
                  </Badge>
                )}
                {question.category && badge(question.category, "secondary")}
              </div>

              {/* Meta info with editable chapter/topic/subtopic */}
              <EditableMetaInfoSection question={question} context={(context as "question-bank" | "test-pack") || "question-bank"} />

              {/* Passage Content */}
              <div className="mb-2">
                <h3 className="text-lg font-semibold mb-2">Passage</h3>
                {question.passage && (
                  <div className="whitespace-pre-line text-base leading-relaxed break-all overflow-x-auto min-w-0 max-w-full"
                    dangerouslySetInnerHTML={{ __html: question.passage }} />
                )}
              </div>
            </div>

            {/* Right side - Question and Choices */}
            <div className="w-1/2 p-4 overflow-y-auto overflow-x-hidden max-h-[600px] min-w-0 max-w-full">
              {/* Question Content */}
              {!(
                question.question_type == "MC" &&
                question.question_category == "drag_drop"
              ) ? (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Question</h3>
                  <div className="text-base font-medium text-gray-900 break-words question-content" dangerouslySetInnerHTML={{ __html: question.content || question.question || "" }} />
                </div>
              ) : (
                <></>
              )}

              {/* HOT_TEXT region tags */}
              {question.question_type === "HOT_TEXT" && hotTextRegions.length > 0 && Object.keys(hotTextTags).length > 0 && (
                <div className="mt-2 mb-4 space-y-1">
                  {hotTextRegions.map((region: any, idx: number) => {
                    const tags = hotTextTags[String(region.id)] || [];
                    if (!tags.length) return null;
                    return (
                      <div key={region.id || idx} className="flex items-start gap-2">
                        <span className="text-xs text-gray-500 shrink-0 mt-0.5 font-medium">"{region.phrase}":</span>
                        <ChoiceTagPills tags={tags} />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Choices or DND */}

              {question.question_type === "MC" &&
                question.question_category === "drag_drop" &&
                question.choices &&
                question.choices.length > 0 ? (
                <>
                  <div className="mb-2">
                    <MCDragDropPreview
                      mcQuestion={question.content || question.question}
                      mcChoices={(question.choices || []).map(
                        (choice: any, idx: number) => {
                          let letter =
                            (choice as any).letter ??
                            (choice as any).choice_label;
                          let text = "";
                          let isCorrect = false;

                          if (typeof (choice as any).value === "string") {
                            text = (choice as any).value;
                          } else if (
                            typeof (choice as any).value === "object" &&
                            (choice as any).value !== null
                          ) {
                            text = (choice as any).value.text;
                            isCorrect = !!(choice as any).value.is_correct;
                          } else if ((choice as any).choice_text) {
                            text = String((choice as any).choice_text);
                          } else if ((choice as any).answer_text) {
                            text = String((choice as any).answer_text);
                          }
                          if ((choice as any).is_correct !== undefined) {
                            isCorrect = !!(choice as any).is_correct;
                          }
                          if (!letter) {
                            letter = String.fromCharCode(65 + idx);
                          }

                          return {
                            letter,
                            value: {
                              text,
                              is_correct: isCorrect,
                              explanation: (choice as any).explanation || "",
                            },
                          };
                        },
                      )}
                      isPreview={false} // Draggable but not droppable for question card
                      showLabels={false} // No labels in question card view
                    />
                  </div>
                </>
              ) : (
                <></>
              )}

              {question.question_type === "DND" ? (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Drag and Drop</h3>
                  {loadingDnd ? (
                    <div className="text-gray-400 text-sm">
                      Loading drag and drop...
                    </div>
                  ) : dndData ? (
                    dndData.question?.question_category === "drag_drop" ? (
                      <MCDragDropPreview
                        mcQuestion={question.content || question.question}
                        mcChoices={dndData.choices.map((choice: any) => ({
                          letter: choice.label,
                          value: {
                            text: choice.label,
                            is_correct: dndData.assignments.some(
                              (a: any) => a.choice_id === choice.id,
                            ),
                          },
                        }))}
                        isPreview={false}
                        showLabels={false}
                      />
                    ) : dndData.question?.question_category === "fill_box" ? (
                      <div className="space-y-2">
                        {dndData.choices.map((choice: any) => (
                          <div
                            key={choice.id}
                            className="px-3 py-2 bg-blue-100 text-blue-800 border border-blue-300 rounded-md text-sm font-medium inline-block mr-2"
                          >
                            {choice.label}
                          </div>
                        ))}
                        <div className="mt-2">
                          <div className="border-2 border-dashed border-gray-300 rounded p-2 bg-gray-50 inline-flex items-center justify-center min-w-[100px] min-h-[40px]">
                            <div className="text-gray-400 italic text-sm">
                              Fill box
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <FormKitDnDReadOnly
                        dndQuestion={question.content || question.question}
                        dndChoices={dndData.choices || []}
                        dndBuckets={dndData.buckets || []}
                        assignments={dndData.assignments || []}
                        dndSubtype={
                          dndData.question?.question_category ||
                          (dndData.buckets?.length === 1
                            ? "one_bucket_multi"
                            : "single_assignment")
                        }
                        choiceTags={dndChoiceTags}
                      />
                    )
                  ) : (
                    <div className="text-gray-400 text-sm">
                      No drag and drop data.
                    </div>
                  )}
                </div>
              ) : !(
                question.question_type == "MC" &&
                question.question_category === "drag_drop"
              ) ? (
                question.choices &&
                question.choices.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold mb-2">Answer Choices</h3>
                    {question.choices.map((choice: any, idx: number) => {
                      let letter = choice.letter ?? choice.choice_label;
                      let text = "";
                      let isCorrect = false;

                      if (typeof choice.value === "string") {
                        text = choice.value;
                      } else if (
                        typeof choice.value === "object" &&
                        choice.value !== null
                      ) {
                        text = choice.value.text;
                        isCorrect = !!choice.value.is_correct;
                      } else if (choice.choice_text) {
                        text = String(choice.choice_text);
                      }

                      if (choice.answer_text && text === "") {
                        text = String(choice.answer_text);
                      }

                      if (choice.is_correct !== undefined) {
                        isCorrect = !!choice.is_correct;
                      }
                      if (!letter) {
                        letter = String.fromCharCode(65 + idx);
                      }

                      return (
                        <div
                          key={idx}
                          className={`rounded px-3 py-2 border transition-colors duration-150 min-w-0 max-w-full
                      ${isCorrect ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50 hover:bg-gray-100"}
                    `}
                        >
                          <div className="flex items-start gap-2 min-w-0 max-w-full">
                            <span className="font-semibold flex-shrink-0">{letter}:</span>
                            <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">{text}</span>
                            {isCorrect && (
                              <span className="ml-auto text-green-600 font-bold flex-shrink-0">
                                ✓
                              </span>
                            )}
                          </div>
                          <ChoiceTagPills tags={mcmaTags[String((choice as any).id || '')] || []} />
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <></>
              )}

              {question.question_type === "TABLE_GRID" && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Table Grid</h3>
                  {loadingTableGrid ? (
                    <div className="text-gray-400 text-sm">Loading table grid...</div>
                  ) : tableGridData ? (
                    <TableGridEditor
                      rowLabels={tableGridData.row_labels || []}
                      columnLabels={tableGridData.column_labels || []}
                      answerMatrix={tableGridData.answer_matrix || []}
                      selectionMode={tableGridData.selection_mode || "single"}
                      firstColumnHeader={tableGridData.first_column_header}
                      onRowLabelChange={() => { }}
                      onColumnLabelChange={() => { }}
                      onCellToggle={() => { }}
                      onAddRow={() => { }}
                      onRemoveRow={() => { }}
                      onAddColumn={() => { }}
                      onRemoveColumn={() => { }}
                      previewOnly={true}
                      readOnlyCellTags={tableGridCellTags}
                    />
                  ) : (
                    <div className="text-gray-400 text-sm">No table data.</div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex flex-col gap-2">
                {context === "test-pack" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleActive}
                    disabled={isToggling}
                    className={
                      question.is_active ? "text-green-500" : "text-gray-400"
                    }
                    title={
                      question.is_active
                        ? "Deactivate Question"
                        : "Activate Question"
                    }
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                )}
                {(["MC", "MA", "RC", "REA", "REB"].includes(question.question_type) && question.choices && question.choices.length > 0) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:border-blue-600"
                    onClick={() => handleEditChoices(question)}
                  >
                    Edit Choices
                  </Button>
                )}
                {context === "test-pack" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (onEditQuestionNumber) {
                        onEditQuestionNumber(question);
                      } else {
                        setQuestionNumberEditor({ open: true, question });
                      }
                    }}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400"
                  >
                    {question.question_number ? "Edit Question Number" : "Assign Question Number"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-500 text-purple-700 hover:bg-purple-50 hover:border-purple-600"
                  onClick={async () => {
                    // PostHog tracking
                    const userName = getUserName();
                    /* console.log('PostHog tracking - Edit Passage:', {
                      userName,
                      user,
                      userEmail: user?.email,
                      userNameFromUser: user?.name
                    }); */

                    posthog.capture('edit_passage_button_clicked', {
                      user_name: userName,
                      user_email: user?.email || 'unknown',
                      user_id: user?.id || 'unknown',
                      user_role: user?.role || 'unknown',
                      question_id: question.question_id || question.id,
                      question_type: question.question_type,
                      subject: question.subject,
                      timestamp: new Date().toISOString()
                    });

                    // For DND questions, check if we're editing passage or question
                    if (getQuestionTypeAcronym(question) === "DND") {
                      // If editing passage, open RC form for passage editing
                      if (onEditPassage && (question.passage_id || question.passage)) {
                        /* console.log("🔍 [RCQuestionCard] DND question - opening RCForm for passage editing"); */
                        onEditPassage(question);
                        return;
                      } else {
                        // If editing question content, open DND form
                        /* console.log("🔍 [RCQuestionCard] DND question detected, opening DND form"); */
                        try {
                          const endpoint = getDndEndpoint(question, import.meta.env.VITE_API_URL);
                          const response = await fetch(endpoint);
                          if (!response.ok) throw new Error("Failed to fetch DND details");
                          const dndData = await response.json();
                          const transformedData = transformDndDataForModal(dndData, question);
                          onEditQuestion(transformedData);
                        } catch (error) {
                          console.error("🔍 [RCQuestionCard] Error fetching DND details:", error);
                          const questionData = { ...question, question_type: "DND" };
                          onEditQuestion(questionData);
                        }
                        return;
                      }
                    }

                    // For non-DND questions, check for passage editing
                    if (onEditPassage && (question.passage_id || question.passage)) {
                      /* console.log("🔍 [RCQuestionCard] Opening RCForm for passage editing"); */
                      onEditPassage(question);
                    } else {
                      /* console.log("🔍 [RCQuestionCard] Falling back to onEditQuestion"); */
                      // Pass isPassageEdit=true to force RC form for passage editing
                      const questionWithPassageEdit = { ...question, isPassageEdit: true };
                      onEditQuestion(questionWithPassageEdit);
                    }
                  }}
                >
                  Edit Passage
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500 text-green-700 hover:bg-green-50 hover:border-green-600"
                  onClick={async () => {
                    // PostHog tracking
                    const userName = getUserName();
                    /* console.log('PostHog tracking - Edit Question:', {
                      userName,
                      user,
                      userEmail: user?.email,
                      userNameFromUser: user?.name
                    }); */

                    posthog.capture('edit_question_button_clicked', {
                      user_name: userName,
                      user_email: user?.email || 'unknown',
                      user_id: user?.id || 'unknown',
                      user_role: user?.role || 'unknown',
                      question_id: question.question_id || question.id,
                      question_type: question.question_type,
                      subject: question.subject,
                      timestamp: new Date().toISOString()
                    });

                    // For DnD questions, always use DnD form regardless of onEditQuestionText
                    if (getQuestionTypeAcronym(question) === "DND") {
                      // For DND questions, fetch detailed data like TestPack.tsx does
                      try {
                        /* console.log("🔍 [RCQuestionCard] Fetching DND details for question:", question.id || question.question_id); */

                        const endpoint = getDndEndpoint(question, import.meta.env.VITE_API_URL);
                        /* console.log("🔍 [RCQuestionCard] Using DND endpoint:", endpoint); */

                        const response = await fetch(endpoint);
                        if (!response.ok) throw new Error("Failed to fetch DND details");
                        const dndData = await response.json();
                        /* console.log("🔍 [RCQuestionCard] DND data fetched:", dndData); */

                        // Transform data for QuestionModal using utility function
                        const transformedData = transformDndDataForModal(dndData, question);
                        /* console.log("🔍 [RCQuestionCard] Transformed DND data for modal:", transformedData); */
                        onEditQuestion(transformedData);

                      } catch (error) {
                        console.error("🔍 [RCQuestionCard] Error fetching DND details:", error);
                        // Fallback to existing data if fetch fails
                        const questionData = dndData ? {
                          ...question,
                          buckets: dndData.buckets || question.buckets || [],
                          choices: dndData.choices || question.choices || [],
                          assignments: dndData.assignments || question.assignments || [],
                          question_category: dndData.question?.question_category || question.question_category,
                          question_type: "DND"
                        } : { ...question, question_type: "DND" };
                        /* console.log("🔍 [RCQuestionCard] Using fallback DND data:", questionData); */
                        onEditQuestion(questionData);
                      }
                    } else if (onEditQuestionText && !["MC", "MA", "TABLE_GRID"].includes(getQuestionTypeAcronym(question))) {
                      // For non-DnD, non-MA/MC/TABLE_GRID questions, use text editing if available
                      onEditQuestionText(question);
                    } else {
                      // For other question types (including MA/MC/TABLE_GRID), call full onEditQuestion
                      onEditQuestion(question);
                    }
                  }}
                >
                  Edit Question
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-700 hover:bg-red-50 hover:border-red-600"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this question from the
                        passage. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Metadata Footer */}
              <div className="mt-4 pt-2 border-t border-gray-100 text-xs text-gray-600 flex flex-col gap-0.5">
                <div className="flex flex-wrap gap-4">
                  <span>
                    <span className="font-semibold">Created by:</span>{" "}
                    <span className="font-medium text-gray-700">
                      {question.created_by || "Unknown"}
                    </span>
                    <span className="ml-2">
                      on{" "}
                      {question.created_at
                        ? formatDate(question.created_at)
                        : "—"}
                    </span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-4">
                  <span>
                    <span className="font-semibold">Last edited by:</span>{" "}
                    <span className="font-medium text-gray-700">
                      {question.last_edited_by || "Unknown"}
                    </span>
                    <span className="ml-2">
                      on{" "}
                      {question.updated_at
                        ? formatDate(question.updated_at)
                        : "—"}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-semibold">Question ID:</span>
                  <span className="font-medium text-gray-700">{question.id}</span>
                  <button
                    onClick={handleCopyId}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-600"
                    title="Copy Question ID"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full p-4 border-r overflow-y-auto overflow-x-hidden max-h-[600px] min-w-0 max-w-full">
            {/* Header Row: Question # and Page # */}
            <div className="flex flex-row justify-between items-center">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="flex items-center gap-2">
                    {question.question_number ? (
                      <span className="text-lg font-semibold text-gray-800">Q{question.question_number}</span>
                    ) : (
                      <span className="text-lg font-semibold text-gray-400">No number</span>
                    )}
                  </span>
                  {question.page_number && (
                    <span className="text-sm text-gray-500">Page {question.page_number}</span>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {question.subject && (
                    <Badge
                      variant="default"
                      className={
                        question.subject === "Math"
                          ? "bg-blue-100 text-blue-800"
                          : question.subject === "ELA"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                      }
                    >
                      {question.subject === "Math" ? "Mathematics" : question.subject}
                    </Badge>
                  )}
                  {/* New Category badge */}
                  {question.category_name && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {question.category_name}
                    </Badge>
                  )}
                  {question.category && badge(question.category, "secondary")}
                </div>

                {/* Meta info with editable chapter/topic/subtopic */}
                <EditableMetaInfoSection question={question} context={(context as "question-bank" | "test-pack") || "question-bank"} />
              </div>

              <div className="text-sm">60 questions</div>
            </div>

            {/* Passage Content */}
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold mb-2">Passage</h3>
              {question.passage && (
                <div className="whitespace-pre-line text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: question.passage }} />
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-semibold text-gray-600">Question ID:</span>
                  <span className="font-medium text-gray-700">{question.id}</span>
                  <button
                    onClick={handleCopyId}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-600"
                    title="Copy Question ID"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={handleAddQuestions}
                className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors flex items-center gap-1"
              >
                Add Questions
              </button>
            </div>
          </div>
        )}

        {/* Bulk Question Modal */}
        <BulkQuestionModal
          isOpen={showBulkQuestionModal}
          onClose={() => setShowBulkQuestionModal(false)}
          passageId={question.passage_id || question.id}
          testId={question.test_id}
          onSuccess={handleBulkQuestionSuccess}
        />
      </div>
      {/* Question Number Editor Modal */}
      {questionNumberEditor.open && questionNumberEditor.question && (
        <QuestionNumberEditor
          isOpen={questionNumberEditor.open}
          onClose={() => setQuestionNumberEditor({ open: false, question: null })}
          question={questionNumberEditor.question}
          testId={questionNumberEditor.question.test_id}
          onSuccess={onRefresh || (() => { })}
        />
      )}

      {/* Activate Question Modal */}
      {activateModal.open && activateModal.question && (
        <ActivateQuestionModal
          isOpen={activateModal.open}
          onClose={() => setActivateModal({ open: false, question: null })}
          question={activateModal.question}
          testId={activateModal.question.test_id}
          onSuccess={onRefresh || (() => { })}
        />
      )}
    </>
  );
};