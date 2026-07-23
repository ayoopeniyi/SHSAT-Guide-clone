import React from 'react';
import { usePostHog } from 'posthog-js/react';
import { useAuthStore } from '../stores/authStore';
import { Button, ButtonProps } from './ui/button';

interface TrackedButtonProps extends ButtonProps {
  trackingName: string;
  trackingContext?: Record<string, any>;
  children: React.ReactNode;
}

export const TrackedButton: React.FC<TrackedButtonProps> = ({
  trackingName,
  trackingContext = {},
  children,
  onClick,
  ...buttonProps
}) => {
  const posthog = usePostHog();
  const getUserName = useAuthStore((state) => state.getUserName);
  const user = useAuthStore((state) => state.user);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // PostHog tracking with proper user details - using exact same pattern as RC card
    const userName = getUserName();
    
    /* console.log(`PostHog tracking - ${trackingName}:`, {
      userName,
      user,
      userEmail: user?.email,
      userNameFromUser: user?.name,
      ...trackingContext
    }); */
    
    posthog.capture('button_clicked', {
      button_name: trackingName,
      user_name: userName,
      user_email: user?.email || 'unknown',
      user_id: user?.id || 'unknown',
      user_role: user?.role || 'unknown',
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_path: window.location.pathname,
      ...trackingContext
    });

    // Call the original onClick if provided
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Button onClick={handleClick} {...buttonProps}>
      {children}
    </Button>
  );
};

// Hook for tracking any clickable element
export const useTrackedClick = () => {
  const posthog = usePostHog();
  const getUserName = useAuthStore((state) => state.getUserName);
  const user = useAuthStore((state) => state.user);

  const trackClick = (
    elementName: string,
    trackingContext: Record<string, any> = {}
  ) => {
    const userName = getUserName();
    
    /* console.log(`PostHog tracking - ${elementName}:`, {
      userName,
      user,
      userEmail: user?.email,
      userNameFromUser: user?.name,
      ...trackingContext
    }); */
    
    posthog.capture('element_clicked', {
      element_name: elementName,
      user_name: userName,
      user_email: user?.email || 'unknown',
      user_id: user?.id || 'unknown',
      user_role: user?.role || 'unknown',
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_path: window.location.pathname,
      ...trackingContext
    });
  };

  return trackClick;
};

// Higher-order component for tracking any component
export const withTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  trackingName: string
) => {
  return (props: P) => {
    const posthog = usePostHog();
    const getUserName = useAuthStore((state) => state.getUserName);
    const user = useAuthStore((state) => state.user);

    const handleClick = (event: any) => {
      const userName = getUserName();
      
      /* console.log(`PostHog tracking - ${trackingName}:`, {
        userName,
        user,
        userEmail: user?.email,
        userNameFromUser: user?.name
      }); */
      
      posthog.capture('component_clicked', {
        component_name: trackingName,
        user_name: userName,
        user_email: user?.email || 'unknown',
        user_id: user?.id || 'unknown',
        user_role: user?.role || 'unknown',
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        page_path: window.location.pathname
      });
    };

    return <WrappedComponent {...props} onClick={handleClick} />;
  };
}; 