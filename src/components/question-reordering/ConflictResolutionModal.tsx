import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle, RefreshCw, PowerOff, X } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  question_id: number;
  question_number: number;
  prompt: string;
  is_active: boolean;
  question_type_acronym?: string;
}

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflictInfo: {
    conflicting_question_id: number;
    conflicting_question_prompt: string;
    conflicting_question_number: number;
    conflicting_question_type: string;
  };
  currentQuestion: Question;
  newNumber: number;
  testId: number;
  onSuccess: () => void;
  onCloseParent?: () => void; // Callback to close the parent dialog
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  onClose,
  conflictInfo,
  currentQuestion,
  newNumber,
  testId,
  onSuccess,
  onCloseParent
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState<'swap' | 'deactivate' | null>(null);

  const handleSwap = async () => {
    setIsLoading(true);
    setActionType('swap');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/question-reordering/swap-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_id: testId,
          question1_id: currentQuestion.question_id,
          question2_id: conflictInfo.conflicting_question_id
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`✅ ${result.message}`, {
          duration: 4000,
          description: "Questions were successfully swapped."
        });
        onSuccess();
        onClose();
        // Also close the parent dialog if callback is provided
        if (onCloseParent) {
          onCloseParent();
        }
      } else {
        const error = await response.json();
        const errorMessage = error.detail || 'Failed to perform swap';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error performing swap:', error);
      toast.error('Failed to perform swap');
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  const handleDeactivate = async () => {
    setIsLoading(true);
    setActionType('deactivate');
    
    try {
      // First deactivate the conflicting question
      const deactivateResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/question-reordering/deactivate-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_id: testId,
          question_id: conflictInfo.conflicting_question_id
        })
      });

      if (!deactivateResponse.ok) {
        const error = await deactivateResponse.json();
        throw new Error(error.detail || 'Failed to deactivate conflicting question');
      }

      // Then assign the number to the current question
      const assignResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/question-reordering/question/${currentQuestion.question_id}/number`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_id: testId,
          question_number: newNumber
        })
      });

      if (assignResponse.ok) {
        toast.success(`✅ Question Q${conflictInfo.conflicting_question_number} has been deactivated and your question is now assigned Q${newNumber}`, {
          duration: 4000,
          description: "Conflict resolved successfully."
        });
        onSuccess();
        onClose();
        // Also close the parent dialog if callback is provided
        if (onCloseParent) {
          onCloseParent();
        }
      } else {
        const error = await assignResponse.json();
        throw new Error(error.detail || 'Failed to assign question number');
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to resolve conflict');
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Resolve Number Conflict
          </DialogTitle>
          <DialogDescription>
            Question Q{newNumber} is already assigned to another question. Choose how to resolve this conflict.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Conflict Details */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-sm">
                  Q{conflictInfo.conflicting_question_number}
                </Badge>
                {conflictInfo.conflicting_question_type && (
                  <Badge variant="secondary" className="text-sm">
                    {conflictInfo.conflicting_question_type}
                  </Badge>
                )}
              </div>
            <div className="text-sm text-gray-700">
              <strong>Conflicting Question:</strong>
              <div className="mt-1 text-gray-600 line-clamp-3">
                {conflictInfo.conflicting_question_prompt}
              </div>
            </div>
          </div>

          {/* Resolution Options */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Choose Resolution Method:</div>
            
            {/* Option 1: Swap */}
            <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Swap Questions</div>
                  <div className="text-sm text-gray-600">
                    Exchange question numbers between the two questions
                  </div>
                </div>
                <Button
                  onClick={handleSwap}
                  disabled={isLoading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading && actionType === 'swap' ? 'Swapping...' : 'Swap'}
                </Button>
              </div>
            </div>

            {/* Option 2: Deactivate */}
            <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <PowerOff className="h-5 w-5 text-red-500" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Deactivate Q{conflictInfo.conflicting_question_number}</div>
                  <div className="text-sm text-gray-600">
                    Make the conflicting question inactive to free up the number
                  </div>
                </div>
                <Button
                  onClick={handleDeactivate}
                  disabled={isLoading}
                  size="sm"
                  variant="destructive"
                >
                  {isLoading && actionType === 'deactivate' ? 'Deactivating...' : 'Deactivate'}
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertDescription className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Swap is best for maintaining both questions, while deactivate is best for replacing Q{conflictInfo.conflicting_question_number} with a different question.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
};
