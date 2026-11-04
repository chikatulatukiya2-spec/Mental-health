import React, { useState } from 'react';
import { BookOpen, Quote, Sparkles, ChevronLeft } from 'lucide-react';
import { Page, TopBar, SectionTitle } from '../components';

const articles = [
  {
    id: 1,
    tone: 'blue',
    tag: 'Depression',
    title: 'Understanding Depression: More Than Just Sadness',
    minutes: 5,
    summary:
      'Depression is a common but serious mood disorder that goes beyond feeling down for a few days. Learn how it shows up, why it happens, and what helps.',
    body: [
      'Depression affects how you think, feel, and handle daily activities such as sleeping, eating, or working. It is not a sign of weakness, and it is not something you can simply "snap out of."',
      'It often involves a mix of factors: brain chemistry, genetics, prolonged stress, and life events. The good news is that it is highly treatable with therapy, lifestyle changes, and sometimes medication.',
      'If low mood, loss of interest, or fatigue have lasted more than two weeks, reaching out to a professional is a strong and healthy first step.',
    ],
  },
  {
    id: 2,
    tone: 'green',
    tag: 'Anxiety',
    title: 'Anxiety in Everyday Life: Recognising the Signs',
    minutes: 4,
    summary:
      'Worry is normal, but constant, overwhelming worry is not. Here is how to tell the difference and simple techniques that calm a racing mind.',
    body: [
      'Anxiety becomes a concern when worry is persistent, hard to control, and interferes with work, school, or relationships. Physical signs can include a racing heart, tense muscles, trouble sleeping, and restlessness.',
      'Grounding techniques like slow breathing (in for 4, hold for 4, out for 6), the 5-4-3-2-1 senses exercise, and scheduled "worry time" can reduce the intensity of anxious moments.',
      'If anxiety keeps limiting your life, cognitive behavioural therapy (CBT) is one of the most effective treatments available.',
    ],
  },
  {
    id: 3,
    tone: 'pink',
    tag: 'Self-Care',
    title: 'Small Habits, Big Impact: Building a Self-Care Routine',
    minutes: 3,
    summary:
      'You do not need a total life overhaul to feel better. Tiny, consistent habits compound into real improvements in mood and energy.',
    body: [
      'Start with the basics: a regular sleep schedule, daily movement (even a 10-minute walk), time outdoors, and staying connected with people who care about you.',
      'Pair new habits with existing routines — for example, three deep breaths after brushing your teeth, or writing one line in your journal each night.',
      'Consistency beats intensity. A small habit done daily does more for mental health than an occasional big effort.',
    ],
  },
];

const insights = [
  'You do not have to be positive all the time. Feeling low is human — what matters is that you keep going.',
  'Progress is not always visible. Every day you show up, even quietly, counts.',
  'Rest is not giving up. It is part of the work.',
  'Asking for help is one of the bravest things a person can do.',
  'Your worth is not measured by your productivity.',
  'Healing is not linear. Bad days do not erase the progress you have made.',
];

export default function Resources() {
  const [openArticle, setOpenArticle] = useState(null);
  const insight = new Date().getDate() % insights.length;

  if (openArticle != null) {
    const article = articles.find((a) => a.id === openArticle);
    return (
      <Page>
        <TopBar title={article.title} />
        <button className="article-back" onClick={() => setOpenArticle(null)}>
          <ChevronLeft size={15} /> Back to resources
        </button>
        <article className="article">
          <span className={`resource-tag ${article.tone}`}>{article.tag}</span>
          <h2>{article.title}</h2>
          {article.body.map((par, i) => (
            <p key={i}>{par}</p>
          ))}
        </article>
        <div className="insight-card">
          <Sparkles size={18} />
          <p>Today's insight: {insights[insight]}</p>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <TopBar title="Resources" />
      <SectionTitle>Motivational Insight</SectionTitle>
      <div className="insight-card">
        <Quote size={18} />
        <p>{insights[insight]}</p>
      </div>

      <SectionTitle>Articles</SectionTitle>
      <div className="article-list">
        {articles.map((a) => (
          <button className="resource-card" key={a.id} onClick={() => setOpenArticle(a.id)}>
            <span className={`resource-tag ${a.tone}`}>{a.tag}</span>
            <b>{a.title}</b>
            <small>{a.summary}</small>
            <span className="resource-meta">
              <BookOpen size={13} /> {a.minutes} min read ›
            </span>
          </button>
        ))}
      </div>

      <div className="support-banner">
        <h3>Knowledge is a good first step.</h3>
        <p>Reading is a start — talking to someone can help even more.</p>
        <span>♡</span>
      </div>
    </Page>
  );
}
