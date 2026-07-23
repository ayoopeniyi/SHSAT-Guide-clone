// PostHog configuration with anti-blocking measures
export const POSTHOG_CONFIG = {
  // Basic config
  api_host: 'https://us.i.posthog.com',
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: true,
  
  // Anti-blocking measures
  disable_session_recording: false,
  enable_recording_console_log: true,
  
  // Custom endpoint to avoid ad blockers
  // You can change this to a custom domain
  // api_host: 'https://your-custom-domain.com',
  
  // Alternative: Use a proxy endpoint
  // api_host: '/api/posthog', // This would require backend proxy
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Load callback
  loaded: (posthog: any) => {
    /* console.log('✅ PostHog loaded successfully:', posthog) */
    
    // Test event to verify it's working
    posthog.capture('posthog_loaded', {
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      url: window.location.href
    })
  }
}

// Alternative configuration for self-hosted PostHog
export const POSTHOG_SELF_HOSTED_CONFIG = {
  api_host: 'https://your-posthog-instance.com', // Replace with your self-hosted URL
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: true,
  disable_session_recording: false,
  enable_recording_console_log: true,
  debug: process.env.NODE_ENV === 'development'
} 