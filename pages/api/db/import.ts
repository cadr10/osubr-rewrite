import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';
import { Formidable } from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    if (!session?.user.isAdmin) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.method === 'POST') {
        const form = new Formidable();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form:', err);
                return res.status(500).json({ error: 'Error processing file upload.' });
            }

            const file = Array.isArray(files.backup) ? files.backup[0] : files.backup;

            if (!file) {
                return res.status(400).json({ error: 'No backup file uploaded.' });
            }

            try {
                const fileContent = fs.readFileSync(file.filepath, 'utf8');
                const backupData = JSON.parse(fileContent);

                if (!backupData.songs || !backupData.outsongs || !backupData.deletedSongs) {
                    return res.status(400).json({ error: 'Invalid backup file format.' });
                }

                await prisma.$transaction([

                    prisma.song.deleteMany({}),
                    prisma.outsong.deleteMany({}),
                    prisma.deletedSong.deleteMany({}),

                    prisma.song.createMany({
                        data: backupData.songs,
                    }),
                    prisma.outsong.createMany({
                        data: backupData.outsongs,
                    }),
                    prisma.deletedSong.createMany({
                        data: backupData.deletedSongs,
                    }),
                ]);


                return res.status(200).json({ message: 'Database imported successfully.' });

            } catch (error) {
                console.error('Import failed:', error);
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

                return res.status(500).json({ error: 'Import failed', details: errorMessage });
            }
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}