const fs = require('fs');

const toplists = [
  { id: 26, name: 'hot' },
  { id: 27, name: 'new' },
  { id: 62, name: 'rise' },
  { id: 4, name: 'popular' },
];

async function fetchToplist(top) {
  const url = `https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?type=top&topid=${top.id}`;

  const res = await fetch(url, {
    headers: {
      referer: 'https://y.qq.com/',
      'user-agent': 'Mozilla/5.0',
    },
  });

  const text = await res.text();

  const jsonText = text
    .replace(/^callback\(/, '')
    .replace(/\);$/, '');

  const json = JSON.parse(jsonText);

  const songs = json.songlist || [];

  return songs.slice(0, 20).map((s, index) => ({
    name: s.data.songname,
    artist: s.data.singer.map(v => v.name).join('/'),
    rank: index + 1,
    source: top.name,
  }));
}

async function main() {
  const merged = new Map();

  for (const top of toplists) {
    console.log('fetch', top.name);

    const songs = await fetchToplist(top);

    for (const song of songs) {
      const key = `${song.name}__${song.artist}`;

      if (!merged.has(key)) {
        merged.set(key, {
          name: song.name,
          artist: song.artist,
          sources: [],
        });
      }

      merged.get(key).sources.push({
        source: song.source,
        rank: song.rank,
      });
    }
  }

  const result = {
    provider: 'qq_music',
    updatedAt: new Date().toISOString(),
    songs: Array.from(merged.values())
      .map(song => ({
        ...song,
        sourceCount: song.sources.length,
        bestRank: Math.min(
          ...song.sources.map(v => v.rank)
        ),
      }))
      .sort((a, b) => {
        if (b.sourceCount !== a.sourceCount) {
          return b.sourceCount - a.sourceCount;
        }

        return a.bestRank - b.bestRank;
      }),
  };

  fs.mkdirSync('data/miyu', { recursive: true });

  fs.writeFileSync(
    'data/miyu/qq-hot.json',
    JSON.stringify(result, null, 2)
  );

  console.log('done');
}

main();