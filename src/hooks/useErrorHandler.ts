import { useCallback } from 'react';
import { useErrorTrackingContext } from '../components/ErrorTrackingProvider';
import { toast } from 'sonner';

// Error handling hook for easy use in components
export const useErrorHandler = () => {
  const errorTracking = useErrorTrackingContext();

  // Handle API errors with automatic tracking and user feedback
  const handleApiError = useCallback((
    error: Error,
    endpoint?: string,
    method?: string,
    status?: number,
    showToast: boolean = true
  ) => {
    errorTracking.trackApiError(error, endpoint, method, status);
    
    if (showToast) {
      toast.error(error.message || 'An error occurred while processing your request');
    }
  }, [errorTracking]);

  // Handle network errors
  const handleNetworkError = useCallback((
    error: Error,
    url?: string,
    showToast: boolean = true
  ) => {
    errorTracking.trackNetworkError(error, url);
    
    if (showToast) {
      toast.error('Network error. Please check your connection and try again.');
    }
  }, [errorTracking]);

  // Handle user interaction errors
  const handleUserInteractionError = useCallback((
    error: Error,
    action?: string,
    formData?: Record<string, any>,
    showToast: boolean = true
  ) => {
    errorTracking.trackUserInteractionError(error, action, formData);
    
    if (showToast) {
      toast.error(error.message || 'An error occurred while processing your action');
    }
  }, [errorTracking]);

  // Handle validation errors
  const handleValidationError = useCallback((
    error: Error,
    field?: string,
    value?: any,
    showToast: boolean = true
  ) => {
    errorTracking.trackValidationError(error, field, value);
    
    if (showToast) {
      toast.error(error.message || 'Please check your input and try again');
    }
  }, [errorTracking]);

  // Handle React component errors
  const handleReactError = useCallback((
    error: Error,
    errorInfo?: any,
    showToast: boolean = false // Usually don't show toast for React errors
  ) => {
    errorTracking.trackReactError(error, errorInfo);
    
    if (showToast) {
      toast.error('Something went wrong. Please refresh the page and try again.');
    }
  }, [errorTracking]);

  // Handle performance errors
  const handlePerformanceError = useCallback((
    error: Error,
    metric?: string,
    value?: number,
    showToast: boolean = false
  ) => {
    errorTracking.trackPerformanceError(error, metric, value);
    
    if (showToast) {
      toast.error('Performance issue detected. Please try again.');
    }
  }, [errorTracking]);

  // Generic error handler
  const handleError = useCallback((
    error: Error | string,
    errorType: keyof typeof errorTracking.ERROR_TYPES = errorTracking.ERROR_TYPES.UNKNOWN_ERROR,
    context?: any,
    showToast: boolean = true
  ) => {
    errorTracking.trackError(error, errorType, context);
    
    if (showToast) {
      const message = typeof error === 'string' ? error : error.message;
      toast.error(message || 'An unexpected error occurred');
    }
  }, [errorTracking]);

  // Async error wrapper for functions
  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    errorType: keyof typeof errorTracking.ERROR_TYPES = errorTracking.ERROR_TYPES.UNKNOWN_ERROR,
    context?: any,
    showToast: boolean = true
  ) => {
    return async (...args: T): Promise<R | undefined> => {
      try {
        return await fn(...args);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        handleError(errorObj, errorType, context, showToast);
        return undefined;
      }
    };
  }, [handleError]);

  // Form submission error handler
  const handleFormError = useCallback((
    error: Error,
    formName?: string,
    formData?: Record<string, any>
  ) => {
    errorTracking.trackUserInteractionError(error, 'form_submission', formData, {
      formName,
      componentName: 'Form',
    });
    
    toast.error('Please check your form and try again');
  }, [errorTracking]);

  // File upload error handler
  const handleFileUploadError = useCallback((
    error: Error,
    fileName?: string,
    fileSize?: number
  ) => {
    errorTracking.trackUserInteractionError(error, 'file_upload', {
      fileName,
      fileSize,
    });
    
    toast.error('File upload failed. Please try again.');
  }, [errorTracking]);

  return {
    // Error tracking functions
    handleApiError,
    handleNetworkError,
    handleUserInteractionError,
    handleValidationError,
    handleReactError,
    handlePerformanceError,
    handleError,
    handleFormError,
    handleFileUploadError,
    
    // Utility functions
    withErrorHandling,
    
    // Direct access to error tracking
    trackError: errorTracking.trackError,
    ERROR_TYPES: errorTracking.ERROR_TYPES,
    ERROR_SEVERITY: errorTracking.ERROR_SEVERITY,
  };
}; 