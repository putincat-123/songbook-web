(() => {
  const SOUND_KEY='miyu_pet_sound';
  let ctx=null;
  const ac=()=>{try{if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx}catch{return null}};
  function woodSound(){
    if(localStorage.getItem(SOUND_KEY)==='0')return;
    const c=ac(); if(!c)return;
    const t=c.currentTime;

    // 木槌落点：很短的宽频冲击
    const n=Math.max(1,Math.floor(c.sampleRate*.045));
    const buf=c.createBuffer(1,n,c.sampleRate),a=buf.getChannelData(0);
    for(let i=0;i<n;i++){
      const env=Math.pow(1-i/n,3.2);
      a[i]=(Math.random()*2-1)*env;
    }
    const src=c.createBufferSource(),bp=c.createBiquadFilter(),ng=c.createGain();
    bp.type='bandpass';bp.frequency.value=720;bp.Q.value=.75;
    ng.gain.setValueAtTime(.12,t);ng.gain.exponentialRampToValueAtTime(.0001,t+.055);
    src.buffer=buf;src.connect(bp);bp.connect(ng);ng.connect(c.destination);src.start(t);

    // 木鱼本体：低而短的空腔共鸣
    [[196,.13,.085],[294,.095,.042],[118,.16,.035]].forEach(([freq,dur,gain],i)=>{
      const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();
      o.type=i===1?'triangle':'sine';o.frequency.setValueAtTime(freq,t);
      f.type='lowpass';f.frequency.value=900;
      g.gain.setValueAtTime(.0001,t);
      g.gain.exponentialRampToValueAtTime(gain,t+.004);
      g.gain.exponentialRampToValueAtTime(.0001,t+dur);
      o.connect(f);f.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.02);
    });
  }

  // 在原 Canvas 点击处理前拦截木鱼区域，只接管木鱼这一项。
  document.addEventListener('click',e=>{
    const canvas=e.target.closest&&e.target.closest('#pxRoom');
    if(!canvas)return;
    const r=canvas.getBoundingClientRect();
    const x=(e.clientX-r.left)*320/r.width,y=(e.clientY-r.top)*430/r.height;
    if(Math.hypot(x-82,y-248)>29)return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const key='miyu_pet_v1';
    let s={};try{s=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
    s.merit=(Number(s.merit)||0)+1;
    localStorage.setItem(key,JSON.stringify(s));
    woodSound();

    const bubble=document.getElementById('pxBubble');if(bubble)bubble.textContent='🪵 咚——功德 +1';
    const chips=[...document.querySelectorAll('#petGame .px-chip')];
    const meritChip=chips.find(el=>el.textContent.includes('🙏'));
    if(meritChip)meritChip.textContent='🙏 '+s.merit;
  },true);
})();
