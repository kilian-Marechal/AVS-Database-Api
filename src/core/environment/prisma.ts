import { PrismaClient } from '@prisma/client'

if (process.env.DATABASE_URL === undefined) throw new Error()

export const prisma = new PrismaClient()
