import { prisma } from '../environment/prisma'

export async function updateMetrics() {
  const avss = await prisma.avs.findMany({
    include: {
      operators: {
        include: {
          restakers: true,
        },
      },
      restakers: true,
    },
  })

  for (const avs of avss) {
    const operatorCount = avs.operators.length
    const restakerCount = avs.restakers.length
    const totalRestaked = avs.restakers.reduce((sum, restaker) => sum + (restaker.ethValue ?? 0), 0)

    await prisma.avs.update({
      where: { id: avs.id },
      data: { operatorCount, restakerCount, totalRestaked },
    })

    for (const operator of avs.operators) {
      const restakerCount = operator.restakers.length
      const totalRestaked = operator.restakers.reduce((sum, restaker) => sum + (restaker.ethValue ?? 0), 0)

      await prisma.operator.update({
        where: { id: operator.id },
        data: { restakerCount, totalRestaked },
      })
    }
  }
}
