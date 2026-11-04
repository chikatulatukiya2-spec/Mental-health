import React, { useEffect, useState } from 'react';
import { Wind, Brain, Music, Heart, Leaf, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Page, TopBar, SectionTitle } from '../components';
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

export default function SelfCare() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.selfCare().then((r) => setItems(r.data || [])).catch((e) => setError(e.message));
  }, []);

  if (selected) {
    return (
      <Page>
        <TopBar title={selected.title} />
        <button className="article-back" onClick={() => setSelected(null)}>
          <ChevronLeft size={15} /> Back to self-care
        </button>
        <article className="article">
          <h2>{selected.title}</h2>
          {selected.description && <p>{selected.description}</p>}
          {String(selected.content || '')
            .split(/\n+/)
            .filter(Boolean)
            .map((par, i) => (
              <p key={i}>{par}</p>
            ))}
        </article>
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
          return (
            <button className="care-item" key={x.id || x.title} onClick={() => setSelected(x)}>
              <span className="care-icon"><Icon size={20} /></span>
              <div>
                <b>{x.title}</b>
                <small>{x.description}</small>
              </div>
              <ChevronRight size={18} />
            </button>
          );
        })}
      </div>
    </Page>
  );
}
