import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { Page, TopBar, LogoutButton } from '../components';
import { GoalsPanel } from './Goals';
import { useAuth } from '../auth';
import { api } from '../api';
import { weekCount, streakDays } from './selfCareStore';

const TABS = ['Mood', 'Screenings', 'Goals'];

export default function Progress() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Mood');
  const [data, setData] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.progress(), api.screenings()])
      .then(([p, s]) => { setData(p.data); setScreenings(s.data || []); })
      .catch(e => setError(e.message));
  }, []);

  const score = data?.wellbeing_score ?? null;
  const series = data?.mood_series || [];

  return (
    <Page nav>
      <TopBar title="My Profile" />

      <div className="profile-card">
        <div className="avatar"><UserRound size={26} /></div>
        <div>
          <b>{user?.name || 'MindEase user'}</b>
          <small>{user?.email}</small>
        </div>
        <LogoutButton variant="full" />
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button type="button" key={t} className={tab === t ? 'pill active' : 'pill'} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}

      {tab === 'Mood' && (!data ? <div className="loading-state">Loading progress...</div> : <>
        <section className="progress-section">
          <div className="section-title"><h3>Mood Overview</h3><span>Last 7 days</span></div>
          <div className="chart">
            {series.length > 1
              ? <svg viewBox="0 0 320 120" preserveAspectRatio="none">
                  <polyline points={series.map((v, i) => `${8 + i * (304 / (series.length - 1))},${100 - (v / 5) * 80}`).join(' ')} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              : <p className="muted center">Save at least two days of moods to see your trend.</p>}
          </div>
        </section>
        <section className="wellbeing">
          <h3>Wellbeing Score</h3>
          <div className="score-row">
            <div className="score-circle">{score === null ? '—' : `${score}%`}</div>
            <div>
              <b>{score === null ? 'No data yet' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Needs attention'}</b>
              <p>{score === null ? 'Save moods to build your progress history.' : 'Keep taking small steps to support your wellbeing.'}</p>
            </div>
          </div>
        </section>
        <section className="progress-section selfcare-progress">
          <div className="section-title"><h3>Self-Care</h3><span>Last 7 days</span></div>
          <div className="selfcare-stats">
            <div><b>{weekCount()}</b><small>sessions</small></div>
            <div><b>{streakDays() ? `🔥 ${streakDays()}` : '—'}</b><small>day streak</small></div>
          </div>
          <Link className="link-btn" to="/self-care">Do a session</Link>
        </section>
      </>)}

      {tab === 'Screenings' && (
        <section>
          {screenings.length === 0
            ? <div className="progress-note"><b>No screenings yet</b><small>Take a quick self-screening to track how you are doing.</small><Link className="link-btn" to="/screening">Take Screening</Link></div>
            : <>
                {screenings.map(s => (
                  <div className="progress-note" key={s.id}>
                    <b>{s.result_label} — score {s.score}/27</b>
                    <small>{s.type} · {String(s.completed_at).slice(0, 10)}</small>
                  </div>
                ))}
                <Link className="link-btn" to="/screening">Retake Screening</Link>
              </>}
        </section>
      )}

      {tab === 'Goals' && <GoalsPanel />}
    </Page>
  );
}
