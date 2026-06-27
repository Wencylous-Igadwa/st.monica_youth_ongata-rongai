import { adminApi } from './admin-api.js';

const _cache = {};

async function fetchAPI(method, path, body) {
  const token = localStorage.getItem('stm_admin_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error('API error');
  return res.json();
}

async function getData(key) {
  if (key in _cache) return _cache[key];
  try {
    const data = await fetchAPI('GET', `/${key}`);
    _cache[key] = (data.data || data) ?? [];
  } catch {
    _cache[key] = [];
  }
  return _cache[key];
}

async function saveData(key, data) {
  _cache[key] = data;
  try {
    const res = await fetchAPI('GET', `/${key}`);
    const existing = (res.data || res) ?? [];
    const existingMap = new Map(existing.map(i => [i.id, i]));
    const currentMap = new Map(data.map(i => [i.id, i]));
    await Promise.all([
      ...data.filter(i => !existingMap.has(i.id)).map(i => fetchAPI('POST', `/${key}`, i).catch(() => {})),
      ...data.filter(i => existingMap.has(i.id)).map(i => fetchAPI('PUT', `/${key}/${i.id}`, i).catch(() => {})),
      ...existing.filter(i => !currentMap.has(i.id)).map(i => fetchAPI('DELETE', `/${key}/${i.id}`).catch(() => {})),
    ]);
  } catch {}
}

const LEADERSHIP_DEFAULTS = [
  { id: 'chair', name: 'Esther Nyambura', role: 'Chairperson', initials: 'EN', color: '#c8963e', img: '', quote: '"To be a youth is to be a vessel of hope, carrying Christ\'s light into every corner of our community."' },
  { id: 'vice',  name: 'Peter Kimani',   role: 'Vice Chairperson', initials: 'PK', color: '#8b6914', img: '', quote: '"Leadership is not about the title — it\'s about lifting others up and walking alongside them."' },
  { id: 'sec',   name: 'Grace Akinyi',   role: 'Secretary', initials: 'GA', color: '#7a8a7a', img: '', quote: '"Every meeting, every note, every detail — it\'s all in service of God\'s work among us."' },
  { id: 'asst',  name: 'David Mwangi',   role: 'Assistant Secretary', initials: 'DM', color: '#9a8b78', img: '', quote: '"Faith isn\'t just what we believe — it\'s what we do when no one is watching."' },
  { id: 'treas', name: 'Sarah Wanjiku',  role: 'Treasurer', initials: 'SW', color: '#c47a5a', img: '', quote: '"Stewardship is a heart issue — we give because God first gave to us."' },
  { id: 'org',   name: 'Michael Omondi', role: 'Organizing Secretary', initials: 'MO', color: '#2b5c8a', img: '', quote: '"Whether it\'s an event or a mission, good planning creates space for grace to move."' },
];

const FAMILIES_DEFAULTS = [
  { name: 'St. Francis Family', sub: 'The joyful servants', color: '#e8b84c', members: ['Kevin Omondi', 'Mary Wanjiku', 'Peter Kamau', 'Grace Njeri', 'David Mwangi'] },
  { name: 'St. Clare Family', sub: 'The prayerful hearts', color: '#6aab6a', members: ['Sarah Akinyi', 'John Njoroge', 'Esther Wambui', 'Michael Otieno', 'Rose Nyambura'] },
  { name: 'St. Thérèse Family', sub: 'The little flowers', color: '#c47a5a', members: ['James Kiprop', 'Agnes Wairimu', 'Patrick Mutua', 'Faith Chepkirui', 'Samuel Ochieng\''] },
  { name: 'St. John Paul II Family', sub: 'The faithful witnesses', color: '#8a7ab8', members: ['Catherine Muthoni', 'Joseph Wekesa', 'Dorcas Anyango', 'Paul Kiplagat', 'Elizabeth Njoki'] },
  { name: 'St. Michael Family', sub: 'The courageous warriors', color: '#d4a06a', members: ['Daniel Macharia', 'Monica Akumu', 'Stephen Kariuki', 'Margaret Wanjiru', 'Christopher Langat'] },
];

async function getLeadershipData() {
  try {
    const items = await fetchAPI('GET', '/leadership');
    const arr = items.data || items;
    if (Array.isArray(arr) && arr.length) { _cache.leadership = arr; return arr; }
  } catch {}
  if (_cache.leadership) return _cache.leadership;
  _cache.leadership = LEADERSHIP_DEFAULTS;
  return LEADERSHIP_DEFAULTS;
}

async function saveLeadershipData(data) {
  _cache.leadership = data;
  try {
    const res = await fetchAPI('GET', '/leadership');
    const existing = (res.data || res) ?? [];
    const existingMap = new Map(existing.map(i => [i.id, i]));
    const currentMap = new Map(data.map(i => [i.id, i]));
    await Promise.all([
      ...data.filter(i => !existingMap.has(i.id)).map(i => fetchAPI('POST', '/leadership', i).catch(() => {})),
      ...data.filter(i => existingMap.has(i.id)).map(i => fetchAPI('PUT', `/leadership/${i.id}`, i).catch(() => {})),
      ...existing.filter(i => !currentMap.has(i.id)).map(i => fetchAPI('DELETE', `/leadership/${i.id}`).catch(() => {})),
    ]);
  } catch {}
}

async function getFamiliesData() {
  try {
    const items = await fetchAPI('GET', '/families');
    const arr = items.data || items;
    if (Array.isArray(arr) && arr.length) { _cache.families = arr; return arr; }
  } catch {}
  if (_cache.families) return _cache.families;
  _cache.families = FAMILIES_DEFAULTS;
  return FAMILIES_DEFAULTS;
}

async function saveFamiliesData(data) {
  _cache.families = data;
  try {
    const res = await fetchAPI('GET', '/families');
    const existing = (res.data || res) ?? [];
    const existingMap = new Map(existing.map(i => [i.id, i]));
    const currentMap = new Map(data.map(i => [i.id, i]));
    await Promise.all([
      ...data.filter(i => !existingMap.has(i.id)).map(i => fetchAPI('POST', '/families', i).catch(() => {})),
      ...data.filter(i => existingMap.has(i.id)).map(i => fetchAPI('PUT', `/families/${i.id}`, i).catch(() => {})),
      ...existing.filter(i => !currentMap.has(i.id)).map(i => fetchAPI('DELETE', `/families/${i.id}`).catch(() => {})),
    ]);
  } catch {}
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* Dashboard */
async function updateDashboard() {
  const leadership = await getLeadershipData();
  const families = await getFamiliesData();
  const totalFamilyMembers = families.reduce((sum, f) => sum + f.members.length, 0);
  const events = await getData('events');
  const gallery = await getData('gallery');
  const spotlight = await getData('spotlight');
  const sports = await getData('sports');
  const hof = await getData('hof');
  const footballSquad = await getFixedList('football_squad');
  const counts = {
    events: events.length,
    gallery: gallery.length,
    spotlight: spotlight.length,
    sports: sports.length,
    football_squad: footballSquad.length,
    football_stats: 4,
    hof: hof.length,
    leadership: leadership.length,
    families: totalFamilyMembers,
  };
  document.querySelector('[data-dashboard-events]').textContent = counts.events;
  document.querySelector('[data-dashboard-gallery]').textContent = counts.gallery;
  document.querySelector('[data-dashboard-spotlight]').textContent = counts.spotlight;
  document.querySelector('[data-dashboard-sports]').textContent = counts.sports;
  document.querySelector('[data-dashboard-football-squad]').textContent = counts.football_squad;
  document.querySelector('[data-dashboard-leadership]').textContent = counts.leadership;
  document.querySelector('[data-dashboard-families]').textContent = counts.families;
}

/* Tab switching */
function initTabs() {
  document.querySelectorAll('[data-admin-parent]').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.admin-nav-group');
      if (!group) return;
      const sub = group.querySelector('[data-admin-sub]');
      if (!sub) return;
      const wasOpen = btn.classList.toggle('is-open');
      sub.classList.toggle('is-open', wasOpen);
    });
  });

  document.querySelectorAll('[data-admin-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-admin-tab]').forEach(b => b.classList.remove('is-active'));
      document.querySelectorAll('[data-admin-sub-btn]').forEach(b => b.classList.remove('is-active'));
      document.querySelectorAll('[data-admin-section]').forEach(s => s.classList.remove('is-active'));
      btn.classList.add('is-active');
      const section = document.querySelector(`[data-admin-section="${btn.dataset.adminTab}"]`);
      if (section) section.classList.add('is-active');

      const group = btn.closest('.admin-nav-group');
      if (group) {
        const parent = group.querySelector('[data-admin-parent]');
        const sub = group.querySelector('[data-admin-sub]');
        if (parent && sub) {
          parent.classList.add('is-open');
          sub.classList.add('is-open');
        }
      }
    });
  });
}

