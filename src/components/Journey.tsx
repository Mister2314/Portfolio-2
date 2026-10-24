// ============================================================================
// JOURNEY — the education story as a sketchbook comic strip.
// A paper page: ink panels in sequence, now each a LIVING 3D diorama on the
// shared DioramaBox core (same physics as the universe boxes). Arrivals
// are pure scrub envelopes. READABILITY CONTRACT: panel text sits on solid
// paper with 16px+ ink (#0a090e on #f2ecdf ≈ 15:1), the halftone grain is
// dialed down behind text, and the letterer's hand only carries short
// margin notes — never body copy.
// ============================================================================

import { Fragment, useEffect, useRef } from "react";
import { scrollEngine } from "../engine/scroll";
import { GhostNumeral } from "./GhostNumeral";
import { arrive, smooth } from "../engine/scrub";
import { DioramaBox } from "./DioramaBox";
import {
  JOURNEY_TITLE, JOURNEY_NOTE, JOURNEY_BEATS,
  SFX_NOW, SFX_ZIP, SFX_STEP,
} from "../content/story";

/* MOBILE PERF: shadow plane desktop-only (same as universe boxes) */
const MOBILE3D = typeof window !== "undefined" &&
  window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;

export function Journey() {
  const secRef = useRef<HTMLElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return;
    const reduced = scrollEngine.reducedMotion;
    // last eased arrival per panel: settled panels skip identical writes
    const lastEase: number[] = [];

    const update = (p: number) => {
      panelRefs.current.forEach((el, i) => {
        if (!el) return;
        const t = arrive(p, 0.08 + i * 0.13, 0.13);
        const eased = smooth(t);
        if (reduced) {
          if (lastEase[i] !== t) {
            lastEase[i] = t;
            el.style.opacity = t > 0 ? "1" : "0";
          }
          return;
        }
        // settled panels (eased pinned at 0 or 1) write nothing new
        if (eased === lastEase[i]) return;
        lastEase[i] = eased;
        // each panel stamps in from its own side with a wonky settle
        const dx = (1 - eased) * (i % 2 ? 46 : -46);
        const rot = (1 - eased) * (i % 2 ? 3.5 : -4.5);
        el.style.opacity = eased.toFixed(3);
        el.style.transform = `translate3d(${dx.toFixed(1)}px, ${((1 - eased) * 30).toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
      });
    };

    scrollEngine.registerTrack("journey", { el: sec, onUpdate: update });
    return () => scrollEngine.unregisterTrack("journey");
  }, []);

  return (
    <section
      ref={secRef}
      id="journey"
      className="paper-page relative overflow-x-clip"
      style={{ minHeight: "150vh" }}
      aria-label={JOURNEY_TITLE}
    >
      <GhostNumeral sectionId="journey" label="03" side="left" />
      {/* paper grain — kept OFF the text panels themselves */}
      <div
        className="halftone absolute inset-0 opacity-40"
        style={{ ["--dot-color" as string]: "rgba(10 9 14 / 0.10)", ["--dot-gap" as string]: "14px" }}
      />
      <div
        className="hatch absolute inset-0 opacity-30"
        style={{ ["--hatch-color" as string]: "rgba(10 9 14 / 0.04)" }}
      />

      {/* heading: ink on paper, accent word carries the yellow swipe */}
      <div className="relative px-6 pt-[14vh] md:px-[7vw]">
        <h2 className="t-display text-[clamp(2.6rem,9vw,7.5rem)]" style={{ color: "var(--color-ink)" }}>
          {JOURNEY_TITLE.split(" ").map((w, wi, arr) => (
            <Fragment key={wi}>{wi === arr.length - 1 ? (
              <span className="accent-word" style={{ ["--accent-color" as string]: "var(--color-warning)", ["--accent-draw" as string]: 1 }}>{w}</span>
            ) : w}{" "}</Fragment>
          ))}
        </h2>
        <p className="caption-box mt-6 inline-block text-[clamp(0.85rem,1.6vw,1.05rem)]" style={{ ["--cap-tilt" as string]: "-1.4deg" }}>
          {JOURNEY_NOTE}
        </p>
      </div>

      {/* the strip: alternating 3D diorama panels.
          READABILITY: solid #f2ecdf paper plane at content depth, ink text
          at 16px+/15:1, grain only at the bg plane where it can't fight
          the letters. */}
      <div className="relative mt-[10vh] flex flex-col gap-16 px-6 pb-[16vh] md:gap-24 md:px-[7vw] md:pb-[12vh]">
        {JOURNEY_BEATS.map((beat, i) => (
          <div
            key={beat.title}
            ref={(el) => { panelRefs.current[i] = el; }}
            className={`relative md:max-w-[46%] ${i % 2 ? "md:ml-auto" : ""}`}
            style={{ opacity: 0 }}
          >
            <DioramaBox index={i} interactive={false} className="w-full">
              {/* bg plane: paper field with a whisper of grain (bg depth) */}
              <div
                className="p3d p3d--bg"
                style={{ ["--panel-bg" as string]: "#f2ecdf", ["--panel-edge" as string]: "var(--color-ink)" }}
                aria-hidden="true"
              >
                <div
                  className="halftone absolute inset-0 opacity-30"
                  style={{ ["--dot-color" as string]: "rgba(10 9 14 / 0.07)", ["--dot-gap" as string]: "12px" }}
                />
                {/* corner speed-lines: sketchbook energy, away from text */}
                {!MOBILE3D && (
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" aria-hidden="true">
                    <g stroke="rgba(10 9 14 / 0.16)" strokeWidth="0.5">
                      <path d={i % 2 ? "M100 8 L60 12 M100 18 L56 24 M100 28 L52 36" : "M0 8 L40 12 M0 18 L44 24 M0 28 L48 36"} />
                    </g>
                  </svg>
                )}
              </div>
              {/* content plane: ALL the reading, solid ground, big type */}
              <div className="p3d p3d--content p-6 md:p-7" style={{ background: "none" }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="issue-stamp" style={{ position: "relative", top: 0, left: 0, display: "inline-block" }}>
                      {beat.year}
                    </p>
                    <h3 className="t-display mt-3 text-[clamp(1.6rem,3.6vw,2.6rem)]" style={{ color: "var(--color-ink)" }}>
                      {beat.title}
                    </h3>
                  </div>
                  {/* beat number chip — page furniture, never over text */}
                  <span
                    className="sticker shrink-0"
                    style={{ ["--sticker-rot" as string]: `${i % 2 ? 5 : -6}deg`, position: "relative", top: 0, right: 0, fontSize: "0.72rem", background: "var(--color-warning)" }}
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}/{String(JOURNEY_BEATS.length).padStart(2, "0")}
                  </span>
                </div>
                <p className="t-body mt-4 text-[16.5px] leading-[1.65]" style={{ color: "rgba(10,9,14,0.92)" }}>
                  {beat.text}
                </p>
                <p className="t-note t-note-u mt-4 text-[14.5px]" style={{ color: "var(--color-note-ink)", rotate: `${i % 2 ? 1.5 : -1.5}deg` }}>
                  {beat.note}
                </p>
              </div>
              {/* pop plane: the panel's SFX tick (last beat gets NOW!) */}
              <div className="p3d p3d--pop" aria-hidden="true">
                <span
                  className="sfx-word"
                  style={{
                    top: "-0.85em",
                    [i % 2 ? "left" : "right"]: "-0.6rem",
                    color: i === JOURNEY_BEATS.length - 1 ? "var(--color-magenta)" : "var(--color-royal)",
                    fontSize: "clamp(1.3rem,2.6vw,1.9rem)",
                  }}
                >
                  {i === JOURNEY_BEATS.length - 1 ? SFX_NOW : i % 2 ? SFX_ZIP : SFX_STEP}
                </span>
              </div>
            </DioramaBox>

            {/* ink stamp dot on the spine */}
            <span
              className="absolute hidden h-4 w-4 rounded-full md:block"
              style={{
                background: "var(--color-ink)",
                boxShadow: "2px 2px 0 rgba(255,46,136,0.6)",
                top: "8px",
                [i % 2 ? "left" : "right"]: "-2.4rem",
              }}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>

      {/* the spine thread */}
      <svg
        className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-[2px] md:block"
        aria-hidden="true"
      >
        <line x1="1" y1="0" x2="1" y2="100%" stroke="rgba(10,9,14,0.35)" strokeWidth="2" className="thread-line" />
      </svg>
    </section>
  );
}
