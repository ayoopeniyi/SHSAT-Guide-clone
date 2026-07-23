import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { testPackService } from "../services/testPackService";
import { TestPack, TestPackQuestion } from "../types";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ChevronLeft, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { TestPackQuestionModal } from "../components/TestPackQuestionModal";
import { Badge } from "../components/ui/badge";
import { TestPackEditModal } from "../components/test-pack/modals/TestPackEditModal";
import { TestPackEditChoicesModal } from "../components/test-pack/modals/TestPackEditChoicesModal";
import TableGridEditor from "../components/TableGridEditor";
import { QuestionModal } from "../components/QuestionModal";
import { QuestionReorderingModal } from "../components/question-reordering/QuestionReorderingModal";
import { QuestionNumberEditor } from "../components/question-reordering/QuestionNumberEditor";
import { TestValidationSummary } from "../components/question-reordering/TestValidationSummary";
import { EquationCalculator } from "../components/EquationCalculator";
import { getQuestionTypeAcronym } from "../utils/questionTypeUtils";
import { fetchHotTextDetails } from "../actions/HotTextActions";


export default function TestPackDetail() {
  const { id } = useParams<{ id: string }>();
  const [testPack, setTestPack] = useState<TestPack | null>(null);
  const [questions, setQuestions] = useState<TestPackQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [editQuestionModal, setEditQuestionModal] = useState<{
    open: boolean;
    question: any | null;
  }>({ open: false, question: null });
  const [editChoicesModal, setEditChoicesModal] = useState<{
    open: boolean;
    question: any | null;
  }>({ open: false, question: null });
  const [questionNumberEditor, setQuestionNumberEditor] = useState<{
    open: boolean;
    question: any | null;
  }>({ open: false, question: null });
  const [reorderModal, setReorderModal] = useState<{
    open: boolean;
    questions: any[];
  }>({ open: false, questions: [] });
  const [tableGridDetails, setTableGridDetails] = useState<Record<number, any>>(
    {},
  );
  const [mcDetails, setMcDetails] = useState<Record<number, any>>({});
  const [maDetails, setMaDetails] = useState<Record<number, any>>({});
  const fetchingTableGrid = useRef<Record<number, boolean>>({});
  const fetchingMC = useRef<Record<number, boolean>>({});
  const fetchingMA = useRef<Record<number, boolean>>({});

  useEffect(() => {
    if (id) loadTestPack();
  }, [id]);

  // Debug: Track edit modal state changes
  useEffect(() => {
    /* console.log(
      "[TestPackDetail] Edit modal state changed:",
      editQuestionModal,
    ); */
  }, [editQuestionModal]);

  useEffect(() => {
    if (!questions) return;

    questions.forEach((question) => {
      const qid = question.id;

      // Handle TABLE_GRID questions
      if (question.question_type_acronym === "TABLE_GRID") {
        const hasAllFields =
          (question as any).row_labels &&
          (question as any).column_labels &&
          (question as any).answer_matrix;
        if (!hasAllFields && !fetchingTableGrid.current[qid]) {
          fetchingTableGrid.current[qid] = true;
          fetch(
            `${import.meta.env.VITE_API_URL}/api/test-pack/table-grid/get/${qid}`,
          )
            .then((res) => res.json())
            .then((data) => {
              setTableGridDetails((prev) => ({ ...prev, [qid]: data }));
            })
            .catch((error) => {
              console.error("Error fetching TABLE_GRID details:", error);
            })
            .finally(() => {
              fetchingTableGrid.current[qid] = false;
            });
        }
      }

      // Handle MC questions
      else if (question.question_type_acronym === "MC") {
        const hasChoices =
          (question as any).choices &&
          Array.isArray((question as any).choices) &&
          (question as any).choices.length > 0;
        if (!hasChoices && !fetchingMC.current[qid]) {
          fetchingMC.current[qid] = true;
          fetch(
            `${import.meta.env.VITE_API_URL}/api/test-pack/mc/${qid}/details`,
          )
            .then((res) => res.json())
            .then((data) => {
              setMcDetails((prev) => ({ ...prev, [qid]: data }));
            })
            .catch((error) => {
              console.error("Error fetching MC details:", error);
            })
            .finally(() => {
              fetchingMC.current[qid] = false;
            });
        }
      }

      // Handle MA questions
      else if (question.question_type_acronym === "MA") {
        const hasChoices =
          (question as any).choices &&
          Array.isArray((question as any).choices) &&
          (question as any).choices.length > 0;
        if (!hasChoices && !fetchingMA.current[qid]) {
          fetchingMA.current[qid] = true;
          fetch(
            `${import.meta.env.VITE_API_URL}/api/test-pack/ma/${qid}/details`,
          )
            .then((res) => res.json())
            .then((data) => {
              setMaDetails((prev) => ({ ...prev, [qid]: data }));
            })
            .catch((error) => {
              console.error("Error fetching MA details:", error);
            })
            .finally(() => {
              fetchingMA.current[qid] = false;
            });
        }
      }
    });
  }, [questions]);

  const loadTestPack = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const packData = await testPackService.getById(parseInt(id));
      const questionsData = await testPackService.getQuestions(parseInt(id));
      setTestPack(packData);
      setQuestions(questionsData);
    } catch (error) {
      toast.error("Failed to load test pack");
      console.error("Error loading test pack:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (questionData: any) => {
    if (!id) return;
    try {
      // The modal already handles the API call, just refresh the questions
      toast.success("Question added successfully");
      loadTestPack();
    } catch (error) {
      toast.error("Failed to add question");
      console.error("Error adding question:", error);
    } finally {
      setShowAddQuestionModal(false);
    }
  };

  const handleDeleteQuestion = async (question: any) => {
    if (!confirm("Are you sure you want to remove this question?")) return;

    try {
      // Use specific delete functions based on question type
      const typeAcronym = getQuestionTypeAcronym(question);
      if (typeAcronym === "EQUATION_CALCULATOR") {
        await testPackService.deleteEquationCalculatorQuestion(question.question_id);
      } else {
        // Use generic removeQuestion for other types
        await testPackService.removeQuestion(parseInt(id!), question.id);
      }
      toast.success("Question removed successfully");
      loadTestPack();
    } catch (error) {
      toast.error("Failed to remove question");
      console.error("Error removing question:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!testPack) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-gray-500">Test pack not found</p>
          <Link to="/test-packs" className="text-blue-500 hover:underline">
            Back to Test Packs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4">
      <div className="mb-8">
        <Link
          to="/test-packs"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Test Packs
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 break-words">
            {testPack.name}
          </h1>
          <p className="text-gray-600">{questions.length} of 114 questions</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setReorderModal({ open: true, questions: questions.slice(0, 10) })}
            disabled={questions.length === 0}
          >
            Reorder Questions
          </Button>
          <Button
            onClick={() => setShowAddQuestionModal(true)}
            disabled={questions.length >= 114}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Validation Summary */}
      {id && (
        <div className="mb-6">
          <TestValidationSummary
            testId={parseInt(id)}
            onRefresh={loadTestPack}
            showDetails={true}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 w-full">
        {questions.map((question) => {
          // Get choices from original question or fetched details
          let displayChoices = (question as any).choices;
          if (
            question.question_type_acronym === "MC" &&
            (!displayChoices || displayChoices.length === 0)
          ) {
            displayChoices = mcDetails[question.id]?.choices;
            /* console.log("MC Q", question.id, {
              originalChoices: (question as any).choices,
              fetchedChoices: mcDetails[question.id]?.choices,
              usingFetched: !!mcDetails[question.id]?.choices,
            }); */
          } else if (
            question.question_type_acronym === "MA" &&
            (!displayChoices || displayChoices.length === 0)
          ) {
            displayChoices = maDetails[question.id]?.choices;
            /* console.log("MA Q", question.id, {
              originalChoices: (question as any).choices,
              fetchedChoices: maDetails[question.id]?.choices,
              usingFetched: !!maDetails[question.id]?.choices,
            }); */
          } else if (question.question_type_acronym === "TABLE_GRID") {
            /* console.log("TABLE_GRID Q", question.id, {
              originalData: {
                row_labels: (question as any).row_labels,
                column_labels: (question as any).column_labels,
                answer_matrix: (question as any).answer_matrix,
              },
              fetchedData: tableGridDetails[question.id],
              usingFetched: !!tableGridDetails[question.id],
            }); */
          }
          return (
            <Card key={question.id} className="overflow-hidden w-full">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg">
                      Question {question.question_number}
                    </span>
                    <Badge variant="outline">
                      {question.question_type_acronym}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {["MC", "MA"].includes(
                      question.question_type_acronym || "",
                    ) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:border-blue-600"
                          onClick={() => {
                            // Pass enhanced question data with fetched choices
                            const enhancedQuestion = {
                              ...question,
                              choices:
                                displayChoices || (question as any).choices,
                            };
                            setEditChoicesModal({
                              open: true,
                              question: enhancedQuestion,
                            });
                          }}
                        >
                          Edit Choices
                        </Button>
                      )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-500 text-purple-700 hover:bg-purple-50 hover:border-purple-600"
                      onClick={async () => {
                        // Pass enhanced question data with fetched details
                        let enhancedQuestion = { ...question };

                        if (
                          question.question_type_acronym === "MC" &&
                          mcDetails[question.id]
                        ) {
                          enhancedQuestion = {
                            ...enhancedQuestion,
                            ...mcDetails[question.id],
                          };
                        } else if (
                          question.question_type_acronym === "MA" &&
                          maDetails[question.id]
                        ) {
                          enhancedQuestion = {
                            ...enhancedQuestion,
                            ...maDetails[question.id],
                          };
                        } else if (
                          question.question_type_acronym === "TABLE_GRID" &&
                          tableGridDetails[question.id]
                        ) {
                          enhancedQuestion = {
                            ...enhancedQuestion,
                            ...tableGridDetails[question.id],
                          };
                          } else if (
                            question.question_type_acronym === "HOT_TEXT"
                          ) {
                            /* console.log(
                              "[TestPackDetail] Fetching Hot Text details for question:",
                              question.id,
                            ); */
                            try {
                              const hotTextData = await fetchHotTextDetails(question.id, true);
                              /* console.log(
                                "[TestPackDetail] Hot Text data fetched:",
                                hotTextData,
                              ); */
                              enhancedQuestion = {
                                ...enhancedQuestion,
                                ...hotTextData,
                              };
                            } catch (error) {
                              console.error(
                                "[TestPackDetail] Error fetching Hot Text details:",
                                error,
                              );
                              toast.error(
                                "Failed to load Hot Text question details",
                              );
                              return;
                            }

                        } else if (question.question_type_acronym === "DND") {
                          /* console.log(
                            "[TestPackDetail] Fetching DND details for question:",
                            (question as any).question_id,
                          ); */
                          try {
                            // Determine the correct endpoint based on question category
                            const category = (question as any)
                              .question_category;
                            let endpoint = "";

                            // Use category-specific endpoints for test pack
                            switch (category) {
                              case "two_buckets_single":
                                endpoint = `${import.meta.env.VITE_API_URL}/api/test-pack/dnd/two-buckets-single/${(question as any).question_id}`;
                                break;
                              case "two_buckets_multi":
                                endpoint = `${import.meta.env.VITE_API_URL}/api/test-pack/dnd/two-buckets-multi/${(question as any).question_id}`;
                                break;
                              case "one_bucket_multi":
                                endpoint = `${import.meta.env.VITE_API_URL}/api/test-pack/dnd/one-bucket-multi/${(question as any).question_id}`;
                                break;
                              case "one_bucket_single":
                                endpoint = `${import.meta.env.VITE_API_URL}/api/test-pack/dnd/one-bucket-single/${(question as any).question_id}`;
                                break;
                              case "table_dnd":
                                endpoint = `${import.meta.env.VITE_API_URL}/api/test-pack/dnd/table_dnd/get/${(question as any).question_id}`;
                                break;
                              case "mc_drag_drop":
                                endpoint = `${import.meta.env.VITE_API_URL}/api/test-pack/dnd/mc-style/${(question as any).question_id}`;
                                break;
                              case "blank_box":
                                endpoint = `${import.meta.env.VITE_API_URL}/api/test-pack/dnd/fill-blanks/${(question as any).question_id}`;
                                break;
                              default:
                                // Fallback to generic endpoint
                                endpoint = `${import.meta.env.VITE_API_URL}/api/test-pack/dnd/table-dnd/${(question as any).question_id}`;
                                break;
                            }

                            /* console.log(
                              "[TestPackDetail] Using DND endpoint:",
                              endpoint,
                            ); */

                            const response = await fetch(endpoint);
                            if (!response.ok)
                              throw new Error("Failed to fetch DND details");
                            const dndData = await response.json();
                            /* console.log(
                              "[TestPackDetail] DND data fetched:",
                              dndData,
                            ); */
                            // Combine the data similar to how question bank does it
                            const enhancedQuestionWithDnd = {
                              ...enhancedQuestion,
                              ...dndData.question, // Spread the question data
                              buckets: dndData.buckets || [],
                              choices: dndData.choices || [],
                              assignments: dndData.assignments || [],
                            };

                            enhancedQuestion = enhancedQuestionWithDnd as any;

                            // console.log('[TestPackDetail] Enhanced question structure:', {
                            //   question: enhancedQuestion.question,
                            //   buckets: enhancedQuestion.buckets,
                            //   choices: enhancedQuestion.choices,
                            //   assignments: enhancedQuestion.assignments
                            // });
                          } catch (error) {
                            console.error(
                              "[TestPackDetail] Error fetching DND details:",
                              error,
                            );
                            toast.error(
                              "Failed to fetch DND details. Opening modal with basic data.",
                            );
                            // Continue with basic question data if DND fetch fails
                          }
                        } else if (
                          question.question_type_acronym === "RAY_SELECTOR"
                        ) {
                          /* console.log(
                            "[TestPackDetail] Fetching Ray Selector details for question:",
                            (question as any).question_id,
                          ); */
                          try {
                            const response = await fetch(
                              `${import.meta.env.VITE_API_URL}/api/test-pack/ray-selector/get/${(question as any).question_id}`,
                            );
                            if (!response.ok)
                              throw new Error(
                                "Failed to fetch Ray Selector details",
                              );
                            const raySelectorData = await response.json();
                            /* console.log(
                              "[TestPackDetail] Ray Selector data fetched:",
                              raySelectorData,
                            ); */
                            // Structure the data similar to how DND does it - spread the API response data
                            // Ensure question_type is set for the modal prefill logic
                            enhancedQuestion = {
                              ...enhancedQuestion,
                              ...raySelectorData,
                              question_type: "RAY_SELECTOR", // Required for QuestionModal prefill
                              question_type_acronym: "RAY_SELECTOR", // Also set acronym for consistency
                            };
                            /* console.log(
                              "[TestPackDetail] Enhanced Ray Selector question structure:",
                              enhancedQuestion,
                            ); */
                          } catch (error) {
                            console.error(
                              "[TestPackDetail] Error fetching Ray Selector details:",
                              error,
                            );
                            toast.error(
                              "Failed to load Ray Selector question details",
                            );
                            return;
                          }
                        } else if (
                          getQuestionTypeAcronym(question) === "EQUATION_CALCULATOR"
                        ) {
                          try {
                            const response = await fetch(
                              `${import.meta.env.VITE_API_URL}/api/test-pack/equation-calculator/get/${(question as any).question_id}`,
                            );
                            if (!response.ok)
                              throw new Error("Failed to fetch Equation Calculator details");
                            const equationData = await response.json();

                            enhancedQuestion = {
                              ...enhancedQuestion,
                              ...equationData,
                              question_type: "EQUATION_CALCULATOR",
                              question_type_acronym: "EQUATION_CALCULATOR",
                            };
                          } catch (error) {
                            console.error(
                              "[TestPackDetail] Error fetching Equation Calculator details:",
                              error,
                            );
                            toast.error("Failed to load Equation Calculator question details");
                            return;
                          }
                        }

                        /* console.log(
                          "[TestPackDetail] Opening edit modal with enhanced question:",
                          enhancedQuestion,
                        ); */
                        /* console.log(
                          "[TestPackDetail] Setting edit modal state:",
                          { open: true, question: enhancedQuestion },
                        ); */
                        setEditQuestionModal({
                          open: true,
                          question: enhancedQuestion,
                        });
                        /* console.log(
                          "[TestPackDetail] Edit modal state set successfully",
                        ); */
                        /* console.log(
                          "[TestPackDetail] Current editQuestionModal state after set:",
                          editQuestionModal,
                        ); */
                      }}
                    >
                      Edit Question
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteQuestion(question)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="w-full">
                {question.custom_passage && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 w-full">
                    <h3 className="font-medium text-gray-900 mb-2">Passage</h3>
                    <div
                      className="prose prose-sm max-w-none w-full overflow-x-hidden"
                      dangerouslySetInnerHTML={{
                        __html: question.custom_passage,
                      }}
                    />
                  </div>
                )}
                <div className="space-y-4 w-full">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Question</h3>
                    <p className="text-gray-600 break-words whitespace-pre-wrap overflow-x-hidden">
                      {question.question}
                    </p>
                  </div>
                  {getQuestionTypeAcronym(question) === "TABLE_GRID" && (
                    <div className="w-full">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Table Grid
                      </h3>
                      <TableGridEditor
                        rowLabels={
                          (tableGridDetails[question.id]?.row_labels ??
                            (question as any).row_labels) ||
                          []
                        }
                        columnLabels={
                          (tableGridDetails[question.id]?.column_labels ??
                            (question as any).column_labels) ||
                          []
                        }
                        answerMatrix={
                          (tableGridDetails[question.id]?.answer_matrix ??
                            (question as any).answer_matrix) ||
                          []
                        }
                        selectionMode={
                          (tableGridDetails[question.id]?.selection_mode ??
                            (question as any).selection_mode) ||
                          "single"
                        }
                        firstColumnHeader={
                          tableGridDetails[question.id]?.first_column_header ??
                          (question as any).first_column_header
                        }
                        onRowLabelChange={() => { }}
                        onColumnLabelChange={() => { }}
                        onCellToggle={() => { }}
                        onAddRow={() => { }}
                        onRemoveRow={() => { }}
                        onAddColumn={() => { }}
                        onRemoveColumn={() => { }}
                        previewOnly={true}
                        alwaysShowCorrect={true}
                      />
                    </div>
                  )}
                  {getQuestionTypeAcronym(question) === "EQUATION_CALCULATOR" && (
                    <div className="w-full">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Equation Calculator
                      </h3>
                      <EquationCalculator
                        onAnswerChange={(answer) => {
                          /* console.log('Calculator answer changed:', answer); */
                        }}
                        question={question as any}
                        showAnswer={false}
                        disabled={false}
                        userAnswer=""
                        isAnswerCorrect={false}
                        correctAnswer={(question as any).answer || ""}
                      />
                    </div>
                  )}
                  {/* Loading indicator for MC/MA questions */}
                  {["MC", "MA"].includes(
                    question.question_type_acronym || "",
                  ) &&
                    (!displayChoices || displayChoices.length === 0) &&
                    (fetchingMC.current[question.id] ||
                      fetchingMA.current[question.id]) && (
                      <div className="w-full">
                        <div className="flex items-center gap-2 text-blue-600 py-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm">Loading choices...</span>
                        </div>
                      </div>
                    )}
                  {displayChoices && displayChoices.length > 0 && (
                    <div className="w-full">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Answer Choices
                      </h3>
                      <div className="space-y-2">
                        {displayChoices.map((choice: any, index: number) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg break-words whitespace-pre-wrap overflow-x-hidden ${choice.is_correct ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}
                          >
                            <span className="font-medium">
                              {choice.choice_label}.
                            </span>{" "}
                            {choice.choice_text}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showAddQuestionModal && (
        <TestPackQuestionModal
          isOpen={showAddQuestionModal}
          onClose={() => setShowAddQuestionModal(false)}
          onSave={handleAddQuestion}
          initialValues={null}
          testId={parseInt(id!)}
        />
      )}
      {/* Edit Question Modal */}
      {(() => {
        /* console.log("[TestPackDetail] Rendering edit modal section:", {
          editQuestionModalOpen: editQuestionModal.open,
          hasQuestion: !!editQuestionModal.question,
          questionType: editQuestionModal.question?.question_type_acronym,
        }); */

        if (
          editQuestionModal.open &&
          editQuestionModal.question &&
          editQuestionModal.question.question_type_acronym === "BLANK"
        ) {
          /* console.log("[TestPackDetail] Rendering BLANK QuestionModal"); */
          return (
            <QuestionModal
              isOpen={editQuestionModal.open}
              onClose={() =>
                setEditQuestionModal({ open: false, question: null })
              }
              onSave={async (data) => {
                // Call the test pack BLANK edit endpoint
                const questionId = editQuestionModal.question.question_id;
                const payload = {
                  test_id: editQuestionModal.question.test_id,
                  question: data.blankQuestion || data.question,
                  correct_answer:
                    data.blankCorrectAnswer || data.correct_answer,
                  question_category:
                    data.blankVariant || data.question_category,
                  is_active: editQuestionModal.question.is_active,  // Preserve current active state
                  created_by: editQuestionModal.question.created_by,
                  last_edited_by:
                    data.last_edited_by ||
                    editQuestionModal.question.last_edited_by,
                };
                const endpoint =
                  payload.question_category === "fill_box"
                    ? `${import.meta.env.VITE_API_URL}/api/test-pack/blank/fill-box/put/${questionId}`
                    : `${import.meta.env.VITE_API_URL}/api/test-pack/blank/placeholder/put/${questionId}`;
                const response = await fetch(endpoint, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
                if (!response.ok) {
                  const errorData = await response.json();
                  toast.error(
                    errorData.detail || "Failed to update BLANK question",
                  );
                  return;
                }
                toast.success("BLANK question updated successfully");
                setEditQuestionModal({ open: false, question: null });
                loadTestPack();
              }}
              initialValues={editQuestionModal.question}
            />
          );
        } else if (
          editQuestionModal.open &&
          editQuestionModal.question &&
          editQuestionModal.question.question_type_acronym === "DND"
        ) {
          /* console.log("[TestPackDetail] Rendering DND QuestionModal"); */
          return (
            <QuestionModal
              isOpen={editQuestionModal.open}
              onClose={() =>
                setEditQuestionModal({ open: false, question: null })
              }
              onSave={async (data) => {
                // DND questions are handled by the QuestionModal's handleDnDSave function
                // The data returned will be the updated question data
                toast.success("DND question updated successfully");
                setEditQuestionModal({ open: false, question: null });
                loadTestPack();
              }}
              initialValues={editQuestionModal.question}
              istestpack={true}
            />
          );
        } else if (
          editQuestionModal.open &&
          editQuestionModal.question &&
          getQuestionTypeAcronym(editQuestionModal.question) === "RAY_SELECTOR"
        ) {
          /* console.log(
            "[TestPackDetail] Rendering RAY_SELECTOR QuestionModal with question:",
            editQuestionModal.question,
          ); */
          return (
            <QuestionModal
              isOpen={editQuestionModal.open}
              onClose={() =>
                setEditQuestionModal({ open: false, question: null })
              }
              onSave={async (data) => {
                // Ray Selector questions are handled by the QuestionModal's handleSave function
                toast.success("Ray Selector question updated successfully");
                setEditQuestionModal({ open: false, question: null });
                loadTestPack();
              }}
              initialValues={editQuestionModal.question}
              istestpack={true}
            />
          );
        } else if (
          editQuestionModal.open &&
          editQuestionModal.question &&
          getQuestionTypeAcronym(editQuestionModal.question) === "GRAPH_SELECTOR"
        ) {
          /* console.log(
            "[TestPackDetail] Rendering GRAPH_SELECTOR QuestionModal with question:",
            editQuestionModal.question,
          ); */
          return (
            <QuestionModal
              isOpen={editQuestionModal.open}
              onClose={() =>
                setEditQuestionModal({ open: false, question: null })
              }
              onSave={async (data) => {
                // Graph Selector questions are handled by the QuestionModal's handleSave function
                toast.success("Graph Selector question updated successfully");
                setEditQuestionModal({ open: false, question: null });
                loadTestPack();
              }}
              initialValues={editQuestionModal.question}
              istestpack={true}
            />
          );
        } else if (
          editQuestionModal.open &&
          editQuestionModal.question &&
          getQuestionTypeAcronym(editQuestionModal.question) === "EQUATION_CALCULATOR"
        ) {
          /* console.log(
            "[TestPackDetail] Rendering EQUATION_CALCULATOR QuestionModal with question:",
            editQuestionModal.question,
          ); */
          return (
            <QuestionModal
              isOpen={editQuestionModal.open}
              onClose={() =>
                setEditQuestionModal({ open: false, question: null })
              }
              onSave={async (data) => {
                // Equation Calculator questions are handled by the QuestionModal's handleSave function
                toast.success("Equation Calculator question updated successfully");
                setEditQuestionModal({ open: false, question: null });
                loadTestPack();
              }}
              initialValues={editQuestionModal.question}
              istestpack={true}
            />
          );
        } else if (editQuestionModal.open && editQuestionModal.question) {
          /* console.log(
            "[TestPackDetail] Rendering TestPackEditModal for other question types",
          ); */
          return (
            <TestPackEditModal
              isOpen={editQuestionModal.open}
              onClose={() =>
                setEditQuestionModal({ open: false, question: null })
              }
              question={editQuestionModal.question}
              onSave={() => {
                setEditQuestionModal({ open: false, question: null });
                loadTestPack();
              }}
            />
          );
        } else {
          /* console.log("[TestPackDetail] No modal to render"); */
          return null;
        }
      })()}
      {/* Edit Choices Modal */}
      <TestPackEditChoicesModal
        isOpen={editChoicesModal.open}
        onClose={() => setEditChoicesModal({ open: false, question: null })}
        question={editChoicesModal.question}
        onSave={() => {
          setEditChoicesModal({ open: false, question: null });
          loadTestPack();
        }}
      />

      {/* Question Number Editor Modal */}
      {questionNumberEditor.open && questionNumberEditor.question && (
        <QuestionNumberEditor
          isOpen={questionNumberEditor.open}
          onClose={() => setQuestionNumberEditor({ open: false, question: null })}
          question={questionNumberEditor.question}
          testId={parseInt(id!)}
          onSuccess={loadTestPack}
        />
      )}

      {/* Question Reordering Modal */}
      {reorderModal.open && (
        <QuestionReorderingModal
          isOpen={reorderModal.open}
          onClose={() => setReorderModal({ open: false, questions: [] })}
          testId={parseInt(id!)}
          questions={reorderModal.questions}
          onSuccess={loadTestPack}
        />
      )}
    </div>
  );
}
