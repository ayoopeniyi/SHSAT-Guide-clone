import { usePostHog } from 'posthog-js/react'
import { useAuthStore } from '../stores/authStore'

// Analytics Event Types
export const ANALYTICS_EVENTS = {
  // User Authentication & Identification
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  
  // Core Product Activity (for DAU/WAU/MAU)
  QUESTION_CREATED: 'question_created',
  TEST_PACK_CREATED: 'test_pack_created',
  TEST_PACK_VIEWED: 'test_pack_viewed',
  QUESTION_VIEWED: 'question_viewed',
  CHAPTER_ACCESSED: 'chapter_accessed',
  PRACTICE_SESSION_STARTED: 'practice_session_started',
  PRACTICE_SESSION_COMPLETED: 'practice_session_completed',
  
  // Question Bank Analytics
  QUESTION_EDITED: 'question_edited',
  QUESTION_DELETED: 'question_deleted',
  QUESTION_ACTIVATED: 'question_activated',
  QUESTION_DEACTIVATED: 'question_deactivated',
  
  // Test Pack Analytics
  TEST_PACK_QUESTION_ADDED: 'test_pack_question_added',
  TEST_PACK_QUESTION_REMOVED: 'test_pack_question_removed',
  TEST_PACK_PUBLISHED: 'test_pack_published',
  TEST_PACK_DUPLICATED: 'test_pack_duplicated',
  
  // Session & Engagement
  PAGE_VIEWED: 'page_viewed',
  FEATURE_USED: 'feature_used',
  ERROR_OCCURRED: 'error_occurred'
} as const

// Question Types for Analytics
export const QUESTION_TYPES = {
  MC: 'MC',
  MA: 'MA', 
  BLANK: 'BLANK',
  DND: 'DND',
  GRAPH_SELECTOR: 'GRAPH_SELECTOR',
  EQUATION_CALCULATOR: 'EQUATION_CALCULATOR',
  RAY_SELECTOR: 'RAY_SELECTOR',
  HOT_TEXT: 'HOT_TEXT',
  TABLE_GRID: 'TABLE_GRID'
} as const

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: 1,
  MEDIUM: 3,
  HARD: 5
} as const

// Subjects
export const SUBJECTS = {
  MATH: 'Math',
  ENGLISH: 'English',
  READING: 'Reading',
  SCIENCE: 'Science'
} as const

