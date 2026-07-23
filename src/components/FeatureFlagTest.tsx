import { useNewFeature } from '../hooks/useFeatureFlags'

const FeatureFlagTest = () => {
  // Use our custom hook for the new feature flag
  const { isEnabled: isNewFeatureEnabled, payload, getPayloadValue } = useNewFeature()

  // If the flag is disabled, render nothing (hide the component)
  if (!isNewFeatureEnabled) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-dashed border-blue-300">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        🚀 Feature Flag Test Component
      </h3>
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <span className="text-green-600 text-lg mr-2">✅</span>
            <h4 className="text-green-800 font-medium">New Feature is ENABLED!</h4>
          </div>
          <p className="text-green-700 mb-3">
            This is the new feature content that only shows when the flag is enabled.
          </p>
          {payload && (
            <div className="bg-green-100 rounded p-3">
              <p className="text-green-800 text-sm font-medium mb-1">Flag Payload:</p>
              <pre className="text-green-700 text-xs overflow-auto">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </div>
          )}
          <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-blue-800 text-sm">
              <strong>Testing Instructions:</strong> Go to PostHog dashboard → Feature Flags → 
              Toggle "new_feature_enabled" to see this content change!
            </p>
          </div>
        </div>
        {/* Debug information */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h5 className="font-medium text-gray-700 mb-2">Debug Info:</h5>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Flag Key:</strong> new_feature_enabled</p>
            <p><strong>Flag Enabled:</strong> {isNewFeatureEnabled ? 'true' : 'false'}</p>
            <p><strong>Has Payload:</strong> {payload ? 'Yes' : 'No'}</p>
            <p><strong>Current Time:</strong> {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h5 className="font-medium text-blue-800 mb-2">How to Test:</h5>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Go to your PostHog dashboard</li>
            <li>Navigate to Feature Flags</li>
            <li>Find "new_feature_enabled" flag</li>
            <li>Toggle it on/off</li>
            <li>Refresh this page to see the change</li>
            <li>Or use PostHog toolbar for instant testing</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default FeatureFlagTest