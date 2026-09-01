"use client";

import { useEffect, useRef, useState } from "react";

export function HeroSpotlightWrapper({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  // undefined until the observer reports, so the server-rendered markup
  // carries no data-inview attribute and the CSS pause rule cannot apply to
  // a no-JS visitor.
  const [inView, setInView] = useState<boolean | undefined>(undefined);

  // The spotlight runs a dozen infinite animations; on phones it sits below
  // the fold and was animating unseen from first paint. Pause everything
  // inside it while offscreen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "80px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function handleMouseMove(e: React.MouseEvent) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    el.style.setProperty("--px", `${x * 12}px`);
    el.style.setProperty("--py", `${y * 8}px`);
  }

  function handleMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--px", "0px");
    el.style.setProperty("--py", "0px");
  }

  return (
    <div
      className="hero-spotlight"
      ref={ref}
      data-inview={inView === undefined ? undefined : String(inView)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
