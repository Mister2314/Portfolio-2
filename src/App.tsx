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
import { type Chapter } from "./content/story";

export default function App() {
  const [openChapter, setOpenChapter] = useState<Chapter | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    scrollEngine.init();
    return () => scrollEngine.stop();
  }, []);

  const handleOpen = useCallback((ch: Chapter, rect: DOMRect) => {
    setOriginRect(rect);
    setOpenChapter(ch);
  }, []);

  const handleClose = useCallback(() => {
    setOpenChapter(null);
  }, []);

  return (
    <>
      {/* fixed chrome lives OUTSIDE #top: the web-jump page tug writes a
          brief transform on #top, and a transformed ancestor would break
          position:fixed for everything inside it */}
      <Nav />
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
