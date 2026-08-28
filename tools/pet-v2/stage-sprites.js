const STAGE_SOURCES = {
  baby: 'https://raw.githubusercontent.com/putincat-123/songbook-web/19568a5f92b268b14f93cd6eaa8e1696bbcf7067/tools/miyu_pet_room_v2_layer2_cat.html',
  teen: 'https://raw.githubusercontent.com/putincat-123/songbook-web/d96af6e4e33c9f9735b646bc1b0e079f6a31014b/tools/miyu_pet_room_v2_layer2_cat.html',
  adult: 'https://raw.githubusercontent.com/putincat-123/songbook-web/90ede5ca9e50b037f5cdbbc982cebbcd731c9d5a/tools/miyu_pet_room_v2_layer2_cat.html'
};

const NS = 'http://www.w3.org/2000/svg';

async function loadSource(stage) {
  const url = STAGE_SOURCES[stage];
  if (!url) throw new Error(`unknown stage: ${stage}`);
  const html = await fetch(url, { cache: 'no-store' }).then((response) => {
    if (!response.ok) throw new Error(`${stage} sprite ${response.status}`);
    return response.text();
  });
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const svg = doc.querySelector('.pixel-pet');
  if (!svg) throw new Error(`${stage} sprite missing`);
  const out = document.importNode(svg, true);
  out.removeAttribute('id');
  out.dataset.stage = stage;
  return out;
}

function removeStageAccessories(svg) {
  svg.querySelector('#pixel-accessory')?.remove();
  svg.querySelector('#pixel-clothes')?.remove();
}

function insertLayer(svg, id, markup, beforeSelector = '#pixel-head') {
  const group = document.createElementNS(NS, 'g');
  group.id = id;
  const temp = document.createElementNS(NS, 'svg');
  temp.innerHTML = markup;
  while (temp.firstChild) group.appendChild(temp.firstChild);
  const before = svg.querySelector(beforeSelector);
  before ? svg.insertBefore(group, before) : svg.appendChild(group);
  return group;
}

function dressFront(svg, stage) {
  removeStageAccessories(svg);
  if (stage === 'baby') {
    insertLayer(svg, 'pixel-clothes', `
      <rect x="34" y="59" width="28" height="3" fill="#d06f9d"/>
      <path d="M37 62h22v5h-3v5H40v-5h-3z" fill="#f4a8c2"/>
      <rect x="43" y="63" width="10" height="3" fill="#ffd0df"/>`);
    insertLayer(svg, 'pixel-accessory', `
      <rect x="44" y="58" width="8" height="7" fill="#67483d"/>
      <rect x="46" y="59" width="4" height="4" fill="#f2bd4e"/>
      <rect x="47" y="60" width="2" height="2" fill="#ffe38a"/>
      <rect x="30" y="21" width="6" height="3" fill="#d06f9d"/>
      <rect x="27" y="19" width="4" height="6" fill="#f4a8c2"/>
      <rect x="35" y="19" width="4" height="6" fill="#f4a8c2"/>`);
  }
  if (stage === 'teen') {
    insertLayer(svg, 'pixel-clothes', `
      <path d="M34 61h28v4h3v30h-7V73H38v22h-7V65h3z" fill="#88a9d4"/>
      <rect x="40" y="64" width="16" height="4" fill="#b8ccec"/>
      <path d="M56 63h4v7h3v8h3v17h-5V80h-3v-9h-2z" fill="#795a8d"/>`);
    insertLayer(svg, 'pixel-accessory', `
      <rect x="60" y="89" width="10" height="11" rx="2" fill="#67483d"/>
      <rect x="62" y="91" width="6" height="7" fill="#b786a8"/>
      <rect x="64" y="93" width="2" height="2" fill="#f2bd4e"/>`);
  }
  if (stage === 'adult') {
    insertLayer(svg, 'pixel-clothes', `
      <path d="M34 61h10v5h8v-5h10v5h4v31h-8V76H38v21h-8V66h4z" fill="#59617f"/>
      <path d="M39 64h5v6h8v-6h5v8h3v24h-6V80H42v16h-6V72h3z" fill="#737c9f"/>
      <rect x="45" y="71" width="6" height="4" fill="#d8b65a"/>`);
    insertLayer(svg, 'pixel-accessory', `
      <rect x="55" y="76" width="5" height="5" fill="#67483d"/>
      <rect x="56" y="77" width="3" height="3" fill="#f0c65a"/>`);
  }
}

