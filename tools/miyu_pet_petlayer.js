(() => {
  if (window.__MIYU_PET_TOP_LAYER__) return;
  window.__MIYU_PET_TOP_LAYER__ = true;

  const PETS={
    otter:{id:'otter',body:'#9b6b4a',belly:'#f1d2a8',accent:'#5a3c2b',cheek:'#e9a287'},
    cat:{id:'cat',body:'#e6a257',belly:'#fff0cf',accent:'#85502e',cheek:'#f2a49d'},
    dog:{id:'dog',body:'#c78e59',belly:'#f5d5aa',accent:'#6f472f',cheek:'#e9a287'},
    seal:{id:'seal',body:'#a9b8c9',belly:'#eef4f8',accent:'#64748b',cheek:'#efb3b7'},
    rabbit:{id:'rabbit',body:'#efd6dc',belly:'#fff7f4',accent:'#ad7480',cheek:'#efa8ad'},
    whale:{id:'whale',body:'#6ca8d6',belly:'#dff4ff',accent:'#356b92',cheek:'#96c9df'}
  };
  const KEY='miyu_pet_v1';
  const rgb=h=>{const n=parseInt(h.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255]};
  const style=document.createElement('style');
  style.textContent=`
    #petGame .px-room{position:relative}
    #petGame .v35-pet-top{position:absolute;inset:0;width:100%;height:100%;z-index:8;pointer-events:none;image-rendering:pixelated}
  `;
  document.head.appendChild(style);

  let raf=0,lastX=null,lastY=null,lastFace=1;

  function getState(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}}
  function same(data,i,c){return data[i]===c[0]&&data[i+1]===c[1]&&data[i+2]===c[2]&&data[i+3]>0}
  function rect(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
  function outline(g,x,y,w,h,c,e='#4d3428'){rect(g,x-2,y-2,w+4,h+4,e);rect(g,x,y,w,h,c)}

  function drawPet(g,p,cx,cy,s=1.5,flip=false){
    g.save();g.translate(cx,cy);g.scale(flip?-s:s,s);
    const B=p.body,A=p.accent,V=p.belly,C=p.cheek;
    outline(g,-15,5,30,21,B,A);outline(g,-18,-19,36,27,B,A);
    rect(g,-13,-12,26,16,V);rect(g,-10,-8,6,6,'#fff');rect(g,4,-8,6,6,'#fff');
    rect(g,-8,-6,3,3,'#263238');rect(g,6,-6,3,3,'#263238');rect(g,-13,-1,5,3,C);rect(g,8,-1,5,3,C);
    if(p.id==='cat'){outline(g,-17,-27,10,11,B,A);outline(g,7,-27,10,11,B,A)}
    else if(p.id==='dog'){outline(g,-19,-26,9,16,A,A);outline(g,10,-26,9,16,A,A)}
    else if(p.id==='rabbit'){outline(g,-13,-40,8,23,B,A);outline(g,5,-40,8,23,B,A)}
    else if(p.id==='otter'){outline(g,-17,-27,9,9,B,A);outline(g,8,-27,9,9,B,A)}
    g.restore();
  }

  function ensure(){
    const room=document.querySelector('#petGame .px-room');
    const base=document.getElementById('pxRoom');
    if(!room||!base)return null;
    let top=room.querySelector('.v35-pet-top');
    if(!top){top=document.createElement('canvas');top.width=320;top.height=430;top.className='v35-pet-top';room.appendChild(top)}
    return {base,top};
  }

  function locatePet(base,p){
    const bg=base.getContext('2d',{willReadFrequently:true});
    const sx=30,sy=220,sw=260,sh=190,img=bg.getImageData(sx,sy,sw,sh),data=img.data;
    const targets=[p.body,p.accent,p.belly].map(rgb);
    let minX=sw,minY=sh,maxX=-1,maxY=-1;
    for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
      const i=(y*sw+x)*4;
      if(targets.some(c=>same(data,i,c))){
        if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
      }
    }
    if(maxX<0)return null;
    return {x:sx+(minX+maxX)/2,y:sy+maxY-15};
  }

  function frame(){
    const pair=ensure();
    if(pair){
      const {base,top}=pair,tg=top.getContext('2d');
      tg.clearRect(0,0,320,430);
      try{
        const st=getState(),p=PETS[st.petId]||PETS.cat,pos=locatePet(base,p);
        if(pos){
          if(lastX!==null){const dx=pos.x-lastX;if(Math.abs(dx)>.35)lastFace=dx<0?-1:1}
          lastX=pos.x;lastY=pos.y;
          drawPet(tg,p,Math.round(pos.x),Math.round(pos.y),1.5,lastFace<0);
        }
      }catch{}
    }
    raf=requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!raf)frame()});
  frame();
})();