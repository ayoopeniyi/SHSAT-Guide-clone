import { Link } from "react-router-dom";
import { TestPack } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Edit, Trash2, Power } from "lucide-react";
import { testPackService } from "../../services/testPackService";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { TestPackAnswerChoice } from "../../types/testPack";
import { fetchTestPackQuestionChoices } from "../../services/api";
import { Badge } from "../ui/badge";

interface TestPackCardProps {
  testPack: TestPack;
  onUpdate: () => void;
}

export default function TestPackCard({
  testPack,
  onUpdate,
}: TestPackCardProps) {
  const [choices, setChoices] = useState<TestPackAnswerChoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    const loadChoices = async () => {
      /* console.log("TestPackCard - Starting to load choices for:", {
        testPackId: testPack.id,
        questionId: testPack.question_id,
        questionType: testPack.question_type_name,
      }); */

      if (
        testPack.question_type_name?.toLowerCase().includes("mc") ||
        testPack.question_type_name?.toLowerCase().includes("ma")
      ) {
        setIsLoading(true);
        try {
          /* console.log(
            "TestPackCard - Fetching choices for question ID:",
            testPack.question_id,
          ); */
          const fetchedChoices = await fetchTestPackQuestionChoices(
            testPack.question_id,
          );
          /* console.log("TestPackCard - Received choices:", fetchedChoices); */
          setChoices(fetchedChoices);
        } catch (error) {
          console.error("TestPackCard - Error fetching choices:", {
            error,
            questionId: testPack.question_id,
            testPackId: testPack.id,
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        /* console.log(
          "TestPackCard - Skipping choices fetch - not an MC/MA question:",
          testPack.question_type_name,
        ); */
      }
    };

    loadChoices();
  }, [testPack.question_id, testPack.question_type_name]);

  const getChoiceText = (choice: any) => {
    const text =
      choice.choice_text ||
      choice.answer_text ||
      (choice.value && choice.value.text) ||
      choice.value ||
      "";
    /* console.log("getChoiceText:", { choice, resolvedText: text }); */
    return text;
  };

  const renderChoices = () => {
    /* console.log(
      "TestPackCard - Rendering choices for question ID:",
      testPack.question_id,
      choices,
    ); */
    if (!choices.length) return null;

    /* console.log("TestPackCard - Choices array:", choices); */
    return (
      <div className="mt-4 space-y-2">
        <h4 className="font-medium text-gray-700">Answer Choices:</h4>
        <div className="grid grid-cols-1 gap-2">
          {choices.map((choice) => (
            <div
              key={choice.id}
              className="flex items-start p-2 rounded-md bg-gray-50"
            >
              <span className="font-medium mr-2">{choice.choice_label}:</span>
              <span className="font-medium">{getChoiceText(choice)}</span>
              {choice.choice_image_url && (
                <div className="mt-2 flex justify-center">
                  <img
                    src={choice.choice_image_url}
                    alt={`Choice ${choice.choice_label}`}
                    className="max-h-40 object-contain"
                  />
                </div>
              )}
              {choice.is_correct === true && (
                <span className="ml-2 text-green-600 font-medium">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this test pack?")) return;

    try {
      await testPackService.delete(Number(testPack.id));
      toast.success("Test pack deleted successfully");
      onUpdate();
    } catch (error) {
      toast.error("Failed to delete test pack");
      console.error("Error deleting test pack:", error);
    }
  };

  const handleToggleActive = async () => {
    setIsToggling(true);
    try {
      await testPackService.toggleQuestionActive(
        testPack.question_id,
        testPack.test_id,
        !testPack.is_active,
      );
      toast.success(
        `Question ${testPack.is_active ? "deactivated" : "activated"} successfully`,
      );
      onUpdate();
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

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <Link
            to={`/test-packs/${testPack.id}`}
            className="text-lg font-semibold hover:text-blue-600 transition-colors break-words max-w-full"
          >
            {testPack.name}
          </Link>
          <div className="flex gap-2 shrink-0">
            {testPack.question_type_acronym && (
              <Badge
                variant="outline"
                className="uppercase text-purple-700 border-purple-300 bg-purple-50"
              >
                {testPack.question_type_acronym}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleActive}
              disabled={isToggling}
              className={
                testPack.is_active ? "text-green-500" : "text-gray-400"
              }
              title={
                testPack.is_active ? "Deactivate Question" : "Activate Question"
              }
            >
              <Power className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/test-packs/${testPack.id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span>Questions: {testPack.question_count}/114</span>
            <span>•</span>
            <span>
              Created: {new Date(testPack.created_at).toLocaleDateString()}
            </span>
            <span>•</span>
            <Badge
              variant={testPack.is_active ? "default" : "secondary"}
              className={`capitalize ${
                testPack.is_active
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
            >
              {testPack.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          {testPack.test_description && (
            <p className="text-sm text-gray-600 line-clamp-2 break-words">
              {testPack.test_description}
            </p>
          )}
          <div className="pt-4">
            <Link to={`/test-packs/${testPack.id}`}>
              <Button className="w-full">View Questions</Button>
            </Link>
          </div>
        </div>
        {isLoading ? (
          <div className="mt-4 text-gray-500">Loading choices...</div>
        ) : (
          <div className="mt-4 max-w-full overflow-hidden">
            {renderChoices()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
