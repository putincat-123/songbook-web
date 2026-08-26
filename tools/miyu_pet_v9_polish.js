(()=>{
const css=document.createElement('style');css.textContent=`
.px-room canvas{image-rendering:auto!important}.px-shell{border-radius:18px!important}.px-bubble{border-radius:14px!important}.px-btn,.v8-rbtn,.px-small{border-radius:13px!important}.px-choice{border-radius:16px!important}.px-icon{image-rendering:auto!important;transform:scale(1.08)}
`;document.head.appendChild(css);
function polish(){const c=document.getElementById('pxRoom');if(!c||c.dataset.v9)return false;c.dataset.v9='1';const old=c.getContext('2d');if(old){old.imageSmoothingEnabled=true;old.imageSmoothingQuality='high'}return true}
let n=0;const t=setInterval(()=>{if(polish()||++n>60)clearInterval(t)},100);
})();
