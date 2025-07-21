import React, { useState, useMemo } from 'react';
import { getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import prisma from '../lib/prisma';
import Layout from '../components/Layout';
import Player, { useAudioPlayer } from '../components/Player';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Song } from '../components/Song';

type EditGenresPageProps = {
    songs: Song[];
};

type SortKey = keyof Omit<Song, 'genres' | 'diffs' | 'tags' | 'thumbnail' | 'last_updated' | 'status' | 'bpm' | 'user_id' | 'creator' | 'nsfw' | 'uuid'>;


type SortConfig = {
    key: SortKey;
    direction: 'ascending' | 'descending';
};

const EditGenresPage: React.FC<EditGenresPageProps> = ({ songs: initialSongs }) => {
    const [songs, setSongs] = useState(initialSongs);
    const [isSaving, setIsSaving] = useState(false);
    const { currentSong, isPlaying, handleSongClick, handleTogglePlayPause, audio } = useAudioPlayer();
    const router = useRouter();
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'title', direction: 'ascending' });

    const sortedSongs = useMemo(() => {
        let sortableItems = [...songs];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];

                if (typeof valA === 'string' && typeof valB === 'string') {
                    return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                }
                
                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [songs, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortArrow = (key: SortKey) => {
        if (sortConfig.key !== key) return <span className="sort-arrow"></span>;
        return <span className="sort-arrow">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>;
    };

    const handleGenreChange = (songId: number, newGenres: string) => {
        setSongs(prevSongs =>
            prevSongs.map(song =>
                song.id === songId ? { ...song, genres: newGenres.split(',').map(g => g.trim().toLowerCase()).filter(Boolean) } : song
            )
        );
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/edit-genres', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ songs: sortedSongs }),
            });
            if (!res.ok) throw new Error('O servidor respondeu com um erro');
            alert('Gêneros atualizados com sucesso!');
        } catch (error) {
            console.error('Falha ao salvar os gêneros:', error);
            alert('Falha ao salvar os gêneros.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Layout>
            <Head>
                <title>Editar Gêneros - osubr</title>
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

            <div className="page-container">
                <div className="header-section">
                    <h1>Editar Gêneros das Músicas</h1>
                    <button onClick={handleSaveChanges} disabled={isSaving} className="save-button">
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}>Play</th>
                                <th onClick={() => requestSort('id')} className="sortable-header" style={{ width: '8%' }}>
                                    ID {getSortArrow('id')}
                                </th>
                                <th onClick={() => requestSort('title')} className="sortable-header" style={{ width: '27%' }}>
                                    Título {getSortArrow('title')}
                                </th>
                                <th onClick={() => requestSort('artist')} className="sortable-header" style={{ width: '20%' }}>
                                    Artista {getSortArrow('artist')}
                                </th>
                                <th onClick={() => requestSort('username')} className="sortable-header" style={{ width: '20%' }}>
                                    Creator {getSortArrow('username')}
                                </th>
                                <th style={{ width: '20%' }}>Gêneros (separados por vírgula)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedSongs.map(song => (
                                <tr key={song.id}>
                                    <td>
                                        <button onClick={() => handleSongClick(song)} className="play-button">
                                            {currentSong?.id === song.id && isPlaying ? '❚❚' : '▶'}
                                        </button>
                                    </td>
                                    <td>{song.id}</td>
                                    <td>
                                        <a href={`https://osu.ppy.sh/beatmapsets/${song.id}`} target="_blank" rel="noopener noreferrer" title={song.title}>
                                            {song.title}
                                        </a>
                                    </td>
                                    <td title={song.artist}>{song.artist}</td>
                                    <td title={song.username}>{song.username}</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={Array.isArray(song.genres) ? song.genres.join(', ') : song.genres}
                                            onChange={(e) => handleGenreChange(song.id, e.target.value)}
                                            className="genre-input"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Player
                song={currentSong}
                isPlaying={isPlaying}
                onTogglePlayPause={handleTogglePlayPause}
                audio={audio}
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
                .page-container {
                    padding: 1rem 2rem;
                    max-width: 100%;
                    margin: 0 auto;
                    font-family: "Exo 2", sans-serif;
                }
                .header-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                h1 {
                    font-size: 1.8rem;
                    font-weight: 600;
                }
                .save-button {
                    background-color: #007bff;
                    color: white;
                    border: none;
                    padding: 0.7rem 1.2rem;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background-color 0.2s;
                }
                .save-button:hover {
                    background-color: #0056b3;
                }
                .save-button:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }
                .table-container {
                    overflow-x: auto;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.9rem;
                    table-layout: fixed;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 10px 12px;
                    text-align: left;
                    vertical-align: middle;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                th {
                    background-color: #f8f9fa;
                    font-weight: 600;
                }
                .sortable-header {
                    cursor: pointer;
                    user-select: none;
                }
                .sortable-header:hover {
                    background-color: #e9ecef;
                }
                .sort-arrow {
                    display: inline-block;
                    margin-left: 5px;
                    width: 1em;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                tr:hover {
                    background-color: #f1f1f1;
                }
                a {
                    color: #007bff;
                    text-decoration: none;
                }
                a:hover {
                    text-decoration: underline;
                }
                .genre-input {
                    width: 100%;
                    padding: 6px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    box-sizing: border-box;
                }
                .play-button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1.2rem;
                    color: #28a745;
                    padding: 0;
                    width: 30px;
                    text-align: center;
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

    const songs = await prisma.song.findMany({
        select: {
            id: true,
            title: true,
            artist: true,
            username: true,
            genres: true,
        },
        orderBy: {
            title: 'asc'
        }
    });

    return {
        props: {
            songs: songs.map(song => ({
                ...song,
                title: song.title || '',
                artist: song.artist || '',
                username: song.username || '',
                genres: Array.isArray(song.genres) ? song.genres : (song.genres ? [song.genres] : []),
            })),
        },
    };
};

export default EditGenresPage;