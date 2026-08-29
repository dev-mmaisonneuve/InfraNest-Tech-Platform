"use client";

import { useSyncExternalStore } from "react";

/** The year never changes while a tab is open, so the store never notifies. */
const subscribe = () => () => {};
const getCurrentYear = () => new Date().getFullYear();

/**
 * Renders the current calendar year in the footer.
 *
 * Every page is statically prerendered, so a plain `new Date()` freezes at build
 * time and a deployment that spans New Year would show a stale copyright date.
 *
 * `useSyncExternalStore` is the primitive for a value that legitimately differs
 * between server and client: it renders `fallback` during prerender and
 * hydration — so the markup matches and there is no mismatch to warn about —
 * then re-renders with the browser's year if the two differ.
 *
 * Two earlier attempts were wrong in opposite directions. Correcting the year
 * from a `useEffect` worked but tripped react-hooks/set-state-in-effect and cost
 * a render pass. Replacing that with `suppressHydrationWarning` silenced the
 * warning by telling React to *keep* the server text, which reintroduced exactly
 * the stale-year bug this component exists to prevent.
 */
export function CurrentYear({ fallback }: { fallback: number }) {
  return <>{useSyncExternalStore(subscribe, getCurrentYear, () => fallback)}</>;
}
