import { useFeatureFlagEnabled, useFeatureFlagVariantKey, useFeatureFlagPayload } from 'posthog-js/react'
import { useNewFeature } from '../hooks/useFeatureFlags'

const FeatureFlagTestPage = () => {
  // Test multiple feature flags
  const { isEnabled: isNewFeatureEnabled, payload: newFeaturePayload } = useNewFeature()
  
  // Example of a multivariate flag
  const variantKey = useFeatureFlagVariantKey('welcome_message_variant')
  const variantPayload = useFeatureFlagPayload('welcome_message_variant')
  
  // Example of a remote config flag
  const isConfigEnabled = useFeatureFlagEnabled('app_config')
  const configPayload = useFeatureFlagPayload('app_config')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🚀 PostHog Feature Flag Testing
          </h1>
          
          <div className="space-y-8">
            {/* Boolean Feature Flag Test */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Boolean Feature Flag: "new_feature_enabled"
              </h2>
              
              {isNewFeatureEnabled ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-green-600 text-lg mr-2">✅</span>
                    <h3 className="text-green-800 font-medium">New Feature is ENABLED!</h3>
                  </div>
                  <p className="text-green-700">
                    This content only shows when the feature flag is enabled.
                  </p>
                  {newFeaturePayload && (
                    <div className="mt-3 bg-green-100 rounded p-3">
                      <p className="text-green-800 text-sm font-medium mb-1">Payload:</p>
                      <pre className="text-green-700 text-xs overflow-auto">
                        {JSON.stringify(newFeaturePayload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-gray-600 text-lg mr-2">⏸️</span>
                    <h3 className="text-gray-800 font-medium">New Feature is DISABLED</h3>
                  </div>
                  <p className="text-gray-700">
                    This is the default content when the feature flag is disabled.
                  </p>
                </div>
              )}
            </div>

            {/* Multivariate Feature Flag Test */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Multivariate Feature Flag: "welcome_message_variant"
              </h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-blue-600 text-lg mr-2">🎯</span>
                  <h3 className="text-blue-800 font-medium">Current Variant: {variantKey || 'none'}</h3>
                </div>
                
                <div className="space-y-2">
                  {variantKey === 'variant-a' && (
                    <p className="text-blue-700">Welcome to the Alpha version!</p>
                  )}
                  {variantKey === 'variant-b' && (
                    <p className="text-blue-700">Welcome to the Beta version!</p>
                  )}
                  {variantKey === 'control' && (
                    <p className="text-blue-700">Welcome to the Control version!</p>
                  )}
                  {!variantKey && (
                    <p className="text-blue-700">No variant assigned (flag might be disabled)</p>
                  )}
                </div>
                
                {variantPayload && (
                  <div className="mt-3 bg-blue-100 rounded p-3">
                    <p className="text-blue-800 text-sm font-medium mb-1">Variant Payload:</p>
                    <pre className="text-blue-700 text-xs overflow-auto">
                      {JSON.stringify(variantPayload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Remote Config Feature Flag Test */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Remote Config Flag: "app_config"
              </h2>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-purple-600 text-lg mr-2">⚙️</span>
                  <h3 className="text-purple-800 font-medium">App Configuration</h3>
                </div>
                
                {isConfigEnabled && configPayload ? (
                  <div>
                    <p className="text-purple-700 mb-3">
                      Remote configuration is enabled and loaded.
                    </p>
                    <div className="bg-purple-100 rounded p-3">
                      <p className="text-purple-800 text-sm font-medium mb-1">Config Payload:</p>
                      <pre className="text-purple-700 text-xs overflow-auto">
                        {JSON.stringify(configPayload, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <p className="text-purple-700">
                    Remote configuration is disabled or not available.
                  </p>
                )}
              </div>
            </div>

            {/* Testing Instructions */}
            <div className="border rounded-lg p-6 bg-yellow-50">
              <h2 className="text-xl font-semibold mb-4 text-yellow-800">
                🧪 How to Test Feature Flags
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-yellow-800 mb-2">Method 1: PostHog Dashboard</h3>
                  <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                    <li>Go to your PostHog dashboard</li>
                    <li>Navigate to Feature Flags</li>
                    <li>Create or find the flags: "new_feature_enabled", "welcome_message_variant", "app_config"</li>
                    <li>Toggle them on/off or change variants</li>
                    <li>Refresh this page to see changes</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-medium text-yellow-800 mb-2">Method 2: PostHog Toolbar</h3>
                  <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                    <li>Enable PostHog toolbar in your project settings</li>
                    <li>Click the PostHog icon in your browser</li>
                    <li>Go to Feature Flags section</li>
                    <li>Toggle flags instantly without refreshing</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-medium text-yellow-800 mb-2">Method 3: Code Override</h3>
                  <p className="text-sm text-yellow-700 mb-2">
                    Add this to your browser console for instant testing:
                  </p>
                  <pre className="text-xs bg-yellow-100 p-2 rounded overflow-auto">
{`posthog.featureFlags.overrideFeatureFlags({
  flags: {
    'new_feature_enabled': true,
    'welcome_message_variant': 'variant-a',
    'app_config': true
  }
})`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Debug Information */}
            <div className="border rounded-lg p-6 bg-gray-50">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                🔍 Debug Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Flag Status:</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>new_feature_enabled: {isNewFeatureEnabled ? '✅ Enabled' : '❌ Disabled'}</li>
                    <li>welcome_message_variant: {variantKey || '❌ No variant'}</li>
                    <li>app_config: {isConfigEnabled ? '✅ Enabled' : '❌ Disabled'}</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">System Info:</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>Current Time: {new Date().toLocaleString()}</li>
                    <li>User Agent: {navigator.userAgent.substring(0, 50)}...</li>
                    <li>Page URL: {window.location.href}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeatureFlagTestPage