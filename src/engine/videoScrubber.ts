// ============================================================================
// VIDEO SCRUBBER — maps a scroll track's 0..1 progress onto a <video>
// currentTime with lerp smoothing. rAF-driven, both directions, never
// autoplays. Falls back gracefully when metadata isn't ready yet.
// ============================================================================

import { damp } from "./scrub";

export class VideoScrubber {
  private video: HTMLVideoElement;
  private target = 0; // progress 0..1 set by scroll
  private eased = 0; // smoothed progress actually written to currentTime
  private duration = 0;
  private raf = 0;
  private lastTime = 0;
  private active = false;

  constructor(video: HTMLVideoElement) {
    this.video = video;
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

    if (this.duration) {
      const t = this.eased * (this.duration - 0.001);
      // only touch currentTime when the delta is perceptible, avoids
      // needless decoder seeks on every frame
      if (Math.abs(this.video.currentTime - t) > 0.008) {
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
