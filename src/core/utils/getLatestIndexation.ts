import { prisma } from '../environment/prisma'

export async function getLatestIndexation(entity: string): Promise<number | null> {
  const result = await prisma.indexations.findUnique({
    where: { entity },
    select: { latestBlockNumber: true },
  })

  return result ? result.latestBlockNumber : null
}
