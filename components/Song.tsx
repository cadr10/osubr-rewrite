import React from "react";
import DifficultyIcon from './DifficultyIcon';

export type SongProps = {
  id: number;
  title: string;
  artist: string;
  bpm: GLfloat;
  status: string;
  user_id: number;
  creator: string;
  username: string;
  diffs: Array<{ mode: number; stars: number; }>;
  last_updated: string;
  thumbnail: string;
  nsfw: boolean;
  tags: string;
  genres: string;
  uuid: String;
};

const Difficulty = ({ mode, stars }) => {
  const svgElement = new DifficultyIcon(mode, stars).getSVG();
  return svgElement;
};

const Song: React.FC<{ song: SongProps; isPlaying: boolean; onClick: () => void; }> = ({ song, isPlaying, onClick }) => {
  return (
    <div className="song">
      <div className="hoverSideOptions">
        <i
          className="fa-solid fa-download"
          onClick={(e) => {
            e.stopPropagation();
            window.open(`osu://s/${song.id}`);
          }}
        ></i>
      </div>

      <div className="thumbnail" onClick={onClick}>
        <img src={song.thumbnail} alt={`Thumbnail for ${song.title}`} />
        <div className="previewButton">
          <i className={`fa-solid fa-${isPlaying ? 'pause' : 'play'}`}></i>
        </div>
      </div>

      <a className="title" href={`https://osu.ppy.sh/beatmapsets/${song.id}`} target="_blank" rel="noopener noreferrer">
        {song.title}
      </a>

      <div className="artist">{song.artist}</div>

      <a className="creator" href={`https://osu.ppy.sh/users/${song.user_id}`} target="_blank" rel="noopener noreferrer">
        {song.username}</a>

      <div className="difficulties">
        {song.diffs
          .sort((a, b) => a.stars - b.stars)
          .sort((a, b) => a.mode - b.mode)
          .map((diff, index) => (
            <Difficulty key={index} mode={diff.mode} stars={diff.stars} />
          ))}
      </div>
    </div>
  );
};

export default Song;