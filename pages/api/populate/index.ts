// a/pages/api/populate/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { Song } from '../../../components/Song';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { action, songData }: { action: 'approve' | 'deny'; songData: Song } = req.body;

  if (!action || !songData || !songData.id) {
    return res.status(400).json({ error: 'Missing action or song data.' });
  }

  try {
    if (action === 'approve') {
      const {
        id,
        title,
        artist,
        creator,
        username,
        user_id,
        bpm,
        status,
        diffs,
        last_updated,
        thumbnail,
        nsfw,
        tags,
        genres,
      } = songData;

      const genresArray = typeof genres === 'string'
        ? genres.split(',').map(g => g.trim())
        : genres;

      await prisma.$transaction([
        prisma.song.create({
          data: {
            id,
            title,
            artist,
            creator,
            username,
            user_id,
            bpm,
            status,
            diffs,
            last_updated,
            thumbnail,
            nsfw,
            tags,
            genres: genresArray,
          },
        }),
        prisma.outsong.delete({
          where: { id: Number(id) },
        }),
      ]);

      return res.status(200).json({ message: 'Map approved and submitted successfully' });
    } else if (action === 'deny') {
      await prisma.outsong.update({
        where: { id: Number(songData.id) },
        data: { status: 'denied' },
      });

      return res.status(200).json({ message: 'Map denied successfully' });
    } else {
      return res.status(400).json({ error: 'Invalid action.' });
    }
  } catch (error) {
    console.error(`Failed to ${action} the map:`, error);
    return res.status(500).json({ error: `Failed to ${action} the map` });
  }
}