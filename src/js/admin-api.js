const API_BASE = '/api';
let authToken = localStorage.getItem('stm_admin_token') || '';

function headers(json) {
  const h = {};
  if (authToken) h['Authorization'] = `Bearer ${authToken}`;
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

function fetchWithTimeout(url, opts = {}, ms = 4000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timer));
}

export const adminApi = {
  /* ─── AUTH ─── */
  async login(username, password) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('API rejected');
      const data = await res.json();
      authToken = data.token;
      localStorage.setItem('stm_admin_token', authToken);
      return true;
    } catch {
      return false;
    }
  },

  logout() {
    authToken = '';
    localStorage.removeItem('stm_admin_token');
  },

  isLoggedIn() {
    return !!authToken;
  },

  getToken() {
    return authToken;
  },

  /* ─── UPLOAD ─── */
  async upload(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetchWithTimeout(`${API_BASE}/upload`, {
      method: 'POST',
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
      body: fd,
    }, 30000);
    if (!res.ok) {
      const msg = (await res.json().catch(() => ({}))).error || 'Upload failed';
      throw new Error(msg);
    }
    const data = await res.json();
    return (data.urls && data.urls[0]) || data.url;
  },

  async uploadMany(files) {
    const fd = new FormData();
    files.forEach(f => fd.append('file', f));
    const res = await fetchWithTimeout(`${API_BASE}/upload`, {
      method: 'POST',
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
      body: fd,
    }, 30000);
    if (!res.ok) {
      const msg = (await res.json().catch(() => ({}))).error || 'Upload failed';
      throw new Error(msg);
    }
    const data = await res.json();
    return data.urls || [];
  },

  /* ─── CRUD ─── */
  async list(section) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/${section}`, { headers: headers(true) });
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      const items = data.data || data;
      if (Array.isArray(items) && items.length) return items;
    } catch {}
    try {
      const raw = localStorage.getItem(`stm_${section}`);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },

  async create(section, data) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/${section}`, {
        method: 'POST', headers: headers(true), body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Create failed');
      return await res.json();
    } catch {
      return data;
    }
  },

  async update(section, id, data) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/${section}/${id}`, {
        method: 'PUT', headers: headers(true), body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Update failed');
      return await res.json();
    } catch {
      return data;
    }
  },

  async remove(section, id) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/${section}/${id}`, {
        method: 'DELETE', headers: headers(true),
      });
      if (!res.ok) throw new Error('Delete failed');
      return true;
    } catch {
      try {
        const raw = localStorage.getItem(`stm_${section}`);
        const items = raw ? JSON.parse(raw) : [];
        const idx = items.findIndex(i => i.id === id);
        if (idx !== -1) items.splice(idx, 1);
        localStorage.setItem(`stm_${section}`, JSON.stringify(items));
      } catch {}
      return true;
    }
  },

  /* ─── STORE (KV) ─── */
  async getStore(key) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/store/${key}`, { headers: headers(true) });
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      return data.data;
    } catch {
      try {
        const raw = localStorage.getItem(`stm_${key}`);
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    }
  },

  async setStore(key, data) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/store/${key}`, {
        method: 'PUT', headers: headers(true), body: JSON.stringify({ data }),
      });
      if (!res.ok) throw new Error('Save failed');
      return true;
    } catch {
      localStorage.setItem(`stm_${key}`, JSON.stringify(data));
      return true;
    }
  },

  /* ─── FOOTBALL STATS ─── */
  async getFootballStats() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/football_stats`, { headers: headers(true) });
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      return data.data;
    } catch {
      try {
        const raw = localStorage.getItem('stm_football_stats');
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    }
  },

  async setFootballStats(data) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/football_stats`, {
        method: 'PUT', headers: headers(true), body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Save failed');
      return true;
    } catch {
      localStorage.setItem('stm_football_stats', JSON.stringify(data));
      return true;
    }
  },

  /* ─── FOOTBALL COACH ─── */
  async getCoach() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/store/football_coach`, { headers: headers(true) });
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      return data.data;
    } catch {
      try {
        const raw = localStorage.getItem('stm_football_coach');
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    }
  },

  async setCoach(data) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/store/football_coach`, {
        method: 'PUT', headers: headers(true), body: JSON.stringify({ data }),
      });
      if (!res.ok) throw new Error('Save failed');
      return true;
    } catch {
      localStorage.setItem('stm_football_coach', JSON.stringify(data));
      return true;
    }
  },

};
