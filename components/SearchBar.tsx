import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const modes = [
  { label: 'Todos', value: '' },
  { label: 'Standard', value: '0' },
  { label: 'Taiko', value: '1' },
  { label: 'Catch the Beat', value: '2' },
  { label: 'Mania', value: '3' },
];

const genres = [
  'Todos', 'Anos 80', 'Arrocha', 'Brega', 'Drum N Bass', 'Eletrônica',
  'Emo', 'Forró', 'Funk', 'Gospel', 'Heavy Metal', 'Indie', 'LEWD', 'Lo-Fi',
  'Mashup', 'Meme', 'MPB', 'Pagode', 'Rap', 'Rock', 'Rock Alternativo',
  'Rock Cômico', 'Samba', 'Sertanejo', 'Trap', 'Virtual Piano', 'YTPBR'
];

const SearchBar = () => {
  const [search, setSearch] = useState('');
  const [selectedModes, setSelectedModes] = useState<string[]>(['']);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Todos']);
  const [nsfw, setNsfw] = useState(false);
  const router = useRouter();

  // Função para atualizar os filtros com base na URL
  useEffect(() => {
    const { q, mode, genres, nsfw } = router.query;

    if (q) setSearch(q as string);
    if (mode) setSelectedModes((mode as string).split(','));
    if (genres) setSelectedGenres((genres as string).split(','));
    if (nsfw) setNsfw(nsfw === 'true');
  }, [router.query]);

  // Função para atualizar a URL com os filtros atuais
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (!selectedModes.includes('')) params.set('mode', selectedModes.join(','));
    if (!selectedGenres.includes('Todos')) params.set('genres', selectedGenres.join(','));
    if (nsfw) params.set('nsfw', 'true');
    router.push(`/search?${params.toString()}`);
  };

  // Atualiza a URL com os novos parâmetros ao mudar os filtros ou a pesquisa
  useEffect(() => {
    if (router.isReady) {
      handleSearch();
    }
  }, [search, selectedModes.join(','), selectedGenres.join(','), nsfw]);

  const toggleMode = (mode: string) => {
    if (mode === '') {
      setSelectedModes(['']);
    } else {
      setSelectedModes((prevModes) => {
        if (prevModes.includes('')) {
          return [mode];
        } else {
          return prevModes.includes(mode)
            ? prevModes.filter(m => m !== mode)
            : [...prevModes, mode];
        }
      });
    }
  };

  const toggleGenre = (genre: string) => {
    if (genre === 'Todos') {
      setSelectedGenres(['Todos']);
    } else {
      setSelectedGenres((prevGenres) => {
        if (prevGenres.includes('Todos')) {
          return [genre];
        } else {
          return prevGenres.includes(genre)
            ? prevGenres.filter(g => g !== genre)
            : [...prevGenres, genre];
        }
      });
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
      </div>

      <div className="filters-grid">
        <div className="filter-group">
          <label>Modo</label>
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

        <div className="filter-group">
          <label>Gênero</label>
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

        <div className="filter-group">
          <label>Ocultar conteúdo explícito</label>
          <button onClick={() => setNsfw(false)} className={!nsfw ? 'active' : ''}>Sim</button>
          <button onClick={() => setNsfw(true)} className={nsfw ? 'active' : ''}>Não</button>
        </div>
      </div>

      <style jsx>{`
        .search-bar {
          margin: 20px 0;
        }
        .search-bar input {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
        }
        .filters {
          display: flex;
          flex-direction: column;
        }
        .filter-group {
          margin-bottom: 15px;
        }
        .filter-group label {
          display: block;
          margin-bottom: 5px;
        }
        .filter-group button {
          margin-right: 5px;
          margin-bottom: 5px;
          padding: 5px 10px;
        }
        .active {
          background-color: #4caf50;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default SearchBar;