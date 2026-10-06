const API_BASE = '/api/v1';

const ACCESS_TOKEN_KEY = 'meridian_healthcare_access_token_v1';

export function getStoredAccessToken() {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAccessToken(token) {
  try {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          setStoredAccessToken(null);
          throw new ApiError(body?.error?.message || 'Session expired', {
            status: res.status,
            code: body?.error?.code || 'UNAUTHORIZED',
          });
        }
        const token = body?.data?.token;
        if (token) setStoredAccessToken(token);
        return body.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body,
    auth = true,
    headers: extraHeaders = {},
    skipRefresh = false,
  } = options;

  const headers = { ...extraHeaders };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = getStoredAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && auth && !skipRefresh && !path.startsWith('/auth/')) {
    try {
      await refreshAccessToken();
      return apiRequest(path, { ...options, skipRefresh: true });
    } catch {
      setStoredAccessToken(null);
    }
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(payload?.error?.message || 'Request failed', {
      status: response.status,
      code: payload?.error?.code,
      details: payload?.error?.details,
    });
  }

  return {
    data: payload.data,
    meta: payload.meta,
  };
}

export const api = {
  get: (path, options) => apiRequest(path, { ...options, method: 'GET' }),
  post: (path, body, options) => apiRequest(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => apiRequest(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' }),
};

// Auth
export const login = (email, password) =>
  api.post('/auth/login', { email, password }, { auth: false }).then((r) => r.data);

export const register = (payload) =>
  api.post('/auth/register', payload, { auth: false }).then((r) => r.data);

export const verifyMfa = (pendingToken, code) =>
  api.post('/auth/verify-mfa', { pendingToken, code }, { auth: false }).then((r) => r.data);

export const fetchMe = () => api.get('/auth/me').then((r) => r.data);

export const logoutRequest = () =>
  api.post('/auth/logout', {}, { auth: false }).catch(() => ({ success: true }));

// Domain helpers
export const getPatientDashboard = () => api.get('/dashboard/patient').then((r) => r.data);
export const getAdminDashboard = () => api.get('/dashboard/admin').then((r) => r.data);
export const listPatients = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return api.get(`/patients${qs ? `?${qs}` : ''}`).then((r) => r.data);
};

export const getPatient = (id) => api.get(`/patients/${id}`).then((r) => r.data);

export const listAppointments = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return api.get(`/appointments${qs ? `?${qs}` : ''}`).then((r) => r.data);
};

export const getAppointmentSlots = (providerId, days = 3) =>
  api
    .get(`/appointments/slots?providerId=${encodeURIComponent(providerId)}&days=${days}`)
    .then((r) => r.data);

export const createAppointment = (payload) =>
  api.post('/appointments', payload).then((r) => r.data);

export const updateAppointment = (id, payload) =>
  api.patch(`/appointments/${id}`, payload).then((r) => r.data);

export const cancelAppointment = (id) =>
  api.delete(`/appointments/${id}`).then((r) => r.data);

export const listProviders = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return api.get(`/providers${qs ? `?${qs}` : ''}`, { auth: !!getStoredAccessToken() }).then((r) => r.data);
};

export const getProvider = (id) =>
  api.get(`/providers/${id}`, { auth: !!getStoredAccessToken() }).then((r) => r.data);

export const updateProvider = (id, payload) =>
  api.patch(`/providers/${id}`, payload).then((r) => r.data);

export const listMessageThreads = () => api.get('/messages').then((r) => r.data);
export const getMessageThread = (id) => api.get(`/messages/${id}`).then((r) => r.data);
export const createMessageThread = (providerId) =>
  api.post('/messages', { providerId }).then((r) => r.data);
export const sendMessage = (threadId, payload) =>
  api.post(`/messages/${threadId}/messages`, payload).then((r) => r.data);

export const listLabResults = () => api.get('/records/labs').then((r) => r.data);
export const listVisitSummaries = () => api.get('/records/visits').then((r) => r.data);
export const getVisitSummary = (id) => api.get(`/records/visits/${id}`).then((r) => r.data);
export const listMedications = () => api.get('/records/medications').then((r) => r.data);
export const requestMedicationRefill = (id) =>
  api.post(`/records/medications/${id}/refill`, {}).then((r) => r.data);
export const listImmunizations = () => api.get('/records/immunizations').then((r) => r.data);

export const getBillingOverview = () => api.get('/billing').then((r) => r.data);
export const getBillingStatement = (id) => api.get(`/billing/statements/${id}`).then((r) => r.data);
export const payBill = (payload) => api.post('/billing/pay', payload).then((r) => r.data);

export const getProfile = () => api.get('/profile').then((r) => r.data);
export const updatePersonalProfile = (payload) =>
  api.patch('/profile/personal', payload).then((r) => r.data);
export const updateInsuranceProfile = (payload) =>
  api.patch('/profile/insurance', payload).then((r) => r.data);
export const updateNotificationPrefs = (payload) =>
  api.patch('/profile/notifications', payload).then((r) => r.data);
export const listProxies = () => api.get('/profile/proxies').then((r) => r.data);
export const createProxy = (payload) => api.post('/profile/proxies', payload).then((r) => r.data);
export const revokeProxy = (id) => api.delete(`/profile/proxies/${id}`).then((r) => r.data);

export const DEMO_ACCOUNTS = [
  {
    email: 'patient@meridian.health',
    password: 'password123',
    role: 'patient',
    name: 'Sarah Connor',
  },
  {
    email: 'provider@meridian.health',
    password: 'password123',
    role: 'provider',
    name: 'Dr. Elena Rostova',
  },
  {
    email: 'admin@meridian.health',
    password: 'password123',
    role: 'admin',
    name: 'Marcus Vance',
  },
];
