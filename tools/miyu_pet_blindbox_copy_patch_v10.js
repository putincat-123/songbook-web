(()=>{
const COPY_RE=/^🎁 抽到《(.+?)》，但浏览器没有允许自动复制/;
let currentCmd='';
function legacyCopy(text){
  try{
    const ta=document.createElement('textarea');
    ta.value=text;
    ta.setAttribute('readonly','');
    ta.style.position='fixed';
    ta.style.left='-9999px';
    ta.style.top='0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0,ta.value.length);
    const ok=document.execCommand('copy');
    ta.remove();
    return ok;
  }catch{return false}
}
async function copyNow(text){
  try{
    if(navigator.clipboard?.writeText){
      await navigator.clipboard.writeText(text);
      return true;
    }
  }catch{}
  return legacyCopy(text);
}
function ensureButton(){
  const bubble=document.getElementById('pxBubble');
  if(!bubble)return;
  let btn=document.getElementById('pxBlindCopyBtn');
  if(!btn){
    btn=document.createElement('button');
    btn.id='pxBlindCopyBtn';
    btn.type='button';
    btn.textContent='📋 复制点歌指令';
    btn.style.cssText='display:none;margin:8px auto 0;padding:9px 14px;border:2px solid #8D7867;border-radius:10px;background:#FFF7E3;box-shadow:0 2px 0 #B19D89;font-weight:950;color:#5A3829;touch-action:manipulation;';
    bubble.insertAdjacentElement('afterend',btn);
    btn.onclick=async()=>{
      if(!currentCmd)return;
      const ok=await copyNow(currentCmd);
      const b=document.getElementById('pxBubble');
      if(ok){
        if(b)b.textContent=`✅ 已复制：${currentCmd}`;
        btn.style.display='none';
      }else{
        if(b)b.textContent=`📋 请长按复制：${currentCmd}`;
        btn.textContent='再试一次复制';
      }
    };
  }
}
function inspect(){
  const bubble=document.getElementById('pxBubble');
  if(!bubble)return;
  ensureButton();
  const btn=document.getElementById('pxBlindCopyBtn');
  if(!btn)return;
  const text=bubble.textContent||'';
  const m=text.match(COPY_RE);
  if(m){
    currentCmd=`点歌 ${m[1]}`;
    btn.textContent='📋 复制点歌指令';
    btn.style.display='block';
  }else if(text.startsWith('🎁 抽到《')&&text.includes('已复制')){
    btn.style.display='none';
  }else if(!text.startsWith('📋 请长按复制：')){
    btn.style.display='none';
  }
}
const mo=new MutationObserver(()=>inspect());
mo.observe(document.body,{childList:true,subtree:true,characterData:true});
inspect();
})();
