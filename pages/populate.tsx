import { getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import prisma from '../lib/prisma';
import React, { useState } from 'react';
import Layout from '../components/Layout';
import Player, { useAudioPlayer } from '../components/Player';
import PendingSong from '../components/PendingSong';
import Head from 'next/head';
import { fetchBeatmapInfo } from '../lib/osuapi';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Song } from '../components/Song';

type PopulatePageProps = {
  user: {
    name: string;
    email: string;
    image: string;
    isAdmin: boolean;
  };
  pendingSongs: Song[];
};

const PopulatePage: React.FC<PopulatePageProps> = (props) => {
  const [songs, setSongs] = useState<Song[]>(props.pendingSongs);
  const { currentSong, isPlaying, handleSongClick, handleTogglePlayPause, audio } = useAudioPlayer();
  const router = useRouter();

  const handleGenreChange = (songId: number, newGenres: string) => {
      setSongs(prevSongs =>
          prevSongs.map(song =>
              song.id === songId ? { ...song, genres: newGenres } : song
          )
      );
  };

  const handleApprove = async (id: number) => {
    const songToApprove = songs.find(song => song.id === id);
    if (!songToApprove) {
      alert('Música não encontrada!');
      return;
    }

    try {
      const res = await fetch('/api/populate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', songData: songToApprove }),
      });
      if (!res.ok) throw new Error('O servidor respondeu com um erro');
      setSongs(songs.filter(song => song.id !== id));
    } catch (error) {
      console.error('Falha ao aprovar o mapa:', error);
      alert('Falha ao aprovar o mapa.');
    }
  };

  const handleDeny = async (id: number) => {
    try {
      const res = await fetch('/api/populate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deny', songData: { id } }),
      });
      if (!res.ok) throw new Error('O servidor respondeu com um erro');
      setSongs(songs.filter(song => song.id !== id));
    } catch (error) {
      console.error('Falha ao negar o mapa:', error);
      alert('Falha ao negar o mapa.');
    }
  };

  return (
    <Layout>
        <Head>
            <title>Painel de Controle - osubr</title>
        </Head>

        <div className="admin-nav">
          <Link href="/populate" legacyBehavior>
            <a className={router.pathname === '/populate' ? 'active' : ''}>
              Aprovar Mapas
            </a>
          </Link>
          <Link href="/edit-genres" legacyBehavior>
            <a className={router.pathname === '/edit-genres' ? 'active' : ''}>
              Editar Gêneros
            </a>
          </Link>
        </div>

        <div className="populate-container">
            <h1 className="populate-header">Mapas Pendentes de Aprovação</h1>
           
            {songs.length > 0 ? (
                <div id="list">
                    {songs.map(song => (
                        <PendingSong
                            key={song.id}
                            song={song}
                            onPlay={handleSongClick}
                            onApprove={() => handleApprove(song.id)}
                            onDeny={() => handleDeny(song.id)}
                            onGenreChange={handleGenreChange}
                            isPlaying={currentSong?.id === song.id && isPlaying}
                        />
                    ))}
                </div>
            ) : (
                <p className="no-songs">Nenhum mapa pendente no momento. Bom trabalho!</p>
            )}
        </div>
        <Player
        song={currentSong}
        audio={audio}
        isPlaying={isPlaying}
        onTogglePlayPause={handleTogglePlayPause}
      />
        <style jsx>{`
          .admin-nav {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 1rem;
            padding: 1rem;
            border-bottom: 2px solid #eee;
          }
          .admin-nav a {
            text-decoration: none;
            padding: 0.6rem 1.2rem;
            border-radius: 8px;
            color: #555;
            font-weight: 600;
            transition: background-color 0.2s, color 0.2s;
            border: 2px solid transparent;
          }
          .admin-nav a:hover {
            background-color: #f0f0f0;
            color: #333;
          }
          .admin-nav a.active {
            background-color: #61a363;
            color: white;
            border-color: #61a363;
          }

          .populate-container {
            padding: 1rem 2rem;
            max-width: 1200px;
            margin: 0 auto;
            font-family: "Exo 2", sans-serif;
          }
          .populate-header {
            text-align: center;
            margin-bottom: 2rem;
            font-size: 2rem;
            font-weight: 600;
          }
          .no-songs {
            text-align: center;
            color: #777;
            font-size: 1.2rem;
            margin-top: 4rem;
          }
        `}</style>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session?.user.isAdmin) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const outsongs = await prisma.outsong.findMany({
      where: {
          NOT: {
              status: 'denied',
          }
      },
      include: {
          author: {
              select: {
                  name: true,
              },
          },
      },
  });

  const pendingSongsData: Song[] = await Promise.all(
    outsongs.map(async (outsong) => {
      const mapInfo = await fetchBeatmapInfo(outsong.id);
      
      if (!mapInfo || mapInfo.title.startsWith("Error:")) {
        return {
          id: outsong.id,
          title: `Falha ao buscar dados para o ID: ${outsong.id}`,
          artist: 'Desconhecido',
          creator: 'Desconhecido',
          username: outsong.author?.name || 'Desconhecido',
          genres: outsong.genres || '',
          diffs: [],
        };
      }

      return {
        ...mapInfo,
        username: outsong.author?.name || 'Desconhecido',
        genres: outsong.genres || '',
      };
    })
  );

  return {
    props: {
      user: session.user,
      pendingSongs: pendingSongsData,
    },
  };
};

export default PopulatePage;