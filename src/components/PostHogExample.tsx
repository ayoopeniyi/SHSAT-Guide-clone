import { usePostHog } from 'posthog-js/react'
import { Button } from './ui/button'
import { captureEvent, EVENTS } from '../lib/posthog'

export default function PostHogExample() {
  const posthog = usePostHog()

  const handleButtonClick = () => {
    // Method 1: Using the utility function
    captureEvent(EVENTS.BUTTON_CLICK, {
      button_name: 'example_button',
      page: 'home'
    })

    // Method 2: Using PostHog directly
    posthog.capture('custom_event', {
      event_type: 'user_interaction',
      timestamp: new Date().toISOString()
    })
  }

  const handleUserIdentify = () => {
    // Identify a user (replace with actual user data)
    posthog.identify('user_123', {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student'
    })
  }

  const handlePageView = () => {
    // Track a page view
    posthog.capture(EVENTS.PAGE_VIEW, {
      page_name: 'example_page',
      page_url: window.location.href
    })
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">PostHog Integration Example</h2>
      <p className="text-gray-600">
        This component demonstrates how to use PostHog for event tracking in your application.
      </p>
      
      <div className="space-y-2">
        <Button onClick={handleButtonClick}>
          Track Button Click
        </Button>
        
        <Button onClick={handleUserIdentify} variant="outline">
          Identify User
        </Button>
        
        <Button onClick={handlePageView} variant="secondary">
          Track Page View
        </Button>
      </div>
      
      <div className="text-sm text-gray-500">
        <p>Check your PostHog dashboard to see these events being tracked.</p>
      </div>
    </div>
  )
}