import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useAuthStore } from "../../../stores/authStore";
import { toast } from "sonner";

interface BulkQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  passageId: number;
  testId: number;
  onSuccess?: () => void;
}

interface QuestionTypeCount {
  [key: string]: number;
}

const QUESTION_TYPES = {
  MC_STANDARD: "Multiple Choice (Standard)",
  MC_DRAG_DROP: "Multiple Choice (Drag & Drop)",
  MA: "Multiple Answer",
  DND_TWO_BUCKETS_SINGLE: "DnD (2 Buckets, Single)",
  DND_TWO_BUCKETS_MULTI: "DnD (2 Buckets, Multi)",
  DND_ONE_BUCKET_MULTI: "DnD (1 Bucket, Multi)",
  // DND_MC_STYLE: "DnD (MC Style)",
  TABLE_GRID: "Table-Grid",
  // DND_MC_STYLE: 'DnD (MC Style)',
  // DND_FILL_BLANKS: 'DnD (Fill Blanks)'
};

const DIFFICULTY_LEVELS = [
  { value: 1, label: "Easy" },
  { value: 2, label: "Medium" },
  { value: 3, label: "Hard" },
];

export const BulkQuestionModal: React.FC<BulkQuestionModalProps> = ({
  isOpen,
  onClose,
  passageId,
  testId,
  onSuccess,
}) => {
  const { getUserName } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeCount>({
    MC_STANDARD: 0,
    MC_DRAG_DROP: 0,
    MA: 0,
    DND_TWO_BUCKETS_SINGLE: 0,
    DND_TWO_BUCKETS_MULTI: 0,
    DND_ONE_BUCKET_MULTI: 0,
    DND_MC_STYLE: 0,
    DND_FILL_BLANKS: 0,
    TABLE_GRID: 0,
    
  });
  const [difficulty, setDifficulty] = useState<number>(2);

  const updateQuestionTypeCount = (type: string, count: number) => {
    setQuestionTypes((prev) => ({
      ...prev,
      [type]: Math.max(0, count),
    }));
  };

  const handleSubmit = async () => {
    // Filter out question types with 0 count
    const filteredQuestionTypes = Object.fromEntries(
      Object.entries(questionTypes).filter(([_, count]) => count > 0),
    );

    if (Object.keys(filteredQuestionTypes).length === 0) {
      toast.error("Please select at least one question type");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        question_types: filteredQuestionTypes,
        test_id: testId,
        difficulty: difficulty,
        created_by: getUserName(),
        last_edited_by: getUserName(),
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/test-pack/passages/create/${passageId}/questions/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create questions");
      }

      const data = await response.json();
      const totalQuestions = Object.values(filteredQuestionTypes).reduce(
        (a, b) => a + b,
        0,
      );

      toast.success(`Successfully created ${totalQuestions} questions`);

      // Reset form
      setQuestionTypes({
        MC_STANDARD: 0,
        MC_DRAG_DROP: 0,
        MA: 0,
        DND_TWO_BUCKETS_SINGLE: 0,
        DND_TWO_BUCKETS_MULTI: 0,
        DND_ONE_BUCKET_MULTI: 0,
        DND_MC_STYLE: 0,
        DND_FILL_BLANKS: 0,
        TABLE_GRID: 0,
      });
      setDifficulty(2);

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error creating questions:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create questions",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form on close
    setQuestionTypes({
      MC_STANDARD: 0,
      MC_DRAG_DROP: 0,
      MA: 0,
      DND_TWO_BUCKETS_SINGLE: 0,
      DND_TWO_BUCKETS_MULTI: 0,
      DND_ONE_BUCKET_MULTI: 0,
      DND_MC_STYLE: 0,
      DND_FILL_BLANKS: 0,
      TABLE_GRID: 0,
    });
    setDifficulty(2);
    onClose();
  };

  const totalQuestions = Object.values(questionTypes).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Questions to Passage #{passageId}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              value={difficulty.toString()}
              onValueChange={(value) => setDifficulty(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value.toString()}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Select question types and counts:</Label>
            <div className="space-y-3 mt-2">
              {Object.entries(QUESTION_TYPES).map(([type, label]) => (
                <div key={type} className="flex items-center justify-between">
                  <Label className="flex-1 text-sm font-medium text-gray-700">
                    {label}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() =>
                        updateQuestionTypeCount(
                          type,
                          Math.max(0, questionTypes[type] - 1),
                        )
                      }
                      disabled={questionTypes[type] === 0}
                    >
                      -
                    </Button>
                    <input
                      type="number"
                      value={questionTypes[type]}
                      onChange={(e) =>
                        updateQuestionTypeCount(
                          type,
                          Math.max(0, parseInt(e.target.value) || 0),
                        )
                      }
                      className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm"
                      min="0"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() =>
                        updateQuestionTypeCount(type, questionTypes[type] + 1)
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {totalQuestions > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Total questions to create:{" "}
                <span className="font-semibold">{totalQuestions}</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || totalQuestions === 0}
          >
            {loading ? "Creating..." : "Create Questions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
