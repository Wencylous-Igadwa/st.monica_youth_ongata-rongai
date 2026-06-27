const API_BASE = '/api';

const CRUD_SECTIONS = new Set([
  'events', 'gallery', 'spotlight', 'sports', 'hof',
  'leadership', 'families', 'programs', 'football_squad',
]);

const STORE_KEYS = new Set(['gallery_sphere', 'gallery_grid']);

function lsKey(section) {
  return `stm_${section}`;
}

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function loadList(section, defaults = []) {
  try {
    if (CRUD_SECTIONS.has(section)) {
      const data = await fetchJson(`${API_BASE}/${section}`);
      const items = data.data || data;
      if (items && items.length) return items;
    }
    if (STORE_KEYS.has(section)) {
      const data = await fetchJson(`${API_BASE}/store/${section}`);
      return data.data ?? defaults;
    }
    if (section === 'football_stats') {
      const data = await fetchJson(`${API_BASE}/football_stats`);
      return data.data || defaults;
    }
  } catch {
    /* fall through to localStorage */
  }
  try {
    const raw = localStorage.getItem(lsKey(section));
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaults;
}

export async function filterList(section, predicate, defaults = []) {
  const all = await loadList(section, defaults);
  return all.filter(predicate);
}

export async function saveList(section, items) {
  localStorage.setItem(lsKey(section), JSON.stringify(items));
  if (CRUD_SECTIONS.has(section)) {
    const token = localStorage.getItem('stm_admin_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const existing = await fetchJson(`${API_BASE}/${section}`, { headers }).catch(() => ({ data: [] }));
    const existingMap = new Map((existing.data || existing).map(i => [i.id, i]));
    const currentMap = new Map(items.map(i => [i.id, i]));
    for (const item of items) {
      if (!existingMap.has(item.id)) {
        await fetchJson(`${API_BASE}/${section}`, {
          method: 'POST', headers, body: JSON.stringify(item),
        }).catch(() => {});
      } else {
        await fetchJson(`${API_BASE}/${section}/${item.id}`, {
          method: 'PUT', headers, body: JSON.stringify(item),
        }).catch(() => {});
      }
    }
    for (const [id] of existingMap) {
      if (!currentMap.has(id)) {
        await fetchJson(`${API_BASE}/${section}/${id}`, {
          method: 'DELETE', headers,
        }).catch(() => {});
      }
    }
  }
}

export async function saveSingleton(section, data) {
  localStorage.setItem(lsKey(section), JSON.stringify(data));
  const token = localStorage.getItem('stm_admin_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (STORE_KEYS.has(section)) {
    await fetchJson(`${API_BASE}/store/${section}`, {
      method: 'PUT', headers, body: JSON.stringify({ data }),
    }).catch(() => {});
  } else if (section === 'football_stats') {
    await fetchJson(`${API_BASE}/football_stats`, {
      method: 'PUT', headers, body: JSON.stringify(data),
    }).catch(() => {});
  }
}

export async function saveStore(section, data) {
  return saveSingleton(section, data);
}
