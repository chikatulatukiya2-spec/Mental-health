/* Self-care session log: last 30 days of completed activities + favorites, in localStorage. */
const KEY = 'mindease_selfcare_sessions';
const FAV_KEY = 'mindease_selfcare_favorites';

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ } }

const DAY = 86400000;

export function logSession(type, title) {
  const sessions = read(KEY, []);
  sessions.push({ type, title, at: Date.now() });
  write(KEY, sessions.filter((s) => Date.now() - s.at < 30 * DAY));
}

export function getSessions() { return read(KEY, []); }

export function weekCount() {
  return getSessions().filter((s) => Date.now() - s.at < 7 * DAY).length;
}

export function streakDays() {
  const days = new Set(getSessions().map((s) => new Date(s.at).toDateString()));
  let streak = 0;
  for (let i = 0; ; i++) {
    const d = new Date(Date.now() - i * DAY).toDateString();
    if (days.has(d)) streak++;
    else if (i === 0) continue; // today not done yet doesn't break the streak
    else break;
  }
  return streak;
}

export function lastDoneTitle() {
  const last = read(KEY, []).slice(-1)[0];
  return last ? { title: last.title, at: last.at } : null;
}

export function getFavorites() { return read(FAV_KEY, []); }
export function toggleFavorite(title) {
  const favs = getFavorites();
  const next = favs.includes(title) ? favs.filter((t) => t !== title) : [...favs, title];
  write(FAV_KEY, next);
  return next;
}
