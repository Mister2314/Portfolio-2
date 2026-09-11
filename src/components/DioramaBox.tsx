// ============================================================================
// DIORAMA BOX — the shared LIVING 3D core for every panel/card on the site.
// Universe chapter boxes, journey panels, multiverse variant cards all run
// on this exact engine, so the whole site feels like ONE physics world:
//   idle float   — sine bob on own phase + slow rotation drift
//   proximity    — cursor "brush": the box is pushed away, springs back
//   hover tilt   — rotateX/rotateY spring toward the cursor (±11°), inner
//                  planes parallax for free from the 3D projection
//   press        — slight compression on touch/brush
// Structure contract: <DioramaBox> renders .scene → .panel3d (the core it
// animates) → {children} which MUST use the .p3d plane ladder
// (.p3d--bg/-content/-pop/-sfx etc. from index.css).
// All rAF, transform/opacity only; asleep while off-screen or behind the
// chapter overlay; reduced-motion leaves it still unless engaged.
// ============================================================================

import { useEffect, useRef, type ReactNode } from "react";
import { Spring } from "../engine/spring";
import { scrollEngine, isMobileDevice } from "../engine/scroll";

/** mobile: lighter physics (smaller amplitudes, weaker tilt) — same life */
const MOBILE3D = isMobileDevice();

interface BoxState {
  phase: number;
  ampX: number;
  ampY: number;
  rotAmp: number;
  speed: number;
  pushX: Spring;
  pushY: Spring;
  tiltX: Spring;
  tiltY: Spring;
  press: Spring;
  hover: Spring;
}

