"use client";

/**
 * Renders the current calendar year in the footer.
 *
 * Every page is statically prerendered, so a plain `new Date()` freezes at build
 * time and shows a stale year once the calendar rolls over. This renders the
 * build year during prerender and the real year on the client, with
 * `suppressHydrationWarning` acknowledging that the two legitimately differ.
 *
 * The earlier version corrected the year from a `useEffect`, which tripped
 * react-hooks/set-state-in-effect and cost a render pass. No state or effect is
 * needed: the value is derived at render time on both sides.
 */
export function CurrentYear() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
