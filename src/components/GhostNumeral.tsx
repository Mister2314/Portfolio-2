// ============================================================================
// GHOST NUMERAL — the kinetic page number. One huge display numeral per
// section (02–05), set at whisper opacity so it reads as print texture,
// drifting on a slow scrub parallax (type-as-imagery, one transform write
// per already-running frame). aria-hidden: purely decorative. Forced
// colors / reduced motion: static, no parallax.
// ============================================================================

import { useEffect, useRef } from "react";
import { scrollEngine } from "../engine/scroll";

export function GhostNumeral({
  sectionId,
  label,
  side = "right",
}: {
  sectionId: string;
  label: string;
  side?: "left" | "right";
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const sec = document.getElementById(sectionId);
    if (!el || !sec) return;
    const reduced = scrollEngine.reducedMotion;
    const dir = side === "right" ? -1 : 1;

    if (reduced) {
      el.style.opacity = "0.045";
      return;
    }

    const update = (p: number) => {
      const centered = p - 0.5; // -0.5 → 0.5 through the section
      el.style.opacity = "0.05";
      el.style.transform = `translate3d(${(centered * dir * 40).toFixed(1)}px, ${(centered * -70).toFixed(1)}px, 0)`;
    };
    scrollEngine.registerTrack(`ghost-${sectionId}`, { el: sec, onUpdate: update });
    return () => scrollEngine.unregisterTrack(`ghost-${sectionId}`);
  }, [sectionId, side]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`t-display pointer-events-none select-none absolute bottom-[4vh] text-[clamp(9rem,26vw,20rem)] leading-none text-paper ${
        side === "right" ? "right-[2vw]" : "left-[2vw]"
      }`}
      style={{ opacity: 0.045, willChange: "transform", zIndex: 0 }}
    >
      {label}
    </span>
  );
}
