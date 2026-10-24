// ============================================================================
// PROGRESS BAR — the film leader. A 4px fixed strip along the very top:
// a pale rail, and a magenta ink fill punched with sprocket perforations
// (.film-leader-fill), closing on a paper head edge — real film-leader
// furniture, not a bare colored strip. Rides the scroll engine's
// existing subscription (no new listeners, no layout reads): one scaleX
// write per scroll frame, GPU-only. Under reduced motion it still works —
// it is information, not decoration — but writes are throttled to whole
// percents so it steps instead of gliding.
// ============================================================================

import { useEffect, useRef } from "react";
import { scrollEngine } from "../engine/scroll";

export function ProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;
    const reduced = scrollEngine.reducedMotion;
    let last = -1;

    const apply = (y: number) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, y / max) : 0;
      // reduced motion: write only on whole-percent steps (no glide)
      const step = reduced ? Math.round(p * 100) / 100 : p;
      if (step === last) return;
      last = step;
      fill.style.transform = `scaleX(${step.toFixed(4)})`;
    };

    const off = scrollEngine.onScroll(apply);
    apply(window.scrollY);
    // document height settles after fonts/media load — re-measure once
    const t = window.setTimeout(() => apply(window.scrollY), 800);
    return () => {
      off();
      window.clearTimeout(t);
    };
  }, []);

  return (
    <div
      ref={barRef}
      style={{ top: "env(safe-area-inset-top, 0px)", height: 4 }}
      className="film-leader-track pointer-events-none fixed inset-x-0 z-[60]"
      aria-hidden="true"
    >
      <div
        ref={fillRef}
        className="film-leader-fill h-full w-full origin-left"
        style={{ transform: "scaleX(0)", willChange: "transform" }}
      />
    </div>
  );
}
