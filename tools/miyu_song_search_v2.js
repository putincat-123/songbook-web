(() => {
  const qs = new URLSearchParams(location.search);
  const streamer = qs.get('streamer') || 'miyu';
  const $ = id => document.getElementById(id);
  const input = $('songSearchInputV2');
  const styleSelect = $('songSearchStyleV2');
  const list = $('songSearchListV2');
  const meta = $('songSearchMetaV2');
  const clearBtn = $('songSearchClearV2');
  if (!input || !styleSelect || !list || !meta || !clearBtn) return;

  let songs = [];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  function splitStyles(value) {
    return String(value || '')
      .split(/[，,、/|；;]+/)
      .map(x => x.trim())
      .filter(Boolean);
  }

  function normalize(s, i) {
    const name = String(s?.name || s?.songName || s?.title || '').trim();
    if (!name) return null;
    const artist = String(s?.artist || s?.singer || s?.artistName || '').trim();
    const style = String(s?.style || '').trim();
    const styles = splitStyles(style);
    return {
      seq: s?.seq || i + 1,
      name,
      artist,
      style,
      styles,
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

  function buildStyleOptions() {
    const counts = new Map();
    songs.forEach(song => {
      song.styles.forEach(style => counts.set(style, (counts.get(style) || 0) + 1));
    });
    const styles = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hans-CN'));
    styleSelect.innerHTML = '<option value="">全部曲风</option>' + styles
      .map(([style, count]) => `<option value="${esc(style)}">${esc(style)}（${count}）</option>`)
      .join('');
  }

  function render() {
    const keyword = input.value.trim().toLowerCase().normalize('NFKC');
    const selectedStyle = styleSelect.value;
    const matched = songs.filter(song => {
      const keywordOk = !keyword || song.key.includes(keyword);
      const styleOk = !selectedStyle || song.styles.includes(selectedStyle);
      return keywordOk && styleOk;
    });
    const rows = matched.slice(0, keyword || selectedStyle ? 300 : 200);
    const filterText = selectedStyle ? ` · 曲风：${selectedStyle}` : '';
    meta.textContent = `共 ${songs.length} 首 · 符合 ${matched.length} 首 · 当前显示 ${rows.length} 首${filterText}`;
    list.innerHTML = rows.length ? rows.map(song => `
      <article class="search-song-v2">
        <div class="search-seq-v2">${esc(song.seq)}</div>
        <div class="search-main-v2">
          <div class="search-name-v2">${esc(song.name)}</div>
          <div class="search-artist-v2">${esc(song.artist || '未知歌手')}</div>
          ${song.style ? `<div class="search-style-v2">${esc(song.style)}</div>` : ''}
        </div>
        <button class="search-copy-v2" type="button" data-search-copy="${esc(song.name)}">复制</button>
      </article>`).join('') : '<div class="daily-empty">找不到符合的歌曲</div>';

    list.querySelectorAll('[data-search-copy]').forEach(btn => {
      btn.addEventListener('click', () => copyName(btn.dataset.searchCopy || ''));
    });
  }

  input.addEventListener('input', render);
  styleSelect.addEventListener('change', render);
  clearBtn.addEventListener('click', () => {
    input.value = '';
    styleSelect.value = '';
    render();
    input.focus();
  });

  async function init() {
    try {
      const r = await fetch(`../data/${encodeURIComponent(streamer)}/songs.json?t=${Date.now()}`, { cache:'no-store' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const raw = await r.json();
      const arr = Array.isArray(raw) ? raw : (raw?.songs || raw?.data || []);
      songs = arr.map(normalize).filter(Boolean);
      buildStyleOptions();
      input.disabled = false;
      styleSelect.disabled = false;
      clearBtn.disabled = false;
      render();
    } catch (e) {
      console.error('native song search failed', e);
      meta.textContent = '曲库载入失败';
      list.innerHTML = '<div class="daily-empty">歌单载入失败，请重新整理再试。</div>';
    }
  }

  init();
})();