/* ─── FORM HELPERS ─── */
function getField(section, name) {
  const el = document.querySelector(`[data-field="${section}-${name}"]`);
  if (!el) return '';
  return el.value;
}

function setField(section, name, val) {
  const el = document.querySelector(`[data-field="${section}-${name}"]`);
  if (!el) return;
  if (el.type === 'checkbox') {
    el.checked = !!val;
  } else {
    el.value = val ?? '';
  }
}

function resetForm(section) {
  const form = document.querySelector(`[data-admin-form="${section}"]`);
  if (!form) return;
  form.querySelectorAll('[data-field]').forEach(el => {
    if (el.type === 'checkbox') el.checked = false;
    else el.value = '';
  });
  const title = form.querySelector('[data-form-title]');
  if (title) title.textContent = 'New ' + section.charAt(0).toUpperCase() + section.slice(1);
  if (section === 'gallery') refreshGalleryPreview();
}

function showForm(section, data) {
  const form = document.querySelector(`[data-admin-form="${section}"]`);
  if (!form) return;
  const title = form.querySelector('[data-form-title]');
  resetForm(section);
  if (data) {
    if (title) title.textContent = 'Edit ' + section.charAt(0).toUpperCase() + section.slice(1);
    Object.keys(data).forEach(k => {
      if (Array.isArray(data[k])) setField(section, k, data[k].join(', '));
      else setField(section, k, data[k]);
    });
  }
  form.style.display = 'block';
  if (section === 'gallery') refreshGalleryPreview();
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideForm(section) {
  const form = document.querySelector(`[data-admin-form="${section}"]`);
  if (!form) return;
  form.style.display = 'none';
  resetForm(section);
}

function collectFormData(section) {
  const form = document.querySelector(`[data-admin-form="${section}"]`);
  if (!form) return {};
  const data = {};
  form.querySelectorAll('[data-field]').forEach(el => {
    const name = el.getAttribute('data-field').replace(`${section}-`, '');
    if (name === 'id') { data.id = el.value; return; }
    if (el.tagName === 'TEXTAREA' && el.dataset.field.includes('images')) {
      data[name] = el.value.split(',').map(s => s.trim()).filter(Boolean);
    } else if (el.type === 'checkbox') {
      data[name] = el.checked;
    } else if (el.type === 'number') {
      data[name] = parseFloat(el.value) || 0;
    } else {
      data[name] = el.value;
    }
  });
  return data;
}

async function renderAdminList(section) {
  const list = document.querySelector(`[data-admin-list="${section}"]`);
  if (!list) return;
  const items = await getData(section);
  if (!items || !items.length) {
    list.innerHTML = `<div class="admin-list-empty">No ${section} entries yet.</div>`;
    return;
  }
  list.innerHTML = items.map((item, idx) => {
    const title = item.title || item.team1 || 'Untitled';
    const subtitle = item.meta || item.date || item.subtitle || (item.team2 ? `${item.team1} vs ${item.team2}` : '');
    const homepageBadge = section === 'events' && item.homepage ? '<span class="admin-badge" style="margin-left:0.5em;font-size:0.75em;padding:0.15em 0.5em;border-radius:4px;background:#c8963e22;color:#c8963e;border:1px solid #c8963e44;">Homepage</span>' : '';
    const attendeesBtn = section === 'events'
      ? `<button class="admin-list-attendees" data-admin-attendees="${item.id}" data-admin-attendees-title="${item.title}">Attendees</button>`
      : '';
    return `
      <div class="admin-list-item">
        <div class="admin-list-item-main">
          <span class="admin-list-item-title">${title}${homepageBadge}</span>
          <span class="admin-list-item-sub">${subtitle}</span>
        </div>
        <div class="admin-list-item-actions">
          ${attendeesBtn}
          <button class="admin-list-edit" data-admin-edit="${section}:${idx}">Edit</button>
          <button class="admin-list-delete" data-admin-delete="${section}:${idx}">Delete</button>
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('[data-admin-edit]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.adminEdit.split(':')[1]);
      const items = await getData(section);
      showForm(section, items[idx]);
    });
  });

  list.querySelectorAll('[data-admin-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.adminDelete.split(':')[1]);
      if (!confirm('Delete this item?')) return;
      const items = await getData(section);
      items.splice(idx, 1);
      await saveData(section, items);
      renderAdminList(section);
      updateDashboard();
    });
  });

  list.querySelectorAll('[data-admin-attendees]').forEach(btn => {
    btn.addEventListener('click', () => {
      showAttendees(btn.dataset.adminAttendees, btn.dataset.adminAttendeesTitle);
    });
  });
}

/* Generic CRUD for a section */
function buildFormHandlers(section) {
  const form = document.querySelector(`[data-admin-form="${section}"]`);
  const addBtn = document.querySelector(`[data-admin-add="${section}"]`);
  const saveBtn = form && form.querySelector('[data-admin-save]');
  const cancelBtn = form && form.querySelector('[data-admin-cancel]');
  if (!form || !addBtn || !saveBtn || !cancelBtn) return;

  addBtn.addEventListener('click', () => showForm(section, null));

  cancelBtn.addEventListener('click', () => hideForm(section));

  saveBtn.addEventListener('click', async () => {
    const data = collectFormData(section);
    const items = await getData(section);
    if (data.id) {
      const idx = items.findIndex(i => i.id === data.id);
      if (idx !== -1) items[idx] = { ...items[idx], ...data };
    } else {
      data.id = uid();
      items.push(data);
    }
    await saveData(section, items);
    hideForm(section);
    renderAdminList(section);
    updateDashboard();
  });
}

/* ─── LOGIN ─── */
function initLogin() {
  const overlay = document.querySelector('[data-admin-login]');
  const userInput = document.querySelector('[data-admin-login-user]');
  const passInput = document.querySelector('[data-admin-login-pass]');
  const btn = document.querySelector('[data-admin-login-btn]');
  const errorEl = document.querySelector('[data-admin-login-error]');

  if (!overlay) return;

  function doLogin() {
    const username = userInput.value.trim();
    const password = passInput.value.trim();
    if (!username || !password) {
      errorEl.textContent = 'Please enter username and password.';
      return;
    }
    errorEl.textContent = '';
    btn.disabled = true;
    btn.textContent = 'Signing in…';

    adminApi.login(username, password).then(ok => {
      btn.disabled = false;
      btn.textContent = 'Sign In';
      if (ok) {
        overlay.classList.add('is-authenticated');
        initApp();
      } else {
        errorEl.textContent = 'Invalid username or password.';
        passInput.value = '';
        passInput.focus();
      }
    });
  }

  btn.addEventListener('click', doLogin);
  passInput.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
}

/* ─── ATTENDEES ─── */
function showAttendees(eventId, eventTitle) {
  const overlay = document.querySelector('[data-attendee-overlay]');
  const listEl = document.querySelector('[data-attendee-list]');
  const countEl = document.querySelector('[data-attendee-count]');
  const titleEl = document.querySelector('[data-attendee-title]');
  const pdfBtn = document.querySelector('[data-attendee-pdf]');

  titleEl.textContent = `Attendees — ${eventTitle}`;
  listEl.innerHTML = '<tr><td colspan="4" style="padding:2em;text-align:center;color:var(--text-muted);">Loading...</td></tr>';
  countEl.textContent = '';
  overlay.classList.add('is-open');

  const token = adminApi.getToken && adminApi.getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  Promise.all([
    fetch(`/api/rsvp/${eventId}`, { headers }).then(r => r.json()),
  ]).then(([data]) => {
    const rows = data.data || [];
    countEl.textContent = `Total: ${rows.length} attendee${rows.length !== 1 ? 's' : ''}`;
    if (rows.length === 0) {
      listEl.innerHTML = '<tr><td colspan="4" style="padding:2em;text-align:center;color:var(--text-muted);">No attendees yet.</td></tr>';
    } else {
      listEl.innerHTML = rows.map((r, i) => `
        <tr${i % 2 === 0 ? ' style="background:#faf6f0;"' : ''}>
          <td style="padding:0.5em;">${i + 1}</td>
          <td style="padding:0.5em;">${r.name}</td>
          <td style="padding:0.5em;">${r.phone}</td>
          <td style="padding:0.5em;">${r.created_at ? r.created_at.slice(0, 10) : '-'}</td>
        </tr>
      `).join('');
    }
  }).catch(() => {
    listEl.innerHTML = '<tr><td colspan="4" style="padding:2em;text-align:center;color:#d32f2f;">Failed to load attendees.</td></tr>';
  });

  pdfBtn.onclick = () => {
    const token = adminApi.getToken && adminApi.getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`/api/rsvp/${eventId}/pdf`, { headers })
      .then(r => {
        if (!r.ok) throw new Error('Failed');
        return r.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeName = eventTitle.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, ' ').trim() || 'Attendance List';
        a.download = `${safeName} - Attendance List.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => alert('Failed to download PDF.'));
  };

  document.querySelector('[data-attendee-close]').onclick = () => overlay.classList.remove('is-open');
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('is-open');
  });
}

