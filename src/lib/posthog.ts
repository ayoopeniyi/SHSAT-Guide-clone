import posthog from 'posthog-js'

// Export PostHog instance for direct use
export { posthog }

// Utility functions for common PostHog operations
export const captureEvent = (eventName: string, properties?: Record<string, any>) => {
  posthog.capture(eventName, properties)
}

export const identifyUser = (userId: string, userProperties?: Record<string, any>) => {
  posthog.identify(userId, userProperties)
}

export const setUserProperties = (properties: Record<string, any>) => {
  posthog.set_config(properties)
}

export const resetUser = () => {
  posthog.reset()
}

// Common event names for consistency
export const EVENTS = {
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  QUESTION_ANSWERED: 'question_answered',
  TEST_COMPLETED: 'test_completed',
  CHAPTER_VIEWED: 'chapter_viewed',
  PASSAGE_READ: 'passage_read',
} as const