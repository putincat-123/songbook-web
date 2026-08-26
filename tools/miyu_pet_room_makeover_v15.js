(()=>{
const style=document.createElement('style');
style.textContent=`
.px-shell{background:#eadfce!important;border-color:#6f5848!important;box-shadow:0 10px 0 #bda68e,0 16px 28px rgba(80,55,38,.18)!important}
.px-hud{background:linear-gradient(#c9ded8,#b8d0ca)!important;border-bottom-color:#758f88!important}
.px-chip{background:#f7f1e7!important;border-color:#9f8f7e!important;border-radius:8px;box-shadow:0 2px 0 rgba(90,65,48,.12)}
.px-room{overflow:hidden;background:#d8c3a5}
.px-room:after{content:'';position:absolute;inset:0;pointer-events:none;z-index:2;background:linear-gradient(to bottom,rgba(255,247,225,.08),transparent 45%,rgba(98,66,42,.04));mix-blend-mode:multiply}
.px-room-decor{position:absolute;inset:0;z-index:3;pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif}
.px-room-decor *{box-sizing:border-box}
/* curtains around the existing canvas window */
.pet-curtain{position:absolute;top:20px;width:18px;height:84px;background:repeating-linear-gradient(90deg,#dca8a3 0 5px,#efc0b8 5px 10px);border:2px solid #795d4d;box-shadow:0 3px 0 rgba(80,55,40,.14)}
.pet-curtain.left{left:17px;border-radius:9px 4px 10px 5px;transform:rotate(2deg)}
.pet-curtain.right{left:111px;border-radius:4px 9px 5px 10px;transform:rotate(-2deg)}
.pet-curtain:after{content:'';position:absolute;left:2px;right:2px;top:48px;height:5px;background:#e7c37b;border:1px solid #83643d}
.pet-curtain-rod{position:absolute;left:14px;top:14px;width:118px;height:5px;background:#795437;border:1px solid #503724;border-radius:6px}
.pet-curtain-rod:before,.pet-curtain-rod:after{content:'';position:absolute;top:-3px;width:8px;height:10px;border-radius:50%;background:#9a724a;border:1px solid #503724}.pet-curtain-rod:before{left:-5px}.pet-curtain-rod:after{right:-5px}
/* wall shelf + books */
.pet-shelf{position:absolute;right:14px;top:34px;width:98px;height:7px;background:#76533c;border:2px solid #4f3829;box-shadow:0 4px 0 rgba(76,49,33,.16)}
.pet-shelf:before{content:'▮ ▮ ▮  🪴';position:absolute;right:5px;bottom:5px;color:#8d5a3b;font-size:15px;letter-spacing:2px;text-shadow:0 1px #f4e0b9}
/* picture frame */
.pet-frame{position:absolute;right:121px;top:28px;width:49px;height:55px;background:#6d4d38;border:3px solid #4c3528;box-shadow:inset 0 0 0 3px #caa77b,0 3px 0 rgba(70,45,30,.16)}
.pet-frame:before{content:'🐾';position:absolute;inset:6px;background:#f4e4cf;display:grid;place-items:center;font-size:22px}
.pet-frame:after{content:'謎嶼';position:absolute;left:7px;right:7px;bottom:3px;text-align:center;font-size:7px;font-weight:900;color:#fff0d5}
/* warm hanging lamp */
.pet-lamp{position:absolute;left:164px;top:15px;width:32px;height:31px}
.pet-lamp:before{content:'';position:absolute;left:15px;top:-15px;width:2px;height:18px;background:#5b4638}
.pet-lamp:after{content:'';position:absolute;left:3px;top:3px;width:26px;height:22px;background:radial-gradient(circle at 50% 45%,#ffe8a3 0 35%,#dda85f 36% 68%,#73513a 69%);clip-path:polygon(25% 0,75% 0,100% 100%,0 100%);filter:drop-shadow(0 3px 5px rgba(248,190,90,.3))}
/* hanging ivy */
.pet-ivy{position:absolute;left:135px;top:5px;width:26px;height:78px;color:#64885a;font-size:16px;line-height:15px;transform:rotate(3deg);text-shadow:1px 1px #3f603a}
.pet-ivy:before{content:'🌿\A  🌿\A 🌿\A  🌿';white-space:pre;position:absolute}
/* prayer-zone wall scroll */
.pet-scroll{position:absolute;right:71px;top:92px;width:32px;height:70px;background:#e8d3a7;border-left:3px solid #694b34;border-right:3px solid #694b34;box-shadow:0 2px 0 rgba(70,45,30,.18)}
.pet-scroll:before{content:'福\A來';white-space:pre;position:absolute;inset:9px 0;text-align:center;color:#7a4930;font:900 14px/23px serif}
.pet-scroll:after{content:'';position:absolute;left:-5px;right:-5px;top:-5px;height:6px;background:#6f4d34;border-radius:4px;box-shadow:0 74px 0 #6f4d34}
/* little floor plant + toy basket, only at edges */
.pet-floorplant{position:absolute;left:10px;top:126px;font-size:25px;filter:drop-shadow(0 2px 0 rgba(75,50,35,.15))}
.pet-toys{position:absolute;left:8px;bottom:16px;width:61px;height:36px;background:#9a6d48;border:3px solid #60452f;border-radius:7px 7px 12px 12px;box-shadow:inset 0 6px #bd8d5e}
.pet-toys:before{content:'🧶  ⭐';position:absolute;left:6px;top:-15px;font-size:17px;letter-spacing:2px}
/* cozy prayer halo and zone captions */
.pet-prayer-glow{position:absolute;right:18px;top:136px;width:86px;height:116px;border-radius:45%;background:radial-gradient(ellipse,rgba(255,210,111,.15),rgba(255,210,111,0) 72%)}
.pet-zone{position:absolute;padding:3px 6px;border-radius:999px;background:rgba(83,60,44,.82);color:#fff4dc;font-size:8px;font-weight:900;letter-spacing:.5px;box-shadow:0 1px 0 rgba(255,255,255,.16)}
.pet-zone.life{left:38px;top:197px}.pet-zone.play{left:124px;bottom:86px}.pet-zone.prayer{right:18px;top:160px}.pet-zone.song{left:180px;top:214px}
/* evening ambience */
.px-shell.pet-night .px-room-decor{background:linear-gradient(rgba(31,46,74,.10),rgba(70,45,30,.04))}
.px-shell.pet-night .pet-lamp:after{filter:drop-shadow(0 0 9px rgba(255,199,94,.72))}
.px-shell.pet-night .px-room:after{background:linear-gradient(to bottom,rgba(23,38,65,.13),rgba(101,65,38,.04))}
.px-rituals{background:#eadfce!important;border-top:1px solid #c8b39c}
.px-actions{background:#d9e4dc!important}
.px-btn{border-radius:8px}
@media(max-width:430px){.pet-zone{font-size:7px;padding:2px 5px}.pet-shelf{right:10px;width:88px}.pet-frame{right:110px}}
`;
document.head.appendChild(style);
function inject(){
 const room=document.querySelector('#petGame .px-room');
 const shell=document.querySelector('#petGame .px-shell');
 if(!room||!shell)return false;
 const h=new Date().getHours();shell.classList.toggle('pet-night',h>=18||h<6);
 if(room.querySelector('.px-room-decor'))return true;
 const d=document.createElement('div');d.className='px-room-decor';d.setAttribute('aria-hidden','true');
 d.innerHTML='<div class="pet-curtain-rod"></div><div class="pet-curtain left"></div><div class="pet-curtain right"></div><div class="pet-lamp"></div><div class="pet-ivy"></div><div class="pet-frame"></div><div class="pet-shelf"></div><div class="pet-scroll"></div><div class="pet-floorplant">🪴</div><div class="pet-toys"></div><div class="pet-prayer-glow"></div><div class="pet-zone life">生活區</div><div class="pet-zone play">活動區</div><div class="pet-zone prayer">祈福角</div><div class="pet-zone song">點歌盲盒</div>';
 room.appendChild(d);return true;
}
let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;inject()})};
new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true});
inject();
})();
