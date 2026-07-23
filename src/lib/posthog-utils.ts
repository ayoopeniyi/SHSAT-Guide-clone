import { usePostHog } from 'posthog-js/react'
import { useAuthStore } from '../stores/authStore'

// Hook to get PostHog and user info
export const usePostHogTracking = () => {
  const posthog = usePostHog()
  const getUserName = useAuthStore((state) => state.getUserName)
  const user = useAuthStore((state) => state.user)

  const trackButtonClick = (
    buttonName: string,
    additionalProperties: Record<string, any> = {}
  ) => {
    const userName = getUserName()
    
    /* console.log(`PostHog tracking - ${buttonName}:`, {
      userName,
      user,
      userEmail: user?.email,
      userNameFromUser: user?.name,
      ...additionalProperties
    }) */

    posthog.capture('button_clicked', {
      button_name: buttonName,
      user_name: userName,
      user_email: user?.email || 'unknown',
      user_id: user?.id || 'unknown',
      user_role: user?.role || 'unknown',
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_path: window.location.pathname,
      ...additionalProperties
    })
  }

  const trackFormSubmit = (
    formName: string,
    additionalProperties: Record<string, any> = {}
  ) => {
    const userName = getUserName()
    
    /* console.log(`PostHog tracking - Form Submit: ${formName}:`, {
      userName,
      user,
      userEmail: user?.email,
      userNameFromUser: user?.name,
      ...additionalProperties
    }) */

    posthog.capture('form_submitted', {
      form_name: formName,
      user_name: userName,
      user_email: user?.email || 'unknown',
      user_id: user?.id || 'unknown',
      user_role: user?.role || 'unknown',
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_path: window.location.pathname,
      ...additionalProperties
    })
  }

  const trackPageView = (
    pageName: string,
    additionalProperties: Record<string, any> = {}
  ) => {
    const userName = getUserName()
    
    /* console.log(`PostHog tracking - Page View: ${pageName}:`, {
      userName,
      user,
      userEmail: user?.email,
      userNameFromUser: user?.name,
      ...additionalProperties
    }) */

    posthog.capture('page_viewed', {
      page_name: pageName,
      user_name: userName,
      user_email: user?.email || 'unknown',
      user_id: user?.id || 'unknown',
      user_role: user?.role || 'unknown',
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_path: window.location.pathname,
      ...additionalProperties
    })
  }

  const trackUserAction = (
    actionName: string,
    additionalProperties: Record<string, any> = {}
  ) => {
    const userName = getUserName()
    
    /* console.log(`PostHog tracking - User Action: ${actionName}:`, {
      userName,
      user,
      userEmail: user?.email,
      userNameFromUser: user?.name,
      ...additionalProperties
    }) */

    posthog.capture('user_action', {
      action_name: actionName,
      user_name: userName,
      user_email: user?.email || 'unknown',
      user_id: user?.id || 'unknown',
      user_role: user?.role || 'unknown',
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_path: window.location.pathname,
      ...additionalProperties
    })
  }

  return {
    posthog,
    trackButtonClick,
    trackFormSubmit,
    trackPageView,
    trackUserAction,
    getUserName,
    user
  }
}

// Predefined button tracking functions for common actions
export const useCommonButtonTracking = () => {
  const { trackButtonClick } = usePostHogTracking()

  const trackLoginButton = () => {
    trackButtonClick('login_button')
  }

  const trackSignupButton = () => {
    trackButtonClick('signup_button')
  }

  const trackLogoutButton = () => {
    trackButtonClick('logout_button')
  }

  const trackCreateButton = (itemType: string, additionalProps: Record<string, any> = {}) => {
    trackButtonClick('create_button', {
      item_type: itemType,
      ...additionalProps
    })
  }

  const trackEditButton = (itemType: string, itemId: string, additionalProps: Record<string, any> = {}) => {
    trackButtonClick('edit_button', {
      item_type: itemType,
      item_id: itemId,
      ...additionalProps
    })
  }

  const trackDeleteButton = (itemType: string, itemId: string, additionalProps: Record<string, any> = {}) => {
    trackButtonClick('delete_button', {
      item_type: itemType,
      item_id: itemId,
      ...additionalProps
    })
  }

  const trackSaveButton = (itemType: string, additionalProps: Record<string, any> = {}) => {
    trackButtonClick('save_button', {
      item_type: itemType,
      ...additionalProps
    })
  }

  const trackCancelButton = () => {
    trackButtonClick('cancel_button')
  }

  const trackSubmitButton = (formType: string, additionalProps: Record<string, any> = {}) => {
    trackButtonClick('submit_button', {
      form_type: formType,
      ...additionalProps
    })
  }

  return {
    trackLoginButton,
    trackSignupButton,
    trackLogoutButton,
    trackCreateButton,
    trackEditButton,
    trackDeleteButton,
    trackSaveButton,
    trackCancelButton,
    trackSubmitButton
  }
} 