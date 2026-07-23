import React, { useEffect } from 'react';
import { useSessionRecording } from '../lib/session-recording';
import { useAuthStore } from '../stores/authStore';

interface SessionRecordingProviderProps {
  children: React.ReactNode;
}

export const SessionRecordingProvider: React.FC<SessionRecordingProviderProps> = ({ children }) => {
  const { initializeSessionRecording, isSessionRecordingActive, trackSessionEvent } = useSessionRecording();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Initialize session recording when component mounts
    initializeSessionRecording();

    // Track session start
    trackSessionEvent('session_started', {
      user_authenticated: !!user,
      user_role: user?.role || 'anonymous',
    });

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackSessionEvent('session_paused', {
          reason: 'page_hidden',
        });
      } else {
        trackSessionEvent('session_resumed', {
          reason: 'page_visible',
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Track before unload
    const handleBeforeUnload = () => {
      trackSessionEvent('session_ended', {
        reason: 'page_unload',
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  // Log session recording status
  useEffect(() => {
    const isActive = isSessionRecordingActive();
    /* console.log(`🎥 Session recording is ${isActive ? 'active' : 'inactive'}`); */
  }, [isSessionRecordingActive]);

  return <>{children}</>;
};

// Hook for components that need session recording functionality
export const useSessionRecordingProvider = () => {
  const sessionRecording = useSessionRecording();
  const user = useAuthStore((state) => state.user);

  return {
    ...sessionRecording,
    user,
    isAuthenticated: !!user,
  };
}; 