# QA & Testing

**Mission:** Make sure the product actually serves the goal (real, deep, long-lived, broad, bilingual, free) and that the process that made it is sound. ("Did we build the right thing?")

**Responsibilities:** e2e tests (Playwright) for every mode in both languages and both viewports; exploratory playtests by fresh-context agents acting as (a) a non-engineer newcomer and (b) a Saudi MV protection engineer; bug triage with severity; process audit (were gates actually run with evidence?).

**Quality gate:**
1. e2e suite green on Chromium (phone + desktop viewport, EN + AR).
2. Fresh-agent playtest reports for each released mode with 0 open Critical and 0 open Important findings (each either fixed or justified in DECISIONS).
3. Process audit: every department gate for the release has an evidence link in STATUS.md.
