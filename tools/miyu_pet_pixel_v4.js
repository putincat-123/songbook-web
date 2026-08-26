(() => {
  const nav=document.querySelector('.tabs'),app=document.querySelector('.app');
  if(!nav||!app)return;
  document.getElementById('petGame')?.remove();
  nav.querySelectorAll('[data-tab="petGame"]').forEach(x=>x.remove());

  const PETS=[
    {id:'otter',name:'小海獭',food:'小鱼干',body:'#9b6b4a',belly:'#f1d2a8',accent:'#5a3c2b',cheek:'#e9a287'},
    {id:'cat',name:'小猫',food:'猫罐头',body:'#e6a257',belly:'#fff0cf',accent:'#85502e',cheek:'#f2a49d'},
    {id:'dog',name:'小狗',food:'肉骨头',body:'#c78e59',belly:'#f5d5aa',accent:'#6f472f',cheek:'#e9a287'},
    {id:'seal',name:'小海豹',food:'小鱼',body:'#a9b8c9',belly:'#eef4f8',accent:'#64748b',cheek:'#efb3b7'},
    {id:'rabbit',name:'小兔',food:'胡萝卜',body:'#efd6dc',belly:'#fff7f4',accent:'#ad7480',cheek:'#efa8ad'},
    {id:'whale',name:'小鲸鱼',food:'海盐糖',body:'#6ca8d6',belly:'#dff4ff',accent:'#356b92',cheek:'#96c9df'}
  ];
  const THEME={
    outline:'#6C5747', outline2:'#8A7562',
    wall:'#F8F3EA', wallLine:'#E9DED0', baseboard:'#B89573',
    floorA:'#D8C3A5', floorB:'#E2CEB2', floorLine:'#C3A784',
    glassA:'#CDECF4', glassB:'#9FD2E2', window:'#7A6656',
    curtain:'#BFDAD7', curtain2:'#DCEBE7', curtainTie:'#D8A866',
    sage:'#AFC6B0', sageLight:'#D5E3D2', sageDark:'#7E9A83',
    honey:'#E7BC63', honeyDark:'#C89142', honeyLight:'#F6E0A8', coral:'#D96B63',
    walnut:'#846553', walnutDark:'#6F5547', gold:'#D6AF63', incense:'#B84A46',
    wood:'#8E5736', woodHi:'#B7774E', woodDark:'#6E4128', mallet:'#6B4631', malletHead:'#B4845B',
    beads:'#8A5A3A', beadsHi:'#A9744B', bed:'#F0DDB6', bedShade:'#DCC49B', bedLeg:'#AA8667'
  };
  const KEY='miyu_pet_v1', SOUND_KEY='miyu_pet_sound';
  const fresh=()=>({petId:'',name:'',food:0,hunger:70,mood:70,bond:0,merit:0,lastDaily:'',streak:0,daily:{date:'',pet:0,play:0,talk:0,incense:0,beads:0,pray:0,wood:0}});
  const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const clamp=n=>Math.max(0,Math.min(100,n));
  let state=fresh();try{state=Object.assign(fresh(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{}
  if(!state.daily)state.daily=fresh().daily;
  let soundOn=localStorage.getItem(SOUND_KEY)!=='0';
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  const info=()=>PETS.find(p=>p.id===state.petId)||PETS[0];
  const esc=s=>String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');

  let audioCtx=null;
  const ac=()=>{try{if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}catch{return null}};
  function tone(freq=440,dur=.08,type='sine',gain=.035,delay=0){if(!soundOn)return;const c=ac();if(!c)return;const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.02)}
  function noiseBurst(dur=.055,gain=.025,delay=0){if(!soundOn)return;const c=ac();if(!c)return;const n=Math.max(1,Math.floor(c.sampleRate*dur)),buf=c.createBuffer(1,n,c.sampleRate),arr=buf.getChannelData(0);for(let i=0;i<n;i++)arr[i]=(Math.random()*2-1)*(1-i/n);const src=c.createBufferSource(),g=c.createGain(),t=c.currentTime+delay;src.buffer=buf;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);src.connect(g);g.connect(c.destination);src.start(t)}
  function sfx(n){
    if(n==='wood'){tone(290,.045,'triangle',.06);tone(165,.075,'sine',.025,.012);return}
    if(n==='incense'){tone(530,.28,'sine',.04);tone(1012,.42,'sine',.018,.02);tone(1572,.5,'sine',.012,.03);return}
    if(n==='beads'){[0,.055,.11].forEach((d,i)=>{noiseBurst(.035,.018,d);tone(4300-i*180,.04,'sine',.012,d)});return}
    if(n==='pray'){tone(523,.12);tone(659,.12,'sine',.03,.1);tone(784,.18,'sine',.026,.2);return}
    if(n==='feed'){noiseBurst(.045,.018);tone(250,.05,'triangle',.025);noiseBurst(.04,.014,.075);tone(310,.055,'triangle',.02,.08);return}
    if(n==='pet'){tone(620,.08,'sine',.02);tone(760,.1,'sine',.017,.06);return}
    if(n==='play'){tone(390,.055,'square',.014);tone(610,.075,'square',.014,.06);return}
    if(n==='talk'){tone(520,.05,'triangle',.016);tone(620,.05,'triangle',.014,.055);return}
    if(n==='blind'){tone(440,.06,'triangle',.035);tone(660,.07,'triangle',.03,.055);tone(880,.1,'sine',.025,.115)}
  }

  const st=document.createElement('style');st.textContent=`
  .px-wrap{max-width:620px;margin:10px auto;font-family:"Courier New",monospace}.px-shell{background:#E8DED0;border:4px solid #8D7867;box-shadow:0 8px 0 #C8B5A1,0 16px 30px rgba(95,79,65,.12);border-radius:12px;overflow:hidden}.px-hud{display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap;background:linear-gradient(#BFD6D2,#A9C4BF);color:#4F514C;padding:9px 8px;border-bottom:4px solid #829C97;font-weight:900}.px-chip{background:#E3EEEA;border:2px solid #829C97;padding:5px 7px;font-size:12px}.px-room{position:relative;background:${THEME.floorA}}.px-room canvas{display:block;width:100%;height:auto;image-rendering:pixelated;touch-action:manipulation}.px-bubble{position:absolute;left:12%;right:12%;top:4.5%;background:#FFFDF8;border:2px solid #B7A28E;box-shadow:3px 3px 0 rgba(114,96,80,.12);padding:6px 9px;text-align:center;font:900 12px/1.35 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;color:#62574E;pointer-events:none;transition:opacity .25s ease,transform .25s ease}.px-tip{background:#879F9A;color:#FFF8EC;padding:5px 8px;text-align:center;font:800 10px/1.4 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;opacity:.95}.px-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;padding:8px;background:#D7E3DA;border-top:4px solid #A8BFB5}.px-btn{border:2px solid #9B8A78;background:linear-gradient(#FFF7E3,#F2DEB9);color:#51473F;box-shadow:0 3px 0 #B19D89;padding:10px 4px;font-weight:950;font-size:12px}.px-manage{display:flex;gap:7px;padding:7px 8px 9px;background:#E9DFD1;justify-content:center;flex-wrap:wrap}.px-small{border:2px solid #A28E7B;background:#F2E7D7;padding:6px 9px;font-weight:900;font-size:11px;color:#51473F}.px-sound.on{background:#DCEBD5}.px-adopt{background:#F8EEDC;border:4px solid #9B8775;padding:14px}.px-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}.px-choice{border:3px solid #A38E7B;background:#FFF7E9;padding:10px 5px;text-align:center;font-weight:900}.px-choice.sel{background:#DFF1F7;border-color:#72A2B2}.px-icon{width:70px;height:60px;margin:0 auto 5px;image-rendering:pixelated}.px-name{width:100%;border:3px solid #A38E7B;background:#FFFCF6;padding:11px;font-size:16px;font-weight:900}.px-adoptgo{width:100%;margin-top:8px;border:3px solid #668D91;background:#8FC5C4;color:#fff;padding:11px;font-weight:950}.px-float{position:absolute;z-index:9;pointer-events:none;color:#9B5B2E;font:900 12px/1 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;text-shadow:0 1px 0 #FFE8BD;animation:pxFloat .72s ease-out forwards;white-space:nowrap}@keyframes pxFloat{0%{opacity:0;transform:translate(-50%,4px) scale(.92)}16%{opacity:1}100%{opacity:0;transform:translate(-50%,-30px) scale(1.05)}}@media(max-width:620px){.px-wrap{margin:8px -2px}.px-actions{grid-template-columns:repeat(2,1fr)}.px-grid{grid-template-columns:repeat(2,1fr)}}`;
  document.head.appendChild(st);

  const btn=document.createElement('button');btn.className='tab-btn';btn.dataset.tab='petGame';btn.textContent='🐾 宠物';nav.appendChild(btn);
  const panel=document.createElement('section');panel.id='petGame';panel.className='panel';panel.innerHTML='<div class="px-wrap"></div>';app.appendChild(panel);const root=panel.firstElementChild;
  const show=()=>{document.querySelectorAll('.tab-btn').forEach(x=>x.classList.toggle('active',x===btn));document.querySelectorAll('.panel').forEach(x=>x.classList.toggle('active',x===panel))};btn.onclick=show;

  function counters(){const t=today();if(!state.daily||state.daily.date!==t)state.daily={date:t,pet:0,play:0,talk:0,incense:0,beads:0,pray:0,wood:0};if(state.daily.wood==null)state.daily.wood=0}
  function daily(){if(!state.petId)return false;const t=today();if(state.lastDaily===t)return false;const y=new Date();y.setDate(y.getDate()-1);const yy=`${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,'0')}-${String(y.getDate()).padStart(2,'0')}`;state.streak=state.lastDaily===yy?(state.streak||0)+1:1;state.lastDaily=t;state.food=(state.food||0)+3;counters();save();return true}
  let hideTimer=0;
  function bubble(t){const b=document.getElementById('pxBubble');if(!b)return;b.textContent=t;b.style.opacity='1';b.style.transform='translateY(0)';clearTimeout(hideTimer);hideTimer=setTimeout(()=>{if(document.body.contains(b)){b.style.opacity='.1';b.style.transform='translateY(-3px)'}},3200)}
  function floatText(px,py,text,color='#9b4f1d'){const room=root.querySelector('.px-room');if(!room)return;const el=document.createElement('div');el.className='px-float';el.textContent=text;el.style.color=color;el.style.left=`${Math.max(25,Math.min(295,px+(Math.random()-.5)*30))/320*100}%`;el.style.top=`${Math.max(110,Math.min(400,py-10-Math.random()*12))/430*100}%`;room.appendChild(el);setTimeout(()=>el.remove(),760)}
  const milestone=n=>n===10?'渐入佳境，功德开始累积了 🙏':n===30?'今天看来真的很需要欧气 😂':n===50?'临海居功德值正在发光 ✨':n===100?'功德圆满！但还可以继续敲 🪵':(n>100&&n%100===0?`今日木鱼已敲 ${n} 下，继续修炼～`:'');

  function spriteCanvas(p){const c=document.createElement('canvas');c.width=70;c.height=60;c.className='px-icon';drawPet(c.getContext('2d'),p,35,39,1,false,0);return c}
  function renderAdopt(){let selected=state.petId||'otter';root.innerHTML='<div class="px-adopt"><b style="font-size:20px">🐾 临海居宠物小屋</b><div class="px-grid"></div><input id="pxName" class="px-name" maxlength="12" placeholder="宠物名字"><button id="pxGo" class="px-adoptgo">确认领养</button></div>';const g=root.querySelector('.px-grid');PETS.forEach(p=>{const b=document.createElement('button');b.className='px-choice'+(p.id===selected?' sel':'');b.appendChild(spriteCanvas(p));b.append(document.createElement('br'),p.name);b.onclick=()=>{selected=p.id;g.querySelectorAll('.px-choice').forEach(q=>q.classList.toggle('sel',q===b))};g.appendChild(b)});root.querySelector('#pxGo').onclick=()=>{const p=PETS.find(v=>v.id===selected)||PETS[0];state={...fresh(),petId:p.id,name:root.querySelector('#pxName').value.trim()||p.name,food:3,bond:5,lastDaily:today(),streak:1,daily:{date:today(),pet:0,play:0,talk:0,incense:0,beads:0,pray:0,wood:0}};save();renderRoom('欢迎回家！')}}

  let raf=0,walker=null,songTitles=null,lastTitle='';
  const HIT={blind:{x:150,y:190,r:31},incense:{x:251,y:171,r:25},wood:{x:82,y:248,r:34},beads:{x:250,y:299,r:28},pray:{x:75,y:360,r:31}};
  function renderRoom(msg=''){cancelAnimationFrame(raf);counters();const got=daily(),p=info();if(got&&!msg)msg=`签到获得 ${p.food} ×3！`;save();root.innerHTML=`<div class="px-shell"><div class="px-hud"><span class="px-chip">🐾 ${esc(state.name||p.name)}</span><span class="px-chip">🍽️ ${state.food||0}</span><span class="px-chip">💗 ${state.bond||0}</span><span class="px-chip" id="meritChip">🙏 ${state.merit||0}</span><span class="px-chip">🔥 ${state.streak||1}天</span></div><div class="px-room"><canvas id="pxRoom" width="320" height="430"></canvas><div class="px-bubble" id="pxBubble">${esc(msg||'房间里的道具都可以直接点。')}</div></div><div class="px-tip">🕯️香炉 · 🪵木鱼 · 📿佛珠 · ✨祈福台 · 🎁盲盒点歌</div><div class="px-actions"><button class="px-btn" data-a="feed">🍖 喂食</button><button class="px-btn" data-a="pet">🤚 摸摸 ${state.daily.pet}/3</button><button class="px-btn" data-a="play">🎾 陪玩 ${state.daily.play}/3</button><button class="px-btn" data-a="talk">💬 说话 ${state.daily.talk}/5</button></div><div class="px-manage"><button class="px-small px-sound ${soundOn?'on':''}" data-a="sound">${soundOn?'🔊 音效开':'🔇 音效关'}</button><button class="px-small" data-a="rename">✏️ 改名</button><button class="px-small" data-a="reset">🔄 重新领养</button></div></div>`;root.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>act(b.dataset.a));startRoom(p);setTimeout(()=>{const b=document.getElementById('pxBubble');if(b)b.style.opacity='.1'},3200)}
  function startRoom(p){const c=document.getElementById('pxRoom'),g=c.getContext('2d');walker={x:158,y:317,tx:158,ty:317,face:1,wait:20,step:0,p};c.onclick=async e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)*320/r.width,y=(e.clientY-r.top)*430/r.height;if(Math.hypot(x-HIT.blind.x,y-HIT.blind.y)<=HIT.blind.r){await blindbox(x,y);return}if(Math.hypot(x-HIT.wood.x,y-HIT.wood.y)<=HIT.wood.r){counters();state.daily.wood++;state.merit=(state.merit||0)+1;save();sfx('wood');floatText(x,y,'功德 +1');document.getElementById('meritChip').textContent='🙏 '+state.merit;bubble(milestone(state.daily.wood)||'🪵 咚——功德 +1');return}for(const [key,h] of Object.entries(HIT)){if(!['wood','blind'].includes(key)&&Math.hypot(x-h.x,y-h.y)<=h.r){ritual(key);return}}if(Math.hypot(x-walker.x,y-walker.y)<48){sfx('pet');state.mood=clamp((state.mood||0)+1);save();bubble('你点到我啦！💗')}};const loop=()=>{updateWalker();drawRoom(g);raf=requestAnimationFrame(loop)};loop()}
  function updateWalker(){if(!walker)return;if(walker.wait>0){walker.wait--;walker.step+=.05;return}const dx=walker.tx-walker.x,dy=walker.ty-walker.y,d=Math.hypot(dx,dy);if(d<3){walker.wait=35+Math.floor(Math.random()*85);walker.tx=52+Math.random()*210;walker.ty=255+Math.random()*116;return}walker.face=dx<0?-1:1;walker.x+=dx/d*.7;walker.y+=dy/d*.55;walker.step+=.17}
  async function blindbox(x,y){bubble('🎁 正在摇盲盒…');try{if(!songTitles){const r=await fetch('../data/miyu/songs.json',{cache:'no-store'});if(!r.ok)throw 0;const d=await r.json(),arr=Array.isArray(d)?d:Array.isArray(d?.songs)?d.songs:Array.isArray(d?.data)?d.data:[];const seen=new Set();songTitles=arr.map(v=>(typeof v==='string'?v:(v?.name??v?.title??v?.song??v?.song_name??'')).toString().trim()).filter(v=>v&&!seen.has(v)&&seen.add(v));if(!songTitles.length)throw 0}let title=songTitles[Math.floor(Math.random()*songTitles.length)];for(let i=0;i<5&&title===lastTitle;i++)title=songTitles[Math.floor(Math.random()*songTitles.length)];lastTitle=title;const text=`点歌 ${title}`;let ok=false;try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);ok=true}}catch{}if(!ok){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();ok=document.execCommand('copy');ta.remove()}sfx('blind');floatText(x,y,'已复制点歌 ✨','#8c4f20');bubble(ok?'🎁 已抽到神秘歌曲，点歌内容已复制！':'🎁 抽到了，但浏览器没有允许自动复制。')}catch{bubble('🎁 盲盒暂时没连上曲库，稍后再试～')}}
  function ritual(a){counters();if(a==='incense'){if(state.daily.incense>=3)return bubble('今天已经烧过三次香啦～');sfx('incense');state.daily.incense++;state.merit+=5;save();floatText(HIT.incense.x,HIT.incense.y,'功德 +5','#B36A3C');renderRoom('🕯️ 香火已上｜功德 +5')}else if(a==='beads'){if(state.daily.beads>=5)return bubble('今天佛珠已经摸够五次啦～');sfx('beads');state.daily.beads++;state.merit+=2;save();floatText(HIT.beads.x,HIT.beads.y,'功德 +2','#8A5A3A');renderRoom('📿 摸摸佛珠｜功德 +2')}else if(a==='pray'){if(state.merit<10)return bubble('功德不足 10，先敲几下木鱼吧～');if(state.daily.pray>=3)return bubble('今天已经祈福三次啦～');sfx('pray');state.daily.pray++;state.merit-=10;save();renderRoom('✨ 今日欧气：宠物加持｜娱乐彩蛋，不影响真实抽奖概率')}}

  function rect(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
  function outline(g,x,y,w,h,c,e=THEME.outline){rect(g,x-2,y-2,w+4,h+4,e);rect(g,x,y,w,h,c)}
  function line(g,x1,y1,x2,y2,w,c){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()}
  function ellipse(g,x,y,rx,ry,c,stroke=THEME.outline,lw=2){g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=c;g.fill();g.strokeStyle=stroke;g.lineWidth=lw;g.stroke()}

  function drawRoom(g){
    g.clearRect(0,0,320,430);
    rect(g,0,0,320,147,THEME.wall);rect(g,0,140,320,8,THEME.baseboard);
    for(let y=148;y<430;y+=24){for(let x=0;x<320;x+=40){rect(g,x,y,40,24,((x/40+y/24)%2)?THEME.floorA:THEME.floorB);rect(g,x,y,40,2,THEME.floorLine)}}

    // Window + soft sea-salt curtains
    outline(g,22,25,100,73,THEME.window);rect(g,28,31,88,61,THEME.glassA);rect(g,28,66,88,26,THEME.glassB);rect(g,70,31,4,61,'#FFF8EE');rect(g,28,59,88,4,'#FFF8EE');
    rect(g,24,27,16,62,THEME.curtain);rect(g,104,27,16,62,THEME.curtain);rect(g,28,31,8,55,THEME.curtain2);rect(g,108,31,8,55,THEME.curtain2);rect(g,35,56,6,7,THEME.curtainTie);rect(g,101,56,6,7,THEME.curtainTie);

    // Blind-box machine now sits against the wall/baseboard area
    outline(g,112,139,70,76,THEME.honeyDark,THEME.outline);rect(g,118,146,58,18,THEME.honey);outline(g,126,168,42,31,THEME.honeyLight,THEME.outline);rect(g,137,172,20,18,THEME.coral);rect(g,132,193,30,14,'#F5E4BC');

    // Incense table tucked closer to the right wall/baseboard
    outline(g,219,177,65,11,THEME.walnut,THEME.outline);rect(g,225,188,7,37,THEME.walnutDark);rect(g,271,188,7,37,THEME.walnutDark);outline(g,238,157,27,13,THEME.gold,THEME.outline2);rect(g,246,134,3,24,THEME.incense);rect(g,254,136,3,22,THEME.incense);

    // Cheerier sage-green wood-fish mat
    outline(g,48,222,104,74,THEME.sageDark,THEME.outline2);rect(g,55,229,90,60,THEME.sageLight);line(g,61,241,139,241,2,'#F2F7EF');line(g,61,260,139,260,2,THEME.sage);line(g,61,279,139,279,2,'#F2F7EF');
    ellipse(g,83,272,24,14,THEME.wood,THEME.woodDark,3);line(g,75,270,96,264,4,THEME.woodDark);rect(g,59,268,8,7,THEME.wood);ellipse(g,99,248,6,6,THEME.malletHead,THEME.woodDark,2);line(g,103,245,133,226,6,THEME.mallet);

    for(let i=0;i<10;i++){const a=i/10*Math.PI*2;outline(g,246+Math.cos(a)*18,292+Math.sin(a)*14,6,6,(i%2?THEME.beads:THEME.beadsHi),THEME.outline2)}rect(g,249,304,5,14,THEME.gold);

    outline(g,47,344,56,37,'#C99660',THEME.outline2);rect(g,54,351,42,22,'#F1D98B');rect(g,70,328,7,18,THEME.coral);
    outline(g,130,349,75,31,THEME.bed,THEME.outline2);rect(g,137,378,7,24,THEME.bedLeg);rect(g,191,378,7,24,THEME.bedLeg);ellipse(g,151,342,15,7,'#D9B56B',THEME.outline2,2);ellipse(g,96,366,8,8,'#F2C14E',THEME.outline2,2);line(g,96,359,96,373,3,'#5EA6E8');

    if(walker)drawPet(g,walker.p,walker.x,walker.y,1.5,walker.face<0,walker.step);
  }

  function drawPet(g,p,cx,cy,s=1,flip=false,step=0){g.save();g.translate(cx,cy);g.scale(flip?-s:s,s);g.translate(0,Math.sin(step)*1.2);const B=p.body,A=p.accent,V=p.belly,C=p.cheek;outline(g,-15,5,30,21,B,A);outline(g,-18,-19,36,27,B,A);rect(g,-13,-12,26,16,V);rect(g,-10,-8,6,6,'#fff');rect(g,4,-8,6,6,'#fff');rect(g,-8,-6,3,3,'#263238');rect(g,6,-6,3,3,'#263238');rect(g,-13,-1,5,3,C);rect(g,8,-1,5,3,C);if(p.id==='cat'){outline(g,-17,-27,10,11,B,A);outline(g,7,-27,10,11,B,A)}else if(p.id==='dog'){outline(g,-19,-26,9,16,A,A);outline(g,10,-26,9,16,A,A)}else if(p.id==='rabbit'){outline(g,-13,-40,8,23,B,A);outline(g,5,-40,8,23,B,A)}else if(p.id==='otter'){outline(g,-17,-27,9,9,B,A);outline(g,8,-27,9,9,B,A)}else if(p.id==='seal'){ellipse(g,0,5,19,11,B,A,2)}else if(p.id==='whale'){rect(g,15,4,8,5,B)}g.restore()}

  function act(a){const p=info();counters();if(a==='sound'){soundOn=!soundOn;localStorage.setItem(SOUND_KEY,soundOn?'1':'0');renderRoom(soundOn?'音效已开启 🔊':'音效已关闭 🔇');return}if(a==='feed'){if(state.food<1)return bubble('食物吃完啦，明天再来领吧～');sfx('feed');state.food--;state.bond=clamp(state.bond+2);save();renderRoom(`好吃！${p.food}最好吃了！`)}else if(a==='pet'){if(state.daily.pet>=3)return bubble('今天已经摸够三次啦～');sfx('pet');state.daily.pet++;state.bond=clamp(state.bond+3);save();renderRoom('嘿嘿，摸摸很舒服。')}else if(a==='play'){if(state.daily.play>=3)return bubble('今天玩累啦～');sfx('play');state.daily.play++;state.bond=clamp(state.bond+4);save();renderRoom('玩得超开心！')}else if(a==='talk'){if(state.daily.talk>=5)return bubble('今天聊很多啦～');sfx('talk');state.daily.talk++;state.bond=clamp(state.bond+1);save();renderRoom(['今天也想听谜屿唱歌。','临海居今天很舒服～','你回来我就很开心。','等下还要陪我玩喔。','今天公屏会不会很热闹？'][(state.daily.talk-1)%5])}else if(a==='rename'){const n=prompt('宠物的新名字：',state.name||p.name);if(n&&n.trim()){state.name=n.trim().slice(0,12);save();renderRoom('新名字我记住啦！')}}else if(a==='reset'){if(confirm('要重新选择宠物吗？')){state=fresh();save();cancelAnimationFrame(raf);renderAdopt()}}}

  if(state.petId)renderRoom();else renderAdopt();if(new URLSearchParams(location.search).get('tool')==='petGame')show();
})();