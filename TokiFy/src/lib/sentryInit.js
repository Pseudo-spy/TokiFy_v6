import * as Sentry from "@sentry/react";

// Replace SENTRY_DSN with your actual DSN after deploying
// https://docs.sentry.io/platforms/javascript/guides/react/
const SENTRY_DSN = "YOUR_SENTRY_DSN_HERE";

export function initSentry() {
  if (!SENTRY_DSN || SENTRY_DSN === "YOUR_SENTRY_DSN_HERE") {
    console.info("[Sentry] DSN not configured — error monitoring disabled.");
    return;
  }
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({ maskAllText: false, blockAllMedia: false }),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
  });
}
