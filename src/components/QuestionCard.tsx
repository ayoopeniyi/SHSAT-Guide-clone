import type { Question } from "../types/questionBank";
import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { RCQuestionCard } from "./RCQuestionCard";
import { testPackService } from "../services/testPackService";
import { ActivateQuestionModal } from "./question-reordering/ActivateQuestionModal";
import { HeaderSection, MetaBadgesSection, MetaInfoSection, EditableMetaInfoSection, HotTextSection, DndSection, BlankSection, TableGridSection, RaySelectorSection, GraphSelectorSection, GenericQuestionSection, ChoicesSection, ActionsSection } from "./question-card/Sections";
import { ChoiceTagPills } from "./question-card/ChoiceTagPills";
import { EquationCalculator } from "./EquationCalculator";
import { subjectColors, getQuestionTypeAcronym } from "./question-card/utils";
import { useQuestionCardData } from "./question-card/useQuestionCardData";
import TableGridEditor from "./TableGridEditor";
import { getHighlightedPassage } from "../utils/hotTextUtils.tsx";

interface QuestionCardProps {
  question: Question & { custom_passage?: string };
  context?: "question-bank" | "test-pack";
  onEditChoices: (question: Question) => void;
  onEditQuestion: (question: Question) => void;
  onEditPassage?: (question: Question) => void;
  onDelete: () => void;
  istestpack?: boolean;
  hasPassageFilter?: 'yes' | 'no' | 'any' | undefined;
  isDeleting?: boolean;
  onRefresh?: () => void;
  onEditQuestionNumber?: (question: Question) => void;
}

