"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { navigation } from "@/data/site-content";
import { brandAssets } from "@/lib/brand-assets";
import { useScrollSpy } from "@/lib/use-scroll-spy";

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeSection = useScrollSpy(
    navigation
      .map((item) => item.section)
      .filter(Boolean)
      .map((id) => String(id)),
  );

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
          <Link className="brand-mark" href="/" onClick={() => setIsOpen(false)}>
            <Image
              className="brand-wordmark"
              src={brandAssets.uiWordmark.src}
              alt="InfraNest Technologies"
              width={brandAssets.uiWordmark.width}
              height={brandAssets.uiWordmark.height}
              sizes="(max-width: 760px) 94px, 112px"
              priority
            />
          </Link>

          <div className="nav-shell" data-open={isOpen}>
            <nav className="nav-links" aria-label="Primary navigation">
              {navigation.map((item) => {
                const isHome = pathname === "/" || pathname === "/quote" || pathname === "/contact" || pathname === "/services" || pathname === "/about";
                const isActive =
                  (item.section && activeSection === item.section && pathname === "/") ||
                  (!item.section && pathname === item.href);
                return (
                  <Link key={item.href} href={item.href} data-active={isActive} onClick={() => setIsOpen(false)}>
                    {item.label}
                  </Link>
                );
              })}
              <Link className="mobile-nav-quote" href="/quote" data-active={pathname === "/quote"} onClick={() => setIsOpen(false)}>
                Request a quote
              </Link>
            </nav>
          </div>

          <div className="nav-actions">
            <Link className="button" href="/quote">
              Request a quote
            </Link>
            <button
              className="nav-toggle"
              type="button"
              aria-expanded={isOpen}
              aria-label="Toggle navigation"
              onClick={() => setIsOpen((value) => !value)}
            >
              {isOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
