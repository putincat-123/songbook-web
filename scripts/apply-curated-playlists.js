const fs = require('fs');
const path = require('path');

const SONGS_PATH = path.join(
  __dirname,
  '../data/miyu/songs.json'
);

const PLAYLISTS_PATH = path.join(
  __dirname,
  '../data/miyu/curated-playlists.json'
);

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKC')
    .replace(/\s+/g, '')
    .trim();
}

const songs = JSON.parse(
  fs.readFileSync(SONGS_PATH, 'utf8')
);

const playlists = JSON.parse(
  fs.readFileSync(PLAYLISTS_PATH, 'utf8')
);

let matchedCount = 0;

playlists.forEach(playlist => {

  const playlistTags = Array.isArray(playlist.tags)
    ? playlist.tags
    : [];

  const playlistTitle = playlist.title || '';

  const playlistSongs = Array.isArray(playlist.songs)
    ? playlist.songs
    : [];

  playlistSongs.forEach(targetSong => {

    const targetName = normalize(targetSong.name);
    const targetArtist = normalize(targetSong.artist);

    const matched = songs.find(song => {

      const songName = normalize(
        song.songName || song.name
      );

      const songArtist = normalize(
        song.artist
      );

      const nameMatched =
        songName === targetName;

      const artistMatched =
        !targetArtist ||
        !songArtist ||
        songArtist === targetArtist;

      return nameMatched && artistMatched;

    });

    if (!matched) return;

    matched.crowdPlaylistTags = [
      ...new Set([
        ...(matched.crowdPlaylistTags || []),
        ...playlistTags
      ])
    ];

    matched.crowdPlaylistSources = [
      ...new Set([
        ...(matched.crowdPlaylistSources || []),
        playlistTitle
      ])
    ];

    matched.aiMetadataSource = 'crowd_playlist';

    matchedCount++;

    console.log(
      `✅ ${matched.songName || matched.name}`
    );

  });

});

fs.writeFileSync(
  SONGS_PATH,
  JSON.stringify(songs, null, 2),
  'utf8'
);

console.log('');
console.log(`🎉 完成，共匹配 ${matchedCount} 首歌`);