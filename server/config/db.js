import { PrismaClient }  from '@prisma/client'

// Add Prisma to Node.js global object to prevent multiple instances
// (useful during development when files get hot-reloaded)
if (process.env.NODE_ENV === 'development') {
  global.prisma = global.prisma || new PrismaClient()
}

const prisma = global.prisma || new PrismaClient()

// Optional: Add middleware for logging queries
prisma.$use(async (params, next) => {
  const before = Date.now()
  const result = await next(params)
  const after = Date.now()
  console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)
  return result
})

// Handle clean shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma
