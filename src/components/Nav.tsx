// ============================================================================
// NAV — minimal fixed chrome + the WEB-JUMP chips.
// Brand mark left; right side carries the comic PAGE COUNTER and the
// five page chips: press one and it THROWS a web at its section
// (WebJump.jumpTo — the strand draws, the section's card is caught,
// the page glides there). The active act's chip fills yellow. The
// counter still flips like comic page corners, on 2s. Fades in once
// the story is underway and never fights the film.
// ============================================================================

import { useEffect, useRef } from "react";
import { scrollEngine } from "../engine/scroll";
import { jumpTo } from "./WebJump";
import { BRAND_MARK, ARIA_JUMP, ARIA_PAGES, COUNTER_WORD, NAV_NOTE, PAGE_COUNT } from "../content/story";

/** the acts, in scroll order — the page numbers of the comic */
const PAGES: { id: string; label: string }[] = [
  { id: "hero", label: "01" },
  { id: "universe", label: "02" },
  { id: "journey", label: "03" },
  { id: "multiverse", label: "04" },
  { id: "contact", label: "05" },
];

export function Nav() {
  const ref = useRef<HTMLElement>(null);
  const pageRef = useRef<HTMLSpanElement>(null);
  const pageWrapRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = (y: number) => {
      const p = y / window.innerHeight;
      const o = String(Math.min(1, Math.max(0, (p - 0.25) * 4)));
      if (el.style.opacity !== o) el.style.opacity = o;
    };
    const off = scrollEngine.onScroll(apply);
    apply(window.scrollY);

    // page counter + active chip: which act owns the viewport middle?
    const tick = () => {
      const wrap = pageWrapRef.current;
      const page = pageRef.current;
      let current = PAGES[0].id;
      if (wrap && page) {
        const mid = window.innerHeight * 0.55;
        for (const pg of PAGES) {
          const sec = document.getElementById(pg.id);
          if (!sec) continue;
          const r = sec.getBoundingClientRect();
          if (r.top <= mid && r.bottom >= mid) current = pg.id;
        }
        const label = PAGES.find((p) => p.id === current)?.label ?? "01";
        if (page.textContent !== label) {
          page.textContent = label;
          // page-flip tick: snap like turning a page, on 2s
          wrap.classList.remove("page-flip");
          void wrap.offsetWidth;
          wrap.classList.add("page-flip");
        }
      }
      chipsRef.current.forEach((chip, i) => {
        if (!chip) return;
        const on = PAGES[i].id === current;
        chip.classList.toggle("nav-chip--on", on);
        chip.setAttribute("aria-current", on ? "page" : "false");
      });
    };
    // ride the master heartbeat cheaply: only while scrolling
    const offTick = scrollEngine.onScroll(() => tick());
    tick();

    return () => {
      off();
      offTick();
    };
  }, []);

  return (
    <header
      ref={ref}
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 md:px-10"
      style={{ opacity: 0 }}
    >
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          scrollEngine.scrollTo(0);
        }}
        className="t-display text-xl tracking-wide text-paper chroma-soft"
      >
        {BRAND_MARK}
      </a>

      <div className="flex items-center gap-2 md:gap-3">
        {/* the web-jump chips — one throw per page of the comic. Mobile
            keeps them compact and drops the redundant corner counter */}
        <nav aria-label={ARIA_PAGES} className="flex items-center gap-1 md:gap-1.5">
          {PAGES.map((pg, i) => (
            <button
              key={pg.id}
              ref={(el) => {
                chipsRef.current[i] = el;
              }}
              data-nav-chip
              type="button"
              onClick={(e) => jumpTo(pg.id, e.currentTarget)}
              aria-label={ARIA_JUMP.replace("{p}", pg.label)}
              className="issue-stamp nav-chip relative flex h-7 w-7 items-center justify-center px-0 py-0 text-[0.7rem] text-ink select-none md:h-8 md:w-8 md:text-[0.8rem]"
            >
              {pg.label}
            </button>
          ))}
        </nav>

        {/* the comic page corner — flips as the acts change (desktop) */}
        <div
          ref={pageWrapRef}
          className="issue-stamp relative hidden items-center gap-1.5 md:flex"
          aria-hidden="true"
        >
          <span>{COUNTER_WORD}</span>
          <span ref={pageRef} className="text-magenta" style={{ fontWeight: 700 }}>01</span>
          <span className="opacity-60">/{String(PAGE_COUNT).padStart(2, "0")}</span>
        </div>
        <p className="t-note hidden text-[13px] text-body-dim lg:block" style={{ textShadow: "0 1px 2px rgba(10,9,14,0.8)" }}>
          {NAV_NOTE}
        </p>
      </div>
    </header>
  );
}
