(()=>{
const SRC='./miyu_pet_pixel_v8.js?v=20260827-v16src';
const style=document.createElement('style');
style.textContent=`
/* V16: pet-side speech bubble, no fixed banner */
.px-bubble{right:auto!important;top:auto!important;width:max-content!important;max-width:min(190px,52vw)!important;min-width:72px;z-index:7!important;padding:7px 10px!important;border-radius:12px!important;text-align:left!important;line-height:1.35;box-shadow:0 3px 0 rgba(91,67,49,.16);transition:left .12s linear,top .12s linear;pointer-events:none}
.px-bubble:after{content:'';position:absolute;left:18px;bottom:-9px;width:14px;height:14px;background:#FFFDF8;border-right:2px solid #B7A28E;border-bottom:2px solid #B7A28E;transform:rotate(45deg)}
.pet-zone{display:none!important}
`;
document.head.appendChild(style);

function patch(src){
  let out=src;
  out=out.replace("incense:{x:251,y:187,max:3,merit:5}","incense:{x:251,y:187,max:9999,merit:5}");
  out=out.replace("beads:{x:250,y:299,max:5,merit:2}","beads:{x:250,y:299,max:9999,merit:2}");
  out=out.replace("function drawRoom(g){","function drawRoom(g){const bb=document.getElementById('pxBubble'),cv=document.getElementById('pxRoom');if(bb&&cv){const sc=(cv.getBoundingClientRect().width||320)/320;const side=w.face<0?-1:1;const bx=Math.max(56,Math.min((320*sc)-56,(w.x+side*34)*sc));const by=Math.max(86,Math.min((430*sc)-24,(w.y-46)*sc));bb.style.left=bx+'px';bb.style.top=by+'px';bb.style.transform='translate(-50%,-100%)';}");
  return out;
}

fetch(SRC,{cache:'no-store'})
  .then(r=>{if(!r.ok)throw new Error('pet core '+r.status);return r.text()})
  .then(src=>{(0,eval)(patch(src));document.getElementById('loading')?.style.setProperty('display','none')})
  .catch(err=>{console.error('[miyu-pet] v16 bootstrap failed',err);document.getElementById('loading')?.style.setProperty('display','none');const e=document.getElementById('petError');if(e)e.style.display='block'});
})();
