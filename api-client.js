// ═══════════════════════════════════════════════════
//  MTG SYSTEM — API Client
//  Replaces localStorage with real C# backend calls
// ═══════════════════════════════════════════════════

const API = {
  BASE: '/api',
  _token: null,

  // ── TOKEN MANAGEMENT ──
  getToken() {
    if (!this._token) this._token = localStorage.getItem('mtg_token');
    return this._token;
  },
  setToken(token) {
    this._token = token;
    if (token) localStorage.setItem('mtg_token', token);
    else localStorage.removeItem('mtg_token');
  },
  clearToken() { this.setToken(null); },

  // ── HTTP BASE ──
  async request(method, path, body = null, auth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = this.getToken();
      if (!token) { window.location.href = 'index.html'; return null; }
      headers['Authorization'] = `Bearer ${token}`;
    }
    try {
      const res = await fetch(this.BASE + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
      });

      // Token expired or invalid
      if (res.status === 401) {
        this.clearToken();
        window.location.href = 'index.html';
        return null;
      }

      // No content
      if (res.status === 204) return { ok: true };

      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      console.error('API Error:', err);
      return { ok: false, status: 0, data: { message: 'Sem conexão com o servidor' } };
    }
  },

  get:    (path, auth=true) => API.request('GET',    path, null, auth),
  post:   (path, body, auth=true) => API.request('POST',   path, body, auth),
  put:    (path, body, auth=true) => API.request('PUT',    path, body, auth),
  delete: (path, auth=true) => API.request('DELETE', path, null, auth),

  // ── AUTH ──
  auth: {
    async login(email, password) {
      const r = await API.post('/auth/login', { email, password }, false);
      if (r?.ok) {
        API.setToken(r.data.token);
        localStorage.setItem('mtg_user', JSON.stringify({
          id: r.data.id, name: r.data.name,
          email: r.data.email, role: r.data.role
        }));
      }
      return r;
    },
    async register(data) {
      return API.post('/auth/register', data, false);
    },
    logout() {
      API.clearToken();
      localStorage.removeItem('mtg_user');
      window.location.href = 'index.html';
    },
    getSession() {
      try {
        const s = localStorage.getItem('mtg_user');
        return s ? JSON.parse(s) : null;
      } catch { return null; }
    },
    isLoggedIn() { return !!API.getToken() && !!API.auth.getSession(); },
    can(action) {
      const s = API.auth.getSession();
      if (!s) return false;
      const perms = {
        admin: ['all'],
        estoquista: ['products_read', 'products_write', 'estoque', 'dashboard'],
        analista: ['products_read', 'reports', 'dashboard'],
        visualizador: ['products_read', 'dashboard']
      };
      const p = perms[s.role] || [];
      return p.includes('all') || p.includes(action);
    }
  },

  // ── PRODUCTS ──
  products: {
    list: (params = {}) => API.get('/products?' + new URLSearchParams(params)),
    get:  (id) => API.get(`/products/${id}`),
    categories: () => API.get('/products/categories'),
    create: (data) => API.post('/products', data),
    update: (id, data) => API.put(`/products/${id}`, data),
    delete: (id) => API.delete(`/products/${id}`),
  },

  // ── STOCK ──
  stock: {
    list:      (params = {}) => API.get('/stock?' + new URLSearchParams(params)),
    stats:     () => API.get('/stock/stats'),
    byProduct: (id) => API.get(`/stock/product/${id}`),
    register:  (productId, data) => API.post(`/stock/${productId}`, data),
  },

  // ── USERS ──
  users: {
    list:   (params = {}) => API.get('/users?' + new URLSearchParams(params)),
    create: (data) => API.post('/users', data),
    update: (id, data) => API.put(`/users/${id}`, data),
    delete: (id) => API.delete(`/users/${id}`),
    logs:   (params = {}) => API.get('/users/logs?' + new URLSearchParams(params)),
    clearLogs: () => API.delete('/users/logs'),
  },

  // ── DASHBOARD ──
  dashboard: {
    get: () => API.get('/dashboard'),
  }
};

// ── GUARD: redirect if not authenticated ──
function requireAuth() {
  if (!API.auth.isLoggedIn()) {
    window.location.href = 'index.html';
    return null;
  }
  return API.auth.getSession();
}

// ── GUARD: redirect if already authenticated ──
function redirectIfAuth() {
  if (API.auth.isLoggedIn()) window.location.href = 'dashboard.html';
}
