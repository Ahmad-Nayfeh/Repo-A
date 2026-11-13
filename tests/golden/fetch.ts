/**
 * Test-time fetch of third-party reference data that may not be redistributed (D-005 revised).
 * Files are cached in tests/golden/.fetched (git-ignored) and never committed.
 * In CI (env CI=true) a failed fetch is a test failure, not a skip.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(import.meta.dirname, '.fetched');

export async function fetchCached(name: string, url: string): Promise<string | null> {
  const p = join(DIR, name);
  if (existsSync(p)) return readFileSync(p, 'utf8');
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const t = await r.text();
    mkdirSync(DIR, { recursive: true });
    writeFileSync(p, t);
    return t;
  } catch (e) {
    if (process.env.CI) throw new Error(`Golden data fetch failed in CI for ${url}: ${String(e)}`);
    console.warn(`[golden] could not fetch ${url} (offline?): ${String(e)}`);
    return null;
  }
}

/** Parse a MATPOWER matrix block like `mpc.bus = [ ... ];` into rows of numbers. */
export function matpowerBlock(text: string, name: string): number[][] {
  const start = text.indexOf(`mpc.${name} = [`);
  if (start < 0) throw new Error(`block ${name} not found`);
  const end = text.indexOf('];', start);
  return text
    .slice(text.indexOf('\n', start) + 1, end)
    .split('\n')
    .map((l) => l.replace(/%.*$/, '').replace(/;/g, '').trim())
    .filter((l) => l.length > 0)
    .map((l) => l.split(/\s+/).map(Number));
}
