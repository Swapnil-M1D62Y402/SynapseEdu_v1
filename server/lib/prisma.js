import { PrismaClient } from '@prisma/client';

let prisma;

// In development, use a global variable so Prisma isn't re-instantiated on every hot reload
if (process.env.NODE_ENV === 'development') {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
} else {
  // In production, always create a new PrismaClient
  prisma = new PrismaClient();
}

// Optional: query logging middleware
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
  return result;
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;