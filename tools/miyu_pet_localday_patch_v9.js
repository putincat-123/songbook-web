(()=>{
const KEY='miyu_pet_v1';
const nativeISO=Date.prototype.toISOString;
const localDate=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
Date.prototype.toISOString=function(){
  const iso=nativeISO.call(this);
  return localDate(this)+iso.slice(10);
};
try{
  const raw=localStorage.getItem(KEY);
  if(!raw)return;
  const state=JSON.parse(raw);
  const today=localDate(new Date());
  if(!state.daily||state.daily.date!==today){
    state.daily={date:today,pet:0,play:0,talk:0,incense:0,beads:0,pray:0,wood:0};
    state.food=3;
    localStorage.setItem(KEY,JSON.stringify(state));
  }
}catch(e){console.warn('[miyu-pet] local-day migration skipped',e)}
})();