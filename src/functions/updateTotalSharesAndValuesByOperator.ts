import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { prisma } from '../core/environment/prisma'
import { computeStrategyValuesForOperators } from '../core/utils/computeStrategyValuesForOperators'
import { computeTotalSharesByOperatorForBlock } from '../core/utils/computeTotalSharesByOperator'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const chainId = 1 // Our graphs are on mainnet only atm

    // Fetch sharesIncreased and sharesDecreased from Prisma
    const sharesIncreased = await prisma.operatorSharesIncreased.findMany({
      include: {
        operator: {
          select: {
            address: true,
          },
        },
        strategy: {
          select: {
            address: true,
          },
        },
      },
    })
    const sharesDecreased = await prisma.operatorSharesDecreased.findMany({
      include: {
        operator: {
          select: {
            address: true,
          },
        },
        strategy: {
          select: {
            address: true,
          },
        },
      },
    })

    // Get total current tokens (shares)
    const tokensByOperator = computeTotalSharesByOperatorForBlock(
      sharesIncreased,
      sharesDecreased,
      undefined, // Add block number later if needed
    )

    // Get USD values
    const operatorStrategyValuesMap = await computeStrategyValuesForOperators(tokensByOperator, chainId)

    // Update Prisma with the computed values
    const updates = []

    for (const [operator, strategyMap] of operatorStrategyValuesMap) {
      for (const [strategy, { usdValue }] of strategyMap) {
        const tokenAmount = tokensByOperator.get(operator)?.get(strategy) ?? 0
        const operatorRecord = await prisma.operator.findUnique({ where: { address: operator } })
        const strategyRecord = await prisma.strategy.findUnique({ where: { address: strategy } })

        if (operatorRecord && strategyRecord) {
          updates.push(
            prisma.operatorStrategy.upsert({
              where: {
                operatorId_strategyId: {
                  operatorId: operatorRecord.id,
                  strategyId: strategyRecord.id,
                },
              },
              update: {
                tokenAmount: tokenAmount,
                usdValue: usdValue,
              },
              create: {
                operatorId: operatorRecord.id,
                strategyId: strategyRecord.id,
                tokenAmount: tokenAmount,
                usdValue: usdValue,
              },
            }),
          )
        }
      }
    }

    // Apply updates
    await Promise.all(updates)

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Values computed and updated successfully' }),
    }
  } catch (error) {
    console.error('Error computing and updating values:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    }
  } finally {
    await prisma.$disconnect()
  }
}