export function DioramaBox({
  children,
  index,
  tilt = 0,
  interactive = true,
  className = "",
  as = "div",
  ariaLabel,
  onActivate,
  activationAria,
}: {
  /** plane-ladder children (.p3d--bg / .p3d--content / ...) */
  children: ReactNode;
  /** index into its section — drives bob phase/amp variety */
  index: number;
  /** resting wonky angle, degrees */
  tilt?: number;
  /** attach cursor physics + click (false = display-only float) */
  interactive?: boolean;
  className?: string;
  /** element type: button when it opens something, div otherwise */
  as?: "div" | "button";
  ariaLabel?: string;
  /** click/tap handler (receives the scene rect for FLIP overlays) */
  onActivate?: (rect: DOMRect) => void;
  /** aria for the button variant */
  activationAria?: string;
}) {
  const sceneRef = useRef<HTMLElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const core = coreRef.current;
    if (!scene || !core) return;

    const reduced = scrollEngine.reducedMotion;
    const m = MOBILE3D;
    const s: BoxState = {
      phase: index * 1.7,
      ampX: (m ? 3 : 5) + (index % 3) * 2,
      ampY: (m ? 5 : 8) + (index % 2) * (m ? 3 : 5),
      rotAmp: (m ? 0.5 : 0.7) + index * 0.2,
      speed: 0.55 + index * 0.09,
      pushX: new Spring(70, 8),
      pushY: new Spring(70, 8),
      tiltX: new Spring(110, 11),
      tiltY: new Spring(110, 11),
      press: new Spring(140, 9),
      hover: new Spring(80, 11),
    };

    let visible = true;
    const PROXIMITY = m ? 120 : 180;

    const io = new IntersectionObserver(
      ([entry]) => {
        const was = visible;
        visible = entry.isIntersecting;
        if (visible && !was) last = performance.now();
      },
      { rootMargin: "80px" },
    );
    io.observe(scene);

    // PERF: pointer position is only STORED here; the geometry (one rect
    // read) is computed in the rAF loop at most once per frame per box —
    // pointermove can fire far more often than the display refreshes.
    let mx = -1, my = -1;
    const onMove = (e: PointerEvent) => {
      if (!interactive || e.pointerType === "touch") return;
      if (document.body.dataset.overlay) return;
      mx = e.clientX;
      my = e.clientY;
    };

    if (!reduced) window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let last = performance.now();
    let lastHoverP = "";
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.body.dataset.overlay) return;

      // pointer physics: one rect read per frame, only while a pointer
      // has ever visited (coarse/touch devices never pay this)
      let hoverT = 0;
      if (interactive && mx >= 0) {
        const r = scene.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.hypot(dx, dy);
        const inside = dist < Math.max(r.width, r.height) / 2 + 8;

        if (inside) {
          hoverT = 1;
          const px = (mx - r.left) / r.width - 0.5;
          const py = (my - r.top) / r.height - 0.5;
          s.tiltY.setTarget(px * 2 * 11);
          s.tiltX.setTarget(-py * 2 * 11);
          s.press.setTarget(0.06);
          s.pushX.setTarget(0);
          s.pushY.setTarget(0);
        } else if (dist < PROXIMITY) {
          const f = 1 - dist / PROXIMITY;
          hoverT = f * 0.5;
          s.tiltX.setTarget((-dy / dist) * 5 * f);
          s.tiltY.setTarget((dx / dist) * 5 * f);
          s.press.setTarget(f * 0.1);
          s.pushX.setTarget((-dx / dist) * 24 * f);
          s.pushY.setTarget((-dy / dist) * 20 * f);
        } else {
          s.tiltX.setTarget(0);
          s.tiltY.setTarget(0);
          s.press.setTarget(0);
          s.pushX.setTarget(0);
          s.pushY.setTarget(0);
        }
      }
      s.hover.setTarget(hoverT);

      if (reduced && hoverT === 0 && s.hover.value < 0.01) {
        last = now;
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;

      const bobX = reduced ? 0 : Math.sin(t * s.speed + s.phase) * s.ampX;
      const bobY = reduced ? 0 : Math.cos(t * s.speed * 0.8 + s.phase * 1.3) * s.ampY;
      const rotDrift = reduced ? 0 : Math.sin(t * 0.35 + s.phase) * s.rotAmp;

      const pxv = s.pushX.step(dt);
      const pyv = s.pushY.step(dt);
      const tx = s.tiltX.step(dt);
      const ty = s.tiltY.step(dt);
      const press = s.press.step(dt);
      const hover = Math.max(0, Math.min(1, s.hover.step(dt)));

      scene.style.transform =
        `translate3d(${pxv + bobX}px, ${pyv + bobY}px, 0) rotate(${tilt + rotDrift}deg) scale(${1 - press})`;
      core.style.transform = `rotateX(${tx.toFixed(2)}deg) rotateY(${ty.toFixed(2)}deg)`;

      const hoverP = hover.toFixed(3);
      if (hoverP !== lastHoverP) {
        lastHoverP = hoverP;
        scene.style.setProperty("--hover-p", hoverP);
        scene.style.setProperty("--shadow-p", (0.55 + hover * 0.3).toFixed(3));
      }
    };
    raf = requestAnimationFrame(loop);

    let onClick: (() => void) | null = null;
    if (interactive && onActivate) {
      onClick = () => onActivate(scene.getBoundingClientRect());
      scene.addEventListener("click", onClick);
    }

    return () => {
      window.removeEventListener("pointermove", onMove);
      if (onClick) scene.removeEventListener("click", onClick);
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [index, tilt, interactive, onActivate]);

  const Tag = as;
  return (
    <Tag
      ref={sceneRef as never}
      className={`diorama scene chapter-box relative block text-left ${interactive ? "cursor-pointer" : ""} ${className}`}
      style={{ ["--hover-p" as string]: 0 } as React.CSSProperties}
      {...(as === "button"
        ? { "aria-haspopup": "dialog", "aria-label": activationAria, type: "button" as const }
        : { "aria-hidden": ariaLabel ? undefined : true, "aria-label": ariaLabel })}
    >
      <div ref={coreRef} className="panel3d">
        {children}
      </div>
    </Tag>
  );
}
