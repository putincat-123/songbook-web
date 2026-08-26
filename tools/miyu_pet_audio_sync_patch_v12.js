(()=>{
let sounds=null,last='';
async function loadSounds(){
  if(sounds)return sounds;
  try{
    const txt=await fetch('./miyu_pet_htmlaudio_patch_v11.js?v=syncsrc',{cache:'force-cache'}).then(r=>r.text());
    const grab=k=>{const m=txt.match(new RegExp(k+":'([^']+)'"));return m&&m[1]};
    sounds={wood:grab('wood'),incense:grab('incense'),beads:grab('beads')};
    return sounds;
  }catch(e){console.warn('[miyu-pet] audio source load failed',e);return null}
}
async function play(kind){
  const s=await loadSounds();
  const src=s&&s[kind];if(!src)return;
  try{const a=new Audio(src);a.preload='auto';a.volume=.9;a.currentTime=0;await a.play()}catch(e){console.warn('[miyu-pet] audio play failed',kind,e)}
}
function hook(){
  const b=document.getElementById('pxBubble');if(!b||b.dataset.audioSyncHook)return false;
  b.dataset.audioSyncHook='1';
  const check=()=>{
    const t=b.textContent||'';if(t===last)return;last=t;
    if(t.includes('认真敲一下木鱼'))play('wood');
    else if(t.includes('合掌，拜一下'))play('incense');
    else if(t.includes('慢慢拨佛珠'))play('beads');
  };
  new MutationObserver(check).observe(b,{childList:true,subtree:true,characterData:true});
  check();return true;
}
new MutationObserver(()=>hook()).observe(document.body,{childList:true,subtree:true});
hook();loadSounds();
})();
