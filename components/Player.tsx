import React, { useState, useEffect } from 'react';

type PlayerProps = {
  songId: number | null;
  title: string | null;
  artist: string | null;
  audio: HTMLAudioElement | null;
  isPlaying: boolean;
  onTogglePlayPause: () => void;
  onEnded: () => void;
};

const Player: React.FC<PlayerProps> = ({ songId, title, artist, audio, isPlaying, onTogglePlayPause, onEnded }) => {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (audio) {
      audio.ontimeupdate = () => {
        setProgress((audio.currentTime / audio.duration) * 100);
      };

      audio.onended = () => {
        onEnded();
      };
    }
  }, [audio, onEnded]);

  return (
    <div className="previewPlayer">
      <div className="thumbnail" style={{ backgroundImage: `url(https://b.ppy.sh/thumb/${songId}l.jpg)` }}>
        <button onClick={onTogglePlayPause}>
          <i className={`fa ${isPlaying ? 'fa-pause' : 'fa-play'}`} />
        </button>
      </div>
      <div className="info">
        <div id="previewPlayerTitle">{decodeURI(title || '')}</div>
        <div id="previewPlayerArtist">{decodeURI(artist || '')}</div>
        <div className="progressBar">
          <div id="seekFill" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <style jsx>{`
        .previewPlayer {
          display: flex;
          background: rgba(255, 255, 255, 0.9);
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          position: fixed;
          bottom: 20px;
          left: 20px;
          width: 300px;
          align-items: center;
        }
        .thumbnail {
          width: 60px;
          height: 60px;
          background-size: cover;
          border-radius: 4px;
          margin-right: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .info {
          flex: 1;
        }
        .progressBar {
          background: #ddd;
          height: 5px;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 8px;
        }
        #seekFill {
          background: #4caf50;
          height: 100%;
        }
        #stateButton {
          font-size: 24px;
          color: #333;
        }
      `}</style>
    </div>
  );
};

export default Player;
