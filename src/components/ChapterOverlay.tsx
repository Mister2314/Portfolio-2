// ============================================================================
// CHAPTER OVERLAY — the FULL ISSUE SPREAD.
// Press a universe box and the whole screen becomes an open comic book:
// two ink pages facing each other across a paper gutter.
//   LEFT PAGE  — the splash: issue number, huge chapter title in the
//                chapter's OWN ink, halftone burst rays, the CH stamp,
//                and the chapter's signature SFX word breaking the frame.
//   RIGHT PAGE — the lettering: kicker caption, headline, story lines as
//                alternating caption/ink paragraphs, the closing margin
//                note, the THWIP link, the issue credits.
// The spread grows from the pressed box via the same FLIP engine (box
// rect → full-bleed spring), closes back to it, Escape works, scroll is
// locked, focus moves into the panel (and back to the pressed box on
// close). Reduced-motion: instant open.
// ============================================================================

import { useEffect, useRef } from "react";
import { scrollEngine } from "../engine/scroll";
import {
  CHAPTER_CONTENT, ARIA_CLOSE, CLOSE_WORD, CHAPTERS,
  MASTHEAD, ISSUE_WORD, OF_WORD, PAGE_COUNT, COUNTER_WORD,
  CH_SFX, OVERLAY_SFX2, OVERLAY_TURN, CREDITS_ROLE, CREDITS_LINE,
} from "../content/story";
import { type Chapter } from "../content/story";

/** each chapter owns one print ink — its splash + furniture dress in it */
const INK: Record<Chapter["id"], { c: string; glow: string }> = {
  origin: { c: "var(--color-warning)", glow: "rgba(255,214,10,0.55)" },
  lunora: { c: "var(--color-magenta)", glow: "rgba(255,46,136,0.5)" },
  smartbot: { c: "var(--color-cyan-el)", glow: "rgba(0,229,255,0.5)" },
  next: { c: "var(--color-paper)", glow: "rgba(242,236,223,0.4)" },
};

