(() => {
  if (window.__MIYU_PET_VISUAL_V35__) return;
  window.__MIYU_PET_VISUAL_V35__ = true;

  const style=document.createElement('style');
  style.textContent=`
    #petGame .px-bubble{left:12%;right:12%;top:4.5%;padding:6px 9px;font-size:12px;line-height:1.35;border-width:2px;box-shadow:3px 3px 0 rgba(42,28,26,.22);transition:opacity .25s ease,transform .25s ease}
    #petGame .px-tip{font-size:10px;padding:5px 8px;opacity:.82;letter-spacing:.2px}
    #petGame .px-actions{gap:7px}
    #petGame .px-btn{border-radius:2px;padding:10px 4px}
    #petGame .px-manage{padding-top:7px;padding-bottom:9px}
    #petGame .px-small{font-size:11px;padding:6px 9px;opacity:.92}
    #petGame .px-room{overflow:hidden}

    /* A single deliberate mat hides the original wood-fish pixels cleanly. */
    #petGame .v35-wood{position:absolute;left:14.2%;top:48.5%;width:31%;height:17.5%;z-index:3;pointer-events:none;image-rendering:pixelated}
    #petGame .v35-wood .cover{position:absolute;inset:0;background:#a97955;border:3px solid #80583f;box-shadow:inset 0 0 0 3px #bd9068,3px 3px 0 rgba(75,47,32,.16);border-radius:4px}
    #petGame .v35-wood .cover:before{content:"";position:absolute;left:8%;right:8%;top:16%;height:3px;background:#c89b72;box-shadow:0 18px 0 #936647,0 36px 0 #c89b72}

    #petGame .v35-wood .fish{position:absolute;left:13%;bottom:15%;width:52%;height:38%;background:#8a5336;border:3px solid #4b2f20;border-radius:52% 48% 45% 49% / 58% 57% 43% 42%;box-shadow:inset -6px -4px 0 #70432f,inset 5px 4px 0 #a76a43;z-index:2}
    #petGame .v35-wood .fish:before{content:"";position:absolute;left:-8%;top:43%;width:16%;height:18%;background:#8a5336;border-left:3px solid #4b2f20;border-bottom:3px solid #4b2f20;transform:skewY(-18deg)}
    #petGame .v35-wood .fish:after{content:"";position:absolute;left:30%;top:25%;width:45%;height:13%;background:#3f281d;border-radius:70% 10% 70% 20%;transform:rotate(-15deg)}

    /* Head is on the left, immediately facing the wood fish; handle extends up-right. */
    #petGame .v35-wood .mallet{position:absolute;left:55%;top:31%;width:38%;height:7%;background:#6e472f;border:2px solid #3f281d;border-radius:5px;transform:rotate(-31deg);transform-origin:left center;z-index:3}
    #petGame .v35-wood .mallet:before{content:"";position:absolute;left:-20%;top:-110%;width:25%;height:300%;background:#9a6842;border:2px solid #3f281d;border-radius:50%;box-shadow:inset -2px -2px 0 #7b4c31}

    #petGame .v35-bowl{position:absolute;left:40%;top:76.3%;width:10%;height:4.8%;z-index:2;pointer-events:none;background:#d9aa5f;border:3px solid #70452d;border-radius:0 0 45% 45%;box-shadow:inset 0 4px 0 #f2cf85}
    #petGame .v35-ball{position:absolute;left:28%;top:82%;width:18px;height:18px;border-radius:50%;z-index:2;pointer-events:none;background:linear-gradient(90deg,#d35d4c 0 35%,#f3d26c 35% 65%,#5f9fbd 65%);border:2px solid #5a3b2c;box-shadow:2px 2px 0 rgba(75,47,32,.22)}
    #petGame .v35-wall-tag{position:absolute;left:52%;top:17%;z-index:2;pointer-events:none;background:#f2dfb8;color:#6b4330;border:2px solid #6b4330;padding:3px 6px;font:900 9px/1 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;transform:rotate(-1deg);box-shadow:2px 2px 0 rgba(75,47,32,.16)}
  `;
  document.head.appendChild(style);

  function ensureDecor(){
    const room=document.querySelector('#petGame .px-room');
    if(!room) return;
    if(!room.querySelector('.v35-wood')){
      const wood=document.createElement('div');
      wood.className='v35-wood';
      wood.innerHTML='<span class="cover"></span><span class="fish"></span><span class="mallet"></span>';
      room.appendChild(wood);
    }
    if(!room.querySelector('.v35-bowl')){
      const bowl=document.createElement('span');bowl.className='v35-bowl';room.appendChild(bowl);
      const ball=document.createElement('span');ball.className='v35-ball';room.appendChild(ball);
      const tag=document.createElement('span');tag.className='v35-wall-tag';tag.textContent='临海居 · HOME';room.appendChild(tag);
    }
  }

  let hideTimer=0;
  function watchBubble(){
    const b=document.getElementById('pxBubble');
    if(!b||b.dataset.v35==='1') return;
    b.dataset.v35='1';
    const obs=new MutationObserver(()=>{
      b.style.opacity='1';
      b.style.transform='translateY(0)';
      clearTimeout(hideTimer);
      hideTimer=setTimeout(()=>{
        if(document.body.contains(b)){
          b.style.opacity='.12';
          b.style.transform='translateY(-3px)';
        }
      },3200);
    });
    obs.observe(b,{childList:true,characterData:true,subtree:true});
    clearTimeout(hideTimer);
    hideTimer=setTimeout(()=>{
      if(document.body.contains(b)) b.style.opacity='.12';
    },3200);
  }

  function ensure(){ensureDecor();watchBubble()}
  const timer=setInterval(ensure,300);
  setTimeout(()=>clearInterval(timer),120000);
  document.addEventListener('click',()=>setTimeout(ensure,50),true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(ensure,80)});
  ensure();
})();