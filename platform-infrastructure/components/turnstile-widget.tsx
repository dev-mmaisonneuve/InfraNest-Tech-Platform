"use client";

import { useEffect, useId, useImperativeHandle, useRef, type Ref } from "react";

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

export type TurnstileHandle = {
  /** Discards the consumed token and asks Turnstile for a fresh one. */
  reset: () => void;
};

type TurnstileWidgetProps = {
  onToken: (token: string) => void;
  ref?: Ref<TurnstileHandle>;
};

export function TurnstileWidget({ onToken, ref }: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerId = useId().replace(/:/g, "");
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (!widgetId.current || !window.turnstile) {
        return;
      }
      // Turnstile tokens are single-use, so a consumed one must be cleared
      // locally and re-issued before the form can be submitted again.
      window.turnstile.reset(widgetId.current);
      onTokenRef.current("");
    },
  }), []);

  useEffect(() => {
    if (!siteKey) {
      return;
    }

    const resolvedSiteKey = siteKey;
    let mounted = true;
    let pollId: number | undefined;

    function stopPolling() {
      if (pollId !== undefined) {
        window.clearInterval(pollId);
        pollId = undefined;
      }
    }

    function renderWidget() {
      if (!mounted) {
        return;
      }

      // Already rendered — this covers the case where the first render happened
      // before the interval was assigned, so polling still needs stopping.
      if (widgetId.current) {
        stopPolling();
        return;
      }

      if (!window.turnstile) {
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

      stopPolling();
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

    pollId = window.setInterval(renderWidget, 250);

    return () => {
      mounted = false;
      stopPolling();
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
      }
    };
  }, [containerId, siteKey]);

  if (!siteKey) {
    // Render nothing rather than developer-facing text. This branch is reached
    // whenever the public site key is absent — including a misconfigured
    // production deploy — and the missing configuration is already reported by
    // reportRuntimeConfig() and the server-side check in lib/turnstile.ts.
    return null;
  }

  return (
    <div className="field field-full" role="group" aria-labelledby={`${containerId}-label`}>
      <label id={`${containerId}-label`}>Spam protection</label>
      <div id={containerId} className="turnstile-slot" />
    </div>
  );
}
