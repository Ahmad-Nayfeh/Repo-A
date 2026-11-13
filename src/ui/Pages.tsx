import { useState } from 'preact/hooks';
import { t, lang, setLang, digits, setDigits, fmt } from '../i18n/i18n';
import { SIMPLIFICATIONS } from './notes';
import * as P from '../data/params';
import { dailyResult, todayUTC, ENGINE_VERSION } from './session';
import type { Difficulty } from '../engine/scenario/district';
import { isMuted, setMuted } from '../audio/synth';
import { store } from '../i18n/i18n';

const REPO = 'https://github.com/ahmad-nayfeh/repo-a/blob/claude/new-session-k41b2n';

export function Home({ go, theme, setTheme }: { go: (h: string) => void; theme: string; setTheme: (t: string) => void }) {
  const [diff, setDiff] = useState<Difficulty>('normal');
  const [seed, setSeed] = useState(() => String(1 + Math.floor(Math.random() * 99999)));
  const [muted, setM] = useState(isMuted());
  const daily = dailyResult();
  const trainingStars = [0, 1, 2].map((i) => Number(store.get(`gs.training.${i}`) ?? 0));
  return (
    <div class="home">
      <header class="hero">
        <h1>⚡ {t('title')}</h1>
        <p class="sub">{t('subtitle')}</p>
        <p>{t('tagline')}</p>
      </header>
      <section class="cards">
        <article class="card">
          <h2>{t('daily')}</h2>
          <p>{t('dailyDesc')}</p>
          <p class="muted" dir="ltr">{todayUTC()}</p>
          {daily ? <p><b>{t('dailyDone')}</b> · {'★'.repeat(daily.stars)}{'☆'.repeat(3 - daily.stars)} · {fmt(daily.cml)}</p>
            : <button class="primary" onClick={() => go('#/daily')}>{t('play')}</button>}
        </article>
        <article class="card">
          <h2>{t('training')}</h2>
          <p>{t('trainingDesc')}</p>
          <div class="btns">{[0, 1, 2].map((i) => <button key={i} onClick={() => go(`#/training?t=${i}`)}>{fmt(i + 1)} {'★'.repeat(trainingStars[i]!)}</button>)}</div>
        </article>
        <article class="card">
          <h2>{t('freePlay')}</h2>
          <p>{t('freePlayDesc')}</p>
          <div class="row">
            <label>{t('difficulty')} <select value={diff} onChange={(e) => setDiff((e.target as HTMLSelectElement).value as Difficulty)}>
              {(['easy', 'normal', 'hard'] as const).map((d) => <option key={d} value={d}>{t(d)}</option>)}
            </select></label>
            <label>{t('seed')} <input inputMode="numeric" value={seed} onInput={(e) => setSeed((e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 9))} size={8} dir="ltr" /></label>
          </div>
          <button class="primary" onClick={() => go(`#/play?v=${ENGINE_VERSION}&s=${seed || '1'}&d=${diff}`)}>{t('play')}</button>
        </article>
      </section>
      <section class="settings card">
        <h2>{t('settings')}</h2>
        <div class="row">
          <label>{t('language')} <select value={lang.value} onChange={(e) => setLang((e.target as HTMLSelectElement).value as 'en' | 'ar')}><option value="ar">العربية</option><option value="en">English</option></select></label>
          <label>{t('digitsLabel')} <select value={digits.value} onChange={(e) => setDigits((e.target as HTMLSelectElement).value as 'latn' | 'arab')}><option value="latn">{t('digitsLatn')}</option><option value="arab">{t('digitsArab')}</option></select></label>
          <label>{t('theme')} <select value={theme} onChange={(e) => setTheme((e.target as HTMLSelectElement).value)}><option value="dark">{t('themeDark')}</option><option value="light">{t('themeLight')}</option></select></label>
          <label><input type="checkbox" checked={!muted} onChange={(e) => { const m = !(e.target as HTMLInputElement).checked; setMuted(m); setM(m); }} /> 🔔</label>
        </div>
      </section>
      <nav class="links">
        <a href="#/notes">{t('modelNotes')}</a> · <a href="#/glossary">{t('glossary')}</a> · <a href="#/about">{t('about')}</a>
      </nav>
      <footer class="muted">{t('footer')}</footer>
    </div>
  );
}

