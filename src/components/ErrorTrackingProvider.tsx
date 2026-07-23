import React, { useEffect, createContext, useContext, ReactNode } from 'react';
import { useErrorTracking, setupGlobalErrorHandlers } from '../lib/error-tracking';

// Error tracking context
interface ErrorTrackingContextType {
  trackError: ReturnType<typeof useErrorTracking>['trackError'];
  trackReactError: ReturnType<typeof useErrorTracking>['trackReactError'];
  trackApiError: ReturnType<typeof useErrorTracking>['trackApiError'];
  trackNetworkError: ReturnType<typeof useErrorTracking>['trackNetworkError'];
  trackUserInteractionError: ReturnType<typeof useErrorTracking>['trackUserInteractionError'];
  trackValidationError: ReturnType<typeof useErrorTracking>['trackValidationError'];
  trackPerformanceError: ReturnType<typeof useErrorTracking>['trackPerformanceError'];
  ERROR_TYPES: ReturnType<typeof useErrorTracking>['ERROR_TYPES'];
  ERROR_SEVERITY: ReturnType<typeof useErrorTracking>['ERROR_SEVERITY'];
}

const ErrorTrackingContext = createContext<ErrorTrackingContextType | null>(null);

// Hook to use error tracking context
export const useErrorTrackingContext = () => {
  const context = useContext(ErrorTrackingContext);
  if (!context) {
    throw new Error('useErrorTrackingContext must be used within an ErrorTrackingProvider');
  }
  return context;
};

interface ErrorTrackingProviderProps {
  children: ReactNode;
}

export const ErrorTrackingProvider: React.FC<ErrorTrackingProviderProps> = ({ children }) => {
  const errorTracking = useErrorTracking();

  useEffect(() => {
    // Set up global error handlers
    const cleanup = setupGlobalErrorHandlers(errorTracking.trackError);

    // Track app initialization
    errorTracking.trackError(
      new Error('App initialized with error tracking'),
      errorTracking.ERROR_TYPES.UNKNOWN_ERROR,
      {
        componentName: 'ErrorTrackingProvider',
        functionName: 'useEffect',
        userAction: 'app_initialization',
      },
      {
        initialization_type: 'error_tracking_setup',
        setup_success: true,
      }
    );

    // Cleanup function
    return cleanup;
  }, [errorTracking.trackError]);

  // Track page visibility changes (potential performance issues)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page hidden - could indicate performance issues or user leaving due to errors
        errorTracking.trackError(
          new Error('Page visibility changed to hidden'),
          errorTracking.ERROR_TYPES.PERFORMANCE_ERROR,
          {
            componentName: 'ErrorTrackingProvider',
            functionName: 'handleVisibilityChange',
            userAction: 'page_hidden',
          },
          {
            visibility_state: 'hidden',
            timestamp: new Date().toISOString(),
          }
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [errorTracking.trackError]);

  // Track online/offline status changes
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      const isOnline = navigator.onLine;
      if (!isOnline) {
        errorTracking.trackError(
          new Error('Network connection lost'),
          errorTracking.ERROR_TYPES.NETWORK_ERROR,
          {
            componentName: 'ErrorTrackingProvider',
            functionName: 'handleOnlineStatusChange',
            userAction: 'network_offline',
          },
          {
            network_status: 'offline',
            timestamp: new Date().toISOString(),
          }
        );
      }
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, [errorTracking.trackError]);

  // Track memory usage warnings (if available)
  useEffect(() => {
    const checkMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedPercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        if (usedPercentage > 80) {
          errorTracking.trackError(
            new Error(`High memory usage detected: ${usedPercentage.toFixed(2)}%`),
            errorTracking.ERROR_TYPES.PERFORMANCE_ERROR,
            {
              componentName: 'ErrorTrackingProvider',
              functionName: 'checkMemoryUsage',
              userAction: 'memory_check',
            },
            {
              memory_usage_percentage: usedPercentage,
              memory_used: memory.usedJSHeapSize,
              memory_limit: memory.jsHeapSizeLimit,
            }
          );
        }
      }
    };

    // Check memory usage every 30 seconds
    const interval = setInterval(checkMemoryUsage, 30000);
    
    return () => clearInterval(interval);
  }, [errorTracking.trackError]);

  const contextValue: ErrorTrackingContextType = {
    trackError: errorTracking.trackError,
    trackReactError: errorTracking.trackReactError,
    trackApiError: errorTracking.trackApiError,
    trackNetworkError: errorTracking.trackNetworkError,
    trackUserInteractionError: errorTracking.trackUserInteractionError,
    trackValidationError: errorTracking.trackValidationError,
    trackPerformanceError: errorTracking.trackPerformanceError,
    ERROR_TYPES: errorTracking.ERROR_TYPES,
    ERROR_SEVERITY: errorTracking.ERROR_SEVERITY,
  };

  return (
    <ErrorTrackingContext.Provider value={contextValue}>
      {children}
    </ErrorTrackingContext.Provider>
  );
}; 