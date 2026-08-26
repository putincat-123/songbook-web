(() => {
  const nav = document.querySelector('.tabs');
  const app = document.querySelector('.app');
  if (!nav || !app || document.getElementById('petGame')) return;

  const PETS = [
    {id:'otter', emoji:'🦦', name:'小海獭', food:'小鱼干', hello:'我会抱着小鱼等你回来～'},
    {id:'cat', emoji:'🐱', name:'小猫', food:'猫罐头', hello:'今天也要摸摸我！'},
    {id:'dog', emoji:'🐶', name:'小狗', food:'肉骨头', hello:'你来啦！一起玩吧！'},
    {id:'seal', emoji:'🦭', name:'小海豹', food:'小鱼', hello:'拍拍肚皮，今天也很开心～'},
    {id:'rabbit', emoji:'🐰', name:'小兔', food:'胡萝卜', hello:'我有乖乖等你回来。'},
    {id:'whale', emoji:'🐳', name:'小鲸鱼', food:'海盐糖', hello:'今天也一起听歌吧～'}
  ];
  const STORE_KEY = 'miyu_pet_v1';
  const todayKey = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const clamp = n => Math.max(0, Math.min(100, n));
  const defaultState = () => ({petId:'',name:'',food:0,hunger:70,mood:70,bond:0,lastDaily:'',streak:0,daily:{date:'',pet:0,play:0,talk:0}});
  let state = defaultState();

  const load = () => {
    try { state = Object.assign(defaultState(), JSON.parse(localStorage.getItem(STORE_KEY)||'{}')); } catch { state = defaultState(); }
    if (!state.daily || typeof state.daily!=='object') state.daily={date:'',pet:0,play:0,talk:0};
  };
  const save = () => localStorage.setItem(STORE_KEY, JSON.stringify(state));
  const petInfo = () => PETS.find(p=>p.id===state.petId) || PETS[0];

  const style = document.createElement('style');
  style.textContent = `
    .pet-wrap{max-width:760px;margin:18px auto}.pet-card{background:linear-gradient(145deg,#eff6ff,#fff 55%,#ecfeff);border:1px solid #bfdbfe;border-radius:24px;box-shadow:var(--shadow);padding:18px}.pet-title-row{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}.pet-home{margin-top:14px;border:1px solid #bae6fd;border-radius:24px;background:linear-gradient(#dff4ff,#f0fdfa 62%,#ecfccb);padding:22px;text-align:center;min-height:300px;position:relative;overflow:hidden}.pet-home:before{content:'☁️   ☁️';position:absolute;top:20px;left:0;right:0;font-size:26px;opacity:.7;letter-spacing:60px}.pet-avatar{font-size:94px;line-height:1.15;position:relative;z-index:1;filter:drop-shadow(0 8px 10px rgba(15,23,42,.12));animation:petFloat 3s ease-in-out infinite}.pet-name{margin-top:6px;font-size:26px;font-weight:950}.pet-speech{display:inline-block;margin-top:10px;padding:9px 13px;background:#fff;border:1px solid #dbeafe;border-radius:16px;font-size:13px;font-weight:800;max-width:90%;line-height:1.5}.pet-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}.pet-stat{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:10px}.pet-stat-label{font-size:11px;color:#64748b;font-weight:800}.pet-stat-value{font-size:18px;font-weight:950;margin-top:4px}.pet-bar{height:7px;background:#e2e8f0;border-radius:999px;overflow:hidden;margin-top:7px}.pet-bar>span{display:block;height:100%;background:linear-gradient(90deg,#60a5fa,#22c55e);border-radius:999px}.pet-inventory{display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;margin-top:12px;font-size:13px;font-weight:900}.pet-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:14px}.pet-action{border:1px solid #cbd5e1;background:#fff;border-radius:16px;padding:12px 8px;font-size:14px;font-weight:900;cursor:pointer}.pet-action:disabled{opacity:.45;cursor:not-allowed}.pet-action.primary{background:#2563eb;color:#fff;border-color:#2563eb}.pet-manage{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px}.pet-small{border:1px solid #dbeafe;background:#fff;color:#334155;border-radius:999px;padding:8px 11px;font-size:12px;font-weight:900}.pet-adopt-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}.pet-choice{border:2px solid #e2e8f0;background:#fff;border-radius:18px;padding:15px 10px;text-align:center;cursor:pointer}.pet-choice.selected{border-color:#2563eb;background:#eff6ff}.pet-choice-emoji{font-size:52px}.pet-choice-name{font-weight:950;margin-top:5px}.pet-name-input{width:100%;margin-top:14px;border:1px solid #cbd5e1;border-radius:14px;padding:12px 13px;font-size:16px}.pet-adopt-btn{width:100%;margin-top:10px;border:0;background:#2563eb;color:#fff;border-radius:14px;padding:12px;font-weight:950;font-size:15px}.pet-note{margin-top:10px;color:#64748b;font-size:12px;line-height:1.5;text-align:center}@keyframes petFloat{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-7px) rotate(1deg)}}@media(max-width:680px){.pet-adopt-grid{grid-template-columns:repeat(2,1fr)}.pet-actions{grid-template-columns:repeat(2,1fr)}.pet-stats{grid-template-columns:1fr}.pet-avatar{font-size:82px}}
  `;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.className = 'tab-btn';
  btn.dataset.tab = 'petGame';
  btn.textContent = '🐾 宠物';
  const calcBtn = nav.querySelector('[data-tab="calculator"]');
  const dataBtn = nav.querySelector('[data-tab="data"]');
  if (calcBtn) nav.insertBefore(btn, calcBtn); else if (dataBtn) nav.insertBefore(btn, dataBtn); else nav.appendChild(btn);

  const panel = document.createElement('section');
  panel.id = 'petGame';
  panel.className = 'panel';
  panel.innerHTML = '<div class="pet-wrap"></div>';
  app.appendChild(panel);
  const root = panel.querySelector('.pet-wrap');

  function ensureDaily(){
    if(!state.petId) return false;
    const today=todayKey();
    if(state.lastDaily===today) return false;
    const yesterday=new Date(); yesterday.setDate(yesterday.getDate()-1);
    const y=`${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;
    state.streak = state.lastDaily===y ? (state.streak||0)+1 : 1;
    state.lastDaily=today;
    state.food=(state.food||0)+3;
    state.daily={date:today,pet:0,play:0,talk:0};
    state.hunger=clamp((state.hunger||0)-5);
    state.mood=clamp((state.mood||0)-3);
    save();
    return true;
  }
  function ensureDailyCounters(){ const t=todayKey(); if(state.daily.date!==t){state.daily={date:t,pet:0,play:0,talk:0};save();} }
  function setSpeech(msg){ const el=panel.querySelector('#petSpeech'); if(el) el.textContent=msg; }
  function animatePet(){ const el=panel.querySelector('.pet-avatar'); if(!el)return; el.animate([{transform:'scale(1)'},{transform:'scale(1.16) rotate(4deg)'},{transform:'scale(1)'}],{duration:420}); }
  function statHtml(label,value){return `<div class="pet-stat"><div class="pet-stat-label">${label}</div><div class="pet-stat-value">${value}</div><div class="pet-bar"><span style="width:${clamp(value)}%"></span></div></div>`;}

  function renderAdopt(){
    let selected='otter';
    root.innerHTML=`<div class="pet-card"><div class="pet-title-row"><div><h2 style="margin:0">🐾 领养一只宠物</h2><div class="hint">选一个喜欢的小伙伴，帮它取名字吧。</div></div></div><div class="pet-adopt-grid">${PETS.map(p=>`<button class="pet-choice ${p.id==='otter'?'selected':''}" data-pet-choice="${p.id}" type="button"><div class="pet-choice-emoji">${p.emoji}</div><div class="pet-choice-name">${p.name}</div><div class="hint">爱吃${p.food}</div></button>`).join('')}</div><input class="pet-name-input" id="petNameInput" maxlength="12" placeholder="给宠物取个名字" /><button class="pet-adopt-btn" id="petAdoptBtn">确认领养</button><div class="pet-note">宠物会保存在当前浏览器里；名字之后还可以修改。</div></div>`;
    root.querySelectorAll('[data-pet-choice]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.petChoice;root.querySelectorAll('[data-pet-choice]').forEach(x=>x.classList.toggle('selected',x===b));}));
    root.querySelector('#petAdoptBtn').addEventListener('click',()=>{const p=PETS.find(x=>x.id===selected)||PETS[0];const name=root.querySelector('#petNameInput').value.trim()||p.name;state={...defaultState(),petId:p.id,name,food:3,hunger:75,mood:80,bond:5,lastDaily:todayKey(),streak:1,daily:{date:todayKey(),pet:0,play:0,talk:0}};save();renderRoom('领养成功！今天先送你 3 份食物 🎁');});
  }

  function renderRoom(firstMsg=''){
    ensureDailyCounters();
    const gotDaily=ensureDaily();
    const p=petInfo();
    const speech=firstMsg || (gotDaily?`你今天来看我啦！签到获得 ${p.food} ×3 🎁`:p.hello);
    root.innerHTML=`<div class="pet-card"><div class="pet-title-row"><div><h2 style="margin:0">🐾 我的宠物</h2><div class="hint">每天回来看看它，喂食、摸摸、陪玩，慢慢增加亲密度。</div></div><div class="hint">连续来访 ${state.streak||1} 天</div></div><div class="pet-home"><div class="pet-avatar">${p.emoji}</div><div class="pet-name">${escapeHtml(state.name||p.name)}</div><div class="pet-speech" id="petSpeech">${escapeHtml(speech)}</div><div class="pet-inventory">🍽️ ${p.food}：<span id="petFoodCount">${state.food||0}</span> 份</div></div><div class="pet-stats">${statHtml('🍚 饱食',state.hunger||0)}${statHtml('😊 心情',state.mood||0)}${statHtml('💗 亲密度',state.bond||0)}</div><div class="pet-actions"><button class="pet-action primary" data-action="feed">🍖 喂食</button><button class="pet-action" data-action="pet">🤚 摸摸 <small>(${state.daily.pet}/3)</small></button><button class="pet-action" data-action="play">🎾 陪玩 <small>(${state.daily.play}/3)</small></button><button class="pet-action" data-action="talk">💬 说话 <small>(${state.daily.talk}/5)</small></button></div><div class="pet-manage"><button class="pet-small" data-action="rename">✏️ 改名字</button><button class="pet-small" data-action="reset">🔄 重新领养</button></div><div class="pet-note">每天第一次打开会获得 3 份食物。摸摸与陪玩每天各 3 次，说话每天 5 次。</div></div>`;
    root.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>act(b.dataset.action)));
  }
  function escapeHtml(v){return String(v||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
  function act(action){
    const p=petInfo(); ensureDailyCounters();
    if(action==='feed'){
      if((state.food||0)<=0){setSpeech('今天的食物吃完啦，明天再来看看我～');return;}
      if((state.hunger||0)>=100){setSpeech('已经吃得圆滚滚啦！');return;}
      state.food--; state.hunger=clamp(state.hunger+18); state.mood=clamp(state.mood+3); state.bond=clamp(state.bond+2); save(); animatePet(); renderRoom(`好吃！${p.food}最好吃了 😋`); return;
    }
    if(action==='pet'){
      if(state.daily.pet>=3){setSpeech('今天已经被摸得很满足啦～');return;}
      state.daily.pet++; state.mood=clamp(state.mood+8); state.bond=clamp(state.bond+3); save(); animatePet(); renderRoom('嘿嘿，再摸一下也可以！'); return;
    }
    if(action==='play'){
      if(state.daily.play>=3){setSpeech('玩累啦，明天再一起玩！');return;}
      state.daily.play++; state.mood=clamp(state.mood+12); state.hunger=clamp(state.hunger-4); state.bond=clamp(state.bond+4); save(); animatePet(); renderRoom('今天玩得超开心！🎾'); return;
    }
    if(action==='talk'){
      if(state.daily.talk>=5){setSpeech('今天聊好多啦，陪我安静听会儿歌吧～');return;}
      const lines=['谜屿唱歌的时候，我也有认真听喔。','今天公屏会不会很热闹呀？','你每天回来，我就会越来越喜欢你。','临海居今天也是舒服的一天～','再陪我待一下嘛。'];
      state.daily.talk++; state.mood=clamp(state.mood+4); state.bond=clamp(state.bond+1); save(); renderRoom(lines[(state.daily.talk-1)%lines.length]); return;
    }
    if(action==='rename'){
      const next=prompt('想把宠物改成什么名字？',state.name||p.name); if(next&&next.trim()){state.name=next.trim().slice(0,12);save();renderRoom('新名字我很喜欢！');} return;
    }
    if(action==='reset'){
      if(confirm('要重新领养宠物吗？目前的亲密度和库存会重新开始。')){localStorage.removeItem(STORE_KEY);state=defaultState();renderAdopt();} return;
    }
  }

  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab-btn').forEach(x=>x.classList.toggle('active',x===btn));
    document.querySelectorAll('.panel').forEach(x=>x.classList.toggle('active',x===panel));
    const u=new URL(location.href);u.searchParams.set('streamer',new URLSearchParams(location.search).get('streamer')||'miyu');u.searchParams.set('tool','petGame');history.replaceState({},'',u);
    load(); state.petId?renderRoom():renderAdopt();
  });
  nav.addEventListener('click',e=>{const target=e.target.closest('.tab-btn');if(target&&target!==btn){btn.classList.remove('active');panel.classList.remove('active');}});

  load();
  if(new URLSearchParams(location.search).get('tool')==='petGame') btn.click();
})();
