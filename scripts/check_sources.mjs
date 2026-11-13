// QC tooling (docs/org/research.md gate 1, qc.md gate 3, safety.md): run `node scripts/check_sources.mjs`.
// 1. Every source ID cited in src/data/*.ts exists in research/sources/*.md (or a topic note).
// 2. Simplification IDs S-Fx-nn in docs/design/FIDELITY.md and src/ui/notes.ts cover each other both ways.
// 3. No excluded employer source (alfanar / TH-10) is referenced from src/.
import { readFileSync, readdirSync } from 'node:fs';
const read = (p) => readFileSync(p, 'utf8');
let fail = 0;
const bad = (m) => { console.error('✗', m); fail++; };

const bib = readdirSync('research/sources').map((f) => read(`research/sources/${f}`)).join('\n') + readdirSync('research').filter((f) => f.endsWith('.md')).map((f) => read(`research/${f}`)).join('\n');
const data = readdirSync('src/data').map((f) => read(`src/data/${f}`)).join('\n');
const ids = new Set([...data.matchAll(/\b(KSA|SC|PR|PF|TH|PQ|OP|GD|K2|SP2|AS2|T12|S2)-[0-9A-Z]{1,3}\b/g)].map((m) => m[0]));
for (const id of ids) if (!bib.includes(id)) bad(`source ID ${id} cited in src/data but not found in research/`);
console.log(`checked ${ids.size} source IDs cited in src/data`);

const fid = new Set([...read('docs/design/FIDELITY.md').matchAll(/S-F\d-\d\d/g)].map((m) => m[0]));
const notes = new Set([...read('src/ui/notes.ts').matchAll(/S-F\d-\d\d/g)].map((m) => m[0]));
for (const id of fid) if (!notes.has(id)) bad(`${id} in FIDELITY.md but not in Model notes`);
for (const id of notes) if (!fid.has(id)) bad(`${id} in Model notes but not in FIDELITY.md`);
console.log(`simplification IDs: FIDELITY ${fid.size}, Model notes ${notes.size}`);

const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${d}/${e.name}`) : [`${d}/${e.name}`]));
for (const f of walk('src')) { const t = read(f); if (/alfanar/i.test(t) || /\bTH-10\b/.test(t)) bad(`excluded employer source referenced in ${f}`); }

if (fail) { console.error(`${fail} problem(s)`); process.exit(1); }
console.log('✓ sources, simplification coverage and employer-data checks pass');
