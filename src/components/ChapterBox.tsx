// ============================================================================
// CHAPTER BOX — one universe chapter, built on the shared DioramaBox
// core (same living physics as every other panel on the site).
// This file only owns the SKIN: the plane ladder content per chapter:
//   shadow (-50px, desktop) · bg (-40px, halftone light + edge + art)
//   content (0px, type + CTA) · pop (+20px, sticker) · sfx (+50px, the
//   frame-breaking word)
// Rules: halftone = light/tone field (not wallpaper); hatch = shadow;
// SFX words live IN the environment and break the panel border.
// ============================================================================

import { DioramaBox } from "./DioramaBox";
import type { Chapter } from "../content/story";
import {
  CHAPTER_NO_WORD, CH_CTA, CH_STICKER, CH_SFX, CH_TITLE_LINES,
} from "../content/story";

/* MOBILE PERF: fewer 3D planes (shadow plane + per-chapter art marks are
   desktop-only) — keeps phone GPUs comfortable while keeping the depth. */
const MOBILE3D = typeof window !== "undefined" &&
  window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;

export function ChapterBox({
  chapter,
  index,
  onOpen,
}: {
  chapter: Chapter;
  index: number;
  onOpen: (ch: Chapter, rect: DOMRect) => void;
}) {
  return (
    <DioramaBox
      index={index}
      tilt={chapter.tilt}
      as="button"
      activationAria={`${chapter.label}: ${chapter.teaser}`}
      onActivate={(rect) => onOpen(chapter, rect)}
    >
      {renderSkin(chapter, index)}
    </DioramaBox>
  );
}

/* ---------------------------------------------------------------------------
   CHAPTER SKINS — each panel is a 3D diorama with the shared plane ladder.
   Chapter identity lives in the bg art + tokens; the ladder is identical
   for perf and cohesion.
   ------------------------------------------------------------------------ */
