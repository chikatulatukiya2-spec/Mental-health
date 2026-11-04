import React, { useEffect, useState } from 'react';
import {
  Wind, Brain, Music, Heart, Leaf, Moon, ChevronLeft, ChevronRight, Star, Sunrise,
} from 'lucide-react';
import { Page, TopBar, SectionTitle } from '../components';
import { Link } from 'react-router-dom';
import { api } from '../api';
import {
  getFavorites, toggleFavorite, streakDays, weekCount, lastDoneTitle,
} from './selfCareStore';
import {
  BreathTimer, FocusTimer, Soundscape, PlanRunner, PLANS,
} from './selfCareActivities';

const typeIcons = {
  breathing: Wind,
  mindfulness: Brain,
  relaxation: Music,
  affirmations: Heart,
  habits: Leaf,
  sleep: Moon,
};
const FallbackIcon = Heart;

/* #4: step-by-step variations per exercise */
const ROUTINES = {
  breathing: [
    ['Calm breathing', ['Sit comfortably and relax your shoulders.', 'In through your nose for 4 seconds.', 'Hold gently for 4 seconds.', 'Out through your mouth for 6 seconds.', 'Repeat for 4–6 cycles.']],
    ['Energising breath', ['Sit upright.', 'Breathe in deeply for 4 seconds.', 'Exhale sharply for 2 seconds.', 'Repeat 10 quick rounds.', 'Notice the boost in alertness.']],
  ],
  mindfulness: [
    ['5-4-3-2-1 senses', ['Name 5 things you can see.', 'Name 4 things you can touch.', 'Name 3 things you can hear.', 'Name 2 things you can smell.', 'Name 1 thing you can taste.']],
    ['Body scan', ['Close your eyes and breathe slowly.', 'Notice your feet. Let them soften.', 'Move attention up: legs, hips, belly.', 'Then chest, hands, shoulders, face.', 'If the mind wanders, gently return.']],
  ],
  affirmations: [
    ['Kind statements', ['Pick one statement: "I can take one small step at a time."', 'Say it slowly, out loud or in your head.', 'Repeat it 5 times.', 'Now choose a second one and repeat.']],
    ['Gratitude flip', ['Name one thing that went okay today.', 'Name one person you are glad exists.', 'Name one body part that worked hard for you.', 'Say thank you to each of them.']],
  ],
  habits: [
    ['Tiny habit builder', ['Pick one micro-habit: a glass of water, 10 squats, a 5-minute walk.', 'Attach it to something you already do daily.', 'Do it now — small counts.', 'Celebrate finishing with a small "yes!".']],
    ['Evening reset', ['Tidy one small surface near you.', 'Write tomorrow\'s single most important task.', 'Set out clothes or prep a bag.', 'Put your phone across the room.']],
  ],
};

/* #3: mood-aware suggestion */
const SUGGESTIONS = {
  Anxious: ['breathing', 'Anxious lately? Slow breathing is the fastest way to calm your body.', '🧘'],
  Overwhelmed: ['breathing', 'Feeling overwhelmed? Start with one minute of guided breathing.', '🧘'],
  Sad: ['affirmations', 'Low mood? Kind words to yourself are a gentle start today.', '💛'],
  Okay: ['habits', 'Doing okay? A 5-minute habit builds on a good day.', '🌱'],
};

