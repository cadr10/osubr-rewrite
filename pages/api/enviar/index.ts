import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { options } from '../auth/[...nextauth]';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id, genres } = req.body;

  const session = await getServerSession(req, res, options);
  if (session && session.user) {

    if (session.user.isBanned) {
        return res.status(403).json({ message: 'Você está banido e não pode enviar músicas.' });
    }

    const providerAccountId = session.user.id;

    const account = await prisma.account.findFirst({
      where: { providerAccountId: providerAccountId },
    });

    if (!account) {
      res.status(401).json({ message: 'User account not found' });
      return;
    }

    const user = await prisma.user.findUnique({
        where: { id: account.userId },
    });

    if (!user) {
        res.status(401).json({ message: 'User not found' });
        return;
    }


    const existingSong = await prisma.song.findUnique({
      where: { id: Number(id) },
    });

    const existingOutsong = await prisma.outsong.findUnique({
      where: { id: Number(id) },
    });

    const existingDeletedSong = await prisma.deletedSong.findUnique({
        where: { id: Number(id) },
    });

    if (existingSong || existingOutsong || existingDeletedSong) {

      res.status(409).json({ message: 'A música já está na lista ou vai ser adicionada em breve!' });
      return;
    }

    const result = await prisma.outsong.create({
      data: {
        id: Number(id),
        user_id: account.providerAccountId,
        genres: genres,
        author: {
          connect: { id: user.id } 
        },
      },
    });

    res.json(result);
  } else {
    res.status(401).send({ message: 'Unauthorized' });
  }
}