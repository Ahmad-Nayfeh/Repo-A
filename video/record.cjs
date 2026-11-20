// Records stage.html via the CDP screencast (real time), then builds the narrated MP4 with ffmpeg.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const root = path.join(__dirname, 'serve');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; fs.readFile(path.join(root, p), (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); r.end(d); }); }).listen(8770);
(async () => {
  const fr = path.join(__dirname, 'frames'); fs.rmSync(fr, { recursive: true, force: true }); fs.mkdirSync(fr);
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); p.on('console', (m) => { if (m.type() === 'error') console.log('PAGE ERR', m.text()); }); p.on('pageerror', (e) => console.log('PAGE EXC', e.message));
  await p.goto('http://localhost:8770/stage.html'); await p.waitForTimeout(800);
  const cdp = await ctx.newCDPSession(p); const frames = [];
  cdp.on('Page.screencastFrame', async (f) => { const n = frames.length; fs.writeFileSync(path.join(fr, `f${String(n).padStart(6, '0')}.jpg`), Buffer.from(f.data, 'base64')); frames.push(f.metadata.timestamp); try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch {} });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  const timeline = JSON.parse(fs.readFileSync(path.join(__dirname, 'timeline.json')));
  const t0wall = await p.evaluate(async (tl) => { const t = Date.now() / 1000; window.runStage(tl); return t; }, timeline);
  await p.waitForFunction(() => window.__done === true, null, { timeout: 600000, polling: 500 });
  await p.waitForTimeout(800);
  const marks = await p.evaluate(() => window.__marks);
  await cdp.send('Page.stopScreencast'); await b.close(); srv.close();
  // ffconcat with per-frame durations (variable frame rate -> 30 fps later)
  let list = 'ffconcat version 1.0\n';
  for (let i = 0; i < frames.length; i++) { const d = i + 1 < frames.length ? frames[i + 1] - frames[i] : 0.5; list += `file f${String(i).padStart(6, '0')}.jpg\nduration ${d.toFixed(4)}\n`; }
  fs.writeFileSync(path.join(fr, 'list.txt'), list);
  const off = t0wall - frames[0];
  console.log('frames', frames.length, 'span', (frames.at(-1) - frames[0]).toFixed(1), 's, audio offset', off.toFixed(3));
  fs.writeFileSync(path.join(__dirname, 'marks.json'), JSON.stringify({ off, marks }, null, 1));
  const out = path.join(__dirname, 'out'); fs.mkdirSync(out, { recursive: true });
  // audio: each segment delayed to its scene start
  const args = ['-y']; timeline.forEach((s) => args.push('-i', path.join(__dirname, 'audio', `${s.id}.mp3`)));
  const filt = timeline.map((s, i) => `[${i}:a]adelay=${Math.max(0, Math.round((off + marks[i].t) * 1000))}|${Math.max(0, Math.round((off + marks[i].t) * 1000))},aresample=48000[a${i}]`).join(';') + ';' + timeline.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${timeline.length}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[aout]`;
  execFileSync('ffmpeg', [...args, '-filter_complex', filt, '-map', '[aout]', '-ar', '48000', path.join(out, 'narration.wav')], { stdio: 'ignore' });
  execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', path.join(fr, 'list.txt'), '-i', path.join(out, 'narration.wav'), '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-shortest', path.join(out, 'grid-shift-explainer-ar.mp4')], { stdio: 'ignore' });
  console.log('done');
})();
