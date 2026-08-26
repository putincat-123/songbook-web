(()=>{
// Visual companion layer only. V7 remains the movement/action authority so pets still walk to targets.
const wait=ms=>new Promise(r=>setTimeout(r,ms));let fx=null,raf=0;
const q=s=>document.querySelector(s),bubble=t=>{const b=q('#pxBubble');if(b)b.textContent=t};
function px(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)}function heart(g,x,y){px(g,x,y,4,4,'#e77f91');px(g,x+6,y,4,4,'#e77f91');px(g,x-2,y+4,14,5,'#e77f91');px(g,x+1,y+9,8,4,'#e77f91')}
function addMerit(n){try{const s=JSON.parse(localStorage.getItem('miyu_pet_v1')||'{}');s.merit=(s.merit||0)+n;localStorage.setItem('miyu_pet_v1',JSON.stringify(s));const m=q('#merit');if(m)m.textContent='🙏 '+s.merit}catch{}}
function decor(g){
 // center hanging scroll
 px(g,145,25,56,4,'#765845');px(g,150,29,46,70,'#ead8b5');px(g,153,33,40,62,'#f7ecd2');px(g,145,99,56,4,'#765845');
 px(g,166,43,4,14,'#6f5140');px(g,162,58,12,4,'#6f5140');px(g,166,62,4,15,'#6f5140');
 // small framed night-sky picture on right
 px(g,226,34,58,48,'#765845');px(g,230,38,50,40,'#2f455c');px(g,264,44,7,7,'#e8c96a');px(g,239,48,2,2,'#f6e7b0');px(g,249,59,2,2,'#f6e7b0');px(g,273,66,2,2,'#f6e7b0');
 // tiny shelf + potted plant
 px(g,236,101,54,5,'#765845');px(g,252,89,20,12,'#9b744f');px(g,258,76,4,14,'#567b4d');px(g,250,80,8,6,'#6f955c');px(g,262,78,9,7,'#6f955c');
}
function draw(g,t,f){const s=f.step||0;
// Eating props: V7 already draws the ONLY pair of chopsticks. This layer only adds rice/crumb effects.
if(f.kind==='eat'){if(s>=2)for(let i=0;i<9;i++){const a=i*.75+t*3,r=((t*28+i*7)%34);px(g,151+Math.cos(a)*r,292-Math.abs(Math.sin(a))*r*.7,3,3,'#fff4c9')}if(s===3)px(g,121,286,16,5,'#fff4c9')}
if(f.kind==='pet'){const yy=272+Math.abs(Math.sin(t*5))*12;px(g,151,yy,19,10,'#f0c4a3');px(g,164,yy+7,12,5,'#f0c4a3');if(s>=2){heart(g,132,270-Math.abs(Math.sin(t*3))*16);heart(g,181,281-Math.abs(Math.cos(t*3))*13)}}
if(f.kind==='play'){const x=s<2?160+(t%1)*95:s===2?255-(t%1)*120:170+(t%1)*25,y=302-Math.abs(Math.sin(t*5))*32;px(g,x,y,10,10,'#efbd45');px(g,x+3,y+3,4,4,'#6aa4d8')}
// wood: impact only; hammer stays exclusively on the pet renderer, avoiding a second hammer.
if(f.kind==='wood'&&s===2){px(g,58,217,8,3,'#f0c85a');px(g,107,212,8,3,'#f0c85a');px(g,54,207,3,8,'#f0c85a');px(g,115,204,3,8,'#f0c85a')}
if(f.kind==='incense'){if(s>=3)for(let i=0;i<4;i++){const yy=130-i*10-((t*12)%10);px(g,247+Math.sin(t*2+i)*6,yy,3,6,'rgba(180,180,180,.65)')}}
if(f.kind==='beads'){for(let i=0;i<12;i++){const a=i/12*Math.PI*2+t*(s>=1?1.6:.3);px(g,250+Math.cos(a)*17,288+Math.sin(a)*13,5,5,'#855537')}}}
function canvasFx(){cancelAnimationFrame(raf);const c=q('#pxRoom');if(!c)return;let o=q('#immersiveFx');if(!o){o=document.createElement('canvas');o.id='immersiveFx';o.width=320;o.height=430;Object.assign(o.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',imageRendering:'pixelated',zIndex:'2'});c.parentElement.appendChild(o)}
 const b=q('#pxBubble');if(b){b.style.zIndex='5';b.style.position='absolute'}
 const g=o.getContext('2d');const loop=t=>{g.clearRect(0,0,320,430);decor(g);if(fx)draw(g,t/1000,fx);raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop)}
async function beat(kind,step,text,ms){fx={kind,step};bubble(text);await wait(ms)}
const scenes={
 feed:async()=>{await wait(650);await beat('eat',0,'🍚 到饭桌啦，先坐好。',500);await beat('eat',1,'🥢 拿起筷子，第一口！',700);await beat('eat',2,'啊呜！饭粒噗噗飞出来！',900);await beat('eat',1,'嚼嚼嚼……再扒第二口。',750);await beat('eat',2,'又喷出来了 😂',850);await beat('eat',3,'赶快把掉出来的饭捡一捡。',650)},
 pet:async()=>{await wait(450);await beat('pet',1,'🤚 自己把脑袋凑到你的手下面。',750);await beat('pet',2,'摸摸头，眼睛慢慢眯起来 💗',950);await beat('pet',3,'还会主动蹭你的手。',850)},
 play:async()=>{await wait(650);await beat('play',0,'🎾 盯住球……',500);await beat('play',1,'球飞出去，冲呀！',800);await beat('play',2,'扑空，急转弯再追！',750);await beat('play',3,'抓到了，带回来！',850)},
 wood:async()=>{await wait(900);await beat('wood',1,'坐好，举起木槌……',450);addMerit(1);await beat('wood',2,'🪵 咚！ 功德 +1',650);await beat('wood',1,'停一下，再举槌。',450);addMerit(1);await beat('wood',2,'🪵 咚！ 功德 +1',650);await beat('wood',1,'最后一下，举槌。',450);await beat('wood',2,'🪵 咚！ 功德 +1',700)},
 incense:async()=>{await wait(1000);await beat('incense',1,'双手捧香，一拜。',750);await beat('incense',2,'站直，再拜一次。',750);await beat('incense',3,'把香插好，烟慢慢升起来。',1000)},
 beads:async()=>{await wait(900);await beat('beads',1,'📿 坐好，拨第一颗。',650);await beat('beads',2,'第二颗、第三颗……',800);await beat('beads',3,'慢慢拨完，再合掌。',850)}
};
function bind(sel,key){const b=q(sel);if(!b||b.dataset.immersiveReady)return;b.dataset.immersiveReady='1';b.addEventListener('click',()=>{fx=null;scenes[key]().finally(()=>{fx=null})},false)}
function boot(){canvasFx();bind('[data-a="feed"]','feed');bind('[data-a="pet"]','pet');bind('[data-a="play"]','play');bind('[data-r="wood"]','wood');bind('[data-r="incense"]','incense');bind('[data-r="beads"]','beads')}
const obs=new MutationObserver(()=>{if(q('[data-a="feed"]'))boot()});obs.observe(document.documentElement,{childList:true,subtree:true});if(q('[data-a="feed"]'))boot();
})();