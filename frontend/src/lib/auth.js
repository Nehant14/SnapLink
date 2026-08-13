// Thin wrapper around the auth endpoints. All requests use
// credentials: 'include' so the httpOnly session cookie (set by the
// backend) is sent/received even though frontend and backend can be on
// different origins in dev.

import { ApiError } from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, { method = 'GET', body } = {}) {
  const endpoint = `${API_BASE_URL}/api/v1/auth${path}`;

  const options = { method, credentials: 'include' };
  if (body) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(endpoint, options);
  } catch {
    throw new ApiError("Can't reach the SnapLink server. Is the backend running?");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body — fine for e.g. a 204
  }

  if (!res.ok) {
    const message = data?.message || 'Something went wrong.';
    throw new ApiError(message, { status: res.status, detail: data?.detail });
  }

  return data;
}

export function signup({ email, password, name }) {
  return request('/signup', { method: 'POST', body: { email, password, name } });
}

export function login({ email, password }) {
  return request('/login', { method: 'POST', body: { email, password } });
}

export function logout() {
  return request('/logout', { method: 'POST' });
}

export function fetchCurrentUser() {
  return request('/me', { method: 'GET' });
}
