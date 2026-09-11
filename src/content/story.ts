// ============================================================================
// STORY CONTENT — THE SINGLE SOURCE OF ALL COPY ON THIS SITE
// ----------------------------------------------------------------------------
// Every visible word on the page lives in this file. Edit freely; no logic
// lives here. The timing values in SCENES below map copy to the video's
// timeline (in seconds) — only touch the `at` fields if you swap the video.
// ============================================================================

// [EDIT ME — your name, used in the hero intro line and the end title]
export const NAME = "KHAYAL";

// [EDIT ME — top-left brand mark, shown in the fixed nav]
export const BRAND_MARK = "K·19";

// [EDIT ME — the word on the page counter chip ("PAGE 02/05")]
export const COUNTER_WORD = "PAGE";

// [EDIT ME — how many pages the comic has (the nav's "…/05" + overlay
// page count). Sections themselves stay fixed.]
export const PAGE_COUNT = 5;

// [EDIT ME — journey panel onomatopoeia ticks (last beat / odd / even)]
export const SFX_NOW = "NOW!";
export const SFX_ZIP = "ZIP!";
export const SFX_STEP = "STEP!";

// [EDIT ME — multiverse card corner sticker]
export const CANON_WORD = "CANON!";

// [EDIT ME — the SFX word breaking the letter's frame (contact)]
export const SWOOSH_WORD = "SWOOSH!";
// [EDIT ME — the corner stamp on the letter (contact)]
export const AIRVERSE_STAMP = "AIR-VERSE MAIL";
// [EDIT ME — submit button label while sending]
export const SENDING_WORD = "sending...";

// [EDIT ME — overlay close stamp + its screen-reader label]
export const CLOSE_WORD = "CLOSE";
export const ARIA_CLOSE = "close chapter";

// [EDIT ME — overlay splash title for the two chapters whose label needs
// a line break ("SMART BOT" / "WHAT'S NEXT")]
export const CH_TITLE_LINES: Record<"smartbot" | "next", [string, string]> = {
  smartbot: ["SMART", "BOT"],
  next: ["WHAT'S", "NEXT"],
};

// [EDIT ME — the scroll-top stamp's word]
export const TOP_WORD = "TOP!";

// [EDIT ME — the small nav note, top-right. keep it short]
export const NAV_NOTE = "scroll the story";

// ----------------------------------------------------------------------------
// COMIC FURNITURE — the small structural labels around the site. The
// numerals are computed; these carry the words around them.
// ----------------------------------------------------------------------------
// [EDIT ME — chapter panel's corner chip ("CH." + the panel's number)]
export const CHAPTER_NO_WORD = "CH.";
// [EDIT ME — multiverse card corner marker ("no." + the card's number)]
export const VARIANT_NO_WORD = "no.";
// [EDIT ME — the overlay's masthead, above the issue number]
export const MASTHEAD = "KHAYAL VERSE";
// [EDIT ME — the overlay's issue word ("ISSUE #03")]
export const ISSUE_WORD = "ISSUE";
// [EDIT ME — the smaller second SFX word on the overlay splash]
export const OVERLAY_SFX2 = "POW!";
// [EDIT ME — the mobile page-fold hint inside the overlay]
export const OVERLAY_TURN = "TURN THE PAGE";
// [EDIT ME — overlay credits: the role line + the publishing line]
export const CREDITS_ROLE = "story + art:";
export const CREDITS_LINE = "published in the spider-verse energy";
// [EDIT ME — the word between the numbers in "PAGE 1 OF 04"]
export const OF_WORD = "OF";

// [EDIT ME — accessibility labels. {p} is replaced with the page number]
export const ARIA_JUMP = "Throw a web to page {p}";
export const ARIA_TOP = "Back to the top of the page";
export const ARIA_PAGES = "Pages";

// [EDIT ME — final line of the end title, displayed small under the name]
export const END_CLOSING = "the journey is the point";