/* ─── IMAGE PREVIEW ─── */
function initGalleryImagePreview() {
  const textarea = document.querySelector('[data-field="gallery-images"]');
  const preview = document.querySelector('[data-gallery-preview]');
  if (!textarea || !preview) return;

  function renderPreview() {
    const urls = textarea.value.split(',').map(s => s.trim()).filter(Boolean);
    if (!urls.length) { preview.innerHTML = ''; return; }
    const html = urls.map((url, i) => `
      <div class="admin-image-preview-item">
        <img src="${url}" alt="" loading="lazy" onerror="this.parentElement.style.display='none'">
        <button class="admin-image-preview-remove" data-preview-remove="${i}" title="Remove image">✕</button>
      </div>
    `).join('');
    if (preview.innerHTML === html) return;
    preview.innerHTML = html;
    preview.querySelectorAll('[data-preview-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.previewRemove);
        const all = textarea.value.split(',').map(s => s.trim()).filter(Boolean);
        all.splice(idx, 1);
        textarea.value = all.join(', ');
        renderPreview();
      });
    });
  }

  textarea.addEventListener('input', renderPreview);
}

function refreshGalleryPreview() {
  const textarea = document.querySelector('[data-field="gallery-images"]');
  if (!textarea) return;
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

/* ─── UPLOAD + IMAGE BROWSER ─── */
function initUploads() {
  document.querySelectorAll('[data-upload-target]').forEach(btn => {
    const target = btn.dataset.uploadTarget;
    const input = document.querySelector(`[data-upload-input="${target}"]`);
    if (!input) return;
    btn.addEventListener('click', () => input.click());
    input.addEventListener('change', async () => {
      const files = Array.from(input.files);
      if (!files.length) return;
      btn.disabled = true;
      btn.textContent = '…';
      try {
        const urls = await adminApi.uploadMany(files);
        const field = document.querySelector(`[data-field="${target}"]`);
        if (field && urls.length) {
          const joined = urls.join(', ');
          if (field.tagName === 'TEXTAREA') {
            const existing = field.value.trim();
            field.value = existing ? existing + ', ' + joined : joined;
            if (target === 'gallery-images') refreshGalleryPreview();
          } else {
            field.value = urls[0];
          }
        }
      } catch (e) {
        alert(`Upload failed: ${e.message}`);
      }
      btn.disabled = false;
      btn.textContent = '+';
      input.value = '';
    });
  });

  initImageBrowser();
}

function initImageBrowser() {
  const overlay = document.querySelector('[data-browser-overlay]');
  const grid = document.querySelector('[data-browser-grid]');
  const closeBtn = document.querySelector('[data-browser-close]');
  const uploadInput = document.querySelector('[data-browser-upload]');
  if (!overlay || !grid) return;

  let currentTarget = null;

  document.querySelectorAll('[data-browse-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTarget = btn.dataset.browseTarget;
      openBrowser();
    });
  });

  closeBtn.addEventListener('click', () => overlay.classList.remove('is-open'));
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('is-open');
  });

  uploadInput.addEventListener('change', async () => {
    const files = Array.from(uploadInput.files);
    if (!files.length) return;
    try {
      const urls = await adminApi.uploadMany(files);
      uploadInput.value = '';
      if (urls.length && currentTarget) {
        const field = document.querySelector(`[data-field="${currentTarget}"]`);
        if (field) {
          const joined = urls.join(', ');
          if (field.tagName === 'TEXTAREA') {
            const existing = field.value.trim();
            field.value = existing ? existing + ', ' + joined : joined;
            if (currentTarget === 'gallery-images') refreshGalleryPreview();
          } else {
            field.value = urls[0];
          }
        }
      }
    } catch (e) {
      alert(`Upload failed: ${e.message}`);
    }
    openBrowser();
  });

  async function openBrowser() {
    grid.innerHTML = '<div class="browser-loading">Loading images...</div>';
    overlay.classList.add('is-open');

    const token = adminApi.getToken && adminApi.getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const res = await fetch('/api/uploads', { headers });
      const data = await res.json();
      const files = data.data || [];

      if (!files.length) {
        grid.innerHTML = '<div class="browser-empty">No images uploaded yet. Upload one above.</div>';
        return;
      }

      grid.innerHTML = files.map(f => `
        <div class="browser-item" data-browser-url="${f.url}">
          <img src="${f.url}" alt="${f.name}" loading="lazy">
        </div>
      `).join('');

      grid.querySelectorAll('[data-browser-url]').forEach(item => {
        item.addEventListener('click', () => {
          const url = item.dataset.browserUrl;
          if (!currentTarget) return;
          const field = document.querySelector(`[data-field="${currentTarget}"]`);
          if (field) {
            if (field.tagName === 'TEXTAREA') {
              const existing = field.value.trim();
              field.value = existing ? existing + ', ' + url : url;
              if (currentTarget === 'gallery-images') refreshGalleryPreview();
            } else {
              field.value = url;
            }
          }
          overlay.classList.remove('is-open');
        });
      });
    } catch {
      grid.innerHTML = '<div class="browser-empty">Failed to load images.</div>';
    }
  }
}

