const LOCKED_BABY_CAT_URL = 'https://raw.githubusercontent.com/putincat-123/songbook-web/19568a5f92b268b14f93cd6eaa8e1696bbcf7067/tools/miyu_pet_room_v2_layer2_cat.html';

export async function loadBabyCat() {
  const html = await fetch(LOCKED_BABY_CAT_URL, { cache: 'no-store' }).then((response) => {
    if (!response.ok) throw new Error(`cat ${response.status}`);
    return response.text();
  });

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const svg = doc.querySelector('.pixel-pet');
  if (!svg) throw new Error('locked baby cat sprite missing');

  const imported = document.importNode(svg, true);
  imported.id = 'petSvg';
  imported.querySelectorAll(':scope > g').forEach((group) => {
    if (group.id !== 'pixel-shadow') group.dataset.front = '1';
  });

  addBackSprite(imported);
  setFacing(imported, 'front');
  return imported;
}

function addBackSprite(svg) {
  const ns = 'http://www.w3.org/2000/svg';
  const back = document.createElementNS(ns, 'g');
  back.id = 'back-sprite';
  back.classList.add('motion-bob');

  // Back tail is deliberately first so the body renders in front of it.
  back.innerHTML = `
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
    <g id="back-bib-tie">
      <rect x="35" y="58" width="26" height="3" fill="#d06f9d"/>
      <rect x="44" y="59" width="8" height="6" fill="#c95889"/>
      <rect x="36" y="59" width="9" height="7" fill="#f39ab9"/>
      <rect x="51" y="59" width="9" height="7" fill="#f39ab9"/>
      <rect x="45" y="65" width="3" height="8" fill="#f39ab9"/>
      <rect x="49" y="65" width="3" height="8" fill="#e783aa"/>
    </g>`;

  svg.appendChild(back);
}

export function setFacing(svg, direction) {
  const isBack = direction === 'back';
  svg.querySelectorAll('[data-front="1"]').forEach((node) => {
    node.style.display = isBack ? 'none' : '';
  });
  const back = svg.querySelector('#back-sprite');
  if (back) back.style.display = isBack ? '' : 'none';
}
