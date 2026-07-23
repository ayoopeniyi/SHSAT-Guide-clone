import { useEffect } from 'react'
import posthog from 'posthog-js'

export default function PostHogTest() {
  useEffect(() => {
    // Test if PostHog is available
    /* console.log('PostHog object:', posthog) */
    /* console.log('PostHog config:', posthog.config) */
    
    // Test a simple event
    try {
      posthog.capture('test_event', {
        test: true,
        timestamp: Date.now()
      })
      /* console.log('✅ PostHog event captured successfully') */
    } catch (error) {
      console.error('❌ PostHog event capture failed:', error)
    }
  }, [])

  return (
    <div className="p-4">
      <h2>PostHog Test</h2>
      <p>Check the browser console for PostHog status.</p>
    </div>
  )
}