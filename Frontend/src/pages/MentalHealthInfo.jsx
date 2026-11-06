import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Page, TopBar, Pill, GradientButton } from '../components';
import { api } from '../api';

export default function MentalHealthInfo() {
  const [params] = useSearchParams();
  const initial = params.get('topic');
  const [topic, setTopic] = useState(['Depression', 'Anxiety', 'Wellbeing'].includes(initial) ? initial : 'Depression');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    setError('');
    api.information(topic).then(r => setData(r.data)).catch(e => setError(e.message));
  }, [topic]);

  const symptomsHeading = topic === 'Wellbeing' ? 'Helpful habits' : 'Common signs';

  return (
    <Page>
      <TopBar title="Learn" />
      <div className="tabs info-tabs">
        {['Depression', 'Anxiety', 'Wellbeing'].map(t => (
          <button key={t} type="button" className="tab-btn" onClick={() => setTopic(t)}>
            <Pill active={topic === t}>{t}</Pill>
          </button>
        ))}
      </div>
      {error ? <p className="form-error">{error}</p> : data ? (
        <div className="info-content" key={topic}>
          <article className="info-article">
            <h2>{data.title}</h2>
            <p className="info-lead">{data.text}</p>
            <section className="info-card">
              <h3>{symptomsHeading}</h3>
              <ul className="symptom-list">
                {(data.symptoms || []).map((x, i) => (
                  <li className="symptom-item" key={x} style={{ animationDelay: `${i * 40}ms` }}>
                    <span className="symptom-icon"><Check size={15} strokeWidth={2.5} /></span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </section>
          </article>
          <div className="info-links">
            <Link className="secondary-btn" to="/self-care">Self-care</Link>
            <Link className="secondary-btn" to="/support">Get support</Link>
          </div>
          <p className="disclaimer">General information only — not a diagnosis.</p>
        </div>
      ) : <div className="loading-state info-loading">Loading...</div>}
      <GradientButton to="/screening">Take screening</GradientButton>
    </Page>
  );
}
