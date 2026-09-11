// ============================================================================
// SCROLL-TOP — the comic "TOP" stamp.
// A hard-ink stamp button, bottom-right, that only exists once the story
// is underway (scrub-driven opacity like the rest of the chrome).
// Press it and the stamp fires its own web line UP the page and rides
// it: the line zips from the stamp to the top of the viewport, a THWIP!
// word stamps on, and the stamp itself gets yanked up the line while
// the page glides to the top behind it — you SEE the button leave.
// Reduced-motion: the stamp stays and the page jumps plainly.
// ============================================================================

import { useEffect, useRef } from "react";
import { scrollEngine } from "../engine/scroll";
import { ARIA_TOP, THWIP_WORD, TOP_WORD } from "../content/story";

const RIDE_MS = 900; // matches the engine's Lenis glide (1.04s)

export function ScrollTop() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  // scrub the stamp in/out with the page (no timers for visibility)
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const apply = (y: number) => {
      const p = y / window.innerHeight;
      // appears one act deep, always there after
      const o = String(Math.min(1, Math.max(0, (p - 0.85) * 2.5)));
      if (btn.style.opacity !== o) btn.style.opacity = o;
      btn.style.pointerEvents = Number(o) > 0.5 ? "auto" : "none";
    };
    const off = scrollEngine.onScroll(apply);
    apply(window.scrollY);
    return off;
  }, []);

  const toTop = () => {
    const btn = btnRef.current;
    const line = lineRef.current;
    const word = wordRef.current;
    if (!btn) return;
    const reduced = scrollEngine.reducedMotion;

    // the page glide — the engine's own butter (Lenis ~1.04s)
    scrollEngine.scrollTo(0);

    if (reduced) return; // stamp stays put; page jumps plainly

    // --- the web ride: line zips up, THWIP! stamps, stamp yanks ---
    const r = btn.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y0 = r.top + 2; // from the stamp's crown
    const y1 = -40; // off the top of the viewport

    if (line) {
      line.setAttribute("x1", String(x));
      line.setAttribute("y1", String(y0));
      line.setAttribute("x2", String(x));
      line.setAttribute("y2", String(y1));
      const len = Math.abs(y1 - y0);
      line.style.transition = "none";
      line.style.strokeDasharray = `0 ${len}`;
      line.style.opacity = "1";
      // draw the web upward over the first half of the ride
      requestAnimationFrame(() => {
        line.style.transition = `stroke-dasharray ${RIDE_MS * 0.45}ms cubic-bezier(0.2, 0, 0.2, 1)`;
        line.style.strokeDasharray = `${len} ${len}`;
      });
      // then it snaps away with the stamp
      setTimeout(() => {
        line.style.transition = "opacity 0.18s steps(2)";
        line.style.opacity = "0";
      }, RIDE_MS * 0.62);
    }

    if (word) {
      word.style.animation = "none";
      void word.offsetWidth;
      word.style.animation = `top-thwip ${RIDE_MS * 0.8}ms steps(5, jump-none) both`;
    }

    // the stamp itself rides its line: yanked up with a squash-and-stretch
    btn.style.animation = "none";
    void btn.offsetWidth;
    btn.style.animation = `top-ride ${RIDE_MS}ms cubic-bezier(0.3, 0, 0.1, 1) both`;
    // and settles back home for the next act
    setTimeout(() => {
      btn.style.animation = "";
      btn.style.opacity = "0";
    }, RIDE_MS + 60);
  };

  return (
    <>
      {/* the fired web line — one reusable, absolutely-positioned strand */}
      <svg className="pointer-events-none fixed inset-0 z-[46]" aria-hidden="true">
        <line
          ref={lineRef}
          stroke="var(--color-paper)"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ opacity: 0 }}
        />
      </svg>

      <button
        ref={btnRef}
        type="button"
        onClick={toTop}
        aria-label={ARIA_TOP}
        className="issue-stamp t-letter fixed bottom-6 right-6 z-[46] flex items-center gap-2 px-4 py-2.5 text-[0.95rem] text-ink select-none"
        style={{ opacity: 0 }}
      >
        {/* the stamp's word — THWIPs upward on fire */}
        <span
          ref={wordRef}
          className="t-display absolute -top-7 left-1/2 -translate-x-1/2 text-[1.35rem] text-warning"
          style={{
            opacity: 0,
            textShadow: "2px 0 0 rgba(255,46,136,0.75), -2px 0 0 rgba(0,229,255,0.75)",
          }}
        >
          {THWIP_WORD}
        </span>
        <span aria-hidden="true" className="text-[1.1em] leading-none">
          {/* the up-arrow, inked like a comic glyph */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 12V3M7 3L3 7M7 3l4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        {TOP_WORD}
      </button>
    </>
  );
}
