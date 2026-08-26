(() => {
  if (window.__MIYU_PET_BLINDBOX__) return;
  window.__MIYU_PET_BLINDBOX__ = true;

  let songTitles = null;
  let loadingPromise = null;
  let lastTitle = '';

  const style = document.createElement('style');
  style.textContent = `
    .px-blindbox{position:absolute;left:47%;top:28%;z-index:4;width:82px;min-height:62px;transform:translateX(-50%);border:3px solid #4c342b;background:#e9b764;color:#4b3023;box-shadow:0 4px 0 #4c342b,inset 0 0 0 2px #ffe6a8;border-radius:4px;padding:5px 4px;font:900 11px/1.2 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;cursor:pointer;touch-action:manipulation}
    .px-blindbox:active{transform:translate(-50%,2px);box-shadow:0 2px 0 #4c342b,inset 0 0 0 2px #ffe6a8}
    .px-blindbox .box{display:block;font-size:25px;line-height:27px;filter:saturate(.9)}
    .px-blindbox .label{display:block;margin-top:2px;white-space:nowrap}
    .px-blindbox-burst{position:absolute;z-index:7;pointer-events:none;color:#8c4f20;font:900 12px/1 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;text-shadow:0 1px 0 #fff0c7;animation:pxBlindBurst .75s ease-out forwards;white-space:nowrap}
    @keyframes pxBlindBurst{0%{opacity:0;transform:translate(-50%,5px) scale(.9)}15%{opacity:1}100%{opacity:0;transform:translate(-50%,-30px) scale(1.05)}}
  `;
  document.head.appendChild(style);

  function setBubble(text){
    const b=document.getElementById('pxBubble');
    if(b)b.textContent=text;
  }

  function popFeedback(){
    const room=document.querySelector('#petGame .px-room');
    if(!room)return;
    const el=document.createElement('div');
    el.className='px-blindbox-burst';
    el.textContent='神秘歌曲已复制 ✨';
    el.style.left=(47+(Math.random()-.5)*8)+'%';
    el.style.top='39%';
    room.appendChild(el);
    setTimeout(()=>el.remove(),820);
  }

  function playPop(){
    if(localStorage.getItem('miyu_pet_sound')==='0')return;
    try{
      const C=window.AudioContext||window.webkitAudioContext;
      if(!C)return;
      const c=window.__miyuBlindCtx||(window.__miyuBlindCtx=new C());
      if(c.state==='suspended')c.resume();
      const t=c.currentTime;
      [[440,.06,'triangle',.035,0],[660,.07,'triangle',.03,.055],[880,.1,'sine',.025,.115]].forEach(([f,d,type,v,delay])=>{
        const o=c.createOscillator(),g=c.createGain(),s=t+delay;
        o.type=type;o.frequency.value=f;
        g.gain.setValueAtTime(.0001,s);g.gain.exponentialRampToValueAtTime(v,s+.008);g.gain.exponentialRampToValueAtTime(.0001,s+d);
        o.connect(g);g.connect(c.destination);o.start(s);o.stop(s+d+.02);
      });
    }catch{}
  }

  function extractTitles(data){
    const arr=Array.isArray(data)?data:Array.isArray(data?.songs)?data.songs:Array.isArray(data?.data)?data.data:[];
    const result=[];
    const seen=new Set();
    for(const item of arr){
      const title=(typeof item==='string'?item:(item?.name ?? item?.title ?? item?.song ?? item?.song_name ?? '')).toString().trim();
      if(!title||seen.has(title))continue;
      seen.add(title);result.push(title);
    }
    return result;
  }

  async function loadSongs(){
    if(songTitles?.length)return songTitles;
    if(loadingPromise)return loadingPromise;
    loadingPromise=fetch('../data/miyu/songs.json',{cache:'no-store'})
      .then(r=>{if(!r.ok)throw new Error('song list');return r.json()})
      .then(data=>{
        const titles=extractTitles(data);
        if(!titles.length)throw new Error('empty song list');
        songTitles=titles;
        return titles;
      })
      .finally(()=>{loadingPromise=null});
    return loadingPromise;
  }

  function randomTitle(titles){
    if(titles.length===1)return titles[0];
    let title='';
    for(let i=0;i<5;i++){
      title=titles[Math.floor(Math.random()*titles.length)];
      if(title!==lastTitle)break;
    }
    lastTitle=title;
    return title;
  }

  async function copyText(text){
    try{
      if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return true;}
    }catch{}
    try{
      const ta=document.createElement('textarea');
      ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';ta.style.pointerEvents='none';
      document.body.appendChild(ta);ta.select();ta.setSelectionRange(0,99999);
      const ok=document.execCommand('copy');ta.remove();return ok;
    }catch{return false;}
  }

  async function drawSong(btn){
    if(btn.dataset.busy==='1')return;
    btn.dataset.busy='1';
    setBubble('🎁 正在摇盲盒…');
    try{
      const titles=await loadSongs();
      const title=randomTitle(titles);
      const ok=await copyText(`点歌 ${title}`);
      playPop();
      popFeedback();
      setBubble(ok?'🎁 已抽到一首神秘歌曲，点歌内容已复制！去公屏直接贴上吧～':'🎁 已抽到一首神秘歌曲，但浏览器没有允许自动复制，请再点一次试试。');
    }catch(e){
      setBubble('🎁 盲盒暂时没连上曲库，稍后再试～');
    }finally{
      btn.dataset.busy='0';
    }
  }

  function ensure(){
    const room=document.querySelector('#petGame .px-room');
    if(!room||room.querySelector('.px-blindbox'))return;
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='px-blindbox';
    btn.setAttribute('aria-label','盲盒点歌，随机抽歌并复制点歌内容');
    btn.innerHTML='<span class="box">🎁</span><span class="label">盲盒点歌</span>';
    btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();drawSong(btn)});
    room.appendChild(btn);
  }

  const timer=setInterval(ensure,350);
  setTimeout(()=>clearInterval(timer),120000);
  document.addEventListener('click',()=>setTimeout(ensure,80),true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(ensure,80)});
  ensure();
})();
