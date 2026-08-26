(() => {
  const nav=document.querySelector('.tabs'),app=document.querySelector('.app');
  if(!nav||!app)return;
  const old=document.getElementById('petGame');if(old)old.remove();
  nav.querySelectorAll('[data-tab="petGame"]').forEach(x=>x.remove());

  const PETS=[
    {id:'otter',name:'小海獭',food:'小鱼干',body:'#9a6a45',belly:'#e9c8a1',accent:'#5a3d2c'},
    {id:'cat',name:'小猫',food:'猫罐头',body:'#e9a34f',belly:'#fff0cf',accent:'#8b5128'},
    {id:'dog',name:'小狗',food:'肉骨头',body:'#c79058',belly:'#f6d6aa',accent:'#70462d'},
    {id:'seal',name:'小海豹',food:'小鱼',body:'#aab8c8',belly:'#eef4f8',accent:'#64748b'},
    {id:'rabbit',name:'小兔',food:'胡萝卜',body:'#f2d7db',belly:'#fff7f4',accent:'#b67a85'},
    {id:'whale',name:'小鲸鱼',food:'海盐糖',body:'#6aa8d8',belly:'#dff4ff',accent:'#356b92'}
  ];
  const KEY='miyu_pet_v1';
  const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const clamp=n=>Math.max(0,Math.min(100,n));
  const fresh=()=>({petId:'',name:'',food:0,hunger:70,mood:70,bond:0,merit:0,lastDaily:'',streak:0,daily:{date:'',pet:0,play:0,talk:0,incense:0,beads:0,pray:0}});
  let state=fresh();try{state=Object.assign(fresh(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{}
  if(!state.daily)state.daily=fresh().daily;
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  const info=()=>PETS.find(p=>p.id===state.petId)||PETS[0];
  const esc=s=>String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');

  const st=document.createElement('style');st.textContent=`
  .px-wrap{max-width:620px;margin:14px auto;font-family:"Courier New",monospace}.px-shell{background:#3d2b28;border:4px solid #2a1c1a;box-shadow:0 8px 0 #1f1514,0 14px 28px rgba(0,0,0,.18);border-radius:10px;overflow:hidden}.px-hud{display:flex;gap:7px;align-items:center;justify-content:space-between;flex-wrap:wrap;background:#6a4434;color:#fff7e6;padding:9px 10px;border-bottom:4px solid #2a1c1a;font-weight:900}.px-chip{background:#8b5e45;border:2px solid #2a1c1a;padding:5px 7px;box-shadow:inset 0 -2px 0 rgba(0,0,0,.18)}.px-room{position:relative;background:#c99a6d}.px-room canvas{display:block;width:100%;height:auto;image-rendering:pixelated;touch-action:manipulation}.px-bubble{position:absolute;left:8%;right:8%;top:8%;background:#fff9ef;border:3px solid #553a31;box-shadow:4px 4px 0 rgba(42,28,26,.32);padding:8px 10px;text-align:center;font:900 13px/1.45 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;color:#4b322a;pointer-events:none}.px-tip{background:#4b332d;color:#eadcc8;padding:7px 10px;text-align:center;font:800 11px/1.4 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif}.px-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:8px;background:#5d3c31;border-top:4px solid #2a1c1a}.px-btn{border:2px solid #2a1c1a;background:#f8e7c7;color:#3c2923;box-shadow:0 3px 0 #2a1c1a;padding:9px 4px;font-weight:950;font-size:12px}.px-manage{display:flex;gap:7px;padding:8px;background:#4b332d;justify-content:center}.px-small{border:2px solid #261a18;background:#d9c1a7;padding:7px 10px;font-weight:900}.px-adopt{background:#f3dfbd;border:4px solid #3f2b25;padding:14px;box-shadow:0 7px 0 #2a1c1a}.px-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}.px-choice{border:3px solid #6b4a39;background:#fff3d6;padding:10px 5px;text-align:center;font-weight:900;box-shadow:0 4px 0 #6b4a39}.px-choice.sel{background:#d9f0ff;border-color:#315f78}.px-icon{width:70px;height:60px;margin:0 auto 5px;image-rendering:pixelated}.px-name{width:100%;box-sizing:border-box;border:3px solid #5a4035;background:#fffdf5;padding:11px;font-size:16px;font-weight:900}.px-adoptgo{width:100%;margin-top:8px;border:3px solid #253e4d;background:#5da6cf;color:white;padding:11px;font-weight:950;box-shadow:0 4px 0 #253e4d}.px-note{font:700 11px/1.5 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;color:#6b5448;margin-top:8px;text-align:center}@media(max-width:620px){.px-wrap{margin:8px -2px}.px-actions{grid-template-columns:repeat(2,1fr)}.px-grid{grid-template-columns:repeat(2,1fr)}}`;
  document.head.appendChild(st);

  const btn=document.createElement('button');btn.className='tab-btn';btn.dataset.tab='petGame';btn.textContent='🐾 宠物';
  const calc=nav.querySelector('[data-tab="calculator"]'),data=nav.querySelector('[data-tab="data"]');if(calc)nav.insertBefore(btn,calc);else if(data)nav.insertBefore(btn,data);else nav.appendChild(btn);
  const panel=document.createElement('section');panel.id='petGame';panel.className='panel';panel.innerHTML='<div class="px-wrap"></div>';app.appendChild(panel);const root=panel.firstElementChild;
  const show=()=>{document.querySelectorAll('.tab-btn').forEach(x=>x.classList.toggle('active',x===btn));document.querySelectorAll('.panel').forEach(x=>x.classList.toggle('active',x===panel));};
  btn.onclick=show;nav.addEventListener('click',e=>{const t=e.target.closest('.tab-btn');if(t&&t!==btn){btn.classList.remove('active');panel.classList.remove('active')}});

  function counters(){const t=today();if(!state.daily||state.daily.date!==t)state.daily={date:t,pet:0,play:0,talk:0,incense:0,beads:0,pray:0};}
  function daily(){if(!state.petId)return false;const t=today();if(state.lastDaily===t)return false;const y=new Date();y.setDate(y.getDate()-1);const yy=`${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,'0')}-${String(y.getDate()).padStart(2,'0')}`;state.streak=state.lastDaily===yy?(state.streak||0)+1:1;state.lastDaily=t;state.food=(state.food||0)+3;counters();state.hunger=clamp((state.hunger||70)-5);state.mood=clamp((state.mood||70)-3);save();return true}
  function bubble(t){const b=document.getElementById('pxBubble');if(b)b.textContent=t}

  function spriteCanvas(p){const c=document.createElement('canvas');c.width=70;c.height=60;c.className='px-icon';const g=c.getContext('2d');g.imageSmoothingEnabled=false;drawPet(g,p,35,38,1,false,0);return c}
  function renderAdopt(){let selected=state.petId||'otter';root.innerHTML='<div class="px-adopt"><div style="font-size:20px;font-weight:950">🐾 临海居宠物小屋</div><div class="px-note" style="text-align:left">选一只宠物，再给它取个名字。</div><div class="px-grid"></div><input id="pxName" class="px-name" maxlength="12" placeholder="宠物名字"><button id="pxGo" class="px-adoptgo">确认领养</button></div>';const g=root.querySelector('.px-grid');PETS.forEach(p=>{const b=document.createElement('button');b.className='px-choice'+(p.id===selected?' sel':'');b.type='button';b.appendChild(spriteCanvas(p));b.append(document.createElement('br'),p.name);b.onclick=()=>{selected=p.id;g.querySelectorAll('.px-choice').forEach(q=>q.classList.toggle('sel',q===b))};g.appendChild(b)});root.querySelector('#pxGo').onclick=()=>{const p=PETS.find(v=>v.id===selected)||PETS[0],n=root.querySelector('#pxName').value.trim()||p.name;state={...fresh(),petId:p.id,name:n,food:3,hunger:78,mood:82,bond:5,merit:0,lastDaily:today(),streak:1,daily:{date:today(),pet:0,play:0,talk:0,incense:0,beads:0,pray:0}};save();renderRoom('欢迎回家！点房间里的道具也会有彩蛋。')}}

  let raf=0,walker=null;
  const HIT={incense:{x:250,y:185,r:22},wood:{x:82,y:248,r:25},beads:{x:250,y:300,r:24},pray:{x:74,y:360,r:28}};
  function renderRoom(msg=''){cancelAnimationFrame(raf);counters();const got=daily(),p=info();if(got&&!msg)msg=`签到获得 ${p.food} ×3！`;save();root.innerHTML=`<div class="px-shell"><div class="px-hud"><span class="px-chip">🐾 ${esc(state.name||p.name)}</span><span class="px-chip">🍽️ ${state.food||0}</span><span class="px-chip">💗 ${state.bond||0}</span><span class="px-chip">🙏 ${state.merit||0}</span><span class="px-chip">🔥 ${state.streak||1}天</span></div><div class="px-room"><canvas id="pxRoom" width="320" height="430"></canvas><div class="px-bubble" id="pxBubble">${esc(msg||'我会自己逛逛。房间里的香炉、木鱼、佛珠和祈福台都可以点。')}</div></div><div class="px-tip">房间道具：🕯️香炉 · 🪵木鱼 · 📿佛珠 · ✨祈福台（点击才触发）</div><div class="px-actions"><button class="px-btn" data-a="feed">🍖 喂食</button><button class="px-btn" data-a="pet">🤚 摸摸 ${state.daily.pet}/3</button><button class="px-btn" data-a="play">🎾 陪玩 ${state.daily.play}/3</button><button class="px-btn" data-a="talk">💬 说话 ${state.daily.talk}/5</button></div><div class="px-manage"><button class="px-small" data-a="rename">✏️ 改名</button><button class="px-small" data-a="reset">🔄 重新领养</button></div></div>`;root.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>act(b.dataset.a));startRoom(p)}

  function startRoom(p){const c=document.getElementById('pxRoom');if(!c)return;const g=c.getContext('2d');g.imageSmoothingEnabled=false;walker={x:158,y:315,tx:158,ty:315,face:1,wait:20,step:0,p};c.onclick=e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)*320/r.width,y=(e.clientY-r.top)*430/r.height;for(const [key,h] of Object.entries(HIT)){if(Math.hypot(x-h.x,y-h.y)<=h.r){ritual(key);return}}if(Math.hypot(x-walker.x,y-walker.y)<45){state.mood=clamp((state.mood||0)+1);save();bubble('你点到我啦！💗');walker.wait=35}};const loop=()=>{updateWalker();drawRoom(g);raf=requestAnimationFrame(loop)};loop()}
  function updateWalker(){if(!walker)return;if(walker.wait>0){walker.wait--;return}const dx=walker.tx-walker.x,dy=walker.ty-walker.y,d=Math.hypot(dx,dy);if(d<3){walker.wait=25+Math.floor(Math.random()*80);walker.tx=55+Math.random()*200;walker.ty=250+Math.random()*120;return}walker.face=dx<0?-1:1;walker.x+=dx/d*.7;walker.y+=dy/d*.55;walker.step+=.15}

  function ritual(a){counters();if(a==='incense'){if(state.daily.incense>=3)return bubble('今天已经烧过三次香啦～');state.daily.incense++;state.merit=(state.merit||0)+5;save();renderRoom('🕯️ 香火已上｜功德 +5｜愿今晚手气白一点～');return}if(a==='wood'){state.merit=(state.merit||0)+1;save();renderRoom('🪵 咚——功德 +1');return}if(a==='beads'){if(state.daily.beads>=5)return bubble('今天佛珠已经摸够五次啦～');state.daily.beads++;state.merit=(state.merit||0)+2;const lines=['📿 愿今天少一点谢谢参与。','📿 愿小耳朵都来点歌。','📿 愿今晚手气顺一点。','📿 愿谜屿开口就是好听的一首。','📿 临海居今日平安喜乐。'];save();renderRoom(lines[(state.daily.beads-1)%lines.length]+'｜功德 +2');return}if(a==='pray'){if((state.merit||0)<10)return bubble('功德不足 10，先敲几下木鱼吧～');if(state.daily.pray>=3)return bubble('今天已经祈福三次啦～');state.daily.pray++;state.merit-=10;const f=['🌟 上上签｜今天可以期待一下','✨ 小吉｜保持期待，随缘出手','🍀 偏白｜宠物说今天有点欧','🌊 随缘｜先听歌再抽','🐾 宠物加持｜摸摸它再试'][Math.floor(Math.random()*5)];save();renderRoom('✨ '+f+'（娱乐彩蛋，不影响真实抽奖概率）')}}

  function drawRoom(g){g.clearRect(0,0,320,430);g.fillStyle='#f2e4ce';g.fillRect(0,0,320,145);for(let y=145;y<430;y+=24){for(let x=0;x<320;x+=40){g.fillStyle=((x/40+y/24)%2)?'#bd8d64':'#c99a6d';g.fillRect(x,y,40,24);g.fillStyle='#a77a58';g.fillRect(x,y,40,2)}}g.fillStyle='#8a5a43';g.fillRect(0,138,320,8);
    // 窗户
    g.fillStyle='#8fc7d7';g.fillRect(24,28,94,66);g.fillStyle='#f7fbff';g.fillRect(30,34,82,54);g.fillStyle='#9ed0df';g.fillRect(68,34,4,54);g.fillRect(30,59,82,4);
    // 香案 / 香炉
    g.fillStyle='#75442f';g.fillRect(220,202,62,10);g.fillRect(226,212,6,38);g.fillRect(270,212,6,38);g.fillStyle='#c7964f';g.fillRect(239,181,24,12);g.fillStyle='#9d392c';g.fillRect(246,158,3,24);g.fillRect(253,160,3,22);g.fillStyle='#e7ddd0';g.fillRect(245,148,4,8);g.fillRect(253,151,4,7);
    // 木鱼
    g.fillStyle='#6f452c';g.fillRect(60,236,42,25);g.fillStyle='#8e5b36';g.fillRect(64,231,34,12);g.fillStyle='#4b2f20';g.fillRect(90,220,5,26);g.fillRect(93,219,20,4);
    // 佛珠
    for(let i=0;i<9;i++){const a=i/9*Math.PI*2;g.fillStyle='#7d4b2f';g.fillRect(244+Math.cos(a)*18,294+Math.sin(a)*14,6,6)}g.fillStyle='#d6aa52';g.fillRect(247,304,5,13);
    // 祈福台
    g.fillStyle='#b9844e';g.fillRect(48,345,54,34);g.fillStyle='#f4d98a';g.fillRect(55,350,40,23);g.fillStyle='#9b3d2f';g.fillRect(72,328,6,18);g.fillStyle='#ffe5a3';g.fillRect(67,323,16,8);
    // 其他家具
    g.fillStyle='#d7e8ce';g.fillRect(30,284,48,28);g.fillStyle='#7c9b71';g.fillRect(27,311,54,7);g.fillStyle='#f1d8a5';g.fillRect(130,348,72,28);g.fillStyle='#9a704d';g.fillRect(136,376,7,26);g.fillRect(189,376,7,26);
    if(walker)drawPet(g,walker.p,walker.x,walker.y,1.45,walker.face<0,walker.step)}
  function rect(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
  function drawPet(g,p,cx,cy,s=1,flip=false,step=0){g.save();g.translate(cx,cy);g.scale(flip?-s:s,s);g.translate(0,Math.sin(step)*1.5);const B=p.body,A=p.accent,V=p.belly;rect(g,-18,-18,36,28,B);rect(g,-14,8,28,16,B);rect(g,-10,10,20,13,V);rect(g,-14,-13,28,19,V);rect(g,-9,-8,5,5,'#fff');rect(g,4,-8,5,5,'#fff');rect(g,-7,-6,3,3,'#263238');rect(g,6,-6,3,3,'#263238');rect(g,-2,0,4,3,A);rect(g,-13,22,8,5,A);rect(g,5,22,8,5,A);if(p.id==='cat'){rect(g,-17,-25,9,10,B);rect(g,8,-25,9,10,B);rect(g,14,10,15,5,B)}else if(p.id==='dog'){rect(g,-18,-24,8,14,A);rect(g,10,-24,8,14,A)}else if(p.id==='rabbit'){rect(g,-13,-38,8,20,B);rect(g,5,-38,8,20,B)}else if(p.id==='seal'){rect(g,-20,14,8,8,B);rect(g,12,14,8,8,B)}else if(p.id==='whale'){rect(g,-20,-6,40,22,B);rect(g,-26,-2,8,8,B);rect(g,18,-2,8,8,B)}else if(p.id==='otter'){rect(g,-16,-24,8,8,B);rect(g,8,-24,8,8,B)}g.restore()}

  function act(a){const p=info();counters();if(a==='feed'){if((state.food||0)<1)return bubble('食物吃完啦，明天再来领吧～');state.food--;state.hunger=clamp((state.hunger||0)+18);state.bond=clamp((state.bond||0)+2);save();renderRoom(`好吃！${p.food}最好吃了！`)}else if(a==='pet'){if(state.daily.pet>=3)return bubble('今天已经摸够三次啦～');state.daily.pet++;state.bond=clamp(state.bond+3);save();renderRoom('嘿嘿，摸摸很舒服。')}else if(a==='play'){if(state.daily.play>=3)return bubble('今天玩累啦～');state.daily.play++;state.mood=clamp(state.mood+12);state.bond=clamp(state.bond+4);save();renderRoom('玩得超开心！')}else if(a==='talk'){if(state.daily.talk>=5)return bubble('今天聊很多啦～');state.daily.talk++;state.bond=clamp(state.bond+1);save();renderRoom(['今天也想听谜屿唱歌。','临海居今天很舒服～','你回来我就很开心。','等下还要陪我玩喔。','今天公屏会不会很热闹？'][(state.daily.talk-1)%5])}else if(a==='rename'){const n=prompt('宠物的新名字：',state.name||p.name);if(n&&n.trim()){state.name=n.trim().slice(0,12);save();renderRoom('新名字我记住啦！')}}else if(a==='reset'){if(confirm('要重新选择宠物吗？目前进度会重新开始。')){state=fresh();save();cancelAnimationFrame(raf);renderAdopt()}}}

  if(state.petId)renderRoom();else renderAdopt();
  if(new URLSearchParams(location.search).get('tool')==='petGame')show();
})();