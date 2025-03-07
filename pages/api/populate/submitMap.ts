import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { id, title, artist, creator, username, user_id, bpm, status, diffs, last_updated, thumbnail, nsfw, tags, genres } = req.body;

  try {
    await prisma.song.create({
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
        genres,
      },
    });

    await prisma.outsong.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Map submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit the map' });
  }
}