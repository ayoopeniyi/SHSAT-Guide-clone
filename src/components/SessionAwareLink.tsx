import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useSessionRecording } from '../lib/session-recording';

interface SessionAwareLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  children: React.ReactNode;
  preserveSession?: boolean;
}

export const SessionAwareLink: React.FC<SessionAwareLinkProps> = ({
  to,
  children,
  preserveSession = true,
  ...props
}) => {
  const { generateSessionUrl, getSessionId } = useSessionRecording();

  const sessionId = getSessionId();
  const finalUrl = preserveSession && sessionId ? generateSessionUrl(to, sessionId) : to;

  return (
    <Link to={finalUrl} {...props}>
      {children}
    </Link>
  );
};

// Component for external links with session tracking
interface SessionAwareExternalLinkProps {
  href: string;
  children: React.ReactNode;
  preserveSession?: boolean;
  target?: string;
  rel?: string;
  className?: string;
  onClick?: () => void;
}

export const SessionAwareExternalLink: React.FC<SessionAwareExternalLinkProps> = ({
  href,
  children,
  preserveSession = true,
  target = '_blank',
  rel = 'noopener noreferrer',
  className,
  onClick,
}) => {
  const { generateSessionUrl, getSessionId } = useSessionRecording();

  const sessionId = getSessionId();
  const finalUrl = preserveSession && sessionId ? generateSessionUrl(href, sessionId) : href;

  return (
    <a
      href={finalUrl}
      target={target}
      rel={rel}
      className={className}
      onClick={onClick}
    >
      {children}
    </a>
  );
};

// Hook for programmatic navigation with session tracking
export const useSessionAwareNavigation = () => {
  const { generateSessionUrl, getSessionId } = useSessionRecording();

  const navigateWithSession = (url: string, preserveSession = true) => {
    const sessionId = getSessionId();
    const finalUrl = preserveSession && sessionId ? generateSessionUrl(url, sessionId) : url;
    
    // Use window.location for external URLs or programmatic navigation
    if (url.startsWith('http') || url.startsWith('//')) {
      window.location.href = finalUrl;
    } else {
      // For internal routes, you might want to use React Router's navigate
      window.location.href = finalUrl;
    }
  };

  return { navigateWithSession };
}; 