(() => {
  const qs = new URLSearchParams(location.search);
  const streamer = qs.get('streamer') || 'miyu';
  const $ = id => document.getElementById(id);
  const drawBtn = $('randomBlindDrawBtn');
  const draw3Btn = $('randomBlindDraw3Btn');
  const resetBtn = $('randomBlindResetBtn');
  const songEl = $('randomBlindSong');
  const artistEl = $('randomBlindArtist');
  const statusEl = $('randomBlindStatus');
  const multiEl = $('randomBlindMulti');
  if (!drawBtn || !draw3Btn || !resetBtn || !songEl || !artistEl || !statusEl || !multiEl) return;

  const numberInput = $('numberBlindInput');
  const numberBtn = $('numberBlindOpenBtn');
  const numberHint = $('numberBlindHint');
  const numberResult = $('numberBlindResult');
  const numberSong = $('numberBlindSong');
  const numberArtist = $('numberBlindArtist');
  const numberSeq = $('numberBlindSeq');
  const numberCopy = $('numberBlindCopyBtn');

  let songs = [];
  let bag = [];
  let currentNumberSong = null;

  const normalize = (s, i) => {
    const songName = String(s?.name || s?.songName || s?.title || '').trim();
    if (!songName) return null;
    const seqValue = Number(s?.seq);
    return {
      id: String(s?.id || i),
      seq: Number.isFinite(seqValue) && seqValue > 0 ? seqValue : i + 1,
      songName,
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
    updateStatus();
  }

  function updateStatus() {
    statusEl.textContent = songs.length ? `本輪剩餘 ${bag.length} / ${songs.length} 首` : '曲庫載入中…';
  }

  function drawRandomOne() {
    if (!songs.length) return null;
    if (!bag.length) refill();
    const index = bag.pop();
    updateStatus();
    return songs[index];
  }

  async function copySong(text, btn) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    if (btn) {
      const old = btn.textContent;
      btn.textContent = '已複製';
      setTimeout(() => btn.textContent = old, 900);
    }
  }

  function renderOne(r) {
    songEl.textContent = r.songName;
    artistEl.textContent = r.artist || '未知歌手';
    multiEl.innerHTML = `<div class="blind-actions"><button class="tool-btn" data-action="copy-song" data-song="${escapeAttr(r.songName)}">複製</button></div>`;
  }

  function openNumberBlind() {
    if (!numberInput || !songs.length) return;
    const value = Number(numberInput.value);
    if (!Number.isInteger(value) || value < 1) {
      if (numberHint) numberHint.textContent = '请输入有效数字';
      numberResult?.classList.remove('show');
      return;
    }
    const found = songs.find(song => song.seq === value);
    if (!found) {
      if (numberHint) numberHint.textContent = `找不到编号 ${value}，请确认数字范围`;
      numberResult?.classList.remove('show');
      currentNumberSong = null;
      return;
    }
    currentNumberSong = found;
    if (numberSong) numberSong.textContent = found.songName;
    if (numberArtist) numberArtist.textContent = found.artist || '未知歌手';
    if (numberSeq) numberSeq.textContent = `数字 ${found.seq}`;
    numberResult?.classList.add('show');
    const maxSeq = songs.reduce((max, song) => Math.max(max, song.seq), 0);
    if (numberHint) numberHint.textContent = `小耳朵扣 1–${maxSeq}，输入数字即可开盒`;
  }

  drawBtn.addEventListener('click', () => {
    const r = drawRandomOne();
    if (r) renderOne(r);
  });

  draw3Btn.addEventListener('click', () => {
    const results = [];
    const seen = new Set();
    const target = Math.min(3, songs.length);
    let attempts = 0;
    while (results.length < target && attempts < Math.max(12, songs.length * 2)) {
      attempts++;
      const r = drawRandomOne();
      if (!r || seen.has(r.id)) continue;
      seen.add(r.id);
      results.push(r);
    }
    if (!results.length) return;
    songEl.textContent = results[0].songName;
    artistEl.textContent = results[0].artist || '未知歌手';
    multiEl.innerHTML = results.map((r, i) => `<div class="random-blind-pick"><div><b>${i + 1}. ${escapeHtml(r.songName)}</b>${r.artist ? `<span> · ${escapeHtml(r.artist)}</span>` : ''}</div><button class="tool-btn" data-action="copy-song" data-song="${escapeAttr(r.songName)}">複製</button></div>`).join('');
  });

  resetBtn.addEventListener('click', () => {
    refill();
    songEl.textContent = '尚未抽歌';
    artistEl.textContent = songs.length ? `曲庫共 ${songs.length} 首` : '請先確認已載入曲庫';
    multiEl.innerHTML = '';
  });

  multiEl.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="copy-song"]');
    if (!btn) return;
    copySong(btn.dataset.song || '', btn);
  });

  numberBtn?.addEventListener('click', openNumberBlind);
  numberInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      openNumberBlind();
    }
  });
  numberCopy?.addEventListener('click', () => {
    if (currentNumberSong) copySong(currentNumberSong.songName, numberCopy);
  });

  function escapeHtml(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function escapeAttr(v) {
    return escapeHtml(v);
  }

  fetch(`../data/${encodeURIComponent(streamer)}/songs.json?t=${Date.now()}`, { cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(raw => {
      const list = Array.isArray(raw) ? raw : (raw?.songs || raw?.data || []);
      songs = list.map(normalize).filter(Boolean);
      refill();
      artistEl.textContent = `曲庫共 ${songs.length} 首`;
      const maxSeq = songs.reduce((max, song) => Math.max(max, song.seq), 0);
      if (numberInput) {
        numberInput.max = String(maxSeq);
        numberInput.disabled = false;
      }
      if (numberBtn) numberBtn.disabled = false;
      if (numberHint) numberHint.textContent = `小耳朵扣 1–${maxSeq}，输入数字即可开盒`;
    })
    .catch(err => {
      console.error('random blind box failed', err);
      statusEl.textContent = '曲庫載入失敗，請稍後刷新重試';
      if (numberHint) numberHint.textContent = '数字盲盒曲库载入失败';
    });
})();