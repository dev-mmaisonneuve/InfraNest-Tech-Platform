"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { navigation } from "@/data/site-content";
import { brandAssets } from "@/lib/brand-assets";
import { useScrollSpy } from "@/lib/use-scroll-spy";

// Derived from static nav data, so it is hoisted out of the component: building
// it inline gave `useScrollSpy` a new array identity every render, which tore
// down and rebuilt the IntersectionObserver on each one.
const navSectionIds = navigation
  .map((item) => item.section)
  .filter(Boolean)
  .map((id) => String(id));

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const activeSection = useScrollSpy(navSectionIds);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 55);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <div className="header-bg" aria-hidden="true" />
      <div className="container">
        <div className="header-row">
          <Link className="brand-mark" href="/">
            <Image
              className="brand-badge"
              src={brandAssets.badge.src}
              alt=""
              width={brandAssets.badge.width}
              height={brandAssets.badge.height}
              sizes="44px"
              priority
            />
            <span className="header-brand-copy">
              <strong>InfraNest</strong>
              <span>Technologies</span>
            </span>
          </Link>

          <div className="nav-shell">
            <nav className="nav-links" aria-label="Primary navigation">
              {navigation.map((item) => {
                const isActive =
                  (item.section && activeSection === item.section && pathname === "/") ||
                  (!item.section && pathname === item.href);

                return (
                  <Link key={item.href} href={item.href} data-active={isActive}>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

        </div>
      </div>
    </header>
  );
}
