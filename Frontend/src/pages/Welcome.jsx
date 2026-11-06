import React from "react";
import { Link } from "react-router-dom";
import { HeartHandshake, NotebookPen, SmilePlus } from "lucide-react";
import { PhoneShell, LogoMark } from "../components";

export default function Welcome() {
  return (
    <PhoneShell className="welcome-page">
      <div className="welcome-art">
        <div className="welcome-glow" aria-hidden="true"></div>
        <LogoMark />
        <p className="welcome-kicker">Your calm companion</p>
        <h1>MindEase</h1>
        <p className="welcome-tagline">
          Track your mood, reflect in your journal, and find support when you need it.
        </p>
        <div className="welcome-highlights" aria-label="Highlights">
          <span><SmilePlus size={14} /> Mood check-ins</span>
          <span><NotebookPen size={14} /> Private journal</span>
          <span><HeartHandshake size={14} /> Support tools</span>
        </div>
      </div>
      <div className="welcome-mountains" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <div className="welcome-bottom">
        <Link to="/register" className="gradient-btn wide welcome-cta">Get Started</Link>
        <p className="welcome-note">Free self-care support. Not a medical service.</p>
      </div>
    </PhoneShell>
  );
}