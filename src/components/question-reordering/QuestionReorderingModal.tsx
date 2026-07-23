import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';
import { ChevronUp, ChevronDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { getQuestionTypeAcronym } from '../../utils/questionTypeUtils';

interface Question {
  question_id?: number;
  id?: number;
  question_number: number;
  prompt: string;
  is_active: boolean;
  question_type_acronym?: string;
}

interface QuestionReorderingModalProps {
  isOpen: boolean;
  onClose: () => void;
  testId: number;
  questions: Question[];
  onSuccess: () => void;
}

interface ReorderItem {
  question_id: number;
  original_number: number;
  new_number: number;
  prompt: string;
  question_type_acronym?: string;
  is_active: boolean;
}

export const QuestionReorderingModal: React.FC<QuestionReorderingModalProps> = ({
  isOpen,
  onClose,
  testId,
  questions,
  onSuccess
}) => {
  const [reorderItems, setReorderItems] = useState<ReorderItem[]>([]);
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Initialize reorder items when modal opens
  useEffect(() => {
    if (isOpen && questions.length > 0) {
      const items: ReorderItem[] = questions
        .filter(q => q.question_number !== null && q.question_number !== undefined)
        .slice(0, 10)
        .map(q => ({
          question_id: q.question_id || q.id || 0,
          original_number: q.question_number,
          new_number: q.question_number,
          prompt: q.prompt || (q as any).question || '',
          question_type_acronym: q.question_type_acronym,
          is_active: q.is_active
        }));
      setReorderItems(items);
      loadAvailableNumbers();
    }
  }, [isOpen, questions]);

  const loadAvailableNumbers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/question-reordering/test/${testId}/available-numbers`);
      if (response.ok) {
        const data = await response.json();
        setAvailableNumbers(data.available_numbers || []);
      }
    } catch (error) {
      console.error('Error loading available numbers:', error);
    }
  };

  const validateChanges = async () => {
    setIsValidating(true);
    setValidationErrors([]);

    const errors: string[] = [];
    const usedNumbers = new Set<number>();

    // Check for duplicates and invalid numbers
    reorderItems.forEach(item => {
      if (item.new_number < 1 || item.new_number > 114) {
        errors.push(`Question ${item.original_number}: Number must be between 1 and 114`);
      }

      if (usedNumbers.has(item.new_number)) {
        errors.push(`Question ${item.original_number}: Number ${item.new_number} is used multiple times`);
      } else {
        usedNumbers.add(item.new_number);
      }
    });

    // Check for conflicts with existing questions not in this reorder set
    const reorderQuestionIds = new Set(reorderItems.map(item => item.question_id));
    const otherQuestions = questions.filter(q => !reorderQuestionIds.has(q.question_id || q.id || 0));

    for (const item of reorderItems) {
      const conflictingQuestion = otherQuestions.find(q => q.question_number === item.new_number);
      if (conflictingQuestion) {
        errors.push(`Question ${item.original_number}: Number ${item.new_number} conflicts with existing question ${conflictingQuestion.question_number}`);
      }
    }

    setValidationErrors(errors);
    setIsValidating(false);
    return errors.length === 0;
  };

  const handleNumberChange = (index: number, newNumber: number) => {
    const updatedItems = [...reorderItems];
    updatedItems[index] = { ...updatedItems[index], new_number: newNumber };
    setReorderItems(updatedItems);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const updatedItems = [...reorderItems];
      [updatedItems[index], updatedItems[index - 1]] = [updatedItems[index - 1], updatedItems[index]];
      setReorderItems(updatedItems);
    } else if (direction === 'down' && index < reorderItems.length - 1) {
      const updatedItems = [...reorderItems];
      [updatedItems[index], updatedItems[index + 1]] = [updatedItems[index + 1], updatedItems[index]];
      setReorderItems(updatedItems);
    }
  };

  const handleSave = async () => {
    const isValid = await validateChanges();
    if (!isValid) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    setIsLoading(true);
    try {
      const updates = reorderItems
        .filter(item => item.new_number !== item.original_number)
        .map(item => ({
          question_id: item.question_id,
          question_number: item.new_number
        }));

      if (updates.length === 0) {
        toast.info('No changes to save');
        onClose();
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/question-reordering/batch-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_id: testId,
          updates: updates
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Successfully updated ${result.updated_count} questions`);
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update questions');
        if (error.errors) {
          setValidationErrors(error.errors);
        }
      }
    } catch (error) {
      console.error('Error saving reorder changes:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const resetItems = reorderItems.map(item => ({
      ...item,
      new_number: item.original_number
    }));
    setReorderItems(resetItems);
    setValidationErrors([]);
  };

  const getNumberInputClass = (item: ReorderItem) => {
    if (item.new_number === item.original_number) {
      return 'border-gray-300';
    }
    if (validationErrors.some(error => error.includes(`Question ${item.original_number}`))) {
      return 'border-red-500 bg-red-50';
    }
    return 'border-blue-500 bg-blue-50';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Reorder Questions</span>
            <Badge variant="outline">{reorderItems.length} questions</Badge>
          </DialogTitle>
          <DialogDescription>
            Reorder up to 10 questions at a time. Changes will be validated before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="text-sm">{error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Available Numbers */}
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Available Numbers:</Label>
            <div className="flex flex-wrap gap-1">
              {availableNumbers.slice(0, 20).map(num => (
                <Badge key={num} variant="secondary" className="text-xs">
                  {num}
                </Badge>
              ))}
              {availableNumbers.length > 20 && (
                <Badge variant="secondary" className="text-xs">
                  +{availableNumbers.length - 20} more
                </Badge>
              )}
            </div>
          </div>

          {/* Reorder Items */}
          <div className="space-y-2">
            {reorderItems.map((item, index) => (
              <div key={item.question_id} className="flex items-center gap-3 p-3 border rounded-lg">
                {/* Move Buttons */}
                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === reorderItems.length - 1}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>

                {/* Question Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {getQuestionTypeAcronym(item)}
                    </Badge>
                    {!item.is_active && (
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  {/* <div className="text-sm text-gray-600 truncate">
                    {item.prompt}
                  </div> */}
                </div>

                {/* Number Input */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Q#</Label>
                  <Input
                    type="number"
                    min="1"
                    max="114"
                    value={item.new_number}
                    onChange={(e) => handleNumberChange(index, parseInt(e.target.value) || 0)}
                    className={`w-16 text-center ${getNumberInputClass(item)}`}
                  />
                  {item.new_number !== item.original_number && (
                    <div className="text-xs text-gray-500">
                      was {item.original_number}
                    </div>
                  )}
                </div>

                {/* Status Indicator */}
                <div className="flex items-center">
                  {item.new_number === item.original_number ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              {reorderItems.filter(item => item.new_number !== item.original_number).length} of {reorderItems.length} questions modified
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} disabled={isLoading}>
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading || isValidating}
                className="min-w-[100px]"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 