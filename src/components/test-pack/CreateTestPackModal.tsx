import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { testPackService } from "../../services/testPackService";
import { TestPack } from "../../types";
import { toast } from "sonner";
import { usePostHogAnalytics, trackTestPackCreation } from "../../lib/posthog-analytics";

interface CreateTestPackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTestPackModal({
  isOpen,
  onClose,
}: CreateTestPackModalProps) {
  const navigate = useNavigate();
  const analytics = usePostHogAnalytics();
  const [name, setName] = useState("");
  const [sourceTestId, setSourceTestId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sourceTestPacks, setSourceTestPacks] = useState<TestPack[]>([]);
  const [loadingTestPacks, setLoadingTestPacks] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSourceTestPacks();
    }
  }, [isOpen]);

  const loadSourceTestPacks = async () => {
    try {
      setLoadingTestPacks(true);
      const packs = await testPackService.getAll();
      setSourceTestPacks(packs);
    } catch (error) {
      console.error("Error loading test packs:", error);
      toast.error("Failed to load source test packs");
    } finally {
      setLoadingTestPacks(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a test pack name");
      return;
    }

    try {
      setLoading(true);
      const newTestPack = await testPackService.create({
        name: name.trim(),
        test_description: "",
        default_test_text: "",
      });

      // Track test pack creation analytics
      const questionCount = sourceTestId ? 
        (await testPackService.getById(parseInt(sourceTestId))).question_count || 0 : 0;
      
      trackTestPackCreation(analytics, {
        testPackId: newTestPack.id,
        testPackName: newTestPack.name,
        questionCount: questionCount,
        questionTypes: {}, // Will be populated if questions are cloned
        difficulty: 3, // Default difficulty
        subject: 'Mixed' // Default subject
      });

      if (sourceTestId) {
        const cloneResult = await testPackService.cloneQuestions(
          parseInt(sourceTestId),
          Number(newTestPack.id),
        );
        if (cloneResult && cloneResult.questions) {
          toast.success(
            `Test pack created and ${cloneResult.questions.length} questions cloned successfully`,
          );
          // Optionally, you could pass cloneResult.questions to the next page or state here
        } else {
          toast.success("Test pack created and questions cloned successfully");
        }
      } else {
        toast.success("Test pack created successfully");
      }

      navigate(`/test-packs/${newTestPack.id}`);
    } catch (error) {
      toast.error("Failed to create test pack");
      console.error("Error creating test pack:", error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleClose = () => {
    setName("");
    setSourceTestId("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Test Pack</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Test Pack Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter test pack name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceTest">Clone Questions From (Optional)</Label>
            <Select
              value={sourceTestId}
              onValueChange={setSourceTestId}
              disabled={loadingTestPacks}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingTestPacks ? "Loading..." : "Select source test pack"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {sourceTestPacks.map((pack) => (
                  <SelectItem key={pack.id} value={pack.id.toString()}>
                    {pack.name} ({pack.question_count || 0} questions)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              If selected, questions will be cloned from the source test pack
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Test Pack"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
