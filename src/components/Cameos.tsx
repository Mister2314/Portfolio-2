// ============================================================================
// CAMEOS — the surprise moments, fully SCRUB-DRIVEN.
// Every cameo lives strictly inside the scroll window of its host section:
// all motion is a pure function of section progress. Scrolling fast past a
// section can't "fire" anything — a cameo exists only while its window is
// entered, and plays backward perfectly when you scrub back. No timers, no
// CSS animation starts, no state flags.
//   1. THE THWIP — through the journey's opening window, a pig-spider
//      pops up, throws its web; the page flash follows progress too.
//   2. THE VERSE-JUMPER — MID-multiverse (after the variant cards have
//      assembled, so it MEANS something: dimensions are connected), the
//      real Spider-Man rides a sagging web line across the cards, left
//      to right, over a third of the section — a long, graceful swing
//      visible at any scroll speed. Art: public clip-art PNG
//      (public/media/spiderman-web.png); the hand-drawn SVG is retired.
// Reduced-motion: cameos render nothing (they are pure motion moments).
// ============================================================================

import { useEffect, useRef } from "react";
import { scrollEngine } from "../engine/scroll";
import { phase, bell, stepped2s } from "../engine/scrub";
import { THWIP_WORD, JUMPER_NOTE } from "../content/story";

