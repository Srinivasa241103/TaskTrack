const BASE = import.meta.env.VITE_SERVER_URL || '/api/v1';

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const user = JSON.parse(localStorage.getItem('plot_user'));
    if (user && user.accessToken) {
      headers['Authorization'] = `Bearer ${user.accessToken}`;
    }
  } catch (e) {
    // Ignore parse errors
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include', // send httpOnly cookies on every request (fallback)
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Throw with the server's human-readable message when available
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  return data;
}

export const api = {
  health: () => request('GET', '/health'),
  auth: {
    login:    (email, password)       => request('POST', '/auth/login',    { email, password }),
    register: (name, email, password) => request('POST', '/auth/register', { name, email, password }),
  },
  projects: {
    list:         ()               => request('GET', '/projects'),
    create:       (data)           => request('POST', '/projects', data),
    addMember:    (projectId, userId) => request('POST', `/projects/${projectId}/members`, { userId }),
    removeMember: (projectId, userId) => request('DELETE', `/projects/${projectId}/member`, { userId }),
  },
  tasks: {
    list:   ()         => request('GET', '/tasks'),
    create: (data)     => request('POST', '/tasks', data),
    update: (id, data) => request('PUT', `/tasks/${id}`, data),
    delete: (id)       => request('DELETE', `/tasks/${id}`),
  },
  users: {
    list: () => request('GET', '/users'),
  },
  dashboard: {
    get: () => request('GET', '/dashboard'),
  },
};
