(()=>{
const SK='miyu_pet_sound';
try{localStorage.setItem(SK,'1')}catch{}
let c,woodBuffer=null,woodLoading=false,lastPlay=0;
const enabled=()=>true;
const ac=()=>{try{c??=new(window.AudioContext||window.webkitAudioContext)();return c}catch{return null}};
function wake(){
  const x=ac();if(!x)return null;
  try{if(x.state==='suspended')x.resume().catch(()=>{})}catch{}
  return x;
}
function tone(f,d,g,type='sine',delay=0){const x=wake();if(!x)return;try{const o=x.createOscillator(),v=x.createGain(),t=x.currentTime+.02+delay;o.type=type;o.frequency.value=f;v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(g,t+.006);v.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(v);v.connect(x.destination);o.start(t);o.stop(t+d+.05)}catch{}}
function noise(d=.04,g=.03,f=1800,q=1.2,delay=0){const x=wake();if(!x)return;try{const n=Math.max(1,Math.floor(x.sampleRate*d)),buf=x.createBuffer(1,n,x.sampleRate),a=buf.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.4);const s=x.createBufferSource(),bp=x.createBiquadFilter(),v=x.createGain(),t=x.currentTime+.02+delay;s.buffer=buf;bp.type='bandpass';bp.frequency.value=f;bp.Q.value=q;v.gain.setValueAtTime(g,t);v.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(bp);bp.connect(v);v.connect(x.destination);s.start(t)}catch{}}
async function loadWood(){if(woodBuffer||woodLoading)return;const x=wake();if(!x)return;woodLoading=true;try{const txt=await fetch('./miyu_pet_pixel_v3.js?v=woodsample3',{cache:'force-cache'}).then(r=>r.text()),m=txt.match(/const WOOD_B64='([^']+)'/);if(!m)throw new Error('wood sample missing');const bin=atob(m[1]),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);woodBuffer=await x.decodeAudioData(u.buffer.slice(0))}catch(e){console.warn('[miyu-pet] wood sample load failed',e)}finally{woodLoading=false}}
function wood(){const x=wake();if(!x)return;if(woodBuffer){try{const s=x.createBufferSource(),v=x.createGain();s.buffer=woodBuffer;v.gain.value=.95;s.connect(v);v.connect(x.destination);s.start(x.currentTime+.02)}catch{};return}noise(.045,.09,680,.7);tone(145,.16,.095,'triangle');tone(86,.2,.05,'sine',.008);loadWood()}
function bell(){noise(.03,.025,3900,1.5);[[620,1.7,.11],[1120,1.45,.065],[1680,1.1,.038],[2260,.75,.02]].forEach(([f,d,g],i)=>tone(f,d,g,'sine',i*.008))}
function beads(){for(let i=0;i<4;i++){const d=i*.065;noise(.035,.045-i*.006,3900+i*220,1.6,d);tone(3900-i*130,.055,.024,'triangle',d)}}
function play(kind){const now=Date.now();if(now-lastPlay<180)return;lastPlay=now;wake();if(kind==='wood')wood();else if(kind==='incense')bell();else if(kind==='beads')beads()}
function ritualTarget(e){return e.target.closest?.('[data-r]')||null}
document.addEventListener('pointerdown',e=>{const b=ritualTarget(e);if(b)play(b.dataset.r);else wake()},{capture:true,passive:true});
document.addEventListener('touchstart',e=>{const b=ritualTarget(e);if(b)play(b.dataset.r);else wake()},{capture:true,passive:true});
document.addEventListener('click',e=>{const b=ritualTarget(e);if(b)play(b.dataset.r)},{capture:true});
})();
