(() => {
  if (window.__MIYU_PET_BLINDBOX__) return;
  window.__MIYU_PET_BLINDBOX__ = true;

  let songTitles = null;
  let loadingPromise = null;
  let lastTitle = '';
  let returnTimer = null;

  const style = document.createElement('style');
  style.textContent = `
    .px-blindbox{position:absolute;left:45%;top:27.2%;z-index:4;width:74px;min-height:76px;transform:translateX(-50%);border:3px solid #4c342b;background:linear-gradient(#d69a46 0 18%,#efc16e 18% 72%,#b97535 72% 100%);color:#4b3023;box-shadow:0 5px 0 #4c342b,inset 0 0 0 2px #ffe2a0;border-radius:3px;padding:8px 5px 6px;font:900 10px/1.15 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;cursor:pointer;touch-action:manipulation}
    .px-blindbox:before{content:"";position:absolute;left:13px;right:13px;top:25px;height:22px;background:#7f5035;border:2px solid #4c342b;box-shadow:inset 0 0 0 3px #f7d88e}
    .px-blindbox:after{content:"";position:absolute;right:8px;top:52px;width:9px;height:9px;background:#d95743;border:2px solid #4c342b;border-radius:50%}
    .px-blindbox:active{transform:translate(-50%,2px);box-shadow:0 3px 0 #4c342b,inset 0 0 0 2px #ffe2a0}
    .px-blindbox .box{display:block;position:relative;z-index:1;font-size:20px;line-height:20px;margin-top:4px;filter:saturate(.85)}
    .px-blindbox .label{display:block;position:absolute;left:5px;right:5px;bottom:5px;z-index:1;background:#f7dfaa;border:1px solid #795039;padding:2px 1px;white-space:nowrap}
    .px-blindbox-burst{position:absolute;z-index:7;pointer-events:none;color:#8c4f20;font:900 12px/1 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;text-shadow:0 1px 0 #fff0c7;animation:pxBlindBurst .75s ease-out forwards;white-space:nowrap}
    .px-blind-pet{position:absolute;left:50%;top:72%;z-index:6;width:74px;height:74px;transform:translate(-50%,-50%);transition:left .9s ease,top .9s ease;image-rendering:pixelated;pointer-events:none}
    .px-blind-pet.walking{animation:pxBlindStep .18s steps(2,end) infinite}
    .px-blind-mask{position:absolute;left:41%;top:62%;z-index:3;width:92px;height:88px;background:#d8c3a5;pointer-events:none}
    .px-blindbox.shake{animation:pxBlindShake .12s steps(2,end) 8}
    @keyframes pxBlindBurst{0%{opacity:0;transform:translate(-50%,5px) scale(.9)}15%{opacity:1}100%{opacity:0;transform:translate(-50%,-30px) scale(1.05)}}
    @keyframes pxBlindStep{0%{margin-top:0}100%{margin-top:-4px}}
    @keyframes pxBlindShake{0%{margin-left:-3px}100%{margin-left:3px}}
  `;
  document.head.appendChild(style);

  function setBubble(text){ const b=document.getElementById('pxBubble'); if(b)b.textContent=text; }
  function petId(){ try{return JSON.parse(localStorage.getItem('miyu_pet_v1')||'{}').petId||'otter'}catch{return'otter'} }
  function petColors(){
    return {
      otter:['#9b6b4a','#f1d2a8','#5a3c2b'],cat:['#e6a257','#fff0cf','#85502e'],dog:['#c78e59','#f5d5aa','#6f472f'],crow:['#343943','#59616e','#1e2229'],rabbit:['#efd6dc','#fff7f4','#ad7480'],whale:['#6ca8d6','#dff4ff','#356b92']
    }[petId()]||['#9b6b4a','#f1d2a8','#5a3c2b'];
  }
  function drawMiniPet(c){
    const g=c.getContext('2d'),[b,v,a]=petColors(),id=petId();g.clearRect(0,0,74,74);g.imageSmoothingEnabled=false;
    const r=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
    r(22,28,30,28,a);r(24,30,26,24,b);r(18,12,38,28,a);r(20,14,34,24,b);r(25,22,24,13,v);r(26,24,6,6,'#fff');r(42,24,6,6,'#fff');r(28,26,3,3,'#263238');r(44,26,3,3,'#263238');r(34,31,6,3,a);r(21,55,10,6,a);r(43,55,10,6,a);
    if(id==='cat'){r(18,5,11,12,a);r(45,5,11,12,a)} else if(id==='dog'){r(14,9,10,19,a);r(50,9,10,19,a)} else if(id==='rabbit'){r(22,0,8,18,a);r(44,0,8,18,a)} else if(id==='crow'){r(56,24,10,6,'#d9a441');r(12,35,9,18,a);r(53,35,9,18,a)} else if(id==='otter'){r(17,7,10,10,a);r(47,7,10,10,a)} else if(id==='whale'){r(54,37,12,6,b);r(8,39,10,6,b)}
  }
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  function cleanupWalk(){ document.querySelector('.px-blind-pet')?.remove(); document.querySelector('.px-blind-mask')?.remove(); }
  async function walkToBox(){
    clearTimeout(returnTimer);cleanupWalk();const room=document.querySelector('#petGame .px-room');if(!room)return;
    const mask=document.createElement('div');mask.className='px-blind-mask';room.appendChild(mask);
    const c=document.createElement('canvas');c.width=74;c.height=74;c.className='px-blind-pet walking';drawMiniPet(c);room.appendChild(c);
    setBubble('🐾 我过去摇盲盒！');await wait(60);c.style.left='45%';c.style.top='43%';await wait(950);c.classList.remove('walking');
  }
  function stayThenReturn(){
    clearTimeout(returnTimer);returnTimer=setTimeout(async()=>{const c=document.querySelector('.px-blind-pet');if(!c){cleanupWalk();return}c.classList.add('walking');c.style.left='50%';c.style.top='72%';setBubble('五秒没人叫我，我回去啦～');await wait(950);cleanupWalk()},5000);
  }
  function popFeedback(){const room=document.querySelector('#petGame .px-room');if(!room)return;const el=document.createElement('div');el.className='px-blindbox-burst';el.textContent='🎁 已复制点歌指令 ✨';el.style.left=(45+(Math.random()-.5)*8)+'%';el.style.top='38%';room.appendChild(el);setTimeout(()=>el.remove(),820)}
  function playPop(){if(localStorage.getItem('miyu_pet_sound')==='0')return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=window.__miyuBlindCtx||(window.__miyuBlindCtx=new C());if(c.state==='suspended')c.resume();const t=c.currentTime;[[440,.06,'triangle',.035,0],[660,.07,'triangle',.03,.055],[880,.1,'sine',.025,.115]].forEach(([f,d,type,v,delay])=>{const o=c.createOscillator(),g=c.createGain(),s=t+delay;o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.0001,s);g.gain.exponentialRampToValueAtTime(v,s+.008);g.gain.exponentialRampToValueAtTime(.0001,s+d);o.connect(g);g.connect(c.destination);o.start(s);o.stop(s+d+.02)})}catch{}}
  function extractTitles(data){const arr=Array.isArray(data)?data:Array.isArray(data?.songs)?data.songs:Array.isArray(data?.data)?data.data:[];const result=[],seen=new Set();for(const item of arr){const title=(typeof item==='string'?item:(item?.name??item?.title??item?.song??item?.song_name??'')).toString().trim();if(!title||seen.has(title))continue;seen.add(title);result.push(title)}return result}
  async function loadSongs(){if(songTitles?.length)return songTitles;if(loadingPromise)return loadingPromise;loadingPromise=fetch('../data/miyu/songs.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('song list');return r.json()}).then(data=>{const titles=extractTitles(data);if(!titles.length)throw new Error('empty song list');songTitles=titles;return titles}).finally(()=>{loadingPromise=null});return loadingPromise}
  function randomTitle(titles){if(titles.length===1)return titles[0];let title='';for(let i=0;i<5;i++){title=titles[Math.floor(Math.random()*titles.length)];if(title!==lastTitle)break}lastTitle=title;return title}
  async function copyText(text){try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return true}}catch{}try{const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';ta.style.pointerEvents='none';document.body.appendChild(ta);ta.select();ta.setSelectionRange(0,99999);const ok=document.execCommand('copy');ta.remove();return ok}catch{return false}}

  async function drawSong(btn){
    if(btn.dataset.busy==='1')return;btn.dataset.busy='1';
    try{
      await walkToBox();
      setBubble('🎁 抱住盲盒，用力摇一摇……');btn.classList.add('shake');await wait(1050);btn.classList.remove('shake');
      const titles=await loadSongs(),title=randomTitle(titles),ok=await copyText(`点歌 ${title}`);playPop();popFeedback();
      setBubble(ok?'🎁 开盒！抽到神秘歌曲，点歌内容已复制～':'🎁 开盒成功，但浏览器没有允许自动复制，请再点一次试试。');
      stayThenReturn();
    }catch(e){setBubble('🎁 盲盒暂时没连上曲库，稍后再试～');stayThenReturn()}finally{btn.dataset.busy='0'}
  }
  function ensure(){const room=document.querySelector('#petGame .px-room');if(!room||room.querySelector('.px-blindbox'))return;const btn=document.createElement('button');btn.type='button';btn.className='px-blindbox';btn.setAttribute('aria-label','盲盒点歌，随机抽歌并复制点歌内容');btn.innerHTML='<span class="box">🎁</span><span class="label">盲盒点歌</span>';btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();drawSong(btn)});room.appendChild(btn)}
  const timer=setInterval(ensure,350);setTimeout(()=>clearInterval(timer),120000);document.addEventListener('click',()=>setTimeout(ensure,80),true);document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(ensure,80)});ensure();
})();