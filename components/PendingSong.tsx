import React from 'react';
import DifficultyIcon from './DifficultyIcon';
import { Song } from './Song'; 

interface Props {
    song: Song;
    onPlay: (song: Song) => void;
    onApprove: (id: number, genres: string | string[]) => void;
    onDeny: (id: number) => void;
    onGenreChange: (id: number, newGenres: string) => void;
    isPlaying: boolean;
}

const PendingSong: React.FC<Props> = ({ song, onPlay, onApprove, onDeny, onGenreChange, isPlaying }) => {
    const coverUrl = `https://assets.ppy.sh/beatmaps/${song.id}/covers/list.jpg`;
    const beatmapUrl = `https://osu.ppy.sh/beatmapsets/${song.id}`;

    const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div className="song">
            <div className="hoverSideOptions">
                <button className="approve-btn" onClick={(e) => { stopPropagation(e); onApprove(song.id, song.genres); }}>Aprovar</button>
                <button className="deny-btn" onClick={(e) => { stopPropagation(e); onDeny(song.id); }}>Negar</button>
            </div>

            <div className="thumbnail" onClick={() => onPlay(song)}>
                <img
                    src={coverUrl}
                    alt={`${song.title} cover`}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/152x152/eee/333?text=No+Cover';
                    }}
                />
                <div className="previewButton">
                    <i className={`fa-solid fa-${isPlaying ? 'pause' : 'play'}`}></i>
                </div>
            </div>

            <a className="title" href={beatmapUrl} target="_blank" rel="noopener noreferrer" onClick={stopPropagation} title={song.title}>
                {song.title || 'Sem Título'}
            </a>

            <div className="artist" title={song.artist}>
                por {song.artist || 'Artista Desconhecido'} // Mapeado por {song.creator || 'Mapper Desconhecido'}
            </div>

            <div className="difficulties">
                {Array.isArray(song.diffs) && song.diffs
                    .sort((a, b) => a.mode - b.mode || a.stars - b.stars)
                    .map((diff, index) => (
                        <DifficultyIcon key={index} diff={diff} />
                    ))}
            </div>

            <div className="creator">
                <p className="submitted-by">Enviado por: <strong>{song.username || 'Desconhecido'}</strong></p>
                <div className="genre-editor">
                    <label htmlFor={`genres-${song.id}`}>Gêneros:</label>
                    <input
                        type="text"
                        id={`genres-${song.id}`}
                        value={Array.isArray(song.genres) ? song.genres.join(', ') : song.genres || ''}
                        onChange={(e) => onGenreChange(song.id, e.target.value)}
                        placeholder="Ex: Rock, J-Pop"
                        onClick={stopPropagation}
                    />
                </div>
            </div>

            <style jsx>{`
              .song {
                min-height: 152px;
                height: auto;
                grid-template-rows: auto auto 1fr 1fr;
              }
              .difficulties {
                grid-row: 3;
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                align-items: center;
              }
              .creator {
                grid-row: 4;
                height: auto;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 4px;
              }
              .song:hover .hoverSideOptions {
                width: 100px;
                background: #5b9c5d;
              }
              .hoverSideOptions {
                gap: 10px;
              }
              .hoverSideOptions button {
                width: 80%;
                margin: 0 auto;
                border: none;
                padding: 6px;
                border-radius: 4px;
                color: white;
                font-weight: bold;
                font-family: "Exo 2", sans-serif;
                font-size: 14px;
              }
              .approve-btn {
                background-color: #4CAF50;
              }
              .approve-btn:hover {
                background-color: #45a049;
              }
              .deny-btn {
                background-color: #f44336;
              }
              .deny-btn:hover {
                background-color: #da190b;
              }
              .submitted-by {
                margin: 0;
                font-size: 13px;
                line-height: 1;
              }
              .genre-editor {
                display: flex;
                align-items: center;
              }
              .genre-editor label {
                font-size: 13px;
                margin-right: 4px;
                line-height: 1;
                white-space: nowrap;
              }
              .genre-editor input {
                border: 1px solid #ccc;
                border-radius: 3px;
                padding: 2px 4px;
                font-size: 12px;
                font-family: "Exo 2", sans-serif;
                width: 100%;
              }
            `}</style>
        </div>
    );
};

export default PendingSong;