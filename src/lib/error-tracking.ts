import { usePostHog } from 'posthog-js/react';
import { useAuthStore } from '../stores/authStore';

// Error types for categorization
export const ERROR_TYPES = {
  // React/Component Errors
  REACT_COMPONENT: 'REACT_COMPONENT',
  REACT_RENDER: 'REACT_RENDER',
  
  // JavaScript Runtime Errors
  JAVASCRIPT_ERROR: 'JAVASCRIPT_ERROR',
  SYNTAX_ERROR: 'SYNTAX_ERROR',
  TYPE_ERROR: 'TYPE_ERROR',
  REFERENCE_ERROR: 'REFERENCE_ERROR',
  RANGE_ERROR: 'RANGE_ERROR',
  
  // Network/API Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  FETCH_ERROR: 'FETCH_ERROR',
  
  // User Interaction Errors
  USER_INTERACTION: 'USER_INTERACTION',
  FORM_VALIDATION: 'FORM_VALIDATION',
  
  // Performance Errors
  PERFORMANCE_ERROR: 'PERFORMANCE_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Third-party Errors
  THIRD_PARTY_ERROR: 'THIRD_PARTY_ERROR',
  
  // Unknown/Generic
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

// Error context interface
export interface ErrorContext {
  componentName?: string;
  functionName?: string;
  lineNumber?: number;
  columnNumber?: number;
  fileName?: string;
  userAction?: string;
  formData?: Record<string, any>;
  apiEndpoint?: string;
  requestMethod?: string;
  responseStatus?: number;
  componentStack?: string;
  requestUrl?: string;
  validationField?: string;
  validationValue?: string;
  performanceMetric?: string;
  performanceValue?: string | number;
  errorSource?: string;
  promiseStatus?: string;
  resourceType?: string;
  resourceUrl?: string;
  formName?: string;
  browserInfo?: {
    userAgent: string;
    language: string;
    platform: string;
    cookieEnabled: boolean;
    onLine: boolean;
  };
  performanceInfo?: {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
    timing?: {
      navigationStart: number;
      loadEventEnd: number;
      domContentLoadedEventEnd: number;
    };
  };
  customProperties?: Record<string, any>;
}

// Enhanced error tracking hook
export const useErrorTracking = () => {
  const posthog = usePostHog();
  const { user, getUserName } = useAuthStore();

  // Determine error severity based on error type and context
  const getErrorSeverity = (error: Error, errorType: string, context?: ErrorContext): keyof typeof ERROR_SEVERITY => {
    // Critical errors that break the app
    if (errorType === ERROR_TYPES.REACT_COMPONENT || 
        errorType === ERROR_TYPES.SYNTAX_ERROR ||
        errorType === ERROR_TYPES.REFERENCE_ERROR) {
      return ERROR_SEVERITY.CRITICAL;
    }
    
    // High severity errors that affect functionality
    if (errorType === ERROR_TYPES.API_ERROR || 
        errorType === ERROR_TYPES.NETWORK_ERROR ||
        errorType === ERROR_TYPES.TYPE_ERROR) {
      return ERROR_SEVERITY.HIGH;
    }
    
    // Medium severity errors that might affect user experience
    if (errorType === ERROR_TYPES.USER_INTERACTION || 
        errorType === ERROR_TYPES.FORM_VALIDATION ||
        errorType === ERROR_TYPES.PERFORMANCE_ERROR) {
      return ERROR_SEVERITY.MEDIUM;
    }
    
    // Low severity errors that are mostly informational
    return ERROR_SEVERITY.LOW;
  };

  // Get browser and performance information
  const getBrowserInfo = () => ({
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
  });

  const getPerformanceInfo = () => {
    const info: any = {};
    
    // Memory information (if available)
    if ('memory' in performance) {
      info.memory = (performance as any).memory;
    }
    
    // Navigation timing (if available)
    if ('timing' in performance) {
      info.timing = (performance as any).timing;
    }
    
    return info;
  };

  // Enhanced error tracking function
  const trackError = (
    error: Error | string,
    errorType: keyof typeof ERROR_TYPES = ERROR_TYPES.UNKNOWN_ERROR,
    context?: ErrorContext,
    additionalProperties: Record<string, any> = {}
  ) => {
    if (!posthog) {
      console.warn('PostHog not available for error tracking');
      return;
    }

    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    const severity = getErrorSeverity(error instanceof Error ? error : new Error(errorMessage), errorType, context);
    
    const errorProperties = {
      // Error information
      error_type: errorType,
      error_message: errorMessage,
      error_stack: errorStack,
      error_severity: severity,
      
      // User context
      user_email: user?.email || 'anonymous',
      user_name: user?.name || getUserName() || 'anonymous',
      user_role: user?.role || 'unknown',
      user_id: user?.id || 'anonymous',
      
      // Page context
      page_url: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title,
      referrer: document.referrer,
      
      // Timestamp
      timestamp: new Date().toISOString(),
      
      // Browser and environment
      browser_info: getBrowserInfo(),
      performance_info: getPerformanceInfo(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      
      // Error context
      error_context: context || {},
      
      // Additional properties
      ...additionalProperties,
    };

    // Capture as PostHog exception event
    posthog.capture('$exception', errorProperties);
    
    // Also capture as custom error event for better filtering
    posthog.capture('error_tracked', {
      ...errorProperties,
      error_category: 'application_error',
    });

    console.error('PostHog: Error tracked:', {
      type: errorType,
      message: errorMessage,
      severity,
      user: user?.email || 'anonymous',
    });
  };

  // Track specific error types with convenience functions
  const trackReactError = (error: Error, errorInfo?: any, context?: ErrorContext) => {
    trackError(error, ERROR_TYPES.REACT_COMPONENT, {
      ...context,
      componentStack: errorInfo?.componentStack,
    });
  };

  const trackApiError = (error: Error, endpoint?: string, method?: string, status?: number, context?: ErrorContext) => {
    trackError(error, ERROR_TYPES.API_ERROR, {
      ...context,
      apiEndpoint: endpoint,
      requestMethod: method,
      responseStatus: status,
    });
  };

  const trackNetworkError = (error: Error, url?: string, context?: ErrorContext) => {
    trackError(error, ERROR_TYPES.NETWORK_ERROR, {
      ...context,
      requestUrl: url,
    });
  };

  const trackUserInteractionError = (error: Error, action?: string, formData?: Record<string, any>, context?: ErrorContext) => {
    trackError(error, ERROR_TYPES.USER_INTERACTION, {
      ...context,
      userAction: action,
      formData,
    });
  };

  const trackValidationError = (error: Error, field?: string, value?: any, context?: ErrorContext) => {
    trackError(error, ERROR_TYPES.FORM_VALIDATION, {
      ...context,
      validationField: field,
      validationValue: value,
    });
  };

  const trackPerformanceError = (error: Error, metric?: string, value?: number, context?: ErrorContext) => {
    trackError(error, ERROR_TYPES.PERFORMANCE_ERROR, {
      ...context,
      performanceMetric: metric,
      performanceValue: value,
    });
  };

  // Track unhandled promise rejections
  const trackUnhandledRejection = (reason: any, promise: Promise<any>) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    trackError(error, ERROR_TYPES.JAVASCRIPT_ERROR, {
      errorSource: 'unhandled_promise_rejection',
      promiseStatus: 'rejected',
    });
  };

  // Track resource loading errors
  const trackResourceError = (event: Event) => {
    const target = event.target as HTMLElement;
    const error = new Error(`Resource failed to load: ${target.tagName} - ${(target as any).src || (target as any).href}`);
    
    trackError(error, ERROR_TYPES.NETWORK_ERROR, {
      errorSource: 'resource_loading',
      resourceType: target.tagName,
      resourceUrl: (target as any).src || (target as any).href,
    });
  };

  return {
    trackError,
    trackReactError,
    trackApiError,
    trackNetworkError,
    trackUserInteractionError,
    trackValidationError,
    trackPerformanceError,
    trackUnhandledRejection,
    trackResourceError,
    ERROR_TYPES,
    ERROR_SEVERITY,
  };
};

// Global error handlers setup
export const setupGlobalErrorHandlers = (trackError: (error: Error, type: string, context?: ErrorContext) => void) => {
  // Handle unhandled JavaScript errors
  const handleUnhandledError = (event: ErrorEvent) => {
    const error = new Error(event.message);
    error.stack = event.error?.stack;
    
    trackError(error, ERROR_TYPES.JAVASCRIPT_ERROR, {
      errorSource: 'unhandled_error',
      fileName: event.filename,
      lineNumber: event.lineno,
      columnNumber: event.colno,
    });
  };

  // Handle unhandled promise rejections
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    
    trackError(error, ERROR_TYPES.JAVASCRIPT_ERROR, {
      errorSource: 'unhandled_promise_rejection',
      promiseStatus: 'rejected',
    });
  };

  // Handle resource loading errors
  const handleResourceError = (event: Event) => {
    const target = event.target as HTMLElement;
    const error = new Error(`Resource failed to load: ${target.tagName} - ${(target as any).src || (target as any).href}`);
    
    trackError(error, ERROR_TYPES.NETWORK_ERROR, {
      errorSource: 'resource_loading',
      resourceType: target.tagName,
      resourceUrl: (target as any).src || (target as any).href,
    });
  };

  // Add event listeners
  window.addEventListener('error', handleUnhandledError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  window.addEventListener('error', handleResourceError, true); // Use capture phase for resource errors

  // Return cleanup function
  return () => {
    window.removeEventListener('error', handleUnhandledError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    window.removeEventListener('error', handleResourceError, true);
  };
}; 