# KHAYAL VERSE — the plan

My one-page portfolio, told like a Spider-Verse comic. The scroll **is** the
film: the visitor scrubs the video with the wheel, and the whole site is one
continuous ink world — no section-scroller, no template energy.

This file is my working checklist. It's what I keep coming back to when I
want to change something without breaking the world.

## The story (what a visitor gets)

1. **The film** — a pinned, scroll-scrubbed video: a boy at a computer,
   a glitch, and the universe pulls him in. Captions slam in like comic
   narration boxes.
2. **The universe** — four chapter panels (ORIGIN, LUNORA, SMART BOT,
   WHAT'S NEXT), each a living 3D diorama. Press one and it FLIP-expands
   into a full issue spread.
3. **The journey** — the education story as a sketchbook strip on paper.
4. **The multiverse** — skill cards as variant covers, E-#### dimensions.
5. **Contact** — a comic letter form + THWIP link buttons.

Surprise cameos thread through it: a pig-spider THWIP at the journey, and
the spider riding a web across the multiverse mid-section. Scrub-driven,
so they rewind perfectly.

## What it must feel like

- Premium editorial first, comic energy second. The film language
  (caption boxes, halftone, misregistration, line boil, 12fps accents)
  is the interface, not decoration.
- Hand-made, never templated. Cameos are drawn in my own ink style.

### Colors

| token | value | role |
|---|---|---|
| ink | #0a090e | the ground |
| ink-soft / ink-card | #131019 / #17141f | raised panels |
| paper | #f2ecdf | display type on ink; journey's ground |
| magenta | #ff2e88 | primary print ink |
| cyan-el | #00e5ff | secondary print ink |
| royal | #2f5cff | journey accent on paper |
| warning | #ffd60a | caption boxes, SFX, emblem |

### Type

- Display: **Bangers** (self-hosted), uppercase, line-height 0.96,
  scaleX 0.97 (the letterer's squeeze).
- Body: **Archivo** 400–700, 65–75ch measure, 15px floor on forms.
- Letterer: **Patrick Hand SC** for captions, notes, stamps — all-caps.

### Materials

- Halftone (Ben-Day dots via radial-gradient, `--dot-color` tint).
- Hatch (crisscross 45° shading).
- Misregistration (magenta/cyan ghost borders, boiling at 0.25s steps).
- Line boil (`.boil` 3-position wobble — 12fps "on 2s").
- Ink frame (paper border + ink outline + dashed inset rule).
- Paper page (journey's #f2ecdf ground with faint washes).

### Motion grammar

- Lenis smooth scroll (1.04s expo). One master rAF. transform/opacity only.
- Video: scroll-scrubbed, lerped, both directions, never autoplays.
  Pinned 460vh desktop / 380vh mobile; last 8% holds the end title.
- Every scroll entrance is a pure scrub envelope (a function of section
  progress): reversible, replays on re-entry, can't leak outside its
  window. No timers, no one-shot CSS classes on scroll.
- Panels: idle bob, spring proximity (cursor brush), hover tilt with free
  plane parallax, FLIP overlay expansion.
- `prefers-reduced-motion`: scrub stays (it's input-driven), decorations
  go static or binary.

## How the code is laid out

```
src/
  engine/     scroll store (Lenis + master rAF), scrub math,
              spring physics, video scrubber
  components/ hero film, universe + chapter boxes + overlay,
              journey, multiverse, contact, nav/web-jump/scroll-top,
              cameos
  content/    story.ts — ALL copy lives here, every line [EDIT ME]
```

Rules I hold myself to:

- All visible copy in `src/content/story.ts`. If a word is on the page,
  it's a constant there.
- No eyebrow above any heading; captions sit beside or below.
- One shadow language: hard offset ink blocks. Never border + soft blur
  together.
- 60fps is non-negotiable: read-then-write in the engine, parked
  offscreen tracks, no layout thrash.
- Video is decorative (`aria-hidden`); everything it says also exists as
  text. Focus-visible on every interactive thing.
- Contact form has no backend: posts to `CONTACT_ENDPOINT` in story.ts;
  empty endpoint falls back to a prefilled mailto.

## Media notes

- `public/media/hero.mp4` (1080p) + `hero-mobile.mp4` (720p), encoded
  with `-g 6` so scrubbing doesn't hop. Poster: `hero-poster.jpg`.
  10.25s; beats: calm ≤4.2s, glitch 4.2–5.2s, warp 5.2–9.5s,
  flash 9.5–10.1s. Scene captions in story.ts are timed to these.
- `spiderman-web.png` — the multiverse rider. Mine, added by hand.
- Fonts self-hosted in `public/fonts/` (Bangers, Patrick Hand SC,
  Archivo + italic).

## Dev

```
npm install
npm run dev          # http://localhost:5173
npm run build       # single-file dist/index.html
npm run preview
```

## TODO (mine)

- [x] hero film scrubbed + caption system
- [x] universe panels + issue overlay
- [x] journey strip on paper
- [x] multiverse variant cards
- [x] contact letter + THWIP buttons
- [x] nav web-jump chips + page counter
- [x] cameos (pig-spider THWIP, web rider)
- [x] reduced-motion paths everywhere
- [ ] paste a real form endpoint into story.ts (`CONTACT_ENDPOINT`)
- [ ] re-check contact handles in story.ts when they change
