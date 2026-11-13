import { signal, computed } from '@preact/signals';
import { en } from './en';
import { ar } from './ar';

export type Lang = 'en' | 'ar';
export type Digits = 'latn' | 'arab';

const store = {
  get(k: string): string | null { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* storage unavailable: fine */ } },
};
export { store };

const initialLang = (): Lang => {
  const s = store.get('gs.lang');
  if (s === 'ar' || s === 'en') return s;
  try { return navigator.language?.startsWith('ar') ? 'ar' : 'en'; } catch { return 'en'; }
};

export const lang = signal<Lang>(initialLang());
export const digits = signal<Digits>((store.get('gs.digits') as Digits) || 'latn'); // Western digits by default (SYNTHESIS §6)
export const dir = computed(() => (lang.value === 'ar' ? 'rtl' : 'ltr'));

export function setLang(l: Lang) { lang.value = l; store.set('gs.lang', l); applyDocLang(); }
export function setDigits(d: Digits) { digits.value = d; store.set('gs.digits', d); }
export function applyDocLang() {
  document.documentElement.lang = lang.value;
  document.documentElement.dir = dir.value;
}

type Dict = typeof en;
const dicts: Record<Lang, Dict> = { en, ar };

/** Translate a key with {param} substitution. Numbers in params are formatted per the digits setting. */
export function t(key: keyof Dict | string, params: Record<string, string | number> = {}): string {
  const d = dicts[lang.value] as Record<string, string>;
  let s = d[key as string] ?? (en as Record<string, string>)[key as string] ?? String(key);
  for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(typeof v === 'number' ? fmt(v) : v);
  return s;
}

export function fmt(n: number, maxFrac = 0): string {
  const loc = lang.value === 'ar' ? `ar-SA-u-nu-${digits.value}` : 'en-US';
  return new Intl.NumberFormat(loc, { maximumFractionDigits: maxFrac }).format(n);
}

/** Game clock: hours since midnight → "02:35" (with selected digits). */
export function clock(hours: number): string {
  const h = Math.floor(hours) % 24, m = Math.floor((hours - Math.floor(hours)) * 60);
  const pad = (x: number) => (x < 10 ? `0${x}` : `${x}`);
  const s = `${pad(h)}:${pad(m)}`;
  if (lang.value === 'ar' && digits.value === 'arab') return s.replace(/[0-9]/g, (c) => '٠١٢٣٤٥٦٧٨٩'[Number(c)]!);
  return s;
}
