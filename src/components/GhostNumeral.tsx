// ============================================================================
// GHOST NUMERAL — the printed folio number. One huge numeral per section
// (02–05), set as mis-registered print plates (.ghost-numeral: magenta +
// cyan plates out of register, paper halftone knocked through the glyph).
// NOT an opacity trick — the craft is in the plates, not in fading it out.
// Drifting on a slow scrub parallax (type-as-imagery, one transform write
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
      el.style.opacity = "1";
      return;
    }

    const update = (p: number) => {
      const centered = p - 0.5; // -0.5 → 0.5 through the section
      el.style.transform = `translate3d(${(centered * dir * 40).toFixed(1)}px, ${(centered * -70).toFixed(1)}px, 0)`;
    };
    scrollEngine.registerTrack(`ghost-${sectionId}`, { el: sec, onUpdate: update });
    return () => scrollEngine.unregisterTrack(`ghost-${sectionId}`);
  }, [sectionId, side]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`ghost-numeral t-display pointer-events-none select-none absolute bottom-[4vh] text-[clamp(9rem,26vw,20rem)] leading-none ${
        side === "right" ? "right-[2vw]" : "left-[2vw]"
      }`}
      style={{ willChange: "transform", zIndex: 0 }}
    >
      {label}
    </span>
  );
}
