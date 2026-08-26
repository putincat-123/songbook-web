(() => {
  if (window.__MIYU_PET_TOP_LAYER__) return;
  window.__MIYU_PET_TOP_LAYER__ = true;

  const PETS={
    otter:['#9b6b4a','#f1d2a8','#5a3c2b','#e9a287'],
    cat:['#e6a257','#fff0cf','#85502e','#f2a49d'],
    dog:['#c78e59','#f5d5aa','#6f472f','#e9a287'],
    seal:['#a9b8c9','#eef4f8','#64748b','#efb3b7'],
    rabbit:['#efd6dc','#fff7f4','#ad7480','#efa8ad'],
    whale:['#6ca8d6','#dff4ff','#356b92','#96c9df']
  };
  const KEY='miyu_pet_v1';
  const rgb=h=>{const n=parseInt(h.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255]};
  const style=document.createElement('style');
  style.textContent=`
    #petGame .px-room{position:relative}
    #petGame .v35-pet-top{position:absolute;inset:0;width:100%;height:100%;z-index:8;pointer-events:none;image-rendering:pixelated}
  `;
  document.head.appendChild(style);

  let raf=0,lastBase=null,lastTop=null;

  function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}}
  function palette(){
    const s=state(),base=PETS[s.petId]||PETS.cat;
    return [...base,'#ffffff','#263238'].map(rgb);
  }
  function same(data,i,c){return data[i]===c[0]&&data[i+1]===c[1]&&data[i+2]===c[2]&&data[i+3]>0}

  function ensure(){
    const room=document.querySelector('#petGame .px-room');
    const base=document.getElementById('pxRoom');
    if(!room||!base)return null;
    let top=room.querySelector('.v35-pet-top');
    if(!top){top=document.createElement('canvas');top.width=320;top.height=430;top.className='v35-pet-top';room.appendChild(top)}
    if(lastBase!==base||lastTop!==top){lastBase=base;lastTop=top}
    return {base,top};
  }

  function frame(){
    const pair=ensure();
    if(pair){
      const {base,top}=pair,bg=base.getContext('2d',{willReadFrequently:true}),tg=top.getContext('2d');
      try{
        const sx=30,sy=220,sw=260,sh=190,img=bg.getImageData(sx,sy,sw,sh),data=img.data,pal=palette();
        let minX=sw,minY=sh,maxX=-1,maxY=-1;
        for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
          const i=(y*sw+x)*4;
          if(pal.slice(0,4).some(c=>same(data,i,c))){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y}
        }
        tg.clearRect(0,0,320,430);
        if(maxX>=0){
          minX=Math.max(0,minX-9);maxX=Math.min(sw-1,maxX+9);minY=Math.max(0,minY-16);maxY=Math.min(sh-1,maxY+10);
          const out=tg.createImageData(maxX-minX+1,maxY-minY+1),od=out.data,w=maxX-minX+1;
          for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
            const si=(y*sw+x)*4,di=((y-minY)*w+(x-minX))*4;
            if(pal.some(c=>same(data,si,c))){od[di]=data[si];od[di+1]=data[si+1];od[di+2]=data[si+2];od[di+3]=data[si+3]}
          }
          tg.putImageData(out,sx+minX,sy+minY);
        }
      }catch{}
    }
    raf=requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!raf)frame()});
  frame();
})();
