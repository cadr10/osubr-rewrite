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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }, // Assumindo que session.user.id é o ID do usuário
    });

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Obter o providerAccountId associado ao usuário
    const account = await prisma.account.findFirst({
      where: { userId: user.id },
    });

    if (!account) {
      res.status(401).json({ message: 'Account not found' });
      return;
    }

    const providerAccountId = account.providerAccountId;

    // Verificar se o ID já existe em Songs ou OutSong
    const existingSong = await prisma.song.findUnique({
      where: { id: Number(id) },
    });

    const existingOutsong = await prisma.outsong.findUnique({
      where: { id: Number(id) },
    });

    if (existingSong || existingOutsong) {
      // ID já existe, informar o usuário e não fazer nada
      res.status(409).json({ message: 'A música já está na lista ou vai ser adicionada em breve!' });
      return;
    }

    // Se o ID não existe, criar o novo registro
    const result = await prisma.outsong.create({
      data: {
        id: Number(id),
        user_id: account.providerAccountId,
        genres: genres,
        author: {
          connect: { id: user.id } // Conectando o usuário pelo ID
        },
      },
    });

    res.json(result);
  } else {
    res.status(401).send({ message: 'Unauthorized' });
  }
}