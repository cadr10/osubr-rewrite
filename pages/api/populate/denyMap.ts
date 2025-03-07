import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.body;

  try {
    await prisma.outsong.update({
      where: { id },
      data: { status: 'denied' },
    });

    res.status(200).json({ message: 'Map denied successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to deny the map' });
  }
}