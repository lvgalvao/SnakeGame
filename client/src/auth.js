const TOKEN_KEY = 'snake_token';
const USER_KEY = 'snake_user';

export function setSession(token, username) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, username);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUsername() {
  return localStorage.getItem(USER_KEY);
}

function decodePayload(token) {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export function isAdmin() {
  const token = getToken();
  if (!token) return false;
  const payload = decodePayload(token);
  if (!payload || payload.role !== 'admin') return false;
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    clearSession();
    return false;
  }
  return true;
}
