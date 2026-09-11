// ============================================================================
// CINEMATIC HERO — the pinned, scroll-scrubbed video sequence.
// EVERYTHING here is a pure function of scroll progress: the video time,
// the caption slams, the glitch word, the scrim, the end title. No CSS
// one-shot animations, no timers, no gates — scrubbing backward plays
// every beat in reverse, and nothing can run outside the pinned window.
// ============================================================================

import { Fragment, useEffect, useRef, useState } from "react";
import { scrollEngine, isMobileDevice } from "../engine/scroll";
import { bell, smooth, stepped2s, clamp01, rangeMap } from "../engine/scrub";
import { VideoScrubber } from "../engine/videoScrubber";
import {
  VIDEO, SCENES, INTRO_CAPTION, INTRO_NOTE, INTRO_HINT,
  GLITCH_WORD, END_TITLE, NAME,
} from "../content/story";

export function CinematicHero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const handoffRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const glitchRef = useRef<HTMLParagraphElement>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);

  const [mobile] = useState(() => isMobileDevice());
  // mobile starts with NO source at all: the clip is fetched whole as a
  // local blob first (see the fetch effect below) and only then does the
  // video get a src. Cellular Safari ignores preload="auto" and serves
  // remote scrub-seek ranges from the network — freeze, stall, freeze.
  // The poster holds the first frame until the swap, and the scrubber
  // has no duration to seek into until then, so nothing moves early.
  const [src, setSrc] = useState<string>(() =>
    mobile && VIDEO.mobile ? "" : VIDEO.desktop
  );

  useEffect(() => {
    if (src !== "" || !VIDEO.mobile) return;
    let dead = false;
    fetch(VIDEO.mobile)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.blob();
      })
      .then((b) => {
        if (!dead) setSrc(URL.createObjectURL(b));
      })
      .catch(() => {
        // blob fetch failed (offline etc.) — plain streaming beats no film
        if (!dead) setSrc(VIDEO.mobile);
      });
    return () => {
      dead = true;
    };
  }, [src]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;

    const reduced = scrollEngine.reducedMotion;
    const scrubber = new VideoScrubber(video, { coarse: mobile });

    // iOS primer: a never-played <video> often refuses to paint seeked
    // frames at all. One muted play→pause wakes the decode pipeline —
    // playsInline makes it gesture-free, and it lands back on the first
    // frame, so the film still never autoplays. If the browser blocks
    // even that (low power mode), the first touch retries.
    let primed = !mobile;
    const prime = () => {
      if (primed) return;
      primed = true;
      video.muted = true;
      video.play().then(
        () => video.pause(),
        () => {
          primed = false; // blocked: a later touch gets one more shot
        }
      );
    };

    const onMeta = () => {
      if (!mobile) {
        scrubber.start();
        return;
      }
      prime();
      if (video.readyState >= 2) scrubber.start();
      else video.addEventListener("loadeddata", () => scrubber.start(), { once: true });
    };
    video.addEventListener("loadedmetadata", onMeta, { once: true });
    if (video.readyState >= 1) onMeta();

    const onFirstTouch = () => prime();
    if (mobile) window.addEventListener("touchstart", onFirstTouch, { once: true, passive: true });

    let lastTracking = -1; // letterSpacing cache: only write on real change

    const update = (p: number) => {
      // video timeline: last 8% of scroll is the end-title beat
      scrubber.setTarget(clamp01(p / 0.92));

      // intro captions: visible at rest, gone once the story starts moving.
      // pure ramp — scrolling back up brings them back frame-perfectly
      if (introRef.current) {
        const vis = rangeMap(p, 0.004, 0.045, 1, 0);
        introRef.current.style.opacity = String(vis);
        introRef.current.style.transform = `translate3d(0, ${(1 - vis) * -30}px, 0)`;
        // slam stamp: scale overshoot follows the SAME ramp, on 2s
        const stamp = stepped2s(1 - vis);
        introRef.current.querySelectorAll<HTMLElement>(".caption-box").forEach((cap) => {
          cap.style.transform = `rotate(var(--cap-tilt)) scale(${(1.28 - stamp * 0.28).toFixed(3)})`;
        });
      }

      // onomatopoeia at the glitch beat (4.0–5.6s of video), scrubbed
      if (glitchRef.current) {
        const vidT = clamp01(p / 0.92) * VIDEO.duration;
        const e = bell(p, 0.35, 0.52, 0.04);
        const vis = vidT > 4.0 && vidT < 5.6 ? e : 0;
        glitchRef.current.style.opacity = String(vis);
        glitchRef.current.style.transform =
          `rotate(-8deg) scale(${(0.85 + stepped2s(vis) * 0.15).toFixed(3)})`;
      }

      // scrim: base shade → deeper through the glitch. The FINAL handoff
      // to the next section is a separate layer colored by the ACTIVE
      // ground (ink at night, paper on the day print — a page-flash cut)
      if (scrimRef.current) {
        const base = 0.2;
        const glitch = rangeMap(p, 0.36, 0.46, 0, 0.16) * (1 - rangeMap(p, 0.55, 0.65, 0, 1));
        scrimRef.current.style.opacity = String(base + glitch);
      }
      if (handoffRef.current) {
        handoffRef.current.style.opacity = String(rangeMap(p, 0.965, 1, 0, 0.92));
      }

      // scene captions: enter → hold → exit, each a bell over its beat.
      // the caption box itself slams in via the same envelope (scale
      // overshoot sampled on 2s) — no CSS animation anywhere
      SCENES.forEach((scene, i) => {
        const el = sceneRefs.current[i];
        if (!el) return;
        const sceneP = (scene.at / VIDEO.duration) * 0.92;
        const vis = bell(p, sceneP - 0.055, sceneP + 0.115, 0.05);

        const cap = el.querySelector<HTMLElement>(".caption-box");
        if (cap) {
          // stamp: 1.24 → 0.94 → 1 mapped from the enter ramp, on 2s
          const enter = smooth(clamp01((vis - 0.001) / 0.55));
          const st = stepped2s(enter);
          const scale = enter <= 0 ? 1.3 : 1.3 - 0.36 * st + 0.06 * smooth((st - 0.8) / 0.2);
          cap.style.transform = `rotate(var(--cap-tilt)) scale(${Math.max(0.94, Math.min(1.3, scale)).toFixed(3)})`;
          cap.style.opacity = String(clamp01(vis * 2.2));
        }

        if (reduced) {
          el.style.opacity = String(vis > 0.5 ? 1 : 0);
          return;
        }
        // container: slide + settle while the caption box itself slams
        el.style.opacity = String(Math.min(1, vis * 1.8));
        el.style.transform = `translate3d(0, ${(1 - vis) * 70}px, 0)`;
        const sub = el.querySelector<HTMLElement>(".scene-sub");
        if (sub) {
          sub.style.opacity = String(clamp01(vis * 1.4 - 0.35));
          sub.style.transform = `translate3d(0, ${(1 - clamp01(vis * 1.3 - 0.3)) * 22}px, 0)`;
        }
      });

      // end title + name
      if (endRef.current) {
        const vis = rangeMap(p, 0.85, 0.94, 0, 1);
        endRef.current.style.opacity = String(vis);
        endRef.current.style.transform = `translate3d(0, ${(1 - vis) * 60}px, 0)`;
        // letterSpacing forces a style recalc per frame; write only on change
        const tracking = 0.06 - vis * 0.045;
        if (Math.abs(tracking - lastTracking) > 0.001) {
          lastTracking = tracking;
          endRef.current.style.letterSpacing = `${tracking}em`;
        }
      }
      if (nameRef.current) {
        const vis = rangeMap(p, 0.92, 1, 0, 1);
        nameRef.current.style.opacity = String(vis);
        nameRef.current.style.transform = `scale(${0.86 + vis * 0.14}) translateZ(0)`;
      }
    };

    scrollEngine.registerTrack("hero", { el: wrap, onUpdate: update });
    return () => {
      window.removeEventListener("touchstart", onFirstTouch);
      scrollEngine.unregisterTrack("hero");
      scrubber.stop();
      video.removeEventListener("loadedmetadata", onMeta);
    };
  }, [mobile, src]);

  return (
    <div
      ref={wrapRef}
      id="hero"
      className="relative"
      style={{ height: `${isMobileDevice() ? 380 : 460}vh` }}
    >
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        {/* video layer — no src on mobile until the local blob lands */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={src || undefined}
          muted
          playsInline
          preload={src ? "auto" : "none"}
          poster={VIDEO.poster}
          disablePictureInPicture
          aria-hidden="true"
        />

        {/* print grain */}
        <div
          className="pointer-events-none absolute inset-0 halftone opacity-[0.22] mix-blend-overlay"
          style={{ ["--dot-color" as string]: "rgba(242,236,223,0.5)" }}
        />
        <div ref={scrimRef} className="pointer-events-none absolute inset-0 bg-ink" style={{ opacity: 0.2 }} />
        {/* the final handoff: the last frames scrims into the ink ground,
            so the film cuts seamlessly into the universe (no hard cut) */}
        <div
          ref={handoffRef}
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--ground-handoff)", opacity: 0 }}
        />

        {/* opening captions: "hi, i'm KHAYAL." narration stack */}
        <div
          ref={introRef}
          className="absolute left-6 top-[16vh] max-w-[86vw] md:left-[7vw] md:top-[18vh]"
        >
          <p className="caption-box text-[clamp(1.15rem,3vw,1.9rem)]" style={{ ["--cap-tilt" as string]: "-1.4deg" }}>
            {INTRO_CAPTION}
          </p>
          <p
            className="caption-box caption-box--dark caption-tail mt-4 inline-block text-[clamp(0.9rem,2vw,1.15rem)]"
            style={{ ["--cap-tilt" as string]: "1.8deg" }}
          >
            {INTRO_NOTE}
          </p>
          <p className="t-note mt-8 text-[15px] text-paper/80 md:text-lg" style={{ rotate: "-2deg" }}>
            {INTRO_HINT}
          </p>
        </div>

        {/* onomatopoeia at the glitch beat */}
        {GLITCH_WORD && (
          <p
            ref={glitchRef}
            className="t-display absolute left-[10%] top-[24%] text-[clamp(1.8rem,5vw,4rem)] text-warning opacity-0 select-none"
            style={{ willChange: "opacity, transform", textShadow: "3px 0 0 rgba(255,46,136,0.7), -3px 0 0 rgba(0,229,255,0.7)" }}
            aria-hidden="true"
          >
            <span className="boil">{GLITCH_WORD}!</span>
          </p>
        )}

        {/* scene captions — the film's narration boxes, glitching in */}
        <div className="pointer-events-none absolute inset-0">
          {SCENES.map((scene, i) => (
            <div
              key={scene.lines.join()}
              ref={(el) => { sceneRefs.current[i] = el; }}
              className={`absolute top-1/2 -translate-y-1/2 px-6 md:px-[7vw] ${
                scene.anchor === "left" ? "left-0 text-left" : "right-0 text-right"
              }`}
              style={{ opacity: 0, willChange: "transform, opacity" }}
            >
              <h2
                className={`caption-box ${scene.anchor === "left" ? "" : "caption-box--ink"}`}
                style={{
                  ["--cap-tilt" as string]: scene.anchor === "left" ? "-1.6deg" : "1.4deg",
                  ["--cap-bg" as string]: scene.anchor === "left" ? "#ffd60a" : "#f2ecdf",
                  ["--cap-ink" as string]: "#0a090e",
                  fontSize: "clamp(1.5rem, 4.6vw, 3.6rem)",
                  maxWidth: "min(88vw, 24ch)",
                  opacity: 0, // driven per-frame by the track
                }}
              >
                {scene.lines.map((line, li) => (
                  <Fragment key={line}>
                    {renderAccentLine(line, scene.accent)}
                    {li === 0 && <br />}
                  </Fragment>
                ))}
              </h2>
              <p className="scene-sub caption-box caption-box--dark mt-5 inline-block text-[clamp(0.85rem,1.8vw,1.1rem)]" style={{ ["--cap-tilt" as string]: i % 2 ? "1.6deg" : "-1.2deg", opacity: 0 }}>
                {scene.sub}
              </p>
            </div>
          ))}
        </div>

        {/* end title + the name */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <div ref={endRef} style={{ opacity: 0 }}>
            <p className="t-display chroma-soft text-[clamp(1.4rem,4.4vw,3.2rem)] text-paper">
              {END_TITLE}
            </p>
          </div>
          <div ref={nameRef} className="mt-4" style={{ opacity: 0 }}>
            <p className="t-display spray-text text-[clamp(4rem,17vw,13rem)] leading-[0.9]">
              {NAME}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** the accent word gets magenta color + the yellow swipe underline */
function renderAccentLine(line: string, accent?: string) {
  const words = line.split(" ");
  const idx = accent ? words.findIndex((w) => w.replace(/[^A-Z]/g, "") === accent) : -1;
  if (idx === -1) return line;
  return words.map((w, i) => (
    <Fragment key={i}>
      {i === idx ? (
        <span className="accent-word" style={{ color: "var(--color-magenta)", WebkitTextStroke: "0.5px var(--color-ink)" }}>
          {w}
        </span>
      ) : (
        w
      )}
      {i < words.length - 1 ? " " : ""}
    </Fragment>
  ));
}
