import { gsap } from './gsap.js';
import { initLoader } from './loader.js';

const API_BASE = window.location.port === '3000' ? 'http://localhost:3001' : '';
const TOKEN_KEY = 'roster_token';

const token = () => sessionStorage.getItem(TOKEN_KEY);

const loginView = () => document.getElementById('loginView');
const rosterView = () => document.getElementById('rosterView');
const rosterBody = () => document.getElementById('rosterBody');
const loginMsg = () => document.getElementById('suLoginMsg');

function setLoginMsg(text, type) {
  const el = loginMsg();
  el.textContent = text || '';
  el.className = 'su-login-msg' + (type ? ` is-${type}` : '');
}

function setLoginLoading(loading) {
  const btn = document.getElementById('suLoginBtn');
  btn.disabled = loading;
  btn.textContent = loading ? 'Unlocking...' : 'Unlock Roster';
}

function showLogin() {
  loginView().style.display = '';
  rosterView().classList.remove('is-visible');
  rosterView().style.display = '';
}

function showRoster() {
  loginView().style.display = 'none';
  rosterView().style.display = '';
  rosterView().classList.add('is-visible');
}

function chipsHtml(interests) {
  if (!interests || interests.length === 0) {
    return '<span class="su-chip is-none">No interests yet</span>';
  }
  return interests.map(i => `<span class="su-chip">${i}</span>`).join('');
}

function santaForHtml(m) {
  if (!m) {
    return '<span class="su-santa-for-none">Not matched yet</span>';
  }
  const userHtml = m.santaUsername
    ? `<span class="su-santa-for-user">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>
        ${m.santaUsername}
       </span>`
    : '';
  return `<div>
    <div class="su-santa-for-name">${m.name || '—'}</div>
    ${userHtml}
  </div>`;
}

let _rosterUsers = [];
let _rosterFilter = '';

function renderRoster(data, opts = {}) {
  const body = rosterBody();

  if (!data || data.length === 0) {
    body.innerHTML = '<tr><td colspan="6"><div class="su-empty">No registered users yet.</div></td></tr>';
    document.getElementById('rosterCount').textContent = '0 users';
    return;
  }

  let rows = data;
  const q = _rosterFilter.trim().toLowerCase();
  if (q) {
    rows = rows.filter(u =>
      [u.name, u.email, u.santaUsername, u.santaFor && u.santaFor.name, u.santaFor && u.santaFor.santaUsername]
        .filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    );
  }

  const countEl = document.getElementById('rosterCount');
  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="6"><div class="su-empty">No users match your search.</div></td></tr>';
    countEl.textContent = `0 of ${data.length} users`;
    return;
  }

  countEl.textContent = q
    ? `${rows.length} of ${data.length} users`
    : `${data.length} registered user${data.length !== 1 ? 's' : ''}`;

  body.innerHTML = rows.map((u, i) => `
    <tr>
      <td class="su-cell-num" data-label="No.">${String(i + 1).padStart(2, '0')}</td>
      <td class="su-cell-name" data-label="Name">${u.name || '—'}</td>
      <td class="su-cell-mail" data-label="Email">${u.email}</td>
      <td data-label="Santa Username">
        <span class="su-cell-username${u.santaUsername ? '' : ' is-none'}">${u.santaUsername || 'Not set up'}</span>
      </td>
      <td data-label="Santa For">${santaForHtml(u.santaFor)}</td>
      <td data-label="Interests"><div class="su-chips">${chipsHtml(u.interests)}</div></td>
    </tr>
  `).join('');

  if (opts.animate) {
    gsap.fromTo(body.children, { opacity: 0, y: 8 }, {
      opacity: 1, y: 0, duration: 0.3, stagger: 0.03, ease: 'power2.out',
    });
  }
}

async function loadRoster() {
  try {
    const res = await fetch(`${API_BASE}/api/santa/users`, {
      headers: { Authorization: `Bearer ${token()}` },
    });

    if (res.status === 401 || res.status === 403) {
      sessionStorage.removeItem(TOKEN_KEY);
      showLogin();
      setLoginMsg('Session expired. Please sign in again.', 'error');
      return;
    }

    const data = await res.json();
    showRoster();
    _rosterUsers = data.data || [];
    renderRoster(_rosterUsers, { animate: true });
  } catch {
    setLoginMsg('Failed to load roster. Please try again.', 'error');
  }
}

async function handleLogin() {
  const username = document.getElementById('suUsername').value.trim();
  const password = document.getElementById('suPassword').value;

  setLoginMsg('', '');
  if (!username || !password) {
    setLoginMsg('Enter both username and password.', 'error');
    return;
  }

  setLoginLoading(true);
  try {
    const res = await fetch(`${API_BASE}/api/santa/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setLoginLoading(false);
      setLoginMsg(data.error || 'Invalid credentials.', 'error');
      return;
    }

    sessionStorage.setItem(TOKEN_KEY, data.token);
    setLoginLoading(false);
    await loadRoster();
  } catch {
    setLoginLoading(false);
    setLoginMsg('Network error. Please try again.', 'error');
  }
}

async function init() {
  await initLoader();
  document.documentElement.classList.add('fonts-loaded');

  document.getElementById('suLoginBtn').addEventListener('click', handleLogin);
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem(TOKEN_KEY);
    showLogin();
    setLoginMsg('', '');
    document.getElementById('suPassword').value = '';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && loginView().style.display !== 'none') handleLogin();
  });

  const searchInput = document.getElementById('rosterSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      _rosterFilter = searchInput.value;
      renderRoster(_rosterUsers, { animate: false });
    });
  }

  if (token()) {
    await loadRoster();
  } else {
    showLogin();
  }
}

document.addEventListener('DOMContentLoaded', init);
