// ============================================================================
// APP — KHAYAL VERSE. One continuous scroll story:
//   hero film (pinned scrubbed video + caption text)
//   → THE UNIVERSE (comic-strip run of chapter panels)
//   → THE JOURNEY (sketchbook education strip, paper page)
//   → THE MULTIVERSE (variant-cover skill cards)
//   → CONTACT (the comic letter + THWIP buttons)
// With surprise cameos threading through the transitions. The film's
// final frame scrims to the same ink as the universe bg: zero cuts.
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import { scrollEngine } from "./engine/scroll";
import { Nav } from "./components/Nav";
import { CinematicHero } from "./components/CinematicHero";
import { Universe } from "./components/Universe";
import { Journey } from "./components/Journey";
import { Multiverse } from "./components/Multiverse";
import { Contact } from "./components/Contact";
import { ChapterOverlay } from "./components/ChapterOverlay";
import { Cameos } from "./components/Cameos";
import { ScrollTop } from "./components/ScrollTop";
import { WebJump } from "./components/WebJump";
import { ProgressBar } from "./components/ProgressBar";
import { jumpTo } from "./components/WebJump";
import { type Chapter } from "./content/story";

/** the acts, in scroll order — keys 1–5 and the web-jump chips share it */
const PAGE_IDS = ["hero", "universe", "journey", "multiverse", "contact"];

/**
 * Keyboard command layer: 1–5 throw webs to the matching page (the same
 * visual as the nav chips), T returns to the top. Skipped entirely while
 * the visitor types in the contact letter, and for modifier combos so
 * OS/IME shortcuts never fire webs.
 */
function useKeyboardPages() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (
        t instanceof HTMLElement &&
        (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)
      )
        return;
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < PAGE_IDS.length) {
        const chip = document.querySelectorAll<HTMLElement>("[data-nav-chip]")[idx];
        jumpTo(PAGE_IDS[idx], chip ?? document.body);
        return;
      }
      if (e.key === "t" || e.key === "T") {
        scrollEngine.scrollTo(0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

/**
 * View Transitions: a 0 KB progressive layer over the overlay's own FLIP.
 * The state flip is wrapped so the browser crossfades the frame boundary
 * (Chrome/Edge 111+, Safari 18, Firefox 144+); everywhere else, and under
 * reduced motion, the plain setState path runs and the FLIP stays primary.
 */
function withViewTransition(update: () => void) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || typeof document.startViewTransition !== "function") {
    update();
    return;
  }
  document.startViewTransition(update);
}

export default function App() {
  const [openChapter, setOpenChapter] = useState<Chapter | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    scrollEngine.init();
    return () => scrollEngine.stop();
  }, []);

  useKeyboardPages();

  const handleOpen = useCallback((ch: Chapter, rect: DOMRect) => {
    withViewTransition(() => {
      setOriginRect(rect);
      setOpenChapter(ch);
    });
  }, []);

  const handleClose = useCallback(() => {
    withViewTransition(() => {
      setOpenChapter(null);
    });
  }, []);

  return (
    <>
      {/* fixed chrome lives OUTSIDE #top: the web-jump page tug writes a
          brief transform on #top, and a transformed ancestor would break
          position:fixed for everything inside it */}
      <Nav />
      {/* the film leader: the reading-progress strip along the very top */}
      <ProgressBar />
      {/* skip link: first focusable element, lands past the film */}
      <a
        href="#universe"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          const sec = document.getElementById("universe");
          if (sec) {
            scrollEngine.scrollTo(sec);
            sec.focus();
          }
        }}
      >
        skip to the story
      </a>
      {/* the thrown web strands (one reusable line, pressed into action
          by the nav chips) and the comic TOP stamp */}
      <WebJump />
      <ScrollTop />

      {/* the scrollable story — the tug pull target */}
      <div id="top" className="relative">
        {/* the film */}
        <div className="relative z-10">
          <CinematicHero />
        </div>

        {/* the world after the film: all sections share the ink ground */}
        <div className="relative z-30 bg-ink">
          <Universe onOpen={handleOpen} />
          <Journey />
          <Multiverse />
          <Contact />
        </div>
      </div>

      {/* surprise moments */}
      <Cameos />

      {/* chapter overlay */}
      <ChapterOverlay
        chapter={openChapter}
        originRect={originRect}
        onClose={handleClose}
      />
    </>
  );
}
