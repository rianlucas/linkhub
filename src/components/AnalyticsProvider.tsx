"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initAnalytics, trackEvent } from "@/lib/analytics";

export default function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    const query =
      typeof window === "undefined"
        ? ""
        : window.location.search.replace(/^\?/, "");

    trackEvent("page_view", {
      path: pathname,
      query: query || null,
      full_path: query ? `${pathname}?${query}` : pathname,
    });
  }, [pathname]);

  return null;
}
