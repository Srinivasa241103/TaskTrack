const BASE = '/api/v1';

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include', // send httpOnly cookies on every request
    headers: { 'Content-Type': 'application/json' },
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
    list:      ()              => request('GET',  '/projects'),
    get:       (id)            => request('GET',  `/projects/${id}`),
    create:    (data)          => request('POST', '/projects', data),
    addMember: (projectId, userId) => request('POST', `/projects/${projectId}/members`, { userId }),
  },
  tasks: {
    list:   ()         => request('GET',    '/tasks'),
    get:    (id)       => request('GET',    `/tasks/${id}`),
    create: (data)     => request('POST',   '/tasks', data),
    update: (id, data) => request('PUT',    `/tasks/${id}`, data),
    delete: (id)       => request('DELETE', `/tasks/${id}`),
  },
  users: {
    list: ()   => request('GET', '/users'),
    get:  (id) => request('GET', `/users/${id}`),
  },
};
