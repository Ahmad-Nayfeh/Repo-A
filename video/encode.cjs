// Re-encode from saved frames + marks (no re-recording).
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const timeline = JSON.parse(fs.readFileSync(path.join(__dirname, 'timeline.json')));
const { off, marks } = JSON.parse(fs.readFileSync(path.join(__dirname, 'marks.json')));
const fr = path.join(__dirname, 'frames'), out = path.join(__dirname, 'out'); fs.mkdirSync(out, { recursive: true });
const args = ['-y']; timeline.forEach((s) => args.push('-i', path.join(__dirname, 'audio', `${s.id}.mp3`)));
const ms = (i) => Math.max(0, Math.round((off + marks[i].t) * 1000));
const filt = timeline.map((s, i) => `[${i}:a]adelay=${ms(i)}|${ms(i)},aresample=48000[a${i}]`).join(';') + ';' + timeline.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${timeline.length}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[aout]`;
execFileSync('ffmpeg', [...args, '-filter_complex', filt, '-map', '[aout]', '-ar', '48000', path.join(out, 'narration.wav')], { stdio: 'ignore' });
execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', path.join(fr, 'list.txt'), '-i', path.join(out, 'narration.wav'), '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-shortest', path.join(out, 'grid-shift-explainer-ar.mp4')], { stdio: 'ignore' });
// subtitles (WebVTT) from the scene marks
const ts = (x) => { const h = Math.floor(x / 3600), m = Math.floor((x % 3600) / 60), s = x % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`; };
let vtt = 'WEBVTT\n\n';
let n = 0; timeline.forEach((s, i) => { const a = Math.max(0, off + marks[i].t); for (const c of s.cues) vtt += `${++n}\n${ts(a + c.s)} --> ${ts(a + c.e)}\n${c.text}\n\n`; });
fs.writeFileSync(path.join(out, 'grid-shift-explainer-ar.vtt'), vtt);
console.log('encoded');