/* ─── FIXED-LIST SECTIONS (football_squad) ─── */
async function getFixedList(section) {
  if (section in _cache) return _cache[section];
  try {
    const items = await fetchAPI('GET', `/${section}`);
    const arr = items.data || items;
    if (Array.isArray(arr) && arr.length) { _cache[section] = arr; return arr; }
  } catch {}
  _cache[section] = getDefaultFixedList(section);
  return _cache[section];
}

async function saveFixedList(section, data) {
  _cache[section] = data;
  try {
    const res = await fetchAPI('GET', `/${section}`);
    const existing = (res.data || res) ?? [];
    const existingMap = new Map(existing.map(i => [i.id, i]));
    const currentMap = new Map(data.map(i => [i.id, i]));
    await Promise.all([
      ...data.filter(i => !existingMap.has(i.id)).map(i => fetchAPI('POST', `/${section}`, i).catch(() => {})),
      ...data.filter(i => existingMap.has(i.id)).map(i => fetchAPI('PUT', `/${section}/${i.id}`, i).catch(() => {})),
      ...existing.filter(i => !currentMap.has(i.id)).map(i => fetchAPI('DELETE', `/${section}/${i.id}`).catch(() => {})),
    ]);
  } catch {}
}

function getDefaultFixedList(section) {
  if (section === 'football_squad') {
    return [
      { id: 'gk',  name: 'Daniel',   num: 1,  label: 'GK', group: 'gk',  x: 50, y: 92, color: '#4a7c59', img: '/images/koh-01.jpeg' },
      { id: 'rb',  name: 'James',    num: 2,  label: 'RB', group: 'def', x: 82, y: 78, color: '#6b5d4a', img: '/images/koh-02.jpeg' },
      { id: 'cb1', name: 'Peter',    num: 4,  label: 'CB', group: 'def', x: 38, y: 82, color: '#6b5d4a', img: '/images/koh-v-2.jpeg' },
      { id: 'cb2', name: 'John',     num: 5,  label: 'CB', group: 'def', x: 62, y: 82, color: '#6b5d4a', img: '/images/cross-2.jpeg' },
      { id: 'lb',  name: 'Mark',     num: 3,  label: 'LB', group: 'def', x: 18, y: 78, color: '#6b5d4a', img: '/images/st-monica-1.jpeg' },
      { id: 'cm1', name: 'Luke',     num: 8,  label: 'CM', group: 'mid', x: 28, y: 55, color: '#2b5c8a', img: '/images/mary_jesus_01.jpeg' },
      { id: 'cm2', name: 'Andrew',   num: 6,  label: 'CM', group: 'mid', x: 50, y: 50, color: '#2b5c8a', img: '/images/index.jpeg' },
      { id: 'cm3', name: 'Thomas',   num: 10, label: 'CM', group: 'mid', x: 72, y: 55, color: '#2b5c8a', img: '/images/koh-01.jpeg' },
      { id: 'lw',  name: 'Samuel',   num: 11, label: 'LW', group: 'fwd', x: 18, y: 25, color: '#c8963e', img: '/images/koh-02.jpeg' },
      { id: 'st',  name: 'Joseph',   num: 9,  label: 'ST', group: 'fwd', x: 50, y: 18, color: '#c8963e', img: '/images/koh-v-2.jpeg' },
      { id: 'rw',  name: 'David',    num: 7,  label: 'RW', group: 'fwd', x: 82, y: 25, color: '#c8963e', img: '/images/cross-2.jpeg' },
    ];
  }
  return [];
}

