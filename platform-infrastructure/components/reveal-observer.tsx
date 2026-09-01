"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    // Tells the inline bootstrap script that hydration made it in time, so the
    // 2.5s force-reveal fallback does not fire. Once fired it is left in
    // place: re-hiding already-visible content would flash.
    (window as Window & { __revealReady?: boolean }).__revealReady = true;
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.1 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
