// ============================================================================
// SCRUB MATH — every animated thing on this site is a function of scroll
// progress, never of wall-clock time. These helpers build reversible,
// perfectly-scrubable motion envelopes:
//
//   phase(p,a,b)   → 0..1 ramp while p crosses a..b (eases with smoothstep)
//   inhold(p,a,b)  → enter ramp, then HOLD at 1 until b, then... that's the
//                    "arrive and stay" shape (exits are a separate ramp)
//   bell(p,a,b,f)  → enter ramp over f, hold, exit ramp over f — the
//                    scene-caption shape: reversible, no timers, no jumps
//   scrubbed()     → stepped 12fps sampling of any value — the film's "on 2s"
//                    feel while staying 100% scroll-driven
// Everything returns a pure number: scrubbing backwards plays the motion
// backwards frame-perfectly, and an animation CANNOT leak outside the scroll
// window that defines it — the bug class "fires on K-19 home jump" is
// structurally impossible.
// ============================================================================

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** damp toward target — λ per second, dt in seconds (used by the video scrub) */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

/** smoothstep — the default ease for every scrub ramp */
export const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

/** 0..1 as p travels a..b, smoothstepped. identity before a, after b */
export const phase = (p: number, a: number, b: number) => smooth((p - a) / (b - a));

/** 1..0 as p travels a..b (a smooth reverse ramp) */
export const unphase = (p: number, a: number, b: number) => 1 - phase(p, a, b);

/**
 * enter → hold → exit envelope.
 *   a        — motion starts
 *   a+f      — fully arrived (holds at 1)
 *   b-f      — departure starts
 *   b        — fully gone
 * Reversible by construction: p maps to one deterministic value, so
 * scrolling back up replays the arrival in reverse.
 */
export const bell = (p: number, a: number, b: number, f = 0.06) =>
  Math.min(phase(p, a, a + f), unphase(p, b - f, b));

/**
 * arrive-and-stay envelope: ramps 0→1 across a..a+f and stays.
 * Used for panels that shouldn't un-exit while their section is on screen —
 * the wrapper still only moves inside the section's own scroll window.
 */
export const arrive = (p: number, a: number, f = 0.12) => phase(p, a, a + f);

/**
 * "on 2s" — sample any scrub value at ~12fps like the film's held drawings.
 * Pure function of the input, so it stays reversible and never runs while
 * the value is outside its window (helpers above already gate that).
 */
export const stepped2s = (v: number) => {
  const step = 1 / 12;
  return Math.round(v / step) * step;
};

/** linear range map with clamped input: v=a→c, v=b→d (smoothstep's linear cousin) */
export const rangeMap = (v: number, a: number, b: number, c: number, d: number) => {
  const t = clamp01((v - a) / (b - a));
  return c + (d - c) * t;
};