async function renderFixedList(section) {
  const list = document.querySelector(`[data-admin-list="${section}"]`);
  if (!list) return;
  let items = await getFixedList(section);
  list.innerHTML = items.map((item, idx) => {
    const title = item.name || item.role || 'Untitled';
    const sub = section === 'football_squad' ? `${item.label} · #${item.num} · ${item.name}${item.position ? ' · ' + item.position : ''}` : item.role;
    return `
      <div class="admin-list-item">
        <div class="admin-list-item-main">
          <span class="admin-list-item-title">${title}</span>
          <span class="admin-list-item-sub">${sub}</span>
        </div>
        <div class="admin-list-item-actions">
          <button class="admin-list-edit" data-admin-edit="${section}:${idx}">Edit</button>
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('[data-admin-edit]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.adminEdit.split(':')[1]);
      const items = await getFixedList(section);
      showFixedForm(section, items[idx], idx);
    });
  });
}

function showFixedForm(section, data, idx) {
  const form = document.querySelector(`[data-admin-form="${section}"]`);
  if (!form) return;
  const title = form.querySelector('[data-form-title]');
  if (title) title.textContent = 'Edit ' + (section === 'football_squad' ? 'Player' : 'Leader');
  form.querySelectorAll('[data-field]').forEach(el => {
    const name = el.getAttribute('data-field').replace(`${section}-`, '');
    if (name === 'idx') return;
    if (name.startsWith('stat_')) {
      const statName = name.replace('stat_', '');
      el.value = (data.stats && data.stats[statName]) ?? '';
    } else {
      el.value = data[name] ?? '';
    }
  });
  form.dataset.editIdx = idx;
  form.style.display = 'block';
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideFixedForm(section) {
  const form = document.querySelector(`[data-admin-form="${section}"]`);
  if (!form) return;
  form.style.display = 'none';
  delete form.dataset.editIdx;
}

function initFixedSection(section) {
  const form = document.querySelector(`[data-admin-form="${section}"]`);
  const saveBtn = form && form.querySelector('[data-admin-save]');
  const cancelBtn = form && form.querySelector('[data-admin-cancel]');
  if (!form || !saveBtn || !cancelBtn) return;

  cancelBtn.addEventListener('click', () => hideFixedForm(section));

  saveBtn.addEventListener('click', async () => {
    const idx = parseInt(form.dataset.editIdx);
    if (isNaN(idx)) return;
    const items = await getFixedList(section);
    const stats = {};
    form.querySelectorAll('[data-field]').forEach(el => {
      const name = el.getAttribute('data-field').replace(`${section}-`, '');
      if (name === 'idx') return;
      if (name.startsWith('stat_')) {
        stats[name.replace('stat_', '')] = parseInt(el.value) || 0;
      } else if (name === 'num' || name === 'rating') {
        items[idx][name] = parseInt(el.value) || 0;
      } else {
        items[idx][name] = el.value;
      }
    });
    if (Object.keys(stats).length) items[idx].stats = stats;
    await saveFixedList(section, items);
    hideFixedForm(section);
    renderFixedList(section);
    updateDashboard();
  });
}

/* ─── SIDEBAR TOGGLE ─── */
function initSidebar() {
  const toggle = document.querySelector('[data-sidebar-toggle]');
  const sidebar = document.querySelector('[data-admin-sidebar]');
  const overlay = document.querySelector('[data-sidebar-overlay]');

  if (!toggle || !sidebar) return;

  const open = () => {
    sidebar.classList.add('is-open');
    toggle.classList.add('is-active');
    if (overlay) overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    sidebar.classList.remove('is-open');
    toggle.classList.remove('is-active');
    if (overlay) overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    if (sidebar.classList.contains('is-open')) close();
    else open();
  });

  if (overlay) overlay.addEventListener('click', close);

  document.querySelectorAll('[data-admin-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 768) close();
    });
  });
}

/* ─── INDEX PAGE ─── */
const SPHERE_DEFAULTS = [
  '/images/koh-01.jpeg', '/images/koh-02.jpeg', '/images/koh-v-2.jpeg',
  '/images/st-monica-1.jpeg', '/images/mary_jesus_01.jpeg', '/images/index.jpeg',
];
const GRID_DEFAULTS = [
  '/images/koh-01.jpeg', '/images/koh-02.jpeg',
  '/images/st-monica-1.jpeg', '/images/mary_jesus_01.jpeg', '/images/index.jpeg',
];

function initIndexPage() {
  function makeGalleryRender(gridSelector, storageKey, defaults) {
    const grid = document.querySelector(gridSelector);
    if (!grid) return () => {};
    const storeKey = storageKey.replace('stm_', '');
    return function render() {
      let items = _cache[storageKey];
      if (!items) {
        items = [...defaults];
        _cache[storageKey] = items;
      }
      if (!items.length) {
        grid.innerHTML = '<div class="admin-list-empty">No photos yet.</div>';
        return;
      }
      grid.innerHTML = items.map((url, i) => `
        <div class="index-gallery-item">
          <img src="${url}" alt="" loading="lazy">
          <button class="admin-list-delete" data-index="${i}" title="Remove">×</button>
        </div>
      `).join('');
      grid.querySelectorAll('[data-index]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (!confirm('Remove this photo?')) return;
          const idx = parseInt(btn.dataset.index);
          items = _cache[storageKey] || [...defaults];
          items.splice(idx, 1);
          _cache[storageKey] = items;
          if (adminApi.isLoggedIn()) adminApi.setStore(storeKey, items).catch(() => {});
          render();
        });
      });
    };
  }

  const renderSphereGallery = makeGalleryRender(
    '[data-index-sphere-grid]', 'stm_gallery_sphere', SPHERE_DEFAULTS
  );
  const renderGridGallery = makeGalleryRender(
    '[data-index-grid-grid]', 'stm_gallery_grid', GRID_DEFAULTS
  );

  function initAddImage(section) {
    const prefix = section === 'sphere' ? 'index-sphere' : 'index-grid';
    const storageKey = section === 'sphere' ? 'stm_gallery_sphere' : 'stm_gallery_grid';
    const defaults = section === 'sphere' ? SPHERE_DEFAULTS : GRID_DEFAULTS;
    const renderFn = section === 'sphere' ? renderSphereGallery : renderGridGallery;
    const storeKey = storageKey.replace('stm_', '');

    const addBtn = document.querySelector(`[data-${prefix}-add]`);
    const urlInput = document.querySelector(`[data-${prefix}-url]`);
    const uploadBtn = document.querySelector(`[data-${prefix}-upload]`);
    const fileInput = document.querySelector(`[data-${prefix}-file]`);
    if (!addBtn || !urlInput) return;

    function addImage(url) {
      if (!url) { alert('Enter an image URL or upload a file.'); return; }
      let items = _cache[storageKey] || [...defaults];
      items.push(url);
      _cache[storageKey] = items;
      if (adminApi.isLoggedIn()) adminApi.setStore(storeKey, items).catch(() => {});
      urlInput.value = '';
      renderFn();
    }

    addBtn.addEventListener('click', () => addImage(urlInput.value.trim()));

    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', async () => {
        const files = Array.from(fileInput.files);
        if (!files.length) return;
        uploadBtn.disabled = true;
        uploadBtn.textContent = '...';
        try {
          const urls = await adminApi.uploadMany(files);
          if (urls.length) addImage(urls[0]);
        } catch (e) {
          alert('Upload failed: ' + e.message);
        }
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload';
        fileInput.value = '';
      });
    }
  }

  const loadSphere = async () => {
    try {
      const data = await adminApi.getStore('gallery_sphere');
      if (data) { _cache['stm_gallery_sphere'] = data; }
    } catch {}
    renderSphereGallery();
  };
  const loadGrid = async () => {
    try {
      const data = await adminApi.getStore('gallery_grid');
      if (data) { _cache['stm_gallery_grid'] = data; }
    } catch {}
    renderGridGallery();
  };
  loadSphere();
  loadGrid();
  initAddImage('sphere');
  initAddImage('grid');
}

/* ─── LEADERSHIP ─── */
function initLeadershipPage() {
  const list = document.querySelector('[data-admin-list="leadership"]');
  const addBtn = document.querySelector('[data-admin-leadership-add]');
  const form = document.querySelector('[data-admin-form="leadership"]');
  const saveBtn = form && form.querySelector('[data-admin-save]');
  const cancelBtn = form && form.querySelector('[data-admin-cancel]');
  if (!list) return;

  let editingIdx = -1;

  async function render() {
    const items = await getLeadershipData();
    if (!items.length) {
      list.innerHTML = '<div class="admin-list-empty">No leadership roles yet. Click "Add Role" to create one.</div>';
      return;
    }
    list.innerHTML = items.map((item, idx) => `
      <div class="admin-list-item">
        <div class="admin-list-item-main">
          <span class="admin-list-item-title">${item.name || 'Untitled'}</span>
          <span class="admin-list-item-sub">${item.role || ''}</span>
        </div>
        <div class="admin-list-item-actions">
          <button class="admin-list-edit" data-leadership-edit="${idx}">Edit</button>
          <button class="admin-list-delete" data-leadership-delete="${idx}">Delete</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('[data-leadership-edit]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.dataset.leadershipEdit);
        const items = await getLeadershipData();
        const data = items[idx];
        if (!form) return;
        const title = form.querySelector('[data-form-title]');
        if (title) title.textContent = 'Edit Leader';
        form.querySelectorAll('[data-field]').forEach(el => {
          const name = el.getAttribute('data-field').replace('leadership-', '');
          el.value = data[name] ?? '';
        });
        editingIdx = idx;
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    list.querySelectorAll('[data-leadership-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this leadership role?')) return;
        const idx = parseInt(btn.dataset.leadershipDelete);
        const items = await getLeadershipData();
        items.splice(idx, 1);
        await saveLeadershipData(items);
        render();
        updateDashboard();
      });
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (!form) return;
      editingIdx = -1;
      form.querySelectorAll('[data-field]').forEach(el => el.value = '');
      const title = form.querySelector('[data-form-title]');
      if (title) title.textContent = 'New Leader';
      form.style.display = 'block';
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (!form) return;
      const data = {};
      form.querySelectorAll('[data-field]').forEach(el => {
        const name = el.getAttribute('data-field').replace('leadership-', '');
        data[name] = el.value;
      });
      if (!data.name || !data.role) { alert('Name and Role are required.'); return; }
      const items = await getLeadershipData();
      if (editingIdx >= 0 && editingIdx < items.length) {
        const updated = { ...items[editingIdx], ...data };
        if (!updated.img) {
          updated.initials = updated.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        }
        items[editingIdx] = updated;
      } else {
        data.id = 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        data.initials = data.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const colors = ['#c8963e','#8b6914','#7a8a7a','#9a8b78','#c47a5a','#2b5c8a','#6aab6a','#8a7ab8','#d4a06a','#e8b84c'];
        data.color = colors[items.length % colors.length];
        items.push(data);
      }
      await saveLeadershipData(items);
      form.style.display = 'none';
      render();
      updateDashboard();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (form) form.style.display = 'none';
    });
  }

  render();
}

