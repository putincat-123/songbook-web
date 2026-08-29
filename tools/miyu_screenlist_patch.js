(() => {
  const qs = new URLSearchParams(location.search);
  const streamer = qs.get('streamer') || 'miyu';
  const textEl = document.getElementById('screenListText');
  const metaEl = document.getElementById('screenListMeta');
  const regenBtn = document.getElementById('regenScreenListBtn');
  if (!textEl || !metaEl || !regenBtn || streamer !== 'miyu') return;

  const TEMPLATE = count => `🎲盲盒点歌 
【数字盲盒】 1-${count} 
【歌手盲盒】 薛之谦 | 周杰伦| 陈奕迅 | 毛不易 | 周兴哲 | 王力宏 | 林俊杰

❥∙新学歌曲 
颜色 | 小孩 | 挚友 | 湖光水色调

❥∙推荐歌曲 
春 | Simon | 空 | 借 | 善 | 爱 | 默 | 骁

顽疾 | 瘦子 | 唯一 | 和你 | 认可 | 很慢 | 租购 | 泪桥 | 想象 | 和你 | 浮生 | 如愿 | 崇拜 | Stay Alive | 不空 | 晚星 | 春雪 | 恋人

九月底 | 再一起 | 苏州河 | 褪黑素 | 不谓侠 | 黑夜中 | 甜甜的 | 庐州月 | 南山南 | 胡广生 | 刚刚好 | 莫妮卡

巴拉莱卡 | 人间共鸣 | 方圆几里 | 最后一页 | 茶花开了 | 天外来物 | 玫瑰教堂 | 玫瑰窃贼 | 我不知道 | 变废为宝 | 日落大道 | 像风一样

豁达下午茶 |你说爱情啊 | 亲爱的你啊 | 陪你去流浪 | 最长的电影 | 这么久没见 | 走钢索的人

21克博物馆 | 一夜一夜一夜 | 十点半的地铁 | 永不失联的爱 | 阿拉斯加海湾

月亮翻过小山坡 | 看着我的眼睛说 | 全世界谁倾听你 | 夏夜最后的烟火 | 再见眼中的星辰 | 在迦纳共和国离婚 | 再也不会有人会比我更爱你`;

  let songCount = 0;
  const build = () => {
    if (!songCount) return;
    textEl.value = TEMPLATE(songCount);
    metaEl.textContent = '固定公屏歌单｜仅数字盲盒上限随曲库自动更新｜可直接编辑';
  };

  // 原本「重新生成」不再随机换歌，改为恢复固定标准版。
  regenBtn.textContent = '↩️ 恢复标准版';
  regenBtn.addEventListener('click', () => setTimeout(build, 0));

  fetch('../data/'+encodeURIComponent(streamer)+'/songs.json?t='+Date.now(), {cache:'no-store'})
    .then(r => { if (!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
    .then(raw => {
      const arr = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.songs) ? raw.songs : (raw && Array.isArray(raw.data) ? raw.data : []));
      songCount = arr.filter(s => String((s && (s.name || s.songName || s.title)) || '').trim()).length;
      build();
    })
    .catch(e => console.warn('screenlist template failed', e));
})();
