// ============================================================================
// VIDEO SCRUBBER — maps a scroll track's 0..1 progress onto a <video>
// currentTime with lerp smoothing. rAF-driven, both directions, never
// autoplays. Falls back gracefully when metadata isn't ready yet.
//
// MOBILE: every currentTime write is a hardware seek, and writing AGAIN
// while the previous seek is still in flight cancels it mid-decode —
// stacked seeks are what makes touch scrubbing freeze-stall-freeze. So:
//   1. never stack — skip the write while video.seeking is true; the
//      eased value converges on a later frame anyway
//   2. touch devices wait for a video-frame-sized delta before seeking
//      (one seek = one decode there)
// CinematicHero additionally swaps the mobile src to a fully local
// blob before scrubbing, so no seek ever waits on the network.
// ============================================================================

import { damp } from "./scrub";

export class VideoScrubber {
  private video: HTMLVideoElement;
  private coarse = false; // touch device: seeks cost a decode — write less
  private target = 0; // progress 0..1 set by scroll
  private eased = 0; // smoothed progress actually written to currentTime
  private duration = 0;
  private raf = 0;
  private lastTime = 0;
  private active = false;

  constructor(video: HTMLVideoElement, opts?: { coarse?: boolean }) {
    this.video = video;
    this.coarse = opts?.coarse ?? false;
  }

  setTarget(progress: number) {
    this.target = progress;
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.lastTime = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.active = false;
    cancelAnimationFrame(this.raf);
  }

  private loop = (now: number) => {
    if (!this.active) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    if (!this.duration && this.video.readyState >= 1 && this.video.duration) {
      this.duration = this.video.duration;
    }

    // butter smoothing: higher lambda = tighter coupling to scroll
    this.eased = damp(this.eased, this.target, 7.5, dt);

    // one seek in flight at most — a second write would cancel the first
    // mid-decode and restart it, which is the stutter
    if (this.duration && !this.video.seeking) {
      const t = this.eased * (this.duration - 0.001);
      // only touch currentTime when the delta is perceptible; on touch
      // devices one seek = one decode, so wait for ~half a video frame
      const min = this.coarse ? 0.016 : 0.008;
      if (Math.abs(this.video.currentTime - t) > min) {
        try {
          this.video.currentTime = t;
        } catch {
          /* seek can throw while the element is not ready; next frame retries */
        }
      }
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  get progress() {
    return this.eased;
  }
}
