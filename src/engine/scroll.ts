// ============================================================================
// SCROLL ENGINE — the single source of truth for scroll state.
// Lenis provides the inertia feel (butter-smooth glide); this store fans
// out one normalized progress value per named "track" so hero, universe and
// footer all read from the same rAF heartbeat. No React state is touched
// during scrolling: subscribers register callbacks and write transforms.
//
// PERF CONTRACT
//   1. READ-then-WRITE: every track's rect is measured first, THEN updates
//      run. Track callbacks receive their rect so they never force a
//      synchronous layout inside the write phase.
//   2. Off-screen tracks are skipped (their progress is clamped at an
//      extreme and their elements already hold the settled state), so the
//      hero stops consuming frames once you've scrolled past it.
//   3. onScroll subscribers ride Lenis's scroll event (no idle rAF).
// ============================================================================

import Lenis from "lenis";

export interface Track {
  /** element that defines the track (usually a tall wrapper section) */
  el: HTMLElement;
  /** called every frame with 0..1 progress through the track + its live rect */
  onUpdate: (p: number, rect: DOMRect) => void;
}

class ScrollEngine {
  lenis: Lenis | null = null;
  private tracks = new Map<string, Track>();
  private raf = 0;
  private running = false;
  private lastVelocity = 0;
  private scrollCbs = new Set<(y: number) => void>();
  reducedMotion = false;
  // idle-skip bookkeeping: when the page isn't scrolling, tracks have
  // nothing new to compute — the loop parks instead of measuring rects
  private lastScrollY = -1;
  private lastScrollChange = 0;

  init() {
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!this.reducedMotion) {
      this.lenis = new Lenis({
        // tuned by feel: a single wheel tick settles in ~1040ms — the
        // butter glide the film needed
        duration: 1.04,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        syncTouch: false, // native touch inertia on mobile feels better
      });
      this.lenis.on("scroll", (e: Lenis) => {
        for (const cb of this.scrollCbs) cb(e.scroll);
      });
    } else {
      window.addEventListener("scroll", this.emitNative, { passive: true });
    }
    this.start();
  }

  registerTrack(name: string, track: Track) {
    this.tracks.set(name, track);
  }

  unregisterTrack(name: string) {
    this.tracks.delete(name);
  }

  /** subscribe to scroll position; fires only while scrolling. returns off() */
  onScroll(cb: (y: number) => void): () => void {
    this.scrollCbs.add(cb);
    return () => this.scrollCbs.delete(cb);
  }
  private emitNative = () => {
    for (const cb of this.scrollCbs) cb(window.scrollY);
  };

  /** normalized scroll velocity, ~0 at rest, ~0.1+ while flicking */
  get velocity() {
    return this.lastVelocity;
  }

  private loop = () => {
    this.lenis?.raf(this.timeNow());
    const v = this.lenis?.velocity ?? 0;
    this.lastVelocity = (Math.abs(v) / Math.max(1, Math.abs(v) + 1200)) * 4;

    // ---- IDLE PARK ----
    // The scroll position is the only input that can change a track's
    // progress. When it hasn't moved AND we're outside the settle window
    // (a short tail so lerped writes converge), the whole measure+write
    // phase is skipped — the master rAF costs ~nothing while resting.
    // window.scrollY is ground truth here: during wheel scrolls Lenis
    // itself drives it, and lenis.scroll would LAG native jumps (Lenis
    // re-eases programmatic position changes over its ~1s duration).
    const now = this.timeNow();
    const y = window.scrollY;
    if (y !== this.lastScrollY) {
      this.lastScrollY = y;
      this.lastScrollChange = now;
    } else if (now - this.lastScrollChange > 400) {
      this.raf = requestAnimationFrame(this.loop);
      return;
    }

    // ---- READ phase: measure everything before any style is written ----
    const vh = window.innerHeight;
    const measured: { track: Track; p: number; rect: DOMRect; off: boolean }[] = [];
    for (const [name, track] of this.tracks.entries()) {
      if (!track.el.isConnected) continue;

      // distance-aware skip: a parked track can't re-enter the viewport
      // until the page scrolls at least as far as it was outside. While
      // the cumulative travel since parking is below that distance, the
      // rect read is skipped — far sections cost zero while you read.
      const parked = this.parks.get(name);
      if (parked) {
        const traveled = Math.abs(y - parked.y);
        if (traveled < parked.dist) continue; // still can't be visible
        this.parks.delete(name);
      }

      const rect = track.el.getBoundingClientRect();
      const total = rect.height - vh;
      // progress of the track's TOP through the viewport: 0 when its top
      // hits the top of the viewport, 1 when its bottom reaches the bottom.
      const p = total <= 0 ? 0 : Math.min(Math.max(-rect.top, 0), total) / total;
      // fully outside? park it WITH its outside distance so the skip above
      // is exactly as patient as the geometry requires (margin 80px below
      // so it re-measures just before it can touch the fold)
      const off = rect.bottom < -4 || rect.top > vh + 60;
      if (off) {
        const dist = rect.top > vh ? rect.top - vh + 80 : -rect.bottom + 80;
        this.parks.set(name, { y, dist });
      }
      measured.push({ track, p, rect, off });
    }

    // ---- WRITE phase: fan out (no rect reads inside callbacks) ----
    for (const m of measured) {
      if (!m.off) m.track.onUpdate(m.p, m.rect);
    }

    this.raf = requestAnimationFrame(this.loop);
  };

  /** parked tracks: scroll position at park time + how far outside it was */
  private parks = new Map<string, { y: number; dist: number }>();

  private timeNow() {
    return performance.now();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  scrollTo(target: number | string | HTMLElement, options?: { immediate?: boolean }) {
    this.lenis?.scrollTo(target, { ...options });
    if (!this.lenis) {
      // reduced-motion fallback: plain jump
      const el = typeof target === "string" ? document.querySelector(target) : target;
      if (typeof target === "number") window.scrollTo({ top: target });
      else if (el instanceof HTMLElement) el.scrollIntoView();
    }
  }

  stopScroll() {
    this.lenis?.stop();
  }

  startScroll() {
    this.lenis?.start();
  }
}

export const scrollEngine = new ScrollEngine();

/* ---------------------------------------------------------------------------
   Math helpers re-exported for convenience (canonical home: scrub.ts).
   Components import them from either module — scroll.ts is the hub most
   of them already touch.
   ------------------------------------------------------------------------- */
export { clamp01, smooth, phase, unphase, bell, arrive, stepped2s, rangeMap } from "./scrub";
export { damp } from "./scrub";

export const isMobileDevice = () =>
  window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;

/* ---------------------------------------------------------------------------
   NOTE: no re-entry gates or replay helpers exist. All scroll entrances
   are pure scrub envelopes (engine/scrub.ts): an element's motion is a
   pure function of section progress, so it replays on re-entry by
   construction and can never leak outside its window.
   ------------------------------------------------------------------------- */