// Main Analytics Hook
export const usePostHogAnalytics = () => {
  const posthog = usePostHog()
  const { user, getUserName } = useAuthStore()

  // Core User Identification
  const identifyUser = (userId: string, userProperties: Record<string, any> = {}) => {
    if (!posthog) return

    const defaultProperties = {
      signed_up_at: new Date().toISOString(),
      user_role: user?.role || 'unknown',
      user_email: user?.email || 'unknown',
      user_name: user?.name || getUserName(),
      ...userProperties
    }

    posthog.identify(userId, defaultProperties)
    /* console.log('PostHog: User identified:', userId, defaultProperties) */
  }

  // User Authentication Events
  const trackUserSignup = (signupMethod: string = 'email_password', additionalProperties: Record<string, any> = {}) => {
    if (!posthog || !user) return

    const eventProperties = {
      signup_method: signupMethod,
      user_email: user.email,
      user_name: user.name || getUserName(),
      user_role: user.role || 'teacher',
      timestamp: new Date().toISOString(),
      ...additionalProperties
    }

    posthog.capture(ANALYTICS_EVENTS.USER_SIGNED_UP, eventProperties)
    
    // Immediately identify the user after signup
    identifyUser(user.id, {
      email: user.email,
      name: user.name,
      role: user.role,
      signup_method: signupMethod
    })
    
    /* console.log('PostHog: User signup tracked:', eventProperties) */
  }

  const trackUserLogin = (loginMethod: string = 'email_password', additionalProperties: Record<string, any> = {}) => {
    if (!posthog || !user) return

    const eventProperties = {
      login_method: loginMethod,
      user_email: user.email,
      user_name: user.name || getUserName(),
      user_role: user.role || 'teacher',
      timestamp: new Date().toISOString(),
      ...additionalProperties
    }

    posthog.capture(ANALYTICS_EVENTS.USER_LOGGED_IN, eventProperties)
    
    // Identify user on login
    identifyUser(user.id, {
      email: user.email,
      name: user.name,
      role: user.role,
      last_login_at: new Date().toISOString()
    })
    
    /* console.log('PostHog: User login tracked:', eventProperties) */
  }

  const trackUserLogout = (additionalProperties: Record<string, any> = {}) => {
    if (!posthog || !user) return

    const eventProperties = {
      user_email: user.email,
      user_name: user.name || getUserName(),
      user_role: user.role || 'teacher',
      timestamp: new Date().toISOString(),
      ...additionalProperties
    }

    posthog.capture(ANALYTICS_EVENTS.USER_LOGGED_OUT, eventProperties)
    /* console.log('PostHog: User logout tracked:', eventProperties) */
  }

  // Question Bank Analytics
  const trackQuestionCreated = (
    questionId: number | string,
    questionType: keyof typeof QUESTION_TYPES,
    difficulty: number,
    subject: string,
    additionalProperties: Record<string, any> = {}
  ) => {
    if (!posthog || !user) return

    const eventProperties = {
      question_id: questionId,
      question_type: QUESTION_TYPES[questionType],
      difficulty_level: difficulty,
      subject: subject,
      created_by: user.email,
      created_by_name: user.name || getUserName(),
      user_role: user.role || 'teacher',
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_path: window.location.pathname,
      ...additionalProperties
    }

    posthog.capture(ANALYTICS_EVENTS.QUESTION_CREATED, eventProperties)
    /* console.log('PostHog: Question created tracked:', eventProperties) */
  }

  const trackQuestionEdited = (
    questionId: number | string,
    questionType: keyof typeof QUESTION_TYPES,
    changes: Record<string, any>,
    additionalProperties: Record<string, any> = {}
  ) => {
    if (!posthog || !user) return

    const eventProperties = {
      question_id: questionId,
      question_type: QUESTION_TYPES[questionType],
      edited_by: user.email,
      edited_by_name: user.name || getUserName(),
      user_role: user.role || 'teacher',
      changes_made: changes,
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_path: window.location.pathname,
      ...additionalProperties
    }

    posthog.capture(ANALYTICS_EVENTS.QUESTION_EDITED, eventProperties)
    /* console.log('PostHog: Question edited tracked:', eventProperties) */
  }

  const trackQuestionStatusChange = (
    questionId: number | string,
    questionType: keyof typeof QUESTION_TYPES,
    newStatus: 'activated' | 'deactivated',
    additionalProperties: Record<string, any> = {}
  ) => {
    if (!posthog || !user) return

    const eventName = newStatus === 'activated' 
      ? ANALYTICS_EVENTS.QUESTION_ACTIVATED 
      : ANALYTICS_EVENTS.QUESTION_DEACTIVATED

    const eventProperties = {
      question_id: questionId,
      question_type: QUESTION_TYPES[questionType],
      status: newStatus,
      changed_by: user.email,
      changed_by_name: user.name || getUserName(),
      user_role: user.role || 'teacher',
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_path: window.location.pathname,
      ...additionalProperties
    }

    posthog.capture(eventName, eventProperties)
    /* console.log(`PostHog: Question ${newStatus} tracked:`, eventProperties) */
  }

  // Test Pack Analytics
  const trackTestPackCreated = (
    testPackId: number | string,
    testPackName: string,
    questionCount: number,
    additionalProperties: Record<string, any> = {}
  ) => {
    if (!posthog || !user) return

    const eventProperties = {
      test_pack_id: testPackId,
      test_pack_name: testPackName,
      question_count: questionCount,
      created_by: user.email,
      created_by_name: user.name || getUserName(),
      user_role: user.role || 'teacher',
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_path: window.location.pathname,
      ...additionalProperties
    }

    posthog.capture(ANALYTICS_EVENTS.TEST_PACK_CREATED, eventProperties)
    /* console.log('PostHog: Test pack created tracked:', eventProperties) */
  }

  const trackTestPackQuestionAdded = (
    testPackId: number | string,
    questionId: number | string,
    questionType: keyof typeof QUESTION_TYPES,
    additionalProperties: Record<string, any> = {}
  ) => {
    if (!posthog || !user) return

    const eventProperties = {
      test_pack_id: testPackId,
      question_id: questionId,
      question_type: QUESTION_TYPES[questionType],
      added_by: user.email,
      added_by_name: user.name || getUserName(),
      user_role: user.role || 'teacher',
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_path: window.location.pathname,
      ...additionalProperties
    }

    posthog.capture(ANALYTICS_EVENTS.TEST_PACK_QUESTION_ADDED, eventProperties)
    /* console.log('PostHog: Test pack question added tracked:', eventProperties) */
  }

  // Core Product Activity (for DAU/WAU/MAU)
  const trackCoreActivity = (
    activityType: string,
    activityDetails: Record<string, any> = {},
    additionalProperties: Record<string, any> = {}
  ) => {
    if (!posthog || !user) return

    const eventProperties = {
      activity_type: activityType,
      user_email: user.email,
      user_name: user.name || getUserName(),
      user_role: user.role || 'teacher',
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_path: window.location.pathname,
      ...activityDetails,
      ...additionalProperties
    }

    // Use a generic core activity event for DAU/WAU/MAU tracking
    posthog.capture('product_core_activity', eventProperties)
    /* console.log('PostHog: Core activity tracked:', eventProperties) */
  }

  // Session Duration Tracking (PostHog handles this automatically)
  const trackSessionStart = (sessionType: string = 'general') => {
    if (!posthog || !user) return

    const eventProperties = {
      session_type: sessionType,
      user_email: user.email,
      user_name: user.name || getUserName(),
      user_role: user.role || 'teacher',
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_path: window.location.pathname
    }

    posthog.capture('session_started', eventProperties)
    /* console.log('PostHog: Session started tracked:', eventProperties) */
  }

  // Error Tracking
  const trackError = (
    errorType: string,
    errorMessage: string,
    errorContext: Record<string, any> = {},
    additionalProperties: Record<string, any> = {}
  ) => {
    if (!posthog || !user) return

    const eventProperties = {
      error_type: errorType,
      error_message: errorMessage,
      error_context: errorContext,
      user_email: user.email,
      user_name: user.name || getUserName(),
      user_role: user.role || 'teacher',
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_path: window.location.pathname,
      ...additionalProperties
    }

    posthog.capture(ANALYTICS_EVENTS.ERROR_OCCURRED, eventProperties)
    /* console.log('PostHog: Error tracked:', eventProperties) */
  }

  // Page View Tracking
  const trackPageView = (
    pageName: string,
    pageCategory: string = 'general',
    additionalProperties: Record<string, any> = {}
  ) => {
    if (!posthog || !user) return

    const eventProperties = {
      page_name: pageName,
      page_category: pageCategory,
      user_email: user.email,
      user_name: user.name || getUserName(),
      user_role: user.role || 'teacher',
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_path: window.location.pathname,
      ...additionalProperties
    }

    posthog.capture(ANALYTICS_EVENTS.PAGE_VIEWED, eventProperties)
    /* console.log('PostHog: Page view tracked:', eventProperties) */
  }

  return {
    // PostHog instance
    posthog,
    
    // User identification
    identifyUser,
    
    // Authentication events
    trackUserSignup,
    trackUserLogin,
    trackUserLogout,
    
    // Question bank analytics
    trackQuestionCreated,
    trackQuestionEdited,
    trackQuestionStatusChange,
    
    // Test pack analytics
    trackTestPackCreated,
    trackTestPackQuestionAdded,
    
    // Core activity tracking
    trackCoreActivity,
    trackSessionStart,
    
    // Error and page tracking
    trackError,
    trackPageView,
    
    // Constants
    ANALYTICS_EVENTS,
    QUESTION_TYPES,
    DIFFICULTY_LEVELS,
    SUBJECTS
  }
}

