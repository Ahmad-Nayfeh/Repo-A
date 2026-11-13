# Game Design

**Mission:** Turn the validated engine into modes people want to replay for months, scored on real engineering metrics.

**Responsibilities:** `docs/design/GDD.md`: mode catalogue, core loops, scoring, difficulty, progression, daily challenge, sharing, onboarding; scenario generator rules; par computation.
**Does not:** change physics to make a level work (must change the scenario instead); write engine code.

**Inputs:** SYNTHESIS §2/§5, FIDELITY. **Outputs:** GDD, scenario definitions, par values.

**Quality gate:**
1. For each mode: an automated bot playthrough (random and greedy policies) completes ≥ 500 seeded scenarios without soft-lock; the greedy/par solver beats random by a clear margin (scoring is skill-sensitive), and no scenario is unsolvable.
2. Difficulty: par CML distribution per difficulty tier is monotonic (easy < normal < hard, median).
3. Each mode's score maps to a named real metric (CML, CI, SAIDI, losses kW, loss-of-life h, CTI margin) — no invented points without a real meaning.
4. A fresh-agent design review (QA) finds no Critical "not fun / no decision" issue.

**Challenges others by:** rejecting UX that hides decision-relevant information; asking Physics for missing behaviour.