// ----------------------------------------------------------------------------
// SCENE TEXTS — synced to moments in the video.
// `at` = second in the video where this message is centered.
// `hold` = roughly how long it stays readable (seconds of video time).
// Supporting lines use the italic note style, displayed under the display line.
// ----------------------------------------------------------------------------
export interface SceneText {
  // [EDIT ME — the display lines for this scene. each entry is one revealed
  // line in uppercase display type; keep 2 lines, short]
  lines: [string, string];
  // [EDIT ME — small supporting annotation, lowercase]
  sub: string;
  // [EDIT ME — the word that gets the magenta + yellow-swipe underline accent]
  accent?: string;
  // [EDIT ME — video second where this scene's message is centered]
  at: number;
  // [EDIT ME — which side of the screen the message sits on: "left" | "right"]
  anchor: "left" | "right";
}

export const SCENES: SceneText[] = [
  // [EDIT ME — Scene 1: boy at computer, calm typing. hits ~2.0s of video]
  {
    lines: ["IT ALL", "STARTED AT ONCE."],
    sub: "one screen. one night. no plan.",
    accent: "STARTED",
    at: 2.0,
    anchor: "left",
  },
  // [EDIT ME — Scene 2: something glitches. hits ~4.6s of video]
  {
    lines: ["THEN THE", "REALITY CRACKED."],
    sub: "a signal. a glitch. a door.",
    accent: "CRACKED",
    at: 4.6,
    anchor: "right",
  },
  // [EDIT ME — Scene 3: pulled into the verse. hits ~7.5s of video]
  {
    lines: ["AND THE UNIVERSE", "PULLED ME IN."],
    sub: "no way back. wouldn't turn back.",
    accent: "PULLED",
    at: 7.5,
    anchor: "left",
  },
];

// [EDIT ME — the comic sound-word that pops at the glitch beat. set to "" to hide]
export const GLITCH_WORD = "KRK-CHRK";

// [EDIT ME — the opening caption, film-style "hi, I'm ..." narration box]
export const INTRO_CAPTION = "hi, i'm KHAYAL.";
// [EDIT ME — small italic note under the opening caption]
export const INTRO_NOTE = "19. frontend. hyperactive.";
// [EDIT ME — italic hint that invites scrolling, sits under the intro caption]
export const INTRO_HINT = "scroll. i'll do the rest.";

// [EDIT ME — End title over the video's final flash, before the universe opens]
export const END_TITLE = "WELCOME TO MY UNIVERSE.";

// ----------------------------------------------------------------------------
// THE UNIVERSE — the comic strip of chapters after the video.
// ----------------------------------------------------------------------------
export const UNIVERSE_TITLE = "THE UNIVERSE";
// [EDIT ME — small line under the universe title]
export const UNIVERSE_NOTE = "four chapters, one strip";
// [EDIT ME — italic annotation near the panels, feels handwritten]
export const UNIVERSE_ANNOTATION = "they're alive. poke them.";

// ----------------------------------------------------------------------------
// CHAPTERS — the four strip panels. `id` is internal; `tilt` is the resting
// wonky angle in degrees; `style` picks the panel skin ("panel" | "neon" |
// "glitch" | "web"). Entrances are scrub envelopes (no per-chapter type).
// Content lives in the overlay copy below.
// ----------------------------------------------------------------------------
export interface Chapter {
  id: "origin" | "lunora" | "smartbot" | "next";
  // [EDIT ME — panel label, shown big on the panel]
  label: string;
  // [EDIT ME — one-line teaser on the panel, under the label]
  teaser: string;
  // [EDIT ME — tiny annotation on the panel]
  note: string;
  style: "panel" | "neon" | "glitch" | "web";
  // [EDIT ME — resting rotation, degrees. keep between -8 and 8]
  tilt: number;
}

export const CHAPTERS: Chapter[] = [
  // [EDIT ME — Chapter 1: your origin story]
  { id: "origin", label: "ORIGIN", teaser: "the kid who wouldn't log off", note: "start here", style: "panel", tilt: -2 },
  // [EDIT ME — Chapter 2: LUNORA, the app you're building]
  { id: "lunora", label: "LUNORA", teaser: "habits, but make them lunar", note: "in orbit now", style: "neon", tilt: 2 },
  // [EDIT ME — Chapter 3: SMART BOT, the Telegram bot]
  { id: "smartbot", label: "SMART BOT", teaser: "a bot that actually thinks", note: "it talks back", style: "glitch", tilt: -1.5 },
  // [EDIT ME — Chapter 4: what's next]
  { id: "next", label: "WHAT'S NEXT", teaser: "frontend, futures, contact", note: "say hi", style: "web", tilt: 3 },
];

