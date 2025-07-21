import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { fetchBeatmapInfo } from '../../../lib/osuapi';
import { getServerSession } from "next-auth/next";
import { options } from '../auth/[...nextauth]';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, options);

    if (!session || !session.user?.isAdmin) {
        return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para executar esta ação.' });
    }

    if (req.method === 'POST') {
        try {
            console.log('Iniciando o processo de atualização de todas as músicas...');

            const songsToUpdate = await prisma.song.findMany();
            const deletedSongsToCheck = await prisma.deletedSong.findMany();

            const totalCount = songsToUpdate.length + deletedSongsToCheck.length;
            let processedCount = 0;
            let updatedCount = 0;
            let movedToDeletedCount = 0;
            let revivedCount = 0;
            let failedCount = 0;
            const failedIds: number[] = [];

            if (totalCount === 0) {
                console.log('Nenhuma música para atualizar.');
                return res.status(200).json({ message: 'Nenhuma música encontrada para atualizar.' });
            }

            console.log(`Total de mapas a serem verificados: ${totalCount}`);

            for (const song of songsToUpdate) {
                processedCount++;
                console.log(`Processando: ${processedCount}/${totalCount} (ID: ${song.id})`);
                try {
                    const beatmapInfo = await fetchBeatmapInfo(song.id);
                    await delay(1000); 

                    if (beatmapInfo && !beatmapInfo.title.includes("Error:")) {
                        await prisma.song.update({
                            where: { id: song.id },
                            data: {
                                title: beatmapInfo.title,
                                artist: beatmapInfo.artist,
                                creator: beatmapInfo.creator,
                                username: beatmapInfo.username,
                                user_id: beatmapInfo.user_id,
                                bpm: beatmapInfo.bpm,
                                status: beatmapInfo.status,
                                diffs: beatmapInfo.diffs,
                                last_updated: beatmapInfo.last_updated,
                                thumbnail: beatmapInfo.thumbnail,
                                nsfw: beatmapInfo.nsfw,
                                tags: beatmapInfo.tags,
                            },
                        });
                        updatedCount++;
                    } else {
                        await prisma.$transaction([
                            prisma.deletedSong.create({ data: { ...song, uuid: song.uuid || undefined } }),
                            prisma.song.delete({ where: { id: song.id } }),
                        ]);
                        movedToDeletedCount++;
                    }
                } catch (error) {
                    failedCount++;
                    failedIds.push(song.id);
                    console.error(`Falha ao processar a música ativa ID ${song.id}:`, error);
                }
            }

            for (const deletedSong of deletedSongsToCheck) {
                processedCount++;
                console.log(`Processando: ${processedCount}/${totalCount} (ID: ${deletedSong.id})`);
                try {
                    const beatmapInfo = await fetchBeatmapInfo(deletedSong.id);
                    await delay(1000);

                    if (beatmapInfo && !beatmapInfo.title.includes("Error:")) {
                        await prisma.$transaction([
                            prisma.song.create({
                                data: {
                                    id: deletedSong.id,
                                    title: beatmapInfo.title,
                                    artist: beatmapInfo.artist,
                                    creator: beatmapInfo.creator,
                                    user_id: beatmapInfo.user_id,
                                    bpm: beatmapInfo.bpm,
                                    status: beatmapInfo.status,
                                    diffs: beatmapInfo.diffs,
                                    last_updated: beatmapInfo.last_updated,
                                    thumbnail: beatmapInfo.thumbnail,
                                    nsfw: beatmapInfo.nsfw,
                                    tags: beatmapInfo.tags,
                                    genres: deletedSong.genres,
                                },
                            }),
                            prisma.deletedSong.delete({ where: { id: deletedSong.id } }),
                        ]);
                        revivedCount++;
                    }
                } catch (error) {
                    failedCount++;
                    failedIds.push(deletedSong.id);
                    console.error(`Falha ao verificar a música deletada ID ${deletedSong.id}:`, error);
                }
            }

            console.log('Processo de atualização concluído.');
            res.status(200).json({
                message: `Processo concluído. Verificados ${processedCount}/${totalCount} mapas.`,
                updated: updatedCount,
                movedToDeleted: movedToDeletedCount,
                revived: revivedCount,
                failed: failedCount,
                failed_ids: failedIds
            });

        } catch (error) {
            console.error('Ocorreu um erro crítico durante o processo de atualização:', error);
            const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido no servidor.';
            res.status(500).json({ message: 'Falha no processo de atualização.', error: errorMessage });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end('Método não permitido');
    }
}