const LABEL: Record<string, string> = { V: 'verified', Vsec: 'secondary', D: 'derived', A: 'assumption', S: 'secondary' };

export function ModelNotes({ go }: { go: (h: string) => void }) {
  const rows: { name: string; value: string; label: string; src: string }[] = [];
  const add = (group: string, obj: Record<string, unknown>) => {
    for (const [k, v] of Object.entries(obj)) {
      if (v && typeof v === 'object' && 'label' in (v as object) && 'value' in (v as object)) {
        const p = v as { value: unknown; label: string; src: string };
        rows.push({ name: `${group}.${k}`, value: JSON.stringify(p.value), label: p.label, src: p.src });
      }
    }
  };
  add('SYSTEM', P.SYSTEM); add('SOURCE', P.SOURCE); add('SUBSTATION_LOAD', P.SUBSTATION_LOAD); add('COLD_LOAD', P.COLD_LOAD);
  add('PROTECTION', P.PROTECTION); add('FPI', P.FPI); add('OPERATIONS', P.OPERATIONS); add('FAULT_WEIGHTS', P.FAULT_WEIGHTS);
  return (
    <div class="page">
      <button class="ghost" onClick={() => go('#/')}>← {t('back')}</button>
      <h1>{t('modelNotes')}</h1>
      <p>{t('rulesetNote')}</p>
      <ul class="notes">
        {SIMPLIFICATIONS.map((s) => <li key={s.id}><code dir="ltr">{s.id}</code> {lang.value === 'ar' ? s.ar : s.en}</li>)}
      </ul>
      <h2>Parameters</h2>
      <p class="muted">verified = read in the primary source · secondary = faithful reproduction · derived = our calculation · assumption = no public source (labelled). IDs refer to research/SOURCES.md.</p>
      <div class="table-wrap" dir="ltr">
        <table class="params">
          <thead><tr><th>parameter</th><th>value</th><th>status</th><th>sources</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.name} class={r.label === 'A' ? 'assume' : ''}><td><code>{r.name}</code></td><td>{r.value}</td><td>{LABEL[r.label] ?? r.label}</td><td>{r.src}</td></tr>)}
            <tr><td><code>CABLE 3×300 Al</code></td><td>R20 0.100, R 0.130, X 0.108, R0 1.9, X0 0.08 Ω/km; C0 273 nF/km; 300 A (35 °C) / 278 A (40 °C); screen 7.0 kA 1 s</td><td>verified / derived / assumption (see FIDELITY F8)</td><td>{P.CABLE_3x300AL.src}</td></tr>
            {P.TRAFOS.map((x) => <tr key={x.id}><td><code>{x.id}</code></td><td>{x.sMVA * 1000} kVA, Z {x.zPct} %, P0 {x.p0kW} kW, Pk {x.pkkW} kW, X/R {x.xr.toFixed(1)}</td><td>verified (SEC 51-SDMS-04) / derived X/R</td><td>{x.src}</td></tr>)}
          </tbody>
        </table>
      </div>
      <p><a href={`${REPO}/docs/design/FIDELITY.md`} target="_blank" rel="noopener">FIDELITY.md</a> · <a href={`${REPO}/docs/VALIDATION.md`} target="_blank" rel="noopener">VALIDATION.md</a> · <a href={`${REPO}/research/SOURCES.md`} target="_blank" rel="noopener">SOURCES.md</a></p>
    </div>
  );
}

