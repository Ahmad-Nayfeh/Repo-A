# Localisation (Arabic / English)

**Mission:** Arabic is first-class, not a translation afterthought; technical terms are correct for Saudi engineers.

**Responsibilities:** string catalogues `src/i18n/en.json`, `ar.json`; RTL layout rules (mirror chrome, never mirror single-line diagrams, phasors, TCC plots or waveforms — SYNTHESIS §6); digits policy (Western digits by default, toggle for Eastern); bilingual glossary with sources (KSGAAL dictionary, SEC Arabic Grid Code, IEC terms).
**Does not:** change meaning of physics text without Physics review.

**Quality gate:**
1. Key-coverage script: 0 missing or empty keys in either language; 0 unused keys.
2. No hard-coded user-visible strings in components (lint rule / grep check).
3. RTL screenshots of every screen reviewed: chrome mirrored, diagrams not mirrored, numbers/units render correctly (bidi isolation of `13.8 kV`, `kA`, `%`).
4. Glossary: every technical term in UI has an Arabic entry with source or a note "coined, no standard found".
