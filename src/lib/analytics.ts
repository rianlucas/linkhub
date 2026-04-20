"use client";

import posthog from "posthog-js";

let initialized = false;

export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!key) return;

  const apiHost =
    process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";

  posthog.init(key, {
    api_host: apiHost,
    capture_pageview: false,
    persistence: "localStorage+cookie",
  });

  initialized = true;
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean | null | undefined>
) {
  if (!initialized) return;
  posthog.capture(eventName, properties);
}

export function getEmailDomain(email: string) {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  return at > 0 ? normalized.slice(at + 1) : "invalid";
}
