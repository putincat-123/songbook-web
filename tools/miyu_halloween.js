(() => {
'use strict';
const KEY='miyu.halloween.v1', $=id=>document.getElementById(id);
const clone=x=>JSON.parse(JSON.stringify(x));
const TYPES={song:'🎵 主題歌曲',voice:'🎙 專屬頭像音',title:'✉ 粉絲群頭銜'};
const PLATFORMS={original:'原平台',douyin:'抖音'};
const currentPlatform=()=>state.platform||'original';
const recordPlatform=r=>r.platform||'original';
const typeLabel=(type,platform)=>platform==='douyin'?({song:TYPES.song,voice:'🎙 專屬語音互動',title:'✉ 萬聖節角色命名'}[type]):TYPES[type];
function platformCard(card,platform){
 const out=clone(card);
 if(platform==='douyin'){
  if(out.type==='voice')out.title=out.title.replaceAll('專屬頭像音','專屬語音互動').replaceAll('頭像音','語音互動');
  if(out.type==='title'){
   out.title=out.title.replaceAll('粉絲群頭銜','萬聖節角色命名').replaceAll('群頭銜','角色命名');
   if(out.detail==='由主播為這位小耳朵命名')out.detail='主播現場為這位粉絲取一個萬聖節角色稱號，再用一句話介紹他。';
  }
 }
 return out;
}
const fresh=()=>({version:1,platform:'original',pools:clone(HALLOWEEN_DEFAULTS),records:[]});
function valid(s){
 if(!s||s.version!==1||!Array.isArray(s.pools)||s.pools.length!==6||!Array.isArray(s.records)||s.records.length>60)return false;
 if(s.platform!==undefined&&!['original','douyin'].includes(s.platform))return false;
 const ids=new Set();
 for(let i=0;i<6;i++){
  const p=s.pools[i],d=HALLOWEEN_DEFAULTS[i];
  if(p.id!==d.id||!Array.isArray(p.cards)||p.cards.length!==10)return false;
  for(let j=0;j<10;j++){const c=p.cards[j];if(c.id!==d.cards[j].id||c.type!==d.cards[j].type||typeof c.title!=='string'||!c.title.trim()||c.title.length>160||typeof c.detail!=='string'||c.detail.length>1000)return false;ids.add(c.id);}
 }
 const used=new Set();
 for(const r of s.records){if(!r||!ids.has(r.cardId)||used.has(r.cardId)||typeof r.fan!=='string'||r.fan.length>40||!TYPES[r.type]||typeof r.title!=='string'||typeof r.detail!=='string'||typeof r.note!=='string'||typeof r.done!=='boolean'||!Number.isFinite(Date.parse(r.at)))return false;
 if(r.platform!==undefined&&!['original','douyin'].includes(r.platform))return false;
 const p=s.pools.find(p=>p.id===r.poolId);if(!p||!p.cards.some(c=>c.id===r.cardId&&c.type===r.type))return false;used.add(r.cardId);}
 return true;
}
let state=fresh(),broken=false,busy=false,editorDirty=false,activeId=null;
function notice(t){$('notice').textContent=t;}
try{const raw=localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);if(!valid(parsed))throw Error('invalid');state=parsed;}}catch{broken=true;notice('本機紀錄無法讀取，已暫停抽籤以免重複。可載入有效備份，或按「開始新一場」。');}
function save(next){try{localStorage.setItem(KEY,JSON.stringify(next));state=next;return true;}catch{notice('無法儲存紀錄，本次操作未生效。請檢查瀏覽器儲存空間或隱私設定。');return false;}}
function node(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function remaining(pool){const used=new Set(state.records.map(r=>r.cardId));return pool.cards.filter(c=>!used.has(c.id));}
function randomIndex(n){const limit=4294967296-(4294967296%n);let v;do{v=crypto.getRandomValues(new Uint32Array(1))[0];}while(v>=limit);return v%n;}
function renderPlatform(){
 const mode=currentPlatform(),douyin=mode==='douyin';
 for(const [id,value] of [['platformOriginal','original'],['platformDouyin','douyin']]){
  $(id).classList.toggle('selected',mode===value);$(id).setAttribute('aria-pressed',String(mode===value));$(id).disabled=busy;
 }
 $('benefits').replaceChildren(...['🎵 主題歌曲',typeLabel('voice',mode),typeLabel('title',mode)].map(t=>node('span','',t)));
 $('rule').textContent=douyin?'抖音版 · 5 首歌曲＋3 段現場專屬語音＋2 個角色命名 · 直接點道具抽籤':'原平台版 · 5 首歌曲＋3 段頭像音＋2 個群頭銜 · 直接點道具抽籤';
 $('deliveryInfo').textContent=(douyin?'歌曲完整演唱；語音現場代入暱稱念出；角色稱號由主播現場命名。':'歌曲完整演唱；頭像音直播後錄送；群頭銜由主播命名。')+' 兩平台共用抽籤池，切換不重置。紀錄只保存在此瀏覽器。';
}
function renderProps(){
 $('props').replaceChildren();
 for(const p of state.pools){const d=HALLOWEEN_DEFAULTS.find(d=>d.id===p.id),left=remaining(p).length,b=node('button','prop');b.type='button';b.style.setProperty('--tint',d.color);b.disabled=busy||broken||!left;b.setAttribute('aria-label',`${d.name}，剩餘${left}張，點選抽籤`);b.append(node('span','icon',d.icon),node('strong','',d.name),node('small','',d.mood),node('span','left',left?`剩餘 ${left} / 10 · 點我抽籤`:'本場已領完'));b.addEventListener('click',()=>draw(p.id));$('props').append(b);}
 $('count').textContent=`${state.records.length} / 60`;$('undo').disabled=busy||!state.records.length;
 for(const id of ['reset','import','saveCards','defaultCards'])$(id).disabled=busy;
}
function recordLabel(r){return r.fan||`第 ${state.records.findIndex(x=>x.cardId===r.cardId)+1} 抽`;}
function result(r){
 const d=HALLOWEEN_DEFAULTS.find(p=>p.id===r.poolId);activeId=r.cardId;
 $('resultIcon').textContent=d.icon;$('resultMeta').textContent=`${d.name} · ${PLATFORMS[recordPlatform(r)]} · ${recordLabel(r)} · ${typeLabel(r.type,recordPlatform(r))}`;
 $('resultTitle').textContent=r.type==='song'?`《${r.title}》`:r.title;
 $('resultBody').textContent=r.detail;
 $('resultHint').textContent=r.type==='song'?'':recordPlatform(r)==='douyin'?(r.type==='voice'?'現場將【名字】換成粉絲暱稱，念給這位粉絲聽':'主播現場取稱號，再用一句話介紹這位粉絲'):(r.type==='voice'?'直播後錄送 · 錄製時將【名字】換成小耳朵的暱稱':'由主播命名 · 可在下方紀錄填入頭銜');
 $('resultActions').hidden=false;$('finish').textContent=r.done?'已完成 ✓':'標記已完成';$('finish').disabled=r.done;
}
function renderHistory(){
 $('history').replaceChildren();
 if(!state.records.length)$('history').append(node('div','empty','今晚還沒有抽籤紀錄。第一份驚喜會屬於誰？'));
 for(const r of [...state.records].reverse()){
 const d=HALLOWEEN_DEFAULTS.find(p=>p.id===r.poolId),a=node('article'),head=node('div','record-head'),b=node('button',r.done?'done':'',r.done?'已完成 ✓':'標記完成');b.type='button';b.disabled=busy;b.addEventListener('click',()=>toggleDone(r.cardId));head.append(node('strong','',`${d.icon} ${recordLabel(r)} · ${r.title}`),b);
 a.append(head,node('div','record-meta',`${new Date(r.at).toLocaleString('zh-TW',{timeZone:'Asia/Taipei'})} · ${d.name} · ${PLATFORMS[recordPlatform(r)]} · ${typeLabel(r.type,recordPlatform(r))}`),node('div','record-body',r.detail));
 const input=node('input','note');input.value=r.note;input.maxLength=300;input.placeholder=r.type==='title'?(recordPlatform(r)==='douyin'?'填入主播取的角色稱號':'填入主播決定的群頭銜'):(recordPlatform(r)==='douyin'?'完成備註（例如：已現場互動）':'交付備註（例如：語音已私訊）');input.setAttribute('aria-label',`${recordLabel(r)}的${r.type==='title'?'頭銜／角色稱號':'交付備註'}`);input.disabled=busy;input.addEventListener('change',()=>{const next=clone(state);next.records.find(x=>x.cardId===r.cardId).note=input.value;if(!save(next))input.value=r.note;});a.append(input);$('history').append(a);
 }
}
function render(){renderPlatform();renderProps();renderHistory();}
function clearResult(){activeId=null;$('resultIcon').textContent='✦';$('resultMeta').textContent='PICK A LITTLE MAGIC';$('resultTitle').textContent='選一件道具，揭曉今晚的驚喜';$('resultBody').textContent='直接點選喜歡的道具，就能抽籤。抽過的卡片，本場不會再出現。';$('resultHint').textContent='';$('resultActions').hidden=true;}
async function draw(poolId){
 if(busy||broken)return;
 // Refuse a stale tab before drawing from a shared local pool.
 try{const raw=localStorage.getItem(KEY);if(raw){const latest=JSON.parse(raw);if(!valid(latest))throw Error();state=latest;}}catch{notice('無法讀取最新紀錄，請先備份並重新整理。');return;}
 if(editorDirty){notice('卡片有尚未儲存的修改，請先到主播設定儲存。');return;}
 const pool=state.pools.find(p=>p.id===poolId),cards=remaining(pool);if(!cards.length){notice('這件道具本場已領完，請選其他道具。');render();return;}
 const card=platformCard(cards[randomIndex(cards.length)],currentPlatform()),r={cardId:card.id,poolId,platform:currentPlatform(),fan:'',type:card.type,title:card.title,detail:card.detail,at:new Date().toISOString(),done:false,note:''};
 const next=clone(state);next.records.push(r);if(!save(next))return;
 busy=true;notice('');render();$('reveal').classList.add('drawing');$('resultActions').hidden=true;$('resultIcon').textContent=HALLOWEEN_DEFAULTS.find(p=>p.id===poolId).icon;$('resultMeta').textContent=`第 ${state.records.length} 抽 · 神秘禮物`;$('resultTitle').textContent='正在揭曉…';$('resultBody').textContent='';$('resultHint').textContent='';
 await new Promise(resolve=>setTimeout(resolve,matchMedia('(prefers-reduced-motion: reduce)').matches?0:850));
 busy=false;$('reveal').classList.remove('drawing');result(r);render();$('reveal').scrollIntoView({behavior:'smooth',block:'center'});
}
function toggleDone(id){if(busy)return;const next=clone(state),r=next.records.find(x=>x.cardId===id);if(!r)return;r.done=!r.done;if(save(next)){renderHistory();if(activeId===id)result(r);}}
function renderEditor(){
 const root=$('editorFields');root.replaceChildren();
 state.pools.forEach(p=>{const d=HALLOWEEN_DEFAULTS.find(d=>d.id===p.id),f=node('fieldset');f.append(node('legend','',`${d.icon} ${d.name}`));p.cards.forEach((c,i)=>{const row=node('div','edit-card'),wrap=node('div'),used=state.records.some(r=>r.cardId===c.id);row.append(node('span','',String(i+1)));wrap.append(node('label','',`${TYPES[c.type]}${used?' · 本場已抽出':''}`));for(const field of ['title','detail']){const input=node(field==='detail'?'textarea':'input');input.value=c[field];input.dataset.card=c.id;input.dataset.field=field;input.maxLength=field==='title'?160:1000;input.disabled=used;input.setAttribute('aria-label',`${d.name}第${i+1}張${field==='title'?'名稱':'內容'}`);input.addEventListener('input',()=>editorDirty=true);wrap.append(input);}row.append(wrap);f.append(row);});root.append(f);});editorDirty=false;
}
$('saveCards').addEventListener('click',()=>{if(busy)return;const next=clone(state);$('editorFields').querySelectorAll('[data-card]').forEach(input=>{const c=next.pools.flatMap(p=>p.cards).find(c=>c.id===input.dataset.card);c[input.dataset.field]=input.value.trim();});if(!valid(next)){notice('每張卡片都需要名稱，請檢查空白欄位。');return;}if(save(next)){editorDirty=false;notice('卡片已儲存，下一抽使用新內容。');}});
$('editor').addEventListener('toggle',()=>{if($('editor').open&&!editorDirty)renderEditor();});
$('defaultCards').addEventListener('click',()=>{if(!confirm('還原尚未抽出卡片的預設文案？已抽紀錄會保留。'))return;const next=clone(state);for(const p of next.pools)for(let i=0;i<10;i++)if(!next.records.some(r=>r.cardId===p.cards[i].id))p.cards[i]=clone(HALLOWEEN_DEFAULTS.find(d=>d.id===p.id).cards[i]);if(save(next)){renderEditor();notice('已還原預設卡片。');}});
$('finish').addEventListener('click',()=>activeId&&toggleDone(activeId));
$('undo').addEventListener('click',()=>{if(busy||!state.records.length)return;const r=state.records.at(-1);if(!confirm(`撤回 ${recordLabel(r)} 的上一抽？卡片將放回抽籤池。`))return;const next=clone(state);next.records.pop();if(save(next)){clearResult();render();renderEditor();notice('已撤回上一抽。');}});
$('reset').addEventListener('click',()=>{if(busy||!confirm('開始新一場會清除本場紀錄，補滿60張卡。請先匯出或備份。確定繼續？'))return;const next=clone(state);next.records=[];if(save(next)){broken=false;editorDirty=false;clearResult();render();renderEditor();notice('新的一場開始了，60張卡已就位。');}});
async function copyText(text){try{await navigator.clipboard.writeText(text);notice('已複製。');}catch{const ta=node('textarea');ta.value=text;document.body.append(ta);ta.select();const ok=document.execCommand('copy');ta.remove();notice(ok?'已複製。':'複製失敗，請手動選取結果文字。');}}
$('copy').addEventListener('click',()=>{const r=state.records.find(r=>r.cardId===activeId);if(r)copyText(`${recordLabel(r)}｜${typeLabel(r.type,recordPlatform(r))}｜${r.title}\n${r.detail}`);});
function download(text,type,ext){const a=node('a'),url=URL.createObjectURL(new Blob([text],{type}));a.href=url;a.download=`miyu-halloween-${new Date().toISOString().slice(0,10)}.${ext}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('backup').addEventListener('click',()=>download(JSON.stringify(state,null,2),'application/json','json'));
$('csv').addEventListener('click',()=>{const cell=s=>'"'+String(s??'').replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';const rows=[['時間','參與者（如有）','道具','平台','類型','獎勵','內容','交付狀態','頭銜／備註'],...state.records.map(r=>[r.at,r.fan,HALLOWEEN_DEFAULTS.find(p=>p.id===r.poolId).name,PLATFORMS[recordPlatform(r)],typeLabel(r.type,recordPlatform(r)),r.title,r.detail,r.done?'已完成':'待完成',r.note])];download('\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n'),'text/csv;charset=utf-8','csv');});
$('import').addEventListener('click',()=>$('importFile').click());$('importFile').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error();const data=JSON.parse(await file.text());if(!valid(data))throw Error();if(confirm(`載入備份將取代目前資料（含卡片與紀錄），備份內有 ${data.records.length} 筆。確定載入？`)&&save(data)){broken=false;clearResult();render();renderEditor();if(state.records.length)result(state.records.at(-1));notice('備份已載入。');}}catch{notice('備份格式不正確，原有資料未變更。');}e.target.value='';});
function setPlatform(mode){
 if(busy||broken||mode===currentPlatform())return;
 if(editorDirty){notice('請先儲存卡片修改，再切換平台。');return;}
 const next=clone(state);next.platform=mode;
 if(save(next)){clearResult();render();notice(`已切換${PLATFORMS[mode]}；抽籤池與既有紀錄保留。`);}
}
$('platformOriginal').addEventListener('click',()=>setPlatform('original'));
$('platformDouyin').addEventListener('click',()=>setPlatform('douyin'));
function stage(on){document.body.classList.toggle('stage',on);$('stage').textContent=on?'一般模式':'舞台模式';}
$('stage').addEventListener('click',()=>stage(!document.body.classList.contains('stage')));$('exitStage').addEventListener('click',()=>stage(false));document.addEventListener('keydown',e=>{if(e.key==='Escape')stage(false);});
window.addEventListener('beforeunload',e=>{if(editorDirty){e.preventDefault();e.returnValue='';}});
window.addEventListener('storage',e=>{if(e.key!==KEY)return;if(busy){location.reload();return;}try{const s=JSON.parse(e.newValue);if(!valid(s))throw Error();state=s;clearResult();render();if(!editorDirty)renderEditor();notice('已同步此瀏覽器另一分頁的紀錄。');}catch{broken=true;render();notice('另一分頁的資料已變更，請重新整理或載入備份。');}});
render();if(state.records.length)result(state.records.at(-1));
})();
