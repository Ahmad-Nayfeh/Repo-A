"""Merge research/sources/*.md into research/SOURCES.md (run from repo root)."""
import glob
out = ["# Sources (bibliography)", "",
       "Every factual claim used in the game model must trace to an entry here.",
       "Entries are maintained per research topic in `research/sources/NN-*.md` (stable IDs).",
       "Regenerate with `python3 scripts/merge_sources.py`.", "",
       "Status tags: **verified** = read the source; **snippet-only** = seen in search results; "
       "**uncertain/conflicting** = noted with alternatives.", ""]
for f in sorted(glob.glob('research/sources/*.md')):
    out.append(f"\n---\n\n## From `{f}`\n")
    lines = open(f, encoding='utf-8').read().splitlines()
    if lines and lines[0].startswith('#'):
        lines = lines[1:]
    out.extend(lines)
open('research/SOURCES.md', 'w', encoding='utf-8').write("\n".join(out) + "\n")
