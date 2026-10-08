// Single place for values that appear in legal pages, support copy, and
// native-app auth redirects. Change here, not in individual screens.

export const APP_NAME = "Thymos";

// Public production origin. The native iOS app can't use window.location
// (it's capacitor://localhost), so magic links must point here instead.
export const SITE_URL = "https://www.thymos.world";

// Where people reach a human. This mailbox has to exist and be monitored —
// App Review and anyone filing a report will use it.
export const SUPPORT_EMAIL = "support@thymos.world";

export const LEGAL_LAST_UPDATED = "8 October 2026";

// Minimum age to use the app.
export const MIN_AGE = 18;
