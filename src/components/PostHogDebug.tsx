import { usePostHog } from 'posthog-js/react'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'

export default function PostHogDebug() {
  const posthog = usePostHog()
  const [isLoaded, setIsLoaded] = useState(false)
  const [lastEvent, setLastEvent] = useState<string>('')

  useEffect(() => {
    // Check if PostHog is loaded
    if (posthog) {
      setIsLoaded(true)
      /* console.log('PostHog is loaded:', posthog) */
      
      // Test event
      posthog.capture('posthog_debug_loaded', {
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent
      })
    }
  }, [posthog])

  const testEvent = () => {
    if (posthog) {
      const eventName = 'test_button_click'
      posthog.capture(eventName, {
        button_name: 'debug_test_button',
        timestamp: new Date().toISOString(),
        page_url: window.location.href
      })
      setLastEvent(eventName)
      /* console.log('Event captured:', eventName) */
    }
  }

  const testIdentify = () => {
    if (posthog) {
      posthog.identify('test_user_123', {
        name: 'Test User',
        email: 'test@example.com',
        role: 'debug'
      })
      /* console.log('User identified') */
    }
  }

  const testPageView = () => {
    if (posthog) {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        $pathname: window.location.pathname
      })
      setLastEvent('$pageview')
      /* console.log('Page view captured') */
    }
  }

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">PostHog Debug Panel</h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="font-medium">PostHog Status:</span>
          <span className={`px-2 py-1 rounded text-sm ${isLoaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isLoaded ? 'Loaded' : 'Not Loaded'}
          </span>
        </div>

        {lastEvent && (
          <div className="text-sm text-gray-600">
            Last event: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{lastEvent}</span>
          </div>
        )}

        <div className="space-y-2">
          <Button onClick={testEvent} className="w-full">
            Test Event Capture
          </Button>
          
          <Button onClick={testIdentify} variant="outline" className="w-full">
            Test User Identify
          </Button>
          
          <Button onClick={testPageView} variant="secondary" className="w-full">
            Test Page View
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <p>Check the browser console for debug logs.</p>
          <p>Check your PostHog dashboard for events.</p>
        </div>
      </div>
    </div>
  )
}