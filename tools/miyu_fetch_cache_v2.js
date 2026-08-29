(() => {
  if (window.__MIYU_FETCH_CACHE_V2__) return;
  window.__MIYU_FETCH_CACHE_V2__ = true;

  const nativeFetch = window.fetch.bind(window);
  const cache = new Map();

  function getKey(input) {
    try {
      const raw = typeof input === 'string' || input instanceof URL ? String(input) : input?.url;
      if (!raw) return '';
      const url = new URL(raw, location.href);
      const match = url.pathname.match(/\/data\/([^/]+)\/songs\.json$/i);
      return match ? `songs:${decodeURIComponent(match[1]).toLowerCase()}` : '';
    } catch {
      return '';
    }
  }

  async function readOnce(input, init, key) {
    const response = await nativeFetch(input, init);
    const body = await response.text();
    if (!response.ok) {
      cache.delete(key);
    }
    return {
      body,
      status: response.status,
      statusText: response.statusText,
      headers: [...response.headers.entries()]
    };
  }

  function cloneResponse(snapshot) {
    return new Response(snapshot.body, {
      status: snapshot.status,
      statusText: snapshot.statusText,
      headers: snapshot.headers
    });
  }

  window.fetch = async function(input, init) {
    const key = getKey(input);
    if (!key) return nativeFetch(input, init);

    if (!cache.has(key)) {
      cache.set(key, readOnce(input, init, key).catch(err => {
        cache.delete(key);
        throw err;
      }));
    }

    const snapshot = await cache.get(key);
    return cloneResponse(snapshot);
  };

  window.MiyuFetchCache = {
    clearSongs(streamer = 'miyu') {
      cache.delete(`songs:${String(streamer).toLowerCase()}`);
    },
    hasSongs(streamer = 'miyu') {
      return cache.has(`songs:${String(streamer).toLowerCase()}`);
    }
  };
})();
