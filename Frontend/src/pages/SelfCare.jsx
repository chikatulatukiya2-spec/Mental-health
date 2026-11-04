import React, { useEffect, useState } from 'react';
import { Wind, Brain, Music, Heart, Leaf, Moon, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Page, TopBar } from '../components';
import { api } from '../api';

const typeIcons = {
  breathing: Wind,
  mindfulness: Brain,
  relaxation: Music,
  affirmations: Heart,
  habits: Leaf,
  sleep: Moon,
};
const FallbackIcon = Heart;

/* ---------- Breathing pacer: 4s inhale / 4s hold / 6s exhale ---------- */
const BREATH_PHASES = [
  ['Breathe in', 4, 1],
  ['Hold', 4, 1],
  ['Breathe out', 6, 0.62],
];
const BREATH_CYCLE = 14;

function BreathTimer() {
  const [running, setRunning] = useState(false);
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setT((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const inCycle = t % BREATH_CYCLE;
  const cycles = Math.floor(t / BREATH_CYCLE);
  let phase = BREATH_PHASES[0], remainder = inCycle;
  for (const p of BREATH_PHASES) {
    if (remainder < p[1]) { phase = p; break; }
    remainder -= p[1];
  }
  const [label, secs, scale] = phase;

  return (
    <div className="activity-box">
      <div className="breath-orb-wrap">
        <div
          className="breath-orb"
          style={{ transform: `scale(${scale})`, transitionDuration: `${secs}s` }}
        />
        <div className="breath-label">
          <b>{label}</b>
          <span>{Math.max(1, secs - remainder)}s</span>
        </div>
      </div>
      <p className="activity-count">Cycles completed: {cycles}</p>
      <div className="activity-controls">
        <button className="activity-btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? 'Pause' : t ? 'Resume' : 'Start breathing'}
        </button>
        <button className="activity-btn" onClick={() => { setRunning(false); setT(0); }}>
          <RotateCcw size={16} /> Reset
        </button>
      </div>
      <small className="activity-note">Stop anytime if you feel dizzy or uncomfortable.</small>
    </div>
  );
}

/* ---------- Generic countdown timer for other exercises ---------- */
function FocusTimer({ suggested = 3 }) {
  const presets = [1, suggested, suggested + 2];
  const [minutes, setMinutes] = useState(suggested);
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(suggested * 60);
  const done = left === 0;

  useEffect(() => {
    if (!running || done) return;
    const id = setInterval(() => setLeft((x) => Math.max(0, x - 1)), 1000);
    return () => clearInterval(id);
  }, [running, done]);

  const pick = (m) => { setRunning(false); setMinutes(m); setLeft(m * 60); };
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');

  return (
    <div className="activity-box">
      <div className="timer-display">{done ? '✓' : `${mm}:${ss}`}</div>
      {done && <p className="activity-done"><CheckCircle2 size={16} /> Nice — that counts. Well done.</p>}
      <div className="timer-presets">
        {presets.map((m) => (
          <button key={m} className={m === minutes ? 'pill-btn active' : 'pill-btn'} onClick={() => pick(m)}>
            {m} min
          </button>
        ))}
      </div>
      <div className="activity-controls">
        <button
          className="activity-btn primary"
          disabled={done}
          onClick={() => setRunning((r) => !r)}
        >
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? 'Pause' : done ? 'Done' : left < minutes * 60 ? 'Resume' : 'Start timer'}
        </button>
        <button className="activity-btn" onClick={() => { setRunning(false); setLeft(minutes * 60); }}>
          <RotateCcw size={16} /> Reset
        </button>
      </div>
      <small className="activity-note">Racing thoughts? Just let the timer run — you don't have to do it perfectly.</small>
    </div>
  );
}

const ACTIVITY_BY_TYPE = {
  breathing: () => <BreathTimer />,
  mindfulness: () => <FocusTimer suggested={3} />,
  relaxation: () => <FocusTimer suggested={3} />,
  sleep: () => <FocusTimer suggested={5} />,
  affirmations: () => <FocusTimer suggested={1} />,
  habits: () => <FocusTimer suggested={5} />,
};

export default function SelfCare() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.selfCare().then((r) => setItems(r.data || [])).catch((e) => setError(e.message));
  }, []);

  if (selected) {
    const Activity = ACTIVITY_BY_TYPE[selected.type];
    return (
      <Page>
        <TopBar title={selected.title} />
        <button className="article-back" onClick={() => setSelected(null)}>
          <ChevronLeft size={15} /> Back to self-care
        </button>
        <article className="article">
          <h2>{selected.title}</h2>
          {String(selected.content || '')
            .split(/\n+/)
            .filter(Boolean)
            .map((par, i) => (
              <p key={i}>{par}</p>
            ))}
        </article>
        {Activity && (
          <>
            <p className="subheading">Try it now</p>
            <Activity />
          </>
        )}
      </Page>
    );
  }

  return (
    <Page>
      <TopBar title="Self-Care" />
      <div className="selfcare-head">
        <h2>Take care of yourself</h2>
        <p>Small actions can make a big difference.</p>
      </div>
      <div className="care-list">
        {error && <p className="form-error">{error}</p>}
        {!error && items.length === 0 && <div className="loading-state">Loading...</div>}
        {items.map((x) => {
          const Icon = typeIcons[x.type] || FallbackIcon;
          const interactive = typeIcons[x.type] && ACTIVITY_BY_TYPE[x.type];
          return (
            <button className="care-item" key={x.id || x.title} onClick={() => setSelected(x)}>
              <span className="care-icon"><Icon size={20} /></span>
              <div>
                <b>{x.title}</b>
                <small>{x.description}{interactive ? ' • guided' : ''}</small>
              </div>
              <ChevronRight size={18} />
            </button>
          );
        })}
      </div>
    </Page>
  );
}
