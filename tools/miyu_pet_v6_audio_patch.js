(()=>{
const SK='miyu_pet_sound';localStorage.setItem(SK,'0');let c,woodBuffer=null,woodLoading=false;
const ac=()=>{try{c??=new(window.AudioContext||window.webkitAudioContext)();if(c.state==='suspended')c.resume();return c}catch{return null}};
function tone(f,d,g,type='sine',delay=0){const x=ac();if(!x)return;const o=x.createOscillator(),v=x.createGain(),t=x.currentTime+delay;o.type=type;o.frequency.value=f;v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(g,t+.004);v.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(v);v.connect(x.destination);o.start(t);o.stop(t+d+.04)}
function noise(d=.04,g=.03,f=1800,q=1.2,delay=0){const x=ac();if(!x)return;const n=Math.max(1,Math.floor(x.sampleRate*d)),buf=x.createBuffer(1,n,x.sampleRate),a=buf.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.4);const s=x.createBufferSource(),bp=x.createBiquadFilter(),v=x.createGain(),t=x.currentTime+delay;s.buffer=buf;bp.type='bandpass';bp.frequency.value=f;bp.Q.value=q;v.gain.setValueAtTime(g,t);v.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(bp);bp.connect(v);v.connect(x.destination);s.start(t)}
async function loadWood(){if(woodBuffer||woodLoading)return;woodLoading=true;try{const txt=await fetch('./miyu_pet_pixel_v3.js?v=woodsample').then(r=>r.text()),m=txt.match(/const WOOD_B64='([^']+)'/);if(!m)throw new Error('wood sample missing');const bin=atob(m[1]),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);const x=ac();if(!x)throw new Error('audio unavailable');woodBuffer=await x.decodeAudioData(u.buffer.slice(0))}catch(e){console.warn('[miyu-pet] wood sample load failed',e)}finally{woodLoading=false}}
function wood(){const x=ac();if(!x)return;if(woodBuffer){const s=x.createBufferSource(),v=x.createGain();s.buffer=woodBuffer;v.gain.value=.92;s.connect(v);v.connect(x.destination);s.start();return}loadWood();noise(.018,.025,780,.8);tone(165,.09,.025,'triangle')}
function bell(){noise(.025,.012,4200,1.8);[[530,2.25,.07],[1012,1.8,.04],[1572,1.35,.028],[2088,.9,.014]].forEach(([f,d,g],i)=>tone(f,d,g,'sine',i*.006))}
function beads(){for(let i=0;i<3;i++){const d=i*.05;noise(.028,.026-i*.004,4200+i*180,1.8,d);tone(4300-i*170,.045,.014,'triangle',d)}}
function currentPet(){try{return JSON.parse(localStorage.getItem('miyu_pet_v1')||'{}').petId||'otter'}catch{return'otter'}}
function petVoice(){const p=currentPet();
 if(p==='cat'){tone(760,.09,.045,'triangle');tone(980,.13,.035,'sine',.07);tone(690,.16,.025,'triangle',.16);return}
 if(p==='dog'){noise(.055,.045,520,1.0);tone(230,.10,.055,'square');tone(190,.08,.04,'square',.13);return}
 if(p==='rabbit'){tone(1250,.045,.025,'sine');tone(1450,.05,.022,'sine',.07);tone(1180,.06,.018,'sine',.14);return}
 if(p==='crow'){noise(.07,.035,1050,.7);tone(410,.09,.04,'sawtooth');tone(330,.12,.035,'sawtooth',.12);return}
 if(p==='whale'){tone(420,.28,.025,'sine');tone(560,.34,.022,'sine',.18);tone(360,.40,.016,'sine',.42);return}
 // otter
 tone(880,.06,.03,'triangle');tone(1080,.07,.028,'triangle',.08);tone(760,.09,.022,'triangle',.17)
}
let last='';function hook(){const b=document.getElementById('pxBubble');if(!b||b.dataset.audioHook)return false;b.dataset.audioHook='1';new MutationObserver(()=>{const t=b.textContent||'';if(t===last)return;last=t;if(t.startsWith('🪵 咚！ 功德 +1'))wood();else if(t.includes('上香完成'))bell();else if(t.includes('佛珠完成'))beads()}).observe(b,{childList:true,subtree:true,characterData:true});return true}
function hookTalk(){document.querySelectorAll('[data-a="talk"]').forEach(b=>{if(b.dataset.voiceHook)return;b.dataset.voiceHook='1';b.addEventListener('click',()=>petVoice(),false)})}
new MutationObserver(()=>{hook();hookTalk()}).observe(document.body,{childList:true,subtree:true});hook();hookTalk();loadWood();
})();