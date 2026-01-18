import { useState } from 'react';

const TOKEN_KEY = 'token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function useAuth() {
  const [token, setTokenState] = useState(getToken());

  const login = (token: string, sessionId?: string) => {
    setToken(token);
    setTokenState(token);
    if (sessionId) {
      localStorage.setItem("sessionId", sessionId);
    }
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem("sessionId");
    setTokenState(null);
  };

  return {
    token,
    isAuthenticated: !!token,
    login,
    logout,
  };
}
