import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePostHogAnalytics } from '../lib/posthog-analytics';

interface PageAnalyticsProps {
  pageName: string;
  pageCategory?: string;
  trackCoreActivity?: boolean;
  additionalProperties?: Record<string, any>;
}

export const PageAnalytics: React.FC<PageAnalyticsProps> = ({
  pageName,
  pageCategory = 'general',
  trackCoreActivity = true,
  additionalProperties = {}
}) => {
  const analytics = usePostHogAnalytics();
  const location = useLocation();

  useEffect(() => {
    // Track page view
    analytics.trackPageView(pageName, pageCategory, {
      ...additionalProperties,
      full_path: location.pathname,
      search_params: location.search
    });

    // Track core activity for DAU/WAU/MAU
    if (trackCoreActivity) {
      analytics.trackCoreActivity('page_view', {
        page_name: pageName,
        page_category: pageCategory,
        full_path: location.pathname
      }, additionalProperties);
    }
  }, [location.pathname, pageName, pageCategory, trackCoreActivity, analytics, additionalProperties]);

  return null; // This component doesn't render anything
};

// Hook for tracking page views
export const usePageAnalytics = (
  pageName: string,
  pageCategory?: string,
  trackCoreActivity?: boolean,
  additionalProperties?: Record<string, any>
) => {
  const analytics = usePostHogAnalytics();
  const location = useLocation();

  useEffect(() => {
    analytics.trackPageView(pageName, pageCategory || 'general', {
      ...additionalProperties,
      full_path: location.pathname,
      search_params: location.search
    });

    if (trackCoreActivity !== false) {
      analytics.trackCoreActivity('page_view', {
        page_name: pageName,
        page_category: pageCategory || 'general',
        full_path: location.pathname
      }, additionalProperties);
    }
  }, [location.pathname, pageName, pageCategory, trackCoreActivity, analytics, additionalProperties]);
}; 