const GLOSSARY: { en: string; ar: string; def_en: string; def_ar: string }[] = [
  { en: 'Grid station (132/13.8 kV)', ar: 'محطة تحويل (١٣٢/١٣٫٨ ك.ف)', def_en: 'Substation that transforms transmission voltage to the 13.8 kV distribution voltage and feeds the MV feeders through circuit breakers.', def_ar: 'محطة تخفض جهد النقل إلى جهد التوزيع ١٣٫٨ ك.ف وتغذي مغذّيات الجهد المتوسط عبر قواطع.' },
  { en: 'Open ring (open loop)', ar: 'حلقة مفتوحة', def_en: 'Two feeders from two grid stations joined through a normally open point, operated radially. SEC\'s preferred configuration.', def_ar: 'مغذّيان من محطتَي تحويل يلتقيان عند نقطة فتح طبيعية ويُشغَّلان شعاعيًا. الترتيب المفضل لدى الشركة السعودية للكهرباء.' },
  { en: 'Ring main unit (RMU)', ar: 'وحدة الحلقة الرئيسية', def_en: 'Compact MV switchgear with two ring load-break switches and a tee-off (fuse-switch or breaker) feeding a transformer.', def_ar: 'لوحة جهد متوسط مدمجة فيها مفتاحا حلقة لفصل الحمل وتفرع (مفتاح بمصهر أو قاطع) يغذي محولًا.' },
  { en: 'Normally open point (NOP)', ar: 'نقطة الفتح الطبيعية', def_en: 'The ring switch left open in normal operation; closing it backfeeds part of the ring from the other grid station.', def_ar: 'مفتاح الحلقة المتروك مفتوحًا في التشغيل العادي؛ غلقه يغذي جزءًا من الحلقة عكسيًا من محطة التحويل الأخرى.' },
  { en: 'Fault passage indicator (FPI)', ar: 'مؤشر مرور العطل', def_en: 'Device that flags when fault current passed its sensor. All indicators between the source and the fault flag.', def_ar: 'جهاز يُؤشِّر عند مرور تيار عطل عبر حساسه. تُؤشِّر كل المؤشرات بين المصدر والعطل.' },
  { en: 'Earth-only FPI', ar: 'مؤشر أرضي فقط', def_en: 'An FPI that only detects residual (earth) current. It cannot see a fault with no earth current, so "not flagged" proves nothing.', def_ar: 'مؤشر يكشف التيار المتبقي (الأرضي) فقط، فلا يرى عطلًا بلا تيار أرضي؛ لذا عدم تأشيره لا يثبت شيئًا.' },
  { en: 'Residual current (3I₀)', ar: 'التيار المتبقي (3I₀)', def_en: 'Sum of the three phase currents; non-zero when current returns through earth.', def_ar: 'مجموع تيارات الأطوار الثلاثة؛ لا يساوي صفرًا عندما يعود التيار عبر الأرض.' },
  { en: 'Neutral earthing resistor (NER)', ar: 'مقاومة تأريض نقطة التعادل', def_en: 'Resistor between the transformer star point and earth that limits earth-fault current.', def_ar: 'مقاومة بين نقطة نجمة المحول والأرض تحد من تيار العطل الأرضي.' },
  { en: 'Backfeed', ar: 'التغذية العكسية', def_en: 'Supplying a section from the other end of the ring, usually by closing the NOP. Check capacity and voltage first.', def_ar: 'تغذية جزء من الطرف الآخر للحلقة، غالبًا بغلق نقطة الفتح الطبيعية. تحقَّق من السعة والجهد أولًا.' },
  { en: 'Trial close', ar: 'الإغلاق التجريبي', def_en: 'Re-energising a possibly faulted section to see whether the fault is there — a control-room decision with delays and safety checks.', def_ar: 'إعادة تغذية جزء قد يكون معطوبًا لمعرفة إن كان العطل فيه — قرار من غرفة التحكم مع مهلة وفحوص سلامة.' },
  { en: 'Isolate, secure, prove dead, earth', ar: 'اعزل، أمِّن، تحقَّق من انعدام الجهد، أرِّض', def_en: 'The safe sequence before work: open all sources, lock & tag, verify absence of voltage with an approved device, then earth.', def_ar: 'التسلسل الآمن قبل العمل: افتح كل مصادر التغذية، اقفل وعلِّق بطاقة، تحقَّق من انعدام الجهد بجهاز معتمد، ثم أرِّض.' },
  { en: 'Permit to work', ar: 'تصريح عمل', def_en: 'Safety document issued only when a section is isolated, secured and earthed; nothing may energise it while the permit is open.', def_ar: 'وثيقة سلامة لا تصدر إلا بعد عزل الجزء وتأمينه وتأريضه؛ ولا يجوز تكهربه ما دام التصريح قائمًا.' },
  { en: 'Customer minutes lost (CML)', ar: 'دقائق انقطاع المشتركين', def_en: 'Sum over customers of interruption minutes. UK Ofgem counts interruptions of 3 minutes or more; IEEE 1366 counts more than 5 minutes.', def_ar: 'مجموع دقائق الانقطاع لكل المشتركين. تحتسب Ofgem الانقطاعات من ٣ دقائق فأكثر، ويحتسب IEEE 1366 ما زاد على ٥ دقائق.' },
  { en: 'Cold-load pickup', ar: 'التقاط الحمل البارد', def_en: 'Higher-than-normal demand when supply returns after an outage (e.g., air-conditioners restarting together).', def_ar: 'طلب أعلى من المعتاد عند عودة التغذية بعد انقطاع (مثل إعادة تشغيل المكيفات معًا).' },
  { en: 'IDMT relay', ar: 'مرحّل زمن عكسي محدد أدنى', def_en: 'Overcurrent relay whose operating time falls as current rises (IEC 60255-151 curves).', def_ar: 'مرحّل زيادة تيار يقل زمن تشغيله كلما زاد التيار (منحنيات IEC 60255-151).' },
];

