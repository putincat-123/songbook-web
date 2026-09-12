(() => {
  const params = new URLSearchParams(location.search);
  const streamer = (params.get('streamer') || 'miyu').toLowerCase();
  if (streamer !== 'miyu') return;

  const isToolbox = !!document.getElementById('songSearch');
  const root = isToolbox ? document.getElementById('songSearch') : document.querySelector('.app');
  if (!root || document.getElementById('miyuAiPicker')) return;

  const DATA_PATH = isToolbox ? '../data/miyu/songs.json' : './data/miyu/songs.json';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = v => String(v ?? '').toLowerCase().normalize('NFKC').replace(/\s+/g, ' ').trim();
  const asText = v => Array.isArray(v) ? v.join(' ') : String(v ?? '');

  const INTENTS = [
    {words:['开心','快乐','轻快','轻松','元气','活泼','甜','甜甜','阳光','愉快'], tags:['轻快','欢快','快乐','甜','清新','元气','活泼','轻松','治愈'], reason:'轻松明亮，比较贴近你现在想要的感觉'},
    {words:['难过','伤心','失恋','emo','虐','想哭','悲伤','遗憾','心碎'], tags:['伤感','emo','深情','抒情','情歌','悲伤','遗憾'], reason:'情绪感比较强，适合想听一点故事的时候'},
    {words:['治愈','舒服','温柔','安静','放松','累','疲惫','睡前','陪伴'], tags:['治愈','温柔','安静','慢','抒情','民谣','轻松'], reason:'整体比较温柔，适合放松下来慢慢听'},
    {words:['燃','热血','炸','高能','摇滚','爆发','激情','提神'], tags:['摇滚','燃','热血','爆发','高音','乐队','力量','高能'], reason:'能量比较高，适合把气氛拉起来'},
    {words:['下班','回家','通勤','路上','开车','骑车','夜晚','晚上','深夜'], tags:['流行','轻松','治愈','抒情','r&b','民谣','夜晚','通勤'], reason:'很适合路上或夜晚听，氛围不会太用力'},
    {words:['民谣','故事','叙事'], tags:['民谣','故事','叙事','抒情'], reason:'故事感比较明显，适合静下来听歌词'},
    {words:['古风','国风'], tags:['古风','国风','中国风'], reason:'带一点古风／国风气质'},
    {words:['rap','说唱','rapper'], tags:['rap','说唱','hiphop','hip-hop'], reason:'节奏和说唱感更符合这个方向'},
    {words:['r&b','rnb','律动'], tags:['r&b','rnb','律动','groove'], reason:'律动感更明显，听起来比较松弛'},
    {words:['高音','飙高音','实力','唱功'], tags:['高音','爆发','力量','强烈'], reason:'比较能听到声音张力和爆发力'}
  ];

  const NEGATIONS = [
    {patterns:['不要太悲','不要太伤','别太悲','不要虐','不想太难过'], bad:['伤感','悲伤','emo','遗憾','心碎']},
    {patterns:['不要太吵','不要太炸','别太燃'], bad:['摇滚','燃','热血','爆发','高能']},
    {patterns:['不要太慢','别太慢'], bad:['慢','安静']}
  ];

  function songData(s, i) {
    const name = String(s?.name || s?.songName || s?.title || '').trim();
    if (!name) return null;
    const artist = String(s?.artist || s?.singer || s?.artistName || '').trim();
    const style = asText(s?.style);
    const mood = [s?.ai_mood_tags, s?.ai_scene_tags, s?.crowd_playlist_tags].map(asText).join(' ');
    const energy = asText(s?.ai_energy);
    return {id:String(s?.id || i), name, artist, style, mood, energy, text:norm([name,artist,style,mood,energy].join(' '))};
  }

  function scoreSong(song, query) {
    const q = norm(query);
    let score = 0;
    const reasons = [];
    if (song.text.includes(q) && q.length > 1) score += 10;
    const tokens = q.split(/[\s，,。！？!？、/]+/).filter(x => x.length > 1);
    tokens.forEach(t => {
      if (song.text.includes(t)) score += 3;
      if (norm(song.artist).includes(t)) score += 5;
    });
    INTENTS.forEach(intent => {
      if (!intent.words.some(w => q.includes(w))) return;
      let hit = 0;
      intent.tags.forEach(tag => { if (song.text.includes(norm(tag))) hit++; });
      if (hit) {
        score += Math.min(8, hit * 2);
        reasons.push(intent.reason);
      }
    });
    NEGATIONS.forEach(rule => {
      if (!rule.patterns.some(p => q.includes(p))) return;
      rule.bad.forEach(tag => { if (song.text.includes(norm(tag))) score -= 5; });
    });
    const artistAsk = q.match(/(?:想听|听|来点|来首|类似)([^，,。！？!？]{2,12})(?:的歌|类型|风格)?/);
    if (artistAsk) {
      const term = artistAsk[1].replace(/一点|一些|几首|一首|点/g,'').trim();
      if (term && norm(song.artist).includes(norm(term))) score += 8;
    }
    return {score, reason: reasons[0] || (score > 2 ? '和你描述的关键词比较接近' : '从谜屿完整曲库里换个方向给你试试')};
  }

  function pick(songs, query, count=3) {
    const ranked = songs.map(song => ({song, ...scoreSong(song, query)}))
      .sort((a,b) => b.score - a.score || Math.random() - .5);
    const positive = ranked.filter(x => x.score > 0);
    const source = positive.length >= count ? positive : ranked;
    const top = source.slice(0, Math.max(count * 3, 9));
    const chosen = [];
    while (top.length && chosen.length < count) {
      const windowSize = Math.min(top.length, 4);
      chosen.push(top.splice(Math.floor(Math.random() * windowSize), 1)[0]);
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
    .miyu-song-mode{display:flex;gap:8px;margin:12px 0 14px;padding:4px;background:#eef2ff;border-radius:16px;width:max-content;max-width:100%}
    .miyu-song-mode-btn{border:0;border-radius:12px;padding:9px 14px;background:transparent;color:#64748b;font-size:13px;font-weight:900;cursor:pointer}
    .miyu-song-mode-btn.active{background:#fff;color:#4338ca;box-shadow:0 2px 8px rgba(15,23,42,.08)}
    .miyu-ai-picker{display:none;margin:0 0 14px;padding:16px;border:1px solid #dbeafe;border-radius:20px;background:linear-gradient(135deg,#f5f3ff 0%,#eff6ff 55%,#fff 100%)}
    .miyu-ai-picker.active{display:block}
    .miyu-ai-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:10px}.miyu-ai-title{font-size:16px;font-weight:900}.miyu-ai-hint{font-size:12px;line-height:1.6;color:#64748b;margin-top:3px}
    .miyu-ai-form{display:flex;gap:8px}.miyu-ai-input{flex:1;min-width:0;border:1px solid #c7d2fe!important;border-radius:14px!important;padding:12px 13px!important;background:#fff!important}.miyu-ai-btn{border:0;border-radius:14px;padding:11px 14px;font-weight:900;background:#4f46e5;color:#fff;cursor:pointer;white-space:nowrap}
    .miyu-ai-examples{display:flex;gap:6px;overflow-x:auto;padding-top:9px}.miyu-ai-chip{border:1px solid #ddd6fe;background:#fff;color:#5b21b6;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:800;white-space:nowrap;cursor:pointer}
    .miyu-ai-results{display:grid;gap:8px;margin-top:12px}.miyu-ai-song{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;background:#fff;border:1px solid #e5e7eb;border-radius:15px;padding:11px 12px}.miyu-ai-name{font-weight:900;font-size:15px}.miyu-ai-artist{font-size:12px;color:#64748b;margin-top:2px}.miyu-ai-reason{font-size:11px;color:#7c3aed;margin-top:5px}.miyu-ai-copy{border:1px solid #c4b5fd;background:#f5f3ff;color:#6d28d9;border-radius:999px;padding:7px 10px;font-size:12px;font-weight:900;cursor:pointer}
    @media(max-width:560px){.miyu-ai-form{display:grid;grid-template-columns:1fr auto}.miyu-ai-picker{padding:13px}.miyu-ai-song{grid-template-columns:1fr auto}.miyu-song-mode{width:100%}.miyu-song-mode-btn{flex:1}}
  `;
  document.head.appendChild(style);

  const mode = document.createElement('div');
  mode.className = 'miyu-song-mode';
  mode.innerHTML = '<button class="miyu-song-mode-btn active" type="button" data-miyu-mode="search">🔎 关键字选歌</button><button class="miyu-song-mode-btn" type="button" data-miyu-mode="ai">✨ AI 帮我选</button>';

  const box = document.createElement('section');
  box.id = 'miyuAiPicker';
  box.className = 'miyu-ai-picker';
  box.innerHTML = `
    <div class="miyu-ai-head"><div><div class="miyu-ai-title">✨ AI 帮我选</div><div class="miyu-ai-hint">不知道点什么？说说现在想听的感觉，我从谜屿完整曲库里帮你挑。</div></div></div>
    <div class="miyu-ai-form"><input id="miyuAiInput" class="miyu-ai-input" type="text" placeholder="例如：下班有点累，想听舒服一点但不要太悲"><button id="miyuAiBtn" class="miyu-ai-btn" type="button">帮我选</button></div>
    <div class="miyu-ai-examples"><button class="miyu-ai-chip" type="button">下班路上舒服一点</button><button class="miyu-ai-chip" type="button">失恋但不要太虐</button><button class="miyu-ai-chip" type="button">来点燃一点的</button><button class="miyu-ai-chip" type="button">适合深夜听的</button></div>
    <div id="miyuAiResults" class="miyu-ai-results"></div>`;

  let searchSections = [];
  if (isToolbox) {
    const intro = root.querySelector('.card');
    const toolbar = root.querySelector('.search-toolbar-v2');
    const songList = document.getElementById('songSearchListV2');
    if (intro) intro.insertAdjacentElement('afterend', mode); else root.prepend(mode);
    mode.insertAdjacentElement('afterend', box);
    searchSections = [toolbar, songList].filter(Boolean);
  } else {
    const toolbar = root.querySelector('.toolbar');
    const resultHead = root.querySelector('.result-head');
    const pagination = document.getElementById('pagination');
    const list = document.getElementById('list');
    if (toolbar) toolbar.insertAdjacentElement('beforebegin', mode); else root.appendChild(mode);
    mode.insertAdjacentElement('afterend', box);
    searchSections = [toolbar, resultHead, pagination, list].filter(Boolean);
  }

  function setMode(next) {
    const ai = next === 'ai';
    mode.querySelectorAll('[data-miyu-mode]').forEach(b => b.classList.toggle('active', b.dataset.miyuMode === next));
    box.classList.toggle('active', ai);
    searchSections.forEach(el => { el.style.display = ai ? 'none' : ''; });
    if (ai) setTimeout(() => document.getElementById('miyuAiInput')?.focus(), 50);
  }
  mode.querySelectorAll('[data-miyu-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.miyuMode)));

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
    results.innerHTML = '<div class="miyu-ai-hint">正在从完整曲库里找适合的歌…</div>';
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
  setMode('search');
})();
