const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const bankPath = path.join(root, 'data/miyu/daily_topic_bank.json');
const outPath = path.join(root, 'data/miyu/daily_topics.json');

const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
const topics = Array.isArray(bank.topics) ? bank.topics : [];
if (topics.length < 5) throw new Error('daily topic bank needs at least 5 topics');

function taipeiDateParts() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const get = type => parts.find(p => p.type === type)?.value;
  return { year: get('year'), month: get('month'), day: get('day') };
}

function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRandom(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, seed) {
  const arr = [...list];
  const rnd = seededRandom(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const { year, month, day } = taipeiDateParts();
const date = `${year}-${month}-${day}`;
const picked = shuffle(topics, hashString(`miyu|${date}|daily-topics`)).slice(0, 5);

const output = {
  date,
  source_scope: ['直播互动题库'],
  generation: 'daily-seeded-rotation',
  topics: picked.map((topic, i) => ({
    ...topic,
    background: topic.background || '从日常生活、音乐、通勤、吃喝与社交等高参与主题中轮换，优先选择公屏容易直接回答的问题。',
    sources: topic.sources || ['直播互动题库'],
    talkability: topic.talkability || 5,
    recommended: i === 0
  }))
};

fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');
console.log(`updated ${outPath} for ${date} with ${picked.length} topics`);
