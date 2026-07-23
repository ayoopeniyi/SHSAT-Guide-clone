import React from 'react';
import { usePostHog } from 'posthog-js/react';
import { useAuthStore } from '../stores/authStore';

// Hook for comprehensive action tracking
export const useActionTracking = () => {
  const posthog = usePostHog();
  const getUserName = useAuthStore((state) => state.getUserName);
  const user = useAuthStore((state) => state.user);

  // Track any action with rich context
  const trackAction = (
    actionType: string,
    category: string,
    actionDetails: Record<string, any> = {},
    additionalProperties: Record<string, any> = {}
  ) => {
    const userName = getUserName();
    
    /* console.log(`PostHog tracking - ${actionType}:`, {
      userName,
      user,
      userEmail: user?.email,
      userNameFromUser: user?.name,
      ...actionDetails,
      ...additionalProperties
    }); */

    posthog.capture(actionType, {
      action_category: category,
      action_type: actionType,
      user_name: userName,
      user_email: user?.email || 'unknown',
      user_id: user?.id || 'unknown',
      user_role: user?.role || 'unknown',
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_path: window.location.pathname,
      ...actionDetails,
      ...additionalProperties
    });
  };

  // Navigation actions
  const trackNavigation = (
    actionType: 'navigation_click' | 'back_button' | 'menu_toggle',
    details: {
      from_page?: string;
      to_page?: string;
      button_name?: string;
      section_id?: string;
    } = {}
  ) => {
    trackAction(actionType, 'navigation', details);
  };

  // Content creation actions
  const trackContentCreation = (
    contentType: 'question' | 'test_pack' | 'passage' | 'bulk_questions',
    details: {
      content_id?: string | number;
      content_type?: string;
      content_name?: string;
      difficulty?: number;
      subject?: string;
      question_count?: number;
    } = {}
  ) => {
    const actionType = `${contentType}_created`;
    trackAction(actionType, 'content_creation', details);
  };

  // Content editing actions
  const trackContentEditing = (
    contentType: 'question' | 'test_pack' | 'passage' | 'choices',
    details: {
      content_id?: string | number;
      content_type?: string;
      changes_made?: Record<string, any>;
      field_edited?: string;
    } = {}
  ) => {
    const actionType = `${contentType}_edited`;
    trackAction(actionType, 'content_editing', details);
  };

  // Content deletion actions
  const trackContentDeletion = (
    contentType: 'question' | 'test_pack' | 'passage',
    details: {
      content_id?: string | number;
      content_type?: string;
      content_name?: string;
      reason?: string;
    } = {}
  ) => {
    const actionType = `${contentType}_deleted`;
    trackAction(actionType, 'content_deletion', details);
  };

  // Content viewing actions
  const trackContentViewing = (
    contentType: 'question' | 'test_pack' | 'passage',
    details: {
      content_id?: string | number;
      content_type?: string;
      view_duration?: number;
      view_source?: string;
    } = {}
  ) => {
    const actionType = `${contentType}_viewed`;
    trackAction(actionType, 'content_viewing', details);
  };

  // Content management actions
  const trackContentManagement = (
    actionType: 'question_activated' | 'question_deactivated' | 'question_added_to_test' | 'question_removed_from_test',
    details: {
      content_id?: string | number;
      test_id?: string | number;
      reason?: string;
    } = {}
  ) => {
    trackAction(actionType, 'content_editing', details);
  };

  // Search and filter actions
  const trackSearchFilter = (
    actionType: 'search_performed' | 'filter_applied' | 'filter_cleared' | 'sort_changed',
    details: {
      search_term?: string;
      filter_criteria?: Record<string, any>;
      sort_field?: string;
      sort_direction?: 'asc' | 'desc';
      results_count?: number;
    } = {}
  ) => {
    const category = actionType.includes('search') ? 'search' : 'filter';
    trackAction(actionType, category, details);
  };

  // Error tracking
  const trackError = (
    errorType: 'validation_error' | 'api_error' | 'error_occurred',
    details: {
      error_message?: string;
      error_code?: string;
      error_context?: Record<string, any>;
      user_action?: string;
    } = {}
  ) => {
    trackAction(errorType, 'error', details);
  };

  // Button click tracking with context
  const trackButtonClick = (
    buttonName: string,
    buttonContext: {
      page?: string;
      section?: string;
      action?: string;
      target_id?: string | number;
    } = {}
  ) => {
    trackAction('button_clicked', 'navigation', {
      button_name: buttonName,
      ...buttonContext
    });
  };

  // Form submission tracking
  const trackFormSubmission = (
    formName: string,
    formContext: {
      page?: string;
      success?: boolean;
      validation_errors?: string[];
      fields_filled?: string[];
    } = {}
  ) => {
    trackAction('form_submitted', 'content_creation', {
      form_name: formName,
      ...formContext
    });
  };

  return {
    // General tracking
    trackAction,
    
    // Specific action tracking
    trackNavigation,
    trackContentCreation,
    trackContentEditing,
    trackContentDeletion,
    trackContentViewing,
    trackContentManagement,
    trackSearchFilter,
    trackError,
    trackButtonClick,
    trackFormSubmission
  };
};

// Hook for tracking form interactions
export const useFormTracking = (formName: string) => {
  const { trackFormSubmission, trackError } = useActionTracking();

  const trackFormStart = () => {
    trackFormSubmission(formName, { success: false });
  };

  const trackFormSuccess = (data?: any) => {
    trackFormSubmission(formName, { 
      success: true,
      fields_filled: data ? Object.keys(data) : []
    });
  };

  const trackFormError = (errors: string[]) => {
    trackFormSubmission(formName, { 
      success: false,
      validation_errors: errors
    });
  };

  const trackFormValidationError = (field: string, error: string) => {
    trackError('validation_error', {
      error_message: error,
      error_context: {
        form_name: formName,
        field_name: field
      }
    });
  };

  return {
    trackFormStart,
    trackFormSuccess,
    trackFormError,
    trackFormValidationError
  };
};

// Hook for tracking button interactions
export const useButtonTracking = () => {
  const { trackButtonClick } = useActionTracking();

  const trackButton = (
    buttonName: string,
    context?: {
      page?: string;
      section?: string;
      action?: string;
      target_id?: string | number;
    }
  ) => {
    return () => {
      trackButtonClick(buttonName, context);
    };
  };

  return { trackButton };
};