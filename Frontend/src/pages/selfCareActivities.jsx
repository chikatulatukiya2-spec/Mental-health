import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Volume2, VolumeX, ChevronRight, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { logSession } from './selfCareStore';

/* ---------- shared audio helpers (Web Audio + vibration) ---------- */
let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
export function cue(freq = 660, duration = 0.25, volume = 0.12) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch { /* ignore */ }
  if (navigator.vibrate) navigator.vibrate(60);
}
export function finishCue() { cue(880, 0.18); setTimeout(() => cue(1100, 0.3), 180); }
export function say(text) {
  try { window.speechSynthesis && window.speechSynthesis.speak(new SpeechSynthesisUtterance(text)); } catch { /* ignore */ }
}
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/* ---------- Activity box chrome ---------- */
function ActivityShell({ night, onToggleNight, children }) {
  return (
    <div className={night ? 'activity-box wind-down' : 'activity-box'}>
      {onToggleNight && (
        <button className="night-toggle" onClick={onToggleNight} type="button">
          {night ? '☀️ Exit wind-down' : '🌙 Wind-down mode'}
        </button>
      )}
      {children}
    </div>
  );
}

/* ---------- #5 audio guidance + #1 cues ---------- */
function useCueToggle() {
  const [sound, setSound] = useState(true);
  return [sound,
    () => (
      <button className="cuetoggle" type="button" title="Toggle sound cues"
        onClick={() => { setSound((v) => !v); if (window.speechSynthesis) window.speechSynthesis.cancel(); }}>
        {sound ? <Volume2 size={14} /> : <VolumeX size={14} />} cues <b>{sound ? 'on' : 'off'}</b>
      </button>
    )];
}

/* ---------- Breathing pacer: 4s inhale / 4s hold / 6s exhale ---------- */
const BREATH_PHASES = [
  { label: 'Breathe in', secs: 4, scale: 1, f: 520, spoken: 'Breathe in' },
  { label: 'Hold', secs: 4, scale: 1, f: 660, spoken: 'Hold' },
  { label: 'Breathe out', secs: 6, scale: 0.62, f: 392, spoken: 'Breathe out... slowly' },
];
const BREATH_CYCLE = 14;

