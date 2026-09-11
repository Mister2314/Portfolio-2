// ============================================================================
// MULTIVERSE — alternate versions of Khayal as comic "variant covers".
// Each card is a LIVING 3D diorama on the shared DioramaBox core —
// the exact same physics as the universe chapter boxes (idle bob, spring
// proximity, hover tilt with free plane parallax). Arrivals are pure scrub
// page-turns. The verse-jumper cameo crosses MID-section (Cameos.tsx) —
// the old blue-line page-yank is retired.
// ============================================================================

import { Fragment, useEffect, useRef } from "react";
import { scrollEngine } from "../engine/scroll";
import { arrive, smooth } from "../engine/scrub";
import { DioramaBox } from "./DioramaBox";
import {
  MULTIVERSE_TITLE, MULTIVERSE_NOTE, MULTIVERSE_ANNOTATION,
  VARIANTS, CANON_WORD, VARIANT_NO_WORD,
} from "../content/story";

const COLOR_VAR: Record<string, { c: string }> = {
  magenta: { c: "var(--color-magenta)" },
  cyan: { c: "var(--color-cyan-el)" },
  yellow: { c: "var(--color-warning)" },
  paper: { c: "var(--color-paper)" },
};

/* MOBILE PERF: shadow plane desktop-only (same as universe boxes) */
const MOBILE3D = typeof window !== "undefined" &&
  window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;

export function Multiverse() {
  const secRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return;
    const reduced = scrollEngine.reducedMotion;
    // last eased arrival per card: settled cards skip identical writes
    const lastEase: number[] = [];

    const update = (p: number) => {
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        // cards assemble EARLY (p 0.02 → 0.285, done) so the verse-jumper's
        // crossing (p 0.32+) plays over a fully settled constellation —
        // the two motions never share a frame
        const t = arrive(p, 0.02 + i * 0.055, 0.1);
        const eased = smooth(t);
        if (reduced) {
          if (lastEase[i] !== t) {
            lastEase[i] = t;
            el.style.opacity = t > 0 ? "1" : "0";
          }
          return;
        }
        // settled cards (eased pinned at 0 or 1) write nothing new
        if (eased === lastEase[i]) return;
        lastEase[i] = eased;
        // page-turn arrival settles flat as the diorama takes over
        const ry = (1 - eased) * (i % 2 ? 24 : -24);
        el.style.opacity = eased.toFixed(3);
        el.style.transform =
          `perspective(800px) rotateY(${ry.toFixed(2)}deg) translate3d(0, ${((1 - eased) * 40).toFixed(1)}px, 0)`;
      });
    };

    scrollEngine.registerTrack("multiverse", { el: sec, onUpdate: update });
    return () => scrollEngine.unregisterTrack("multiverse");
  }, []);

  return (
    <section
      ref={secRef}
      id="multiverse"
      className="relative overflow-x-clip"
      aria-label={MULTIVERSE_TITLE}
    >
      {/* dark sky returns for the multiverse */}
      <div
        className="halftone absolute inset-0 opacity-20"
        style={{ ["--dot-color" as string]: "var(--sky-ink)", ["--dot-gap" as string]: "20px", ["--dot-size" as string]: "2px" }}
      />
      <div className="spray-glow absolute inset-0 opacity-25" style={{ filter: "blur(40px)" }} />

      <div className="relative px-6 pt-[14vh] md:px-[7vw]">
        <h2 className="t-display text-[clamp(2.6rem,9vw,7.5rem)] text-paper">
          {MULTIVERSE_TITLE.split(" ").map((w, wi, arr) => (
            <Fragment key={wi}>{wi === arr.length - 1 ? <span className="spray-text">{w}</span> : w}{" "}</Fragment>
          ))}
        </h2>
        <p className="caption-box caption-box--dark caption-tail mt-6 inline-block text-[clamp(0.85rem,1.6vw,1.05rem)]" style={{ ["--cap-tilt" as string]: "1.2deg" }}>
          {MULTIVERSE_NOTE}
        </p>
      </div>

      {/* the variant cards — full DioramaBox dioramas, same life as the
          universe boxes; each in its dimension's ink. The air is split
          with intent: sky ABOVE the cards (the verse opening — the
          rider swings in against it) and a short runway below, enough
          for his crossing, never a dead void before the letter. */}
      <div className="relative mt-[24vh] grid grid-cols-1 gap-14 px-6 pb-[46vh] md:grid-cols-2 md:gap-12 md:px-[7vw]">
        {VARIANTS.map((v, i) => {
          const col = COLOR_VAR[v.color];
          return (
            <div
              key={v.dimension}
              ref={(el) => { cardRefs.current[i] = el; }}
              className={`relative ${i % 2 ? "md:mt-[8vh]" : ""}`}
              style={{ opacity: 0 }}
            >
              <DioramaBox index={i + 4} interactive={false} className="w-full">
                {/* bg plane: the dimension's ink field + halftone light +
                    hatch shadow (the film's shading rules) */}
                <div
                  className="p3d p3d--bg"
                  style={{ ["--panel-bg" as string]: "#151221", ["--panel-edge" as string]: col.c }}
                  aria-hidden="true"
                >
                  <div
                    className="halftone absolute inset-0 opacity-40"
                    style={{ ["--dot-color" as string]: col.c, ["--dot-gap" as string]: "8px" }}
                  />
                  <div
                    className="hatch absolute inset-x-0 bottom-0 h-[34%] opacity-60"
                    style={{ ["--hatch-color" as string]: "rgba(242,236,223,0.07)" }}
                  />
                  {/* the dimension's portal ring — each variant's own mark */}
                  {!MOBILE3D && (
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" aria-hidden="true">
                      <g stroke={col.c} strokeOpacity="0.35" strokeWidth="0.4">
                        <circle cx="85" cy="14" r="10" />
                        <circle cx="85" cy="14" r="6" strokeDasharray="2 2" />
                        <path d="M85 2 L85 6 M85 22 L85 26 M73 14 L77 14 M93 14 L97 14" strokeWidth="0.5" />
                      </g>
                    </svg>
                  )}
                </div>
                {/* content plane */}
                <div className="p3d p3d--content p-6 md:p-8">
                  <p className="t-letter dim-flicker text-[13px] tracking-widest" style={{ color: col.c }}>
                    {v.dimension}
                  </p>
                  <h3 className="t-display mt-3 text-[clamp(1.8rem,4vw,2.8rem)] text-paper">
                    {v.title}
                  </h3>
                  <p className="t-body mt-3 max-w-[42ch] text-[15px] leading-relaxed text-body">
                    {v.text}
                  </p>
                </div>
                {/* pop plane: the CANON! sticker breaking the frame */}
                <div className="p3d p3d--pop" aria-hidden="true">
                  <span
                    className="sticker"
                    style={{ ["--sticker-rot" as string]: `${i % 2 ? -6 : 5}deg`, right: "-0.6rem", top: "1.1rem", background: col.c, color: "#0a090e" }}
                  >
                    {CANON_WORD}
                  </span>
                </div>
                {/* corner variant number, comic-cover style */}
                <span
                  className="t-note absolute -top-3 -right-3 rotate-6 text-[13px]"
                  style={{ color: col.c }}
                  aria-hidden="true"
                >
                  {VARIANT_NO_WORD} {String(i + 1).padStart(2, "0")}
                </span>
              </DioramaBox>
            </div>
          );
        })}
      </div>

      <p className="t-note absolute right-[8%] top-[26%] hidden rotate-6 text-[15px] text-warning/80 md:block">
        {MULTIVERSE_ANNOTATION}
      </p>
    </section>
  );
}
