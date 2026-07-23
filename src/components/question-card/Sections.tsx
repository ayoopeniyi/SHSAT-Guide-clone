import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger, DialogContent } from "../ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog";
import { Power, Trash2 } from "lucide-react";
import { GraphSelectorStaticPreview, RaySelectorStaticPreview } from "./Previews";
import { getChoiceText, getQuestionTypeAcronym, relabelChoices } from "./utils";
import { FormKitDnDReadOnly } from "../question-modal/dnd-components/FormKitDnDReadOnly";
import { MCDragDropPreview } from "../question-modal/dnd-components/MCDragDropPreview";
import { EditableMetaInfoSection } from "./EditableMetaInfoSection";
import { ChoiceTagPills } from "./ChoiceTagPills";
import type { ChoiceTag } from "../../services/tagService";

export const HeaderSection = ({ question, context, isToggling, onToggleActive }: any) => (
  <div className="flex justify-between items-center mb-2">
    <div className="flex items-center gap-2">
      {question.question_number ? (
        <span className="text-lg font-semibold text-gray-800">Q{question.question_number}</span>
      ) : (
        <span className="text-lg font-semibold text-gray-400">No number</span>
      )}
      {question.page_number && (
        <span className="text-sm text-gray-500">Page {question.page_number}</span>
      )}
    </div>
    <div className="flex items-center gap-2">
      {context === "test-pack" && (
        <Button variant="ghost" size="icon" onClick={onToggleActive} disabled={isToggling} className={question.is_active ? "text-green-500" : "text-gray-400"} title={question.is_active ? "Deactivate Question" : "Activate Question"}>
          <Power className="h-4 w-4" />
        </Button>
      )}
    </div>
  </div>
);

