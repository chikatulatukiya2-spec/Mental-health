import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Sun, Moon, UserCircle, Brain, HeartPulse, BookOpen, Headphones, ShieldCheck, ClipboardCheck, Target, Smile, Leaf } from 'lucide-react';
import { Page, SectionTitle, InfoIcon, LogoutButton } from '../components';
import { useAuth } from '../auth';

const categories = [
  ['/information?topic=Depression', 'blue', Brain, 'Depression'],
  ['/information?topic=Anxiety', 'green', HeartPulse, 'Anxiety'],
  ['/self-care', 'pink', Leaf, 'Self-Care'],
  ['/information?topic=Wellbeing', 'purple', BookOpen, 'Education'],
  ['/resources', 'cyan', ShieldCheck, 'Resources'],
  ['/support', 'blue', Headphones, 'Support'],
];

const quick = [
  ['/screening', ClipboardCheck, 'Screening'],
  ['/goals', Target, 'Goals'],
  ['/mood', Smile, 'Mood'],
];

export default function Home() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning,' : hour < 18 ? 'Good afternoon,' : 'Good evening,';
  const GreetIcon = hour >= 18 || hour < 5 ? Moon : Sun;

  return (
    <Page nav>
      <div className="home-content">
        <div className="home-header">
          <div>
            <p className="muted">{greeting}</p>
            <h1>{user?.name || 'there'} <GreetIcon size={17} /></h1>
          </div>
          <div className="header-actions">
            <Link to="/progress" className="profile-circle-btn" aria-label="Profile"><UserCircle size={36} /></Link>
            <LogoutButton />
          </div>
        </div>

        <div className="search"><Search size={17} /><input placeholder="Search for help, articles, or tools..." /></div>

        <div className="hero-card">
          <div>
            <h2>You are not alone</h2>
            <p>It's okay to ask for help.<br />Your mental health matters.</p>
            <Link to="/support">Talk to Someone <span>›</span></Link>
          </div>
          <div className="hero-orb">♡</div>
        </div>

        <SectionTitle>Quick Actions</SectionTitle>
        <div className="quick-grid">
          {quick.map(([to, Icon, label]) => (
            <Link key={label} to={to} className="quick-card"><Icon size={20} /><span>{label}</span></Link>
          ))}
        </div>

        <div className="ai-card">
          <div className="ai-icon">🤖</div>
          <div className="ai-content">
            <h3>MindEase AI Assistant</h3>
            <p>Get supportive guidance and general mental health information.</p>
            <Link to="/ai-chat" className="ai-button">Start Chat</Link>
          </div>
        </div>

        <SectionTitle>Explore Categories</SectionTitle>
        <div className="category-links">
          {categories.map(([to, tone, Icon, label]) => (
            <Link key={label} to={to} className="category-link">
              <InfoIcon tone={tone}><Icon size={19} /></InfoIcon>
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </Page>
  );
}
