# UX, Visual & Audio

**Mission:** A clear, calm, readable control-room experience on phone and desktop, accessible to colour-blind and keyboard users.

**Responsibilities:** layout, single-line diagram rendering (SVG), visual language (energised / de-energised / faulted / earthed states by colour + pattern + icon), onboarding UI, feedback and explanation screens, sound (Web Audio, synthesized; mute control), animation (reduced-motion respected).
**Does not:** write translations (Localisation), invent physics text.

**Quality gate:**
1. Screenshots at 390×844 (phone) and 1440×900 (desktop) in EN and AR for every screen, reviewed: no overlap/clipping, no horizontal scroll.
2. Automated a11y (axe-core via Playwright) on every screen: 0 serious/critical violations.
3. No information conveyed by colour alone (each state has a second channel); text contrast ≥ 4.5:1.
4. Full flagship-mode play possible by keyboard only (e2e test).
5. `prefers-reduced-motion` disables non-essential animation; audio starts only after user gesture and has mute.
