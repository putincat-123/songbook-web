(() => {
  const qs = new URLSearchParams(location.search);
  const streamer = qs.get('streamer') || 'miyu';
  const $ = id => document.getElementById(id);
  const sourceLabels = {hot:'热歌榜',new:'新歌榜',rise:'飙升榜',popular:'流行指数榜'};
  let loaded = false;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normName = value => String(value || '').toLowerCase().normalize('NFKC').replace(/\s+/g,'').replace(/[()（）\[\]【】·・,.，。!！?？'"“”‘’\-_/]/g,'');

  async function copyName(name){
    try { await navigator.clipboard.writeText(name); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = name; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    const toast = $('toast');
    if (toast) { toast.textContent = '✅ 已复制：' + name; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),1300); }
  }

  function songSetFrom(raw){
    const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.songs) ? raw.songs : (Array.isArray(raw?.data) ? raw.data : []));
    return new Set(list.map(s => normName(s?.name || s?.songName || s?.title)).filter(Boolean));
  }

  function render(hotData, librarySet){
    const songs = Array.isArray(hotData?.songs) ? hotData.songs : [];
    const ranked = [...songs].sort((a,b) => (Number(b.sourceCount)||0)-(Number(a.sourceCount)||0) || (Number(a.bestRank)||999)-(Number(b.bestRank)||999));
    const top = ranked.slice(0,20);
    const owned = top.filter(s => librarySet.has(normName(s.name))).length;
    const updated = hotData?.updatedAt ? new Date(hotData.updatedAt) : null;

    $('hotRecommendSummary').innerHTML = [
      `<span class="hot-chip">Top ${top.length}</span>`,
      `<span class="hot-chip">曲库已有 ${owned}</span>`,
      `<span class="hot-chip">待关注 ${top.length-owned}</span>`,
      updated && !Number.isNaN(updated.getTime()) ? `<span class="hot-chip">更新 ${updated.toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span>` : ''
    ].join('');

    if (!top.length) {
      $('hotRecommendResult').innerHTML = '<div class="daily-empty">目前没有热门榜单资料。</div>';
      return;
    }

    $('hotRecommendResult').innerHTML = top.map((song,index) => {
      const inLibrary = librarySet.has(normName(song.name));
      const sources = Array.isArray(song.sources) ? song.sources : [];
      const charts = sources.map(s => `${sourceLabels[s.source] || s.source} #${s.rank}`).join(' · ');
      return `<article class="hot-card-v2">
        <div class="hot-rank">#${index+1}</div>
        <div class="hot-main">
          <div class="hot-name">${esc(song.name || '—')}</div>
          <div class="hot-artist-v2">${esc(song.artist || '—')}</div>
          <div class="hot-charts-v2">${esc(charts || 'QQ 音乐榜单')}</div>
          <div class="hot-meta-v2">跨榜 ${Number(song.sourceCount)||sources.length||1} 个 · 最佳排名 #${Number(song.bestRank)||'—'}</div>
        </div>
        <div class="hot-side">
          <span class="hot-state ${inLibrary?'owned':'new'}">${inLibrary?'✓ 曲库已有':'＋ 可关注'}</span>
          <button class="hot-copy" type="button" data-hot-copy="${esc(song.name || '')}">复制歌名</button>
        </div>
      </article>`;
    }).join('');

    $('hotRecommendResult').querySelectorAll('[data-hot-copy]').forEach(btn => btn.addEventListener('click',()=>copyName(btn.dataset.hotCopy)));
  }

  async function load(force = false){
    if (loaded && !force) return;
    const btn = $('loadHotRecommendBtn');
    const result = $('hotRecommendResult');
    if (!btn || !result) return;
    btn.disabled = true;
    btn.textContent = force ? '重新载入中…' : '载入中…';
    result.innerHTML = '<div class="daily-empty">正在读取 QQ 音乐四榜 Top20…</div>';
    try {
      const [hotRes,libRes] = await Promise.all([
        fetch(`../data/${encodeURIComponent(streamer)}/qq-hot.json?t=${Date.now()}`,{cache:'no-store'}),
        fetch(`../data/${encodeURIComponent(streamer)}/songs.json?t=${Date.now()}`,{cache:'no-store'})
      ]);
      if (!hotRes.ok) throw new Error('qq-hot HTTP '+hotRes.status);
      if (!libRes.ok) throw new Error('songs HTTP '+libRes.status);
      const [hotData,libData] = await Promise.all([hotRes.json(),libRes.json()]);
      render(hotData,songSetFrom(libData));
      loaded = true;
      btn.textContent = '重新载入热门推荐';
    } catch (e) {
      console.error('hot recommend failed',e);
      result.innerHTML = '<div class="daily-empty">热门推荐载入失败，请稍后重试。</div>';
      btn.textContent = '重试载入';
    } finally {
      btn.disabled = false;
    }
  }

  document.addEventListener('click', e => {
    if (e.target?.id === 'loadHotRecommendBtn') load(true);
    if (e.target?.matches?.('.tab-btn[data-tab="hot"]')) setTimeout(()=>load(false),0);
  });

  if (qs.get('tool') === 'hot') setTimeout(()=>load(false),0);
})();