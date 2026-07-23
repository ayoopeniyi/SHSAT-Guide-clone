import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';

interface ActivateQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: any;
  testId: number;
  onSuccess: () => void;
}

export function ActivateQuestionModal({
  isOpen,
  onClose,
  question,
  testId,
  onSuccess,
}: ActivateQuestionModalProps) {
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNumbers, setIsLoadingNumbers] = useState(false);

  useEffect(() => {
    if (isOpen && testId) {
      fetchAvailableNumbers();
    }
  }, [isOpen, testId]);

  const fetchAvailableNumbers = async () => {
    setIsLoadingNumbers(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/test-pack/tests/${testId}/available-question-numbers`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableNumbers(data.available_numbers || []);
        if (data.available_numbers && data.available_numbers.length > 0) {
          setSelectedNumber(data.available_numbers[0].toString());
        }
      } else {
        toast.error('Failed to fetch available question numbers');
      }
    } catch (error) {
      console.error('Error fetching available numbers:', error);
      toast.error('Failed to fetch available question numbers');
    } finally {
      setIsLoadingNumbers(false);
    }
  };

  const handleActivate = async () => {
    if (!selectedNumber) {
      toast.error('Please select a question number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/test-pack/questions/${question.question_id}/activate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            test_id: testId,
            question_number: parseInt(selectedNumber),
          }),
        }
      );

      if (response.ok) {
        toast.success(`Question activated with number ${selectedNumber}`);
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to activate question');
      }
    } catch (error) {
      console.error('Error activating question:', error);
      toast.error('Failed to activate question');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Activate Question</DialogTitle>
          <DialogDescription>
            Select a question number to assign to this question when activating it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question-number">Question Number</Label>
            {isLoadingNumbers ? (
              <div className="text-sm text-gray-500">Loading available numbers...</div>
            ) : availableNumbers.length === 0 ? (
              <div className="text-sm text-red-500">
                No available question numbers. Maximum of 114 questions already active.
              </div>
            ) : (
              <Select value={selectedNumber} onValueChange={setSelectedNumber}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a question number" />
                </SelectTrigger>
                <SelectContent>
                  {availableNumbers.map((number) => (
                    <SelectItem key={number} value={number.toString()}>
                      {number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleActivate}
              disabled={isLoading || isLoadingNumbers || availableNumbers.length === 0}
            >
              {isLoading ? 'Activating...' : 'Activate Question'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 