export function BreathTimer({ type = 'breathing', title = 'Breathing Exercises' }) {
  const [running, setRunning] = useState(false);
  const [t, setT] = useState(0);
  const [sound, cueToggle] = useCueToggle();
  const spokenRef = useRef(-1);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setT((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const inCycle = t % BREATH_CYCLE;
  const cycles = Math.floor(t / BREATH_CYCLE);
  let idx = 0, remainder = inCycle;
  for (let i = 0; i < BREATH_PHASES.length; i++) {
    const p = BREATH_PHASES[i];
    if (remainder < p.secs) { idx = i; break; }
    remainder -= p.secs;
  }
  const phase = BREATH_PHASES[idx];
  const phaseKey = Math.floor(t / 1);

  useEffect(() => {
    if (!running || !sound || phaseKey === spokenRef.current) return;
    spokenRef.current = phaseKey;
    cue(phase.f, 0.3);
    say(phase.spoken);
  }, [phaseKey, running, sound]); // eslint-disable-line

  const finish = () => {
    setRunning(false);
    if (cycles >= 2 && sound) finishCue();
    logSession(type, title);
  };

  const ring = useMemo(() => {
    const R = 88, C = 2 * Math.PI * R;
    return { R, C, offset: C * (1 - remainder / phase.secs) };
  }, [remainder, phase]);

  return (
    <ActivityShell>
      {cueToggle}
      <div className="breath-orb-wrap">
        <svg className="breath-ring" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r={ring.R} fill="none" stroke="rgba(91,84,213,.18)" strokeWidth="5" />
          <circle className="breath-ring-progress" cx="100" cy="100" r={ring.R} fill="none"
            stroke="currentColor" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={ring.C} strokeDashoffset={ring.offset}
            transform="rotate(-90 100 100)" />
        </svg>
        <div className="breath-orb" style={{ transform: `scale(${phase.scale})`, transitionDuration: `${phase.secs}s` }} />
        <div className="breath-label" aria-live="polite">
          <b>{phase.label}</b>
          <span>{Math.max(1, phase.secs - remainder)}s</span>
        </div>
      </div>
      <p className="activity-count">Cycles completed: {cycles}</p>
      <div className="activity-controls">
        <button className="activity-btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? 'Pause' : t ? 'Resume' : 'Start breathing'}
        </button>
        <button className="activity-btn" onClick={finish}><RotateCcw size={16} /> Done</button>
      </div>
      <small className="activity-note">Stop anytime if you feel dizzy or uncomfortable.</small>
    </ActivityShell>
  );
}

/* ---------- Countdown timer (#2 logs sessions, #6 journal handoff) ---------- */
export function FocusTimer({ type, title, suggested = 3, night, onToggleNight }) {
  const presets = [1, suggested, suggested + 2];
  const [minutes, setMinutes] = useState(suggested);
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(suggested * 60);
  const [sound, cueToggle] = useCueToggle();
  const done = left === 0;

  useEffect(() => {
    if (!running || done) return;
    const id = setInterval(() => setLeft((x) => Math.max(0, x - 1)), 1000);
    return () => clearInterval(id);
  }, [running, done]);

  useEffect(() => {
    if (done && running) {
      setRunning(false);
      if (sound) finishCue();
      logSession(type, title);
    }
  }, [done]); // eslint-disable-line

  const pick = (m) => { setRunning(false); setMinutes(m); setLeft(m * 60); };
  const completeText = `I completed "${title}" on MindEase.`;

  return (
    <ActivityShell night={night} onToggleNight={onToggleNight}>
      {cueToggle}
      <div className="timer-display">{done ? '✓' : fmt(left)}</div>
      {done
        ? <p className="activity-done"><CheckCircle2 size={16} /> Nice — that counts. Well done.</p>
        : <div className="timer-presets">
            {presets.map((m) => (
              <button key={m} className={m === minutes ? 'pill-btn active' : 'pill-btn'} onClick={() => pick(m)}>{m} min</button>
            ))}
          </div>}
      <div className="activity-controls">
        <button className="activity-btn primary" disabled={done} onClick={() => setRunning((r) => !r)}>
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? 'Pause' : done ? 'Done' : left < minutes * 60 ? 'Resume' : 'Start timer'}
        </button>
        <button className="activity-btn" onClick={() => { setRunning(false); setLeft(minutes * 60); }}>
          <RotateCcw size={16} /> Reset
        </button>
      </div>
      {done && (
        <div className="activity-controls">
          <Link className="activity-btn" to={`/journal?title=${encodeURIComponent(title)}&content=${encodeURIComponent(completeText)}`}>
            <PenLine size={16} /> Note how it went
          </Link>
          <Link className="activity-btn" to="/mood">Log your mood</Link>
        </div>
      )}
      {!done && <small className="activity-note">Racing thoughts? Just let the timer run — you don't have to do it perfectly.</small>}
    </ActivityShell>
  );
}

/* ---------- #7 ambient soundscapes ---------- */
const SCAPES = {
  rain: { f: 1400, q: 0.4 },
  waves: { f: 320, q: 0.5, lfo: true },
  steady: { f: 700, q: 0.4 },
};
export function Soundscape() {
  const [scayType, setScayType] = useState('rain');
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const nodes = useRef(null);

  const stop = () => {
    if (nodes.current) {
      const { src, gain, } = nodes.current;
      try { gain.gain.setTargetAtTime(0, getCtx().currentTime, 0.1); src.stop(getCtx().currentTime + 0.4); } catch { /* ignore */ }
      nodes.current = null;
    }
    setPlaying(false);
  };
  useEffect(() => () => { try { nodes.current?.src?.stop(); } catch { /* ignore */ } }, []);

  const start = (type) => {
    stop();
    const ctx = getCtx();
    const spec = SCAPES[type];
    // 2s looped noise buffer
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = spec.f; filter.Q.value = spec.q;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.3);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
    if (spec.lfo) { // slow swell for waves
      const lfo = ctx.createOscillator(), lgain = ctx.createGain();
      lfo.frequency.value = 0.14; lgain.gain.value = volume * 0.6;
      lfo.connect(lgain).connect(gain.gain);
      lfo.start();
      nodes.current = { src, gain, lfo };
    } else {
      nodes.current = { src, gain };
    }
    setPlaying(true);
    setScayType(type);
  };

  return (
    <div className="activity-box">
      <p className="activity-count">Choose a calm sound</p>
      <div className="timer-presets">
        {[['rain', '🌧️ Rain'], ['waves', '🌊 Waves'], ['steady', '🌫️ Soft hum']].map(([k, label]) => (
          <button key={k} className={playKey(k, scayType, playing)} onClick={() => (playing && scayType === k ? stop() : start(k))}>
            {label}
          </button>
        ))}
      </div>
      <label className="volume-row">
        <VolumeX size={14} />
        <input type="range" min="0" max="1" step="0.05" value={volume}
          onChange={(e) => { const v = Number(e.target.value); setVolume(v); if (nodes.current) nodes.current.gain.gain.setTargetAtTime(v, getCtx().currentTime, 0.1); }} />
        <Volume2 size={14} />
      </label>
      <small className="activity-note">Works while timers run — try it with Mindfulness.</small>
    </div>
  );
}
function playKey(k, cur, playing) { return k === cur && playing ? 'pill-btn active' : 'pill-btn'; }

/* ---------- #8 daily plan runner: chains steps ---------- */
export const PLANS = [
  { name: 'Morning reset', steps: [['affirmations', 'Positive Affirmations', 1], ['habits', 'Healthy Habits', 2]] },
  { name: 'Night wind-down', steps: [['relaxation', 'Relaxation Music', 2], ['sleep', 'Sleep Better', 3]] },
  { name: 'Quick calm', steps: [['breathing', 'Breathing Exercises'], ['mindfulness', 'Mindfulness', 1]] },
];
export function PlanRunner({ plan, onDone }) {
  const [i, setI] = useState(0);
  const step = plan.steps[i];
  const advance = () => (i + 1 < plan.steps.length ? setI(i + 1) : onDone());
  return (
    <div className="activity-box">
      <p className="activity-count"><b>{plan.name}</b> — step {i + 1} of {plan.steps.length}</p>
      {step[0] === 'breathing'
        ? <BreathTimer />
        : <FocusTimer type={step[0]} title={step[1]} suggested={step[2]} />}
      <button className="activity-btn" onClick={advance}>
        {i + 1 < plan.steps.length ? (<>Next step <ChevronRight size={14} /></>) : 'Finish plan'}
      </button>
    </div>
  );
}
