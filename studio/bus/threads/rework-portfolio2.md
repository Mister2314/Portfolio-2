# REWORK THREAD — Portfolio-2 anti-slop + originality pass

Date: 2026-10-24 · Agent: rework pass · Commit: `d37d9df` (`Rework: anti-slop + originality pass`) · Live: 200 on portfolio-2-inky-ten.vercel.app

## Audit findings
- **Ban list:** clean. No purple/indigo gradients (magenta/cyan/warning on ink is the stated Spider-Verse brief), no cream+terracotta, no pill-button defaults, no template skeleton (hero film → strip → sketchbook → covers → letter), no glassmorphism, no emoji-as-icons.
- **AI-tell copy:** one instance found — "cuts seamlessly" in a CinematicHero comment. Copy in `story.ts` is specific and clean; no filler sections.
- **Originality bar — two weak links, exactly where suspected:**
  1. **Ghost numerals** were an opacity trick alone: plain Bangers glyph at 0.045 opacity. Not typographic craft.
  2. **Film-leader bar** was a generic 3px magenta strip — could belong to any site.

## Fixes (surgical, concept kept)
1. `GhostNumeral` → `.ghost-numeral`: real print treatment — CMYK misregistration plates (magenta +6/3px, cyan −6/−3px) with paper halftone knocked through the glyph via `background-clip:text`, −3° rotation, forced-colors fallback. Opacity hack removed; the craft is in the plates.
2. `ProgressBar` → `.film-leader-track` / `.film-leader-fill`: 4px strip with pale rail, inset frame line, magenta-hot ink fill punched with repeating sprocket perforations, paper head edge.
3. "seamlessly" comment → "cuts clean".

## Gates (all green)
- `tsc --noEmit`: 0 errors · `npm run build`: OK (94.7 kB gzip single-file)
- Playwright sweep 390 / 768 / 1440 / 1920: 0 console errors each, no horizontal overflow at 390
- Keyboard layer verified: `2` throws web to page 02 (scrollY 0→3420), `T` returns top (→0)
- Overlay: opens via box click, focus moves in, Escape closes, reduced-motion opens instantly
- Reduced motion honored: ghost numerals fully static (no parallax writes, no animation), boil/stepped animations killed by the global rule

## Release
- Pushed `main` 1eaeacb..d37d9df · `vercel deploy --prod` → portfolio-2-mzw2ljjpd-morpheus2314s-projects.vercel.app · live alias verified **HTTP 200**
