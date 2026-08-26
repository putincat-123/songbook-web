(() => {
  const nav=document.querySelector('.tabs'),app=document.querySelector('.app');
  if(!nav||!app)return;
  const old=document.getElementById('petGame');if(old)old.remove();
  nav.querySelectorAll('[data-tab="petGame"]').forEach(x=>x.remove());

  const PETS=[
    {id:'otter',name:'小海獭',food:'小鱼干',body:'#9b6b4a',belly:'#f1d2a8',accent:'#5a3c2b',cheek:'#e9a287'},
    {id:'cat',name:'小猫',food:'猫罐头',body:'#e6a257',belly:'#fff0cf',accent:'#85502e',cheek:'#f2a49d'},
    {id:'dog',name:'小狗',food:'肉骨头',body:'#c78e59',belly:'#f5d5aa',accent:'#6f472f',cheek:'#e9a287'},
    {id:'seal',name:'小海豹',food:'小鱼',body:'#a9b8c9',belly:'#eef4f8',accent:'#64748b',cheek:'#efb3b7'},
    {id:'rabbit',name:'小兔',food:'胡萝卜',body:'#efd6dc',belly:'#fff7f4',accent:'#ad7480',cheek:'#efa8ad'},
    {id:'whale',name:'小鲸鱼',food:'海盐糖',body:'#6ca8d6',belly:'#dff4ff',accent:'#356b92',cheek:'#96c9df'}
  ];
  const KEY='miyu_pet_v1',SOUND_KEY='miyu_pet_sound';
  const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const clamp=n=>Math.max(0,Math.min(100,n));
  const fresh=()=>({petId:'',name:'',food:0,hunger:70,mood:70,bond:0,merit:0,lastDaily:'',streak:0,daily:{date:'',pet:0,play:0,talk:0,incense:0,beads:0,pray:0}});
  let state=fresh();try{state=Object.assign(fresh(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{}
  if(!state.daily)state.daily=fresh().daily;
  let soundOn=localStorage.getItem(SOUND_KEY)!=='0';
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  const info=()=>PETS.find(p=>p.id===state.petId)||PETS[0];
  const esc=s=>String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');

  let audioCtx=null;
  function ac(){try{if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}catch{return null}}
  function tone(freq=440,dur=.08,type='sine',gain=.055,delay=0){if(!soundOn)return;const c=ac();if(!c)return;const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.02)}
  function noise(dur=.05,gain=.025,delay=0){if(!soundOn)return;const c=ac();if(!c)return;const n=Math.max(1,Math.floor(c.sampleRate*dur)),buf=c.createBuffer(1,n,c.sampleRate),a=buf.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=c.createBufferSource(),g=c.createGain(),t=c.currentTime+delay;s.buffer=buf;g.gain.value=gain;s.connect(g);g.connect(c.destination);s.start(t)}
  function sfx(name){if(!soundOn)return;if(name==='wood'){tone(175,.16,'sine',.08);tone(92,.2,'sine',.035,.01)}else if(name==='incense'){tone(660,.12,'sine',.035);tone(880,.18,'sine',.025,.09)}else if(name==='beads'){tone(930,.055,'triangle',.035);tone(760,.06,'triangle',.03,.065);tone(1040,.07,'triangle',.025,.13)}else if(name==='pray'){tone(523,.12,'sine',.045);tone(659,.12,'sine',.04,.11);tone(784,.18,'sine',.04,.22);tone(1046,.3,'sine',.035,.34)}else if(name==='feed'){noise(.065,.022);tone(360,.07,'triangle',.025,.03);tone(440,.08,'triangle',.02,.1)}else if(name==='pet'){tone(620,.09,'sine',.025);tone(760,.12,'sine',.02,.07)}else if(name==='play'){tone(380,.07,'square',.02);tone(570,.07,'square',.018,.07);tone(760,.09,'square',.015,.14)}else if(name==='talk'){tone(520,.055,'triangle',.018);tone(620,.055,'triangle',.015,.065)}else if(name==='click'){tone(430,.045,'triangle',.016)}}

  const st=document.createElement('style');st.textContent=`
  .px-wrap{max-width:620px;margin:14px auto;font-family:"Courier New",monospace}.px-shell{background:#352723;border:4px solid #211714;box-shadow:0 8px 0 #1b1210,0 16px 30px rgba(0,0,0,.2);border-radius:12px;overflow:hidden}.px-hud{display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap;background:linear-gradient(#6b4939,#5b3b30);color:#fff7e6;padding:9px 8px;border-bottom:4px solid #2a1c1a;font-weight:900}.px-chip{background:#8c624b;border:2px solid #2a1c1a;padding:5px 7px;box-shadow:inset 0 -2px 0 rgba(0,0,0,.18),inset 0 2px 0 rgba(255,255,255,.08);font-size:12px}.px-room{position:relative;background:#c99a6d}.px-room canvas{display:block;width:100%;height:auto;image-rendering:pixelated;image-rendering:crisp-edges;touch-action:manipulation}.px-bubble{position:absolute;left:8%;right:8%;top:7%;background:#fff9ef;border:3px solid #553a31;box-shadow:4px 4px 0 rgba(42,28,26,.28),inset 0 0 0 2px #f4dfbf;padding:8px 10px;text-align:center;font:900 13px/1.45 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;color:#4b322a;pointer-events:none}.px-tip{background:#4b332d;color:#eadcc8;padding:7px 10px;text-align:center;font:800 11px/1.4 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif}.px-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:8px;background:#5d3c31;border-top:4px solid #2a1c1a}.px-btn{border:2px solid #2a1c1a;background:linear-gradient(#fff2d4,#efd7aa);color:#3c2923;box-shadow:0 3px 0 #2a1c1a;padding:9px 4px;font-weight:950;font-size:12px}.px-btn:active,.px-small:active{transform:translateY(2px);box-shadow:0 1px 0 #2a1c1a}.px-manage{display:flex;gap:7px;padding:8px;background:#4b332d;justify-content:center;flex-wrap:wrap}.px-small{border:2px solid #261a18;background:#d9c1a7;padding:7px 10px;font-weight:900;box-shadow:0 2px 0 #261a18}.px-sound.on{background:#d7ead0}.px-adopt{background:#f3dfbd;border:4px solid #3f2b25;padding:14px;box-shadow:0 7px 0 #2a1c1a}.px-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}.px-choice{border:3px solid #6b4a39;background:#fff3d6;padding:10px 5px;text-align:center;font-weight:900;box-shadow:0 4px 0 #6b4a39}.px-choice.sel{background:#d9f0ff;border-color:#315f78}.px-icon{width:70px;height:60px;margin:0 auto 5px;image-rendering:pixelated}.px-name{width:100%;box-sizing:border-box;border:3px solid #5a4035;background:#fffdf5;padding:11px;font-size:16px;font-weight:900}.px-adoptgo{width:100%;margin-top:8px;border:3px solid #253e4d;background:#5da6cf;color:white;padding:11px;font-weight:950;box-shadow:0 4px 0 #253e4d}.px-note{font:700 11px/1.5 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;color:#6b5448;margin-top:8px;text-align:center}@media(max-width:620px){.px-wrap{margin:8px -2px}.px-actions{grid-template-columns:repeat(2,1fr)}.px-grid{grid-template-columns:repeat(2,1fr)}.px-chip{font-size:11px;padding:4px 6px}}`;
  document.head.appendChild(st);

  const btn=document.createElement('button');btn.className='tab-btn';btn.dataset.tab='petGame';btn.textContent='🐾 宠物';
  const calc=nav.querySelector('[data-tab="calculator"]'),data=nav.querySelector('[data-tab="data"]');if(calc)nav.insertBefore(btn,calc);else if(data)nav.insertBefore(btn,data);else nav.appendChild(btn);
  const panel=document.createElement('section');panel.id='petGame';panel.className='panel';panel.innerHTML='<div class="px-wrap"></div>';app.appendChild(panel);const root=panel.firstElementChild;
  const show=()=>{document.querySelectorAll('.tab-btn').forEach(x=>x.classList.toggle('active',x===btn));document.querySelectorAll('.panel').forEach(x=>x.classList.toggle('active',x===panel));};
  btn.onclick=show;nav.addEventListener('click',e=>{const t=e.target.closest('.tab-btn');if(t&&t!==btn){btn.classList.remove('active');panel.classList.remove('active')}});

  function counters(){const t=today();if(!state.daily||state.daily.date!==t)state.daily={date:t,pet:0,play:0,talk:0,incense:0,beads:0,pray:0};}
  function daily(){if(!state.petId)return false;const t=today();if(state.lastDaily===t)return false;const y=new Date();y.setDate(y.getDate()-1);const yy=`${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,'0')}-${String(y.getDate()).padStart(2,'0')}`;state.streak=state.lastDaily===yy?(state.streak||0)+1:1;state.lastDaily=t;state.food=(state.food||0)+3;counters();state.hunger=clamp((state.hunger||70)-5);state.mood=clamp((state.mood||70)-3);save();return true}
  function bubble(t){const b=document.getElementById('pxBubble');if(b)b.textContent=t}
  function updateSoundButton(){const b=root.querySelector('[data-a="sound"]');if(b){b.textContent=soundOn?'🔊 音效开':'🔇 音效关';b.classList.toggle('on',soundOn)}}

  function spriteCanvas(p){const c=document.createElement('canvas');c.width=70;c.height=60;c.className='px-icon';const g=c.getContext('2d');g.imageSmoothingEnabled=false;drawPet(g,p,35,39,1,false,0);return c}
  function renderAdopt(){let selected=state.petId||'otter';root.innerHTML='<div class="px-adopt"><div style="font-size:20px;font-weight:950">🐾 临海居宠物小屋</div><div class="px-note" style="text-align:left">选一只宠物，再给它取个名字。</div><div class="px-grid"></div><input id="pxName" class="px-name" maxlength="12" placeholder="宠物名字"><button id="pxGo" class="px-adoptgo">确认领养</button></div>';const g=root.querySelector('.px-grid');PETS.forEach(p=>{const b=document.createElement('button');b.className='px-choice'+(p.id===selected?' sel':'');b.type='button';b.appendChild(spriteCanvas(p));b.append(document.createElement('br'),p.name);b.onclick=()=>{sfx('click');selected=p.id;g.querySelectorAll('.px-choice').forEach(q=>q.classList.toggle('sel',q===b))};g.appendChild(b)});root.querySelector('#pxGo').onclick=()=>{sfx('pray');const p=PETS.find(v=>v.id===selected)||PETS[0],n=root.querySelector('#pxName').value.trim()||p.name;state={...fresh(),petId:p.id,name:n,food:3,hunger:78,mood:82,bond:5,merit:0,lastDaily:today(),streak:1,daily:{date:today(),pet:0,play:0,talk:0,incense:0,beads:0,pray:0}};save();renderRoom('欢迎回家！点房间里的道具也会有彩蛋。')}}

  let raf=0,walker=null,fx={kind:'',until:0};
  const HIT={incense:{x:251,y:187,r:25},wood:{x:82,y:248,r:29},beads:{x:250,y:299,r:27},pray:{x:75,y:360,r:31}};
  function renderRoom(msg=''){cancelAnimationFrame(raf);counters();const got=daily(),p=info();if(got&&!msg)msg=`签到获得 ${p.food} ×3！`;save();root.innerHTML=`<div class="px-shell"><div class="px-hud"><span class="px-chip">🐾 ${esc(state.name||p.name)}</span><span class="px-chip">🍽️ ${state.food||0}</span><span class="px-chip">💗 ${state.bond||0}</span><span class="px-chip">🙏 ${state.merit||0}</span><span class="px-chip">🔥 ${state.streak||1}天</span></div><div class="px-room"><canvas id="pxRoom" width="320" height="430"></canvas><div class="px-bubble" id="pxBubble">${esc(msg||'我会自己逛逛。房间里的道具都可以直接点。')}</div></div><div class="px-tip">🕯️香炉 · 🪵木鱼 · 📿佛珠 · ✨祈福台｜点击道具才触发</div><div class="px-actions"><button class="px-btn" data-a="feed">🍖 喂食</button><button class="px-btn" data-a="pet">🤚 摸摸 ${state.daily.pet}/3</button><button class="px-btn" data-a="play">🎾 陪玩 ${state.daily.play}/3</button><button class="px-btn" data-a="talk">💬 说话 ${state.daily.talk}/5</button></div><div class="px-manage"><button class="px-small px-sound" data-a="sound"></button><button class="px-small" data-a="rename">✏️ 改名</button><button class="px-small" data-a="reset">🔄 重新领养</button></div></div>`;root.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>act(b.dataset.a));updateSoundButton();startRoom(p)}

  function startRoom(p){const c=document.getElementById('pxRoom');if(!c)return;const g=c.getContext('2d');g.imageSmoothingEnabled=false;walker={x:158,y:317,tx:158,ty:317,face:1,wait:20,step:0,p};c.onclick=e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)*320/r.width,y=(e.clientY-r.top)*430/r.height;for(const [key,h] of Object.entries(HIT)){if(Math.hypot(x-h.x,y-h.y)<=h.r){ritual(key);return}}if(Math.hypot(x-walker.x,y-walker.y)<48){sfx('pet');state.mood=clamp((state.mood||0)+1);save();bubble('你点到我啦！💗');walker.wait=35;fx={kind:'heart',until:performance.now()+700}}};const loop=()=>{updateWalker();drawRoom(g);raf=requestAnimationFrame(loop)};loop()}
  function updateWalker(){if(!walker)return;if(walker.wait>0){walker.wait--;walker.step+=.05;return}const dx=walker.tx-walker.x,dy=walker.ty-walker.y,d=Math.hypot(dx,dy);if(d<3){walker.wait=35+Math.floor(Math.random()*85);walker.tx=52+Math.random()*210;walker.ty=255+Math.random()*116;return}walker.face=dx<0?-1:1;walker.x+=dx/d*.7;walker.y+=dy/d*.55;walker.step+=.17}
  function ritual(a){counters();if(a==='incense'){if(state.daily.incense>=3)return bubble('今天已经烧过三次香啦～');sfx('incense');state.daily.incense++;state.merit=(state.merit||0)+5;fx={kind:'incense',until:performance.now()+1300};save();renderRoom('🕯️ 香火已上｜功德 +5｜愿今晚手气白一点～');return}if(a==='wood'){sfx('wood');state.merit=(state.merit||0)+1;fx={kind:'wood',until:performance.now()+520};save();renderRoom('🪵 咚——功德 +1');return}if(a==='beads'){if(state.daily.beads>=5)return bubble('今天佛珠已经摸够五次啦～');sfx('beads');state.daily.beads++;state.merit=(state.merit||0)+2;fx={kind:'beads',until:performance.now()+800};const lines=['📿 愿今天少一点谢谢参与。','📿 愿小耳朵都来点歌。','📿 愿今晚手气顺一点。','📿 愿谜屿开口就是好听的一首。','📿 临海居今日平安喜乐。'];save();renderRoom(lines[(state.daily.beads-1)%lines.length]+'｜功德 +2');return}if(a==='pray'){if((state.merit||0)<10)return bubble('功德不足 10，先敲几下木鱼吧～');if(state.daily.pray>=3)return bubble('今天已经祈福三次啦～');sfx('pray');state.daily.pray++;state.merit-=10;fx={kind:'pray',until:performance.now()+1500};const f=['🌟 上上签｜今天可以期待一下','✨ 小吉｜保持期待，随缘出手','🍀 偏白｜宠物说今天有点欧','🌊 随缘｜先听歌再抽','🐾 宠物加持｜摸摸它再试'][Math.floor(Math.random()*5)];save();renderRoom('✨ '+f+'（娱乐彩蛋，不影响真实抽奖概率）')}}

  function rect(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
  function outlineRect(g,x,y,w,h,fill,edge='#4d3428'){rect(g,x-2,y-2,w+4,h+4,edge);rect(g,x,y,w,h,fill)}
  function drawRoom(g){
    g.clearRect(0,0,320,430);
    g.fillStyle='#f1e3cf';g.fillRect(0,0,320,147);
    for(let y=14;y<142;y+=24){g.fillStyle='rgba(255,255,255,.35)';g.fillRect(0,y,320,2)}
    g.fillStyle='#8d5e49';g.fillRect(0,140,320,8);
    for(let y=148;y<430;y+=24){for(let x=0;x<320;x+=40){g.fillStyle=((x/40+y/24)%2)?'#b88962':'#c4976d';g.fillRect(x,y,40,24);g.fillStyle='#9f7455';g.fillRect(x,y,40,2);g.fillStyle='rgba(255,255,255,.08)';g.fillRect(x+2,y+3,36,1)}}
    outlineRect(g,22,25,100,73,'#7b5746');rect(g,28,31,88,61,'#a9d9e8');rect(g,28,66,88,26,'#76b9d2');rect(g,28,75,88,17,'#9ed5dc');rect(g,70,31,4,61,'#f7efe1');rect(g,28,59,88,4,'#f7efe1');rect(g,38,42,20,5,'#eef9ff');rect(g,91,48,15,4,'#eef9ff');
    outlineRect(g,145,32,62,45,'#b78057');rect(g,151,38,50,33,'#f5ddb5');rect(g,158,57,36,5,'#79a87f');rect(g,171,44,10,13,'#f3bd69');
    outlineRect(g,24,274,64,41,'#7a5a43');rect(g,29,280,54,30,'#d7e8ce');rect(g,34,286,44,18,'#edf4dc');rect(g,39,308,34,4,'#6e936a');
    rect(g,130,349,75,31,'#eacb96');rect(g,136,354,63,20,'#f6e6bd');rect(g,137,378,7,24,'#8f664a');rect(g,191,378,7,24,'#8f664a');
    outlineRect(g,219,201,65,11,'#70432f');rect(g,225,212,7,37,'#69402d');rect(g,271,212,7,37,'#69402d');outlineRect(g,238,181,27,13,'#c99a54');rect(g,246,158,3,24,'#9d392c');rect(g,254,160,3,22,'#9d392c');rect(g,245,147,5,9,'#e7ddd0');rect(g,253,150,5,8,'#e7ddd0');
    outlineRect(g,58,235,45,27,'#70452d');rect(g,64,230,34,10,'#955f39');rect(g,68,244,26,8,'#aa7143');rect(g,90,219,5,28,'#4b2f20');rect(g,93,218,21,5,'#68442f');
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2;outlineRect(g,246+Math.cos(a)*18,292+Math.sin(a)*14,6,6,'#8a5434','#573421')}rect(g,249,304,5,14,'#d2a650');rect(g,247,316,9,4,'#8a5434');
    outlineRect(g,47,344,56,37,'#b9844e');rect(g,54,351,42,22,'#f5d989');rect(g,70,328,7,18,'#9b3d2f');outlineRect(g,65,322,18,9,'#ffe3a0','#7d4b32');
    outlineRect(g,268,193,22,22,'#80553f');rect(g,276,153,5,41,'#6a9e6b');rect(g,263,163,18,6,'#78ae79');rect(g,278,172,16,6,'#78ae79');rect(g,265,181,16,6,'#78ae79');
    outlineRect(g,132,178,60,42,'#9a6d4e');rect(g,137,183,50,32,'#d8b583');rect(g,142,190,8,22,'#7c94bd');rect(g,153,187,8,25,'#c56e64');rect(g,164,192,8,20,'#7ea77d');rect(g,176,185,7,27,'#d0a54f');
    rect(g,110,285,100,54,'#d9c2a2');rect(g,116,291,88,42,'#eadbc3');for(let x=120;x<200;x+=12)rect(g,x,307,7,10,'#c99e78');
    const now=performance.now(),pulse=.5+.5*Math.sin(now/350);
    if(fx.kind&&now<fx.until){g.save();g.globalAlpha=.35+.45*pulse;g.fillStyle='#fff5af';if(fx.kind==='incense')g.fillRect(235,143,42,58);if(fx.kind==='wood')g.fillRect(52,214,68,54);if(fx.kind==='beads')g.fillRect(222,273,57,52);if(fx.kind==='pray')g.fillRect(41,316,70,71);g.restore()}else if(fx.kind&&now>=fx.until)fx.kind='';
    if(walker)drawPet(g,walker.p,walker.x,walker.y,1.5,walker.face<0,walker.step);
    if(fx.kind==='heart'&&now<fx.until){rect(g,walker.x-4,walker.y-48,8,7,'#e98288');rect(g,walker.x-8,walker.y-44,16,7,'#e98288');rect(g,walker.x-4,walker.y-37,8,5,'#e98288')}
  }
  function drawPet(g,p,cx,cy,s=1,flip=false,step=0){
    g.save();g.translate(cx,cy);g.scale(flip?-s:s,s);const bob=Math.sin(step)*1.2;g.translate(0,bob);const B=p.body,A=p.accent,V=p.belly,C=p.cheek;
    g.save();g.scale(flip?-1:1,1);g.globalAlpha=.18;rect(g,-19,27,38,6,'#3b2d29');g.restore();
    outlineRect(g,-15,5,30,21,B,A);outlineRect(g,-18,-19,36,27,B,A);rect(g,-13,-12,26,16,V);rect(g,-9,7,18,13,V);
    rect(g,-10,-8,6,6,'#fffdf8');rect(g,4,-8,6,6,'#fffdf8');rect(g,-8,-6,3,3,'#263238');rect(g,6,-6,3,3,'#263238');rect(g,-3,-1,6,5,'#f8dfbd');rect(g,-1,0,3,2,A);rect(g,-13,-1,5,3,C);rect(g,8,-1,5,3,C);
    outlineRect(g,-13,23,9,5,A,A);outlineRect(g,4,23,9,5,A,A);
    if(p.id==='cat'){outlineRect(g,-17,-27,10,11,B,A);outlineRect(g,7,-27,10,11,B,A);rect(g,-14,-24,4,5,'#efb6a6');rect(g,10,-24,4,5,'#efb6a6');rect(g,14,11,15,5,B);rect(g,25,6,5,10,B)}
    else if(p.id==='dog'){outlineRect(g,-19,-26,9,16,A,A);outlineRect(g,10,-26,9,16,A,A);rect(g,14,12,14,5,B)}
    else if(p.id==='rabbit'){outlineRect(g,-13,-40,8,23,B,A);outlineRect(g,5,-40,8,23,B,A);rect(g,-10,-36,3,16,'#e8aeb7');rect(g,8,-36,3,16,'#e8aeb7')}
    else if(p.id==='seal'){outlineRect(g,-20,14,8,8,B,A);outlineRect(g,12,14,8,8,B,A);rect(g,15,8,12,5,B);rect(g,-17,-2,4,2,A);rect(g,13,-2,4,2,A)}
    else if(p.id==='whale'){outlineRect(g,-21,-8,42,24,B,A);rect(g,-27,-2,8,8,B);rect(g,19,-2,8,8,B);rect(g,12,14,11,6,B);rect(g,19,10,5,8,B);rect(g,-4,-19,3,8,'#bde6f0');rect(g,3,-20,3,9,'#bde6f0')}
    else if(p.id==='otter'){outlineRect(g,-17,-27,9,9,B,A);outlineRect(g,8,-27,9,9,B,A);rect(g,14,11,16,5,B);rect(g,-7,10,14,6,'#d79c64')}
    g.restore()
  }

  function act(a){const p=info();counters();if(a==='sound'){soundOn=!soundOn;localStorage.setItem(SOUND_KEY,soundOn?'1':'0');if(soundOn)sfx('click');updateSoundButton();bubble(soundOn?'音效已开启 🔊':'音效已关闭 🔇');return}if(a==='feed'){if((state.food||0)<1)return bubble('食物吃完啦，明天再来领吧～');sfx('feed');state.food--;state.hunger=clamp((state.hunger||0)+18);state.bond=clamp((state.bond||0)+2);save();renderRoom(`好吃！${p.food}最好吃了！`)}else if(a==='pet'){if(state.daily.pet>=3)return bubble('今天已经摸够三次啦～');sfx('pet');state.daily.pet++;state.bond=clamp(state.bond+3);save();renderRoom('嘿嘿，摸摸很舒服。')}else if(a==='play'){if(state.daily.play>=3)return bubble('今天玩累啦～');sfx('play');state.daily.play++;state.mood=clamp(state.mood+12);state.bond=clamp(state.bond+4);save();renderRoom('玩得超开心！')}else if(a==='talk'){if(state.daily.talk>=5)return bubble('今天聊很多啦～');sfx('talk');state.daily.talk++;state.bond=clamp(state.bond+1);save();renderRoom(['今天也想听谜屿唱歌。','临海居今天很舒服～','你回来我就很开心。','等下还要陪我玩喔。','今天公屏会不会很热闹？'][(state.daily.talk-1)%5])}else if(a==='rename'){const n=prompt('宠物的新名字：',state.name||p.name);if(n&&n.trim()){state.name=n.trim().slice(0,12);save();renderRoom('新名字我记住啦！')}}else if(a==='reset'){if(confirm('要重新选择宠物吗？目前进度会重新开始。')){state=fresh();save();cancelAnimationFrame(raf);renderAdopt()}}}

  if(state.petId)renderRoom();else renderAdopt();
  if(new URLSearchParams(location.search).get('tool')==='petGame')show();
})();