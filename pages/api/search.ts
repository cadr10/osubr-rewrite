// a/pages/api/search.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { Song as SongProps } from "../../components/Song";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { q, mode, genres, nsfw, page = 1, limit = 10, star_min, star_max } = req.query;

  let starMin: number | undefined = star_min ? parseFloat(star_min as string) : undefined;
  let starMax: number | undefined = star_max && parseFloat(star_max as string) < 12 ? parseFloat(star_max as string) : undefined;
  
  let starExact: number | undefined;
  const whereClause: any = {};

  if (typeof q === 'string' && q.trim() !== '') {
    const queryParts = q.split(' ');
    const freeTextQueries: any[] = [];
    
    queryParts.forEach((part) => {
      if (part.includes('=')) {
        const [key, value] = part.split('=');
        if (key === 'id') {
          whereClause.id = { in: value.split(',').map((id) => parseInt(id)) };
        } else if (key === 'creator') {
          whereClause.creator = { contains: value, mode: 'insensitive' };
        } else if (key === 'status') {
          whereClause.status = { contains: value, mode: 'insensitive' };
        } else if (key === 'star') {
          starExact = parseFloat(value);
        }
      } else if (part.includes('>')) {
        const [key, value] = part.split('>');

        if (key === 'star' && starMin === undefined) starMin = parseFloat(value);
      } else if (part.includes('<')) {
        const [key, value] = part.split('<');
 
        if (key === 'star' && starMax === undefined) starMax = parseFloat(value);
      } else {
        freeTextQueries.push(part);
      }
    });
    
    if (freeTextQueries.length > 0) {
      whereClause.AND = whereClause.AND || [];
      whereClause.AND.push({
        OR: freeTextQueries.map((term) => ({
          OR: [
            { username: { contains: term, mode: 'insensitive' } },
            { artist: { contains: term, mode: 'insensitive' } },
            { title: { contains: term, mode: 'insensitive' } },
            { tags: { contains: term, mode: 'insensitive' } },
            { status: { contains: term, mode: 'insensitive' } },
          ],
        })),
      });
    }
  }
  
  if (genres && genres !== 'Todos') {
    const genreArray = (genres as string).split(',');
    whereClause.genres = { hasSome: genreArray };
  }
  
  if (nsfw !== 'true') whereClause.nsfw = false;
  
  try {
    const dbSongs = await prisma.song.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        artist: true,
        bpm: true,
        status: true,
        user_id: true,
        creator: true,
        username: true,
        diffs: true,
        last_updated: true,
        thumbnail: true,
        nsfw: true,
        tags: true,
        genres: true,
        uuid: true,
      },
    });

    const transformedSongs: SongProps[] = dbSongs.map(song => {
      const parsedDiffs = Array.isArray(song.diffs) 
        ? song.diffs 
        : (typeof song.diffs === 'string' ? JSON.parse(song.diffs) : []);
      
      const typedDiffs = parsedDiffs.map((diff: any) => ({
        mode: typeof diff.mode === 'number' ? diff.mode : 0,
        stars: typeof diff.stars === 'number' ? diff.stars : 0,
      }));

      const genresString = Array.isArray(song.genres) 
        ? song.genres.join(',') 
        : (typeof song.genres === 'string' ? song.genres : '');

      return {
        ...song,
        diffs: typedDiffs,
        genres: genresString
      };
    });

    const filteredSongs = transformedSongs.filter((song) => {
      const diffs = song.diffs;
      
      if (mode) {
        const modeArray = (mode as string).split(',').map(Number);
        if (!diffs.some((diff) => modeArray.includes(diff.mode))) return false;
      }
      
      if (starExact !== undefined) {
        if (!diffs.some((diff) => diff.stars === starExact)) return false;
      }
      
      if (starMin !== undefined || starMax !== undefined) {
        if (
          !diffs.some(
            (diff) =>
              (starMin === undefined || diff.stars >= starMin) &&
              (starMax === undefined || diff.stars <= starMax)
          )
        ) {
          return false;
        }
      }
      
      return true;
    });

    const totalCount = filteredSongs.length;
    const paginatedSongs = filteredSongs.slice(
      (parseInt(page as string) - 1) * parseInt(limit as string),
      parseInt(page as string) * parseInt(limit as string)
    );

    res.json({ totalCount, songs: paginatedSongs });
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}