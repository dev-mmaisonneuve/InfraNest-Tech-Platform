"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeSection = useScrollSpy(navSectionIds);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 55);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The toggle comes after the nav in DOM order, because the visual layout puts
  // it on the right-hand side. Tabbing forward from the toggle therefore walks
  // straight past the menu it just opened — the links sit behind it in the
  // sequence, not ahead of it, so a keyboard user would have to Shift+Tab to
  // reach them. Moving focus into the menu makes the tab order match the screen.
  useEffect(() => {
    if (!isOpen) return;
    navRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
  }, [isOpen]);

  // Escape closes the menu and returns focus to the control that opened it.
  // Without the second half, focus would be left on a link that has just been
  // hidden, and the next Tab would resume from an unpredictable place.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

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
            <nav className="nav-links" id="primary-navigation" ref={navRef} aria-label="Primary navigation">
              {navigation.map((item) => {
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
            {/*
              No aria-label here on purpose. One would override the visible
              "Menu"/"Close" text as the accessible name, so speech-input users
              saying "click Menu" would find nothing matching (WCAG 2.5.3).
              The visible text is already a good name; aria-expanded carries the
              state and aria-controls names what it operates on.
            */}
            <button
              ref={toggleRef}
              className="nav-toggle"
              type="button"
              aria-expanded={isOpen}
              aria-controls="primary-navigation"
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