function renderSkin(chapter: Chapter, index: number) {
  switch (chapter.style) {
    case "panel": // ORIGIN — classic comic panel: halftone light + hatch shadow
      return (
        <>
          {!MOBILE3D && <div className="p3d p3d--shadow" aria-hidden="true" />}
          <div
            className="p3d p3d--bg"
            style={{ ["--panel-bg" as string]: "#1b1725", ["--panel-edge" as string]: "#f2ecdf" }}
            aria-hidden="true"
          >
            <div
              className="halftone absolute inset-0 opacity-45"
              style={{ ["--dot-color" as string]: "rgba(255,214,10,0.20)", ["--dot-gap" as string]: "8px", ["--dot-size" as string]: "1.6px" }}
            />
            <div
              className="hatch absolute inset-x-0 bottom-0 h-[38%] opacity-70"
              style={{ ["--hatch-color" as string]: "rgba(242,236,223,0.10)" }}
            />
            {!MOBILE3D && (
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" aria-hidden="true">
                <g stroke="rgba(242,236,223,0.20)" strokeWidth="0.5">
                  <path d="M0 6 L100 22 M0 14 L100 34 M0 24 L100 46" />
                </g>
              </svg>
            )}
          </div>
          <div className="p3d p3d--content p-6 md:p-7">
            <p className="issue-stamp" style={{ position: "relative", top: 0, left: 0, display: "inline-block" }}>
              {CHAPTER_NO_WORD}{String(index + 1).padStart(2, "0")}
            </p>
            <p className="t-letter text-[13px] text-warning">{chapter.note}</p>
            <h3 className="t-display mt-2 text-[clamp(2.1rem,4.6vw,3rem)] text-paper chroma-soft">
              {chapter.label}
            </h3>
            <p className="t-body mt-2 text-sm text-body">{chapter.teaser}</p>
            <div className="mt-5">
              <span className="thwip-btn thwip-btn--yellow text-[12px] px-4 py-2" style={{ fontSize: "12px" }}>
                {CH_CTA[chapter.id]}
              </span>
            </div>
          </div>
          <div className="p3d p3d--pop" aria-hidden="true">
            <span className="sticker" style={{ ["--sticker-rot" as string]: "7deg", right: "-0.7rem", top: "1.4rem" }}>
              {CH_STICKER.origin}
            </span>
          </div>
          <div className="p3d p3d--sfx" aria-hidden="true">
            <span className="sfx-word boil">{CH_SFX.origin}</span>
          </div>
        </>
      );

    case "neon": // LUNORA — spray stencil, magenta/cyan gradient energy
      return (
        <>
          {!MOBILE3D && <div className="p3d p3d--shadow" aria-hidden="true" />}
          <div
            className="p3d p3d--bg"
            style={{ ["--panel-bg" as string]: "#14101d", ["--panel-edge" as string]: "var(--color-magenta)" }}
            aria-hidden="true"
          >
            <div className="spray-glow absolute inset-0 opacity-90" />
            <div
              className="halftone absolute inset-0 opacity-40"
              style={{ ["--dot-color" as string]: "rgba(0,229,255,0.34)", ["--dot-gap" as string]: "9px" }}
            />
            {!MOBILE3D && (
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" aria-hidden="true">
                <g stroke="rgba(0,229,255,0.4)" strokeWidth="0.4" fill="none">
                  <ellipse cx="82" cy="20" rx="16" ry="9" transform="rotate(-18 82 20)" />
                  <ellipse cx="82" cy="20" rx="9" ry="5" transform="rotate(-18 82 20)" />
                  <circle cx="82" cy="20" r="3.2" fill="rgba(0,229,255,0.5)" stroke="none" />
                </g>
                <g stroke="rgba(255,46,136,0.35)" strokeWidth="0.35">
                  <path d="M-4 84 Q 20 74 40 84 T 104 78" strokeDasharray="2 3" />
                </g>
              </svg>
            )}
          </div>
          <div className="p3d p3d--content p-6 md:p-7">
            <p className="t-letter text-[13px] text-cyan-el">{chapter.note}</p>
            <h3 className="t-display spray-text mt-2 text-[clamp(2.1rem,4.6vw,3rem)]">{chapter.label}</h3>
            <p className="t-body mt-2 text-sm text-body">{chapter.teaser}</p>
            <div className="mt-5">
              <span className="thwip-btn thwip-btn--cyan text-[12px] px-4 py-2" style={{ fontSize: "12px" }}>
                {CH_CTA.lunora}
              </span>
            </div>
          </div>
          <div className="p3d p3d--pop" aria-hidden="true">
            <span className="sticker sticker--cyan" style={{ ["--sticker-rot" as string]: "-6deg", right: "-0.8rem", top: "1.2rem" }}>
              {CH_STICKER.lunora}
            </span>
          </div>
          <div className="p3d p3d--sfx" aria-hidden="true">
            <span className="sfx-word boil" style={{ color: "var(--color-cyan-el)", top: "-1em" }}>
              {CH_SFX.lunora}
            </span>
          </div>
        </>
      );

    case "glitch": // SMART BOT — RGB slices + scanline flicker
      return (
        <>
          {!MOBILE3D && <div className="p3d p3d--shadow" aria-hidden="true" />}
          <div
            className={`p3d p3d--bg ${MOBILE3D ? "" : "scanlines"}`}
            style={{ ["--panel-bg" as string]: "#0b0d12", ["--panel-edge" as string]: "var(--color-cyan-el)" }}
            aria-hidden="true"
          >
            <div
              className="halftone absolute inset-0 opacity-30"
              style={{ ["--dot-color" as string]: "rgba(0,229,255,0.28)", ["--dot-gap" as string]: "7px" }}
            />
            {!MOBILE3D && (
              <div className="absolute inset-0" aria-hidden="true">
                <div className="absolute left-[8%] top-[18%] h-[3px] w-[46%] bg-magenta/70" style={{ transform: "translateX(6px)" }} />
                <div className="absolute left-[14%] top-[22%] h-[2px] w-[38%] bg-cyan-el/60" style={{ transform: "translateX(-8px)" }} />
                <div className="absolute left-[10%] top-[78%] h-[2px] w-[52%] bg-warning/40" />
                <div className="absolute right-[10%] top-[62%] h-[10px] w-[26%] border-y border-magenta/40" />
              </div>
            )}
          </div>
          <div className="p3d p3d--content p-6 md:p-7">
            <p className="t-letter text-[13px] text-magenta-hot">{chapter.note}</p>
            <h3 className="t-display chroma mt-2 text-[clamp(2.1rem,4.6vw,3rem)] text-paper">
              {CH_TITLE_LINES.smartbot[0]}<br />{CH_TITLE_LINES.smartbot[1]}
            </h3>
            <p className="t-body mt-2 text-sm text-body">{chapter.teaser}</p>
            <div className="mt-5">
              <span className="thwip-btn thwip-btn--magenta text-[12px] px-4 py-2" style={{ fontSize: "12px" }}>
                {CH_CTA.smartbot}
              </span>
            </div>
          </div>
          <div className="p3d p3d--pop" aria-hidden="true">
            <span className="sticker sticker--magenta" style={{ ["--sticker-rot" as string]: "5deg", right: "-0.7rem", top: "1.5rem" }}>
              {CH_STICKER.smartbot}
            </span>
          </div>
          <div className="p3d p3d--sfx" aria-hidden="true">
            <span className="sfx-word boil" style={{ color: "var(--color-magenta)", top: "-1.1em" }}>
              {CH_SFX.smartbot}
            </span>
          </div>
        </>
      );

    case "web": // WHAT'S NEXT — web-wrapped panel + spider emblem
      return (
        <>
          {!MOBILE3D && <div className="p3d p3d--shadow" aria-hidden="true" />}
          <div
            className="p3d p3d--bg"
            style={{ ["--panel-bg" as string]: "#161320", ["--panel-edge" as string]: "#f2ecdf" }}
            aria-hidden="true"
          >
            <div
              className="halftone absolute inset-0 opacity-35"
              style={{ ["--dot-color" as string]: "rgba(255,214,10,0.16)", ["--dot-gap" as string]: "10px" }}
            />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
              <g stroke="rgba(242,236,223,0.5)" strokeWidth="0.5" fill="none">
                <path d="M0,0 L38,26 M0,0 L26,38 M0,0 L14,42 M0,0 L42,14" />
                <path d="M8,13 Q13,8 18,10 M12,22 Q19,12 26,14 M16,31 Q25,17 34,20" />
                <path d="M13,8 Q8,13 10,18 M22,12 Q12,19 14,26 M31,16 Q17,25 20,34" />
              </g>
            </svg>
          </div>
          <div className="p3d p3d--content p-6 md:p-7">
            <p className="t-letter text-[13px] text-warning">{chapter.note}</p>
            <h3 className="t-display mt-2 text-[clamp(2.1rem,4.6vw,3rem)] text-paper">
              {CH_TITLE_LINES.next[0]}<br />{CH_TITLE_LINES.next[1]}
            </h3>
            <svg className="mt-2 h-9 w-9 text-warning boil" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <circle cx="12" cy="10" r="3" />
              <path d="M12 13 L12 16 M12 16 L8 21 M12 16 L16 21 M12 16 L4 17 M12 16 L20 17 M12 16 L5 13 M12 16 L19 13 M12 16 L9 9 M12 16 L15 9" strokeLinecap="round" />
            </svg>
            <p className="t-body mt-2 text-sm text-body">{chapter.teaser}</p>
            <div className="mt-5">
              <span className="thwip-btn text-[12px] px-4 py-2" style={{ fontSize: "12px" }}>
                {CH_CTA.next}
              </span>
            </div>
          </div>
          <div className="p3d p3d--pop" aria-hidden="true">
            <span className="sticker sticker--yellow" style={{ ["--sticker-rot" as string]: "-8deg", right: "-0.6rem", top: "1.6rem" }}>
              {CH_STICKER.next}
            </span>
          </div>
          <div className="p3d p3d--sfx" aria-hidden="true">
            <span className="sfx-word boil" style={{ top: "-0.8em", right: "-1rem" }}>
              {CH_SFX.next}
            </span>
          </div>
        </>
      );
  }
}
