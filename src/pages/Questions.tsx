import { useState, useEffect } from "react";
import {
  questionService,
  categoryService,
  answerService,
  questionTypeService,
  Question,
  Category,
  QuestionType,
  Answer,
} from "../services/api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import { ChevronDown, ChevronUp, Plus, Trash, Filter, X } from "lucide-react";
import { Link } from "react-router-dom";

// Import existing services from Question-Bank
import { fetchChapters, fetchTopics, fetchSubTopics } from "../components/Question-Bank/actions/filterActions";
import type { Chapter, Topic, SubTopic } from "../components/Question-Bank/actions/types";

type FormData = {
  question: string;
  explanation: string;
  type_id: number;
  category_id: number;
  difficulty: number;
  video_url?: string;
  workbook?: string;
  test_label?: string;
  asset_filename?: string;
  asset_description?: string;
  custom_passage?: string;
  has_multiple_correct: boolean;
};

type AnswerFormData = {
  answer_text: string;
  is_correct: string;
  choice_label: string;
  answer_explanation: string;
};

// Add PaginationControls component at the top of the file
const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="flex justify-center gap-2">
    <Button
      variant="outline"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
    >
      Previous
    </Button>
    <span className="flex items-center px-4">
      Page {currentPage} of {Math.max(1, totalPages)}
    </span>
    <Button
      variant="outline"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage >= totalPages}
    >
      Next
    </Button>
  </div>
);