/* ─── FAMILIES ─── */
function initFamiliesPage() {
  const container = document.querySelector('[data-admin-families-list]');
  if (!container) return;

  async function render() {
    const families = await getFamiliesData();
    container.innerHTML = families.map((family, fi) => `
      <div style="margin-bottom:1.5em;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;background:var(--warm-white);">
        <div style="padding:0.6em 1em;background:${family.color}22;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:0.5em;flex-wrap:wrap;">
          <input type="text" data-family-color="${fi}" value="${family.color}" style="width:70px;font-family:var(--font-mono);font-size:0.75em;padding:0.3em 0.4em;border:1.5px solid #ddd6cc;border-radius:4px;background:#fcfaf8;color:#2c2416;">
          <input type="text" data-family-name="${fi}" value="${family.name}" style="flex:1;min-width:120px;font-family:var(--font-display);font-size:0.9em;font-weight:600;padding:0.3em 0.4em;border:1.5px solid #ddd6cc;border-radius:4px;background:#fcfaf8;color:#2c2416;">
          <input type="text" data-family-sub="${fi}" value="${family.sub}" style="flex:1;min-width:100px;font-size:0.75em;font-family:var(--font-mono);padding:0.3em 0.4em;border:1.5px solid #ddd6cc;border-radius:4px;background:#fcfaf8;color:var(--text-muted);">
          <button class="admin-btn admin-btn-outline" data-family-save="${fi}" style="font-size:0.7em;padding:0.3em 0.7em;margin:0;">Save</button>
        </div>
        <div style="padding:0.75em 1em;">
          <div style="display:flex;flex-wrap:wrap;gap:0.5em;margin-bottom:0.75em;" data-family-members="${fi}">
            ${family.members.map((m, mi) => `
              <span style="display:inline-flex;align-items:center;gap:0.35em;padding:0.3em 0.6em;background:var(--bg-secondary);border-radius:6px;font-size:0.85em;border:1px solid var(--border);">
                ${m}
                <button data-family-remove="${fi}:${mi}" style="background:none;border:none;cursor:pointer;color:#d32f2f;font-size:1.1em;line-height:1;padding:0;">×</button>
              </span>
            `).join('')}
          </div>
          <div style="display:flex;gap:0.5em;">
            <input type="text" data-family-input="${fi}" placeholder="Add member name..." style="flex:1;min-width:120px;font-family:var(--font-body);font-size:0.85em;padding:0.45em 0.6em;border:1.5px solid #ddd6cc;border-radius:6px;background:#fcfaf8;color:#2c2416;">
            <button class="admin-add-btn" data-family-add="${fi}" style="margin:0;font-size:0.8em;padding:0.45em 0.9em;">+ Add</button>
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('[data-family-add]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const fi = parseInt(btn.dataset.familyAdd);
        const input = document.querySelector(`[data-family-input="${fi}"]`);
        const name = input?.value.trim();
        if (!name) { alert('Enter a name.'); return; }
        const families = await getFamiliesData();
        if (families[fi]) families[fi].members.push(name);
        await saveFamiliesData(families);
        render();
      });
    });

    container.querySelectorAll('[data-family-remove]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const [fi, mi] = btn.dataset.familyRemove.split(':').map(Number);
        if (!confirm(`Remove this member?`)) return;
        const families = await getFamiliesData();
        if (families[fi] && families[fi].members[mi]) {
          families[fi].members.splice(mi, 1);
          await saveFamiliesData(families);
          render();
        }
      });
    });

    container.querySelectorAll('[data-family-save]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const fi = parseInt(btn.dataset.familySave);
        const nameInput = document.querySelector(`[data-family-name="${fi}"]`);
        const subInput = document.querySelector(`[data-family-sub="${fi}"]`);
        const colorInput = document.querySelector(`[data-family-color="${fi}"]`);
        const families = await getFamiliesData();
        if (families[fi]) {
          if (nameInput?.value.trim()) families[fi].name = nameInput.value.trim();
          families[fi].sub = subInput?.value.trim() || families[fi].sub;
          if (colorInput?.value.trim()) families[fi].color = colorInput.value.trim();
          await saveFamiliesData(families);
          render();
        }
      });
    });
  }

  render();
}

/* ─── PROGRAMS ─── */
const PROGRAMS_DEFAULTS = [];

const PROGRAMS_GRADIENTS = [
  'linear-gradient(135deg, rgba(200,150,62,0.1), rgba(200,150,62,0.03))',
  'linear-gradient(135deg, rgba(196,122,90,0.1), rgba(196,122,90,0.03))',
  'linear-gradient(135deg, rgba(122,138,122,0.1), rgba(122,138,122,0.03))',
  'linear-gradient(135deg, rgba(200,150,62,0.1), rgba(200,150,62,0.03))',
  'linear-gradient(135deg, rgba(196,122,90,0.1), rgba(196,122,90,0.03))',
  'linear-gradient(135deg, rgba(122,138,122,0.1), rgba(122,138,122,0.03))',
];

async function getProgramsData() {
  if ('programs' in _cache) return _cache.programs;
  try {
    const items = await fetchAPI('GET', '/programs');
    const arr = items.data || items;
    if (Array.isArray(arr)) { _cache.programs = arr; return arr; }
  } catch {}
  _cache.programs = [];
  return [];
}

async function saveProgramsData(data) {
  _cache.programs = data;
  try {
    const res = await fetchAPI('GET', '/programs');
    const existing = (res.data || res) ?? [];
    const existingMap = new Map(existing.map(i => [i.id, i]));
    const currentMap = new Map(data.map(i => [i.id, i]));
    await Promise.all([
      ...data.filter(i => !existingMap.has(i.id)).map(i => fetchAPI('POST', '/programs', i).catch(() => {})),
      ...data.filter(i => existingMap.has(i.id)).map(i => fetchAPI('PUT', `/programs/${i.id}`, i).catch(() => {})),
      ...existing.filter(i => !currentMap.has(i.id)).map(i => fetchAPI('DELETE', `/programs/${i.id}`).catch(() => {})),
    ]);
  } catch {}
}

function initProgramsPage() {
  const list = document.querySelector('[data-admin-list="programs"]');
  const addBtn = document.querySelector('[data-admin-programs-add]');
  const form = document.querySelector('[data-admin-form="programs"]');
  const saveBtn = form && form.querySelector('[data-admin-save]');
  const cancelBtn = form && form.querySelector('[data-admin-cancel]');
  if (!list) return;

  let editingId = null;

  function resetForm() {
    if (!form) return;
    form.querySelectorAll('[data-field]').forEach(el => el.value = '');
    form.querySelector('[data-form-title]').textContent = 'New Program';
    form.style.display = 'none';
    editingId = null;
  }

  function showForm(data) {
    if (!form) return;
    resetForm();
    if (data) {
      form.querySelector('[data-form-title]').textContent = 'Edit Program';
      Object.keys(data).forEach(k => {
        const el = form.querySelector(`[data-field="programs-${k}"]`);
        if (el) el.value = data[k];
      });
      editingId = data.id;
    }
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function render() {
    const items = await getProgramsData();
    if (!items.length) {
      list.innerHTML = '<div class="admin-list-empty">No programs yet. Click "Add Program" to create one.</div>';
      return;
    }
    list.innerHTML = items.map((item, idx) => `
      <div class="admin-list-item">
        <div class="admin-list-item-main">
          <span class="admin-list-item-title">${item.title}</span>
          <span class="admin-list-item-sub">${item.meta || ''}</span>
        </div>
        <div class="admin-list-item-actions">
          <button class="admin-list-edit" data-programs-edit="${item.id}">Edit</button>
          <button class="admin-list-delete" data-programs-delete="${item.id}">Delete</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('[data-programs-edit]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const items = await getProgramsData();
        const item = items.find(i => i.id === btn.dataset.programsEdit);
        if (item) showForm(item);
      });
    });

    list.querySelectorAll('[data-programs-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this program?')) return;
        let items = await getProgramsData();
        items = items.filter(i => i.id !== btn.dataset.programsDelete);
        await saveProgramsData(items);
        render();
        updateDashboard();
      });
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => showForm(null));
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const title = form?.querySelector('[data-field="programs-title"]')?.value.trim();
      if (!title) { alert('Title is required.'); return; }
      const items = await getProgramsData();
      const data = {
        title,
        desc: form?.querySelector('[data-field="programs-desc"]')?.value.trim() || '',
        meta: form?.querySelector('[data-field="programs-meta"]')?.value.trim() || '',
      };
      if (editingId) {
        const idx = items.findIndex(i => i.id === editingId);
        if (idx !== -1) items[idx] = { ...items[idx], ...data };
      } else {
        data.id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
        items.push(data);
      }
      await saveProgramsData(items);
      resetForm();
      render();
      updateDashboard();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', resetForm);
  }

  render();
}

