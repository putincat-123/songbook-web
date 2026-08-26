(()=>{
const KEY='miyu_pet_v1';
const COST=10,DAILY_MAX=3;
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
const write=s=>localStorage.setItem(KEY,JSON.stringify(s));
const bubble=t=>{const b=document.getElementById('pxBubble');if(b)b.textContent=t};
function ensure(s){if(typeof s.merit!=='number')s.merit=0;if(!s.daily||s.daily.date!==today())s.daily={date:today(),pet:0,play:0,talk:0,incense:0,beads:0,pray:0,wood:0};if(typeof s.daily.pray!=='number')s.daily.pray=0;return s}
function refreshMerit(v){document.querySelectorAll('.px-chip').forEach(el=>{if((el.textContent||'').includes('功德'))el.textContent=`🙏 功德 ${v}`})}
function fortune(){const list=['🌟 心愿签：上上签｜今天适合大胆许个愿。','✨ 心愿签：小吉｜慢一点，好事正在靠近。','🍀 心愿签：吉｜先把期待收好，惊喜会自己来。','🌊 心愿签：随缘｜不急，属于你的会来。','🐾 心愿签：宠物加持｜摸摸它，今天多一点好运。','🧧 心愿签：福气到账｜愿临海居今晚都有好消息。'];return list[Math.floor(Math.random()*list.length)]}
function wish(){const s=ensure(read());if(s.merit<COST){bubble(`许愿需要 ${COST} 功德，先去敲几下木鱼吧～`);return}if(s.daily.pray>=DAILY_MAX){bubble('今天已经许过三次愿啦，明天再来～');return}s.merit-=COST;s.daily.pray+=1;s.fortune={date:today(),text:fortune()};write(s);refreshMerit(s.merit);bubble(`${s.fortune.text}（消耗 ${COST} 功德）`)}
function inject(){const box=document.querySelector('#petGame .px-rituals');if(!box||box.querySelector('[data-wish]'))return;const b=document.createElement('button');b.className='px-btn';b.dataset.wish='1';b.textContent='✨ 许愿（-10功德）';b.addEventListener('click',wish);box.appendChild(b)}
new MutationObserver(inject).observe(document.body,{childList:true,subtree:true});inject();
})();