const Questions = () => {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]); // Store all questions
  const [displayedQuestions, setDisplayedQuestions] = useState<Question[]>([]); // Questions to display
  const [categories, setCategories] = useState<Category[]>([]);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    null,
  );
  const [answers, setAnswers] = useState<Record<string, Answer[]>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 20;
  const [formData, setFormData] = useState<FormData>({
    question: "",
    explanation: "",
    type_id: 1,
    category_id: 1,
    difficulty: 1,
    has_multiple_correct: false,
  });
  const [answerFormData, setAnswerFormData] = useState<AnswerFormData[]>([
    {
      answer_text: "",
      is_correct: "false",
      choice_label: "A",
      answer_explanation: "",
    },
  ]);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Add hierarchical filter state
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedSubTopic, setSelectedSubTopic] = useState<string>("");
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>({});

  // Add loading states for individual filters
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isLoadingSubTopics, setIsLoadingSubTopics] = useState(false);

  useEffect(() => {
    loadCategories();
    loadQuestionTypes();
    loadChapters(); // Load chapters on component mount
  }, []);

  // Load chapters
  const loadChapters = async () => {
    try {
      const result = await fetchChapters();
      if (result.success) {
        setChapters(result.data);
      } else {
        toast.error("Failed to load chapters");
      }
    } catch (error) {
      console.error("Error loading chapters:", error);
      toast.error("Failed to load chapters");
    }
  };

  // Load topics when chapter changes
  const loadTopics = async (chapterNumber: string) => {
    /* console.log("🔍 [Questions] loadTopics called with chapterNumber:", chapterNumber); */
    
    if (!chapterNumber) {
      /* console.log("🔍 [Questions] No chapter number, clearing topics"); */
      setTopics([]);
      setSelectedTopic("");
      setSelectedSubTopic("");
      setSubTopics([]);
      return;
    }

    setIsLoadingTopics(true);
    try {
      /* console.log("🔍 [Questions] Calling fetchTopics with params:", { chapterNumber }); */
      const result = await fetchTopics({ chapterNumber });
      /* console.log("🔍 [Questions] fetchTopics result:", result); */
      
      if (result.success) {
        /* console.log("🔍 [Questions] Setting topics:", result.data); */
        setTopics(result.data);
        setSelectedTopic("");
        setSelectedSubTopic("");
        setSubTopics([]);
      } else {
        console.error("🔍 [Questions] fetchTopics failed:", result.error);
        toast.error("Failed to load topics");
      }
    } catch (error) {
      console.error("🔍 [Questions] Error loading topics:", error);
      toast.error("Failed to load topics");
    } finally {
      setIsLoadingTopics(false);
    }
  };

  // Load sub-topics when topic changes
  const loadSubTopics = async (topicId: string) => {
    /* console.log("🔍 [Questions] loadSubTopics called with topicId:", topicId); */
    
    if (!topicId) {
      /* console.log("🔍 [Questions] No topic ID, clearing sub-topics"); */
      setSubTopics([]);
      setSelectedSubTopic("");
      return;
    }

    setIsLoadingSubTopics(true);
    try {
      /* console.log("🔍 [Questions] Calling fetchSubTopics with params:", { topicId }); */
      const result = await fetchSubTopics({ topicId });
      /* console.log("🔍 [Questions] fetchSubTopics result:", result); */
      
      if (result.success) {
        /* console.log("🔍 [Questions] Setting sub-topics:", result.data); */
        setSubTopics(result.data);
        setSelectedSubTopic("");
      } else {
        console.error("🔍 [Questions] fetchSubTopics failed:", result.error);
        toast.error("Failed to load sub-topics");
      }
    } catch (error) {
      console.error("🔍 [Questions] Error loading sub-topics:", error);
      toast.error("Failed to load sub-topics");
    } finally {
      setIsLoadingSubTopics(false);
    }
  };

  // Handle chapter selection
  const handleChapterChange = (chapterNumber: string) => {
    /* console.log("🔍 [Questions] handleChapterChange called with:", chapterNumber); */
    /* console.log("🔍 [Questions] Previous selectedChapter:", selectedChapter); */
    /* console.log("🔍 [Questions] Previous topics:", topics); */
    
    setSelectedChapter(chapterNumber);
    /* console.log("🔍 [Questions] selectedChapter set to:", chapterNumber); */
    
    // Clear dependent selections
    setSelectedTopic("");
    setSelectedSubTopic("");
    setTopics([]);
    setSubTopics([]);
    
    /* console.log("🔍 [Questions] About to call loadTopics with:", chapterNumber); */
    loadTopics(chapterNumber);
    
    // Reset pagination when filters change
    setCurrentPage(1);
    /* console.log("🔍 [Questions] handleChapterChange completed"); */
  };

  // Handle topic selection
  const handleTopicChange = (topicId: string) => {
    /* console.log("🔍 [Questions] handleTopicChange called with:", topicId); */
    setSelectedTopic(topicId);
    loadSubTopics(topicId);
    // Reset pagination when filters change
    setCurrentPage(1);
  };

  // Handle sub-topic selection
  const handleSubTopicChange = (subTopicId: string) => {
    /* console.log("🔍 [Questions] handleSubTopicChange called with:", subTopicId); */
    setSelectedSubTopic(subTopicId);
    // Reset pagination when filters change
    setCurrentPage(1);
  };

  // Apply filters
  const applyFilters = async () => {
    setIsLoadingFilters(true);
    try {
      const filterParams: Record<string, string> = {};
      
      if (selectedChapter) {
        filterParams.chapter_number = selectedChapter;
      }
      if (selectedTopic) {
        filterParams.topic_id = selectedTopic;
      }
      if (selectedSubTopic) {
        filterParams.sub_topic_id = selectedSubTopic;
      }

      setAppliedFilters(filterParams);
      
      // Load questions with new filters
      if (Object.keys(filterParams).length > 0) {
        await loadQuestionsWithFilters(filterParams);
      } else {
        await loadQuestions(); // Load all questions if no filters
      }
      
      toast.success("Filters applied successfully");
    } catch (error) {
      console.error("Error applying filters:", error);
      toast.error("Failed to apply filters");
    } finally {
      setIsLoadingFilters(false);
    }
  };

  // Clear all filters
  const clearAllFilters = async () => {
    setSelectedChapter("");
    setSelectedTopic("");
    setSelectedSubTopic("");
    setTopics([]);
    setSubTopics([]);
    setAppliedFilters({});
    
    // Reset to load all questions
    await loadQuestions();
    toast.success("All filters cleared");
  };

  // Check if any filters are currently selected
  const hasActiveFilters = () => {
    return selectedChapter || selectedTopic || selectedSubTopic;
  };

  // Check if filters have changed since last applied
  const hasFilterChanges = () => {
    const currentFilters = {
      chapter_number: selectedChapter,
      topic_id: selectedTopic,
      sub_topic_id: selectedSubTopic,
    };
    
    return JSON.stringify(currentFilters) !== JSON.stringify(appliedFilters);
  };

  // Load questions with filters
  const loadQuestionsWithFilters = async (filterParams: Record<string, string>) => {
    setIsLoading(true);
    try {
      // Use the new service method for fetching questions with filters
      const response = await questionService.getWithFilters({
        chapter_number: filterParams.chapter_number,
        topic_id: filterParams.topic_id,
        sub_topic_id: filterParams.sub_topic_id,
        page: 1,
        per_page: 500 // Fetch maximum allowed
      });
      
      // Handle the response based on the backend structure
      if (response && response.questions) {
        // Backend returns paginated response
        setAllQuestions(response.questions);
        setCurrentPage(1);
      } else if (Array.isArray(response)) {
        // Backend returns direct array
        setAllQuestions(response);
        setCurrentPage(1);
      } else {
        // Fallback to empty array
        setAllQuestions([]);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error loading questions with filters:", error);
      toast.error("Failed to load questions with filters. Falling back to all questions.");
      
      // Fallback: try to load all questions and apply frontend filtering
      try {
        const allData = await questionService.getAll(500, 0);
        let filteredData = allData;
        
        // Apply filters on the frontend as fallback
        if (filterParams.chapter_number) {
          filteredData = filteredData.filter(q => 
            (q as any).chapter_number === parseInt(filterParams.chapter_number)
          );
        }
        
        if (filterParams.topic_id) {
          filteredData = filteredData.filter(q => 
            (q as any).topic_id === parseInt(filterParams.topic_id)
          );
        }
        
        if (filterParams.sub_topic_id) {
          filteredData = filteredData.filter(q => 
            (q as any).sub_topic_id === parseInt(filterParams.sub_topic_id)
          );
        }
        
        setAllQuestions(filteredData);
        setCurrentPage(1);
        
        if (filteredData.length === 0) {
          toast.info("No questions found with the selected filters.");
        } else {
          toast.info(`Found ${filteredData.length} questions using frontend filtering.`);
        }
      } catch (fallbackError) {
        console.error("Fallback filtering also failed:", fallbackError);
        toast.error("Failed to load questions. Please try again.");
        setAllQuestions([]);
        setCurrentPage(1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategoryId !== "all") {
      loadQuestionsByCategory(parseInt(selectedCategoryId));
    } else {
      loadQuestions();
    }
  }, [selectedCategoryId]);

  // Update displayed questions whenever page changes or questions are filtered
  useEffect(() => {
    updateDisplayedQuestions();
  }, [currentPage, allQuestions]);

  const updateDisplayedQuestions = () => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    setDisplayedQuestions(allQuestions.slice(startIndex, endIndex));
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const loadQuestionTypes = async () => {
    try {
      const data = await questionTypeService.getAll();
      setQuestionTypes(data);
    } catch (error) {
      console.error("Error loading question types:", error);
      toast.error("Failed to load question types");
    }
  };

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      // Fetch all questions at once
      const data = await questionService.getAll(500, 0); // Fetch maximum allowed
      setAllQuestions(data);
      setCurrentPage(1); // Reset to first page when loading new questions
    } catch (error) {
      console.error("Error loading questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuestionsByCategory = async (categoryId: number) => {
    setIsLoading(true);
    try {
      // Fetch all questions for the category
      const data = await questionService.getByCategory(categoryId, 500, 0);
      setAllQuestions(data);
      setCurrentPage(1); // Reset to first page when changing category
    } catch (error: any) {
      console.error("Error loading questions by category:", error);
      if (error.response?.status === 422) {
        toast.error(
          "This category no longer exists. Showing all questions instead.",
        );
        setSelectedCategoryId("all");
        loadQuestions();
      } else {
        toast.error("Failed to load questions");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnswers = async (questionId: string) => {
    try {
      const data = await answerService.getByQuestionId(questionId);
      setAnswers((prev) => ({ ...prev, [questionId]: data }));
    } catch (error) {
      console.error("Error loading answers:", error);
      toast.error("Failed to load answers");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let questionResponse;
      if (editingQuestion) {
        questionResponse = await questionService.update(
          editingQuestion.id,
          formData,
        );
        toast.success("Question updated successfully");
      } else {
        // Create a new question with the form data
        const questionData: Omit<Question, "id"> = {
          ...formData,
          has_multiple_correct: Boolean(formData.has_multiple_correct),
        };
        questionResponse = await questionService.create(questionData);
        toast.success("Question created successfully");
      }

      // Save answer choices
      for (let i = 0; i < answerFormData.length; i++) {
        const answer = answerFormData[i];
        // Convert the answer data to match the API interface
        const answerData: Answer = {
          answer_text: answer.answer_text,
          is_correct: answer.is_correct,
          choice_label: answer.choice_label,
          answer_explanation: answer.answer_explanation,
        };

        if (editingQuestion) {
          // Update existing answer
          await answerService.update(questionResponse.id, i + 1, answerData);
        } else {
          // Create new answer
          await answerService.create(questionResponse.id, i + 1, answerData);
        }
      }

      setIsDialogOpen(false);
      if (selectedCategoryId !== "all") {
        loadQuestionsByCategory(parseInt(selectedCategoryId));
      } else {
        loadQuestions();
      }
      resetForm();
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error("Failed to save question");
    }
  };

  const handleEdit = async (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      ...question,
      has_multiple_correct: question.has_multiple_correct || false,
    });
    // Load and set the answer form data
    try {
      const answerData = await answerService.getByQuestionId(question.id);
      if (answerData && answerData.length > 0) {
        setAnswerFormData(
          answerData.map((answer) => ({
            answer_text: answer.answer_text,
            is_correct: answer.is_correct,
            choice_label: answer.choice_label,
            answer_explanation: answer.answer_explanation || "",
          })),
        );
      }
    } catch (error) {
      console.error("Error loading answers for edit:", error);
      toast.error("Failed to load answer choices");
    }

    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await questionService.delete(id);
        toast.success("Question deleted successfully");
        if (selectedCategoryId !== "all") {
          loadQuestionsByCategory(parseInt(selectedCategoryId));
        } else {
          loadQuestions();
        }
      } catch (error) {
        toast.error("Failed to delete question");
      }
    }
  };

  const handleRevise = async (question: Question) => {
    try {
      await questionService.revise(question.id, {
        question: `${question.question} (Revised)`,
        type_id: question.type_id,
        category_id: question.category_id,
      });
      toast.success("New version created successfully");
      if (selectedCategoryId !== "all") {
        loadQuestionsByCategory(parseInt(selectedCategoryId));
      } else {
        loadQuestions();
      }
    } catch (error) {
      toast.error("Failed to create new version");
    }
  };

  const resetForm = () => {
    setFormData({
      question: "",
      explanation: "",
      type_id: 1,
      category_id: 1,
      difficulty: 1,
      has_multiple_correct: false,
    });
    setAnswerFormData([
      {
        answer_text: "",
        is_correct: "false",
        choice_label: "A",
        answer_explanation: "",
      },
    ]);
    setEditingQuestion(null);
  };

  const handleAnswerAdd = () => {
    const nextLabel = String.fromCharCode(65 + answerFormData.length);
    setAnswerFormData([
      ...answerFormData,
      {
        answer_text: "",
        is_correct: "false",
        choice_label: nextLabel,
        answer_explanation: "",
      },
    ]);
  };

  const handleAnswerRemove = (index: number) => {
    setAnswerFormData(answerFormData.filter((_, i) => i !== index));
  };

  const handleAnswerChange = (
    index: number,
    field: keyof AnswerFormData,
    value: string | boolean,
  ) => {
    const newAnswers = [...answerFormData];

    if (field === "is_correct") {
      newAnswers[index] = { ...newAnswers[index], [field]: String(value) };

      if (value === true && !formData.has_multiple_correct) {
        newAnswers.forEach((answer, i) => {
          if (i !== index) {
            answer.is_correct = "false";
          }
        });
      }
    } else {
      newAnswers[index] = { ...newAnswers[index], [field]: value };
    }

    setAnswerFormData(newAnswers);
  };

  const handleQuestionExpand = async (questionId: string) => {
    if (expandedQuestionId === questionId) {
      setExpandedQuestionId(null);
    } else {
      setExpandedQuestionId(questionId);
      if (!answers[questionId]) {
        await loadAnswers(questionId);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const selectedCategoryName =
    selectedCategoryId === "all"
      ? "All Categories"
      : categories.find((cat) => cat.id.toString() === selectedCategoryId)
          ?.name || "Unknown Category";

  const totalPages = Math.ceil(allQuestions.length / questionsPerPage);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Apply filters only on Enter
  const applyFiltersOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCurrentPage(1); // Reset to first page on filter change
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link
          to="/"
          className="flex items-center text-brand-blue hover:text-brand-blue-dark mr-4"
        >
          <svg
            className="w-5 h-5 mr-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Question Management
          {selectedCategoryId !== "all" && `: ${selectedCategoryName}`}
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>Add New Question</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingQuestion ? "Edit Question" : "Add New Question"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="question">Question</Label>
                    <Textarea
                      id="question"
                      value={formData.question}
                      onChange={(e) =>
                        setFormData({ ...formData, question: e.target.value })
                      }
                      required
                      className="h-32"
                    />
                  </div>
                  <div>
                    <Label htmlFor="explanation">Explanation</Label>
                    <Textarea
                      id="explanation"
                      value={formData.explanation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          explanation: e.target.value,
                        })
                      }
                      required
                      className="h-32"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type_id">Question Type</Label>
                    <Select
                      value={formData.type_id.toString()}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type_id: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name || type.acronym || `Type ${type.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category_id">Category</Label>
                    <Select
                      value={formData.category_id.toString()}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          category_id: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={formData.difficulty.toString()}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          difficulty: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Easy</SelectItem>
                        <SelectItem value="2">Medium</SelectItem>
                        <SelectItem value="3">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="multiple-correct"
                      checked={formData.has_multiple_correct}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          has_multiple_correct: checked,
                        })
                      }
                    />
                    <Label htmlFor="multiple-correct">
                      Allow multiple correct answers
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Answer Choices</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAnswerAdd}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Answer
                  </Button>
                </div>
                <div className="space-y-4">
                  {answerFormData.map((answer, index) => (
                    <div
                      key={index}
                      className="flex gap-4 items-start p-4 border rounded-lg"
                    >
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Answer Text</Label>
                            <Input
                              value={answer.answer_text}
                              onChange={(e) =>
                                handleAnswerChange(
                                  index,
                                  "answer_text",
                                  e.target.value,
                                )
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label>Choice Label</Label>
                            <Input
                              value={answer.choice_label}
                              onChange={(e) =>
                                handleAnswerChange(
                                  index,
                                  "choice_label",
                                  e.target.value,
                                )
                              }
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Explanation</Label>
                          <Textarea
                            value={answer.answer_explanation}
                            onChange={(e) =>
                              handleAnswerChange(
                                index,
                                "answer_explanation",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={answer.is_correct === "true"}
                            onCheckedChange={(checked) =>
                              handleAnswerChange(index, "is_correct", checked)
                            }
                          />
                          <Label>Correct Answer</Label>
                        </div>
                      </div>
                      {answerFormData.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAnswerRemove(index)}
                        >
                          <Trash className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingQuestion ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Questions</TabsTrigger>
            <TabsTrigger value="recent" disabled>
              Recently Updated (Coming Soon)
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mb-6">
        <Select
          value={selectedCategoryId}
          onValueChange={setSelectedCategoryId}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hierarchical Filters */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Hierarchical Filters</h3>
          
          {/* Debug Test Button */}
          <Button
            onClick={async () => {
              /* console.log("🔍 [Questions] Testing API calls..."); */
              /* console.log("🔍 [Questions] Current selectedChapter:", selectedChapter); */
              /* console.log("🔍 [Questions] Current chapters:", chapters); */
              
              if (selectedChapter) {
                /* console.log("🔍 [Questions] Testing topics API for chapter:", selectedChapter); */
                try {
                  const result = await fetchTopics({ chapterNumber: selectedChapter });
                  /* console.log("🔍 [Questions] Topics API result:", result); */
                  
                  if (result.success) {
                    /* console.log("🔍 [Questions] Topics loaded successfully:", result.data); */
                    setTopics(result.data);
                  } else {
                    console.error("🔍 [Questions] Topics API failed:", result.error);
                  }
                } catch (error) {
                  console.error("🔍 [Questions] Topics API error:", error);
                }
              } else {
                /* console.log("🔍 [Questions] No chapter selected for testing"); */
              }
            }}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            Test Topics API
          </Button>
          
          {/* Direct API Test Button */}
          <Button
            onClick={async () => {
              /* console.log("🔍 [Questions] Testing direct API call..."); */
              if (selectedChapter) {
                try {
                  const apiUrl = `${import.meta.env.VITE_API_URL || "https://eznnseebbi.execute-api.ap-southeast-2.amazonaws.com/dev"}/api/pre-shsat/chapters/${selectedChapter}/topics`;
                  /* console.log("🔍 [Questions] Direct API URL:", apiUrl); */
                  
                  const response = await fetch(apiUrl);
                  /* console.log("🔍 [Questions] Direct API response status:", response.status); */
                  /* console.log("🔍 [Questions] Direct API response ok:", response.ok); */
                  
                  if (response.ok) {
                    const data = await response.json();
                    /* console.log("🔍 [Questions] Direct API data:", data); */
                    setTopics(data);
                  } else {
                    console.error("🔍 [Questions] Direct API failed:", response.statusText);
                  }
                } catch (error) {
                  console.error("🔍 [Questions] Direct API error:", error);
                }
              } else {
                /* console.log("🔍 [Questions] No chapter selected for direct API test"); */
              }
            }}
            variant="outline"
            size="sm"
          >
            Direct API Test
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Chapter Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="chapter-filter" className="text-sm font-medium text-gray-700">
                Chapter
              </Label>
              {selectedChapter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleChapterChange("")}
                  className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Reset
                </Button>
              )}
            </div>
            <Select
              value={selectedChapter}
              onValueChange={(value) => {
                /* console.log("🔍 [Questions] Chapter Select onValueChange called with value:", value); */
                /* console.log("🔍 [Questions] Value type:", typeof value); */
                /* console.log("🔍 [Questions] Previous selectedChapter:", selectedChapter); */
                handleChapterChange(value);
              }}
              onOpenChange={(open) => {
                /* console.log("🔍 [Questions] Chapter Select onOpenChange:", open); */
              }}
            >
              <SelectTrigger id="chapter-filter">
                <SelectValue placeholder="Select Chapter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Chapters</SelectItem>
                {chapters.map((chapter) => (
                  <SelectItem key={chapter.chapter_number} value={chapter.chapter_number.toString()}>
                    Chapter {chapter.chapter_number}: {chapter.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Select a chapter to filter questions by topic
            </p>
          </div>

          {/* Topic Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="topic-filter" className="text-sm font-medium text-gray-700">
                Topic
              </Label>
              {selectedTopic && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTopicChange("")}
                  className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Reset
                </Button>
              )}
            </div>
            <Select
              value={selectedTopic}
              onValueChange={handleTopicChange}
              disabled={!selectedChapter || isLoadingTopics}
            >
              <SelectTrigger id="topic-filter">
                <SelectValue placeholder={
                  isLoadingTopics 
                    ? "Loading topics..." 
                    : selectedChapter 
                      ? "Select Topic" 
                      : "Select Chapter First"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Topics</SelectItem>
                {isLoadingTopics ? (
                  <SelectItem value="" disabled>Loading topics...</SelectItem>
                ) : (
                  topics.map((topic) => {
                    /* console.log("🔍 [Questions] Rendering topic:", topic); */
                    return (
                      <SelectItem key={topic.id} value={topic.id.toString()}>
                        {topic.title}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {selectedChapter ? "Select a topic to filter questions by sub-topic" : "Select a chapter first"}
            </p>
          </div>

          {/* Sub-Topic Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="subtopic-filter" className="text-sm font-medium text-gray-700">
                Sub-Topic
              </Label>
              {selectedSubTopic && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSubTopicChange("")}
                  className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Reset
                </Button>
              )}
            </div>
            <Select
              value={selectedSubTopic}
              onValueChange={handleSubTopicChange}
              disabled={!selectedTopic || isLoadingSubTopics}
            >
              <SelectTrigger id="subtopic-filter">
                <SelectValue placeholder={
                  isLoadingSubTopics 
                    ? "Loading sub-topics..." 
                    : selectedTopic 
                      ? "Select Sub-Topic" 
                      : "Select Topic First"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sub-Topics</SelectItem>
                {isLoadingSubTopics ? (
                  <SelectItem value="" disabled>Loading sub-topics...</SelectItem>
                ) : (
                  subTopics.map((subTopic) => (
                    <SelectItem key={subTopic.id} value={subTopic.id.toString()}>
                      {subTopic.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {selectedTopic ? "Select a sub-topic for specific question filtering" : "Select a topic first"}
            </p>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={applyFilters}
            disabled={isLoadingFilters || !hasActiveFilters() || !hasFilterChanges()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoadingFilters ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Applying...
              </>
            ) : !hasFilterChanges() ? (
              "Filters Applied"
            ) : (
              "Apply Filters"
            )}
          </Button>
          
          <Button
            onClick={clearAllFilters}
            variant="outline"
            disabled={isLoadingFilters || !hasActiveFilters()}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>

          {/* Applied Filters Display */}
          {Object.keys(appliedFilters).length > 0 && (
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-gray-600">Applied:</span>
              {Object.entries(appliedFilters).map(([key, value]) => {
                let displayValue = value;
                if (key === 'chapter_number') {
                  const chapter = chapters.find(c => c.chapter_number.toString() === value);
                  displayValue = chapter ? `Chapter ${chapter.chapter_number}: ${chapter.title}` : value;
                } else if (key === 'topic_id') {
                  const topic = topics.find(t => t.id.toString() === value);
                  displayValue = topic ? topic.title : value;
                } else if (key === 'sub_topic_id') {
                  const subTopic = subTopics.find(st => st.id.toString() === value);
                  displayValue = subTopic ? subTopic.title : value;
                }
                
                return (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {key.replace('_', ' ')}: {displayValue}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filter Summary */}
      {Object.keys(appliedFilters).length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-800">Active Filters:</span>
              {Object.entries(appliedFilters).map(([key, value]) => {
                let displayValue = value;
                let displayKey = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                if (key === 'chapter_number') {
                  const chapter = chapters.find(c => c.chapter_number.toString() === value);
                  displayValue = chapter ? `Chapter ${chapter.chapter_number}: ${chapter.title}` : value;
                } else if (key === 'topic_id') {
                  const topic = topics.find(t => t.id.toString() === value);
                  displayValue = topic ? topic.title : value;
                } else if (key === 'sub_topic_id') {
                  const subTopic = subTopics.find(st => st.id.toString() === value);
                  displayValue = subTopic ? subTopic.title : value;
                }
                
                return (
                  <Badge key={key} variant="outline" className="text-xs border-blue-300 text-blue-700">
                    {displayKey}: {displayValue}
                  </Badge>
                );
              })}
            </div>
            <div className="text-sm text-blue-600">
              Showing {allQuestions.length} questions
            </div>
          </div>
        </div>
      )}

      {/* Questions Summary */}
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Total Questions: {allQuestions.length}
            </span>
            {Object.keys(appliedFilters).length > 0 && (
              <span className="text-sm text-gray-600">
                Filtered from {chapters.length} chapters
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Page {currentPage} of {Math.max(1, totalPages)}
          </div>
        </div>
      </div>

      {/* Filter Changes Indicator */}
      {hasActiveFilters() && hasFilterChanges() && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-yellow-800">
                ⚠️ Filters have been changed but not yet applied
              </span>
            </div>
            <Button
              onClick={applyFilters}
              size="sm"
              disabled={isLoadingFilters}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {isLoadingFilters ? "Applying..." : "Apply Changes"}
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {displayedQuestions.length === 0 && allQuestions.length === 0 && Object.keys(appliedFilters).length > 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-500 mb-4">
                No questions match the selected filters. Try adjusting your filter criteria.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button onClick={clearAllFilters} variant="outline">
                Clear All Filters
              </Button>
              <Button onClick={() => setCurrentPage(1)} variant="outline">
                Reset Pagination
              </Button>
            </div>
          </div>
        ) : displayedQuestions.length === 0 && allQuestions.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions available</h3>
              <p className="text-gray-500">
                There are no questions in the system at the moment.
              </p>
            </div>
          </div>
        ) : displayedQuestions.length === 0 && allQuestions.length > 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions on this page</h3>
              <p className="text-gray-500 mb-4">
                There are {allQuestions.length} questions total, but none on page {currentPage}.
              </p>
            </div>
            <Button onClick={() => setCurrentPage(1)} variant="outline">
              Go to First Page
            </Button>
          </div>
        ) : (
          displayedQuestions.map((question) => (
            <Collapsible
              key={question.id}
              open={expandedQuestionId === question.id}
              onOpenChange={() => handleQuestionExpand(question.id)}
            >
              <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="flex-1">
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                      <CardTitle className="text-lg font-semibold line-clamp-2 pr-4">
                        {question.question}
                      </CardTitle>
                      {expandedQuestionId === question.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </CollapsibleTrigger>
                  </div>
                  {question.version && (
                    <Badge variant="secondary" className="ml-2">
                      v{question.version}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        Type:{" "}
                        {questionTypes.find((t) => t.id === question.type_id)
                          ?.name || question.type_id}
                      </Badge>
                      <Badge variant="outline">
                        Category:{" "}
                        {categories.find((c) => c.id === question.category_id)
                          ?.name || question.category_id}
                      </Badge>
                      <Badge variant="outline">
                        Difficulty:{" "}
                        {["Easy", "Medium", "Hard"][question.difficulty - 1] ||
                          question.difficulty}
                      </Badge>
                      {question.has_multiple_correct && (
                        <Badge variant="secondary">
                          Multiple Correct Answers
                        </Badge>
                      )}
                    </div>

                    <CollapsibleContent className="space-y-4">
                      {question.explanation && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Explanation:</h4>
                          <p className="text-gray-600">{question.explanation}</p>
                        </div>
                      )}

                      {answers[question.id] &&
                        answers[question.id].length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-2">
                              Answer Choices:
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {answers[question.id].map((answer, index) => (
                                <div
                                  key={index}
                                  className={`p-4 rounded-lg border ${
                                    answer.is_correct === "true"
                                      ? "border-green-200 bg-green-50"
                                      : "border-gray-200"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline">
                                      {answer.choice_label}
                                    </Badge>
                                    {answer.is_correct === "true" && (
                                      <Badge variant="secondary">Correct</Badge>
                                    )}
                                  </div>
                                  <p className="text-gray-900">
                                    {answer.answer_text}
                                  </p>
                                  {answer.answer_explanation && (
                                    <p className="text-gray-600 mt-2 text-sm">
                                      {answer.answer_explanation}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </CollapsibleContent>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(question)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevise(question)}
                      >
                        Revise
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(question.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>

      {/* Bottom pagination only */}
      <div className="mt-6">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Questions;