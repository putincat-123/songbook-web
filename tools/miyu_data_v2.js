(() => {
  const qs = new URLSearchParams(location.search);
  const streamer = qs.get('streamer') || 'miyu';
  const $ = id => document.getElementById(id);
  const summary = $('dataSummaryV2');
  const sync = $('syncSummaryV2');
  const reloadBtn = $('reloadPoolV2');
  const checkHotBtn = $('checkHotSyncV2');
  if (!summary || !sync) return;

  const fmt = iso => {
    if (!iso) return '未知';
    try { return new Date(iso).toLocaleString('zh-TW', { hour12:false }); }
    catch { return iso; }
  };

  async function loadSummary() {
    summary.innerHTML = '<span class="data-chip-v2">曲庫：載入中…</span><span class="data-chip-v2">QQ 熱歌：載入中…</span>';
    let songCount = null;
    let hotTime = null;
    try {
      const r = await fetch(`../data/${encodeURIComponent(streamer)}/songs.json?t=${Date.now()}`, {cache:'no-store'});
      if (r.ok) {
        const d = await r.json();
        const list = Array.isArray(d) ? d : (d?.songs || d?.data || []);
        songCount = list.length;
      }
    } catch {}
    try {
      const r = await fetch(`../data/${encodeURIComponent(streamer)}/qq-hot.json?t=${Date.now()}`, {cache:'no-store'});
      if (r.ok) {
        const d = await r.json();
        hotTime = d?.updatedAt || null;
      }
    } catch {}
    summary.innerHTML = `
      <span class="data-chip-v2">Streamer：${streamer}</span>
      <span class="data-chip-v2">曲庫：${songCount == null ? '讀取失敗' : `${songCount} 首`}</span>
      <span class="data-chip-v2">QQ 熱歌：${hotTime ? fmt(hotTime) : '讀取失敗'}</span>`;
  }

  async function checkHot() {
    sync.textContent = '檢查中…';
    try {
      const r = await fetch(`../data/${encodeURIComponent(streamer)}/qq-hot.json?t=${Date.now()}`, {cache:'no-store'});
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      sync.textContent = `QQ 熱歌同步正常 · 更新時間：${fmt(d?.updatedAt)}`;
    } catch (e) {
      sync.textContent = `QQ 熱歌同步檢查失敗：${e.message}`;
    }
  }

  reloadBtn?.addEventListener('click', () => location.reload());
  checkHotBtn?.addEventListener('click', checkHot);
  loadSummary();
})();