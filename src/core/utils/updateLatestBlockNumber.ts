import { prisma } from '../environment/prisma'

export async function updateLatestBlockNumber(entity: string, blockNumber: number) {
  await prisma.indexations.upsert({
    where: { entity },
    update: { latestBlockNumber: blockNumber },
    create: { entity, latestBlockNumber: blockNumber },
  })
}
