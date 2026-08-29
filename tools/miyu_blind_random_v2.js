(() => {
  const qs = new URLSearchParams(location.search);
  const streamer = qs.get('streamer') || 'miyu';
  const $ = id => document.getElementById(id);
  const drawBtn = $('randomBlindDrawBtn');
  const draw3Btn = $('randomBlindDraw3Btn');
  const resetBtn = $('randomBlindResetBtn');
  const copyBtn = $('randomBlindCopyBtn');
  const result = $('randomBlindResult');
  const songEl = $('randomBlindSong');
  const artistEl = $('randomBlindArtist');
  const statusEl = $('randomBlindStatus');
  const multiEl = $('randomBlindMulti');
  if (!drawBtn || !draw3Btn || !resetBtn || !result) return;

  let songs = [];
  let bag = [];
  let current = null;

  const normalize = (s, i) => {
    const name = String(s?.name || s?.songName || s?.title || '').trim();
    if (!name) return null;
    return {
      id: String(s?.id || i),
      name,
      artist: String(s?.artist || s?.singer || s?.artistName || '').trim()
    };
  };

  function shuffle(arr) {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function refill() {
    bag = shuffle(songs.map((_, i) => i));
    statusEl.textContent = `本轮剩余 ${bag.length} / ${songs.length} 首`;
  }

  function ensureBag() {
    if (!bag.length && songs.length) refill();
  }

  function drawOne(render = true) {
    if (!songs.length) return null;
    ensureBag();
    const index = bag.pop();
    const song = songs[index];
    current = song;
    statusEl.textContent = `本轮剩余 ${bag.length} / ${songs.length} 首`;
    if (render) {
      songEl.textContent = song.name;
      artistEl.textContent = song.artist || '—';
      result.classList.add('show');
      multiEl.innerHTML = '';
    }
    return song;
  }

  async function copy(text) {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  }

  drawBtn.addEventListener('click', () => drawOne(true));
  draw3Btn.addEventListener('click', () => {
    if (!songs.length) return;
    const picks = [];
    for (let i = 0; i < 3; i++) {
      const song = drawOne(false);
      if (song) picks.push(song);
    }
    if (!picks.length) return;
    current = picks[0];
    result.classList.add('show');
    songEl.textContent = picks[0].name;
    artistEl.textContent = picks[0].artist || '—';
    multiEl.innerHTML = picks.map((s, i) => `<div class="random-blind-pick"><b>${i + 1}.</b> ${escapeHtml(s.name)}${s.artist ? ` <span>· ${escapeHtml(s.artist)}</span>` : ''}</div>`).join('');
  });
  resetBtn.addEventListener('click', () => {
    refill();
    current = null;
    result.classList.remove('show');
    multiEl.innerHTML = '';
    songEl.textContent = '尚未抽歌';
    artistEl.textContent = '请点击开盲盒';
  });
  copyBtn.addEventListener('click', () => current && copy(current.name));

  function escapeHtml(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  fetch(`../data/${encodeURIComponent(streamer)}/songs.json?t=${Date.now()}`, { cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(raw => {
      const list = Array.isArray(raw) ? raw : (raw?.songs || raw?.data || []);
      songs = list.map(normalize).filter(Boolean);
      refill();
      artistEl.textContent = `曲库共 ${songs.length} 首`;
    })
    .catch(err => {
      console.error('random blind box failed', err);
      statusEl.textContent = '曲库载入失败，请稍后刷新重试';
    });
})();