import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { PostHogProvider } from 'posthog-js/react'
import React from "react";
import { SESSION_RECORDING_CONFIG } from './lib/session-recording';

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>  
      <PostHogProvider apiKey="phc_jVneQF5UAoHufSYsgmjpt3K7yoKCVBIzwaGEGonYizw" options={{
        api_host: 'https://us.i.posthog.com',
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        disable_session_recording: !SESSION_RECORDING_CONFIG.enabled,
        enable_recording_console_log: SESSION_RECORDING_CONFIG.recordConsole,
        loaded: (posthog) => {
            /* console.log('✅ PostHog loaded successfully:', posthog) */
            // Test event
            posthog.capture('app_loaded', {
                timestamp: new Date().toISOString()
            })
        }
      }}>
        <App />
      </PostHogProvider>
    </React.StrictMode>
);