// ----------------------------------------------------------------------------
// CHAPTER FURNITURE — the small print words on each panel: button label,
// corner sticker, SFX word. Keyed by chapter id.
// ----------------------------------------------------------------------------
// [EDIT ME — each chapter's button label on the panel]
export const CH_CTA: Record<Chapter["id"], string> = {
  origin: "read chapter one",
  lunora: "enter orbit",
  smartbot: "open channel",
  next: "say hello",
};

// [EDIT ME — each chapter's corner sticker]
export const CH_STICKER: Record<Chapter["id"], string> = {
  origin: "ISSUE #01",
  lunora: "IN ORBIT",
  smartbot: "ONLINE",
  next: "TO BE CONTINUED",
};

// [EDIT ME — each chapter's SFX word breaking the panel border]
export const CH_SFX: Record<Chapter["id"], string> = {
  origin: "START!",
  lunora: "WOOSH!",
  smartbot: "BZZT-KRK!",
  next: "THWIP!",
};

// ----------------------------------------------------------------------------
// CHAPTER OVERLAY COPY — full content shown when a box expands.
// `lines` are paragraphs; keep each under ~90 chars for rhythm.
// ----------------------------------------------------------------------------
export interface ChapterContent {
  // [EDIT ME — overlay kicker, small, top of the panel]
  kicker: string;
  // [EDIT ME — overlay headline, huge display type]
  title: string;
  // [EDIT ME — list of body paragraphs]
  lines: string[];
  // [EDIT ME — closing annotation in the italic note style]
  closing: string;
  // [EDIT ME — optional link label + href (mailto, t.me, github…)]
  linkLabel?: string;
  linkHref?: string;
}

export const CHAPTER_CONTENT: Record<Chapter["id"], ChapterContent> = {
  // [EDIT ME — ORIGIN: your full story. keep paragraphs short and punchy]
  origin: {
    kicker: "chapter one",
    title: "WHERE THE SIGNAL BEGAN",
    lines: [
      "Khayal. 19. It started at a college computer: a computer specialty, a screen, and a kid who wouldn't log off.",
      "First months were raw: about two of them on HTML, CSS and JavaScript, then two more on design. Small steps, but taken at full speed.",
      "Then came bigger circles, and the toolkit grew beyond the basics: React, TypeScript, and the confidence to build real things.",
      "Today: second-year Information Technology student at university. Still that kid. Still wouldn't log off.",
    ],
    closing: "the signal never really stopped",
    linkLabel: "FOLLOW THE CODE →",
    linkHref: "https://github.com/Mister2314",
  },

  // [EDIT ME — LUNORA: the habit-tracker-style app you're vibe-coding]
  lunora: {
    kicker: "chapter two",
    title: "LUNORA",
    lines: [
      "A habit-tracker-style app, currently under construction.",
      "Built entirely through vibe coding: describe the feel, shape the flow, ship the screen. No blueprint worship, just momentum.",
      "LUNORA treats habits like moon phases: small, cyclical, worth watching. Track a day, watch a cycle form.",
      "It's not finished. That's the best part.",
    ],
    closing: "currently in orbit",
    linkLabel: "WATCH IT TAKE OFF →",
    linkHref: "https://t.me/morpheus2314",
  },

  // [EDIT ME — SMART BOT: the Telegram bot on Cloudflare Workers]
  smartbot: {
    kicker: "chapter three",
    title: "SMART BOT",
    lines: [
      "A Telegram bot, built on Cloudflare Workers and wired to an LLM API key.",
      "It's not a script that echoes keywords. It genuinely thinks and holds real conversations: questions, jokes, plans, rants at 2am.",
      "Deployed at the edge, alive around the clock, and it actually chats with me.",
      "First proof that an idea can be full-stack, smart, and shipped in one weekend.",
    ],
    closing: "ask it anything",
    linkLabel: "OPEN THE CHANNEL →",
    linkHref: "https://t.me/morpheus2314",
  },

  // [EDIT ME — WHAT'S NEXT: frontend, future plans, contact]
  next: {
    kicker: "chapter four",
    title: "WHAT'S NEXT",
    lines: [
      "Frontend, for now: interfaces that feel like places, motion that means something.",
      "The honest answer is that frontend may or may not be the final destination. The journey is the point.",
      "This site is the style proof: a universe drawn in halftones and neon, built because it deserved to exist.",
      "Want to watch where it goes? The door is open.",
    ],
    closing: "the verse keeps expanding",
    linkLabel: "THWIP INTO TELEGRAM →",
    linkHref: "https://t.me/morpheus2314",
  },
};

