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
    return {
      id: String(s?.id || i),
      songName,
      artist: String(s?.artist || s?.singer || s?.artistName || '').trim()
    };
  };

  const nowMonthKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };
  const weekdayNumber = () => {
    const n = new Date().getDay();
    return n === 0 ? 7 : n;
  };
  const weekdayLabel = n => ['', '週一', '週二', '週三', '週四', '週五', '週六', '週日'][n] || '';

  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function seededRandom(seed) {
    let t = seed >>> 0;
    return function () {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffleBySeed(list, seedText) {
    const arr = [...list];
    const random = seededRandom(hashString(seedText));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function getNumberMappedSong(n) {
    if (!songs.length) return null;
    const num = Number(n);
    if (!Number.isInteger(num) || num < 1 || num > songs.length) return null;
    const seed = `${nowMonthKey()}|${weekdayNumber()}|${songs.length}`;
    const shuffledPool = shuffleBySeed(songs, seed);
    return shuffledPool[num - 1] || null;
  }

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
    if (value > songs.length) {
      if (numberHint) numberHint.textContent = `数字不能超过曲库数量（目前 ${songs.length} 首）`;
      numberResult?.classList.remove('show');
      currentNumberSong = null;
      return;
    }
    const found = getNumberMappedSong(value);
    if (!found) return;
    currentNumberSong = found;
    if (numberSong) numberSong.textContent = found.songName;
    if (numberArtist) numberArtist.textContent = found.artist || '未知歌手';
    if (numberSeq) numberSeq.textContent = `${weekdayLabel(weekdayNumber())} · ${nowMonthKey()} · 数字 ${value}`;
    numberResult?.classList.add('show');
    if (numberHint) numberHint.textContent = `小耳朵扣 1–${songs.length}；同月同星期的数字对应固定`;
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
      if (numberInput) {
        numberInput.max = String(songs.length);
        numberInput.disabled = false;
      }
      if (numberBtn) numberBtn.disabled = false;
      if (numberHint) numberHint.textContent = `小耳朵扣 1–${songs.length}；${nowMonthKey()} · ${weekdayLabel(weekdayNumber())}`;
    })
    .catch(err => {
      console.error('random blind box failed', err);
      statusEl.textContent = '曲庫載入失敗，請稍後刷新重試';
      if (numberHint) numberHint.textContent = '数字盲盒曲库载入失败';
    });
})();