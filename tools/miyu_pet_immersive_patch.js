(()=>{
// Immersive interaction director: turns button presses into small lived-in scenes.
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let seq=0,returnTimer=null;
const q=s=>document.querySelector(s), bubble=t=>{const b=q('#pxBubble');if(b)b.textContent=t};
function cancelReturn(){if(returnTimer){clearTimeout(returnTimer);returnTimer=null}}
function afterScene(){cancelReturn();const mine=++seq;returnTimer=setTimeout(()=>{if(mine!==seq)return;bubble('玩累了，我先回去待着啦～');},5000)}
async function say(parts){for(const [text,ms] of parts){bubble(text);await wait(ms)}}
function bind(sel,scene){const b=q(sel);if(!b)return;b.addEventListener('click',async e=>{if(b.dataset.immersiveBusy==='1')return;e.stopImmediatePropagation();cancelReturn();seq++;b.dataset.immersiveBusy='1';try{await scene()}finally{b.dataset.immersiveBusy='0';afterScene()}},true)}
function boot(){
 bind('[data-a="feed"]',async()=>{await say([
 ['🍚 听见开饭，马上跑去饭桌！',650],['先坐好……筷子拿稳。',650],['🥢 扒一大口——嚼嚼嚼……',800],['🍚 再扒一口！噗，饭粒飞出来了！',850],['等等，把掉出来的饭粒捡回来……',650],['🥢 最后一大口——啊呜！',800],['肚子圆圆的，吃饱啦～',700]
 ])});
 bind('[data-a="pet"]',async()=>{await say([
 ['看到你的手了，主动把脑袋凑过来～',700],['🤚 摸摸头……眼睛慢慢眯起来。',850],['再摸一下，耳朵也放松了～',800],['💗 蹭蹭你的手，不想你停。',900],['嘿嘿，好舒服。',650]
 ])});
 bind('[data-a="play"]',async()=>{await say([
 ['🎾 看到球了！立刻盯住——',650],['球丢出去！冲呀！',750],['🐾 追追追……扑！差一点！',800],['转身再追——抓到了！',850],['叼着球跑回来，放到你面前。',850],['还想再玩一次！',650]
 ])});
 bind('[data-r="wood"]',async()=>{await say([
 ['走到木鱼前，先乖乖坐好。',700],['双手拿好小木槌……',650],['🪵 举起来——敲！ 功德 +1',850],['停一下，认真听木鱼的余音。',700],['再举槌——敲！',850],['合掌一下，今天也要平平安安。',850]
 ])});
 bind('[data-r="incense"]',async()=>{await say([
 ['走到香案前，先把香拿好。',700],['🕯️ 双手举到胸前，站稳。',700],['一拜……',800],['再拜……',800],['轻轻把香插进香炉。',800],['看着香烟慢慢升起来……',1000]
 ])});
 bind('[data-r="beads"]',async()=>{await say([
 ['走到佛珠旁坐下来。',700],['📿 把佛珠捧进手心。',700],['一颗……',550],['两颗……',550],['三颗……慢慢拨，不着急。',750],['最后合掌一下，安安静静坐一会儿。',950]
 ])});
}
const obs=new MutationObserver(()=>{if(q('[data-a="feed"]')&&!q('[data-a="feed"]').dataset.immersiveReady){['[data-a="feed"]','[data-a="pet"]','[data-a="play"]','[data-r="wood"]','[data-r="incense"]','[data-r="beads"]'].forEach(s=>{const x=q(s);if(x)x.dataset.immersiveReady='1'});boot()}});obs.observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>obs.takeRecords());
})();