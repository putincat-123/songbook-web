(() => {
  const KEY='miyu_pet_v1', SOUND_KEY='miyu_pet_sound';
  let ctx=null;
  const ac=()=>{try{if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx}catch{return null}};
  const on=()=>localStorage.getItem(SOUND_KEY)!=='0';
  function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}}
  function write(s){localStorage.setItem(KEY,JSON.stringify(s))}
  function ensureDaily(s){const t=today();if(!s.daily||s.daily.date!==t)s.daily={date:t,pet:0,play:0,talk:0,incense:0,beads:0,pray:0,wood:0};return s}
  function tone(c,freq,dur,gain,delay=0,type='sine',detune=0){const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;o.type=type;o.frequency.value=freq;o.detune.value=detune;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.04)}
  function noiseTick(c,delay=0,gain=.035){const len=Math.floor(c.sampleRate*.035),buf=c.createBuffer(1,len,c.sampleRate),a=buf.getChannelData(0);for(let i=0;i<len;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);const s=c.createBufferSource(),bp=c.createBiquadFilter(),g=c.createGain(),t=c.currentTime+delay;s.buffer=buf;bp.type='bandpass';bp.frequency.value=4200+Math.random()*450;bp.Q.value=1.8;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+.05);s.connect(bp);bp.connect(g);g.connect(c.destination);s.start(t)}
  function beadsSound(){if(!on())return;const c=ac();if(!c)return;for(let i=0;i<3;i++){const d=i*.045;noiseTick(c,d,.03-i*.004);tone(c,4300+Math.random()*260,.045,.018,d,'triangle',(Math.random()-.5)*22)}}
  function bellSound(){if(!on())return;const c=ac();if(!c)return;noiseTick(c,0,.018);[[530,2.25,.075],[1012,1.8,.045],[1572,1.35,.032],[2088,.9,.015]].forEach(([f,d,g],i)=>tone(c,f,d,g,i*.006,'sine',(Math.random()-.5)*5))}
  function floatMerit(px,py,text,color='#9b4f1d'){const room=document.querySelector('#petGame .px-room');if(!room)return;const el=document.createElement('div');el.className='px-ritual-float';el.textContent=text;el.style.left=`${Math.max(28,Math.min(292,px+(Math.random()-.5)*34))/320*100}%`;el.style.top=`${Math.max(118,Math.min(397,py-10-Math.random()*14))/430*100}%`;el.style.color=color;room.appendChild(el);setTimeout(()=>el.remove(),900)}
  const st=document.createElement('style');st.textContent=`.px-ritual-float{position:absolute;z-index:8;pointer-events:none;font:900 12px/1 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;text-shadow:0 1px 0 #fff0c9;white-space:nowrap;animation:pxRitualFloat .86s ease-out forwards}@keyframes pxRitualFloat{0%{opacity:0;transform:translate(-50%,5px) scale(.92)}14%{opacity:1}70%{opacity:1}100%{opacity:0;transform:translate(-50%,-34px) scale(1.05)}}`;
  document.head.appendChild(st);
  function updateMerit(s){const m=document.getElementById('meritChip');if(m)m.textContent='🙏 '+(Number(s.merit)||0)}
  function bubble(t){const b=document.getElementById('pxBubble');if(b)b.textContent=t}
  document.addEventListener('click',e=>{
    const canvas=e.target.closest&&e.target.closest('#pxRoom');if(!canvas)return;
    const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*320/r.width,y=(e.clientY-r.top)*430/r.height;
    const incense=Math.hypot(x-251,y-187)<=25, beads=Math.hypot(x-250,y-299)<=27;
    if(!incense&&!beads)return;
    e.preventDefault();e.stopImmediatePropagation();
    const s=ensureDaily(read());s.merit=Number(s.merit)||0;
    if(incense){
      if((s.daily.incense||0)>=3){bubble('今天已经烧过三次香啦～');return}
      s.daily.incense=(s.daily.incense||0)+1;s.merit+=5;write(s);bellSound();floatMerit(x,y,'功德 +5','#b45b21');updateMerit(s);bubble('🕯️ 香火已上｜功德 +5');
    }else{
      if((s.daily.beads||0)>=5){bubble('今天佛珠已经摸够五次啦～');return}
      s.daily.beads=(s.daily.beads||0)+1;s.merit+=2;write(s);beadsSound();floatMerit(x,y,'功德 +2','#845234');updateMerit(s);bubble('📿 摸摸佛珠｜功德 +2');
    }
  },true);
})();