import React, { useState } from 'react';
import { useSessionRecording } from '../lib/session-recording';
import { SessionAwareLink, SessionAwareExternalLink, useSessionAwareNavigation } from './SessionAwareLink';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export const SessionRecordingDemo: React.FC = () => {
  const {
    getSessionId,
    getSessionReplayUrl,
    isSessionRecordingActive,
    enableSessionRecording,
    disableSessionRecording,
    trackSessionEvent,
  } = useSessionRecording();

  const { navigateWithSession } = useSessionAwareNavigation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [replayUrl, setReplayUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);

  // Update session info
  const updateSessionInfo = () => {
    const currentSessionId = getSessionId();
    const currentReplayUrl = getSessionReplayUrl();
    const currentIsActive = isSessionRecordingActive();

    setSessionId(currentSessionId);
    setReplayUrl(currentReplayUrl);
    setIsActive(currentIsActive);
  };

  // Test session events
  const testSessionEvent = (eventName: string) => {
    trackSessionEvent(eventName, {
      test_event: true,
      demo_component: 'SessionRecordingDemo',
      timestamp: new Date().toISOString(),
    });
    /* console.log(`🎯 Test event "${eventName}" tracked`); */
  };

  // Test navigation with session
  const testNavigation = () => {
    const testUrl = 'https://example.com/test-session';
    navigateWithSession(testUrl);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎥 Session Recording Demo
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Test and demonstrate session recording functionality with session ID tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Session ID</h3>
              <div className="p-3 bg-gray-100 rounded-md font-mono text-sm break-all">
                {sessionId || 'Loading...'}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Replay URL</h3>
              <div className="p-3 bg-gray-100 rounded-md font-mono text-sm break-all">
                {replayUrl ? (
                  <a
                    href={replayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Session Replay
                  </a>
                ) : (
                  'Not available'
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Controls */}
          <div className="space-y-4">
            <h3 className="font-semibold">Session Controls</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={updateSessionInfo} variant="outline">
                🔄 Refresh Session Info
              </Button>
              <Button
                onClick={enableSessionRecording}
                variant={isActive ? 'secondary' : 'default'}
                disabled={isActive}
              >
                ▶️ Start Recording
              </Button>
              <Button
                onClick={disableSessionRecording}
                variant="destructive"
                disabled={!isActive}
              >
                ⏹️ Stop Recording
              </Button>
            </div>
          </div>

          <Separator />

          {/* Test Events */}
          <div className="space-y-4">
            <h3 className="font-semibold">Test Events</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => testSessionEvent('demo_button_click')}
                variant="outline"
                size="sm"
              >
                Test Button Click
              </Button>
              <Button
                onClick={() => testSessionEvent('demo_form_submit')}
                variant="outline"
                size="sm"
              >
                Test Form Submit
              </Button>
              <Button
                onClick={() => testSessionEvent('demo_page_view')}
                variant="outline"
                size="sm"
              >
                Test Page View
              </Button>
              <Button
                onClick={() => testSessionEvent('demo_error')}
                variant="outline"
                size="sm"
              >
                Test Error Event
              </Button>
            </div>
          </div>

          <Separator />

          {/* Navigation Examples */}
          <div className="space-y-4">
            <h3 className="font-semibold">Session-Aware Navigation</h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <SessionAwareLink to="/test-pack" className="inline-block">
                  <Button variant="outline" size="sm">
                    🔗 Internal Link (with session)
                  </Button>
                </SessionAwareLink>
                <SessionAwareExternalLink href="https://example.com">
                  <Button variant="outline" size="sm">
                    🌐 External Link (with session)
                  </Button>
                </SessionAwareExternalLink>
                <Button onClick={testNavigation} variant="outline" size="sm">
                  🚀 Programmatic Navigation
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Cross-Domain Example */}
          <div className="space-y-4">
            <h3 className="font-semibold">Cross-Domain Session Example</h3>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                To test cross-domain session tracking:
              </p>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Click any session-aware link above</li>
                <li>The session ID will be appended to the URL</li>
                <li>On the new domain, the session will be bootstrapped</li>
                <li>Check the browser console for session recording logs</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📋 How to Use Session Recording</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Automatic Session Tracking</h4>
            <p className="text-sm text-gray-600">
              Session recording starts automatically when the app loads. The SessionRecordingProvider
              handles initialization and tracks session lifecycle events.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">2. Cross-Domain Session Continuity</h4>
            <p className="text-sm text-gray-600">
              Use SessionAwareLink or SessionAwareExternalLink components to automatically
              append session IDs to URLs for seamless cross-domain tracking.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">3. Manual Session Management</h4>
            <p className="text-sm text-gray-600">
              Use the useSessionRecording hook to manually control session recording,
              track custom events, and manage session state.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">4. Privacy Controls</h4>
            <p className="text-sm text-gray-600">
              Configure privacy settings in SESSION_RECORDING_CONFIG to control what
              gets recorded (text, inputs, images, etc.).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 