// Re-records only the last scene (outro) of the explainer and splices it onto an existing video.
// Use when only the outro's text changed (for example the address). Usage:
//   node video/outro-only.cjs <existing.mp4> <result.mp4>
// Needs video/serve/ with stage.html and fonts/ (see docs/site-move.md), playwright and ffmpeg.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const [src, dst] = process.argv.slice(2);
const root = path.join(__dirname, 'serve');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); fs.readFile(path.join(root, p), (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); r.end(d); }); }).listen(8771);
(async () => {
  const timeline = JSON.parse(fs.readFileSync(path.join(__dirname, 'timeline.json')));
  const { off, marks } = JSON.parse(fs.readFileSync(path.join(__dirname, 'marks.json')));
  const seg = timeline.at(-1); if (seg.id !== 'outro') throw new Error('last scene is not the outro');
  const cut = off + marks.at(-1).t; // where the outro starts in the existing video
  const total = timeline.reduce((a, s) => a + s.dur + s.pad, 0), before = total - seg.dur - seg.pad;
  const fr = path.join(__dirname, 'frames-outro'); fs.rmSync(fr, { recursive: true, force: true }); fs.mkdirSync(fr);
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('PAGE EXC', e.message));
  await p.goto('http://localhost:8771/stage.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  const cdp = await ctx.newCDPSession(p); const frames = [];
  cdp.on('Page.screencastFrame', async (f) => { const n = frames.length; fs.writeFileSync(path.join(fr, `f${String(n).padStart(6, '0')}.jpg`), Buffer.from(f.data, 'base64')); frames.push(f.metadata.timestamp); try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch {} });
  // Same loop as runStage in stage.html, for the outro alone; the progress bar continues from where it was.
  await p.evaluate(({ seg, total, before }) => { window.__go = async () => {
    const $ = (s) => document.querySelector(s); const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const start = performance.now(); seg.cues.forEach((c, k) => setTimeout(() => { $('#capt').textContent = c.text; }, k === 0 ? 0 : c.s * 1000));
    document.querySelectorAll('.scene').forEach((s) => s.classList.toggle('on', s.id === 's-outro'));
    const until = start + (seg.dur + seg.pad) * 1000;
    while (performance.now() < until) { $('#prog').style.width = `${((before + (performance.now() - start) / 1000) / total) * 100}%`; await sleep(100); }
    window.__done = true; }; }, { seg, total, before });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  const t0 = await p.evaluate(() => { const t = Date.now() / 1000; window.__go(); return t; });
  await p.waitForFunction(() => window.__done === true, null, { timeout: 60000, polling: 200 });
  await cdp.send('Page.stopScreencast'); await b.close(); srv.close();
  // keep frames from the moment the scene started
  let list = 'ffconcat version 1.0\n'; let first = frames.findIndex((t) => t >= t0); if (first < 0) first = 0;
  for (let i = first; i < frames.length; i++) { const d = i + 1 < frames.length ? frames[i + 1] - frames[i] : 0.5; list += `file f${String(i).padStart(6, '0')}.jpg\nduration ${d.toFixed(4)}\n`; }
  fs.writeFileSync(path.join(fr, 'list.txt'), list);
  console.log('outro frames', frames.length - first, 'cut at', cut.toFixed(3), 's');
  // old picture up to the cut + new outro; the sound track is copied unchanged
  execFileSync('ffmpeg', ['-y', '-i', src, '-f', 'concat', '-safe', '0', '-i', path.join(fr, 'list.txt'),
    '-filter_complex', `[0:v]trim=0:${cut.toFixed(3)},setpts=PTS-STARTPTS,fps=30[a];[1:v]fps=30,format=yuv420p,setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0[v]`,
    '-map', '[v]', '-map', '0:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-c:a', 'copy', '-movflags', '+faststart', '-shortest', dst], { stdio: 'ignore' });
  console.log('written', dst);
})().catch((e) => { console.error(e); process.exit(1); });
