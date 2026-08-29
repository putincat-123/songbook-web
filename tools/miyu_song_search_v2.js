(() => {
  const qs = new URLSearchParams(location.search);
  const streamer = qs.get('streamer') || 'miyu';
  const $ = id => document.getElementById(id);
  const input = $('songSearchInputV2');
  const list = $('songSearchListV2');
  const meta = $('songSearchMetaV2');
  const clearBtn = $('songSearchClearV2');
  const filters = $('songStyleFiltersV2');
  if (!input || !list || !meta || !clearBtn || !filters) return;

  let songs = [];
  let selectedStyle = '全部';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  const parseStyles = style => String(style || '')
    .split(/[，,、/|]+/)
    .map(x => x.trim())
    .filter(Boolean);

  function normalize(s, i) {
    const name = String(s?.name || s?.songName || s?.title || '').trim();
    if (!name) return null;
    const artist = String(s?.artist || s?.singer || s?.artistName || '').trim();
    const style = String(s?.style || '').trim();
    const styles = parseStyles(style);
    return {
      seq: s?.seq || i + 1,
      name,
      artist,
      style,
      styles,
      key: `${name} ${artist} ${style}`.toLowerCase().normalize('NFKC')
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

  function renderFilters() {
    const counts = new Map();
    songs.forEach(song => song.styles.forEach(style => counts.set(style, (counts.get(style) || 0) + 1)));
    const styles = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hans-CN'))
      .map(([style]) => style);

    filters.innerHTML = ['全部', ...styles].map(style => `
      <button type="button" class="search-filter-btn-v2${style === selectedStyle ? ' active' : ''}" data-style="${esc(style)}">${esc(style)}</button>
    `).join('');

    filters.querySelectorAll('[data-style]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedStyle = btn.dataset.style || '全部';
        renderFilters();
        render();
      });
    });
  }

  function render() {
    const keyword = input.value.trim().toLowerCase().normalize('NFKC');
    const matched = songs.filter(song => {
      const textMatch = !keyword || song.key.includes(keyword);
      const styleMatch = selectedStyle === '全部' || song.styles.includes(selectedStyle);
      return textMatch && styleMatch;
    });
    const rows = matched.slice(0, keyword || selectedStyle !== '全部' ? 300 : 200);
    const filterText = selectedStyle === '全部' ? '' : ` · ${selectedStyle}`;
    meta.textContent = `共 ${songs.length} 首 · 符合 ${matched.length} 首${filterText} · 当前显示 ${rows.length} 首`;
    list.innerHTML = rows.length ? rows.map(song => `
      <article class="search-song-v2">
        <div class="search-seq-v2">${esc(song.seq)}</div>
        <div class="search-main-v2">
          <div class="search-name-v2">${esc(song.name)}</div>
          <div class="search-artist-v2">${esc(song.artist || '未知歌手')}</div>
          ${song.styles.length ? `<div class="search-tags-v2">${song.styles.map(style => `<span class="search-tag-v2">${esc(style)}</span>`).join('')}</div>` : ''}
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
    selectedStyle = '全部';
    renderFilters();
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
      input.disabled = false;
      clearBtn.disabled = false;
      renderFilters();
      render();
    } catch (e) {
      console.error('native song search failed', e);
      meta.textContent = '曲库载入失败';
      filters.innerHTML = '';
      list.innerHTML = '<div class="daily-empty">歌单载入失败，请重新整理再试。</div>';
    }
  }

  init();
})();
