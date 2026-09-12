(() => {
  const params = new URLSearchParams(location.search);
  const streamer = (params.get('streamer') || 'miyu').toLowerCase();
  if (streamer !== 'miyu') return;

  const isToolbox = !!document.getElementById('songSearch');
  const host = isToolbox ? document.getElementById('songSearch') : document.querySelector('.toolbar');
  if (!host || document.getElementById('miyuAiPicker')) return;

  const DATA_PATH = isToolbox ? '../data/miyu/songs.json' : './data/miyu/songs.json';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = v => String(v ?? '').toLowerCase().normalize('NFKC').replace(/\s+/g, ' ').trim();
  const asText = v => Array.isArray(v) ? v.join(' ') : String(v ?? '');

  const DIMENSIONS = {
    scene: [
      {words:['下班','回家','通勤','路上','开车','骑车'], tags:['通勤','下班','回家','路上','轻松','流行','r&b','民谣'], label:'通勤／回家路上'},
      {words:['夜晚','晚上','深夜','夜里'], tags:['夜晚','深夜','安静','温柔','抒情','民谣','r&b'], label:'夜晚氛围'},
      {words:['睡前','睡觉','晚安'], tags:['睡前','安静','温柔','治愈','慢'], label:'睡前放松'},
      {words:['工作','加班','读书','学习'], tags:['工作','学习','陪伴','轻松','安静'], label:'工作陪伴'},
      {words:['开场','暖场','刚进来'], tags:['轻快','轻松','流行','欢快','清新'], label:'直播暖场'},
      {words:['收尾','结束','最后'], tags:['力量','情绪','高能','抒情','深情'], label:'收尾氛围'}
    ],
    mood: [
      {words:['开心','快乐','轻快','元气','活泼','阳光','愉快','甜','甜甜'], tags:['轻快','欢快','快乐','甜','清新','元气','活泼','轻松'], label:'轻松开心'},
      {words:['难过','伤心','失恋','emo','想哭','悲伤','遗憾','心碎','虐'], tags:['伤感','emo','深情','抒情','情歌','悲伤','遗憾'], label:'伤感情绪'},
      {words:['治愈','舒服','温柔','安静','放松','累','疲惫','陪伴'], tags:['治愈','温柔','安静','慢','抒情','民谣','轻松'], label:'温柔治愈'},
      {words:['燃','热血','炸','高能','爆发','激情','提神'], tags:['摇滚','燃','热血','爆发','高音','乐队','力量','高能'], label:'高能热血'},
      {words:['孤独','一个人','空虚','想念','想他','想她'], tags:['孤独','思念','抒情','深情','安静','民谣'], label:'孤独思念'}
    ],
    style: [
      {words:['民谣'], tags:['民谣'], label:'民谣'},
      {words:['古风','国风','中国风'], tags:['古风','国风','中国风'], label:'古风／国风'},
      {words:['rap','说唱','rapper','hiphop','hip-hop'], tags:['rap','说唱','hiphop','hip-hop'], label:'说唱'},
      {words:['r&b','rnb','律动','groove'], tags:['r&b','rnb','律动','groove'], label:'R&B'},
      {words:['摇滚','乐队'], tags:['摇滚','乐队'], label:'摇滚'},
      {words:['流行','华语流行'], tags:['流行'], label:'流行'},
      {words:['情歌','抒情'], tags:['情歌','抒情'], label:'抒情情歌'}
    ],
    energy: [
      {words:['安静一点','轻一点','低能量','不要太吵'], tags:['低','low','1','2','安静','慢'], label:'低能量'},
      {words:['有点节奏','中等','不要太慢'], tags:['中','mid','2','3','律动'], label:'中等能量'},
      {words:['高能','燃一点','提神','炸一点'], tags:['高','high','4','5','高能','燃','爆发'], label:'高能量'}
    ]
  };

  const NEGATIONS = [
    {patterns:['不要太悲','不要太伤','别太悲','不要虐','不想太难过','别太虐'], bad:['伤感','悲伤','emo','遗憾','心碎'], label:'避免太悲'},
    {patterns:['不要太吵','不要太炸','别太燃','不要太燃'], bad:['摇滚','燃','热血','爆发','高能'], label:'避免太炸'},
    {patterns:['不要太慢','别太慢','不想太慢'], bad:['慢','安静','低'], label:'避免太慢'},
    {patterns:['不要太甜','别太甜'], bad:['甜','甜歌'], label:'避免太甜'}
  ];

  const WEIGHTS = {scene:8, mood:6, style:5, energy:4};

  function songData(s, i) {
    const name = String(s?.name || s?.songName || s?.title || '').trim();
    if (!name) return null;
    const artist = String(s?.artist || s?.singer || s?.artistName || '').trim();
    const style = asText(s?.style);
    const mood = asText(s?.ai_mood_tags);
    const scene = asText(s?.ai_scene_tags);
    const crowd = asText(s?.crowd_playlist_tags);
    const energy = asText(s?.ai_energy);
    const text = norm([name,artist,style,mood,scene,crowd,energy].join(' '));
    return {id:String(s?.id || i), name, artist, style, mood, scene, crowd, energy, text};
  }

  function parseQuery(query) {
    const q = norm(query);
    const intent = {q, matches:{scene:[],mood:[],style:[],energy:[]}, negatives:[], artist:''};
    Object.entries(DIMENSIONS).forEach(([dim, groups]) => {
      groups.forEach(group => {
        if (group.words.some(w => q.includes(norm(w)))) intent.matches[dim].push(group);
      });
    });
    NEGATIONS.forEach(rule => { if (rule.patterns.some(p => q.includes(norm(p)))) intent.negatives.push(rule); });

    const knownFillers = /^(想听|听|来点|来首|想来点|想来首|推荐|给我|帮我|帮我选)/;
    let artistCandidate = q.match(/(?:想听|听|来点|来首)([^，,。！？!？]{2,14})(?:的歌|的|类型|风格)?/);
    if (artistCandidate) {
      let term = artistCandidate[1].replace(knownFillers,'').replace(/一点|一些|几首|一首|点|歌/g,'').trim();
      const intentWords = Object.values(DIMENSIONS).flat().flatMap(g => g.words.map(norm));
      if (term && !intentWords.some(w => term.includes(w))) intent.artist = term;
    }
    return intent;
  }

  function countTagHits(text, tags) {
    let hits = 0;
    tags.forEach(tag => { if (text.includes(norm(tag))) hits++; });
    return hits;
  }

  function scoreSong(song, intent) {
    let score = 0;
    const reasonParts = [];

    Object.entries(intent.matches).forEach(([dim, groups]) => {
      groups.forEach(group => {
        const hits = countTagHits(song.text, group.tags);
        if (!hits) return;
        score += WEIGHTS[dim] + Math.min(4, hits - 1);
        reasonParts.push(group.label);
      });
    });

    intent.negatives.forEach(rule => {
      const hits = countTagHits(song.text, rule.bad);
      if (hits) score -= 12 + (hits - 1) * 3;
    });

    if (intent.artist && norm(song.artist).includes(norm(intent.artist))) {
      score += 18;
      reasonParts.unshift(`你提到的歌手 ${song.artist}`);
    }

    const tokens = intent.q.split(/[\s，,。！？!？、/]+/).map(x=>x.trim()).filter(x => x.length > 1);
    tokens.forEach(t => {
      if (norm(song.name).includes(t)) score += 7;
      else if (norm(song.artist).includes(t)) score += 6;
      else if (song.text.includes(t)) score += 1;
    });

    const dimensionCount = Object.values(intent.matches).filter(v => v.length).length;
    if (dimensionCount >= 2) {
      const matchedDims = Object.entries(intent.matches).filter(([dim,groups]) => groups.some(g => countTagHits(song.text,g.tags)>0)).length;
      score += matchedDims * 2;
    }

    const uniqueReasons = [...new Set(reasonParts)].slice(0,2);
    const reason = uniqueReasons.length
      ? `符合${uniqueReasons.join('＋')}`
      : (score > 0 ? '和你描述的感觉比较接近' : '从谜屿完整曲库换个方向给你试试');
    return {score, reason};
  }

  function similarityKey(song) {
    const styles = norm(song.style).split(/[，,、/|\s]+/).filter(Boolean).slice(0,2).join('|');
    const moods = norm(song.mood).split(/[，,、/|\s]+/).filter(Boolean).slice(0,2).join('|');
    return `${styles}::${moods}`;
  }

  function pick(songs, query, count=3) {
    const intent = parseQuery(query);
    const ranked = songs.map(song => ({song, ...scoreSong(song, intent)}))
      .sort((a,b) => b.score - a.score || a.song.name.localeCompare(b.song.name,'zh-Hans-CN'));

    const positive = ranked.filter(x => x.score > 0);
    const source = positive.length >= count ? positive : ranked;
    const shortlist = source.slice(0, Math.max(30, count * 10));
    const chosen = [];
    const usedArtists = new Set();
    const usedKeys = new Set();

    for (const item of shortlist) {
      if (chosen.length >= count) break;
      const key = similarityKey(item.song);
      if (usedArtists.has(item.song.artist) && shortlist.length > count * 2) continue;
      if (usedKeys.has(key) && shortlist.length > count * 2) continue;
      chosen.push(item);
      if (item.song.artist) usedArtists.add(item.song.artist);
      if (key !== '::') usedKeys.add(key);
    }

    if (chosen.length < count) {
      for (const item of shortlist) {
        if (chosen.length >= count) break;
        if (!chosen.some(x => x.song.id === item.song.id)) chosen.push(item);
      }
    }
    return chosen;
  }

  async function copySong(name) {
    const text = isToolbox ? name : `点歌 ${name}`;
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    const toast=document.getElementById('toast');
    if (toast) {
      toast.textContent=`✅ 已复制：${text}`; toast.classList.add('show');
      clearTimeout(window._miyuAiToast); window._miyuAiToast=setTimeout(()=>toast.classList.remove('show'),1500);
    }
  }

  const style = document.createElement('style');
  style.textContent = `
    .miyu-ai-mode-tabs{display:flex;gap:8px;margin:0 0 12px}.miyu-ai-mode-tab{border:1px solid #dbeafe;background:#fff;color:#475569;border-radius:999px;padding:8px 13px;font-size:13px;font-weight:900;cursor:pointer}.miyu-ai-mode-tab.active{background:#4f46e5;color:#fff;border-color:#4f46e5}
    .miyu-ai-hidden{display:none!important}.miyu-ai-picker{margin:0;padding:16px;border:1px solid #dbeafe;border-radius:20px;background:linear-gradient(135deg,#f5f3ff 0%,#eff6ff 55%,#fff 100%)}
    .miyu-ai-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:10px}.miyu-ai-title{font-size:16px;font-weight:900}.miyu-ai-hint{font-size:12px;line-height:1.6;color:#64748b;margin-top:3px}
    .miyu-ai-form{display:flex;gap:8px}.miyu-ai-input{flex:1;min-width:0;border:1px solid #c7d2fe!important;border-radius:14px!important;padding:12px 13px!important;background:#fff!important}.miyu-ai-btn{border:0;border-radius:14px;padding:11px 14px;font-weight:900;background:#4f46e5;color:#fff;cursor:pointer;white-space:nowrap}
    .miyu-ai-examples{display:flex;gap:6px;overflow-x:auto;padding-top:9px}.miyu-ai-chip{border:1px solid #ddd6fe;background:#fff;color:#5b21b6;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:800;white-space:nowrap;cursor:pointer}
    .miyu-ai-results{display:grid;gap:8px;margin-top:12px}.miyu-ai-song{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;background:#fff;border:1px solid #e5e7eb;border-radius:15px;padding:11px 12px}.miyu-ai-name{font-weight:900;font-size:15px}.miyu-ai-artist{font-size:12px;color:#64748b;margin-top:2px}.miyu-ai-reason{font-size:11px;color:#7c3aed;margin-top:5px}.miyu-ai-copy{border:1px solid #c4b5fd;background:#f5f3ff;color:#6d28d9;border-radius:999px;padding:7px 10px;font-size:12px;font-weight:900;cursor:pointer}
    @media(max-width:560px){.miyu-ai-form{display:grid;grid-template-columns:1fr auto}.miyu-ai-picker{padding:13px}.miyu-ai-song{grid-template-columns:1fr auto}}
  `;
  document.head.appendChild(style);

  const box = document.createElement('section');
  box.id = 'miyuAiPicker';
  box.className = 'miyu-ai-picker miyu-ai-hidden';
  box.innerHTML = `
    <div class="miyu-ai-head"><div><div class="miyu-ai-title">✨ AI 帮我选</div><div class="miyu-ai-hint">说说现在的场景、心情或想听的风格，我会从谜屿完整曲库里综合挑选。</div></div></div>
    <div class="miyu-ai-form"><input id="miyuAiInput" class="miyu-ai-input" type="text" placeholder="例如：下班有点累，想听舒服一点但不要太悲"><button id="miyuAiBtn" class="miyu-ai-btn" type="button">帮我选</button></div>
    <div class="miyu-ai-examples"><button class="miyu-ai-chip" type="button">下班路上舒服一点</button><button class="miyu-ai-chip" type="button">失恋但不要太虐</button><button class="miyu-ai-chip" type="button">来点燃一点的</button><button class="miyu-ai-chip" type="button">适合深夜听的</button></div>
    <div id="miyuAiResults" class="miyu-ai-results"></div>`;

  let keywordArea;
  if (isToolbox) {
    keywordArea = Array.from(host.children).filter(el => el !== box);
    const toolbar = host.querySelector('.search-toolbar-v2');
    if (toolbar) toolbar.insertAdjacentElement('beforebegin', box); else host.appendChild(box);
  } else {
    keywordArea = Array.from(document.querySelectorAll('.toolbar, .result-head, #pagination, #list'));
    host.insertAdjacentElement('afterend', box);
  }

  const tabs = document.createElement('div');
  tabs.className = 'miyu-ai-mode-tabs';
  tabs.innerHTML = '<button type="button" class="miyu-ai-mode-tab active" data-mode="keyword">🔎 关键字选歌</button><button type="button" class="miyu-ai-mode-tab" data-mode="ai">✨ AI 帮我选</button>';
  if (isToolbox) host.insertBefore(tabs, host.querySelector('.search-toolbar-v2') || host.firstChild);
  else host.parentNode.insertBefore(tabs, host);

  function setMode(mode) {
    tabs.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    box.classList.toggle('miyu-ai-hidden', mode !== 'ai');
    keywordArea.forEach(el => el.classList.toggle('miyu-ai-hidden', mode === 'ai'));
  }
  tabs.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));

  const input = document.getElementById('miyuAiInput');
  const btn = document.getElementById('miyuAiBtn');
  const results = document.getElementById('miyuAiResults');
  let songs = [];

  async function ensureSongs() {
    if (songs.length) return songs;
    const r = await fetch(`${DATA_PATH}?t=${Date.now()}`, {cache:'no-store'});
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const raw = await r.json();
    const arr = Array.isArray(raw) ? raw : (raw?.songs || raw?.data || []);
    songs = arr.map(songData).filter(Boolean);
    return songs;
  }

  async function run() {
    const query = input.value.trim();
    if (!query) { input.focus(); return; }
    btn.disabled = true; btn.textContent = '挑选中…';
    results.innerHTML = '<div class="miyu-ai-hint">正在综合场景、情绪、风格和能量挑歌…</div>';
    try {
      const pool = await ensureSongs();
      const picks = pick(pool, query, 3);
      results.innerHTML = picks.map(({song,reason}) => `<article class="miyu-ai-song"><div><div class="miyu-ai-name">${esc(song.name)}</div><div class="miyu-ai-artist">${esc(song.artist || '未知歌手')}</div><div class="miyu-ai-reason">✨ ${esc(reason)}</div></div><button class="miyu-ai-copy" type="button" data-ai-copy="${esc(song.name)}">${isToolbox?'复制':'点歌'}</button></article>`).join('');
      results.querySelectorAll('[data-ai-copy]').forEach(b => b.addEventListener('click', () => copySong(b.dataset.aiCopy || '')));
    } catch (e) {
      console.error('Miyu AI picker failed', e);
      results.innerHTML = '<div class="miyu-ai-hint">AI 选歌暂时载入失败，请稍后再试。</div>';
    } finally { btn.disabled=false; btn.textContent='帮我选'; }
  }

  btn.addEventListener('click', run);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
  box.querySelectorAll('.miyu-ai-chip').forEach(chip => chip.addEventListener('click', () => { input.value=chip.textContent.trim(); run(); }));
  setMode('keyword');
})();