function commonBack(stage) {
  const scale = stage === 'baby' ? 1 : stage === 'teen' ? 1.04 : 1.08;
  const yOffset = stage === 'baby' ? 0 : stage === 'teen' ? -2 : -4;
  const outfit = backOutfit(stage);
  return `
    <g transform="translate(${48 - 48 * scale} ${yOffset}) scale(${scale})">
      <g id="back-tail">
        <path d="M61 72h8v3h6v3h5v6h2v7h-3v5h-5v4h-8v3h-7v-8h6v-3h5v-4h4v-5h-3v-3h-5v3h-5z" fill="#67483d"/>
        <path d="M64 75h5v3h5v3h3v5h1v4h-3v4h-5v3h-6v3h-2v-5h5v-4h4v-4h3v-4h-3v-2h-4v2h-3z" fill="#d98c53"/>
      </g>
      <g id="back-legs">
        <circle cx="38" cy="99" r="7" fill="#67483d"/><circle cx="38" cy="99" r="4.5" fill="#fff0d2"/>
        <circle cx="58" cy="99" r="7" fill="#67483d"/><circle cx="58" cy="99" r="4.5" fill="#fff0d2"/>
      </g>
      <g id="back-body">
        <path d="M31 58h34v5h5v9h3v18h-4v8h-7v5H34v-5h-7v-8h-4V72h3v-9h5z" fill="#67483d"/>
        <path d="M35 61h26v4h5v8h3v14h-4v7h-6v4H37v-4h-6v-7h-4V73h3v-8h5z" fill="#f0bc79"/>
        <rect x="40" y="67" width="16" height="4" fill="#d98c53"/>
      </g>
      ${outfit}
      <g id="back-arms">
        <circle cx="27" cy="80" r="9" fill="#67483d"/><circle cx="27" cy="80" r="6" fill="#f0bc79"/>
        <circle cx="69" cy="80" r="9" fill="#67483d"/><circle cx="69" cy="80" r="6" fill="#f0bc79"/>
      </g>
      <g id="back-head">
        <path d="M24 23h2V14h4v-4h5v3h5v9h-4v5H24zM56 13h5v-3h5v4h4v9h2v4H58v-5h-4v-9z" fill="#67483d"/>
        <path d="M34 20h28v2h6v3h5v5h4v17h-2v7h-5v5h-7v4H33v-4h-7v-5h-5v-7h-2V30h4v-5h5v-3h6z" fill="#67483d"/>
        <path d="M35 22h26v2h6v4h4v5h3v13h-2v7h-5v4h-6v3H35v-3h-6v-4h-5v-7h-2V33h3v-5h4v-4h6z" fill="#f0bc79"/>
        <path d="M38 24h20v2h6v4h4v5h2v10h-3v6h-5v4h-7v3H41v-3h-7v-4h-5v-6h-3V35h2v-5h4v-4h6z" fill="#ffd89a"/>
        <rect x="47" y="24" width="3" height="11" fill="#bd6c42"/>
        <rect x="40" y="27" width="4" height="8" fill="#bd6c42"/>
        <rect x="54" y="27" width="4" height="8" fill="#bd6c42"/>
      </g>
    </g>`;
}

function backOutfit(stage) {
  if (stage === 'baby') {
    return `<g id="back-outfit">
      <rect x="35" y="58" width="26" height="3" fill="#d06f9d"/>
      <rect x="44" y="59" width="8" height="6" fill="#c95889"/>
      <rect x="36" y="59" width="9" height="7" fill="#f39ab9"/>
      <rect x="51" y="59" width="9" height="7" fill="#f39ab9"/>
      <rect x="45" y="65" width="3" height="8" fill="#f39ab9"/>
      <rect x="49" y="65" width="3" height="8" fill="#e783aa"/>
    </g>`;
  }
  if (stage === 'teen') {
    return `<g id="back-outfit">
      <path d="M34 61h28v4h3v30h-7V73H38v22h-7V65h3z" fill="#88a9d4"/>
      <rect x="40" y="64" width="16" height="4" fill="#b8ccec"/>
      <path d="M38 62h5v8h4v8h5v8h5v9h-5v-7h-5v-8h-5v-8h-4z" fill="#795a8d"/>
      <rect x="29" y="87" width="10" height="11" rx="2" fill="#67483d"/>
      <rect x="31" y="89" width="6" height="7" fill="#b786a8"/>
    </g>`;
  }
  return `<g id="back-outfit">
    <path d="M34 61h10v5h8v-5h10v5h4v31h-8V76H38v21h-8V66h4z" fill="#59617f"/>
    <path d="M39 64h5v6h8v-6h5v8h3v24h-6V80H42v16h-6V72h3z" fill="#737c9f"/>
    <rect x="42" y="68" width="12" height="3" fill="#4c536f"/>
  </g>`;
}

function buildBack(stage) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 96 120');
  svg.setAttribute('class', 'pixel-pet');
  svg.dataset.stage = stage;
  svg.dataset.facing = 'back';
  svg.innerHTML = `<ellipse cx="48" cy="107" rx="25" ry="5" fill="#67483d" opacity=".2"/>${commonBack(stage)}`;
  return svg;
}

export async function loadStageFace(stage, facing) {
  if (facing === 'back') return buildBack(stage);
  const svg = await loadSource(stage);
  dressFront(svg, stage);
  svg.dataset.facing = 'front';
  return svg;
}

export const STAGES = ['baby', 'teen', 'adult'];
