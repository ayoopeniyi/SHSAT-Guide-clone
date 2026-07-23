import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Info,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface ValidationSummary {
  test_id: number;
  validation: {
    is_valid: boolean;
    active_count: number;
    inactive_count: number;
    total_count: number;
    issues: string[];
    missing_numbers: number[];
    duplicate_numbers: number[];
    out_of_range_numbers: number[];
  };
  available_numbers: number[];
  can_activate: boolean;
  summary: {
    total_questions: number;
    active_questions: number;
    inactive_questions: number;
    missing_numbers_count: number;
    duplicate_numbers_count: number;
    available_numbers_count: number;
  };
}

interface TestValidationSummaryProps {
  testId: number;
  onRefresh?: () => void;
  showDetails?: boolean;
}

export const TestValidationSummary: React.FC<TestValidationSummaryProps> = ({
  testId,
  onRefresh,
  showDetails = false
}) => {
  const [validation, setValidation] = useState<ValidationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(showDetails);

  useEffect(() => {
    loadValidationSummary();
  }, [testId]);

  const loadValidationSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/question-reordering/test/${testId}/validation-summary`);
      if (response.ok) {
        const data = await response.json();
        setValidation(data);
      } else {
        toast.error('Failed to load validation summary');
      }
    } catch (error) {
      console.error('Error loading validation summary:', error);
      toast.error('Failed to load validation summary');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!validation) return <Info className="h-5 w-5 text-gray-400" />;
    
    if (validation.can_activate) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (validation.validation.is_valid) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    if (!validation) return 'Loading...';
    
    if (validation.can_activate) {
      return 'Ready to Activate';
    } else if (validation.validation.is_valid) {
      return 'Valid but Incomplete';
    } else {
      return 'Validation Errors';
    }
  };

  const getStatusColor = () => {
    if (!validation) return 'bg-gray-100 text-gray-600';
    
    if (validation.can_activate) {
      return 'bg-green-100 text-green-800';
    } else if (validation.validation.is_valid) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };

  const getProgressValue = () => {
    if (!validation) return 0;
    return (validation.validation.active_count / 114) * 100;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading validation...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!validation) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Failed to load validation data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            <span>Test Validation Status</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Active Questions</span>
            <span>{validation.validation.active_count} / 114</span>
          </div>
          <Progress value={getProgressValue()} className="h-2" />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {validation.summary.active_questions}
            </div>
            <div className="text-xs text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {validation.summary.inactive_questions}
            </div>
            <div className="text-xs text-gray-600">Inactive</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {validation.summary.available_numbers_count}
            </div>
            <div className="text-xs text-gray-600">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {validation.summary.missing_numbers_count}
            </div>
            <div className="text-xs text-gray-600">Missing</div>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Issues */}
            {validation.validation.issues.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {validation.validation.issues.map((issue, index) => (
                      <div key={index} className="text-sm">{issue}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Missing Numbers */}
            {validation.validation.missing_numbers.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Missing Question Numbers:</h4>
                <div className="flex flex-wrap gap-1">
                  {validation.validation.missing_numbers.map(num => (
                    <Badge key={num} variant="outline" className="text-xs">
                      {num}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Duplicate Numbers */}
            {validation.validation.duplicate_numbers.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 text-red-600">Duplicate Question Numbers:</h4>
                <div className="flex flex-wrap gap-1">
                  {validation.validation.duplicate_numbers.map(num => (
                    <Badge key={num} variant="destructive" className="text-xs">
                      {num}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Available Numbers */}
            {validation.available_numbers.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Available Question Numbers:</h4>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {validation.available_numbers.map(num => (
                    <Badge key={num} variant="secondary" className="text-xs">
                      {num}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadValidationSummary}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                >
                  Refresh Questions
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 