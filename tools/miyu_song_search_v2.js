(() => {
  const qs = new URLSearchParams(location.search);
  const streamer = qs.get('streamer') || 'miyu';
  const $ = id => document.getElementById(id);
  const input = $('songSearchInputV2');
  const list = $('songSearchListV2');
  const meta = $('songSearchMetaV2');
  const clearBtn = $('songSearchClearV2');
  const randomBtn = $('songSearchRandomV2');
  if (!input || !list || !meta || !clearBtn || !randomBtn) return;

  let songs = [];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  function normalize(s, i) {
    const name = String(s?.name || s?.songName || s?.title || '').trim();
    if (!name) return null;
    const artist = String(s?.artist || s?.singer || s?.artistName || '').trim();
    return {
      seq: s?.seq || i + 1,
      name,
      artist,
      key: `${name} ${artist}`.toLowerCase().normalize('NFKC')
    };
  }

  async function copyName(name) {
    try { await navigator.clipboard.writeText(name); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = name;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const toast = $('toast');
    if (toast) {
      toast.textContent = '✅ 已复制：' + name;
      toast.classList.add('show');
      clearTimeout(window._miyuSearchToast);
      window._miyuSearchToast = setTimeout(() => toast.classList.remove('show'), 1300);
    }
  }

  function render() {
    const keyword = input.value.trim().toLowerCase().normalize('NFKC');
    const matched = keyword ? songs.filter(song => song.key.includes(keyword)) : songs;
    const rows = matched.slice(0, keyword ? 300 : 200);
    meta.textContent = `共 ${songs.length} 首 · 符合 ${matched.length} 首 · 当前显示 ${rows.length} 首`;
    list.innerHTML = rows.length ? rows.map(song => `
      <article class="search-song-v2">
        <div class="search-seq-v2">${esc(song.seq)}</div>
        <div class="search-main-v2">
          <div class="search-name-v2">${esc(song.name)}</div>
          <div class="search-artist-v2">${esc(song.artist || '未知歌手')}</div>
        </div>
        <button class="search-copy-v2" type="button" data-search-copy="${esc(song.name)}">复制</button>
      </article>`).join('') : '<div class="daily-empty">找不到符合的歌曲</div>';

    list.querySelectorAll('[data-search-copy]').forEach(btn => {
      btn.addEventListener('click', () => copyName(btn.dataset.searchCopy || ''));
    });
  }

  input.addEventListener('input', render);
  clearBtn.addEventListener('click', () => {
    input.value = '';
    render();
    input.focus();
  });
  randomBtn.addEventListener('click', () => {
    if (!songs.length) return;
    const song = songs[Math.floor(Math.random() * songs.length)];
    input.value = song.name;
    render();
  });

  async function init() {
    try {
      const r = await fetch(`../data/${encodeURIComponent(streamer)}/songs.json?t=${Date.now()}`, { cache:'no-store' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const raw = await r.json();
      const arr = Array.isArray(raw) ? raw : (raw?.songs || raw?.data || []);
      songs = arr.map(normalize).filter(Boolean);
      input.disabled = false;
      clearBtn.disabled = false;
      randomBtn.disabled = false;
      render();
    } catch (e) {
      console.error('native song search failed', e);
      meta.textContent = '曲库载入失败';
      list.innerHTML = '<div class="daily-empty">歌单载入失败，请重新整理再试。</div>';
    }
  }

  init();
})();
