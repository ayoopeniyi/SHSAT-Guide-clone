import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { toast } from "../hooks/use-toast";
import { Plus, BookOpen, FileText, Edit, Trash2 } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";

interface Passage {
  id: number;
  passage: string;
  topic_id?: number;
  sub_topic_id?: number;
  chapter_number?: number;
  image_url?: string;
  start_page?: number;
  end_page?: number;
  question_count: number;
  topic_title?: string;
  sub_topic_title?: string;
  created_at: string;
  updated_at: string;
}

interface BulkQuestionCreate {
  question_types: Record<string, number>;
  topic_id?: number;
  sub_topic_id?: number;
  chapter_number?: number;
  created_by?: string;
  last_edited_by?: string;
}

const PassagesPage: React.FC = () => {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPassage, setSelectedPassage] = useState<Passage | null>(null);
  const [isAddQuestionsOpen, setIsAddQuestionsOpen] = useState(false);
  const [questionTypes, setQuestionTypes] = useState<Record<string, number>>({
    MC_STANDARD: 0,
    MC_DRAG_DROP: 0,
    MA: 0,
    BLANK_PLACEHOLDER: 0,
    BLANK_FILL_BOX: 0,
    TABLE_GRID: 0,
    DND_TWO_BUCKETS_SINGLE: 0,
    DND_TWO_BUCKETS_MULTI: 0,
    DND_ONE_BUCKET_MULTI: 0,
  });

  useEffect(() => {
    fetchPassages();
  }, []);

  const fetchPassages = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/passages`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch passages");
      }
      const data = await response.json();
      setPassages(data);
    } catch (error) {
      console.error("Error fetching passages:", error);
      toast({
        title: "Error",
        description: "Failed to load passages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestions = async () => {
    if (!selectedPassage) return;

    // Filter out question types with 0 count
    const filteredQuestionTypes = Object.fromEntries(
      Object.entries(questionTypes).filter(([_, count]) => count > 0),
    );

    if (Object.keys(filteredQuestionTypes).length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one question type",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload: BulkQuestionCreate = {
        question_types: filteredQuestionTypes,
        topic_id: selectedPassage.topic_id,
        sub_topic_id: selectedPassage.sub_topic_id,
        chapter_number: selectedPassage.chapter_number, // Add chapter number if available
        created_by: "admin", // You can get this from auth store
        last_edited_by: "admin",
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/passages/${selectedPassage.id}/questions/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create questions");
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: `Created ${Object.values(filteredQuestionTypes).reduce((a, b) => a + b, 0)} questions`,
      });

      // Refresh passages to update question count
      fetchPassages();
      setSelectedPassage(null);
      setQuestionTypes({
        MC_STANDARD: 0,
        MC_DRAG_DROP: 0,
        MA: 0,
        BLANK_PLACEHOLDER: 0,
        BLANK_FILL_BOX: 0,
        TABLE_GRID: 0,
        DND_TWO_BUCKETS_SINGLE: 0,
        DND_TWO_BUCKETS_MULTI: 0,
        DND_ONE_BUCKET_MULTI: 0,
      });
    } catch (error) {
      console.error("Error creating questions:", error);
      toast({
        title: "Error",
        description: "Failed to create questions",
        variant: "destructive",
      });
    }
  };

  const updateQuestionTypeCount = (type: string, count: number) => {
    setQuestionTypes((prev) => ({
      ...prev,
      [type]: Math.max(0, count),
    }));
  };

  const getQuestionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      MC_STANDARD: "Multiple Choice (Standard)",
      MC_DRAG_DROP: "Multiple Choice (Drag & Drop)",
      MA: "Multiple Answer",
      BLANK_PLACEHOLDER: "Blank (Placeholder)",
      BLANK_FILL_BOX: "Blank (Fill Box)",
      TABLE_GRID: "Table Grid (Matrix)",
      DND_TWO_BUCKETS_SINGLE: "DnD (2 Buckets, Single)",
      DND_TWO_BUCKETS_MULTI: "DnD (2 Buckets, Multi)",
      DND_ONE_BUCKET_MULTI: "DnD (1 Bucket, Multi)",
    };
    return labels[type] || type;
  };

  const truncatePassage = (
    passage: string,
    maxLength: number = 150,
  ): string => {
    if (passage.length <= maxLength) return passage;
    return passage.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading passages...</div>
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Reading Passages</h1>
            <p className="text-gray-600 mt-2">
              Manage your reading comprehension passages and questions
            </p>
          </div>
          <Button onClick={() => (window.location.href = "/question-bank")}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Passage
          </Button>
        </div>

        {passages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No passages yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first reading passage to get started
              </p>
              <Button onClick={() => (window.location.href = "/question-bank")}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Passage
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {passages.map((passage) => (
              <Card
                key={passage.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Passage #{passage.id}
                        {passage.topic_title && (
                          <Badge variant="secondary">
                            {passage.topic_title}
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>{passage.question_count} questions</span>
                        <span>
                          Created:{" "}
                          {new Date(passage.created_at).toLocaleDateString()}
                        </span>
                        {passage.start_page && passage.end_page && (
                          <span>
                            Pages {passage.start_page}-{passage.end_page}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPassage(passage)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Questions
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>
                              Add Questions to Passage #{passage.id}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                              Select the number of questions to create for this
                              passage:
                            </p>
                            {Object.entries(questionTypes).map(
                              ([type, count]) => (
                                <div
                                  key={type}
                                  className="flex items-center justify-between"
                                >
                                  <Label htmlFor={type} className="flex-1">
                                    {getQuestionTypeLabel(type)}
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        updateQuestionTypeCount(type, count - 1)
                                      }
                                      disabled={count === 0}
                                    >
                                      -
                                    </Button>
                                    <Input
                                      id={type}
                                      type="number"
                                      value={count}
                                      onChange={(e) =>
                                        updateQuestionTypeCount(
                                          type,
                                          parseInt(e.target.value) || 0,
                                        )
                                      }
                                      className="w-16 text-center"
                                      min="0"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        updateQuestionTypeCount(type, count + 1)
                                      }
                                    >
                                      +
                                    </Button>
                                  </div>
                                </div>
                              ),
                            )}
                            <div className="flex justify-end gap-2 pt-4">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedPassage(null);
                                  setQuestionTypes({
                                    MC_STANDARD: 0,
                                    MC_DRAG_DROP: 0,
                                    MA: 0,
                                    BLANK_PLACEHOLDER: 0,
                                    BLANK_FILL_BOX: 0,
                                    TABLE_GRID: 0,
                                    DND_TWO_BUCKETS_SINGLE: 0,
                                    DND_TWO_BUCKETS_MULTI: 0,
                                    DND_ONE_BUCKET_MULTI: 0,
                                  });
                                }}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleAddQuestions}>
                                Create Questions
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {truncatePassage(passage.passage)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default PassagesPage;
