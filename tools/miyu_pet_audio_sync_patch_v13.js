(()=>{
const SRC={wood:'./audio/miyu_pet_wood.mp3?v=20260827-0608',incense:'./audio/miyu_pet_incense.mp3?v=20260827-0608',beads:'./audio/miyu_pet_beads.mp3?v=20260827-0608'};
const A=Object.fromEntries(Object.entries(SRC).map(([k,src])=>{const a=new Audio(src);a.preload='auto';a.playsInline=true;return[k,a]}));
let primed=false,last='';
function prime(){if(primed)return;primed=true;Object.values(A).forEach(a=>{try{a.muted=true;const p=a.play();if(p&&p.then)p.then(()=>{a.pause();a.currentTime=0;a.muted=false}).catch(()=>{a.muted=false})}catch(e){a.muted=false}})}
['pointerdown','touchstart','click','keydown'].forEach(ev=>document.addEventListener(ev,prime,{capture:true,passive:true}));
function play(kind){const a=A[kind];if(!a)return;try{a.pause();a.currentTime=0;a.muted=false;a.volume=.95;const p=a.play();if(p&&p.catch)p.catch(e=>console.warn('[miyu-pet] supplied audio blocked',kind,e))}catch(e){console.warn('[miyu-pet] supplied audio failed',kind,e)}}
function hook(){const b=document.getElementById('pxBubble');if(!b||b.dataset.audioSync13)return false;b.dataset.audioSync13='1';const check=()=>{const t=b.textContent||'';if(t===last)return;last=t;if(t.includes('认真敲一下木鱼'))play('wood');else if(t.includes('合掌，拜一下'))play('incense');else if(t.includes('慢慢拨佛珠'))play('beads')};new MutationObserver(check).observe(b,{childList:true,subtree:true,characterData:true});check();return true}
new MutationObserver(()=>hook()).observe(document.body,{childList:true,subtree:true});hook();
})();
