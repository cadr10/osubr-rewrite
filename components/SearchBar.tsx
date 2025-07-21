import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

const modes = [
  { label: 'Todos', value: '' },
  { label: 'Standard', value: '0' },
  { label: 'Taiko', value: '1' },
  { label: 'Catch the Beat', value: '2' },
  { label: 'Mania', value: '3' },
];

interface SearchBarProps {
  availableGenres: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ availableGenres }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedModes, setSelectedModes] = useState<string[]>(['']);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Todos']);
  const [nsfw, setNsfw] = useState(false);
  const [difficulty, setDifficulty] = useState<[number, number]>([0, 12]);
  const isMounted = useRef(false);

  const genres = ['Todos', ...availableGenres];

  useEffect(() => {
    if (!router.isReady) return;

    const { q, mode, genres, nsfw, star_min, star_max } = router.query;
    if (q) setSearch(q as string);
    if (mode) setSelectedModes((mode as string).split(','));
    if (genres) setSelectedGenres((genres as string).split(','));
    if (nsfw) setNsfw(nsfw === 'true');
    if (star_min && star_max) {
      setDifficulty([parseFloat(star_min as string), parseFloat(star_max as string)]);
    }
  }, [router.isReady]);

  useEffect(() => {
    if (!isMounted.current) {
        isMounted.current = true;
        return;
    }

    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (selectedModes.length > 0 && !selectedModes.includes('')) params.set('mode', selectedModes.join(','));
    if (selectedGenres.length > 0 && !selectedGenres.includes('Todos')) params.set('genres', selectedGenres.join(','));
    if (nsfw) params.set('nsfw', 'true');
    
    if (difficulty[0] !== 0 || difficulty[1] !== 12) {
      params.set('star_min', difficulty[0].toString());
      params.set('star_max', difficulty[1].toString());
    }

    const queryString = params.toString();
    router.push(`/?${queryString}`, undefined, { shallow: true });

  }, [search, selectedModes, selectedGenres, nsfw, difficulty]);

  const toggleMode = (mode: string) => {
    if (mode === '') {
      setSelectedModes(['']);
    } else {
      setSelectedModes((prevModes) => {
        const newModes = prevModes.filter(m => m !== '');
        return newModes.includes(mode)
          ? newModes.filter(m => m !== mode)
          : [...newModes, mode];
      });
    }
  };

  const toggleGenre = (genre: string) => {
    if (genre === 'Todos') {
      setSelectedGenres(['Todos']);
    } else {
      setSelectedGenres((prevGenres) => {
        const newGenres = prevGenres.filter(g => g !== 'Todos');
        return newGenres.includes(genre)
          ? newGenres.filter(g => g !== genre)
          : [...newGenres, genre];
      });
    }
  };

  const handleMinDifficultyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (value < difficulty[1]) {
      setDifficulty([value, difficulty[1]]);
    }
  };

  const handleMaxDifficultyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (value > difficulty[0]) {
      setDifficulty([difficulty[0], value]);
    }
  };

  return (
    <div className="search-opt">
      <div id="search-box">
        <input
          type="text"
          placeholder="Procure por artista, título, mapper, rankstatus ou tags"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.6 21L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16C7.68333 16 6.14583 15.3708 4.8875 14.1125C3.62917 12.8542 3 11.3167 3 9.5C3 7.68333 3.62917 6.14583 4.8875 4.8875C6.14583 3.62917 7.68333 3 9.5 3C11.3167 3 12.8542 3.62917 14.1125 4.8875C15.3708 6.14583 16 7.68333 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L21 19.6L19.6 21ZM9.5 14C10.75 14 11.8125 13.5625 12.6875 12.6875C13.5625 11.8125 14 10.75 14 9.5C14 8.25 13.5625 7.1875 12.6875 6.3125C11.8125 5.4375 10.75 5 9.5 5C8.25 5 7.1875 5.4375 6.3125 6.3125C5.4375 7.1875 5 8.25 5 9.5C5 10.75 5.4375 11.8125 6.3125 12.6875C7.1875 13.5625 8.25 14 9.5 14Z" fill="#61a363" />
        </svg>
      </div>

      <div className="filters-grid">
        <div className="filter-label">Modo</div>
        <div className="button-group">
          {modes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => toggleMode(mode.value)}
              className={selectedModes.includes(mode.value) ? 'active' : ''}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="filter-label">Gênero</div>
        <div className="button-group">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              className={selectedGenres.includes(genre) ? 'active' : ''}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="filter-label">Dificuldade</div>
        <div className="difficulty-slider">
            <div className="slider-container">
                <div className="slider-track"/>
                <input type="range" min="0" max="12" step="0.1" value={difficulty[0]} onChange={handleMinDifficultyChange} />
                <input type="range" min="0" max="12" step="0.1" value={difficulty[1]} onChange={handleMaxDifficultyChange} />
            </div>
            <div className="difficulty-values">
                <span>{difficulty[0].toFixed(1)}</span>
                <span>-</span>
                <span>{difficulty[1] >= 12 ? '∞' : difficulty[1].toFixed(1)}</span>
            </div>
        </div>

        <div className="filter-label">Ocultar NSFW</div>
        <div className="button-group">
          <button onClick={() => setNsfw(false)} className={!nsfw ? 'active' : ''}>Sim</button>
          <button onClick={() => setNsfw(true)} className={nsfw ? 'active' : ''}>Não</button>
        </div>
      </div>

      <style jsx>{`
        /* Seus estilos existentes para SearchBar */
        .search-opt {
            background-color: #ebebeb;
            padding: 24px;
            border-radius: 8px;
            margin-bottom: 24px;
        }
        #search-box {
            display: flex;
            align-items: center;
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 0 12px;
            margin-bottom: 24px;
        }
        #search-box input {
            flex-grow: 1;
            border: none;
            outline: none;
            height: 40px;
            font-size: 16px;
            background: transparent;
            font-family: "Exo 2", sans-serif;
        }
        .filters-grid {
            display: grid;
            grid-template-columns: max-content 1fr;
            gap: 20px 16px;
            align-items: center;
        }
        .filter-label {
            font-weight: 500;
            font-size: 16px;
            color: #333;
        }
        .button-group {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        button {
            border: none;
            border-radius: 999px;
            padding: 6px 16px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            background-color: #fff;
            color: #555;
            border: 1px solid #e0e0e0;
            transition: background-color 0.2s, color 0.2s;
            font-family: "Exo 2", sans-serif;
        }
        button:hover {
            background-color: #f5f5f5;
        }
        button.active {
            background-color: #61a363;
            color: white;
            border-color: #61a363;
        }
        .difficulty-slider {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .slider-container {
            position: relative;
            flex-grow: 1;
            height: 20px;
            display: flex;
            align-items: center;
        }
        .slider-track {
            position: absolute;
            width: 100%;
            height: 5px;
            border-radius: 3px;
            background: linear-gradient(to right, #4290FB, #4FC0FF, #4FFFD5, #7CFF4F, #F6F05C, #FF8068, #FF4E6F, #C645B8, #6563DE, #18158E, #000000);
        }
        .slider-container input[type="range"] {
            position: absolute;
            width: 100%;
            pointer-events: none;
            -webkit-appearance: none;
            background: transparent;
            height: 20px;
            margin: 0;
        }
        .slider-container input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            pointer-events: all;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #fff;
            cursor: grab;
            border: 3px solid #61a363;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .slider-container input[type="range"]::-moz-range-thumb {
            pointer-events: all;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #fff;
            cursor: grab;
            border: 3px solid #61a363;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .difficulty-values {
            display: flex;
            gap: 8px;
            align-items: center;
            font-weight: 500;
            font-size: 15px;
            min-width: 90px;
            justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default SearchBar;