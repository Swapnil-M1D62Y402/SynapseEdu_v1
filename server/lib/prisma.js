import { PrismaClient } from '@prisma/client'

// Avoid multiple instances in dev
if (!global.prisma) {
  global.prisma = new PrismaClient()
}

const prisma = global.prisma

// Add logging
prisma.$on('query', (e) => {
  console.log(`Query: ${e.query}`)
  console.log(`Params: ${e.params}`)
  console.log(`Duration: ${e.duration}ms`)
})

// Handle clean shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma