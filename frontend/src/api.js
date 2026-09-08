(function () {
  const configuredApi = window.DREAM_API_URL;
  const api = configuredApi || (!window.location.hostname || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : window.location.origin);

  window.DREAM_API = api;
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