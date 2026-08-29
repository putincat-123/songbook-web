(() => {
  const qs = new URLSearchParams(location.search);
  const streamer = qs.get('streamer') || 'miyu';
  const $ = id => document.getElementById(id);

  let songs = [];
  let artistMap = new Map();
  let bag = [];
  let activeArtist = '';
  let current = null;

  const DAILY_PHASES = [
    {
      key: 'open',
      title: '① 暖场进场',
      desc: '先让小耳朵容易听进去，旋律与节奏偏轻松。',
      target: 3,
      words: ['轻快','欢快','清新','甜','流行','律动','节奏','活泼','轻松','元气','city pop','funk','dance','快乐']
    },
    {
      key: 'mid',
      title: '② 情绪铺陈',
      desc: '把谜屿擅长的故事感拉出来，适合抒情、民谣与慢歌。',
      target: 4,
      words: ['抒情','民谣','情歌','治愈','温柔','慢','故事','深情','伤感','emo','叙事','r&b','古风','安静']
    },
    {
      key: 'end',
      title: '③ 收尾拉升',
      desc: '最后把存在感往上带，选情绪更强或更有能量的歌。',
      target: 3,
      words: ['摇滚','燃','热血','爆发','高音','乐队','强烈','激情','说唱','rap','力量','情绪','炸','高能','激昂']
    }
  ];

  const toast = msg => {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(window._miyuV2Toast);
    window._miyuV2Toast = setTimeout(() => el.classList.remove('show'), 1300);
  };

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  async function copy(text) {
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
    toast('✅ 已复制：' + text);
  }

  function loadFrameForTab(tabId) {
    const frame = $(tabId + 'Frame');
    if (frame && !frame.getAttribute('src')) frame.src = frame.dataset.src;
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(x => x.classList.toggle('active', x === btn));
      document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === btn.dataset.tab));
      loadFrameForTab(btn.dataset.tab);
      const u = new URL(location.href);
      u.searchParams.set('streamer', streamer);
      u.searchParams.set('tool', btn.dataset.tab);
      history.replaceState({}, '', u);
    });
  });

  function norm(s, i) {
    const name = String(s.name || s.songName || s.title || '').trim();
    if (!name) return null;
    return {
      id: String(s.id || i),
      name,
      artist: String(s.artist || s.singer || s.artistName || '').trim(),
      style: String(s.style || '').trim(),
      moods: [s.ai_mood_tags, s.ai_scene_tags, s.crowd_playlist_tags].flat().filter(Boolean).join(' '),
      energy: String(s.ai_energy || '').trim()
    };
  }

  function seed(text) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function seededShuffle(arr, seedValue) {
    const out = [...arr];
    let x = seedValue >>> 0;
    const rnd = () => {
      x += 0x6D2B79F5;
      let t = x;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function localDateKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function songText(song) {
    return `${song.style} ${song.moods} ${song.energy}`.toLowerCase();
  }

  function phaseScore(song, phase) {
    const text = songText(song);
    let score = 0;
    phase.words.forEach(word => {
      if (text.includes(word.toLowerCase())) score += 2;
    });
    if (phase.key === 'open' && /高|high|4|5/.test(song.energy)) score -= 1;
    if (phase.key === 'end' && /高|high|4|5/.test(song.energy)) score += 2;
    if (phase.key === 'mid' && /低|中|low|mid|2|3/.test(song.energy)) score += 1;
    return score;
  }

  function displayStyle(song) {
    const parts = String(song.style || '').split(/[，,、/|]+/).map(x => x.trim()).filter(Boolean);
    return parts[0] || '其他';
  }

  function pickPhaseSongs(phase, used, dateKey) {
    const ranked = seededShuffle(songs, seed(`${streamer}|${dateKey}|${phase.key}`))
      .filter(song => !used.has(song.id))
      .map(song => ({ song, score: phaseScore(song, phase) }))
      .sort((a, b) => b.score - a.score);

    const positive = ranked.filter(x => x.score > 0);
    const source = positive.length >= phase.target ? positive : ranked;
    const picks = [];
    for (const item of source) {
      if (used.has(item.song.id)) continue;
      picks.push(item.song);
      used.add(item.song.id);
      if (picks.length >= phase.target) break;
    }
    return picks;
  }

  function buildDaily() {
    const dateKey = localDateKey();
    $('dailyDate').textContent = dateKey.replaceAll('-', ' / ');

    if (songs.length < 10) {
      $('dailySummary').textContent = '曲库歌曲不足';
      $('dailyGroups').innerHTML = '<div class="daily-empty">目前曲库歌曲不足 10 首，暂时无法生成完整直播歌单。</div>';
      return;
    }

    const used = new Set();
    const groups = DAILY_PHASES.map(phase => ({
      phase,
      picks: pickPhaseSongs(phase, used, dateKey)
    }));

    let total = groups.reduce((sum, group) => sum + group.picks.length, 0);
    if (total < 10) {
      const fallback = seededShuffle(songs, seed(`${streamer}|fallback|${dateKey}`));
      for (const song of fallback) {
        if (total >= 10) break;
        if (used.has(song.id)) continue;
        const targetGroup = groups.slice().sort(
          (a, b) => (a.picks.length - a.phase.target) - (b.picks.length - b.phase.target)
        )[0];
        targetGroup.picks.push(song);
        used.add(song.id);
        total++;
      }
    }

    $('dailySummary').textContent = `暖场 ${groups[0].picks.length} · 铺陈 ${groups[1].picks.length} · 拉升 ${groups[2].picks.length} · 共 ${total} 首`;

    let no = 0;
    $('dailyGroups').innerHTML = groups.map(group => {
      const styles = [...new Set(group.picks.map(displayStyle))].slice(0, 3).join(' / ');
      return `<section class="daily-stage">
        <div class="daily-stage-head">
          <div class="daily-stage-title">${group.phase.title}</div>
          <div class="daily-stage-desc">${group.phase.desc}</div>
          <div class="daily-stage-styles">${esc(styles || '混合曲风')}</div>
        </div>
        ${group.picks.map(song => {
          no++;
          return `<div class="daily-song">
            <span class="daily-num">${String(no).padStart(2, '0')}</span>
            <div>
              <div class="daily-name">${esc(song.name)}</div>
              <span class="daily-artist">${esc(song.artist || '—')}</span>
              <span class="daily-style">${esc(displayStyle(song))}</span>
            </div>
            <button class="daily-copy" type="button" data-copy="${esc(song.name)}">复制</button>
          </div>`;
        }).join('')}
      </section>`;
    }).join('');

    $('dailyGroups').querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => copy(btn.dataset.copy));
    });
  }

  function buildArtists() {
    artistMap.clear();
    songs.forEach(song => {
      if (!song.artist) return;
      const names = song.artist.split(/[、,&，/]+/).map(x => x.trim()).filter(Boolean);
      names.forEach(name => {
        if (!artistMap.has(name)) artistMap.set(name, []);
        artistMap.get(name).push(song);
      });
    });

    const sorted = [...artistMap].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'zh-Hans-CN'));
    $('artistOptions').innerHTML = sorted.map(([name]) => `<option value="${esc(name)}">`).join('');
    $('artistChips').innerHTML = sorted.filter(([, list]) => list.length >= 3).slice(0, 10)
      .map(([name, list]) => `<button class="artist-chip" type="button" data-artist="${esc(name)}">${esc(name)} · ${list.length}</button>`)
      .join('') || '<span class="hint">暂无可快捷选择的歌手</span>';

    $('artistChips').querySelectorAll('[data-artist]').forEach(btn => {
      btn.addEventListener('click', () => {
        $('artistBoxInput').value = btn.dataset.artist;
        draw();
      });
    });
    $('artistBoxStatus').textContent = `已载入 ${songs.length} 首歌 · ${artistMap.size} 位歌手`;
  }

  function resolveArtist(term) {
    if (artistMap.has(term)) return term;
    const low = term.toLowerCase();
    return [...artistMap.keys()].find(name => name.toLowerCase().includes(low)) || '';
  }

  function draw() {
    const input = $('artistBoxInput').value.trim();
    const artist = resolveArtist(input);
    const pool = artistMap.get(artist);
    if (!pool?.length) {
      $('artistBoxStatus').textContent = '找不到这个歌手，可以换个关键词试试';
      return;
    }
    if (activeArtist !== artist || !bag.length) {
      activeArtist = artist;
      bag = seededShuffle(pool, Date.now());
    }
    current = bag.pop();
    $('artistBoxInput').value = artist;
    $('artistBoxSong').textContent = current.name;
    $('artistBoxSinger').textContent = current.artist;
    $('artistBoxRound').textContent = `本轮剩余 ${bag.length} / ${pool.length} 首`;
    $('artistBoxResult').classList.add('show');
    $('artistBoxStatus').textContent = `${artist} · 曲库 ${pool.length} 首 · 本轮剩 ${bag.length} 首`;
  }

  $('artistOpenBtn').addEventListener('click', draw);
  $('artistAgainBtn').addEventListener('click', draw);
  $('artistCopyBtn').addEventListener('click', () => current && copy(current.name));
  $('artistBoxInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      draw();
    }
  });
  $('randomArtistBtn').addEventListener('click', () => {
    const candidates = [...artistMap.entries()].filter(([, list]) => list.length >= 3).map(([name]) => name);
    if (!candidates.length) return;
    $('artistBoxInput').value = candidates[Math.floor(Math.random() * candidates.length)];
    draw();
  });
  $('artistChangeBtn').addEventListener('click', () => {
    $('artistBoxInput').value = '';
    $('artistBoxInput').focus();
    $('artistBoxResult').classList.remove('show');
    activeArtist = '';
    bag = [];
    current = null;
    $('artistBoxStatus').textContent = '请选择或输入一个歌手';
  });

  async function loadTopics() {
    try {
      const r = await fetch(`../data/${encodeURIComponent(streamer)}/daily_topics.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      const topics = Array.isArray(data.topics) ? data.topics : [];
      $('dailyTopics').innerHTML = topics.map(topic => `<article class="topic-card">
        <h3>${esc(topic.title || '今日话题')}</h3>
        <div class="topic-background">${esc(topic.background || '')}</div>
        <div class="topic-block topic-open">${esc(topic.opening || '')}</div>
        <div class="topic-block topic-question">${esc(topic.question || '')}</div>
      </article>`).join('') || '<div class="daily-empty">今天的话题卡还没有更新。</div>';
    } catch (e) {
      console.error('daily topics failed', e);
      $('dailyTopics').innerHTML = '<div class="daily-empty">今日话题载入失败。</div>';
    }
  }

  async function init() {
    try {
      const r = await fetch(`../data/${encodeURIComponent(streamer)}/songs.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const raw = await r.json();
      const list = Array.isArray(raw) ? raw : (raw.songs || raw.data || []);
      songs = list.map(norm).filter(Boolean);
      buildDaily();
      buildArtists();
    } catch (e) {
      console.error('song pool failed', e);
      $('dailySummary').textContent = '曲库载入失败';
      $('dailyGroups').innerHTML = '<div class="daily-empty">曲库载入失败，请稍后刷新重试。</div>';
      $('artistBoxStatus').textContent = '曲库载入失败，请稍后刷新重试';
    }
    loadTopics();
  }

  const initial = qs.get('tool');
  if (initial && $(initial)) {
    const btn = document.querySelector(`.tab-btn[data-tab="${initial}"]`);
    if (btn) btn.click();
  }

  init();
})();