(async()=>{
  try{
    if(location.hostname!=="www.missevan.com"){
      alert("請先打開並登入 www.missevan.com 的主播聲音頁，再執行工具。");
      return;
    }
    const old=document.getElementById("miyu-batch-replay-root");
    if(old){old.remove();return;}

    const USER_ID="24313174";
    const root=document.createElement("div");
    root.id="miyu-batch-replay-root";
    root.style.cssText="position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,.48);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'PingFang SC','Microsoft YaHei',sans-serif;color:#1f2937";

    const panel=document.createElement("div");
    panel.style.cssText="position:absolute;right:0;top:0;height:100%;width:min(760px,96vw);background:#f7f8fb;box-shadow:-12px 0 36px rgba(0,0,0,.18);display:flex;flex-direction:column";
    panel.innerHTML=''
      +'<div style="padding:16px 18px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:10px">'
      +'<b style="font-size:20px">🎧 Miyu 批量回放</b>'
      +'<span style="font-size:12px;color:#6b7280">主播ID '+USER_ID+'</span>'
      +'<button id="mbr-close" style="margin-left:auto;border:0;background:#f3f4f6;border-radius:10px;padding:8px 12px;cursor:pointer">關閉</button>'
      +'</div>'
      +'<div style="padding:12px 16px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;gap:8px;flex-wrap:wrap">'
      +'<button id="mbr-load" style="border:0;border-radius:10px;padding:9px 12px;font-weight:700;cursor:pointer;background:#2563eb;color:#fff">讀取全部聲音</button>'
      +'<button id="mbr-select" disabled style="border:0;border-radius:10px;padding:9px 12px;font-weight:700;cursor:pointer;background:#eef2ff;color:#3730a3">全選目前回放</button>'
      +'<button id="mbr-download" disabled style="border:0;border-radius:10px;padding:9px 12px;font-weight:700;cursor:pointer;background:#ecfdf5;color:#047857">下載已選 128k</button>'
      +'<button id="mbr-clear" disabled style="border:0;border-radius:10px;padding:9px 12px;font-weight:700;cursor:pointer;background:#fee2e2;color:#991b1b">取消選擇</button>'
      +'</div>'
      +'<div id="mbr-status" style="padding:9px 16px;font-size:13px;color:#6b7280;background:#fff;border-bottom:1px solid #e5e7eb">等待读取。</div>'
      +'<div id="mbr-tabs" style="display:flex;gap:8px;padding:10px 16px">'
      +'<button data-tab="replay">直播回放 (0)</button>'
      +'<button data-tab="main">主頁音頻 (0)</button>'
      +'<button data-tab="pending">疑似處理中 (0)</button>'
      +'</div>'
      +'<div id="mbr-list" style="overflow:auto;padding:0 12px 24px;flex:1"></div>';
    root.appendChild(panel);document.body.appendChild(root);

    const $=s=>root.querySelector(s);
    const $$=s=>Array.from(root.querySelectorAll(s));
    let all=[],tab="replay",selected=new Set(),loading=false;
    const status=t=>$("#mbr-status").textContent=t;
    const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
    const fmtDate=ts=>new Date(Number(ts)*1000).toLocaleString("zh-TW",{hour12:false});
    const fmtDur=ms=>{let s=Math.max(0,Math.round((Number(ms)||0)/1000));let h=Math.floor(s/3600),m=Math.floor((s%3600)/60),ss=s%60;return h?`${h}:${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`:`${m}:${String(ss).padStart(2,"0")}`};
    const classify=x=>!x.duration||Number(x.duration)<60000?"pending":String(x.soundstr||"").includes("【回放】")?"replay":"main";

    function duplicates(items){
      const map=new Map(),dup=new Set();
      items.forEach(x=>{const k=[x.soundstr,x.create_time,x.duration].join("|");if(!map.has(k))map.set(k,[]);map.get(k).push(x.id)});
      map.forEach(ids=>{if(ids.length>1)ids.forEach(id=>dup.add(id))});
      return dup;
    }

    function styleTabs(){
      $$("#mbr-tabs button").forEach(b=>{b.style.cssText="border:1px solid #e5e7eb;background:"+(b.dataset.tab===tab?"#111827":"#fff")+";color:"+(b.dataset.tab===tab?"#fff":"#1f2937")+";border-radius:999px;padding:8px 12px;cursor:pointer;font-weight:700"});
    }

    function updateButtons(){
      $("#mbr-select").disabled=!all.some(x=>x._type==="replay");
      $("#mbr-clear").disabled=selected.size===0;
      $("#mbr-download").disabled=selected.size===0;
    }

    function render(){
      const groups={replay:[],main:[],pending:[]};
      all.forEach(x=>groups[x._type].push(x));
      const dup=duplicates(groups.replay);
      $$("#mbr-tabs button").forEach(b=>{const k=b.dataset.tab;b.textContent=(k==="replay"?"直播回放":k==="main"?"主頁音頻":"疑似處理中")+` (${groups[k].length})`});
      styleTabs();
      const list=$("#mbr-list");list.innerHTML="";
      groups[tab].forEach(x=>{
        const row=document.createElement("div");
        row.style.cssText="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:12px;margin:8px 0;display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:start";
        const ck=document.createElement("input");ck.type="checkbox";ck.checked=selected.has(x.id);ck.onchange=()=>{ck.checked?selected.add(x.id):selected.delete(x.id);updateButtons()};
        const body=document.createElement("div");
        body.innerHTML='<div style="font-weight:800">'+esc(x.soundstr||"(無標題)")+(dup.has(x.id)?' <span style="font-size:11px;border-radius:999px;padding:3px 7px;background:#fff7ed;color:#c2410c">疑似重複</span>':'')+'</div><div style="font-size:12px;color:#6b7280;margin-top:5px">'+fmtDate(x.create_time)+' · '+fmtDur(x.duration)+' · ID '+x.id+'</div>';
        const acts=document.createElement("div");acts.style.cssText="display:flex;gap:6px;flex-wrap:wrap";
        const open=document.createElement("button");open.textContent="打開";open.style.cssText="border:0;border-radius:8px;padding:7px 9px;cursor:pointer";open.onclick=()=>window.open('/sound/player?id='+x.id,'_blank');acts.appendChild(open);
        if(tab==="replay"){
          const one=document.createElement("button");one.textContent="下載128k";one.style.cssText="border:0;border-radius:8px;padding:7px 9px;cursor:pointer;background:#ecfdf5;color:#047857;font-weight:700";one.onclick=()=>downloadOne(x,one);acts.appendChild(one);
        }
        row.append(ck,body,acts);list.appendChild(row);
      });
      updateButtons();
    }

    async function loadAll(){
      if(loading)return;loading=true;$("#mbr-load").disabled=true;all=[];selected.clear();
      try{
        let p=1,max=1;
        do{
          status(`讀取第 ${p} 頁…`);
          const r=await fetch(`/person/getusersound?p=${p}&s=&order=0&user_id=${USER_ID}&page_size=10`,{credentials:"include"});
          const j=await r.json();if(!j?.success)throw new Error("列表 API 返回失敗");
          (j.info?.Datas||[]).forEach(x=>{x._type=classify(x);all.push(x)});
          max=j.info?.pagination?.maxpage||p;status(`已讀取 ${p}/${max} 頁，共 ${all.length} 條…`);p++;await new Promise(r=>setTimeout(r,70));
        }while(p<=max);
        status(`完成：共 ${all.length} 條；直播回放 ${all.filter(x=>x._type==="replay").length} 條。`);render();
      }catch(e){status("讀取失敗："+e.message)}finally{loading=false;$("#mbr-load").disabled=false}
    }

    async function getSound(id){
      const r=await fetch(`/sound/getsound?soundid=${id}`,{credentials:"include"});
      const j=await r.json();if(!j?.success||!j?.info?.sound)throw new Error(j?.info?.message||"getsound 無可播放資料");return j.info.sound;
    }

    async function downloadOne(x,btn){
      const old=btn?.textContent;if(btn){btn.disabled=true;btn.textContent="解析中…"}
      try{
        const s=await getSound(x.id);const live=Number(s.catalog_id)===80||String(s.breadcrumb||"").includes("直播");if(!live)throw new Error("getsound 類別不是直播");
        const a=s.dash?.audio?.find(v=>Number(v.id)===128)||s.dash?.audio?.[0];if(!a?.base_url)throw new Error("沒有 128k 音訊地址");
        if(btn)btn.textContent="下載中…";
        const r=await fetch(a.base_url);if(!r.ok)throw new Error("音訊 HTTP "+r.status);const blob=await r.blob();
        const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download=`${new Date(x.create_time*1000).toISOString().slice(0,10)}_${String(x.soundstr||"回放").replace(/[\\/:*?"<>|]/g,"_")}_${x.id}_128k.m4a`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);
        if(btn){btn.textContent="完成";setTimeout(()=>{btn.textContent=old;btn.disabled=false},1000)}return true;
      }catch(e){alert(`ID ${x.id} 下載失敗：${e.message}`);if(btn){btn.textContent=old;btn.disabled=false}return false}
    }

    async function batch(){
      const items=Array.from(selected).map(id=>all.find(x=>x.id===id)).filter(x=>x&&x._type==="replay");if(!items.length){alert("沒有選到直播回放");return}
      if(!confirm(`將逐個下載 ${items.length} 條回放（128k）。瀏覽器可能要求允許多個下載。`))return;
      $("#mbr-download").disabled=true;
      for(let i=0;i<items.length;i++){status(`批量下載 ${i+1}/${items.length}：${items[i].soundstr}`);await downloadOne(items[i]);await new Promise(r=>setTimeout(r,800));}
      status(`批量下載完成：嘗試 ${items.length} 條。`);$("#mbr-download").disabled=false;
    }

    $("#mbr-close").onclick=()=>root.remove();
    $("#mbr-load").onclick=loadAll;
    $("#mbr-select").onclick=()=>{all.filter(x=>x._type==="replay").forEach(x=>selected.add(x.id));render()};
    $("#mbr-clear").onclick=()=>{selected.clear();render()};
    $("#mbr-download").onclick=batch;
    $$("#mbr-tabs button").forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render()});
    styleTabs();
  }catch(e){alert("Miyu 批量回放啟動失敗："+e.message)}
})();