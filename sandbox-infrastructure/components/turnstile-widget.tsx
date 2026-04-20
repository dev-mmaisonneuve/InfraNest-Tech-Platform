"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          size?: "normal" | "compact" | "flexible";
          theme?: "light" | "dark";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

type TurnstileWidgetProps = {
  onToken: (token: string) => void;
};

export function TurnstileWidget({ onToken }: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerId = useId().replace(/:/g, "");
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!siteKey) {
      return;
    }

    const resolvedSiteKey = siteKey;
    let mounted = true;

    function renderWidget() {
      if (!mounted || !window.turnstile || widgetId.current) {
        return;
      }

      const element = document.getElementById(containerId);
      if (!element) {
        return;
      }

      widgetId.current = window.turnstile.render(element, {
        sitekey: resolvedSiteKey,
        size: "flexible",
        theme: "dark",
        callback: (token) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(""),
        "error-callback": () => onTokenRef.current(""),
      });
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-turnstile="true"]');
    if (existingScript) {
      renderWidget();
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.turnstile = "true";
      script.onload = renderWidget;
      document.body.appendChild(script);
    }

    const interval = window.setInterval(renderWidget, 250);

    return () => {
      mounted = false;
      window.clearInterval(interval);
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
      }
    };
  }, [containerId, siteKey]);

  if (!siteKey) {
    return <p className="form-note">Turnstile is not configured locally. Forms will still work outside production for development.</p>;
  }

  return (
    <div className="field field-full">
      <label>Spam protection</label>
      <div id={containerId} className="turnstile-slot" />
    </div>
  );
}
