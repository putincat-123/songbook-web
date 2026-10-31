(() => {
'use strict';
const KEY='miyu.halloween.songs.20261101', LEGACY_KEY='miyu.halloween.v1', $=id=>document.getElementById(id);
const clone=x=>JSON.parse(JSON.stringify(x));
const display=value=>String(value??'').replaceAll('藍','蓝').replaceAll('吳','吴');
const TYPES={song:'🎵 主题歌曲'};
const TOTAL=HALLOWEEN_DEFAULTS.reduce((n,p)=>n+p.cards.length,0);
const fresh=()=>({version:2,pools:clone(HALLOWEEN_DEFAULTS),records:[]});
function valid(s){
 if(!s||s.version!==2||!Array.isArray(s.pools)||s.pools.length!==6||!Array.isArray(s.records)||s.records.length>TOTAL)return false;
 const ids=new Set();
 for(let i=0;i<6;i++){
  const p=s.pools[i],d=HALLOWEEN_DEFAULTS[i];
  if(p.id!==d.id||!Array.isArray(p.cards)||p.cards.length!==d.cards.length)return false;
  for(let j=0;j<d.cards.length;j++){const c=p.cards[j];if(c.id!==d.cards[j].id||c.type!==d.cards[j].type||typeof c.title!=='string'||!c.title.trim()||c.title.length>160||typeof c.detail!=='string'||c.detail.length>1000)return false;ids.add(c.id);}
 }
 const used=new Set();
 for(const r of s.records){if(!r||!ids.has(r.cardId)||used.has(r.cardId)||typeof r.fan!=='string'||r.fan.length>40||!TYPES[r.type]||typeof r.title!=='string'||typeof r.detail!=='string'||typeof r.note!=='string'||typeof r.done!=='boolean'||!Number.isFinite(Date.parse(r.at)))return false;
 const p=s.pools.find(p=>p.id===r.poolId);if(!p||!p.cards.some(c=>c.id===r.cardId&&c.type===r.type))return false;used.add(r.cardId);}
 return true;
}
let state=fresh(),broken=false,busy=false,editorDirty=false,activeId=null;
function notice(t){$('notice').textContent=t;}
try{const raw=localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);if(!valid(parsed))throw Error('invalid');state=parsed;}}catch{broken=true;notice('本机记录无法读取，已暂停抽签以免重复。可加载有效备份，或按「开始新一场」。');}
function save(next){try{localStorage.setItem(KEY,JSON.stringify(next));state=next;return true;}catch{notice('无法保存记录，本次操作未生效。请检查浏览器保存空间或隐私设置。');return false;}}
function node(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=display(text);return e;}
function remaining(pool){const used=new Set(state.records.map(r=>r.cardId));return pool.cards.filter(c=>!used.has(c.id));}
function randomIndex(n){const limit=4294967296-(4294967296%n);let v;do{v=crypto.getRandomValues(new Uint32Array(1))[0];}while(v>=limit);return v%n;}
function renderProps(){
 $('props').replaceChildren();
 for(const p of state.pools){const d=HALLOWEEN_DEFAULTS.find(d=>d.id===p.id),left=remaining(p).length,b=node('button','prop');b.type='button';b.style.setProperty('--tint',d.color);b.disabled=busy||broken||!left;b.setAttribute('aria-label',`${d.name}，剩余${left}张，点选抽签`);b.append(node('span','icon',d.icon),node('strong','',d.name),node('small','',d.mood),node('span','left',left?`剩余 ${left} / ${p.cards.length} · 点我抽签`:'本场已领完'));b.addEventListener('click',()=>draw(p.id));$('props').append(b);}
 $('count').textContent=`${state.records.length} / ${TOTAL}`;$('undo').disabled=busy||!state.records.length;
 for(const id of ['reset','import','saveCards','defaultCards'])$(id).disabled=busy;
}
function recordLabel(r){return r.fan||`第 ${state.records.findIndex(x=>x.cardId===r.cardId)+1} 抽`;}
function result(r){
 const d=HALLOWEEN_DEFAULTS.find(p=>p.id===r.poolId);activeId=r.cardId;
 $('resultIcon').textContent=d.icon;$('resultMeta').textContent=`${d.name} · ${recordLabel(r)} · ${TYPES[r.type]}`;
 $('resultTitle').textContent=`《${r.title}》`;
 $('resultBody').textContent=display(r.detail);
 $('resultHint').textContent='';
 $('resultActions').hidden=false;$('finish').textContent=r.done?'已完成 ✓':'标记已完成';$('finish').disabled=r.done;
}
function renderHistory(){
 $('history').replaceChildren();
 if(!state.records.length)$('history').append(node('div','empty','今晚还没有抽签记录。第一份惊喜会属于谁？'));
 for(const r of [...state.records].reverse()){
 const d=HALLOWEEN_DEFAULTS.find(p=>p.id===r.poolId),a=node('article'),head=node('div','record-head'),b=node('button',r.done?'done':'',r.done?'已完成 ✓':'标记完成');b.type='button';b.disabled=busy;b.addEventListener('click',()=>toggleDone(r.cardId));head.append(node('strong','',`${d.icon} ${recordLabel(r)} · ${r.title}`),b);
 a.append(head,node('div','record-meta',`${new Date(r.at).toLocaleString('zh-CN',{timeZone:'Asia/Taipei'})} · ${d.name} · ${TYPES[r.type]}`),node('div','record-body',r.detail));
 const input=node('input','note');input.value=r.note;input.maxLength=300;input.placeholder='备注（例如：点歌粉丝昵称）';input.setAttribute('aria-label',`${recordLabel(r)}的备注`);input.disabled=busy;input.addEventListener('change',()=>{const next=clone(state);next.records.find(x=>x.cardId===r.cardId).note=input.value;if(!save(next))input.value=r.note;});a.append(input);$('history').append(a);
 }
}
function render(){renderProps();renderHistory();}
function clearResult(){activeId=null;$('resultIcon').textContent='✦';$('resultMeta').textContent='PICK A LITTLE MAGIC';$('resultTitle').textContent='选一件道具，揭晓今晚的惊喜';$('resultBody').textContent='直接点选喜欢的道具，就能抽签。抽过的卡片，本场不会再出现。';$('resultHint').textContent='';$('resultActions').hidden=true;}
async function draw(poolId){
 if(busy||broken)return;
 // Refuse a stale tab before drawing from a shared local pool.
 try{const raw=localStorage.getItem(KEY);if(raw){const latest=JSON.parse(raw);if(!valid(latest))throw Error();state=latest;}}catch{notice('无法读取最新记录，请先备份并刷新页面。');return;}
 if(editorDirty){notice('卡片有尚未保存的修改，请先到主播设置保存。');return;}
 const pool=state.pools.find(p=>p.id===poolId),cards=remaining(pool);if(!cards.length){notice('这件道具本场已领完，请选其他道具。');render();return;}
 const card=cards[randomIndex(cards.length)],r={cardId:card.id,poolId,fan:'',type:card.type,title:card.title,detail:card.detail,at:new Date().toISOString(),done:false,note:''};
 const next=clone(state);next.records.push(r);if(!save(next))return;
 busy=true;notice('');render();$('reveal').classList.add('drawing');$('resultActions').hidden=true;$('resultIcon').textContent=HALLOWEEN_DEFAULTS.find(p=>p.id===poolId).icon;$('resultMeta').textContent=`第 ${state.records.length} 抽 · 神秘礼物`;$('resultTitle').textContent='正在揭晓…';$('resultBody').textContent='';$('resultHint').textContent='';
 await new Promise(resolve=>setTimeout(resolve,matchMedia('(prefers-reduced-motion: reduce)').matches?0:850));
 busy=false;$('reveal').classList.remove('drawing');result(r);render();$('reveal').scrollIntoView({behavior:'smooth',block:'center'});
}
function toggleDone(id){if(busy)return;const next=clone(state),r=next.records.find(x=>x.cardId===id);if(!r)return;r.done=!r.done;if(save(next)){renderHistory();if(activeId===id)result(r);}}
function renderEditor(){
 const root=$('editorFields');root.replaceChildren();
 state.pools.forEach(p=>{const d=HALLOWEEN_DEFAULTS.find(d=>d.id===p.id),f=node('fieldset');f.append(node('legend','',`${d.icon} ${d.name}`));p.cards.forEach((c,i)=>{const row=node('div','edit-card'),wrap=node('div'),used=state.records.some(r=>r.cardId===c.id);row.append(node('span','',String(i+1)));wrap.append(node('label','',`${TYPES[c.type]}${used?' · 本场已抽出':''}`));for(const field of ['title','detail']){const input=node(field==='detail'?'textarea':'input');input.value=display(c[field]);input.dataset.card=c.id;input.dataset.field=field;input.maxLength=field==='title'?160:1000;input.disabled=used;input.setAttribute('aria-label',`${d.name}第${i+1}张${field==='title'?'名称':'内容'}`);input.addEventListener('input',()=>editorDirty=true);wrap.append(input);}row.append(wrap);f.append(row);});root.append(f);});editorDirty=false;
}
$('saveCards').addEventListener('click',()=>{if(busy)return;const next=clone(state);$('editorFields').querySelectorAll('[data-card]').forEach(input=>{const c=next.pools.flatMap(p=>p.cards).find(c=>c.id===input.dataset.card);c[input.dataset.field]=input.value.trim();});if(!valid(next)){notice('每张卡片都需要名称，请检查空白栏位。');return;}if(save(next)){editorDirty=false;notice('卡片已保存，下一抽使用新内容。');}});
$('editor').addEventListener('toggle',()=>{if($('editor').open&&!editorDirty)renderEditor();});
$('defaultCards').addEventListener('click',()=>{if(!confirm('还原尚未抽出卡片的默认文案？已抽记录会保留。'))return;const next=clone(state);for(const p of next.pools)for(let i=0;i<p.cards.length;i++)if(!next.records.some(r=>r.cardId===p.cards[i].id))p.cards[i]=clone(HALLOWEEN_DEFAULTS.find(d=>d.id===p.id).cards[i]);if(save(next)){renderEditor();notice('已还原默认卡片。');}});
$('finish').addEventListener('click',()=>activeId&&toggleDone(activeId));
$('undo').addEventListener('click',()=>{if(busy||!state.records.length)return;const r=state.records.at(-1);if(!confirm(`撤回 ${recordLabel(r)} 的上一抽？卡片将放回抽签池。`))return;const next=clone(state);next.records.pop();if(save(next)){clearResult();render();renderEditor();notice('已撤回上一抽。');}});
$('reset').addEventListener('click',()=>{if(busy||!confirm(`开始新一场会清除本场记录，补满${TOTAL}首歌曲。请先导出或备份。确定继续？`))return;const next=clone(state);next.records=[];if(save(next)){broken=false;editorDirty=false;clearResult();render();renderEditor();notice(`新的一场开始了，${TOTAL}首歌曲已就位。`);}});
async function copyText(text){try{await navigator.clipboard.writeText(text);notice('已复制。');}catch{const ta=node('textarea');ta.value=text;document.body.append(ta);ta.select();const ok=document.execCommand('copy');ta.remove();notice(ok?'已复制。':'复制失败，请手动选取结果文字。');}}
$('copy').addEventListener('click',()=>{const r=state.records.find(r=>r.cardId===activeId);if(r)copyText(display(`${recordLabel(r)}｜${TYPES[r.type]}｜${r.title}\n${r.detail}`));});
function download(text,type,ext,prefix='miyu-halloween'){const a=node('a'),url=URL.createObjectURL(new Blob([text],{type}));a.href=url;a.download=`${prefix}-${new Date().toISOString().slice(0,10)}.${ext}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
try{$('legacyBackup').hidden=!localStorage.getItem(LEGACY_KEY);}catch{}
$('legacyBackup').addEventListener('click',()=>{
 try{const raw=localStorage.getItem(LEGACY_KEY);if(raw){download(raw,'application/json','json','miyu-halloween-previous');notice('已导出旧场次备份，旧记录仍保留。');}else notice('此浏览器没有旧场次记录。');}catch{notice('无法读取旧记录。');}
});
$('backup').addEventListener('click',()=>download(JSON.stringify(state,null,2),'application/json','json'));
$('csv').addEventListener('click',()=>{const cell=s=>'"'+String(s??'').replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';const rows=[['时间','参与者（如有）','道具','类型','奖励','内容','交付状态','备注'],...state.records.map(r=>[r.at,r.fan,HALLOWEEN_DEFAULTS.find(p=>p.id===r.poolId).name,TYPES[r.type],r.title,r.detail,r.done?'已完成':'待完成',r.note])];download('\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n'),'text/csv;charset=utf-8','csv');});
$('import').addEventListener('click',()=>$('importFile').click());$('importFile').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error();const data=JSON.parse(await file.text());if(!valid(data))throw Error();if(confirm(`加载备份将取代目前资料（含卡片与记录），备份内有 ${data.records.length} 笔。确定加载？`)&&save(data)){broken=false;clearResult();render();renderEditor();if(state.records.length)result(state.records.at(-1));notice('备份已加载。');}}catch{notice('备份格式不正确，原有资料未变更。');}e.target.value='';});
function stage(on){document.body.classList.toggle('stage',on);$('stage').textContent=on?'一般模式':'舞台模式';}
$('stage').addEventListener('click',()=>stage(!document.body.classList.contains('stage')));$('exitStage').addEventListener('click',()=>stage(false));document.addEventListener('keydown',e=>{if(e.key==='Escape')stage(false);});
window.addEventListener('beforeunload',e=>{if(editorDirty){e.preventDefault();e.returnValue='';}});
window.addEventListener('storage',e=>{if(e.key!==KEY)return;if(busy){location.reload();return;}try{const s=JSON.parse(e.newValue);if(!valid(s))throw Error();state=s;clearResult();render();if(!editorDirty)renderEditor();notice('已同步此浏览器另一分页的记录。');}catch{broken=true;render();notice('另一分页的资料已变更，请刷新页面或加载备份。');}});
render();if(state.records.length)result(state.records.at(-1));
})();
