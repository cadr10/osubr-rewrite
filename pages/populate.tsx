import React from "react";
import { GetServerSideProps } from "next";
import Layout from "../components/Layout";
import { getSession } from "next-auth/react";
import prisma from "../lib/prisma";
import { fetchBeatmapInfo } from "../lib/osuapi";
import DifficultyIcon from '../components/DifficultyIcon';


const Difficulty = ({ mode, stars }) => {
  const svgElement = new DifficultyIcon(mode, stars).getSVG();
  return svgElement;
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
    take: 5,
    where: {
      NOT: {
        status: {
          equals: 'denied',
        },
      },
    },
  });

  const maps = await Promise.all(
    outsongs.map(async (outsong) => {
      const mapInfo = await fetchBeatmapInfo(outsong.id);
      return mapInfo ? { ...mapInfo, genres: outsong.genres } : null;
    })
  );

  return {
    props: { maps: maps.filter(Boolean) },
  };
};

type MapProps = {
  id: number;
  title:string;
  artist:string;
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
};

type PopulateProps = {
  maps: MapProps[];
};

const Populate: React.FC<PopulateProps> = ({ maps }) => {
  const handleSubmit = async (map: MapProps) => {
    try {
      await fetch('/api/populate/submitMap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(map),
      });
      window.location.reload();
    } catch (error) {
      console.error('Erro ao enviar o mapa:', error);
    }
  };

  const handleDeny = async (id: number) => {
    try {
      await fetch('/api/populate/denyMap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      window.location.reload();
    } catch (error) {
      console.error('Erro ao negar o mapa:', error);
    }
  };

  return (
    <Layout>
      <h1>Populate Songs</h1>
      {maps.map((map) => (
        <div key={map.id} style={{ marginBottom: '20px' }}>
          <p>ID: {map.id}</p>
          <p>Title: {map.title}</p>
          <p>Artist: {map.artist}</p>
          <p>Username: {map.username}</p>
          <p>Creator: {map.diffs
        .sort((a, b) => a.stars - b.stars)
        .sort((a, b) => a.mode - b.mode)
        .map((diff, index) => (
          <Difficulty key={index} mode={diff.mode} stars={diff.stars} />
        ))}</p>
          <p>Suggested Genres: {map.genres}</p> {/* Exibindo os gêneros sugeridos */}
          <button onClick={() => handleSubmit(map)}>Submit</button>
          <button onClick={() => handleDeny(map.id)}>Deny</button>
        </div>
      ))}
    </Layout>
  );
};

export default Populate;