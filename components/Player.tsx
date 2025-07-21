import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Song } from './Song';

export const useAudioPlayer = () => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleSongClick = useCallback((song: Song) => {
    if (currentSong?.id === song.id) {
      if (audio) {
        isPlaying ? audio.pause() : audio.play();
        setIsPlaying(!isPlaying);
      }
    } else {
      audio?.pause();
      const newAudio = new Audio(`https://b.ppy.sh/preview/${song.id}.mp3`);
      newAudio.volume = 0.5;
      newAudio.play().catch(e => console.error("Audio play failed:", e));

      newAudio.onplay = () => setIsPlaying(true);
      newAudio.onpause = () => setIsPlaying(false);
      newAudio.onended = () => {
        setIsPlaying(false);
        setCurrentSong(null);
      };

      setAudio(newAudio);
      setCurrentSong(song);
    }
  }, [audio, currentSong, isPlaying]);

  const handleTogglePlayPause = useCallback(() => {
    if (audio) {
      isPlaying ? audio.pause() : audio.play();
      setIsPlaying(!isPlaying);
    }
  }, [audio, isPlaying]);

  useEffect(() => {
    return () => {
      audio?.pause();
    };
  }, [audio]);

  return { currentSong, isPlaying, handleSongClick, handleTogglePlayPause, audio };
};

type PlayerProps = {
  song: Song | null;
  audio: HTMLAudioElement | null;
  isPlaying: boolean;
  onTogglePlayPause: () => void;
};

const Player: React.FC<PlayerProps> = ({ song, audio, isPlaying, onTogglePlayPause }) => {
  const [progress, setProgress] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateProgress = () => {
      if (audio) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    if (audio) {
      audio.addEventListener('timeupdate', updateProgress);
      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
      };
    }
  }, [audio]);

  const handleSeek = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (progressBarRef.current && audio) {
      const bar = progressBarRef.current;
      const rect = bar.getBoundingClientRect();
      const seekPosition = (event.clientX - rect.left) / rect.width;
      audio.currentTime = seekPosition * audio.duration;
    }
  };

  if (!song || !audio) {
    return null;
  }

  const isPlayerHidden = !song;

  return (
    <div className={`previewPlayer ${isPlayerHidden ? 'hidden' : ''}`}>
      <div className="metadataContainer">
        <div
          className="thumbnail"
          style={{ backgroundImage: `url(https://assets.ppy.sh/beatmaps/${song.id}/covers/list.jpg)` }}
        ></div>
        <div className="metadata">
          <div className="title">{song.title}</div>
          <div className="artist">{song.artist}</div>
        </div>
      </div>
      <div className="controls">
        <div className="state" onClick={onTogglePlayPause}>
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
        </div>
        <div className="seek" ref={progressBarRef} onClick={handleSeek}>
          <div className="seekFill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default Player;