// local types

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  context = "question-bank",
  onEditChoices,
  onEditQuestion,
  onEditPassage,
  onDelete,
  istestpack: _istestpack,
  hasPassageFilter,
  isDeleting,
  onRefresh,
  onEditQuestionNumber,
}) => {
  const [isToggling, setIsToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activateModal, setActivateModal] = useState<{ open: boolean; question: any | null }>({ open: false, question: null });

  const {
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
  } = useQuestionCardData(question, context);

  const handleToggleActive = async () => {
    if (!question.question_id || !question.test_id) {
      toast.error("Cannot toggle question: missing question or test ID");
      return;
    }

    if (!question.is_active) {
      setActivateModal({ open: true, question });
      return;
    }

    setIsToggling(true);
    try {
      await testPackService.toggleQuestionActive(
        question.question_id,
        question.test_id,
        false,
      );
      toast.success("Question deactivated successfully");
      if (onRefresh) onRefresh();
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

  const handleEditChoices = (q: Question) => {
    const choicesToEdit =
      context === "test-pack" && testPackMCData?.choices
        ? testPackMCData.choices.map((choice: any) => ({
          choice_label: choice.choice_label,
          choice_text: choice.answer_text,
          is_correct: choice.is_correct,
          choice_image_url: choice.choice_image_url,
          id: choice.id,
        }))
        : (q.choices || []).map((choice: any) => {
          if (choice && typeof choice === 'object' && 'value' in choice && typeof choice.value === "string") {
            return {
              ...choice,
              value: {
                text: choice.value,
                is_correct: false,
                explanation: "",
              },
            };
          }
          return choice;
        });
    const questionWithType = { ...q, choices: choicesToEdit as any[] } as Question;
    onEditChoices(questionWithType);
  };

  const handleEditQuestion = (
    q: Question & { custom_passage?: string },
  ) => {
    if (
      context === "test-pack" &&
      getQuestionTypeAcronym(q) === "HOT_TEXT"
    ) {
      const initialValues = { ...q, passage: q.custom_passage || "" };
      onEditQuestion(initialValues);
    } else if (getQuestionTypeAcronym(q) === "DND") {
      // For DND questions, pass the complete DND data (buckets, choices, assignments)
      const completeDndData = dndData || q;
      onEditQuestion(completeDndData);
    } else if (getQuestionTypeAcronym(q) === "RAY_SELECTOR") {
      onEditQuestion(q);
    } else {
      onEditQuestion(q);
    }
  };

  const getChoicesData = () => {
    if (context === "test-pack" && testPackMCData?.choices) return testPackMCData.choices;
    return question.choices || [];
  };

  const passageIdNum = Number(question.passage_id);
  if (!isNaN(passageIdNum) && passageIdNum > 0) {
    return (
      <RCQuestionCard
        question={question}
        onEditChoices={onEditChoices}
        onEditQuestion={onEditQuestion}
        onEditPassage={onEditPassage}
        onDelete={onDelete}
        hasPassageFilter={hasPassageFilter}
        context={context}
      />
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-2 relative hover:shadow-md transition-shadow border-l-4 w-full max-w-full overflow-hidden ${subjectColors[question.subject || ""] || "border-gray-200"}`}>
      <HeaderSection question={question} context={context} isToggling={isToggling} onToggleActive={handleToggleActive} />
      <MetaBadgesSection question={question} context={context} />
      <EditableMetaInfoSection question={question} context={context} />

      {/* General Question Content - Display for all question types that don't have specific content sections */}
      {!["HOT_TEXT", "MC", "MA", "REA", "REB", "TABLE_GRID", "DND", "RAY_SELECTOR", "GRAPH_SELECTOR", "BLANK", "EQUATION_CALCULATOR"].includes(getQuestionTypeAcronym(question)) && (
        <div className="mb-2 text-sm font-medium question-content text-gray-900 break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: question.question || question.content || "" }} />
      )}

      {getQuestionTypeAcronym(question) === "HOT_TEXT" && (
        <>
          <HotTextSection question={question} />
          {(context === "test-pack" ? question.custom_passage : question.passage) && (
            <div className="whitespace-pre-line text-lg leading-relaxed mb-2">
              {getHighlightedPassage(context === "test-pack" ? question.custom_passage || "" : question.passage || "", question.regions || [])}
            </div>
          )}
          {hotTextRegions.length > 0 && Object.keys(choiceTags).length > 0 && (
            <div className="mt-2 space-y-1">
              {hotTextRegions.map((region: any, idx: number) => {
                const tags = choiceTags[String(region.id)] || [];
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
        </>
      )}

      {(["MC", "MA", "REA", "REB"].includes(getQuestionTypeAcronym(question))) && (
        <GenericQuestionSection question={question} />
      )}

      {getQuestionTypeAcronym(question) === "DND" && (
        <DndSection question={dndData || question} loading={loadingDnd} choiceTags={choiceTags} />
      )}

      {getQuestionTypeAcronym(question) === "BLANK" && (
        <>
          <BlankSection question={question} />
          <ChoiceTagPills tags={choiceTags[String(questionId)] || []} />
        </>
      )}

      {getQuestionTypeAcronym(question) === "TABLE_GRID" && (
        <>
          <TableGridSection loading={loadingTableGrid} question={question}>
            {tableGridData ? (
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
                readOnlyCellTags={choiceTags}
              />
            ) : (
              <div className="text-gray-400 text-sm">No table data.</div>
            )}
          </TableGridSection>
        </>
      )}

      {getQuestionTypeAcronym(question) === "RAY_SELECTOR" && (
        <>
          <RaySelectorSection question={question} data={raySelectorData} loading={loadingRaySelector} />
          <ChoiceTagPills tags={choiceTags[String(questionId)] || []} />
        </>
      )}

      {getQuestionTypeAcronym(question) === "GRAPH_SELECTOR" && (
        <>
          <GraphSelectorSection question={question} data={graphSelectorData} loading={loadingGraphSelector} />
          {graphSelectorData?.points?.length > 0 && Object.keys(choiceTags).length > 0 && (
            <div className="mt-2 space-y-1">
              {(graphSelectorData.points as any[]).map((point: any, idx: number) => {
                const tags = choiceTags[String(point.id)] || [];
                if (!tags.length) return null;
                const label = point.point_label || `(${point.x}, ${point.y})`;
                return (
                  <div key={point.id || idx} className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 shrink-0 mt-0.5 font-medium">{label}:</span>
                    <ChoiceTagPills tags={tags} />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {getQuestionTypeAcronym(question) === "EQUATION_CALCULATOR" && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-900 mb-2">Equation Calculator:</div>
          <EquationCalculator
            onAnswerChange={(answer) => {
              /* console.log('Calculator answer changed:', answer); */
            }}
            question={{
              id: question.id,
              question_number: question.question_number || 1,
              question_type: question.question_type,
              question: question.question || question.content || "",
              answer: question.answer || "",
              content: question.content || ""
            }}
            showAnswer={false}
            disabled={false}
            userAnswer=""
            isAnswerCorrect={false}
            correctAnswer={question.answer || ""}
          />
          <ChoiceTagPills tags={choiceTags[String(questionId)] || []} />
        </div>
      )}

      <ChoicesSection question={question} context={context} choices={getChoicesData()} loadingTestPackMC={loadingTestPackMC} onEditChoices={handleEditChoices} choiceTags={choiceTags} />

      {question.answer && !["MC", "MA", "BLANK"].includes(getQuestionTypeAcronym(question)) && (
        <div className="mb-2">
          <div className="text-xs text-gray-500 mb-1">Answer:</div>
          <div className="rounded bg-green-50 px-3 py-2 text-green-800 font-mono text-sm">{question.answer}</div>
        </div>
      )}

      <ActionsSection question={question} context={context} isDeleting={isDeleting} onEditChoices={handleEditChoices} onEditQuestion={handleEditQuestion} onDelete={onDelete} onEditQuestionNumber={onEditQuestionNumber} />

      <div className="mt-2 pt-1 border-t border-gray-100 text-xs text-gray-600 flex flex-col gap-0.5 font-normal">
        <div className="flex flex-wrap gap-4">
          <span>
            <span className="font-semibold">Created by:</span>{" "}
            <span className="font-medium text-gray-700">{question.created_by || "Unknown"}</span>
            <span className="ml-2">on {question.created_at ? (new Date(question.created_at)).toLocaleDateString() : "—"}</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-4">
          <span>
            <span className="font-semibold">Last edited by:</span>{" "}
            <span className="font-medium text-gray-700">{question.last_edited_by || "Unknown"}</span>
            <span className="ml-2">on {question.updated_at ? (new Date(question.updated_at)).toLocaleDateString() : "—"}</span>
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

      {activateModal.open && activateModal.question && (
        <ActivateQuestionModal
          isOpen={activateModal.open}
          onClose={() => setActivateModal({ open: false, question: null })}
          question={activateModal.question}
          testId={activateModal.question.test_id}
          onSuccess={onRefresh || (() => { })}
        />
      )}
    </div>
  );
};


