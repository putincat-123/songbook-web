(() => {
  const KEY='miyu_pet_wood_daily';
  const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
  const write=s=>localStorage.setItem(KEY,JSON.stringify(s));
  const messages={
    10:'🪵 已敲 10 下｜渐入佳境，功德开始累积了～',
    30:'🪵 已敲 30 下｜今天看来真的很需要欧气 😂',
    50:'🪵 已敲 50 下｜临海居功德值正在发光 ✨',
    100:'🪵 已敲 100 下｜功德圆满！不过还可以继续敲 😆'
  };
  document.addEventListener('click',e=>{
    const c=e.target;
    if(!c||c.id!=='pxRoom')return;
    const r=c.getBoundingClientRect();
    const x=(e.clientX-r.left)*320/r.width,y=(e.clientY-r.top)*430/r.height;
    if(Math.hypot(x-82,y-248)>29)return;
    const t=today();
    let s=read();
    if(s.date!==t)s={date:t,count:0};
    s.count=(Number(s.count)||0)+1;
    write(s);
    const msg=messages[s.count]||(s.count>100&&s.count%100===0?`🪵 今日已敲 ${s.count} 下｜功德继续累积中 🙏`:null);
    if(msg)setTimeout(()=>{const b=document.getElementById('pxBubble');if(b)b.textContent=msg},30);
  });
})();