// Utility function for tracking question creation with detailed properties
export const trackQuestionCreation = (
  analytics: ReturnType<typeof usePostHogAnalytics>,
  questionData: {
    questionId: number | string
    questionType: keyof typeof QUESTION_TYPES
    difficulty: number
    subject: string
    numOptions?: number
    hasPassage?: boolean
    passageId?: number
    testId?: number
    isTestPack?: boolean
  }
) => {
  const additionalProperties: Record<string, any> = {}
  
  if (questionData.numOptions !== undefined) {
    additionalProperties.num_options = questionData.numOptions
  }
  
  if (questionData.hasPassage !== undefined) {
    additionalProperties.has_passage = questionData.hasPassage
  }
  
  if (questionData.passageId !== undefined) {
    additionalProperties.passage_id = questionData.passageId
  }
  
  if (questionData.testId !== undefined) {
    additionalProperties.test_id = questionData.testId
  }
  
  if (questionData.isTestPack !== undefined) {
    additionalProperties.is_test_pack = questionData.isTestPack
  }

  analytics.trackQuestionCreated(
    questionData.questionId,
    questionData.questionType,
    questionData.difficulty,
    questionData.subject,
    additionalProperties
  )
}

// Utility function for tracking test pack creation with detailed properties
export const trackTestPackCreation = (
  analytics: ReturnType<typeof usePostHogAnalytics>,
  testPackData: {
    testPackId: number | string
    testPackName: string
    questionCount: number
    questionTypes: Record<string, number>
    difficulty: number
    subject: string
  }
) => {
  const additionalProperties = {
    question_types_distribution: testPackData.questionTypes,
    difficulty_level: testPackData.difficulty,
    subject: testPackData.subject
  }

  analytics.trackTestPackCreated(
    testPackData.testPackId,
    testPackData.testPackName,
    testPackData.questionCount,
    additionalProperties
  )
}

// Additional tracking functions for comprehensive analytics

// Track question status changes (activation/deactivation)
export const trackQuestionStatusChange = (
  analytics: ReturnType<typeof usePostHogAnalytics>,
  questionId: number | string,
  questionType: keyof typeof QUESTION_TYPES,
  newStatus: 'activated' | 'deactivated',
  additionalProperties: Record<string, any> = {}
) => {
  analytics.trackQuestionStatusChange(questionId, questionType, newStatus, additionalProperties)
}

// Track test pack question addition
export const trackTestPackQuestionAddition = (
  analytics: ReturnType<typeof usePostHogAnalytics>,
  testPackId: number | string,
  questionId: number | string,
  questionType: keyof typeof QUESTION_TYPES,
  additionalProperties: Record<string, any> = {}
) => {
  analytics.trackTestPackQuestionAdded(testPackId, questionId, questionType, additionalProperties)
}

// Track core product activities for DAU/WAU/MAU
export const trackCoreProductActivity = (
  analytics: ReturnType<typeof usePostHogAnalytics>,
  activityType: string,
  activityDetails: Record<string, any> = {},
  additionalProperties: Record<string, any> = {}
) => {
  analytics.trackCoreActivity(activityType, activityDetails, additionalProperties)
}