// ----------------------------------------------------------------------------
// JOURNEY — the education story as a sketchbook comic strip.
// `year` shows in the corner tag; `panel` is the short beat text.
// ----------------------------------------------------------------------------
export interface JourneyBeat {
  // [EDIT ME — corner year/period tag]
  year: string;
  // [EDIT ME — panel title, condensed display]
  title: string;
  // [EDIT ME — panel text. 1-2 short sentences]
  text: string;
  // [EDIT ME — italic margin note]
  note: string;
}

export const JOURNEY_BEATS: JourneyBeat[] = [
  // [EDIT ME — Beat 1: college]
  { year: "STEP 01", title: "THE COLLEGE DESK", text: "Computer specialty at college. First keys, first files, first all-nighters.", note: "where the signal began" },
  // [EDIT ME — Beat 2: first frontend months]
  { year: "STEP 02", title: "TWO MONTHS IN", text: "HTML, CSS, JavaScript. Then two more months of design: grids, type, color.", note: "fast learner, no brakes" },
  // [EDIT ME — Beat 3: bigger circles → React/TS]
  { year: "STEP 03", title: "BIGGER CIRCLES", text: "Beyond the basics: React and TypeScript with bigger groups. Real components, real state.", note: "level up" },
  // [EDIT ME — Beat 4: university]
  { year: "STEP 04", title: "UNIVERSITY", text: "Accepted into Information Technology. Currently a second-year student.", note: "still wouldn't log off" },
  // [EDIT ME — Beat 5: now, vibe coding]
  { year: "NOW", title: "VIBE CODING THE VERSE", text: "A Telegram bot that thinks, an app called LUNORA, and this universe. Built by feel.", note: "you are here" },
];

// [EDIT ME — Journey section heading]
export const JOURNEY_TITLE = "THE JOURNEY";
// [EDIT ME — Journey section sub-line]
export const JOURNEY_NOTE = "every step left ink on the page";

// ----------------------------------------------------------------------------
// MULTIVERSE — skill variants of Khayal, "alternate versions of me".
// ----------------------------------------------------------------------------
export interface Variant {
  // [EDIT ME — dimension name, shown as the card's dimension tag]
  dimension: string;
  // [EDIT ME — variant title, like an alternate-universe name]
  title: string;
  // [EDIT ME — 1-2 sentence description of this side of you]
  text: string;
  // [EDIT ME — accent color name: "magenta" | "cyan" | "yellow" | "paper"]
  color: "magenta" | "cyan" | "yellow" | "paper";
}

export const VARIANTS: Variant[] = [
  // [EDIT ME — Variant: the coder]
  { dimension: "E-1610", title: "THE BUILDER", text: "React, TypeScript, interfaces that feel like places. Ships for the joy of shipping.", color: "magenta" },
  // [EDIT ME — Variant: the designer]
  { dimension: "E-1611", title: "THE DESIGNER", text: "Type, grids, halftones. Two months of design study that never really ended.", color: "cyan" },
  // [EDIT ME — Variant: the bot whisperer]
  { dimension: "E-1612", title: "THE BOT TAMER", text: "Talks to LLMs at the edge. Wired a Telegram bot into a brain and calls it a colleague.", color: "yellow" },
  // [EDIT ME — Variant: the student]
  { dimension: "E-1613", title: "THE STUDENT", text: "Second-year IT major. The load never stops; neither does the curiosity.", color: "paper" },
];

