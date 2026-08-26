(()=>{
const KEY='miyu_pet_v1',FOOD_MAX=5,FOOD_MIGRATION='miyu_pet_food5_v1';
const nativeISO=Date.prototype.toISOString;
const nativeSetItem=Storage.prototype.setItem;
const localDate=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
Date.prototype.toISOString=function(){
  const iso=nativeISO.call(this);
  return localDate(this)+iso.slice(10);
};
function normalizePetState(raw,previousRaw){
  try{
    const state=JSON.parse(raw),today=localDate(new Date());
    let previous=null;
    try{previous=previousRaw?JSON.parse(previousRaw):null}catch{}
    const crossedDay=!!previous?.daily?.date&&state?.daily?.date===today&&previous.daily.date!==state.daily.date;
    const firstSave=!previous&&state?.petId;
    if(crossedDay||firstSave)state.food=FOOD_MAX;
    return JSON.stringify(state);
  }catch{return raw}
}
Storage.prototype.setItem=function(key,value){
  if(key===KEY){
    let previousRaw=null;
    try{previousRaw=this.getItem(KEY)}catch{}
    value=normalizePetState(String(value),previousRaw);
  }
  return nativeSetItem.call(this,key,value);
};
try{
  const raw=localStorage.getItem(KEY);
  if(!raw)return;
  const state=JSON.parse(raw);
  const today=localDate(new Date());
  let changed=false;
  if(!state.daily||state.daily.date!==today){
    state.daily={date:today,pet:0,play:0,talk:0,incense:0,beads:0,pray:0,wood:0};
    state.food=FOOD_MAX;
    changed=true;
  }
  if(localStorage.getItem(FOOD_MIGRATION)!=='1'){
    state.food=Math.min(FOOD_MAX,Math.max(Number(state.food)||0,FOOD_MAX));
    nativeSetItem.call(localStorage,FOOD_MIGRATION,'1');
    changed=true;
  }
  if(changed)nativeSetItem.call(localStorage,KEY,JSON.stringify(state));
}catch(e){console.warn('[miyu-pet] local-day migration skipped',e)}
})();