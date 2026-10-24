// ============================================================================
// CONTACT — a comic "letter to the verse".
// The form is drawn as a paper letter pinned to the dark page: ink-border
// inputs, caption labels, THWIP submit. Posts to the endpoint constant in
// story.ts; with no endpoint configured it falls back to a mailto prefill
// so the form always does something real. Contact links become THWIP
// buttons. Replaces the old footer entirely.
// ============================================================================

import { Fragment, useState, type FormEvent } from "react";
import { useEffect, useRef } from "react";
import { scrollEngine, clamp01, rangeMap } from "../engine/scroll";
import { GhostNumeral } from "./GhostNumeral";
import { arrive, smooth } from "../engine/scrub";
import {
  CONTACT_ENDPOINT, CONTACT_MAILTO,
  CONTACT_TITLE, CONTACT_NOTE,
  CONTACT_NAME_LABEL, CONTACT_EMAIL_LABEL, CONTACT_MESSAGE_LABEL,
  CONTACT_NAME_PLACEHOLDER, CONTACT_EMAIL_PLACEHOLDER, CONTACT_MESSAGE_PLACEHOLDER,
  CONTACT_SUBMIT, SENDING_WORD, CONTACT_SUCCESS, CONTACT_ERROR,
  SWOOSH_WORD, AIRVERSE_STAMP, CONTACT_LINKS,
  FOOTER_SIGNOFF, NAME, END_CLOSING,
} from "../content/story";

