// ============================================================================
// WEB-JUMP — the nav's section travel, thrown like a web.
// The nav's page chips (1–5) each fire a web strand at their target:
// a V-shaped throw (up from the chip, down onto the section's hero
// card), the strand snap-draws, the caught card plays a one-shot
// web-catch yank (CSS animation wins over the live DioramaBox writes
// for its 620ms run, then is cleared so the physics resumes), and a
// subtle page tug plays on #top while Lenis glides the scroll there.
// All of it is a PRESS response (like slam-in) — never scroll-bound —
// so it cannot leak on jumps or replays.
// Reduced-motion: no throw, no catch, no tug — the glide still runs.
// ============================================================================

import { scrollEngine } from "../engine/scroll";
import { clamp01 } from "../engine/scrub";

const THROW_MS = 780;

/** the strongest visual in each section — what the web grabs */
function anchorFor(id: string): HTMLElement | null {
  const sec = document.getElementById(id);
  if (!sec) return null;
  return sec.querySelector<HTMLElement>(".chapter-box, .diorama, .caption-box, h2") ?? sec;
}

/** fire the web from a nav chip to a section. Call from Nav. */
export function jumpTo(id: string, chip: HTMLElement) {
  const reduced = scrollEngine.reducedMotion;
  const sec = document.getElementById(id);
  if (!sec) return;

  // the glide — the engine's own butter (native jump when reduced)
  scrollEngine.scrollTo(id === "hero" ? 0 : sec);
  if (reduced) return;

  const strand = document.getElementById("web-jump-strand");
  const target = anchorFor(id);

  // --- geometry: chip crown → caught corner (hero: off-screen top) ---
  const c = chip.getBoundingClientRect();
  const x0 = c.left + c.width / 2;
  const y0 = c.top;
  const r1 = target?.getBoundingClientRect();
  const x1 = r1 ? r1.left + r1.width * 0.5 : x0;
  const y1 = r1 ? r1.top + r1.height * 0.22 : -30;

  // the throw's apex — up and over, the wrist-flick. Clamped so the
  // strand's swing stays INSIDE the viewport: a throw to a section
  // above arcs up to just under the nav; a throw down arcs over the
  // cards. The web never leaves the panel it's drawn in.
  const mx = (x0 + x1) / 2 + (x1 < x0 ? -70 : 70);
  const maxLift = Math.min(170, Math.abs(y1 - y0) * 0.25 + 64);
  const my = Math.max(y0 - maxLift, 14);

  if (strand) {
    strand.setAttribute("points", `${x0},${y0} ${mx},${my} ${x1},${y1}`);
    // journey is a paper page — paper ink on paper is invisible
    strand.setAttribute("stroke", id === "journey" ? "var(--color-ink)" : "var(--color-paper)");
    const len = Math.hypot(mx - x0, my - y0) + Math.hypot(x1 - mx, y1 - my);
    strand.style.transition = "none";
    strand.style.strokeDasharray = `0 ${len}`;
    strand.style.animation = "none";
    void strand.getBoundingClientRect();
    strand.style.animation = `web-throw-fade ${THROW_MS}ms steps(8, jump-none) both`;
    requestAnimationFrame(() => {
      strand.style.transition = `stroke-dasharray ${THROW_MS * 0.55}ms cubic-bezier(0.25, 0, 0.2, 1)`;
      strand.style.strokeDasharray = `${len} ${len}`;
    });
  }

  // --- the catch: the card is yanked along the strand, one-shot ---
  if (target && target !== sec) {
    target.style.animation = "none";
    void target.offsetWidth;
    target.style.animation = `web-catch 620ms steps(6, jump-none) both`;
    setTimeout(() => {
      target.style.animation = "";
    }, 700);
  }

  // --- the page tug: #top leans toward the pull, settles, done ---
  const page = document.getElementById("top");
  if (page) {
    const dx = clamp01(Math.abs(x1 - x0) / window.innerWidth) * 12;
    page.style.setProperty("--tug-x", `${x1 < x0 ? -dx : dx}px`);
    page.style.animation = "none";
    void page.offsetWidth;
    page.style.animation = `web-page-tug ${THROW_MS}ms steps(6, jump-none) both`;
    setTimeout(() => {
      page.style.animation = "";
      page.style.removeProperty("--tug-x");
    }, THROW_MS + 80);
  }
}

/** the strand layer — mount once, outside #top (siblings with Nav) */
export function WebJump() {
  return (
    <svg className="pointer-events-none fixed inset-0 z-[47]" aria-hidden="true">
      <polyline
        id="web-jump-strand"
        fill="none"
        stroke="var(--color-paper)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ opacity: 0 }}
      />
    </svg>
  );
}
