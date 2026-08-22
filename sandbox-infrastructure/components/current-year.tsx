"use client";

import { useEffect, useState } from "react";

/**
 * Every page is statically prerendered, so a `new Date()` in the server-rendered
 * footer freezes at build time and shows a stale year once the calendar rolls
 * over. This renders the build year for the initial paint (keeping hydration
 * stable) and corrects it on the client.
 */
export function CurrentYear({ fallback }: { fallback: number }) {
  const [year, setYear] = useState(fallback);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <>{year}</>;
}
