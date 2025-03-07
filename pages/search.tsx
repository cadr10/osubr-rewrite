import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import Song, { SongProps } from "../components/Song";
import SearchBar from '../components/SearchBar';
import Player from '../components/Player';
import TitleHeader from '../components/TitleHeader'

//URGENTE
//ARRUMAR SEARCH DE MODOS
//COLOCAR TAG CLOUD

//HIGHPRIO:

//UPDATE DB

//ERRO NA INTERFACE CASO O ID NÃO SEJA UMA MÚSICA
///CASO NAO SEJA DELETAR DO OUTSONG DB AUTO? NAO, PARA PESSOA N SUBMITAR
// tentar mover o que tem sobre o player no search,
/// para o arquivo do player, deixando toda lógica de tocad música nesse aqruivo

//ANTES DE LANÇAR:
//interface no enviar das músidas
//CSS geral no site
// trcar o ID do MONGODB pra UUID no usuario e mapear o accountproviderid pro id na conta

//Final step: verificar código, mandar para alguém que saiba avaliar e ver
//vulnerabilidades4

//Low prio:
//interface no populate 

const SearchPage: React.FC = () => {
  const [results, setResults] = useState<SongProps[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0); // Número total de mapas
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Controla se ainda há mais dados para carregar
  const [currentSong, setCurrentSong] = useState<SongProps | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const router = useRouter();
  const { q, mode, genres, nsfw, starMin, starMax } = router.query;

  // Função para buscar resultados da API
  const fetchResults = async (pageNumber: number) => {
    setLoading(true);

    const params = new URLSearchParams();
    if (q) params.set('q', q as string);
    if (mode) params.set('mode', mode as string);
    if (genres && genres !== 'Todos') params.set('genres', genres as string);
    if (nsfw !== undefined) params.set('nsfw', nsfw as string);
    if (starMin) params.set('starMin', starMin as string);
    if (starMax) params.set('starMax', starMax as string);
    params.set('page', pageNumber.toString());
    params.set('limit', '35');

    try {
      const queryString = params.toString();
      const res = await fetch(`/api/search?${queryString}`);
      const data = await res.json();

      if (data.songs.length === 0) {
        setHasMore(false);
      } else {
        setResults(prev => {
          const existingIds = new Set(prev.map(song => song.id));
          const newResults = data.songs.filter((song: SongProps) => !existingIds.has(song.id));
          return [...prev, ...newResults];
        });
        setTotalCount(data.totalCount); // Atualizar o número total de mapas
        setPage(pageNumber);
      }
    } catch (error) {
      console.error("Failed to fetch search results:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar mais dados
  const loadMoreData = useCallback(() => {
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    if (
      scrollPosition >= documentHeight * 0.75 && // 75% da altura total da página
      !loading &&
      hasMore
    ) {
      fetchResults(page + 1);
    }
  }, [loading, hasMore, page]);

  // Debouncing do evento de scroll
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      if (!loading) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          loadMoreData();
        }, 100); // Ajuste o tempo de debounce conforme necessário
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [loadMoreData, loading]);

  // Função para verificar se os filtros mudaram
  useEffect(() => {
    if (router.isReady) {
      // Limpar resultados e resetar a página
      setResults([]);
      setTotalCount(0); // Resetar o número total
      setPage(1);
      setHasMore(true);
      fetchResults(1);
    }
  }, [q, mode, genres, nsfw, starMin, starMax, router.isReady]);

  const handleSongClick = (song: SongProps) => {
    if (currentSong && currentSong.id === song.id) {
      if (audio) {
        if (isPlaying) {
          audio.pause();
        } else {
          audio.play();
        }
        setIsPlaying(!isPlaying);
      }
    } else {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      const newAudio = new Audio(`https://b.ppy.sh/preview/${song.id}.mp3`);
      newAudio.volume = 0.5;
      newAudio.onended = () => {
        setIsPlaying(false);
        setCurrentSong(null);
      };
      setAudio(newAudio);
      setCurrentSong(song);
      newAudio.play();
      setIsPlaying(true);
    }
  };

  const getHeaderText = () => {
    if (loading) {
      return "Loading...";
    } else if (totalCount > 0) {
      return `${totalCount} Mapas Encontrados`;
    } else {
      return "Nenhum Mapa Encontrado";
    }
  };

  return (
    <Layout>
      <TitleHeader />
      <SearchBar />
      <div className="countResults"><h1 id="count">{getHeaderText()}</h1></div>
      
      <div id="list">
        {results.map((song) => (
          <Song
            key={song.id}
            song={song}
            isPlaying={currentSong?.id === song.id && isPlaying}
            onClick={() => handleSongClick(song)}
          />
        ))}
      </div>
      {loading && <p>Loading more...</p>}

      {currentSong && audio && (
  <Player
    songId={currentSong.id}
    title={currentSong.title}
    artist={currentSong.artist}
    audio={audio}
    isPlaying={isPlaying}
    onTogglePlayPause={() => {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }}
    onEnded={() => {
      setIsPlaying(false);
      setCurrentSong(null);
    }}
  />
)}
    </Layout>
  );
};

export default SearchPage;