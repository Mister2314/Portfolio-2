// ============================================================================
// THE UNIVERSE — the four chapter panels on the starry ink stage.
// PERF CONTRACT (this was the jank source):
//   - NO box-shadow star fields (3 full-viewport shadow layers repainting
//     every frame). Stars are now ~40 tiny absolutely-positioned dots whose
//     twinkle is an opacity-only stepped CSS animation — compositor work.
//   - NO blur(30px) live filters. The glow is pre-softened radial gradients.
//   - Panel entrances are pure scrub envelopes (arrive): reversible, no CSS
//     one-shot classes, no clip-path/filter storms on entry.
// The sky drifts with the pointer (desktop) or scroll velocity (mobile),
// transform-only. The thread line draws with scroll progress.
// ============================================================================

import { Fragment, useEffect, useRef } from "react";
import { scrollEngine, rangeMap, isMobileDevice } from "../engine/scroll";
import { arrive, smooth } from "../engine/scrub";
import { ChapterBox } from "./ChapterBox";
import { GhostNumeral } from "./GhostNumeral";
import {
  UNIVERSE_TITLE, UNIVERSE_NOTE, UNIVERSE_ANNOTATION, CHAPTERS,
} from "../content/story";
import type { Chapter } from "../content/story";

export function Universe({ onOpen }: { onOpen: (ch: Chapter, rect: DOMRect) => void }) {
  const secRef = useRef<HTMLElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<SVGPathElement>(null);
  const panelWrapRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const sec = secRef.current;
    const sky = skyRef.current;
    const stars = starsRef.current;
    const thread = threadRef.current;
    if (!sec) return;

    const reduced = scrollEngine.reducedMotion;
    const mobile = isMobileDevice();

    // build the star layer once: mostly static dots + a twinkling few.
    // PERF: static stars cost nothing per frame; the twinkle set stays
    // small (10) so the compositor handles it without layer storms.
    if (stars && !stars.dataset.built) {
      stars.dataset.built = "1";
      const frag = document.createDocumentFragment();
      for (let i = 0; i < 30; i++) {
        const d = document.createElement("span");
        const size = i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1;
        d.style.position = "absolute";
        d.style.borderRadius = "50%";
        d.style.width = `${size}px`;
        d.style.height = `${size}px`;
        d.style.left = `${(Math.random() * 100).toFixed(1)}%`;
        d.style.top = `${(Math.random() * 120).toFixed(1)}%`;
        const palette = i % 7 === 0 ? "var(--color-cyan-el)" : i % 11 === 0 ? "var(--color-magenta-hot)" : "var(--color-paper)";
        d.style.background = palette;
        if (i < 10) {
          // staggered 12fps twinkle, opacity only (no repaint)
          const dur = (3.5 + (i % 4) * 1.3).toFixed(2);
          const frames = Math.max(3, Math.round((3.5 + (i % 4) * 1.3) / 0.083));
          d.style.animation = `twinkle ${dur}s steps(${frames}) infinite ${(i % 5) * 0.7}s`;
        } else {
          d.style.opacity = "0.55";
        }
        frag.appendChild(d);
      }
      stars.appendChild(frag);
    }

    // pointer parallax (desktop) / velocity sway (mobile)
    let px = 0, py = 0, lx = 0, ly = 0, lastV = 0;
    let lastDash = "";
    let lastSky = "";
    // last eased arrival per panel: settled panels skip identical writes
    const lastEase: number[] = [];
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      px = e.clientX / window.innerWidth - 0.5;
      py = e.clientY / window.innerHeight - 0.5;
    };
    if (!mobile && !reduced) window.addEventListener("pointermove", onMove, { passive: true });

    const update = (p: number) => {
      // panels arrive as pure scrub envelopes — fully reversible, each on
      // its own phase; opacity + transform only, never CSS animations
      panelWrapRefs.current.forEach((el, i) => {
        if (!el) return;
        const start = 0.06 + i * 0.13;
        const t = arrive(p, start, 0.14);
        const ease = smooth(t);
        if (reduced) {
          if (lastEase[i] !== t) {
            lastEase[i] = t;
            el.style.opacity = t > 0 ? "1" : "0";
          }
          return;
        }
        // settled panels (ease pinned at 0 or 1) write nothing new
        if (ease === lastEase[i]) return;
        lastEase[i] = ease;
        // drift in from below with the panel's wonky settle angle
        const settle = i % 2 ? 3 : -4;
        el.style.opacity = ease.toFixed(3);
        el.style.transform =
          `translate3d(0, ${((1 - ease) * 70).toFixed(1)}px, 0) rotate(${((1 - ease) * settle).toFixed(2)}deg)`;
      });

      // thread line draws with the scroll
      if (thread) {
        const len = 1400; // viewBox units; dash math is cheap at this scale
        const draw = rangeMap(p, 0.03, 0.75, 0, 1);
        const dash = `${(len * draw).toFixed(0)} ${len}`;
        if (dash !== lastDash) {
          lastDash = dash;
          thread.style.strokeDasharray = dash;
        }
      }

      // sky drift: pointer parallax on desktop, scroll-velocity sway on mobile.
      // Written only when the rounded offsets actually change.
      if (sky && !reduced) {
        lx += (px - lx) * 0.04;
        ly += (py - ly) * 0.04;
        const v = scrollEngine.velocity;
        lastV += (v - lastV) * 0.1;
        const sway = mobile ? lastV * 26 : 0;
        const tf = `translate3d(${(lx * -34 + sway).toFixed(1)}px, ${(ly * -22 - p * 60).toFixed(1)}px, 0)`;
        if (tf !== lastSky) {
          lastSky = tf;
          sky.style.transform = tf;
        }
      }
    };

    scrollEngine.registerTrack("universe", { el: sec, onUpdate: update });
    return () => {
      scrollEngine.unregisterTrack("universe");
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section
      ref={secRef}
      id="universe"
      className="relative overflow-x-clip"
      style={{ minHeight: "160vh" }}
      aria-label={UNIVERSE_TITLE}
      tabIndex={-1}
    >
      <GhostNumeral sectionId="universe" label="02" side="right" />
      {/* the sky: pre-softened gradients + cheap twinkling dots */}
      <div ref={skyRef} className="pointer-events-none absolute inset-[-10%] overflow-hidden">
        <div className="spray-glow absolute inset-0 opacity-40" />
        <div
          className="halftone absolute inset-0 opacity-25"
          style={{ ["--dot-color" as string]: "var(--sky-ink)", ["--dot-gap" as string]: "22px", ["--dot-size" as string]: "2.4px" }}
        />
        <div
          className="hatch absolute inset-0 opacity-60"
          style={{ ["--hatch-color" as string]: "var(--sky-ink-faint)" }}
        />
        <div ref={starsRef} className="absolute inset-0" />
      </div>

      {/* the strip's thread line — the old constellation, now the gutter */}
      <svg
        className="pointer-events-none absolute left-0 top-0 hidden h-full w-full md:block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          ref={threadRef}
          d="M 12 30 Q 30 24 50 30 T 88 38"
          fill="none"
          stroke="var(--sky-ink)"
          strokeWidth="0.28"
          strokeLinecap="round"
        />
      </svg>

      {/* heading */}
      <div className="relative px-6 pt-[16vh] md:px-[7vw]">
        <h2 className="t-display text-[clamp(2.8rem,10vw,8.5rem)] text-paper">
          {UNIVERSE_TITLE.split(" ").map((w, wi, arr) => (
            <Fragment key={wi}>{wi === arr.length - 1 ? <span className="spray-text">{w}</span> : w}{" "}</Fragment>
          ))}
        </h2>
        <p className="caption-box caption-box--dark caption-tail mt-6 inline-block text-[clamp(0.85rem,1.6vw,1.05rem)]" style={{ ["--cap-tilt" as string]: "1.2deg" }}>
          {UNIVERSE_NOTE}
        </p>
      </div>

      {/* the comic-page collage: panels overlap and tilt like a laid-out
          comic page — research: overlapping panels = energy, 4 per view is
          the sweet spot for readability. Real gutters where they separate. */}
      <div className="relative mt-[12vh] px-6 pb-[18vh] md:px-[7vw]">
        <div className="grid grid-cols-1 gap-24 md:grid-cols-2 md:gap-x-2 md:gap-y-0">
          <div ref={(el) => { panelWrapRefs.current[0] = el; }} className="md:-rotate-2 md:justify-self-start" style={{ opacity: 0 }}>
            <ChapterBox chapter={CHAPTERS[0]} index={0} onOpen={onOpen} />
          </div>
          <div ref={(el) => { panelWrapRefs.current[1] = el; }} className="md:-mt-[7vh] md:rotate-2 md:justify-self-end md:translate-x-[6%]" style={{ opacity: 0 }}>
            <ChapterBox chapter={CHAPTERS[1]} index={1} onOpen={onOpen} />
          </div>
          <div ref={(el) => { panelWrapRefs.current[2] = el; }} className="md:-mt-[6vh] md:-rotate-1 md:justify-self-end md:translate-x-[2%]" style={{ opacity: 0 }}>
            <ChapterBox chapter={CHAPTERS[2]} index={2} onOpen={onOpen} />
          </div>
          <div ref={(el) => { panelWrapRefs.current[3] = el; }} className="md:-mt-[9vh] md:rotate-2 md:justify-self-start md:-translate-x-[4%]" style={{ opacity: 0 }}>
            <ChapterBox chapter={CHAPTERS[3]} index={3} onOpen={onOpen} />
          </div>
        </div>
      </div>

      {/* italic annotation */}
      <p className="t-note absolute right-[7%] top-[34%] hidden rotate-6 text-[15px] text-warning/80 md:block">
        {UNIVERSE_ANNOTATION}
      </p>
      <p className="t-note px-6 pb-8 text-[15px] text-warning/80 md:hidden">
        {UNIVERSE_ANNOTATION}
      </p>
    </section>
  );
}
