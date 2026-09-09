(function () {
  const configuredApi = window.DREAM_API_URL;
  const api = configuredApi || (!window.location.hostname || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : window.location.origin);

  window.DREAM_API = api;

  // Shared session normalization for static HTML pages.
  // This keeps settings and upload-related buttons from throwing when
  // localStorage has no current user object but the server session is valid.
  window.getStoredDreamUser = function () {
    try {
      const raw = localStorage.getItem('dream_user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed.id ? parsed : null;
    } catch (err) {
      return null;
    }
  };

  window.ensureDreamSessionUser = async function () {
    const stored = window.getStoredDreamUser();
    if (stored && stored.id) return stored;

    try {
      const sessionResponse = await fetch(api + '/api/session', {
        method: 'GET',
        credentials: 'include'
      });
      if (!sessionResponse.ok) {
        localStorage.removeItem('dream_user');
        return null;
      }
      const session = await sessionResponse.json();
      if (!session || !session.user || !session.user.id) {
        localStorage.removeItem('dream_user');
        return null;
      }
      localStorage.setItem('dream_user', JSON.stringify(session.user));
      return session.user;
    } catch (err) {
      return null;
    }
  };

  async function performLogout() {
    try {
      await fetch(api + '/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.warn('Logout API warning:', err && err.message ? err.message : err);
    }

    try {
      localStorage.removeItem('dream_user');
      sessionStorage.clear();
    } catch (err) {
      console.warn('Local session cache warning:', err && err.message ? err.message : err);
    }

    // Best effort cookie clearing for the session cookie in the browser.
    try {
      document.cookie = 'connect.sid=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    } catch (err) {
      console.warn('Cookie clearing warning:', err && err.message ? err.message : err);
    }

    window.location.replace('login.html');
  }

  window.logout = performLogout;
  window.dreamLogout = performLogout;

  window.dreamFetch = async function (path, options) {
    const response = await fetch(api + path, {
      credentials: 'include',
      cache: 'no-store',
      ...options,
      headers: {
        'Cache-Control': 'no-store',
        Pragma: 'no-cache',
        ...(options && options.body instanceof FormData
          ? (options.headers || {})
          : { 'Content-Type': 'application/json', ...(options && options.headers) })
      }
    });
    const type = response.headers.get('content-type') || '';
    if (!type.includes('application/json')) {
      throw new Error('API returned ' + response.status + ' ' + response.statusText);
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  };
})();