# Game Design

**Mission:** Turn the validated engine into modes people want to replay for months, scored on real engineering metrics.

**Responsibilities:** `docs/design/GDD.md`: mode catalogue, core loops, scoring, difficulty, progression, daily challenge, sharing, onboarding; scenario generator rules; par computation.
**Does not:** change physics to make a level work (must change the scenario instead); write engine code.

**Inputs:** SYNTHESIS §2/§5, FIDELITY. **Outputs:** GDD, scenario definitions, par values.

**Quality gate (quantified after D3-28):**
1. **Solvability:** the reference bot reaches the end state in 100 % of 500 seeds per difficulty (daily re-roll covers any exception, logged).
2. **Skill sensitivity:** median CML of the reference bot ≤ 0.5 × median CML of a random-legal-action policy over 500 seeds.
3. **Mastery headroom:** the share of seeds where the oracle (knows the fault location) beats par by ≥ 10 % is between 20 % and 80 %.
4. **Difficulty:** median regret (par − oracle)/oracle is non-decreasing Easy → Normal → Hard.
5. Each score maps to a named real metric (CML, CI, minutes above rating, duty used) — no invented points.
6. Fun cannot be certified by an agent: a review pass is recorded, and an **owner playtest checklist** (opinions, not data) is in NEEDS-AHMAD.

**Challenges others by:** rejecting UX that hides decision-relevant information; asking Physics for missing behaviour.
