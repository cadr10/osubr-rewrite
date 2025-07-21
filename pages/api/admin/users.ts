// a/pages/api/admin/users.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { options } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, options);

  if (
    !session ||
    !session.user ||
    session.user.id !== process.env.SUPER_ADMIN_ID
  ) {
    return res.status(403).send({ message: 'Forbidden: Access is denied.' });
  }

  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { isAdmin: true },
            { isBanned: true },
          ],
        },
        include: {
          accounts: {
            where: { provider: 'osu' },
          },
        },
      });

      const usersData = users.map(user => {
        const osuAccount = user.accounts.find(acc => acc.provider === 'osu');
        return {
          id: user.id,
          username: user.name || 'Unknown',
          osuId: osuAccount?.providerAccountId || 'Not linked',
          isAdmin: user.isAdmin,
          isBanned: user.isBanned,
        };
      });

      return res.status(200).json(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res
        .status(500)
        .json({ message: 'Something went wrong while fetching users.', error: (error as Error).message });
    }
  }

  if (req.method === 'POST') {
    const { osuId, isAdmin, isBanned } = req.body;

    if (!osuId) {
      return res.status(400).json({ message: 'Osu! ID is required.' });
    }

    try {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: 'osu',
            providerAccountId: osuId,
          },
        },
      });

      if (!account) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const updateData: { isAdmin?: boolean; isBanned?: boolean } = {};
      if (typeof isAdmin === 'boolean') {
        updateData.isAdmin = isAdmin;
      }
      if (typeof isBanned === 'boolean') {
        updateData.isBanned = isBanned;
      }

      await prisma.user.update({
        where: { id: account.userId },
        data: updateData,
      });

      let message = `User ${osuId} has been updated.`;
      if (typeof isAdmin === 'boolean') {
        message = `User ${osuId} admin privileges have been ${isAdmin ? 'granted' : 'revoked'}.`;
      }
      if (typeof isBanned === 'boolean') {
        message = `User ${osuId} has been ${isBanned ? 'banned' : 'unbanned'}.`;
      }

      return res.status(200).json({ message });

    } catch (error) {
        console.error('Error updating user status:', error);
        return res
            .status(500)
            .json({ message: 'Something went wrong.', error: (error as Error).message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}