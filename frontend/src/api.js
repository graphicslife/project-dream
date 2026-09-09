(function () {
  const configuredApi = window.DREAM_API_URL;
  const api = configuredApi || (!window.location.hostname || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : window.location.origin);

  window.DREAM_API = api;

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