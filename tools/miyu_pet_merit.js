(() => {
  const KEY='miyu_pet_v1';
  const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
  const write=s=>localStorage.setItem(KEY,JSON.stringify(s));
  const ensure=()=>{const s=read();if(typeof s.merit!=='number')s.merit=0;if(!s.fortune||typeof s.fortune!=='object')s.fortune={date:'',text:''};if(!s.meritDaily||s.meritDaily.date!==today())s.meritDaily={date:today(),incense:0,beads:0,pray:0};write(s);return s};
  const bubble=t=>{const b=document.getElementById('pxBubble');if(b)b.textContent=t};
  const style=document.createElement('style');
  style.textContent=`
  .px-merit{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:8px;background:#3b2b35;border-top:4px solid #2a1c1a}.px-merit-btn{border:2px solid #21171d;background:#ead8b8;color:#35271e;box-shadow:0 3px 0 #21171d;padding:9px 4px;font-weight:950;font-size:12px}.px-merit-btn:active{transform:translateY(2px);box-shadow:0 1px 0 #21171d}.px-merit-title{grid-column:1/-1;display:flex;justify-content:space-between;gap:8px;align-items:center;color:#fff3d4;font:900 12px/1.4 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;padding:1px 2px 4px}.px-merit-note{grid-column:1/-1;color:#ccbda8;font:700 10px/1.4 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;text-align:center}.px-altar{position:absolute;right:14px;top:154px;width:62px;height:58px;pointer-events:none;image-rendering:pixelated}.px-altar .table{position:absolute;left:5px;right:5px;bottom:4px;height:22px;background:#7b4d35;border:3px solid #3d281f}.px-altar .bowl{position:absolute;left:20px;top:25px;width:22px;height:10px;background:#c99a54;border:3px solid #4e3728}.px-altar .stick{position:absolute;left:29px;top:5px;width:4px;height:24px;background:#a83b2e;box-shadow:-8px 5px 0 #a83b2e,8px 5px 0 #a83b2e}.px-altar .smoke{position:absolute;left:24px;top:-2px;color:#f4eee4;font-size:18px;text-shadow:1px 1px 0 #7b6d67}.px-merit-pop{position:absolute;right:78px;top:177px;background:#fff3c4;border:2px solid #6a4b31;padding:4px 7px;font:900 11px/1.2 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;color:#7a4a17;opacity:0;transform:translateY(4px);transition:.25s;pointer-events:none}.px-merit-pop.show{opacity:1;transform:translateY(-4px)}
  @media(max-width:620px){.px-merit{grid-template-columns:repeat(2,1fr)}.px-merit-title,.px-merit-note{grid-column:1/-1}}
  `;
  document.head.appendChild(style);

  let popTimer=0;
  function pop(text){const room=document.querySelector('#petGame .px-room');if(!room)return;let el=room.querySelector('.px-merit-pop');if(!el){el=document.createElement('div');el.className='px-merit-pop';room.appendChild(el)}el.textContent=text;el.classList.add('show');clearTimeout(popTimer);popTimer=setTimeout(()=>el.classList.remove('show'),900)}
  function altar(){const room=document.querySelector('#petGame .px-room');if(!room||room.querySelector('.px-altar'))return;const el=document.createElement('div');el.className='px-altar';el.innerHTML='<div class="smoke">〰</div><div class="stick"></div><div class="bowl"></div><div class="table"></div>';room.appendChild(el)}
  function refreshMeritLabel(){const s=ensure();document.querySelectorAll('[data-merit-count]').forEach(x=>x.textContent=s.merit||0)}
  function fortuneText(){const list=['🌟 今日欧气：上上签｜该来的会来','✨ 今日欧气：偏白｜适合保持期待','🍀 今日欧气：小吉｜先积功德再出手','🌊 今日欧气：随缘｜临海居保佑平常心','🐾 今日欧气：宠物加持｜摸摸它再抽','🧧 今日欧气：福气到账｜娱乐第一，开心最重要'];return list[Math.floor(Math.random()*list.length)]}
  function act(a){const s=ensure();const d=s.meritDaily;
    if(a==='wood'){s.merit=(s.merit||0)+1;write(s);bubble('咚——功德 +1 🪵');pop('功德 +1');refreshMeritLabel();return}
    if(a==='incense'){if(d.incense>=3){bubble('今天香火已经很旺啦，明天再烧～');return}d.incense++;s.merit=(s.merit||0)+5;write(s);bubble('香已奉上 🕯️ 愿临海居今晚都白一点～');pop('功德 +5');refreshMeritLabel();return}
    if(a==='beads'){if(d.beads>=5){bubble('今天佛珠已经摸得很圆润啦～');return}d.beads++;s.merit=(s.merit||0)+2;write(s);const lines=['📿 心诚则灵，先把手气养一养。','📿 一珠一愿：小耳朵都来点歌。','📿 愿今天抽奖少一点谢谢参与。','📿 愿谜屿开口就是好听的一首。','📿 愿临海居今晚喜提白号。'];bubble(lines[(d.beads-1)%lines.length]);pop('功德 +2');refreshMeritLabel();return}
    if(a==='pray'){if((s.merit||0)<10){bubble('功德还差一点，先敲几下木鱼吧～');return}if(d.pray>=3){bubble('今天已经求过三签啦，剩下交给玄学。');return}d.pray++;s.merit-=10;const f=fortuneText();s.fortune={date:today(),text:f};write(s);bubble(f+'（仅娱乐，不影响真实抽奖概率）');pop('祈福 -10');refreshMeritLabel();return}
  }
  function inject(){const panel=document.getElementById('petGame');if(!panel||!panel.querySelector('.px-shell'))return;altar();if(panel.querySelector('.px-merit')){refreshMeritLabel();return}const manage=panel.querySelector('.px-manage');const actions=panel.querySelector('.px-actions');if(!manage&&!actions)return;const box=document.createElement('div');box.className='px-merit';box.innerHTML=`<div class="px-merit-title"><span>🙏 临海居玄学角落</span><span>功德 <b data-merit-count>0</b></span></div><button class="px-merit-btn" data-merit="incense">🕯️ 烧香</button><button class="px-merit-btn" data-merit="wood">🪵 敲木鱼</button><button class="px-merit-btn" data-merit="beads">📿 摸佛珠</button><button class="px-merit-btn" data-merit="pray">✨ 求欧气</button><div class="px-merit-note">玄学彩蛋仅供娱乐；不会改变直播间真实抽奖概率。</div>`;box.querySelectorAll('[data-merit]').forEach(b=>b.onclick=()=>act(b.dataset.merit));(manage||actions).before(box);refreshMeritLabel()}
  const obs=new MutationObserver(()=>inject());
  obs.observe(document.body,{subtree:true,childList:true});
  ensure();inject();
})();
