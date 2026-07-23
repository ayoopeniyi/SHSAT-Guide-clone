import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { testPackService } from "../services/testPackService";
import { TestPack } from "../types";
import { QuestionCard } from "../components/QuestionCard";
import { toast } from "sonner";

export default function TestPacks() {
  const [testPacks, setTestPacks] = useState<TestPack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestPacks();
  }, []);

  const loadTestPacks = async () => {
    try {
      const packs = await testPackService.getAll();
      setTestPacks(packs);
    } catch (error) {
      console.error("Error loading test packs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChoices = (question: any) => {
    /* console.log("Edit Choices for test pack MC question:", question); */
  };

  const handleEditQuestion = (question: any) => {
    /* console.log("Edit Question for test pack MC question:", question); */
  };

  const handleDelete = () => {
    /* console.log("Question deleted, refreshing..."); */
    loadTestPacks();
  };

  // Convert TestPack to Question format for QuestionCard
  const convertTestPackToQuestion = (testPack: any) => {
    return {
      id: parseInt(testPack.id),
      question_id: testPack.question_id,
      test_id: testPack.test_id,
      question: testPack.question || testPack.name,
      question_type: testPack.question_type_acronym,
      subject: "General",
      difficulty: "medium",
      is_active: testPack.is_active,
      created_by: testPack.created_by || "Unknown",
      last_edited_by: testPack.last_edited_by || "Unknown",
      created_at: testPack.created_at,
      updated_at: testPack.updated_at,
      choices: (testPack.choices || []).map((choice: any) => ({
        letter: choice.choice_label,
        value: {
          text: choice.answer_text,
          is_correct: choice.is_correct,
          choice_image_url: choice.choice_image_url,
        },
      })),
    } as any;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Test Packs</h1>
          <p className="text-gray-600">Manage and organize your test content</p>
        </div>
        <Button asChild>
          <Link to="/test-packs/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Test Pack
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {testPacks.length}
                </div>
                <div className="text-gray-500">Total Tests</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {testPacks.reduce(
                    (sum, pack) => sum + (pack.question_count || 0),
                    0,
                  )}
                </div>
                <div className="text-gray-500">Total Questions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Packs Grid */}
      <div className="grid grid-cols-1 gap-6">
        {testPacks.map((testPack) => (
          <QuestionCard
            key={testPack.id}
            question={convertTestPackToQuestion(testPack)}
            context="test-pack"
            onEditChoices={handleEditChoices}
            onEditQuestion={handleEditQuestion}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {testPacks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No test packs found</p>
          <Button asChild>
            <Link to="/test-packs/create">Create your first test pack</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
