import { PrismaClient } from '../dist/generated/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient();

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
