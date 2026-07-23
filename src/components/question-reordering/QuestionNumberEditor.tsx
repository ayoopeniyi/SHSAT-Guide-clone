import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { ConflictResolutionModal } from './ConflictResolutionModal';

interface Question {
  question_id: number;
  question_number: number;
  prompt: string;
  is_active: boolean;
  question_type_acronym?: string;
}

interface QuestionNumberEditorProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  testId: number;
  onSuccess: () => void;
}

interface ConflictInfo {
  has_conflict: boolean;
  error?: string;
  conflicting_question_id?: number;
  conflicting_question_prompt?: string;
  conflicting_question_number?: number;
  conflicting_question_type?: string;
}

export const QuestionNumberEditor: React.FC<QuestionNumberEditorProps> = ({
  isOpen,
  onClose,
  question,
  testId,
  onSuccess
}) => {
  const [newNumber, setNewNumber] = useState(question.question_number);
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [conflictResolutionModal, setConflictResolutionModal] = useState<{
    open: boolean;
    conflictInfo: any;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNewNumber(question.question_number);
      setConflictInfo(null);
      loadAvailableNumbers();
    }
  }, [isOpen, question]);

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

  const checkTemporaryNumbersAvailable = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/question-reordering/temporary-numbers/status`);
      if (response.ok) {
        const data = await response.json();
        // Always return true since we can use 115 as fallback
        return true;
      } else if (response.status === 404) {
        // Endpoint doesn't exist, assume temporary numbers are available
        console.warn('Temporary numbers status endpoint not found, assuming available');
        return true;
      }
      return true; // Always return true since we can use 115 as fallback
    } catch (error) {
      console.error('Error checking temporary numbers status:', error);
      // On error, assume temporary numbers are available to avoid blocking users
      return true;
    }
  };



  const checkConflict = async (number: number) => {
    if (number === question.question_number) {
      setConflictInfo({ has_conflict: false });
      return;
    }

    setIsCheckingConflict(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/question-reordering/check-conflict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_id: testId,
          question_id: question.question_id,
          new_number: number
        })
      });

      if (response.ok) {
        const data = await response.json();
        const conflictInfo = data.conflict_check;
        setConflictInfo(conflictInfo);
      } else {
        setConflictInfo({ has_conflict: true, error: 'Failed to check conflict' });
      }
    } catch (error) {
      console.error('Error checking conflict:', error);
      setConflictInfo({ has_conflict: true, error: 'Failed to check conflict' });
    } finally {
      setIsCheckingConflict(false);
    }
  };

  const handleNumberChange = (value: string) => {
    const number = parseInt(value) || 0;
    setNewNumber(number);
    
    // Debounce conflict checking
    const timeoutId = setTimeout(() => {
      if (number >= 1 && number <= 114) {
        checkConflict(number);
      } else {
        setConflictInfo({ has_conflict: true, error: 'Number must be between 1 and 114' });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  };



  const handleSave = async () => {
    if (newNumber === question.question_number) {
      toast.info('No changes to save');
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/question-reordering/question/${question.question_id}/number`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_id: testId,
          question_number: newNumber
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Check if this was a swap operation
        if (result.was_swapped) {
          toast.success(`✅ ${result.message}`, {
            duration: 4000,
            description: "Questions were automatically swapped to resolve the conflict."
          });
        } else {
          toast.success(result.message);
        }
        
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        
        // Check if this is a conflict that can be resolved
        if (error.detail && typeof error.detail === 'object' && error.detail.error) {
          if (error.detail.suggestion && error.detail.swap_data) {
            // This is a conflict that can be resolved - open the conflict resolution modal
            setConflictResolutionModal({
              open: true,
              conflictInfo: {
                conflicting_question_id: error.detail.swap_data.question2_id,
                conflicting_question_prompt: conflictInfo?.conflicting_question_prompt || 'Question content not available',
                conflicting_question_number: newNumber,
                conflicting_question_type: conflictInfo?.conflicting_question_type || 'Unknown'
              }
            });
          } else {
            toast.error(error.detail.error);
          }
        } else if (error.detail && typeof error.detail === 'string') {
          toast.error(error.detail);
        } else {
          toast.error('Failed to update question number');
        }
      }
    } catch (error) {
      console.error('Error updating question number:', error);
      toast.error('Failed to update question number');
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClass = () => {
    if (newNumber === question.question_number) {
      return 'border-gray-300';
    }
    if (conflictInfo?.has_conflict) {
      // Show orange border for conflicts that can be resolved
      if (conflictInfo.conflicting_question_id) {
        return 'border-orange-500 bg-orange-50';
      }
      return 'border-red-500 bg-red-50';
    }
    return 'border-blue-500 bg-blue-50';
  };

  const getStatusIcon = () => {
    if (isCheckingConflict) {
      return <Info className="h-4 w-4 text-blue-500" />;
    }
    if (newNumber === question.question_number) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (conflictInfo?.has_conflict) {
      // Show conflict resolution icon if it's a resolvable conflict
      if (conflictInfo.conflicting_question_id) {
        return <RefreshCw className="h-4 w-4 text-orange-500" />;
      }
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (isCheckingConflict) {
      return 'Checking for conflicts...';
    }
    if (newNumber === question.question_number) {
      return 'No changes';
    }
    if (conflictInfo?.has_conflict) {
      // Check if this is a resolvable conflict
      if (conflictInfo.conflicting_question_id) {
        return 'Conflict detected - click Save to resolve';
      }
      return 'Conflict detected';
    }
    return 'Ready to save';
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Question Number</DialogTitle>
            <DialogDescription>
              Change the question number for this question. The number must be between 1 and 114.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Question Info */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {question.question_type_acronym && (
                  <Badge variant="outline" className="text-xs">
                    {question.question_type_acronym}
                  </Badge>
                )}
                {!question.is_active && (
                  <Badge variant="secondary" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-600 line-clamp-2">
                {question.prompt}
              </div>
            </div>

            {/* Current Number */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Current Number:</Label>
              <Badge variant="outline">
                {question.question_number}
              </Badge>
            </div>

            {/* New Number Input */}
            <div className="space-y-2">
              <Label htmlFor="new-number" className="text-sm font-medium">
                New Question Number
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="new-number"
                  type="number"
                  min="1"
                  max="114"
                  value={newNumber}
                  onChange={(e) => handleNumberChange(e.target.value)}
                  className={getInputClass()}
                  placeholder="Enter number 1-114"
                />
                <div className="flex items-center gap-1 text-sm">
                  {getStatusIcon()}
                  <span className="text-gray-600">{getStatusText()}</span>
                </div>
              </div>
            </div>

            {/* Available Numbers */}
            {availableNumbers.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Available Numbers:</Label>
                <div className="flex flex-wrap gap-1 mt-1 max-h-24 overflow-y-auto">
                  {availableNumbers.slice(0, 20).map(num => (
                    <Badge 
                      key={num} 
                      variant="secondary" 
                      className="text-xs cursor-pointer hover:bg-blue-200"
                      onClick={() => setNewNumber(num)}
                    >
                      {num}
                    </Badge>
                  ))}
                  {availableNumbers.length > 20 && (
                    <Badge variant="secondary" className="text-xs">
                      +{availableNumbers.length - 20} more
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  💡 Tip: Choose an available number to avoid conflicts, or click Save to resolve conflicts with swap or deactivate options.
                </div>
              </div>
            )}

            {/* Conflict Alert */}
            {conflictInfo?.has_conflict && (
              <Alert variant="default">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">{conflictInfo.error}</div>
                    {conflictInfo.conflicting_question_prompt && (
                      <div className="text-sm text-gray-600">
                        Conflicts with: {conflictInfo.conflicting_question_prompt}
                      </div>
                    )}
                    {conflictInfo.conflicting_question_id && (
                      <div className="text-sm text-orange-600 font-medium">
                        💡 Click Save to open conflict resolution options
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {!conflictInfo?.has_conflict && newNumber !== question.question_number && !isCheckingConflict && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Question number can be updated to {newNumber}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  isLoading || 
                  isCheckingConflict || 
                  newNumber === question.question_number ||
                  // Allow saving if it's a resolvable conflict (has conflict but also has conflicting_question_id)
                  (conflictInfo?.has_conflict && !conflictInfo?.conflicting_question_id)
                }
                className="min-w-[100px]"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Conflict Resolution Modal */}
      {conflictResolutionModal && (
        <ConflictResolutionModal
          isOpen={conflictResolutionModal.open}
          onClose={() => setConflictResolutionModal(null)}
          conflictInfo={conflictResolutionModal.conflictInfo}
          currentQuestion={question}
          newNumber={newNumber}
          testId={testId}
          onSuccess={onSuccess}
          onCloseParent={onClose} // Pass the parent's onClose callback
        />
      )}
    </>
  );
}; 