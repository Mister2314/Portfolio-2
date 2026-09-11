// ============================================================================
// SPRING — tiny critically-damped-ish spring for the box physics. Provides
// elastic overshoot on release; one instance per animated value.
// ============================================================================

export class Spring {
  value = 0;
  private target = 0;
  private vel = 0;
  private stiffness: number;
  private damping: number;

  constructor(stiffness = 90, damping = 10) {
    this.stiffness = stiffness;
    this.damping = damping;
  }

  setTarget(t: number) {
    this.target = t;
  }

  snap(t: number) {
    this.target = t;
    this.value = t;
    this.vel = 0;
  }

  step(dt: number) {
    // semi-implicit Euler; unstable only at absurd dt, which we clamp anyway
    const f = this.stiffness * (this.target - this.value);
    this.vel += f * dt;
    this.vel *= Math.exp(-this.damping * dt);
    this.value += this.vel * dt;
    return this.value;
  }
}
