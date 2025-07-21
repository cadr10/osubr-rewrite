import React, { useEffect, useState, useCallback } from "react";
import { GetStaticProps } from 'next';
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import SongComponent from "../components/Song";
import SearchBar from '../components/SearchBar';
import Player, { useAudioPlayer } from '../components/Player';
import TitleHeader from '../components/TitleHeader';
import prisma from '../lib/prisma';
import { Song } from '../components/Song'; 

interface SearchPageProps {
  availableGenres: string[];
}

const SearchPage: React.FC<SearchPageProps> = ({ availableGenres }) => {
  const [results, setResults] = useState<Song[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { currentSong, isPlaying, handleSongClick, handleTogglePlayPause, audio } = useAudioPlayer();

  const router = useRouter();
  const { q, mode, genres, nsfw, star_min, star_max } = router.query;

  const fetchResults = async (pageNumber: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    
    if (q) params.set('q', q as string);
    if (mode) params.set('mode', mode as string);
    if (genres && genres !== 'Todos') params.set('genres', genres as string);
    if (nsfw !== undefined) params.set('nsfw', nsfw as string);
    if (star_min) params.set('star_min', star_min as string);
    if (star_max) params.set('star_max', star_max as string);
    
    params.set('page', pageNumber.toString());
    params.set('limit', '35');

    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (data.songs.length === 0) {
        setHasMore(false);
      } else {
        setResults(prev => pageNumber === 1 ? data.songs : [...prev, ...data.songs]);
        setTotalCount(data.totalCount);
        setPage(pageNumber);
      }
    } catch (error) {
      console.error("Failed to fetch search results:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const totalHeight = document.documentElement.scrollHeight;
      const threshold = totalHeight * 0.8;
      if (scrollPosition < threshold || loading || !hasMore) {
        return;
      }
      fetchResults(page + 1);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, page]);

  useEffect(() => {
    if (router.isReady) {
      setResults([]);
      setPage(1);
      setHasMore(true);
      fetchResults(1);
    }
  }, [q, mode, genres, nsfw, star_min, star_max, router.isReady]);

  return (
    <Layout>
      <TitleHeader />
      <SearchBar availableGenres={availableGenres} />
      <div className="countResults">
        <h4 id="count">
          {totalCount > 0 ? `${totalCount} Mapas Encontrados` : "Nenhum Mapa Encontrado"}
        </h4>
      </div>
      
      <div id="list">
        {results.map((song) => (
          <SongComponent
            key={song.id}
            song={song}
            isPlaying={currentSong?.id === song.id && isPlaying}
            onClick={() => handleSongClick(song)}
          />
        ))}
      </div>
      {loading && <p>Loading more...</p>}

      <Player
        song={currentSong}
        audio={audio}
        isPlaying={isPlaying}
        onTogglePlayPause={handleTogglePlayPause}
      />
    </Layout>
  );
};

export const getStaticProps: GetStaticProps<SearchPageProps> = async () => {
  try {
    const songs = await prisma.song.findMany({
      select: { genres: true },
      where: { 
        genres: { isEmpty: false } 
      }
    });

    const allGenres = new Set<string>();
    
    songs.forEach(song => {
      if (song.genres && Array.isArray(song.genres)) {
        song.genres.forEach(genre => {
          if (genre && typeof genre === 'string') {
            allGenres.add(genre);
          }
        });
      }
    });

    const availableGenres = Array.from(allGenres).sort();

    return {
      props: {
        availableGenres,
      },
      revalidate: 600, 
    };
  } catch (error) {
    console.error('Failed to fetch genres:', error);
    return {
      props: {
        availableGenres: [],
      },
      revalidate: 60, 
    };
  }
};

export default SearchPage;