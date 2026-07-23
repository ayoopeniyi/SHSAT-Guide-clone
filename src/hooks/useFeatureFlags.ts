import { useFeatureFlagEnabled, useFeatureFlagPayload, useFeatureFlagVariantKey } from 'posthog-js/react'

// Type for feature flag payload
type FeatureFlagPayload = Record<string, any> | null

// Custom hook for the new feature flag
export const useNewFeature = () => {
  const isEnabled = useFeatureFlagEnabled('new_feature_enabled')
  const payload = useFeatureFlagPayload('new_feature_enabled') as FeatureFlagPayload
  
  return {
    isEnabled,
    payload,
    // Helper method to get specific payload values
    getPayloadValue: (key: string) => payload?.[key],
  }
}

// Generic hook for any boolean feature flag
export const useBooleanFeatureFlag = (flagKey: string) => {
  const isEnabled = useFeatureFlagEnabled(flagKey)
  const payload = useFeatureFlagPayload(flagKey) as FeatureFlagPayload
  
  return {
    isEnabled,
    payload,
    getPayloadValue: (key: string) => payload?.[key],
  }
}

// Generic hook for multivariate feature flags
export const useMultivariateFeatureFlag = (flagKey: string) => {
  const variantKey = useFeatureFlagVariantKey(flagKey)
  const payload = useFeatureFlagPayload(flagKey) as FeatureFlagPayload
  
  return {
    variantKey,
    payload,
    getPayloadValue: (key: string) => payload?.[key],
    // Helper to check if it's a specific variant
    isVariant: (variant: string) => variantKey === variant,
  }
}

// Error handling wrapper for feature flags
export const useFeatureFlagWithErrorHandling = (flagKey: string) => {
  try {
    const isEnabled = useFeatureFlagEnabled(flagKey)
    const payload = useFeatureFlagPayload(flagKey) as FeatureFlagPayload
    
    return {
      isEnabled,
      payload,
      error: null,
      getPayloadValue: (key: string) => payload?.[key],
    }
  } catch (error) {
    console.error(`Error fetching feature flag '${flagKey}':`, error)
    return {
      isEnabled: false, // Default to disabled on error
      payload: null,
      error: error as Error,
      getPayloadValue: () => null,
    }
  }
}

// Navigation feature flag hooks
export const useNavigationFlags = () => {
  const questionsEnabled = useFeatureFlagEnabled('nav_questions_enabled')
  const howItWorksEnabled = useFeatureFlagEnabled('nav_how_it_works_enabled')
  const whyBellCurvesEnabled = useFeatureFlagEnabled('nav_why_bell_curves_enabled')
  const faqEnabled = useFeatureFlagEnabled('nav_faq_enabled')
  const takeQuizEnabled = useFeatureFlagEnabled('nav_take_quiz_enabled')
  const teacherPortalEnabled = useFeatureFlagEnabled('nav_teacher_portal_enabled')
  const buyWorkbookEnabled = useFeatureFlagEnabled('nav_buy_workbook_enabled')

  return {
    // Return true by default if flag is undefined/null (flag doesn't exist)
    questionsEnabled: questionsEnabled ?? true,
    howItWorksEnabled: howItWorksEnabled ?? true,
    whyBellCurvesEnabled: whyBellCurvesEnabled ?? true,
    faqEnabled: faqEnabled ?? true,
    takeQuizEnabled: takeQuizEnabled ?? true,
    teacherPortalEnabled: teacherPortalEnabled ?? true,
    buyWorkbookEnabled: buyWorkbookEnabled ?? true,
  }
}