export function Cameos() {
  const reduced = scrollEngine.reducedMotion;

  // every animated property is written by the tracks below
  const pigRef = useRef<HTMLDivElement>(null);
  const pigWebRef = useRef<SVGLineElement>(null);
  const thwipWordRef = useRef<HTMLParagraphElement>(null);
  const thwipFlashRef = useRef<HTMLDivElement>(null);

  const jumperRef = useRef<HTMLDivElement>(null);
  const jumperLineRef = useRef<SVGPathElement>(null);
  const jumperNoteRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (reduced) return;
    const vh = () => window.innerHeight;

    // one pattern for all cameos: register a track on the host section and
    // keep every write inside the section's on-screen window
    const track = (id: string, name: string, fn: (p: number, rect: DOMRect) => void) => {
      const sec = document.querySelector(id);
      if (!sec || !(sec instanceof HTMLElement)) return;
      scrollEngine.registerTrack(name, {
        el: sec,
        onUpdate: (p, rect) => {
          // park everything the moment the host leaves the viewport
          if (rect.bottom < -40 || rect.top > vh() + 40) {
            fn(-1, rect);
            return;
          }
          fn(p, rect);
        },
      });
    };

    // ---------- 1. THE THWIP (journey, window p 0.03 → 0.16) ----------
    track("#journey", "cameo-thwip", (p) => {
      const pig = pigRef.current;
      const word = thwipWordRef.current;
      const flash = thwipFlashRef.current;
      const web = pigWebRef.current;
      if (!pig) return;
      if (p < 0) {
        pig.style.opacity = "0";
        if (word) word.style.opacity = "0";
        if (flash) flash.style.opacity = "0";
        if (web) web.style.opacity = "0";
        return;
      }
      const pop = bell(p, 0.03, 0.16, 0.035);
      if (pop <= 0.001) {
        pig.style.opacity = "0";
        if (word) word.style.opacity = "0";
        if (flash) flash.style.opacity = "0";
        if (web) web.style.opacity = "0";
        return;
      }
      const s = stepped2s(pop); // pop lands on 2s
      pig.style.opacity = String(Math.min(1, pop * 1.8));
      pig.style.transform =
        `translate3d(0, ${((1 - s) * 40).toFixed(1)}px, 0) scale(${(0.6 + s * 0.4).toFixed(2)}) rotate(${(s * -6).toFixed(1)}deg)`;
      if (word) {
        const we = bell(p, 0.055, 0.15, 0.02);
        word.style.opacity = String(we);
        word.style.transform =
          `scale(${(0.7 + stepped2s(we) * 0.3).toFixed(2)}) rotate(-8deg)`;
      }
      if (web) {
        const wbe = phase(p, 0.045, 0.075);
        web.style.opacity = String(wbe * pop);
        web.style.strokeDasharray = `${(wbe * 900).toFixed(0)} 900`;
      }
      if (flash) {
        const fe = bell(p, 0.07, 0.115, 0.018);
        flash.style.opacity = String(fe * 0.85);
      }
    });

    // ---------- 2. THE VERSE-JUMPER (multiverse, MID-section) ----------
    // The real Spider-Man rides the web express across the variant cards.
    // Window p 0.32 → 0.76 (nearly half the section): a long, graceful
    // swing readable at any speed. It begins only after the cards have
    // FULLY assembled (they finish at p 0.285 — the motions never share
    // a frame), so it means something: dimensions are connected. Pure
    // scrub: back-scroll rewinds the ride.
    track("#multiverse", "cameo-jumper", (p) => {
      const jumper = jumperRef.current;
      const line = jumperLineRef.current;
      const note = jumperNoteRef.current;
      if (!jumper) return;
      if (p < 0) {
        jumper.style.opacity = "0";
        if (line) line.style.opacity = "0";
        if (note) note.style.opacity = "0";
        return;
      }
      const e = bell(p, 0.32, 0.76, 0.05);
      if (e <= 0.001) {
        jumper.style.opacity = "0";
        if (line) line.style.opacity = "0";
        if (note) note.style.opacity = "0";
        return;
      }

      // ONE continuous ride, left → right. The grip rides the EXACT
      // quadratic of the web line below (same control points — x(t) is
      // linear, y(t) the sag), so hand and web can never separate. The
      // figure rotates around its grip point (transform-origin 0 0 of
      // the holder): a single slow pendulum sweep — trailing at the
      // grab, vertical through the bottom of the arc, released forward
      // at the far end. Pure scrub; back-scroll rewinds the ride.
      const w = phase(p, 0.32, 0.76); // travel 0..1 across the window
      const gx = -8 + 116 * w; // vw — the line's own x(t)
      const gy = 12 + 36 * w - 38 * w * w; // vh — the line's own y(t)
      const rot = (w - 0.5) * 24; // pendulum sweep: -12° → +12°
      jumper.style.opacity = String(Math.min(1, e * 1.8));
      jumper.style.transform =
        `translate3d(${gx.toFixed(2)}vw, ${gy.toFixed(2)}vh, 0) rotate(${rot.toFixed(1)}deg)`;

      // the web line: laid just ahead of the rider as he crosses. The
      // path length of this quadratic is ~117 units in its 100×100
      // viewBox; the dash travels that full length.
      if (line) {
        line.style.opacity = String(e * 0.85);
        line.style.strokeDasharray = `${(Math.min(1, w + 0.06) * 117).toFixed(1)} 117`;
      }
      if (note) {
        const ne = bell(p, 0.42, 0.66, 0.04);
        note.style.opacity = String(ne);
        note.style.transform = `translate3d(0, ${(1 - ne) * 10}px, 0) rotate(3deg)`;
      }
    });

    return () => {
      scrollEngine.unregisterTrack("cameo-thwip");
      scrollEngine.unregisterTrack("cameo-jumper");
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <>
      {/* 1. THE THWIP — pig-spider + web + word + page flash, all scrubbed */}
      <div className="pointer-events-none fixed inset-0 z-[46]" aria-hidden="true">
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          <line
            ref={pigWebRef}
            x1="12%" y1="78%" x2="88%" y2="8%"
            stroke="var(--sky-ink)" strokeWidth="2"
            style={{ opacity: 0 }}
          />
        </svg>
        <div
          ref={pigRef}
          className="absolute left-[10%] top-[68%]"
          style={{ opacity: 0, willChange: "transform, opacity" }}
        >
          {/* the pig-spider — original round silhouette: snout + folded ears,
              stubby legs, tiny web-flick hands. Cute-abstract, our ink. */}
          <svg width="64" height="56" viewBox="0 0 64 56" className="boil">
            <g stroke="var(--color-ink)" strokeWidth="2.2" strokeLinecap="round" fill="none">
              <path d="M22 40 Q14 46 13 53" />
              <path d="M27 43 Q23 50 24 55" />
              <path d="M37 43 Q41 50 40 55" />
              <path d="M42 40 Q50 46 51 53" />
            </g>
            <ellipse cx="32" cy="34" rx="17" ry="14" fill="var(--color-warning)" stroke="var(--color-ink)" strokeWidth="2.5" />
            <path d="M18 24 Q12 16 20 14 Q24 18 23 24 Z" fill="var(--color-warning)" stroke="var(--color-ink)" strokeWidth="2" />
            <path d="M46 24 Q52 16 44 14 Q40 18 41 24 Z" fill="var(--color-warning)" stroke="var(--color-ink)" strokeWidth="2" />
            <ellipse cx="32" cy="38" rx="7" ry="5" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2" />
            <circle cx="30" cy="38" r="1.3" fill="var(--color-ink)" />
            <circle cx="34" cy="38" r="1.3" fill="var(--color-ink)" />
            <circle cx="26" cy="31" r="1.8" fill="var(--color-ink)" />
            <circle cx="38" cy="31" r="1.8" fill="var(--color-ink)" />
            <path d="M16 30 Q7 24 3 26 M16 30 Q8 28 5 32" stroke="var(--color-ink)" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        {/* the THWIP! word — chromatic stamp */}
        <p
          ref={thwipWordRef}
          className="t-display absolute left-[14%] top-[56%] text-[clamp(2rem,6vw,4.5rem)] text-paper select-none"
          style={{
            opacity: 0,
            willChange: "transform, opacity",
            textShadow: "4px 0 0 rgba(255,46,136,0.8), -4px 0 0 rgba(0,229,255,0.8)",
          }}
        >
          {THWIP_WORD}
        </p>
        {/* the page flash — a paper-white veil whose opacity follows progress */}
        <div
          ref={thwipFlashRef}
          className="absolute inset-0 bg-paper"
          style={{ opacity: 0, willChange: "opacity" }}
        />
      </div>

      {/* 2. THE VERSE-JUMPER — the real Spider-Man rides the web express
          across the variant cards, mid-section. Transparent PNG sourced
          from a public clip-art library (public/media/spiderman-web.png);
          the hand-drawn SVG version is retired. */}
      <div className="pointer-events-none fixed inset-0 z-[45]" aria-hidden="true">
        {/* the sagging web line — drawn ahead of the rider */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            ref={jumperLineRef}
            d="M -8 12 Q 50 30 108 10"
            fill="none"
            stroke="var(--sky-ink)"
            strokeWidth="0.7"
            strokeLinecap="round"
            style={{ opacity: 0 }}
          />
        </svg>

        {/* the rider — the PNG's grip point (the hand gripping the web)
            sits at ~41% of the art's width, right at its top edge, so
            the image is offset to seat that point on the holder's
            origin (0 0) — the point where the track writes the line's
            own x(t),y(t). transform-origin 0 0 makes rotation pivot AT
            the hand, so the figure pendulums from the line like the
            real thing. */}
        <div
          ref={jumperRef}
          className="absolute top-0 left-0"
          style={{
            opacity: 0,
            willChange: "transform, opacity",
            transformOrigin: "0 0",
          }}
        >
          <img
            src="/media/spiderman-web.png"
            alt=""
            width="180"
            height="120"
            draggable={false}
            style={{
              width: "clamp(120px, 22vw, 190px)",
              height: "auto",
              display: "block",
              // the art's grip point (the hand on the web, measured at
              // x=370/900 = 41% in, y=10/600 ≈ top edge) sits on the
              // holder's origin — the same point the track writes the
              // line's own x(t),y(t) — so the hand rides the web exactly.
              translate: "-41% 0%",
              filter: "drop-shadow(0 12px 0 rgba(10,9,14,0.28))",
            }}
          />
        </div>

        {/* the express note — set in the letterer's hand */}
        <p
          ref={jumperNoteRef}
          className="t-letter absolute bottom-[24vh] left-1/2 -translate-x-1/2 text-center text-[clamp(0.85rem,1.6vw,1.1rem)] text-warning"
          style={{ opacity: 0, willChange: "transform, opacity", textShadow: "0 1px 2px rgba(10,9,14,0.9)" }}
        >
          {JUMPER_NOTE}
        </p>
      </div>
    </>
  );
}