const FOOTBALL_STATS_DEFAULTS = { matches: 24, goals: 16, cleanSheets: 8, trophies: 3 };

async function getFootballStats() {
  if (_cache.football_stats) return _cache.football_stats;
  try {
    const data = await adminApi.getFootballStats();
    if (data && typeof data.matches === 'number') { _cache.football_stats = data; return data; }
  } catch {}
  _cache.football_stats = FOOTBALL_STATS_DEFAULTS;
  return FOOTBALL_STATS_DEFAULTS;
}

function initFootballStatsPage() {
  const form = document.querySelector('[data-admin-form="football_stats"]');
  const saveBtn = form && form.querySelector('[data-admin-save]');
  const cancelBtn = form && form.querySelector('[data-admin-cancel]');
  if (!form || !saveBtn || !cancelBtn) return;

  async function populateForm() {
    const data = await getFootballStats();
    form.querySelector('[data-field="football_stats-matches"]').value = data.matches;
    form.querySelector('[data-field="football_stats-goals"]').value = data.goals;
    form.querySelector('[data-field="football_stats-cleanSheets"]').value = data.cleanSheets;
    form.querySelector('[data-field="football_stats-trophies"]').value = data.trophies;
  }

  populateForm();

  saveBtn.addEventListener('click', async () => {
    const data = {
      matches: parseInt(form.querySelector('[data-field="football_stats-matches"]').value) || 0,
      goals: parseInt(form.querySelector('[data-field="football_stats-goals"]').value) || 0,
      cleanSheets: parseInt(form.querySelector('[data-field="football_stats-cleanSheets"]').value) || 0,
      trophies: parseInt(form.querySelector('[data-field="football_stats-trophies"]').value) || 0,
    };
    _cache.football_stats = data;
    if (adminApi.isLoggedIn()) adminApi.setFootballStats(data).catch(() => {});
    updateDashboard();
  });

  cancelBtn.addEventListener('click', populateForm);
}