export function Glossary({ go }: { go: (h: string) => void }) {
  return (
    <div class="page">
      <button class="ghost" onClick={() => go('#/')}>← {t('back')}</button>
      <h1>{t('glossary')}</h1>
      <p class="muted">{lang.value === 'ar'
        ? 'المصطلحات العربية مختارة وفق الاستخدام الشائع في قطاع الكهرباء السعودي، ولم تُراجَع بندًا بندًا مقابل معجم مصطلحات الطاقة (مجمع الملك سلمان العالمي للغة العربية ووزارة الطاقة). نرحب بالتصويب.'
        : 'Arabic terms follow common usage in the Saudi power sector; they have not yet been checked term-by-term against the KSGAAL / Ministry of Energy terminology dictionary. Corrections welcome.'}</p>
      <dl class="glossary">
        {GLOSSARY.map((g) => [
          <dt key={`t${g.en}`}><span dir="ltr">{g.en}</span> — <span lang="ar" dir="rtl">{g.ar}</span></dt>,
          <dd key={`d${g.en}`}>{lang.value === 'ar' ? g.def_ar : g.def_en}</dd>,
        ])}
      </dl>
    </div>
  );
}

export function About({ go }: { go: (h: string) => void }) {
  return (
    <div class="page">
      <button class="ghost" onClick={() => go('#/')}>← {t('back')}</button>
      <h1>{t('about')}</h1>
      <p>{lang.value === 'ar'
        ? 'لعبة مجانية ومفتوحة المصدر عن تشغيل شبكات التوزيع. محركها الفيزيائي (سريان القدرة، تيارات القصر، الحماية، مؤشرات مرور العطل، مؤشرات الموثوقية) مُتحقَّق منه مقابل أمثلة منشورة. لا تستخدم أي بيانات خاصة؛ كل قيمة لها مصدر عام أو موسومة كافتراض.'
        : 'A free, open-source game about running distribution networks. Its engine (power flow, short circuit, protection, fault indicators, reliability indices) is validated against published examples. No proprietary data is used; every value has a public source or is labelled as an assumption.'}</p>
      <ul>
        <li><a href={`${REPO}/research/SYNTHESIS.md`} target="_blank" rel="noopener">Research synthesis</a></li>
        <li><a href={`${REPO}/research/SOURCES.md`} target="_blank" rel="noopener">Sources (bibliography)</a></li>
        <li><a href={`${REPO}/docs/VALIDATION.md`} target="_blank" rel="noopener">Validation results</a></li>
        <li><a href={`${REPO}/docs/DECISIONS.md`} target="_blank" rel="noopener">Decision log</a></li>
      </ul>
      <p class="muted" dir="ltr">Engine version {ENGINE_VERSION} · Fonts: Noto Sans Arabic (SIL OFL 1.1) · Preact (MIT)</p>
    </div>
  );
}
