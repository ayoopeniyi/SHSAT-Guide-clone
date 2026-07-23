import React, { Component, ErrorInfo, ReactNode } from 'react';
import { usePostHog } from 'posthog-js/react';
import { useAuthStore } from '../stores/authStore';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundaryClass extends Component<Props & { posthog: any; user: any }, State> {
  constructor(props: Props & { posthog: any; user: any }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });

    // Track error with PostHog
    if (this.props.posthog) {
      const errorProperties = {
        error_type: 'react_component_error',
        error_message: error.message,
        error_stack: error.stack,
        error_info: {
          componentStack: errorInfo.componentStack,
        },
        user_email: this.props.user?.email || 'anonymous',
        user_name: this.props.user?.name || 'anonymous',
        user_role: this.props.user?.role || 'unknown',
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        page_path: window.location.pathname,
        user_agent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        // Additional context
        error_boundary: true,
        error_source: 'react_component',
      };

      this.props.posthog.capture('$exception', errorProperties);
      console.error('PostHog: React Error Boundary caught error:', errorProperties);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-red-500">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                We've encountered an unexpected error. Our team has been notified.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Reload Page
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to provide PostHog and user context
export const ErrorBoundary: React.FC<Props> = ({ children, fallback }) => {
  const posthog = usePostHog();
  const { user } = useAuthStore();

  return (
    <ErrorBoundaryClass posthog={posthog} user={user} fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  );
}; 