(() => {
  const qs = new URLSearchParams(location.search);
  const streamer = qs.get('streamer') || 'miyu';
  const textEl = document.getElementById('screenListText');
  const metaEl = document.getElementById('screenListMeta');
  const regenBtn = document.getElementById('regenScreenListBtn');
  if (!textEl || !metaEl || !regenBtn) return;

  let songs = [];
  let nonce = 0;

  const dateKey = () => {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
  };
  const seedFrom = str => {
    let h = 2166136261 >>> 0;
    for (let i=0;i<str.length;i++) { h ^= str.charCodeAt(i); h = Math.imul(h,16777619); }
    return h >>> 0;
  };
  const seededShuffle = (arr,seed) => {
    arr = [...arr]; let x = seed >>> 0;
    const rnd = () => { x += 0x6D2B79F5; let t=x; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; };
    for (let i=arr.length-1;i>0;i--) { const j=Math.floor(rnd()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
    return arr;
  };
  const compactLines = (names,maxChars=34) => {
    const lines=[]; let line='';
    for (const raw of names) {
      const name=String(raw||'').trim(); if(!name) continue;
      const next=line?line+'｜'+name:name;
      if(line && next.length>maxChars){ lines.push(line); line=name; } else line=next;
    }
    if(line) lines.push(line);
    return lines;
  };
  const normalize = (s,i) => ({
    id:String(s.id||i),
    name:String(s.name||s.songName||s.title||'').trim(),
    artist:String(s.artist||s.singer||s.artistName||'').trim(),
    sourceDate:String(s.source_date||s.sourceDate||'').trim(),
    createdAt:String(s.created_at||s.createdAt||'').trim(),
    seq:Number(s.seq||0)||0
  });
  const newest = count => [...songs].sort((a,b)=>{
    const ad=a.sourceDate||a.createdAt||'', bd=b.sourceDate||b.createdAt||'';
    if(ad!==bd) return bd.localeCompare(ad);
    return (b.seq||0)-(a.seq||0);
  }).slice(0,count);
  const screenNew = () => seededShuffle(newest(10), seedFrom(streamer+'|screen-new|'+dateKey()+'|'+nonce)).slice(0,5);
  const screenArtists = () => {
    const counts=new Map();
    songs.forEach(s=>{ if(!s.artist) return; s.artist.split(/[、,&，/]+/).map(x=>x.trim()).filter(Boolean).forEach(a=>counts.set(a,(counts.get(a)||0)+1)); });
    return [...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'zh-Hans-CN')).slice(0,5).map(([a])=>a);
  };
  const recommendations = () => {
    const recentIds=new Set(newest(10).map(s=>s.id));
    const base=songs.filter(s=>!recentIds.has(s.id));
    const shuffled=seededShuffle(base, seedFrom(streamer+'|screen-recommend|'+dateKey()+'|'+nonce));
    const result=[], artistCounts=new Map();
    for(const s of shuffled){
      const key=s.artist||'__'; const used=artistCounts.get(key)||0;
      if(key!=='__' && used>=3) continue;
      result.push(s); artistCounts.set(key,used+1);
      if(result.length>=32) break;
    }
    return result;
  };
  const build = () => {
    if(!songs.length) return;
    const newSongs=screenNew(), artists=screenArtists(), recs=recommendations();
    const parts=['🎲盲盒点歌','数字 1-'+songs.length+'｜歌手：'+artists.join('｜'),'','❥新学',...compactLines(newSongs.map(s=>s.name),32),'','❥推荐',...compactLines(recs.map(s=>s.name),34)];
    textEl.value=parts.join('\n');
    metaEl.textContent='标准版｜新学 '+newSongs.length+' 首（近期10首随机）｜推荐 '+recs.length+' 首｜歌手盲盒 '+artists.length+' 位｜可直接编辑';
  };

  regenBtn.addEventListener('click',()=>{ nonce++; setTimeout(build,0); });

  fetch('../data/'+encodeURIComponent(streamer)+'/songs.json?t='+Date.now(),{cache:'no-store'})
    .then(r=>{if(!r.ok) throw new Error('HTTP '+r.status); return r.json();})
    .then(raw=>{ const arr=Array.isArray(raw)?raw:(raw&&Array.isArray(raw.songs)?raw.songs:(raw&&Array.isArray(raw.data)?raw.data:[])); songs=arr.map(normalize).filter(s=>s.name); build(); })
    .catch(e=>console.warn('screenlist patch failed',e));
})();
