import React from 'react';
import DifficultyIcon from './DifficultyIcon';

export interface Song {
  id: number;
  title: string;
  artist: string;
  creator?: string;
  username?: string;
  user_id?: number;
  bpm?: number;
  status?: string;
  last_updated?: string;
  thumbnail?: string;
  nsfw?: boolean;
  tags?: string;
  genres: string[] | string;
  diffs?: { mode: number; stars: number }[];
  uuid?: string;
}

interface Props {
  song: Song;
  isPlaying: boolean;
  onClick: () => void;
}

const Difficulty = ({ mode, stars }: { mode: number, stars: number }) => {
  return <DifficultyIcon diff={{ mode, stars }} small={true} />; // Pass the small prop
};

const Song: React.FC<Props> = ({ song, isPlaying, onClick }) => {
  const coverUrl = `https://assets.ppy.sh/beatmaps/${song.id}/covers/list.jpg`;
  const beatmapUrl = `https://osu.ppy.sh/beatmapsets/${song.id}`;
  const userUrl = `https://osu.ppy.sh/users/${song.user_id}`;

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`osu://s/${song.id}`);
  };

  return (
    <div className="song">
      <div className="hoverSideOptions">
        <i
          className="fa-solid fa-download"
          onClick={handleDownload}
          title="Download with osu!direct"
        ></i>
      </div>

      <div className="thumbnail" onClick={onClick}>
        <img
          src={coverUrl}
          alt={`${song.title} cover`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/nothumb.jpg';
          }}
        />
        <div className="previewButton">
          <i className={`fa-solid fa-${isPlaying ? 'pause' : 'play'}`}></i>
        </div>
      </div>

      <a className="title" href={beatmapUrl} target="_blank" rel="noopener noreferrer" onClick={stopPropagation} title={song.title}>
        {song.title}
      </a>
      <div className="artist">{song.artist}</div>
      <a className="creator" href={userUrl} target="_blank" rel="noopener noreferrer" onClick={stopPropagation}>
        {song.username}
      </a>
      <div className="difficulties">
        {Array.isArray(song.diffs) && song.diffs
          .sort((a, b) => a.mode - b.mode || a.stars - b.stars)
          .map((diff, index) => (
            <Difficulty key={index} mode={diff.mode} stars={diff.stars} />
          ))}
      </div>
    </div>
  );
};

export default Song;