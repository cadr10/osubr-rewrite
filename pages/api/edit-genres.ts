import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { options } from './auth/[...nextauth]';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, options);

    if (!session || !session.user.isAdmin) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        const { songs } = req.body;
        try {
            for (const song of songs) {
                await prisma.song.update({
                    where: { id: song.id },
                    data: { genres: song.genres },
                });
            }
            res.status(200).json({ message: 'Genres updated successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update genres' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}