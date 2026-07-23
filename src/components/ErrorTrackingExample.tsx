import React, { useState } from 'react';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export const ErrorTrackingExample: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const errorHandler = useErrorHandler();

  // Example: Simulate API error
  const simulateApiError = async () => {
    setIsLoading(true);
    try {
      // Simulate API call that fails
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('API request failed: Server returned 500'));
        }, 1000);
      });
    } catch (error) {
      errorHandler.handleApiError(
        error as Error,
        '/api/test-endpoint',
        'POST',
        500
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Example: Simulate network error
  const simulateNetworkError = async () => {
    setIsLoading(true);
    try {
      // Simulate network failure
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Network error: Failed to fetch'));
        }, 1000);
      });
    } catch (error) {
      errorHandler.handleNetworkError(error as Error, 'https://api.example.com/data');
    } finally {
      setIsLoading(false);
    }
  };

  // Example: Simulate validation error
  const simulateValidationError = () => {
    if (!inputValue.trim()) {
      errorHandler.handleValidationError(
        new Error('Input field is required'),
        'exampleInput',
        inputValue
      );
      return;
    }
    
    if (inputValue.length < 3) {
      errorHandler.handleValidationError(
        new Error('Input must be at least 3 characters long'),
        'exampleInput',
        inputValue
      );
      return;
    }
    
    // Success case
    errorHandler.handleError('Input validation passed!', errorHandler.ERROR_TYPES.UNKNOWN_ERROR, {
      inputValue,
      validationType: 'success'
    }, false); // Don't show toast for success
  };

  // Example: Simulate user interaction error
  const simulateUserInteractionError = () => {
    try {
      // Simulate some user action that fails
      throw new Error('User action failed: Invalid operation');
    } catch (error) {
      errorHandler.handleUserInteractionError(
        error as Error,
        'button_click',
        { buttonId: 'simulate-interaction', timestamp: new Date().toISOString() }
      );
    }
  };

  // Example: Simulate form submission error
  const simulateFormError = () => {
    const formData = {
      email: 'invalid-email',
      password: '123',
      name: inputValue
    };
    
    try {
      // Simulate form validation
      if (!formData.email.includes('@')) {
        throw new Error('Invalid email format');
      }
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
    } catch (error) {
      errorHandler.handleFormError(error as Error, 'exampleForm', formData);
    }
  };

  // Example: Using withErrorHandling wrapper
  const simulateAsyncOperation = errorHandler.withErrorHandling(
    async (data: string) => {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (data === 'error') {
        throw new Error('Async operation failed');
      }
      
      return `Operation completed with: ${data}`;
    },
    errorHandler.ERROR_TYPES.USER_INTERACTION,
    { operationType: 'async_example' }
  );

  // Example: Simulate performance error
  const simulatePerformanceError = () => {
    // Simulate high memory usage
    const largeArray = new Array(1000000).fill('test');
    
    errorHandler.handlePerformanceError(
      new Error('Memory usage exceeded threshold'),
      'memory_usage',
      85.5
    );
    
    // Clean up
    largeArray.length = 0;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PostHog Error Tracking Examples</CardTitle>
          <CardDescription>
            This component demonstrates various error tracking scenarios that will be captured by PostHog.
            Check your PostHog dashboard to see the error events and issues.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Error Example */}
          <div className="space-y-2">
            <Label>API Error Simulation</Label>
            <Button 
              onClick={simulateApiError} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Simulating...' : 'Simulate API Error'}
            </Button>
            <p className="text-sm text-gray-600">
              Simulates a failed API request with 500 status code
            </p>
          </div>

          {/* Network Error Example */}
          <div className="space-y-2">
            <Label>Network Error Simulation</Label>
            <Button 
              onClick={simulateNetworkError} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Simulating...' : 'Simulate Network Error'}
            </Button>
            <p className="text-sm text-gray-600">
              Simulates a network connectivity issue
            </p>
          </div>

          {/* Validation Error Example */}
          <div className="space-y-2">
            <Label>Validation Error Simulation</Label>
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter text (leave empty or short for error)"
                className="flex-1"
              />
              <Button onClick={simulateValidationError} variant="outline">
                Validate Input
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Try leaving the input empty or entering less than 3 characters
            </p>
          </div>

          {/* User Interaction Error Example */}
          <div className="space-y-2">
            <Label>User Interaction Error Simulation</Label>
            <Button onClick={simulateUserInteractionError} variant="outline">
              Simulate User Action Error
            </Button>
            <p className="text-sm text-gray-600">
              Simulates a user interaction that fails
            </p>
          </div>

          {/* Form Error Example */}
          <div className="space-y-2">
            <Label>Form Submission Error Simulation</Label>
            <Button onClick={simulateFormError} variant="outline">
              Simulate Form Error
            </Button>
            <p className="text-sm text-gray-600">
              Simulates form validation errors
            </p>
          </div>

          {/* Async Operation Example */}
          <div className="space-y-2">
            <Label>Async Operation Error Simulation</Label>
            <div className="flex gap-2">
              <Button 
                onClick={() => simulateAsyncOperation('success')} 
                variant="outline"
              >
                Simulate Success
              </Button>
              <Button 
                onClick={() => simulateAsyncOperation('error')} 
                variant="outline"
              >
                Simulate Error
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Demonstrates error handling with async operations
            </p>
          </div>

          {/* Performance Error Example */}
          <div className="space-y-2">
            <Label>Performance Error Simulation</Label>
            <Button onClick={simulatePerformanceError} variant="outline">
              Simulate Performance Issue
            </Button>
            <p className="text-sm text-gray-600">
              Simulates a performance-related error
            </p>
          </div>

          {/* Manual Error Tracking */}
          <div className="space-y-2">
            <Label>Manual Error Tracking</Label>
            <Button 
              onClick={() => {
                errorHandler.handleError(
                  'This is a manually tracked error for demonstration',
                  errorHandler.ERROR_TYPES.UNKNOWN_ERROR,
                  { manualTracking: true, timestamp: new Date().toISOString() }
                );
              }} 
              variant="outline"
            >
              Track Manual Error
            </Button>
            <p className="text-sm text-gray-600">
              Manually tracks a custom error with additional context
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Error Tracking Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><strong>Automatic Error Capture:</strong> All errors are automatically captured and sent to PostHog</li>
            <li><strong>Rich Context:</strong> Each error includes user info, page context, browser details, and performance data</li>
            <li><strong>Error Categorization:</strong> Errors are categorized by type (API, Network, Validation, etc.)</li>
            <li><strong>Severity Levels:</strong> Errors are assigned severity levels (Low, Medium, High, Critical)</li>
            <li><strong>User Feedback:</strong> Automatic toast notifications for user-facing errors</li>
            <li><strong>Global Handlers:</strong> Unhandled errors and promise rejections are automatically tracked</li>
            <li><strong>React Error Boundary:</strong> React component errors are caught and tracked</li>
            <li><strong>Performance Monitoring:</strong> Memory usage and performance issues are tracked</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}; 