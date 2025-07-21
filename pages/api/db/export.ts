import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    if (!session?.user.isAdmin) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.method === 'GET') {
        try {
            // Fetch data from all three tables
            const songs = await prisma.song.findMany();
            const outsongs = await prisma.outsong.findMany();
            const deletedSongs = await prisma.deletedSong.findMany();

            // Combine into a single object
            const backupData = {
                songs,
                outsongs,
                deletedSongs,
            };

            const data = JSON.stringify(backupData, null, 2);

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename="database-backup.json"');
            res.status(200).send(data);
        } catch (error) {
            console.error('Backup failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            res.status(500).json({ error: 'Backup failed', details: errorMessage });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}