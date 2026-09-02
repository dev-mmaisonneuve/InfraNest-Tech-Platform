"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { company, navigation } from "@/data/site-content";
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
  const headerRef = useRef<HTMLElement>(null);

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

  // Covering the page visually does not remove it from the tab order or the
  // accessibility tree. Focus moved into the menu on open, but nothing held it
  // there: tabbing past the last contact link walked straight into the page
  // underneath the opaque sheet, where a keyboard user cannot see what they
  // have landed on. `inert` takes those subtrees out of both the tab order and
  // the accessibility tree at once — a focus trap would fix the keyboard case
  // and still leave a screen reader free to browse the hidden page by heading.
  //
  // Everything in the body except the header goes inert, rather than a fixed
  // list, so anything added to the layout later is covered by default. The
  // hasAttribute guard means the cleanup only restores what this effect set.
  useEffect(() => {
    if (!isOpen) return;
    const header = headerRef.current;
    if (!header) return;
    const backdrop = Array.from(document.body.children).filter(
      (element) => element !== header && !element.hasAttribute("inert"),
    );
    backdrop.forEach((element) => element.setAttribute("inert", ""));
    return () => backdrop.forEach((element) => element.removeAttribute("inert"));
  }, [isOpen]);

  // A scroll gesture on a phone can start anywhere, and the open panel is
  // position: fixed — without a lock the whole page slides underneath it.
  // Inline styles override the stylesheet's overflow-x: clip while open and
  // hand back to it on close. The padding compensates for a disappearing
  // scrollbar on desktop-sized windows so the layout does not shift.
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const scrollbar = window.innerWidth - root.clientWidth;
    const prevOverflow = root.style.overflow;
    const prevPadding = root.style.paddingRight;
    root.style.overflow = "hidden";
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
    return () => {
      root.style.overflow = prevOverflow;
      root.style.paddingRight = prevPadding;
    };
  }, [isOpen]);

  // The menu only exists below 760px, but isOpen is React state and survives a
  // resize across that boundary — and a phone in landscape is already past it
  // (an iPhone 14 is 390px portrait, 844px landscape). Rotating with the menu
  // open would hide the toggle behind the desktop nav while the scroll lock
  // above stayed applied, leaving the page unscrollable with no visible
  // control to release it. Closing on the query un-matching resolves both the
  // lock and the stale data-open state.
  //
  // The 760px literal mirrors the breakpoint in globals.css; the two have to
  // be changed together.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setIsOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Tapping anywhere outside the header (the open panel is part of it)
  // closes the menu — the other half of the scroll-lock expectation.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
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
    <header className="site-header" data-scrolled={scrolled} ref={headerRef}>
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

          {/*
            On mobile the shell itself is the panel — a full-height sheet
            below the bar rather than a strip that ends mid-page. On desktop
            it is an inert wrapper and all of this collapses to a row.
          */}
          <div className="nav-shell" id="primary-navigation" data-open={isOpen}>
            <nav className="nav-links" ref={navRef} aria-label="Primary navigation">
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

            {/* Mobile only. Gives the open menu somewhere to end, and puts the
                two things a visitor on a phone most wants — a number to call
                and an address to write to — one tap from anywhere. */}
            <div className="nav-panel-contact">
              <a href={`tel:${company.phone.replace(/[^\d]/g, "")}`}>{company.phone}</a>
              <a href={`mailto:${company.email}`}>{company.email}</a>
              <div className="nav-panel-social">
                <a href={company.linkedIn} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a href={company.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              </div>
            </div>
          </div>

          <div className="nav-actions">
            <Link className="button" href="/quote">
              Request a quote
            </Link>
            {/*
              Icon-only control, so the aria-label is required rather than
              harmful: with no visible text there is nothing for it to
              override, which is the opposite of the situation when this
              button said "Menu" (WCAG 2.5.3 cut the label then). The three
              lines morph into an X via CSS keyed off aria-expanded.
            */}
            <button
              ref={toggleRef}
              className="nav-toggle"
              type="button"
              aria-expanded={isOpen}
              aria-controls="primary-navigation"
              aria-label={isOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setIsOpen((value) => !value)}
            >
              <svg className="nav-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