async function initApp() {
  initSidebar();
  initTabs();
  initIndexPage();
  initProgramsPage();
  for (const section of ['events', 'gallery', 'spotlight', 'sports', 'hof']) {
    try {
      buildFormHandlers(section);
    } catch (e) {
      console.error('admin: failed to init', section, e);
    }
    await renderAdminList(section);
  }
  for (const section of ['football_squad']) {
    try {
      initFixedSection(section);
    } catch (e) {
      console.error('admin: failed to init fixed section', section, e);
    }
    await renderFixedList(section);
  }
  initLeadershipPage();
  initFamiliesPage();
  initFootballStatsPage();
  initUploads();
  initGalleryImagePreview();
  updateDashboard();
}

/* ─── BOOT ─── */
function initThemeToggle() {
  const toggle = document.querySelector('[data-theme-toggle]');
  if (!toggle) return;
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    toggle.textContent = '☀️';
  }
  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      toggle.textContent = '🌙';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      toggle.textContent = '☀️';
    }
  });
}

function init() {
  initThemeToggle();
  const loader = document.querySelector('[data-loader]');
  const bar = document.querySelector('[data-loader-bar]');
  if (bar) {
    let p = 0;
    const anim = () => {
      p += 2 + Math.random() * 3;
      if (p > 100) p = 100;
      bar.style.width = `${p}%`;
      if (p < 100) requestAnimationFrame(anim);
      else {
        setTimeout(() => {
          document.documentElement.classList.add('is-ready', 'fonts-loaded');
          if (loader) setTimeout(() => loader.style.display = 'none', 800);
          initLogin();
        }, 400);
      }
    };
    anim();
  } else {
    document.documentElement.classList.add('is-ready', 'fonts-loaded');
    initLogin();
  }
}

document.addEventListener('DOMContentLoaded', init);