// [EDIT ME — Multiverse section heading]
export const MULTIVERSE_TITLE = "THE MULTIVERSE";
// [EDIT ME — Multiverse sub-line]
export const MULTIVERSE_NOTE = "alternate versions of me, all canon";
// [EDIT ME — italic annotation near the cards]
export const MULTIVERSE_ANNOTATION = "same me. different ink.";

// ----------------------------------------------------------------------------
// CONTACT — the comic letter form + links.
// ----------------------------------------------------------------------------
// [EDIT ME — Contact section heading]
export const CONTACT_TITLE = "WRITE INTO MY VERSE";
// [EDIT ME — Contact sub-line]
export const CONTACT_NOTE = "every message gets read. most get answered fast.";
// [EDIT ME — name-field label]
export const CONTACT_NAME_LABEL = "your name";
// [EDIT ME — email-field label]
export const CONTACT_EMAIL_LABEL = "your email";
// [EDIT ME — message-field label]
export const CONTACT_MESSAGE_LABEL = "your message";
// [EDIT ME — placeholder hints inside the fields, lowercase pencil notes]
export const CONTACT_NAME_PLACEHOLDER = "your name";
export const CONTACT_EMAIL_PLACEHOLDER = "you@your-universe.com";
export const CONTACT_MESSAGE_PLACEHOLDER = "the first line of the letter...";
// [EDIT ME — submit button label. keep it comic.]
export const CONTACT_SUBMIT = "THWIP → THE INK DEPOT";
// [EDIT ME — success line after sending]
export const CONTACT_SUCCESS = "sent! it's in the verse now.";
// [EDIT ME — error line if sending fails]
export const CONTACT_ERROR = "the portal glitched. try again?";
// [EDIT ME — where the form posts. REPLACE with your real endpoint
// (e.g. https://formspree.io/f/xxxx). Until then the form falls back to
// opening the visitor's email app with the letter prefilled.]
export const CONTACT_ENDPOINT = "";
// [EDIT ME — fallback mail address for the mailto prefill]
export const CONTACT_MAILTO = "xeyalhuseynli06@gmail.com";
// [EDIT ME — contact links: label + href]
export const CONTACT_LINKS: { label: string; href: string }[] = [
  { label: "telegram", href: "https://t.me/morpheus2314" },
  { label: "github", href: "https://github.com/Mister2314" },
  { label: "instagram", href: "https://instagram.com/hypnos.dev" },
  { label: "email", href: "mailto:xeyalhuseynli06@gmail.com" },
];

// ----------------------------------------------------------------------------
// SURPRISE CAMEOS — the little moments.
// ----------------------------------------------------------------------------
// [EDIT ME — THWIP word when the pig-spider throws its web]
export const THWIP_WORD = "THWIP!";
// [EDIT ME — note that appears with the verse-jumper swinging through the
// multiverse mid-section (NOT at entry — it crosses once the variants
// have assembled). keep it short and dimensional.]
export const JUMPER_NOTE = "E-1610 → E-1613 express";

// ----------------------------------------------------------------------------
// FOOTER — the slim close-out after contact.
// ----------------------------------------------------------------------------
// [EDIT ME — the sign-off line at the very bottom]
export const FOOTER_SIGNOFF = "hand-built in the spider-verse energy. no template survived.";

// ----------------------------------------------------------------------------
// VIDEO TIMING MAP — how the 10.25s video timeline is divided into acts.
// Only touch these if you replace the video file.
// ----------------------------------------------------------------------------
export const VIDEO = {
  // [EDIT ME — file paths under /public]
  desktop: "/media/hero.mp4",
  mobile: "/media/hero-mobile.mp4",
  poster: "/media/hero-poster.jpg",
  // [EDIT ME — total duration in seconds (used for scrub math)]
  duration: 10.25,
} as const;