export function ChapterOverlay({
  chapter,
  originRect,
  onClose,
}: {
  chapter: Chapter | null;
  originRect: DOMRect | null;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!chapter || !originRect) return;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    const reduced = scrollEngine.reducedMotion;
    scrollEngine.stopScroll(); // lock the page behind
    document.body.dataset.overlay = "1"; // boxes pause physics + pointer brush

    // focus moves INTO the spread and back to the pressed box on close
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLButtonElement>("[data-close]")?.focus();
    });

    // ---- FLIP: start at the box's rect ----
    // the panel is FRAMED (inset ~2.5vw of night around it), so its open
    // size is viewport minus the rim — measure once, interpolate between
    // the box's rect and that, never against the raw viewport.
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = Math.min(44, Math.max(8, vw * 0.025));
    const targetW = vw - pad * 2;
    const targetH = vh - pad * 2;
    const startX = originRect.left + originRect.width / 2 - vw / 2;
    const startY = originRect.top + originRect.height / 2 - vh / 2;

    let open = 0;
    let closing = false;

    // target open state as {x,y,scaleX,scaleY}
    const animateTo = (t: number, dur: number, ease: (k: number) => number, done?: () => void) => {
      const from = open;
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / dur);
        open = from + (t - from) * ease(k);
        // scale interpolates between the box's size fraction and the
        // panel's OWN open size (vw/vh would overshoot the framed rect).
        const sx = (originRect.width + (targetW - originRect.width) * open) / targetW;
        const sy = (originRect.height + (targetH - originRect.height) * open) / targetH;
        panel.style.transform = `translate3d(${startX * (1 - open)}px, ${startY * (1 - open)}px, 0) rotate(${chapter.tilt * (1 - open)}deg) scale(${sx}, ${sy})`;
        panel.style.opacity = String(0.5 + open * 0.5);
        panel.style.borderRadius = `${18 * (1 - open)}px`;
        backdrop.style.opacity = String(open * 0.94);
        if (k < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          done?.();
        }
      };
      rafRef.current = requestAnimationFrame(step);
    };

    const easeOutExpo = (k: number) => (k === 1 ? 1 : 1 - Math.pow(2, -10 * k));
    const easeInExpo = (k: number) => (k === 0 ? 0 : Math.pow(2, 10 * k - 10));

    if (reduced) {
      open = 1;
      panel.style.transform = "none";
      panel.style.opacity = "1";
      backdrop.style.opacity = "0.94";
    } else {
      animateTo(1, 620, easeOutExpo);
    }

    // content fades in after the spread mostly lands
    const content = panel.querySelector(".overlay-content");
    if (content instanceof HTMLElement) {
      content.animate(
        reduced
          ? [{ opacity: 1 }]
          : [
              { opacity: 0, transform: "translate3d(0,36px,0)" },
              { opacity: 1, transform: "translate3d(0,0,0)" },
            ],
        { duration: reduced ? 1 : 560, delay: reduced ? 0 : 240, fill: "forwards", easing: "cubic-bezier(0.16,1,0.3,1)" }
      ).play();
    }

    // ---- close ----
    const close = () => {
      if (closing) return;
      closing = true;
      opener?.focus?.();
      if (reduced) {
        finishClose();
        return;
      }
      animateTo(0, 420, easeInExpo, () => finishClose());
    };
    const finishClose = () => {
      scrollEngine.startScroll();
      onClose();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      // focus trap: Tab cycles inside the spread — the dialog is modal
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    backdrop.addEventListener("click", close);
    // the stamp lives OUTSIDE the panel (sibling of backdrop) — search the
    // whole dialog, not just the transformed panel
    const closeBtn = dialogRef.current?.querySelector("[data-close]");
    closeBtn?.addEventListener("click", close);

    return () => {
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(rafRef.current);
      delete document.body.dataset.overlay;
      // if unmounted mid-animation (route change etc), make sure scroll resumes
      scrollEngine.startScroll();
    };
  }, [chapter, originRect, onClose]);

  if (!chapter) return null;
  const content = CHAPTER_CONTENT[chapter.id];
  const ink = INK[chapter.id];
  const issueNo = CHAPTERS.findIndex((c) => c.id === chapter.id) + 1;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={content.title}
    >
      {/* the night behind the open book */}
      <div
        ref={backdropRef}
        className="absolute inset-0 halftone"
        style={{
          opacity: 0,
          background: "#07060a",
          ["--dot-color" as string]: "rgba(242,236,223,0.05)",
          ["--dot-gap" as string]: "10px",
        }}
      />

      {/* THE OPEN SPREAD — a book lying on the dark table: a rim of night
          frames the pages on every side */}
      <div
        ref={panelRef}
        className="misreg absolute origin-center overflow-y-auto"
        style={{
          opacity: 0,
          background: "#f2ecdf",
          color: "#0a090e",
          inset: "clamp(8px, 2.5vw, 44px)",
          boxShadow: "0 34px 90px rgba(0,0,0,0.6)",
        }}
      >
        <div
          className="overlay-content relative mx-auto flex min-h-full w-full max-w-6xl items-stretch justify-center px-4 py-10 md:px-8 md:py-14"
          style={{ opacity: 0 }}
        >
          {/* the two facing pages, sagging slightly like a real open book */}
          <div
            className="ink-frame grid w-full grid-cols-1 md:grid-cols-[5fr_2px_6fr]"
            style={{ borderColor: "#0a090e", background: "#0a090e", outlineColor: "rgba(10,9,14,0.9)" }}
          >

            {/* ==================== LEFT PAGE — THE SPLASH ==================== */}
            <div
              className="relative p-6 md:p-10"
              style={{
                background: `radial-gradient(circle at 50% 42%, ${ink.glow}, transparent 68%), #0a090e`,
                minHeight: "42vh",
              }}
            >
              {/* halftone light on the splash, the film's tone field */}
              <div
                className="halftone absolute inset-0 opacity-30"
                style={{ ["--dot-color" as string]: "rgba(242,236,223,0.5)", ["--dot-gap" as string]: "9px", ["--dot-size" as string]: "1.5px" }}
              />
              {/* burst rays from the title — classic comic splash energy */}
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <g stroke={ink.c} strokeOpacity="0.3" strokeWidth="0.35" fill="none">
                  {Array.from({ length: 24 }, (_, i) => {
                    const a = (i / 24) * Math.PI * 2;
                    return (
                      <line
                        key={i}
                        x1={50 + Math.cos(a) * 8}
                        y1={40 + Math.sin(a) * 8}
                        x2={50 + Math.cos(a) * 90}
                        y2={40 + Math.sin(a) * 90}
                      />
                    );
                  })}
                </g>
              </svg>

              <div className="relative flex h-full flex-col items-center justify-center gap-5 py-10 text-center">
                {/* the issue chip */}
                <p
                  className="issue-stamp relative"
                  style={{ position: "relative", top: 0, left: 0, background: ink.c, ["--sticker-rot" as string]: "-3deg" }}
                >
                  {MASTHEAD} · {ISSUE_WORD} #{String(issueNo).padStart(2, "0")}
                </p>

                {/* the huge chapter title, breaking the page in the chapter's ink */}
                <h3
                  className="t-display misreg relative text-[clamp(3rem,9vw,7rem)] leading-[0.92] text-paper"
                  style={{ textShadow: `4px 0 0 rgba(255,46,136,0.5), -4px 0 0 rgba(0,229,255,0.5)`, maxWidth: "12ch" }}
                >
                  {content.title}
                </h3>

                {/* the chapter's signature onomatopoeia, off the frame */}
                <p
                  className="sfx-word absolute"
                  style={{ top: "0.5rem", right: "-0.8rem", color: ink.c, fontSize: "clamp(2.2rem,6vw,4.2rem)", rotate: "10deg", transform: "translateZ(0)" }}
                  aria-hidden="true"
                >
                  <span className="boil">{CH_SFX[chapter.id]}</span>
                </p>
                <p
                  className="sfx-word absolute"
                  style={{ bottom: "1rem", left: "-0.8rem", color: "var(--color-magenta)", fontSize: "clamp(1.6rem,4vw,3rem)", rotate: "-14deg" }}
                  aria-hidden="true"
                >
                  <span className="boil">{OVERLAY_SFX2}</span>
                </p>
              </div>
            </div>

            {/* ==================== THE GUTTER ==================== */}
            {/* the bind of the book: paper shadow fold + stitch ticks */}
            <div className="relative hidden w-full md:block" aria-hidden="true">
              <div
                className="absolute inset-y-0 left-1/2 w-8 -translate-x-1/2"
                style={{ background: "linear-gradient(90deg, rgba(10,9,14,0.28), transparent 55%, rgba(10,9,14,0.28))" }}
              />
              {Array.from({ length: 7 }, (_, i) => (
                <span
                  key={i}
                  className="absolute left-1/2 h-[2px] w-5 -translate-x-1/2"
                  style={{ top: `${8 + i * 14}%`, background: "rgba(10,9,14,0.55)", transform: `translateX(-50%) rotate(${i % 2 ? 12 : -12}deg)` }}
                />
              ))}
            </div>

            {/* mobile: the page fold — turn the page and keep reading */}
            <div className="relative flex items-center gap-3 py-2 md:hidden" aria-hidden="true">
              <span className="h-[2px] flex-1" style={{ background: "repeating-linear-gradient(90deg, rgba(10,9,14,0.6) 0 8px, transparent 8px 14px)" }} />
              <span className="t-letter rotate-[-2deg] text-[10px]" style={{ color: "rgba(10,9,14,0.65)" }}>{OVERLAY_TURN}</span>
              <span className="h-[2px] flex-1" style={{ background: "repeating-linear-gradient(90deg, rgba(10,9,14,0.6) 0 8px, transparent 8px 14px)" }} />
            </div>

            {/* ==================== RIGHT PAGE — THE LETTERING ==================== */}
            <div
              className="relative p-6 md:p-10"
              style={{
                background:
                  "radial-gradient(ellipse at 80% 8%, rgba(47,92,255,0.06), transparent 45%), #f2ecdf",
              }}
            >
              {/* the page's own faint print grain */}
              <div
                className="halftone absolute inset-0 opacity-40"
                style={{ ["--dot-color" as string]: "rgba(10,9,14,0.08)", ["--dot-gap" as string]: "12px" }}
              />

              <div className="relative flex flex-col gap-6">
                {/* kicker — the letterer's chip */}
                <p className="issue-stamp self-start" style={{ position: "relative", top: 0, left: 0 }}>
                  {content.kicker.toUpperCase()}
                </p>

                {/* the story — alternating ink + caption panels, comic rhythm */}
                <div className="flex flex-col gap-4">
                  {content.lines.map((line, i) =>
                    i % 3 === 2 ? (
                      // every third line is a NARRATION caption box — the
                      // film's yellow-box voice, so the page isn't all prose
                      <p
                        key={i}
                        className="caption-box misreg self-stretch text-[14px] md:text-[15px]"
                        style={{ ["--cap-tilt" as string]: `${i % 2 ? 0.8 : -0.8}deg` }}
                      >
                        {line}
                      </p>
                    ) : (
                      <p
                        key={i}
                        className="t-body max-w-[56ch] text-[16px] leading-[1.65] md:text-[17px]"
                        style={{ color: "rgba(10,9,14,0.92)" }}
                      >
                        {line}
                      </p>
                    )
                  )}
                </div>

                {/* the closing margin note — the letterer's own hand */}
                <p
                  className="t-note t-note-u self-end text-[15px] md:text-base"
                  style={{ color: "var(--color-note-ink)", rotate: "-1.5deg" }}
                >
                  {content.closing}
                </p>

                {/* the THWIP link — the chapter's door */}
                {content.linkHref && (
                  <div className="mt-2">
                    <a
                      href={content.linkHref}
                      target={content.linkHref.startsWith("http") ? "_blank" : undefined}
                      rel={content.linkHref.startsWith("http") ? "noreferrer" : undefined}
                      className="thwip-btn thwip-btn--magenta inline-block text-[13px] md:text-[15px]"
                    >
                      {content.linkLabel}
                    </a>
                  </div>
                )}

                {/* the issue credits — bottom of the page, like a real comic */}
                <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t-2 pt-4" style={{ borderColor: "rgba(10,9,14,0.85)" }}>
                  <p className="t-letter text-[12px] leading-relaxed" style={{ color: "rgba(10,9,14,0.75)" }}>
                    {CREDITS_ROLE} <strong>{MASTHEAD.split(" ")[0]}</strong><br />
                    {CREDITS_LINE}
                  </p>
                  <p className="t-display text-[13px]" style={{ color: "var(--color-note-ink)" }}>
                    {COUNTER_WORD} {issueNo} {OF_WORD} {String(PAGE_COUNT).padStart(2, "0")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* the CLOSE stamp — OUTSIDE the transformed panel (a transformed
          ancestor would corrupt position:fixed), pinned to the dialog's own
          corner: a hand-cancelled mail mark on the dark table */}
      <button
        data-close
        className="issue-stamp flex items-center gap-2 transition-transform hover:scale-110"
        aria-label={ARIA_CLOSE}
        style={{ ["--sticker-rot" as string]: "5deg", top: "1.1rem", right: "1.1rem", position: "absolute", fontSize: "0.85rem", width: "auto", height: "auto", padding: "0.55em 0.9em", background: "#ff2e88", color: "#0a090e" }}
      >
        <span className="t-letter">{CLOSE_WORD} ×</span>
      </button>
    </div>
  );
}
