export const THEMES = {
  purple: {
    body: '#a38ab8',
    wall: ['#aa8ac2', '#c29bbd', '#d5a6ae'],
    floor: ['#9b80b2', '#bd8fae', '#d9a493'],
    sofa: ['#9eb5d7', '#778bc2'],
    curtain: '#dba4d2',
    lamp: '#d77ba7'
  },
  muji: {
    body: '#d9d1bf',
    wall: ['#d8dfd4', '#e8e2d5', '#f2e7d7'],
    floor: ['#c9b28f', '#d8c4a3', '#ead8ba'],
    sofa: ['#c8d6c8', '#aebfae'],
    curtain: '#eee5d5',
    lamp: '#c9b47e'
  },
  sea: {
    body: '#8eb4b3',
    wall: ['#9fc6c5', '#b9d5cf', '#d7e4d7'],
    floor: ['#8eb8b5', '#a7c8bd', '#c6d7c2'],
    sofa: ['#9ccdcc', '#75aaa9'],
    curtain: '#bde2df',
    lamp: '#84b8ac'
  }
};

export async function loadScene({ source = '../miyu_pet_room_v2.html', mount }) {
  const html = await fetch(source, { cache: 'no-store' }).then((response) => {
    if (!response.ok) throw new Error(`scene ${response.status}`);
    return response.text();
  });

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const room = doc.querySelector('svg.room');
  if (!room) throw new Error('scene svg missing');

  // Character and interactive objects never belong to the static scene module.
  room.querySelector('#pet-character-layer')?.remove();
  room.querySelector('#gbody')?.closest('g')?.remove();
  room.querySelector('#rug1')?.closest('g')?.remove();

  // Remove the former altar cabinet; the upper platform remains part of the room.
  const cabinetSeed = [...room.querySelectorAll('rect')].find(
    (node) => node.getAttribute('x') === '278' && node.getAttribute('y') === '326'
  );
  cabinetSeed?.closest('g')?.remove();

  room.removeAttribute('class');
  mount.replaceChildren(document.importNode(room, true));
  return { room: mount.querySelector('svg'), sourceDocument: doc };
}

export function applyTheme(root, themeKey) {
  const theme = THEMES[themeKey] || THEMES.purple;
  document.body.style.background = theme.body;

  const stops = [
    ['w1', theme.wall[0]], ['w2', theme.wall[1]], ['w3', theme.wall[2]],
    ['f1', theme.floor[0]], ['f2', theme.floor[1]], ['f3', theme.floor[2]],
    ['so1', theme.sofa[0]], ['so2', theme.sofa[1]]
  ];
  stops.forEach(([id, color]) => root.querySelector(`#${id}`)?.setAttribute('stop-color', color));
  root.querySelector('#curL')?.setAttribute('fill', theme.curtain);
  root.querySelector('#curR')?.setAttribute('fill', theme.curtain);
  root.querySelector('#lamp')?.setAttribute('fill', theme.lamp);
}