export default function SelfCare() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [favs, setFavs] = useState(getFavorites());
  const [streak, setStreak] = useState(streakDays());
  const [week, setWeek] = useState(weekCount());
  const [suggestion, setSuggestion] = useState(null); // #3
  const [night, setNight] = useState(false); // #10
  const [routineIdx, setRoutineIdx] = useState(0); // #4

  useEffect(() => {
    api.selfCare().then((r) => setItems(r.data || [])).catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    api.moods().then((r) => {
      const latest = (r.data || [])[0];
      const sug = latest && SUGGESTIONS[latest.mood];
      if (sug) setSuggestion(sug);
    }).catch(() => {});
  }, []);

  const refreshStats = () => { setStreak(streakDays()); setWeek(weekCount()); };
  const open = (item) => { setSelected(item); setRoutineIdx(0); setNight(false); };

  const ordered = React.useMemo(() => {
    const withFav = items.map((x) => ({ ...x, _fav: favs.includes(x.title) }));
    return withFav.sort((a, b) => (b._fav - a._fav) || (a.id - b.id)); // #9: favourites first
  }, [items, favs]);
  const last = lastDoneTitle();

  if (selected) {
    const planDef = PLANS.find((p) => p.name === selected.title); // #8: plan items opened from the list
    if (planDef) {
      return (
        <Page>
          <TopBar title={planDef.name} />
          <button className="article-back" onClick={() => setSelected(null)}>
            <ChevronLeft size={15} /> Back to self-care
          </button>
          <p className="subheading">Follow along — one step at a time</p>
          <PlanRunner plan={planDef} onDone={() => { refreshStats(); finishFeedback(); setSelected(null); }} />
        </Page>
      );
    }
    const Icon = typeIcons[selected.type] || FallbackIcon;
    const routines = ROUTINES[selected.type];
    const Activity = activityFor(selected.type);
    const showNight = ['sleep', 'relaxation'].includes(selected.type);
    const showScapes = ['relaxation', 'mindfulness', 'sleep'].includes(selected.type);
    return (
      <Page className={night ? 'wind-down-page' : undefined}>
        <TopBar title={selected.title} />
        <button className="article-back" onClick={() => { openListRefresh(); }}>
          <ChevronLeft size={15} /> Back to self-care
        </button>
        <article className="article">
          <span className="care-detail-icon"><Icon size={26} /></span>
          <h2>{selected.title}</h2>
          {routines && (
            <>
              <div className="tabs routine-tabs">
                {routines.map(([name], i) => (
                  <button key={name} onClick={() => setRoutineIdx(i)}>
                    <span className={i === routineIdx ? 'pill active' : 'pill'}>{name}</span>
                  </button>
                ))}
              </div>
              <div className="routine-steps">
                {routines[routineIdx][1].map((s, i) => (
                  <div className="symptom" key={i}>{i + 1}. {s}</div>
                ))}
              </div>
            </>
          )}
          {!routines && String(selected.content || '').split(/\n+/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
        </article>

        <p className="subheading">Try it now</p>
        <Activity type={selected.type} title={selected.title} suggested={suggestedFor(selected.type)}
          night={night && showNight} onToggleNight={showNight ? () => setNight((n) => !n) : undefined} />

        {showScapes && <><p className="subheading">Ambient sounds</p><Soundscape /></>}

        <Link className="activity-btn journal-cta" to={`/journal?title=${encodeURIComponent(selected.title)}&content=${encodeURIComponent(`I did "${selected.title}" today.`)}`}><ChevronRight size={14}/> Write about it</Link>
      </Page>
    );
  }

  /** helpers kept below JSX for clarity */
  function openListRefresh() { refreshStats(); setSelected(null); }
  function finishFeedback() { if (navigator.vibrate) navigator.vibrate([40, 60, 40]); }

  return (
    <Page>
      <TopBar title="Self-Care" />
      <div className="selfcare-head">
        <h2>Take care of yourself</h2>
        <p>Small actions can make a big difference.</p>
      </div>

      {(streak > 0 || week > 0 || last) && (
        <div className="streak-bar">
          {streak > 0 && <span>🔥 {streak}-day streak</span>}
          {week > 0 && <span>✅ {week} session{week > 1 ? 's' : ''} this week</span>}
          {last && <span className="muted">Last: {last.title}</span>}
        </div>
      )}

      {suggestion && (
        <button
          className="suggestion-banner"
          onClick={() => { const item = items.find((x) => x.type === suggestion[0]); if (item) open(item); }}
        >
          <span className="suggest-emoji">{suggestion[2]}</span>
          <div>
            <b>Start here</b>
            <small>{suggestion[1]}</small>
          </div>
          <ChevronRight size={16} />
        </button>
      )}

      <SectionTitle>Daily plans</SectionTitle>
      <div className="plan-grid">
        {PLANS.map((p) => (
          <button className="plan-card" key={p.name} onClick={() => open({ ...p, title: p.name })}>
            <span className="plan-icon">
              {p.name === 'Quick calm' ? <Wind size={22} /> : p.name === 'Night wind-down' ? <Moon size={22} /> : <Sunrise size={22} />}
            </span>
            <b>{p.name}</b>
            <small>{p.steps.map((s) => s[1]).join(' • ')}</small>
            <span className="plan-cta">{p.steps.length} steps <ChevronRight size={13} /></span>
          </button>
        ))}
      </div>

      <div className="care-list">
        {error && <p className="form-error">{error}</p>}
        {!error && items.length === 0 && <div className="loading-state">Loading...</div>}
        {ordered.map((x) => {
          const Icon = typeIcons[x.type] || FallbackIcon;
          const guided = typeIcons[x.type];
          return (
            <div className={x._fav ? 'care-row pinned' : 'care-row'} key={x.id || x.title}>
              <button className="care-item" onClick={() => open(x)}>
                <span className="care-icon"><Icon size={20} /></span>
                <div>
                  <b>{x.title}</b>
                  <small>{x.description}{guided ? ' • guided' : ''}</small>
                </div>
                <ChevronRight size={18} />
              </button>
              {guided && (
                <button
                  className="fav-btn" type="button" aria-label={x._fav ? 'Remove favourite' : 'Add favourite'}
                  onClick={() => setFavs(toggleFavorite(x.title))}
                >
                  <Star size={15} fill={x._fav ? 'currentColor' : 'none'} className={x._fav ? 'fav-on' : ''} />
                </button>
              )}
            </div>
          );
        })}
      </div>
      {last && items.some((x) => x.title === last.title) && (
        <button className="resume-btn" onClick={() => open(items.find((x) => x.title === last.title))}>
          Repeat last: {last.title} <ChevronRight size={14} />
        </button>
      )}
    </Page>
  );
}

function activityFor(type) {
  if (type === 'breathing') return BreathTimer;
  if (['mindfulness', 'relaxation', 'affirmations', 'habits', 'sleep'].includes(type)) return FocusTimer;
  return null;
}
function suggestedFor(type) { return { mindfulness: 3, relaxation: 3, sleep: 5, affirmations: 1, habits: 3 }[type] || 2; }