export const MetaBadgesSection = ({ question, context }: any) => {
  const getDifficultyColor = (difficulty: any) => {
    if (typeof difficulty === "number") {
      switch (difficulty) {
        case 1: return "bg-green-100 text-green-800 border-green-200";
        case 2: return "bg-lime-100 text-lime-800 border-lime-200";
        case 3: return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case 4: return "bg-orange-100 text-orange-800 border-orange-200";
        case 5: return "bg-red-100 text-red-800 border-red-200";
        default: return "bg-gray-100 text-gray-800 border-gray-200";
      }
    } else {
      const difficultyStr = String(difficulty).toUpperCase();
      switch (difficultyStr) {
        case 'VERY EASY':
        case 'EASY':
          return "bg-green-100 text-green-800 border-green-200";
        case 'MEDIUM':
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case 'HARD':
        case 'VERY HARD':
          return "bg-red-100 text-red-800 border-red-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    }
  };

  const getDifficultyText = (difficulty: any) => {
    if (typeof difficulty === "number") {
      const text = ({ 1: "Very Easy", 2: "Easy", 3: "Medium", 4: "Hard", 5: "Very Hard" } as any)[difficulty] || `Level ${difficulty}`;
      return `${difficulty} - ${text}`;
    }
    return String(difficulty);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 mb-1">
      {question.subject && (
        <Badge variant="default" className={(question.subject === "Math" || question.subject === "Mathematics") ? "bg-blue-100 text-blue-800" : question.subject === "ELA" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {question.subject === "Math" ? "Mathematics" : question.subject}
        </Badge>
      )}
      {question.category_name && (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{question.category_name}</Badge>
      )}
      {question.category && <Badge variant="secondary">{question.category}</Badge>}
      {/* Only show Active/Inactive badge for test packs, not question bank */}
      {context === "test-pack" && (
        <Badge variant={question.is_active ? "default" : "secondary"} className={`capitalize ${question.is_active ? "bg-green-100 text-green-800" : ""}`}>{question.is_active ? "Active" : "Inactive"}</Badge>
      )}
    </div>
  );
};

export const MetaInfoSection = ({ question }: any) => {
  return (
    <div className="text-xs text-gray-500 mb-2">
      {/* All badges in a single line */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Question Type Badge */}
        {getQuestionTypeAcronym(question) && (
          <Badge variant="default" className="bg-purple-100 text-purple-800 font-medium">
            {getQuestionTypeAcronym(question) === "BLANK" && (question as any).question_category === "fill_box"
              ? "Blank Box Question"
              : getQuestionTypeAcronym(question) === "BLANK"
                ? "Blank Question"
                : `${getQuestionTypeAcronym(question)} Question`}
          </Badge>
        )}

        {/* Question Subtype Badge */}
        {question.question_subtype && (
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 font-medium">
            {question.question_subtype === 'drag_drop' ? 'Drag & Drop' :
              question.question_subtype === 'standard' ? 'Standard' :
                question.question_subtype === 'two_buckets_single' ? 'Two Buckets Single' :
                  question.question_subtype === 'two_buckets_multi' ? 'Two Buckets Multi' :
                    question.question_subtype === 'one_bucket_multi' ? 'One Bucket Multi' :
                      question.question_subtype === 'one_bucket_single' ? 'One Bucket Single' :
                        question.question_subtype === 'table_dnd' ? 'Table DND' :
                          question.question_subtype === 'fill_box' ? 'Fill Box' :
                            question.question_subtype === 'single' ? 'Single Select' :
                              question.question_subtype === 'multiple' ? 'Multi Select' :
                                question.question_subtype}
          </Badge>
        )}

        {/* Question Category Badge */}
        {question.question_category && question.question_category !== 'standard' && (
          <Badge variant="secondary" className={`font-medium capitalize ${question.question_category.toLowerCase() === 'drill'
            ? 'bg-orange-100 text-orange-800'
            : question.question_category.toLowerCase() === 'practice'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
            }`}>
            {question.question_category}
          </Badge>
        )}

        {/* Chapter Badge */}
        {question.chapter_number && typeof question.chapter_number === 'number' && question.chapter_title && question.chapter_title.trim() !== '' && (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
            Ch {question.chapter_number}: {question.chapter_title}
          </Badge>
        )}

        {/* Topic Badge */}
        {question.topic_title &&
          question.topic_title.toLowerCase() !== question.question_category?.toLowerCase() && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              {question.topic_title}
            </Badge>
          )}

        {/* Sub-topic Badge */}
        {question.sub_topic_title &&
          question.sub_topic_title.toLowerCase() !== question.question_category?.toLowerCase() &&
          question.sub_topic_title.toLowerCase() !== question.topic_title?.toLowerCase() && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              {question.sub_topic_title}
            </Badge>
          )}
      </div>
    </div>
  );
};

export const ImagePreview = ({ src, alt, maxH = 48 }: any) => (
  <div className="mb-3 flex flex-col items-center">
    <Dialog>
      <DialogTrigger asChild>
        <img src={src} alt={alt} className={`max-w-full h-auto max-h-${maxH} rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity`} />
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto p-4">
        <img src={src} alt={`${alt} - full size`} className="w-full h-auto object-contain" />
      </DialogContent>
    </Dialog>
    <div className="text-xs text-gray-500 mt-1 text-center">Click to view full size</div>
  </div>
);

export const HotTextSection = ({ question }: any) => (
  <>
    <div className="mb-1 text-sm question-content break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: question.question }} />
    {question.question_image_url && (
      <ImagePreview src={question.question_image_url} alt="Question image" />
    )}
    {question.prompt && (
      <div className="text-gray-500 italic mb-2">{question.prompt}</div>
    )}
  </>
);

export const DndSection = ({ question, loading, choiceTags }: any) => {
  if (loading) {
    return (
      <>
        <div className="mb-2 text-sm font-medium question-content text-gray-900 break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: question.content || question.question }} />
        <div className="text-gray-400 text-sm">Loading drag and drop...</div>
      </>
    );
  }

  // Check if we have DND data
  if (!question.buckets || !question.choices || !question.assignments) {
    return (
      <>
        <div className="mb-2 text-sm font-medium question-content text-gray-900 break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: question.content || question.question }} />
        <div className="text-gray-400 text-sm">No drag and drop data available.</div>
      </>
    );
  }

  // Determine DND subtype
  const dndSubtype = question.question_subtype ||
    question.dnd_subtype ||
    question.question_category ||
    (question.buckets?.length === 1 ? "one_bucket_multi" : "single_assignment");

  /* console.log("🔍 [DndSection] DND subtype detection:", {
    question_subtype: question.question_subtype,
    dnd_subtype: question.dnd_subtype,
    question_category: question.question_category,
    buckets_length: question.buckets?.length,
    detected_dndSubtype: dndSubtype,
    buckets: question.buckets
  }); */

  return (
    <>
      <div className="mb-2 text-sm font-medium question-content text-gray-900 break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: question.content || question.question }} />
      {question.question_image_url && <ImagePreview src={question.question_image_url} alt="Question image" />}

      {/* Render DND Preview */}
      <div className="mt-3 p-3 border rounded-lg bg-gray-50">
        <div className="text-xs text-gray-500 mb-2">Drag and Drop Preview:</div>
        <FormKitDnDReadOnly
          dndQuestion={question.content || question.question}
          dndChoices={question.choices || []}
          dndBuckets={question.buckets || []}
          assignments={question.assignments || []}
          dndSubtype={dndSubtype}
          choiceTags={choiceTags}
        />
      </div>
    </>
  );
};

export const BlankSection = ({ question }: any) => (
  <>
    <div className="mb-2 text-sm font-medium question-content text-gray-900 break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: question.question || question.content || "" }} />
    {question.question_image_url && <ImagePreview src={question.question_image_url} alt="Question image" />}
    {(question.correct_answer != null && question.correct_answer !== "") || (question.answer != null && question.answer !== "") ? (
      <div className="mb-2">
        <div className="text-xs text-gray-500 mb-1">Answer:</div>
        <div className="rounded bg-green-50 px-3 py-2 text-green-800 font-mono text-sm">{question.correct_answer || question.answer}</div>
      </div>
    ) : null}
  </>
);

export const TableGridSection = ({ loading, children, question }: any) => (
  <div className="border rounded-lg p-2 bg-gray-50">
    {question && (
      <div className="mb-2 text-sm font-medium question-content text-gray-900 break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: question.question || question.content || "" }} />
    )}
    {loading ? <div className="text-gray-400 text-sm">Loading table...</div> : children}
  </div>
);

export const RaySelectorSection = ({ question, data, loading }: any) => (
  <>
    <div className="mb-2 text-sm font-medium question-content text-gray-900 break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: question.question }} />
    {question.question_image_url && <ImagePreview src={question.question_image_url} alt="Question image" />}
    {loading ? <div className="text-gray-400 text-sm">Loading ray selector...</div> : data ? (
      <div><RaySelectorStaticPreview min={data.numberline_min} max={data.numberline_max} tick={data.tick_interval} /></div>
    ) : <div className="text-gray-400 text-sm">No ray selector data.</div>}
  </>
);

export const GraphSelectorSection = ({ question, data, loading }: any) => (
  <>
    <div className="mb-2 text-sm font-medium question-content text-gray-900 break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: question.question }} />
    {question.question_image_url && <ImagePreview src={question.question_image_url} alt="Question image" />}
    {data?.graph_instruction && <div className="mb-1 text-sm text-gray-600 italic">{data.graph_instruction}</div>}
    {loading ? <div className="text-gray-400 text-sm">Loading graph selector...</div> : data ? (
      <div className="mb-1 w-full max-w-full overflow-hidden">
        <GraphSelectorStaticPreview xMin={data.x_min} xMax={data.x_max} yMin={data.y_min} yMax={data.y_max} points={data.points || []} showAxes={data.show_axes} showLabels={data.show_labels} xAxisLabel={data.x_axis_label} yAxisLabel={data.y_axis_label} />
      </div>
    ) : <div className="text-gray-400 text-sm">No graph selector data.</div>}
  </>
);

export const GenericQuestionSection = ({ question }: any) => (
  <>
    <div
      className="mb-2 text-sm font-medium question-content text-gray-900 break-words overflow-hidden"
      dangerouslySetInnerHTML={{ __html: question.question }}
    />
    {question.question_image_url && (
      <ImagePreview src={question.question_image_url} alt="Question image" />
    )}
  </>
);

export const ChoicesSection = ({ question, context, choices, loadingTestPackMC, choiceTags }: any) => {
  // Check if this is an MC drag and drop question
  const isMCDragDrop = getQuestionTypeAcronym(question) === "MC" && question.question_subtype === "drag_drop";

  // Convert choices to MCChoice format for drag and drop preview
  const convertToMCChoices = (choices: any[]) => {
    return relabelChoices(choices).map((choice: any, idx: number) => {
      let letter = (choice as any).letter ?? (choice as any).choice_label;
      let text = getChoiceText(choice);
      let isCorrect = !!((choice as any).is_correct ?? (choice as any).value?.is_correct);
      let choiceImageUrl = (choice as any).choice_image_url || (choice as any).value?.choice_image_url;
      if (!letter) letter = String.fromCharCode(65 + idx);

      return {
        letter,
        value: {
          text,
          is_correct: isCorrect,
          choice_image_url: choiceImageUrl
        }
      };
    });
  };

  return ((choices && choices.length > 0) || (context === "test-pack" && loadingTestPackMC)) ? (
    <>
      {context === "test-pack" && getQuestionTypeAcronym(question) === "MC" && loadingTestPackMC ? (
        <div className="mb-2 text-gray-400 text-sm">Loading choices...</div>
      ) : isMCDragDrop ? (
        // Render drag and drop preview for MC drag_drop subtype
        <div className="mb-2">
          <MCDragDropPreview
            mcQuestion={question.question}
            mcChoices={convertToMCChoices(choices)}
            isPreview={false}
            showLabels={true}
          />
        </div>
      ) : (
        // Render standard choices for other question types
        <div className="mb-2 grid grid-cols-2 gap-2">
          {relabelChoices(choices).map((choice: any, idx: number) => {
            let letter = (choice as any).letter ?? (choice as any).choice_label;
            let text = getChoiceText(choice);
            let isCorrect = !!((choice as any).is_correct ?? (choice as any).value?.is_correct);
            let choiceImageUrl = (choice as any).choice_image_url || (choice as any).value?.choice_image_url;
            if (!letter) letter = String.fromCharCode(65 + idx);
            const choiceId = String((choice as any).id || (choice as any).choice_id || "");
            const tags: ChoiceTag[] = choiceTags?.[choiceId] || [];
            return (
              <div key={idx} className={`rounded px-3 py-2 border transition-colors duration-150 ${isCorrect ? "border-green-300 bg-green-50" : "border-gray-200 bg-blue-50 hover:bg-blue-100"}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold mr-2">{letter}:</span>
                      <div className="font-semibold" dangerouslySetInnerHTML={{ __html: text }} />
                      {isCorrect && (<span className="ml-2 text-green-600 font-bold">✓</span>)}
                    </div>
                    {choiceImageUrl && (
                      <div className="mt-2 flex flex-col items-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <img src={choiceImageUrl} alt={`Choice ${letter} image`} className="max-w-full h-auto max-h-32 rounded border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity object-contain" />
                          </DialogTrigger>
                          <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto p-4">
                            <img src={choiceImageUrl} alt={`Choice ${letter} image - full size`} className="w-full h-auto object-contain" />
                          </DialogContent>
                        </Dialog>
                        <div className="text-xs text-gray-400 mt-1 text-center">Click to enlarge</div>
                      </div>
                    )}
                    <ChoiceTagPills tags={tags} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  ) : null;
};

export const ActionsSection = ({ question, context, isDeleting, onEditChoices, onEditQuestion, onDelete, onEditQuestionNumber }: any) => (
  <div className="mt-1 flex justify-end gap-1">
    {context === "test-pack" && onEditQuestionNumber && (
      <Button variant="outline" size="sm" onClick={() => onEditQuestionNumber(question)} className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400">{question.question_number ? "Edit Question Number" : "Assign Question Number"}</Button>
    )}
    {(["MC", "MA"].includes(getQuestionTypeAcronym(question))) ? (
      <Button variant="outline" size="sm" className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:border-blue-600" onClick={() => onEditChoices(question)}>Edit Choices</Button>
    ) : null}
    <Button variant="outline" size="sm" className="border-purple-500 text-purple-700 hover:bg-purple-50 hover:border-purple-600" onClick={() => onEditQuestion(question)}>Edit Question</Button>
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive" onClick={e => e.stopPropagation()} disabled={isDeleting}>
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this question?</AlertDialogTitle>
          <AlertDialogDescription>Are you sure you want to delete this question? This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} disabled={isDeleting}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
);

// Export the editable version for use in question cards
export { EditableMetaInfoSection };
