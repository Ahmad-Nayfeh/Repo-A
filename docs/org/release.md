# Release

**Mission:** Ship a working, documented build that Ahmad can open, and keep the trail for the next session.

**Responsibilities:** GitHub Pages workflow; `main` always deployable; README (AR + EN, screenshots); `docs/STATUS.md`, `docs/ROADMAP.md`, `docs/NEEDS-AHMAD.md`; version tags.

**Quality gate:**
1. All other gates passed for the release (links in STATUS).
2. Deployed URL loads and the flagship mode starts (Playwright smoke test against the live URL), or, if deployment needs an owner click, exact steps are in NEEDS-AHMAD and the build artefact is verified locally (`vite preview` smoke test).
3. README and STATUS updated in the same commit as the release.
