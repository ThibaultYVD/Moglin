import { PrismaClient } from './generated/prisma/index.js';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error','warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export type Db = PrismaClient; // remplacé en transaction par Prisma.TransactionClient (voir UoW)