export function Contact() {
  const secRef = useRef<HTMLElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // kill the browser's "previous entries" dropdown: browsers key saved
  // values by input NAME, so a fresh random suffix per visit means nothing
  // to recall. Chrome also treats autocomplete="new-password" as the one
  // token it will not second-guess (plain autocomplete="off" is ignored on
  // fields it recognizes as name/email).
  const suffix = useRef(`-${Math.random().toString(36).slice(2, 8)}`).current;
  const F = {
    name: `name${suffix}`,
    email: `email${suffix}`,
    message: `message${suffix}`,
  } as const;

  useEffect(() => {
    const sec = secRef.current;
    const letter = letterRef.current;
    if (!sec || !letter) return;
    const reduced = scrollEngine.reducedMotion;

    const update = (p: number) => {
      // the letter arrives as a pure scrub envelope (reversible)
      const t = arrive(clamp01(rangeMap(p, -0.15, 0.45, 0, 1)), 0, 0.4);
      const eased = smooth(t);
      letter.style.opacity = reduced ? (t > 0 ? "1" : "0") : eased.toFixed(3);
      if (!reduced) {
        letter.style.transform = `translate3d(0, ${((1 - eased) * 70).toFixed(1)}px, 0) rotate(${((1 - eased) * -2).toFixed(2)}deg)`;
      }
    };

    scrollEngine.registerTrack("contact", { el: sec, onUpdate: update });
    return () => scrollEngine.unregisterTrack("contact");
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get(F.name) || "");
    const email = String(data.get(F.email) || "");
    const message = String(data.get(F.message) || "");
    setStatus("sending");

    if (CONTACT_ENDPOINT) {
      try {
        const res = await fetch(CONTACT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ name, email, message }),
        });
        if (!res.ok) throw new Error(String(res.status));
        setStatus("sent");
        form.reset();
        return;
      } catch {
        setStatus("error");
        return;
      }
    }
    // no endpoint configured: fall back to a prefilled email so the letter
    // always reaches somewhere real
    const subject = encodeURIComponent(`from the verse: ${name || "a visitor"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${CONTACT_MAILTO}?subject=${subject}&body=${body}`;
    setStatus("sent");
    form.reset();
  };

  return (
    <footer
      ref={secRef}
      id="contact"
      className="relative overflow-x-clip"
      style={{ minHeight: "110vh" }}
      aria-label="contact"
    >
      <GhostNumeral sectionId="contact" label="05" side="left" />
      {/* ground */}
      <div
        className="halftone absolute inset-0 opacity-30"
        style={{ ["--dot-color" as string]: "rgba(var(--mark-rgb), 0.22)", ["--dot-gap" as string]: "12px" }}
      />
      <div className="spray-glow absolute inset-x-0 bottom-0 h-[60%] opacity-25" style={{ filter: "blur(26px)" }} />

      <div className="relative flex flex-col items-center px-6 pt-[14vh] md:px-[7vw]">
        {/* heading: display first, the note speaks below it */}
        <h2 className="t-display text-center text-[clamp(2.4rem,8vw,6.5rem)] text-paper">
          {CONTACT_TITLE.split(" ").map((w, wi, arr) => (
            <Fragment key={wi}>{wi === arr.length - 1 ? <span className="spray-text">{w}</span> : w}{" "}</Fragment>
          ))}
        </h2>
        <p className="caption-box caption-tail mt-6 inline-block text-[clamp(0.85rem,1.6vw,1.05rem)]" style={{ ["--cap-tilt" as string]: "-1.2deg" }}>
          {CONTACT_NOTE}
        </p>

        {/* the letter — comic mail furniture, frame-breaking stamp */}
        <div
          ref={letterRef}
          className="paper-page ink-frame misreg relative mt-16 w-full max-w-2xl p-6 md:p-10"
          style={{ opacity: 0, borderColor: "var(--color-ink)", outline: "2px solid rgba(10,9,14,0.9)" }}
        >
          {/* the SFX word breaking the letter's frame — the mail moment */}
          <p
            className="sfx-word"
            style={{ top: "-1.1em", right: "1rem", color: "var(--color-magenta)" }}
            aria-hidden="true"
          >
            {SWOOSH_WORD}
          </p>
          <div
            className="halftone absolute inset-0 opacity-50"
            style={{ ["--dot-color" as string]: "rgba(10 9 14 / 0.1)", ["--dot-gap" as string]: "9px" }}
          />
          <form className="relative flex flex-col gap-6" onSubmit={onSubmit}>
            <div className="flex flex-col gap-6 md:flex-row md:gap-8">
              <label className="flex flex-1 flex-col gap-2">
                <span className="caption-box inline-block self-start text-[12px]" style={{ ["--cap-tilt" as string]: "-1.5deg" }}>
                  {CONTACT_NAME_LABEL}
                </span>
                <input
                  name={F.name}
                  required
                  autoComplete="new-password"
                  placeholder={CONTACT_NAME_PLACEHOLDER}
                  className="ink-input"
                />
              </label>
              <label className="flex flex-1 flex-col gap-2">
                <span className="caption-box inline-block self-start text-[12px]" style={{ ["--cap-tilt" as string]: "1.2deg", background: "var(--color-cyan-el)" }}>
                  {CONTACT_EMAIL_LABEL}
                </span>
                <input
                  name={F.email}
                  type="email"
                  required
                  autoComplete="new-password"
                  placeholder={CONTACT_EMAIL_PLACEHOLDER}
                  className="ink-input"
                />
              </label>
            </div>
            <label className="flex flex-col gap-2">
              <span className="caption-box inline-block self-start text-[12px]" style={{ ["--cap-tilt" as string]: "-0.8deg", background: "var(--color-magenta)", color: "var(--color-ink)" }}>
                {CONTACT_MESSAGE_LABEL}
              </span>
              <textarea
                name={F.message}
                required
                rows={5}
                autoComplete="off"
                placeholder={CONTACT_MESSAGE_PLACEHOLDER}
                className="ink-input resize-none"
              />
            </label>

            <div className="flex flex-wrap items-center gap-5">
              <button type="submit" className="thwip-btn text-[13px] md:text-[15px]" disabled={status === "sending"}>
                {status === "sending" ? SENDING_WORD : CONTACT_SUBMIT}
              </button>
              {status === "sent" && (
                <p className="caption-box slam-in text-[13px]">{CONTACT_SUCCESS}</p>
              )}
              {status === "error" && (
                <p className="caption-box slam-in text-[13px]" style={{ background: "var(--color-magenta)" }}>
                  {CONTACT_ERROR}
                </p>
              )}
            </div>
          </form>

          {/* a tiny stamp in the corner of the letter */}
          <div
            className="absolute -top-5 right-6 rotate-6 border-2 px-3 py-2 md:right-10"
            style={{ borderColor: "var(--color-ink)", background: "var(--color-paper)" }}
            aria-hidden="true"
          >
            <p className="t-display text-[10px]" style={{ color: "var(--color-ink)" }}>{AIRVERSE_STAMP}</p>
          </div>
        </div>

        {/* contact links as THWIP buttons */}
        <ul className="mt-14 flex flex-wrap items-center justify-center gap-5">
          {CONTACT_LINKS.map((link, i) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                className={`thwip-btn thwip-btn--${["magenta", "cyan", "yellow"][i % 3]} block text-[13px] md:text-[15px]`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* sign-off */}
        <div className="mt-16 flex w-full flex-col items-center gap-3 pb-12 md:flex-row md:justify-between">
          <p className="t-note text-[14px] text-body" >{FOOTER_SIGNOFF}</p>
          <div className="flex items-baseline gap-3">
            <p className="t-display text-2xl text-paper">{NAME}</p>
            <p className="t-note text-[14px] text-body">{END_CLOSING}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
