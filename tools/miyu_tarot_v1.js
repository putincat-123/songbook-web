(() => {
  const $ = id => document.getElementById(id);
  if (!$('tarotDrawBtn')) return;

  const TOPICS = {
    today:{label:'今日提醒', intro:'今天这张牌想提醒你：'},
    love:{label:'感情', intro:'放在感情这件事上，这张牌比较像在说：'},
    work:{label:'工作', intro:'放在工作与行动上，这张牌提醒你：'},
    mood:{label:'状态', intro:'如果看你现在的状态，这张牌像是在说：'}
  };

  const MAJORS = [
    ['愚者','☀︎','开始|自由|尝试','冒进|犹豫|缺乏准备','允许自己往前迈一步，不必等所有答案都齐全。','先别急着冲，确认方向和边界之后再行动。'],
    ['魔术师','✦','行动|资源|创造','分心|失衡|有力无处使','你手上的资源已经比想象中多，重点是把它们真正用起来。','不是没有能力，而是力量有点分散；先把注意力收回来。'],
    ['女祭司','☾','直觉|观察|内在','封闭|忽略直觉|信息不足','不用马上给答案，先听听自己真正的感觉。','你可能听见了很多声音，却暂时没听见自己；先保留判断。'],
    ['皇后','❀','丰盛|照顾|滋养','过度付出|匮乏感|忽略自己','把力气放在会长大的事情上，也记得照顾自己的感受。','你可能给出去太多了，今天更需要把一点温柔留给自己。'],
    ['皇帝','♔','秩序|边界|稳定','僵化|控制|压力','把规则和优先级立起来，会比一味用力更有效。','有些控制已经变成压力；试着留一点弹性。'],
    ['教皇','⌘','传统|学习|指引','质疑|打破惯例|自我定义','成熟的方法值得借鉴，今天适合向经验或可靠的人求证。','旧方法不一定适合现在，你可以重新定义自己的做法。'],
    ['恋人','♡','选择|连结|一致','摇摆|价值冲突|沟通不足','真正重要的不是选得漂亮，而是选择与你在意的东西一致。','有些不舒服来自彼此期待没对齐，先把真正的需求说清楚。'],
    ['战车','➶','推进|意志|掌控','失速|焦躁|方向混乱','方向确定之后就往前走，不要把力气浪费在反复怀疑。','先把速度降下来；冲得快不等于走在对的方向。'],
    ['力量','♌','勇气|耐心|温柔坚定','消耗|自我怀疑|压抑','你不需要证明得很大声，稳定本身就是一种力量。','你可能已经撑了一阵子；先恢复能量，再处理眼前的问题。'],
    ['隐者','✧','独处|思考|寻找答案','封闭|疏离|钻牛角尖','今天适合安静一点，把答案从外界收回到自己身上。','思考已经够多了，别让独处变成困住自己的房间。'],
    ['命运之轮','◎','变化|转机|周期','停滞|反复|抗拒变化','局面正在动，顺着新的机会调整，会比硬撑原计划更轻松。','有些事正在重复出现，它可能在提醒你需要换一种处理方式。'],
    ['正义','⚖','平衡|事实|选择结果','偏见|失衡|逃避责任','回到事实和原则，今天适合做一个清楚、可承担的决定。','先别急着替任何一边辩护，把遗漏的事实补齐。'],
    ['倒吊人','▽','暂停|换角度|放下','拖延|卡住|无谓牺牲','暂时不动也可以；换个角度，可能比硬推更快。','别把等待包装成忍耐，有些卡住需要一个明确的决定。'],
    ['死神','✣','结束|转变|更新','抗拒结束|停留过去|迟迟不放','有些东西走到尾声，是为了给新的阶段腾位置。','你可能知道该放下什么了，只是还没准备承认。'],
    ['节制','⚗','协调|节奏|整合','过量|失衡|急于求成','不用一次做到满分，找到能长期持续的节奏更重要。','最近可能有点过头，先把生活或情绪拉回中间。'],
    ['恶魔','♑','欲望|束缚|依赖','松绑|看清执念|脱离','看看是什么在牵着你走；看见它，就已经有机会改变。','你正在慢慢脱离某种束缚，别因为不习惯自由又走回去。'],
    ['高塔','⚡','突变|真相|打破旧结构','余震|避免冲击|内在重整','突如其来的变化未必舒服，但会让不稳的东西显出来。','表面看似没事，内在可能仍在震荡；允许自己慢慢整理。'],
    ['星星','★','希望|疗愈|方向感','失望|信心不足|需要恢复','不用急着看到结果，先相信自己正在往更清楚的地方走。','希望还在，只是能量偏低；今天更适合恢复，而不是勉强乐观。'],
    ['月亮','☽','情绪|潜意识|不确定','揭开迷雾|恐惧减弱|真相浮现','现在的信息还不够完整，感受可以参考，但别急着下结论。','有些担心开始变得可理解；把模糊的地方一件件说清楚。'],
    ['太阳','☀','清晰|快乐|生命力','延迟的快乐|疲惫|过度乐观','今天适合把好消息、好状态和真实的自己放到阳光下。','不是没有好事，只是你可能太累而没感觉到；先把电充回来。'],
    ['审判','♩','觉醒|回顾|重新出发','自责|迟疑|逃避召唤','过去的经验正在告诉你下一步怎么走，别浪费已经学会的东西。','别一直用过去审判现在的自己；该做的是整理，然后继续。'],
    ['世界','◉','完成|整合|进入新阶段','未完待续|缺最后一步|收尾','一段路正在完成，记得承认自己的进展，再走向下一站。','已经很接近完成了，把最后一个缺口补上，不必重新来过。']
  ];

  const SUITS = {
    '权杖':{symbol:'🔥',up:['行动','热情','推动'],rev:['急躁','耗能','受阻']},
    '圣杯':{symbol:'💧',up:['感受','关系','直觉'],rev:['情绪失衡','误解','压抑']},
    '宝剑':{symbol:'🗡️',up:['思考','沟通','判断'],rev:['内耗','混乱','过度思考']},
    '星币':{symbol:'◈',up:['现实','资源','稳定'],rev:['失衡','延迟','基础不稳']}
  };
  const RANKS = [
    ['Ace','王牌','一个新的入口正在出现，先抓住最核心的机会。','机会并非没有，只是条件还没完全成熟。'],
    ['2','二','你正在两种可能之间调整，先确认真正的优先级。','摇摆太久会消耗能量，需要更明确的取舍。'],
    ['3','三','事情进入合作与扩展期，别只靠自己一个人扛。','合作或推进节奏不一致，先把期待讲清楚。'],
    ['4','四','稳定下来、守住已有成果，会比继续加码更重要。','过度守成可能变成停滞，适合松一点手。'],
    ['5','五','眼前有摩擦或落差，但它也会暴露真正的问题。','冲突开始缓和，重点是别把旧情绪继续带回来。'],
    ['6','六','事情有机会往更顺的方向移动，也适合接住支持。','别因为在意评价而忘了自己真正想要什么。'],
    ['7','七','现在需要耐心与判断，不必每一个选项都抓住。','选择太多反而失焦，先删掉不重要的。'],
    ['8','八','进展会变快，适合专注执行，把节奏接起来。','速度被打断，先处理卡点，而不是继续催自己。'],
    ['9','九','你已经走了很远，守住最后一段，不用急着证明。','疲惫感很明显，休息不是退步。'],
    ['10','十','一个阶段来到高点，也意味着需要重新分配负担。','负担已经过量，该放掉不属于你的那一部分。'],
    ['Page','侍从','保持好奇，会有新的消息、想法或学习机会出现。','信息还不成熟，别因为一时兴奋就直接下结论。'],
    ['Knight','骑士','行动力正在上来，选定方向后就认真推进。','冲太快容易忽略细节，先确认再出发。'],
    ['Queen','皇后','成熟的感受与判断正在帮你稳定局面。','照顾别人之前，先确认自己还有没有余裕。'],
    ['King','国王','适合用更成熟、长期的眼光处理这件事。','过度坚持自己的方式，反而可能让局面变僵。']
  ];

  const deck = [
    ...MAJORS.map((x,i)=>({name:x[0],symbol:x[1],upKeys:x[2],revKeys:x[3],up:x[4],rev:x[5],group:'大阿卡纳',code:i})),
    ...Object.entries(SUITS).flatMap(([suit,s])=>RANKS.map((r,i)=>({
      name:suit+r[1], symbol:s.symbol, upKeys:s.up.join('|'), revKeys:s.rev.join('|'),
      up:r[2]+' '+minorTail(suit,false), rev:r[3]+' '+minorTail(suit,true), group:suit, code:i+1
    })))
  ];

  function minorTail(suit,rev){
    const tails={
      '权杖':rev?'行动之前先把节奏稳住。':'把想法落实成一个具体动作。',
      '圣杯':rev?'先分清感受与事实，再决定怎么回应。':'允许感受存在，也留一点空间给彼此。',
      '宝剑':rev?'减少脑内反复，把问题写清楚会有帮助。':'把话说清楚、把判断建立在事实之上。',
      '星币':rev?'先顾好现实条件与资源分配。':'从可执行的小事开始，稳稳累积。'
    }; return tails[suit];
  }

  let topic='today', current=null;
  document.querySelectorAll('.tarot-topic').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.tarot-topic').forEach(x=>x.classList.toggle('active',x===btn));
    topic=btn.dataset.topic;
  }));

  function draw(){
    const card=deck[Math.floor(Math.random()*deck.length)];
    const reversed=$('tarotUseReverse').checked && Math.random()<.5;
    current={card,reversed,topic};
    $('tarotCard').classList.remove('revealed');
    $('tarotDrawBtn').disabled=true;
    setTimeout(()=>{
      $('tarotSymbol').textContent=card.symbol;
      $('tarotName').textContent=card.name;
      $('tarotPosition').textContent=reversed?'逆位':'正位';
      $('tarotPosition').className='tarot-position'+(reversed?' reverse':'');
      $('tarotResultTopic').textContent='FOR '+TOPICS[topic].label;
      const keys=(reversed?card.revKeys:card.upKeys).split('|');
      $('tarotKeywords').innerHTML=keys.map(k=>'<span>'+k+'</span>').join('');
      $('tarotReading').textContent=TOPICS[topic].intro+' '+(reversed?card.rev:card.up);
      $('tarotClosing').textContent=closing(card,reversed,topic);
      $('tarotCard').classList.add('revealed');
      $('tarotCopyBtn').disabled=false;
      $('tarotAgainBtn').disabled=false;
      $('tarotDrawBtn').disabled=false;
    },180);
  }

  function closing(card,reversed,topic){
    const lines={
      today:'这一张，就当是今天临海居送你的签。',
      love:'不用急着替关系下结论，先照顾好真实的感受。',
      work:'先把今天能做的一步做好，答案会比原地想更清楚。',
      mood:'今天不必把自己调整到完美，知道自己在哪里就很好。'
    };
    return lines[topic];
  }

  function copyResult(){
    if(!current)return;
    const {card,reversed,topic}=current;
    const text='🔮 '+TOPICS[topic].label+'｜'+card.name+'（'+(reversed?'逆位':'正位')+'）\n'+
      TOPICS[topic].intro+' '+(reversed?card.rev:card.up)+'\n'+closing(card,reversed,topic);
    navigator.clipboard?.writeText(text).then(()=>{
      const t=$('toast'); if(t){t.textContent='✅ 塔罗结果已复制';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1300);}
    }).catch(()=>{});
  }

  $('tarotDrawBtn').addEventListener('click',draw);
  $('tarotAgainBtn').addEventListener('click',draw);
  $('tarotCopyBtn').addEventListener('click',copyResult);
})();