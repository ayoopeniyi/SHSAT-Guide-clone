import React from 'react';
import { usePostHog } from 'posthog-js/react';
import { useAuthStore } from '../stores/authStore';

// Session recording configuration
export const SESSION_RECORDING_CONFIG = {
  // Enable session recording by default
  enabled: true,
  
  // Privacy settings
  maskAllTexts: false,
  maskAllInputs: false,
  maskAllImages: false,
  
  // Recording settings
  recordCanvas: true,
  recordConsole: true,
  recordNetwork: false, // Disable for privacy
  
  // Session persistence
  persistSessionAcrossDomains: true,
  sessionTimeoutMinutes: 30,
};

// Session recording utilities
export const useSessionRecording = () => {
  const posthog = usePostHog();
  const user = useAuthStore((state) => state.user);

  // Get current session ID
  const getSessionId = (): string | null => {
    try {
      return posthog.get_session_id();
    } catch (error) {
      console.warn('Failed to get session ID:', error);
      return null;
    }
  };

  // Get session replay URL
  const getSessionReplayUrl = (): string | null => {
    try {
      return posthog.get_session_replay_url();
    } catch (error) {
      console.warn('Failed to get session replay URL:', error);
      return null;
    }
  };

  // Start session recording
  const startSessionRecording = (options?: {
    sessionId?: string;
    userId?: string;
    metadata?: Record<string, any>;
  }) => {
    try {
      const sessionId = options?.sessionId || getSessionId();
      
      if (sessionId) {
        // PostHog automatically starts session recording when enabled
        // We just need to track the event
        /* console.log('✅ Session recording started:', { sessionId, userId: user?.id }); */
        
        // Track session recording start
        posthog.capture('session_recording_started', {
          session_id: sessionId,
          user_id: user?.id,
          user_email: user?.email,
          user_role: user?.role,
          page_url: window.location.href,
          timestamp: new Date().toISOString(),
          ...options?.metadata,
        });
      }
    } catch (error) {
      console.error('Failed to start session recording:', error);
    }
  };

  // Stop session recording
  const stopSessionRecording = () => {
    try {
      const sessionId = getSessionId();
      
      posthog.stopSessionRecording();
      
      /* console.log('⏹️ Session recording stopped:', { sessionId }); */
      
      // Track session recording stop
      posthog.capture('session_recording_stopped', {
        session_id: sessionId,
        user_id: user?.id,
        user_email: user?.email,
        user_role: user?.role,
        page_url: window.location.href,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to stop session recording:', error);
    }
  };

  // Check if session recording is active
  const isSessionRecordingActive = (): boolean => {
    try {
      return posthog.sessionRecordingStarted();
    } catch (error) {
      console.warn('Failed to check session recording status:', error);
      return false;
    }
  };

  // Bootstrap session recording with existing session ID
  const bootstrapSessionRecording = (sessionId: string, options?: {
    userId?: string;
    metadata?: Record<string, any>;
  }) => {
    try {
      // PostHog automatically handles session recording when enabled
      // We just need to track the bootstrap event
      /* console.log('🔄 Session recording bootstrapped:', { sessionId, userId: user?.id }); */
      
      // Track session recording bootstrap
      posthog.capture('session_recording_bootstrapped', {
        session_id: sessionId,
        user_id: user?.id,
        user_email: user?.email,
        user_role: user?.role,
        page_url: window.location.href,
        timestamp: new Date().toISOString(),
        bootstrapped: true,
        ...options?.metadata,
      });
    } catch (error) {
      console.error('Failed to bootstrap session recording:', error);
    }
  };

  // Generate session URL with session ID for cross-domain tracking
  const generateSessionUrl = (targetUrl: string, sessionId?: string): string => {
    const currentSessionId = sessionId || getSessionId();
    
    if (!currentSessionId) {
      console.warn('No session ID available for URL generation');
      return targetUrl;
    }
    
    const url = new URL(targetUrl);
    url.searchParams.set('session_id', currentSessionId);
    
    return url.toString();
  };

  // Extract session ID from URL parameters
  const extractSessionIdFromUrl = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('session_id');
  };

  // Initialize session recording based on URL parameters or start new session
  const initializeSessionRecording = () => {
    const urlSessionId = extractSessionIdFromUrl();
    
    if (urlSessionId) {
      // Bootstrap existing session
      bootstrapSessionRecording(urlSessionId);
    } else {
      // Start new session recording
      startSessionRecording();
    }
  };

  // Track session events with rich context
  const trackSessionEvent = (
    eventName: string,
    properties: Record<string, any> = {}
  ) => {
    const sessionId = getSessionId();
    
    posthog.capture(eventName, {
      session_id: sessionId,
      user_id: user?.id,
      user_email: user?.email,
      user_role: user?.role,
      page_url: window.location.href,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  };

  // Session recording controls
  const enableSessionRecording = () => {
    try {
      posthog.startSessionRecording();
      /* console.log('✅ Session recording enabled'); */
      trackSessionEvent('session_recording_enabled');
    } catch (error) {
      console.error('Failed to enable session recording:', error);
    }
  };

  const disableSessionRecording = () => {
    try {
      posthog.stopSessionRecording();
      /* console.log('❌ Session recording disabled'); */
      trackSessionEvent('session_recording_disabled');
    } catch (error) {
      console.error('Failed to disable session recording:', error);
    }
  };

  return {
    // Session ID utilities
    getSessionId,
    getSessionReplayUrl,
    
    // Session recording controls
    startSessionRecording,
    stopSessionRecording,
    enableSessionRecording,
    disableSessionRecording,
    isSessionRecordingActive,
    
    // Cross-domain session utilities
    bootstrapSessionRecording,
    generateSessionUrl,
    extractSessionIdFromUrl,
    initializeSessionRecording,
    
    // Event tracking
    trackSessionEvent,
  };
};

// Hook for automatic session recording initialization
export const useAutoSessionRecording = () => {
  const { initializeSessionRecording, isSessionRecordingActive } = useSessionRecording();

  React.useEffect(() => {
    // Initialize session recording on component mount
    if (SESSION_RECORDING_CONFIG.enabled) {
      initializeSessionRecording();
    }
  }, []);

  return {
    isActive: isSessionRecordingActive(),
  };
};

// Utility for creating session-aware navigation links
export const createSessionAwareLink = (
  baseUrl: string,
  sessionId?: string
): string => {
  const { generateSessionUrl } = useSessionRecording();
  return generateSessionUrl(baseUrl, sessionId);
};

// Utility for handling session recording in different environments
export const getSessionRecordingConfig = (environment: 'development' | 'production' | 'test') => {
  const baseConfig = {
    ...SESSION_RECORDING_CONFIG,
    debug: environment === 'development',
  };

  switch (environment) {
    case 'development':
      return {
        ...baseConfig,
        recordConsole: true,
        debug: true,
      };
    case 'production':
      return {
        ...baseConfig,
        recordConsole: false,
        debug: false,
      };
    case 'test':
      return {
        ...baseConfig,
        enabled: false,
        debug: false,
      };
    default:
      return baseConfig;
  }
}; 